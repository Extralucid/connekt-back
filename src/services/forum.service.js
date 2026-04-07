import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';

class ForumService {
  // ==================== FORUM MANAGEMENT ====================
  
  static async createForum(forumData) {
    let slug = forumData.slug;
    if (!slug) {
      slug = forumData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Ensure unique slug
      let existingForum = await prisma.forum.findUnique({ where: { slug } });
      let counter = 1;
      while (existingForum) {
        slug = `${forumData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
        existingForum = await prisma.forum.findUnique({ where: { slug } });
        counter++;
      }
    }
    
    const forum = await prisma.forum.create({
      data: {
        forum_id: uuidv4(),
        name: forumData.name,
        slug,
        description: forumData.description,
        parentForumId: forumData.parentForumId,
        displayOrder: forumData.displayOrder || 0,
      },
    });
    
    await redis.del('forums:all');
    await redis.del(`forum:${forum.forum_id}`);
    
    return forum;
  }
  
  static async getAllForums(includeStats = true, includeSubForums = true) {
    const cacheKey = `forums:all:${includeStats}:${includeSubForums}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const forums = await prisma.forum.findMany({
      where: { isDeleted: false },
      orderBy: { displayOrder: 'asc' },
      include: {
        ...(includeSubForums && {
          childForums: {
            where: { isDeleted: false },
            orderBy: { displayOrder: 'asc' },
          },
        }),
        ...(includeStats && {
          _count: {
            select: {
              topics: {
                where: { status: { not: 'ARCHIVED' } },
              },
            },
          },
        }),
      },
    });
    
    // Add topic and reply counts for each forum
    if (includeStats) {
      for (const forum of forums) {
        const topics = await prisma.topic.aggregate({
          where: { forumId: forum.forum_id, status: { not: 'ARCHIVED' } },
          _count: true,
        });
        
        const replies = await prisma.reply.aggregate({
          where: {
            topic: {
              forumId: forum.forum_id,
              status: { not: 'ARCHIVED' },
            },
          },
          _count: true,
        });
        
        forum.topicCount = topics._count;
        forum.replyCount = replies._count;
        
        // Get last reply info
        const lastReply = await prisma.reply.findFirst({
          where: {
            topic: {
              forumId: forum.forum_id,
              status: { not: 'ARCHIVED' },
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
            topic: {
              select: {
                topic_id: true,
                title: true,
                slug: true,
              },
            },
          },
        });
        
        forum.lastReply = lastReply;
      }
    }
    
    await redis.setex(cacheKey, 3600, JSON.stringify(forums));
    
    return forums;
  }
  
  static async getForumById(forumId, includeStats = true) {
    const cacheKey = `forum:${forumId}:${includeStats}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const forum = await prisma.forum.findUnique({
      where: { forum_id: forumId, isDeleted: false },
      include: {
        parentForum: {
          select: {
            forum_id: true,
            name: true,
            slug: true,
          },
        },
        childForums: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: {
              select: {
                topics: {
                  where: { status: { not: 'ARCHIVED' } },
                },
              },
            },
          },
        },
      },
    });
    
    if (!forum) return null;
    
    if (includeStats) {
      const topics = await prisma.topic.aggregate({
        where: { forumId: forum.forum_id, status: { not: 'ARCHIVED' } },
        _count: true,
      });
      
      const replies = await prisma.reply.aggregate({
        where: {
          topic: {
            forumId: forum.forum_id,
            status: { not: 'ARCHIVED' },
          },
        },
        _count: true,
      });
      
      forum.topicCount = topics._count;
      forum.replyCount = replies._count;
      
      // Get recent topics
      const recentTopics = await prisma.topic.findMany({
        where: { forumId: forum.forum_id, status: { not: 'ARCHIVED' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      });
      
      forum.recentTopics = recentTopics;
    }
    
    await redis.setex(cacheKey, 300, JSON.stringify(forum));
    
    return forum;
  }
  
  static async updateForum(forumId, updateData) {
    const forum = await prisma.forum.update({
      where: { forum_id: forumId },
      data: {
        ...updateData,
        updatedAt: new Date(),
        ...(updateData.name && !updateData.slug && {
          slug: updateData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }),
      },
    });
    
    // Clear cache
    await redis.del('forums:all:*');
    await redis.del(`forum:${forumId}:*`);
    
    return forum;
  }
  
  static async deleteForum(forumId) {
    // Check if forum has topics
    const topicCount = await prisma.topic.count({
      where: { forumId },
    });
    
    if (topicCount > 0) {
      throw new Error('Cannot delete forum with existing topics. Archive or move topics first.');
    }
    
    await prisma.forum.update({
      where: { forum_id: forumId },
      data: { isDeleted: true },
    });
    
    // Clear cache
    await redis.del('forums:all:*');
    await redis.del(`forum:${forumId}:*`);
    
    return true;
  }
  
  // ==================== TOPIC MANAGEMENT ====================
  
  static async createTopic(forumId, authorId, topicData) {
    // Check if forum exists and is not deleted
    const forum = await prisma.forum.findUnique({
      where: { forum_id: forumId, isDeleted: false },
    });
    
    if (!forum) {
      throw new Error('Forum not found');
    }
    
    // Generate slug
    let slug = topicData.slug;
    if (!slug) {
      slug = topicData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Ensure unique slug
      let existingTopic = await prisma.topic.findUnique({ where: { slug } });
      let counter = 1;
      while (existingTopic) {
        slug = `${topicData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
        existingTopic = await prisma.topic.findUnique({ where: { slug } });
        counter++;
      }
    }
    
    const topic = await prisma.topic.create({
      data: {
        topic_id: uuidv4(),
        forumId,
        authorId,
        title: topicData.title,
        slug,
        content: topicData.content,
        status: topicData.status || 'OPEN',
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
      },
    });
    
    // Award points for creating a topic
    await this.awardPoints(authorId, 'create_topic');
    
    // Clear cache
    await redis.del(`forum:${forumId}:*`);
    await redis.del('forums:all:*');
    
    return topic;
  }
  
  static async getTopicById(topicId, incrementView = true) {
    const cacheKey = `topic:${topicId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached && !incrementView) {
      return JSON.parse(cached);
    }
    
    const topic = await prisma.topic.findUnique({
      where: { topic_id: topicId },
      include: {
        forum: {
          select: {
            forum_id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
            bio: true,
            joinedAt: true,
            userPoints: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
                username: true,
                userPoints: true,
              },
            },
            votes: true,
            _count: {
              select: { votes: true },
            },
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    });
    
    if (!topic) return null;
    
    // Increment view count
    if (incrementView) {
      await prisma.topic.update({
        where: { topic_id: topicId },
        data: { view_count: { increment: 1 } },
      });
      topic.view_count += 1;
      
      // Track view
      await prisma.contentView.create({
        data: {
          contentId: topicId,
          contentType: 'TOPIC',
        },
      });
    }
    
    // Calculate vote counts for each reply
    for (const reply of topic.replies) {
      reply.upvotes = reply.votes.filter(v => v.type === 'UPVOTE').length;
      reply.downvotes = reply.votes.filter(v => v.type === 'DOWNVOTE').length;
      reply.score = reply.upvotes - reply.downvotes;
      delete reply.votes;
    }
    
    await redis.setex(cacheKey, 300, JSON.stringify(topic));
    
    return topic;
  }
  
  static async getTopicBySlug(slug, incrementView = true) {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        forum: {
          select: {
            forum_id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
            bio: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
                username: true,
              },
            },
            votes: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    });
    
    if (!topic) return null;
    
    if (incrementView) {
      await prisma.topic.update({
        where: { slug },
        data: { view_count: { increment: 1 } },
      });
      topic.view_count += 1;
    }
    
    return topic;
  }
  
  static async updateTopic(topicId, userId, updateData) {
    const topic = await prisma.topic.findUnique({
      where: { topic_id: topicId },
      select: { authorId: true, forumId: true },
    });
    
    if (!topic) throw new Error('Topic not found');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    
    const isAdmin = user.userRoles.some(ur => 
      ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(ur.role.name)
    );
    
    if (topic.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this topic');
    }
    
    const updatedTopic = await prisma.topic.update({
      where: { topic_id: topicId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    // Clear cache
    await redis.del(`topic:${topicId}`);
    await redis.del(`forum:${topic.forumId}:*`);
    
    return updatedTopic;
  }
  
  static async deleteTopic(topicId, userId, permanent = false) {
    const topic = await prisma.topic.findUnique({
      where: { topic_id: topicId },
      select: { authorId: true, forumId: true, slug: true },
    });
    
    if (!topic) throw new Error('Topic not found');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    
    const isAdmin = user.userRoles.some(ur => 
      ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(ur.role.name)
    );
    
    if (topic.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this topic');
    }
    
    if (permanent) {
      await prisma.topic.delete({ where: { topic_id: topicId } });
    } else {
      await prisma.topic.update({
        where: { topic_id: topicId },
        data: { status: 'ARCHIVED' },
      });
    }
    
    // Clear cache
    await redis.del(`topic:${topicId}`);
    await redis.del(`topic:${topic.slug}`);
    await redis.del(`forum:${topic.forumId}:*`);
    
    return true;
  }
  
  static async getTopicsByForum(forumId, filters, pagination) {
    const {
      search,
      status,
      authorId,
      sortBy = 'lastReplyAt',
      sortOrder = 'desc',
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = { forumId };
    
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: sortBy === 'lastReplyAt' ? 'desc' : undefined },
          { [sortBy === 'lastReplyAt' ? 'updatedAt' : sortBy]: sortOrder },
        ],
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
              username: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      prisma.topic.count({ where }),
    ]);
    
    // Get last reply for each topic
    for (const topic of topics) {
      const lastReply = await prisma.reply.findFirst({
        where: { topicId: topic.topic_id },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
        },
      });
      
      topic.lastReply = lastReply;
    }
    
    return {
      topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  static async pinTopic(topicId, pin) {
    const topic = await prisma.topic.update({
      where: { topic_id: topicId },
      data: {
        status: pin ? 'PINNED' : 'OPEN',
        updatedAt: new Date(),
      },
    });
    
    await redis.del(`topic:${topicId}`);
    await redis.del(`forum:${topic.forumId}:*`);
    
    return topic;
  }
  
  static async closeTopic(topicId, close) {
    const topic = await prisma.topic.update({
      where: { topic_id: topicId },
      data: {
        status: close ? 'CLOSED' : 'OPEN',
        updatedAt: new Date(),
      },
    });
    
    await redis.del(`topic:${topicId}`);
    await redis.del(`forum:${topic.forumId}:*`);
    
    return topic;
  }
  
  // ==================== REPLY MANAGEMENT ====================
  
  static async addReply(topicId, userId, content, isAcceptedAnswer = false) {
    const topic = await prisma.topic.findUnique({
      where: { topic_id: topicId },
      select: { status: true, authorId: true, title: true, forumId: true },
    });
    
    if (!topic) throw new Error('Topic not found');
    if (topic.status === 'CLOSED') throw new Error('Topic is closed. Cannot add replies.');
    if (topic.status === 'ARCHIVED') throw new Error('Topic is archived.');
    
    const reply = await prisma.reply.create({
      data: {
        reply_id: uuidv4(),
        topicId,
        authorId: userId,
        content,
        isAcceptedAnswer,
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
      },
    });
    
    // Update topic's updatedAt to show recent activity
    await prisma.topic.update({
      where: { topic_id: topicId },
      data: { updatedAt: new Date() },
    });
    
    // Award points for reply
    await this.awardPoints(userId, 'create_reply');
    
    // Create notification for topic author
    if (topic.authorId !== userId) {
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId: topic.authorId,
          type: 'CONTENT_COMMENT',
          title: 'New Reply to Your Topic',
          message: `${reply.author.display_name} replied to "${topic.title}"`,
          contentId: topicId,
          contentType: 'TOPIC',
          data: {
            replyId: reply.reply_id,
            topicId,
          },
        },
      });
    }
    
    // Clear cache
    await redis.del(`topic:${topicId}`);
    await redis.del(`forum:${topic.forumId}:*`);
    
    return reply;
  }
  
  static async getReplies(topicId, pagination) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * limit;
    
    const [replies, total] = await Promise.all([
      prisma.reply.findMany({
        where: { topicId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
              username: true,
              userPoints: true,
            },
          },
          votes: true,
          _count: {
            select: { votes: true },
          },
        },
      }),
      prisma.reply.count({ where: { topicId, isDeleted: false } }),
    ]);
    
    // Calculate vote scores
    for (const reply of replies) {
      reply.upvotes = reply.votes.filter(v => v.type === 'UPVOTE').length;
      reply.downvotes = reply.votes.filter(v => v.type === 'DOWNVOTE').length;
      reply.score = reply.upvotes - reply.downvotes;
      delete reply.votes;
    }
    
    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  static async updateReply(replyId, userId, content) {
    const reply = await prisma.reply.findUnique({
      where: { reply_id: replyId },
      select: { authorId: true, topicId: true },
    });
    
    if (!reply) throw new Error('Reply not found');
    if (reply.authorId !== userId) throw new Error('Unauthorized to update this reply');
    
    const updatedReply = await prisma.reply.update({
      where: { reply_id: replyId },
      data: {
        content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    await redis.del(`topic:${reply.topicId}`);
    
    return updatedReply;
  }
  
  static async deleteReply(replyId, userId, isAdmin = false) {
    const reply = await prisma.reply.findUnique({
      where: { reply_id: replyId },
      select: { authorId: true, topicId: true },
    });
    
    if (!reply) throw new Error('Reply not found');
    if (reply.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this reply');
    }
    
    await prisma.reply.update({
      where: { reply_id: replyId },
      data: { isDeleted: true },
    });
    
    await redis.del(`topic:${reply.topicId}`);
    
    return true;
  }
  
  // ==================== VOTE SYSTEM ====================
  
  static async voteOnReply(replyId, userId, voteType) {
    const reply = await prisma.reply.findUnique({
      where: { reply_id: replyId },
      select: { authorId: true, topicId: true },
    });
    
    if (!reply) throw new Error('Reply not found');
    if (reply.authorId === userId) {
      throw new Error('Cannot vote on your own reply');
    }
    
    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        replyId_userId: {
          replyId,
          userId,
        },
      },
    });
    
    let vote;
    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote if same type (toggle off)
        await prisma.vote.delete({
          where: { vote_id: existingVote.vote_id },
        });
        vote = { removed: true };
      } else {
        // Update vote
        vote = await prisma.vote.update({
          where: { vote_id: existingVote.vote_id },
          data: { type: voteType, updatedAt: new Date() },
        });
      }
    } else {
      // Create new vote
      vote = await prisma.vote.create({
        data: {
          vote_id: uuidv4(),
          replyId,
          userId,
          type: voteType,
        },
      });
    }
    
    // Award points for receiving votes
    if (voteType === 'UPVOTE') {
      await this.awardPoints(reply.authorId, 'receive_upvote');
    }
    
    await redis.del(`topic:${reply.topicId}`);
    
    return vote;
  }
  
  static async acceptAnswer(replyId, userId, accept) {
    const reply = await prisma.reply.findUnique({
      where: { reply_id: replyId },
      include: {
        topic: {
          select: { authorId: true, topic_id: true },
        },
      },
    });
    
    if (!reply) throw new Error('Reply not found');
    if (reply.topic.authorId !== userId) {
      throw new Error('Only the topic author can accept answers');
    }
    
    // Remove previous accepted answer if any
    if (accept) {
      await prisma.reply.updateMany({
        where: { topicId: reply.topicId, isAcceptedAnswer: true },
        data: { isAcceptedAnswer: false },
      });
    }
    
    const updatedReply = await prisma.reply.update({
      where: { reply_id: replyId },
      data: { isAcceptedAnswer: accept },
    });
    
    // Award points for accepted answer
    if (accept) {
      await this.awardPoints(reply.authorId, 'accepted_answer');
      
      // Create notification
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId: reply.authorId,
          type: 'ACHIEVEMENT_EARNED',
          title: 'Your Answer Was Accepted!',
          message: `Your reply was marked as the accepted answer`,
          data: {
            replyId,
            topicId: reply.topicId,
          },
        },
      });
    }
    
    await redis.del(`topic:${reply.topicId}`);
    
    return updatedReply;
  }
  
  // ==================== STATS & POINTS ====================
  
  static async getForumStats(forumId, period = 'month') {
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        dateFilter = {};
    }
    
    const [totalTopics, totalReplies, totalViews, activeUsers, topContributors] = await Promise.all([
      prisma.topic.count({
        where: {
          forumId,
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.reply.count({
        where: {
          topic: { forumId },
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.topic.aggregate({
        where: {
          forumId,
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
        _sum: { view_count: true },
      }),
      prisma.reply.groupBy({
        by: ['authorId'],
        where: {
          topic: { forumId },
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
        _count: { authorId: true },
      }),
      prisma.reply.groupBy({
        by: ['authorId'],
        where: {
          topic: { forumId },
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
        _count: { authorId: true },
        orderBy: { _count: { authorId: 'desc' } },
        take: 10,
      }),
    ]);
    
    // Get user details for top contributors
    const contributorDetails = await Promise.all(
      topContributors.map(async (contributor) => {
        const user = await prisma.user.findUnique({
          where: { id: contributor.authorId },
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        });
        return {
          ...user,
          replyCount: contributor._count.authorId,
        };
      })
    );
    
    return {
      period,
      totalTopics,
      totalReplies,
      totalViews: totalViews._sum.view_count || 0,
      activeUsers: activeUsers.length,
      topContributors: contributorDetails,
      engagement: {
        repliesPerTopic: totalTopics > 0 ? (totalReplies / totalTopics).toFixed(2) : 0,
        viewsPerTopic: totalTopics > 0 ? ((totalViews._sum.view_count || 0) / totalTopics).toFixed(2) : 0,
      },
    };
  }
  
  static async awardPoints(userId, action) {
    const pointsMap = {
      'create_topic': 10,
      'create_reply': 5,
      'receive_upvote': 2,
      'accepted_answer': 25,
    };
    
    const points = pointsMap[action];
    if (!points) return;
    
    const userPoints = await prisma.userPoints.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points },
        experiencePoints: { increment: points },
      },
      create: {
        userId,
        totalPoints: points,
        experiencePoints: points,
        level: 1,
      },
    });
    
    // Check level up (every 100 points)
    const newLevel = Math.floor(userPoints.totalPoints / 100) + 1;
    if (newLevel > userPoints.level) {
      await prisma.userPoints.update({
        where: { userId },
        data: { level: newLevel },
      });
      
      // Create level up notification
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId,
          type: 'ACHIEVEMENT_EARNED',
          title: 'Level Up! 🎉',
          message: `Congratulations! You've reached level ${newLevel}`,
        },
      });
    }
    
    return userPoints;
  }
}

export default ForumService;