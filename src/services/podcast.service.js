import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';

class PodcastService {
  // ==================== PODCAST CRUD OPERATIONS ====================
  
  static async createPodcast(authorId, podcastData) {
    const podcast = await prisma.podcast.create({
      data: {
        podcast_id: uuidv4(),
        authorId,
        title: podcastData.title,
        description: podcastData.description,
        coverImage: podcastData.coverImage,
        isExplicit: podcastData.isExplicit || false,
        language: podcastData.language || 'en',
        categories: podcastData.categories || [],
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
    
    await redis.del('podcasts:list:*');
    
    return podcast;
  }
  
  static async getPodcastById(podcastId) {
    const cacheKey = `podcast:${podcastId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const podcast = await prisma.podcast.findUnique({
      where: { podcast_id: podcastId, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
            bio: true,
          },
        },
        episodes: {
          where: { isDeleted: false },
          orderBy: { publishDate: 'desc' },
          take: 5,
          select: {
            episode_id: true,
            title: true,
            description: true,
            duration: true,
            publishDate: true,
            _count: {
              select: { listens: true, comments: true },
            },
          },
        },
        subscribers: {
          select: { userId: true },
        },
        _count: {
          select: { episodes: true, subscribers: true },
        },
      },
    });
    
    if (!podcast) return null;
    
    podcast.subscriberCount = podcast._count.subscribers;
    podcast.episodeCount = podcast._count.episodes;
    
    await redis.setex(cacheKey, 300, JSON.stringify(podcast));
    
    return podcast;
  }
  
  static async getPodcastBySlug(slug) {
    // If slug is not stored, we'll use title as identifier
    const podcast = await prisma.podcast.findFirst({
      where: {
        title: {
          equals: slug.replace(/-/g, ' '),
          mode: 'insensitive',
        },
        isDeleted: false,
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
        episodes: {
          where: { isDeleted: false },
          orderBy: { publishDate: 'desc' },
          take: 5,
        },
        _count: {
          select: { episodes: true, subscribers: true },
        },
      },
    });
    
    return podcast;
  }
  
  static async updatePodcast(podcastId, authorId, updateData) {
    const podcast = await prisma.podcast.findUnique({
      where: { podcast_id: podcastId },
      select: { authorId: true },
    });
    
    if (!podcast) throw new Error('Podcast not found');
    if (podcast.authorId !== authorId) {
      throw new Error('Unauthorized to update this podcast');
    }
    
    const updatedPodcast = await prisma.podcast.update({
      where: { podcast_id: podcastId },
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
    
    await redis.del(`podcast:${podcastId}`);
    await redis.del('podcasts:list:*');
    
    return updatedPodcast;
  }
  
  static async deletePodcast(podcastId, authorId, isAdmin = false) {
    const podcast = await prisma.podcast.findUnique({
      where: { podcast_id: podcastId },
      select: { authorId: true },
    });
    
    if (!podcast) throw new Error('Podcast not found');
    if (podcast.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized to delete this podcast');
    }
    
    await prisma.podcast.update({
      where: { podcast_id: podcastId },
      data: { isDeleted: true },
    });
    
    await redis.del(`podcast:${podcastId}`);
    await redis.del('podcasts:list:*');
    
    return true;
  }
  
  static async getAllPodcasts(filters, pagination) {
    const {
      search,
      category,
      language,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = { isDeleted: false };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (category) {
      where.categories = { has: category };
    }
    
    if (language) {
      where.language = language;
    }
    
    const cacheKey = `podcasts:list:${JSON.stringify({ where, skip, limit, sortBy, sortOrder })}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
          _count: {
            select: { episodes: true, subscribers: true },
          },
        },
      }),
      prisma.podcast.count({ where }),
    ]);
    
    const result = {
      podcasts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 120, JSON.stringify(result));
    
    return result;
  }
  
  static async getMyPodcasts(authorId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
        where: { authorId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { episodes: true, subscribers: true },
          },
        },
      }),
      prisma.podcast.count({ where: { authorId, isDeleted: false } }),
    ]);
    
    return {
      podcasts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  // ==================== EPISODE MANAGEMENT ====================
  
  static async createEpisode(podcastId, authorId, episodeData) {
    // Verify ownership
    const podcast = await prisma.podcast.findUnique({
      where: { podcast_id: podcastId },
      select: { authorId: true },
    });
    
    if (!podcast) throw new Error('Podcast not found');
    if (podcast.authorId !== authorId) {
      throw new Error('Unauthorized to add episodes to this podcast');
    }
    
    const episode = await prisma.episode.create({
      data: {
        episode_id: uuidv4(),
        podcastId,
        title: episodeData.title,
        description: episodeData.description,
        audioUrl: episodeData.audioUrl,
        duration: episodeData.duration,
        publishDate: episodeData.publishDate ? new Date(episodeData.publishDate) : new Date(),
      },
      include: {
        podcast: {
          select: {
            podcast_id: true,
            title: true,
            authorId: true,
          },
        },
      },
    });
    
    // Add transcript if provided
    if (episodeData.transcript) {
      await prisma.transcript.create({
        data: {
          transcript_id: uuidv4(),
          episodeId: episode.episode_id,
          content: episodeData.transcript,
          language: episodeData.language || 'en',
        },
      });
    }
    
    // Update podcast episode count
    await prisma.podcast.update({
      where: { podcast_id: podcastId },
      data: { totalEpisodes: { increment: 1 } },
    });
    
    await redis.del(`podcast:${podcastId}`);
    await redis.del(`podcast:${podcastId}:episodes:*`);
    
    return episode;
  }
  
  static async getEpisodeById(episodeId, incrementListen = false) {
    const cacheKey = `episode:${episodeId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached && !incrementListen) {
      return JSON.parse(cached);
    }
    
    const episode = await prisma.episode.findUnique({
      where: { episode_id: episodeId, isDeleted: false },
      include: {
        podcast: {
          select: {
            podcast_id: true,
            title: true,
            coverImage: true,
            author: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
          },
        },
        transcript: true,
        listens: {
          orderBy: { listenedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { listens: true, comments: true },
        },
      },
    });
    
    if (!episode) return null;
    
    if (incrementListen) {
      await prisma.listen.create({
        data: {
          listen_id: uuidv4(),
          episodeId,
        },
      });
      
      await prisma.podcast.update({
        where: { podcast_id: episode.podcastId },
        data: { totalListens: { increment: 1 } },
      });
      
      episode._count.listens += 1;
    }
    
    await redis.setex(cacheKey, 300, JSON.stringify(episode));
    
    return episode;
  }
  
  static async getEpisodesByPodcast(podcastId, pagination) {
    const { page = 1, limit = 20, sortBy = 'publishDate', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `podcast:${podcastId}:episodes:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [episodes, total] = await Promise.all([
      prisma.episode.findMany({
        where: { podcastId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { listens: true, comments: true },
          },
        },
      }),
      prisma.episode.count({ where: { podcastId, isDeleted: false } }),
    ]);
    
    const result = {
      episodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async updateEpisode(episodeId, authorId, updateData) {
    const episode = await prisma.episode.findUnique({
      where: { episode_id: episodeId },
      include: {
        podcast: {
          select: { authorId: true },
        },
      },
    });
    
    if (!episode) throw new Error('Episode not found');
    if (episode.podcast.authorId !== authorId) {
      throw new Error('Unauthorized to update this episode');
    }
    
    const updatedEpisode = await prisma.episode.update({
      where: { episode_id: episodeId },
      data: {
        ...updateData,
        ...(updateData.publishDate && { publishDate: new Date(updateData.publishDate) }),
        updatedAt: new Date(),
      },
    });
    
    await redis.del(`episode:${episodeId}`);
    await redis.del(`podcast:${episode.podcastId}:episodes:*`);
    
    return updatedEpisode;
  }
  
  static async deleteEpisode(episodeId, authorId, isAdmin = false) {
    const episode = await prisma.episode.findUnique({
      where: { episode_id: episodeId },
      include: {
        podcast: {
          select: { authorId: true, podcast_id: true },
        },
      },
    });
    
    if (!episode) throw new Error('Episode not found');
    if (episode.podcast.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized to delete this episode');
    }
    
    await prisma.episode.update({
      where: { episode_id: episodeId },
      data: { isDeleted: true },
    });
    
    await prisma.podcast.update({
      where: { podcast_id: episode.podcast.podcast_id },
      data: { totalEpisodes: { decrement: 1 } },
    });
    
    await redis.del(`episode:${episodeId}`);
    await redis.del(`podcast:${episode.podcast.podcast_id}:episodes:*`);
    await redis.del(`podcast:${episode.podcast.podcast_id}`);
    
    return true;
  }
  
  // ==================== LISTEN TRACKING ====================
  
  static async trackListen(episodeId, userId, progress = null, completed = false) {
    const listen = await prisma.listen.create({
      data: {
        listen_id: uuidv4(),
        episodeId,
        userId,
        progress: progress || 0,
        completed,
        listenedAt: new Date(),
      },
    });
    
    // Award points for listening
    if (completed) {
      await this.awardPoints(userId, 'complete_episode');
    }
    
    await redis.del(`episode:${episodeId}`);
    
    return listen;
  }
  
  static async getListenStats(episodeId, period = 'month') {
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
    
    const [totalListens, uniqueListeners, completions, listeningTime] = await Promise.all([
      prisma.listen.count({
        where: {
          episodeId,
          ...(period !== 'all' && { listenedAt: dateFilter }),
        },
      }),
      prisma.listen.groupBy({
        by: ['userId'],
        where: {
          episodeId,
          userId: { not: null },
          ...(period !== 'all' && { listenedAt: dateFilter }),
        },
      }),
      prisma.listen.count({
        where: {
          episodeId,
          completed: true,
          ...(period !== 'all' && { listenedAt: dateFilter }),
        },
      }),
      prisma.listen.aggregate({
        where: {
          episodeId,
          ...(period !== 'all' && { listenedAt: dateFilter }),
        },
        _avg: { progress: true },
      }),
    ]);
    
    return {
      period,
      totalListens,
      uniqueListeners: uniqueListeners.length,
      completions,
      completionRate: totalListens > 0 ? ((completions / totalListens) * 100).toFixed(2) : 0,
      averageProgress: listeningTime._avg.progress || 0,
    };
  }
  
  // ==================== SUBSCRIPTION MANAGEMENT ====================
  
  static async subscribeToPodcast(podcastId, userId) {
    const existingSubscription = await prisma.podcastSubscription.findUnique({
      where: {
        userId_podcastId: {
          userId,
          podcastId,
        },
      },
    });
    
    if (existingSubscription) {
      await prisma.podcastSubscription.delete({
        where: { podsub_id: existingSubscription.podsub_id },
      });
      return { subscribed: false, message: 'Unsubscribed from podcast' };
    }
    
    const subscription = await prisma.podcastSubscription.create({
      data: {
        podsub_id: uuidv4(),
        userId,
        podcastId,
      },
    });
    
    await redis.del(`podcast:${podcastId}`);
    await redis.del(`user:${userId}:subscriptions`);
    
    return { subscribed: true, message: 'Subscribed to podcast', subscription };
  }
  
  static async getUserSubscriptions(userId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `user:${userId}:subscriptions:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [subscriptions, total] = await Promise.all([
      prisma.podcastSubscription.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          podcast: {
            include: {
              author: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
              _count: {
                select: { episodes: true },
              },
            },
          },
        },
      }),
      prisma.podcastSubscription.count({ where: { userId } }),
    ]);
    
    const result = {
      subscriptions: subscriptions.map(s => ({
        ...s.podcast,
        subscribedAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async getPodcastSubscribers(podcastId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const [subscribers, total] = await Promise.all([
      prisma.podcastSubscription.findMany({
        where: { podcastId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
              username: true,
            },
          },
        },
      }),
      prisma.podcastSubscription.count({ where: { podcastId } }),
    ]);
    
    return {
      subscribers: subscribers.map(s => ({
        user: s.user,
        subscribedAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  // ==================== COMMENT MANAGEMENT ====================
  
  static async addComment(episodeId, userId, content, parentId = null) {
    const episode = await prisma.episode.findUnique({
      where: { episode_id: episodeId },
      select: { podcast: { select: { authorId: true, title: true } } },
    });
    
    if (!episode) throw new Error('Episode not found');
    
    const comment = await prisma.podcastComment.create({
      data: {
        podcom_id: uuidv4(),
        episodeId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
      },
    });
    
    // Notify podcast author
    if (episode.podcast.authorId !== userId) {
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId: episode.podcast.authorId,
          type: 'CONTENT_COMMENT',
          title: 'New Comment on Your Podcast',
          message: `${comment.user.display_name} commented on "${episode.podcast.title}"`,
          contentId: episodeId,
          contentType: 'PODCAST_EPISODE',
          data: {
            commentId: comment.podcom_id,
            episodeId,
          },
        },
      });
    }
    
    await redis.del(`episode:${episodeId}:comments:*`);
    
    return comment;
  }
  
  static async getComments(episodeId, pagination) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `episode:${episodeId}:comments:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [comments, total] = await Promise.all([
      prisma.podcastComment.findMany({
        where: { episodeId, parentId: null },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
              username: true,
            },
          },
          replies: {
            where: { parentId: { not: null } },
            take: 5,
            include: {
              user: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                  username: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      prisma.podcastComment.count({ where: { episodeId, parentId: null } }),
    ]);
    
    const result = {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async updateComment(commentId, userId, content) {
    const comment = await prisma.podcastComment.findUnique({
      where: { podcom_id: commentId },
      select: { userId: true, episodeId: true },
    });
    
    if (!comment) throw new Error('Comment not found');
    if (comment.userId !== userId) {
      throw new Error('Unauthorized to update this comment');
    }
    
    const updatedComment = await prisma.podcastComment.update({
      where: { podcom_id: commentId },
      data: {
        content,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    await redis.del(`episode:${comment.episodeId}:comments:*`);
    
    return updatedComment;
  }
  
  static async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await prisma.podcastComment.findUnique({
      where: { podcom_id: commentId },
      select: { userId: true, episodeId: true },
    });
    
    if (!comment) throw new Error('Comment not found');
    if (comment.userId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }
    
    await prisma.podcastComment.delete({
      where: { podcom_id: commentId },
    });
    
    await redis.del(`episode:${comment.episodeId}:comments:*`);
    
    return true;
  }
  
  // ==================== TRANSCRIPT MANAGEMENT ====================
  
  static async addTranscript(episodeId, authorId, transcriptData) {
    const episode = await prisma.episode.findUnique({
      where: { episode_id: episodeId },
      include: {
        podcast: {
          select: { authorId: true },
        },
      },
    });
    
    if (!episode) throw new Error('Episode not found');
    if (episode.podcast.authorId !== authorId) {
      throw new Error('Unauthorized to add transcript');
    }
    
    const transcript = await prisma.transcript.upsert({
      where: { episodeId },
      update: {
        content: transcriptData.content,
        language: transcriptData.language,
        updatedAt: new Date(),
      },
      create: {
        transcript_id: uuidv4(),
        episodeId,
        content: transcriptData.content,
        language: transcriptData.language || 'en',
      },
    });
    
    await redis.del(`episode:${episodeId}`);
    
    return transcript;
  }
  
  static async getTranscript(episodeId) {
    const transcript = await prisma.transcript.findUnique({
      where: { episodeId },
    });
    
    return transcript;
  }
  
  // ==================== STATISTICS ====================
  
  static async getPodcastStats(podcastId, period = 'month') {
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
    
    const episodes = await prisma.episode.findMany({
      where: { podcastId, isDeleted: false },
      select: {
        episode_id: true,
        title: true,
        publishDate: true,
        _count: {
          select: { listens: true, comments: true },
        },
      },
    });
    
    const totalListens = episodes.reduce((sum, e) => sum + e._count.listens, 0);
    const totalComments = episodes.reduce((sum, e) => sum + e._count.comments, 0);
    
    const recentListens = await prisma.listen.count({
      where: {
        episode: { podcastId },
        listenedAt: dateFilter,
      },
    });
    
    const topEpisodes = [...episodes]
      .sort((a, b) => b._count.listens - a._count.listens)
      .slice(0, 5);
    
    return {
      period,
      totalEpisodes: episodes.length,
      totalListens,
      totalComments,
      recentListens,
      averageListensPerEpisode: episodes.length > 0 ? (totalListens / episodes.length).toFixed(2) : 0,
      topEpisodes: topEpisodes.map(e => ({
        title: e.title,
        listens: e._count.listens,
        publishDate: e.publishDate,
      })),
    };
  }
  
  // ==================== POINTS SYSTEM ====================
  
  static async awardPoints(userId, action) {
    const pointsMap = {
      'complete_episode': 15,
      'subscribe_podcast': 10,
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
    
    const newLevel = Math.floor(userPoints.totalPoints / 100) + 1;
    if (newLevel > userPoints.level) {
      await prisma.userPoints.update({
        where: { userId },
        data: { level: newLevel },
      });
      
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

export default PodcastService;