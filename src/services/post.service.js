import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';

class PostService {
  // ==================== POST CRUD OPERATIONS ====================
  
  static async createPost(authorId, postData) {
    const { categoryIds, tagIds, ...data } = postData;
    
    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Ensure unique slug
      let existingPost = await prisma.post.findUnique({ where: { slug } });
      let counter = 1;
      while (existingPost) {
        slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
        existingPost = await prisma.post.findUnique({ where: { slug } });
        counter++;
      }
    }
    
    const post = await prisma.post.create({
      data: {
        post_id: uuidv4(),
        authorId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || data.content.substring(0, 200),
        status: data.status || 'DRAFT',
        published_date: data.status === 'PUBLISHED' ? new Date() : data.published_date,
        featured_image_url: data.featured_image_url,
        ...(categoryIds && categoryIds.length > 0 && {
          categories: {
            create: categoryIds.map(categoryId => ({
              category: { connect: { category_id: categoryId } }
            }))
          }
        }),
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            create: tagIds.map(tagId => ({
              tag: { connect: { tag_id: tagId } }
            }))
          }
        }),
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
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    // Clear cache
    await redis.del('posts:list:*');
    
    return post;
  }
  
  static async getPostById(postId, incrementView = true) {
    // Try cache first
    const cachedPost = await redis.get(`post:${postId}`);
    if (cachedPost && !incrementView) {
      return JSON.parse(cachedPost);
    }
    
    const post = await prisma.post.findUnique({
      where: { post_id: postId, isDeleted: false },
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
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        Comment: {
          where: { isApproved: true, isDeleted: false, parentCommentId: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
            childComments: {
              where: { isApproved: true, isDeleted: false },
              take: 5,
              include: {
                author: {
                  select: {
                    id: true,
                    display_name: true,
                    profile_picture_url: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { Comment: true },
        },
      },
    });
    
    if (!post) return null;
    
    // Increment view count
    if (incrementView) {
      await prisma.post.update({
        where: { post_id: postId },
        data: { view_count: { increment: 1 } },
      });
      post.view_count += 1;
      
      // Track view in analytics
      await prisma.contentView.create({
        data: {
          contentId: postId,
          contentType: 'POST',
        },
      });
    }
    
    // Cache for 5 minutes
    await redis.setex(`post:${postId}`, 300, JSON.stringify(post));
    
    return post;
  }
  
  static async getPostBySlug(slug, incrementView = true) {
    const post = await prisma.post.findUnique({
      where: { slug, isDeleted: false },
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
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        Comment: {
          where: { isApproved: true, isDeleted: false, parentCommentId: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
            childComments: {
              where: { isApproved: true, isDeleted: false },
              take: 5,
              include: {
                author: {
                  select: {
                    id: true,
                    display_name: true,
                    profile_picture_url: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { Comment: true },
        },
      },
    });
    
    if (!post) return null;
    
    if (incrementView) {
      await prisma.post.update({
        where: { slug },
        data: { view_count: { increment: 1 } },
      });
      post.view_count += 1;
    }
    
    return post;
  }
  
  static async updatePost(postId, userId, updateData) {
    // Check if user is author or admin
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
      select: { authorId: true },
    });
    
    if (!post) throw new Error('Post not found');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    
    const isAdmin = user.userRoles.some(ur => 
      ['ADMIN', 'SUPER_ADMIN'].includes(ur.role.name)
    );
    
    if (post.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this post');
    }
    
    const { categoryIds, tagIds, ...data } = updateData;
    
    const updatedPost = await prisma.post.update({
      where: { post_id: postId },
      data: {
        ...data,
        updatedAt: new Date(),
        ...(data.status === 'PUBLISHED' && !post.published_date && {
          published_date: new Date(),
        }),
        ...(categoryIds && {
          categories: {
            deleteMany: {},
            create: categoryIds.map(categoryId => ({
              category: { connect: { category_id: categoryId } }
            }))
          }
        }),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({
              tag: { connect: { tag_id: tagId } }
            }))
          }
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
    
    // Clear cache
    await redis.del(`post:${postId}`);
    await redis.del(`post:${post.slug}`);
    await redis.del('posts:list:*');
    
    return updatedPost;
  }
  
  static async deletePost(postId, userId, permanent = false) {
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
      select: { authorId: true, slug: true },
    });
    
    if (!post) throw new Error('Post not found');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    
    const isAdmin = user.userRoles.some(ur => 
      ['ADMIN', 'SUPER_ADMIN'].includes(ur.role.name)
    );
    
    if (post.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this post');
    }
    
    if (permanent) {
      await prisma.post.delete({ where: { post_id: postId } });
    } else {
      await prisma.post.update({
        where: { post_id: postId },
        data: { isDeleted: true, status: 'ARCHIVED' },
      });
    }
    
    // Clear cache
    await redis.del(`post:${postId}`);
    await redis.del(`post:${post.slug}`);
    await redis.del('posts:list:*');
    
    return true;
  }
  
  static async getAllPosts(filters, pagination, userId = null) {
    const {
      search,
      status,
      categoryId,
      tagId,
      authorId,
      dateFrom,
      dateTo,
      sortBy = 'published_date',
      sortOrder = 'desc',
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = { isDeleted: false };
    
    // Only show published posts to non-admins
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } },
      });
      const isAdmin = user?.userRoles.some(ur => 
        ['ADMIN', 'SUPER_ADMIN'].includes(ur.role.name)
      );
      
      if (!isAdmin) {
        where.status = 'PUBLISHED';
      } else if (status) {
        where.status = status;
      }
    } else {
      where.status = 'PUBLISHED';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (authorId) where.authorId = authorId;
    
    if (dateFrom || dateTo) {
      where.published_date = {};
      if (dateFrom) where.published_date.gte = new Date(dateFrom);
      if (dateTo) where.published_date.lte = new Date(dateTo);
    }
    
    if (categoryId) {
      where.categories = { some: { category_id: categoryId } };
    }
    
    if (tagId) {
      where.tags = { some: { tag_id: tagId } };
    }
    
    // Check cache for identical query
    const cacheKey = `posts:list:${JSON.stringify({ where, skip, limit, sortBy, sortOrder })}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
              username: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { Comment: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);
    
    const result = {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, JSON.stringify(result));
    
    return result;
  }
  
  static async getRelatedPosts(postId, limit = 5) {
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
      include: {
        categories: { select: { category_id: true } },
        tags: { select: { tag_id: true } },
      },
    });
    
    if (!post) return [];
    
    const categoryIds = post.categories.map(c => c.category_id);
    const tagIds = post.tags.map(t => t.tag_id);
    
    const relatedPosts = await prisma.post.findMany({
      where: {
        post_id: { not: postId },
        status: 'PUBLISHED',
        isDeleted: false,
        OR: [
          { categories: { some: { category_id: { in: categoryIds } } } },
          { tags: { some: { tag_id: { in: tagIds } } } },
        ],
      },
      orderBy: { published_date: 'desc' },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        _count: {
          select: { Comment: true },
        },
      },
    });
    
    return relatedPosts;
  }
  
  // ==================== CATEGORY MANAGEMENT ====================
  
  static async createCategory(categoryData) {
    let slug = categoryData.slug;
    if (!slug) {
      slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const category = await prisma.category.create({
      data: {
        category_id: uuidv4(),
        name: categoryData.name,
        slug,
        description: categoryData.description,
      },
    });
    
    await redis.del('categories:all');
    
    return category;
  }
  
  static async getAllCategories() {
    const cached = await redis.get('categories:all');
    if (cached) return JSON.parse(cached);
    
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await redis.setex('categories:all', 3600, JSON.stringify(categories));
    
    return categories;
  }
  
  static async updateCategory(categoryId, updateData) {
    const category = await prisma.category.update({
      where: { category_id: categoryId },
      data: {
        ...updateData,
        ...(updateData.name && !updateData.slug && {
          slug: updateData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }),
      },
    });
    
    await redis.del('categories:all');
    
    return category;
  }
  
  static async deleteCategory(categoryId) {
    // Check if category has posts
    const postCount = await prisma.postCategory.count({
      where: { categoryId },
    });
    
    if (postCount > 0) {
      throw new Error('Cannot delete category with associated posts');
    }
    
    await prisma.category.update({
      where: { category_id: categoryId },
      data: { isDeleted: true },
    });
    
    await redis.del('categories:all');
    
    return true;
  }
  
  // ==================== TAG MANAGEMENT ====================
  
  static async createTag(tagData) {
    let slug = tagData.slug;
    if (!slug) {
      slug = tagData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const tag = await prisma.tag.create({
      data: {
        tag_id: uuidv4(),
        name: tagData.name,
        slug,
        description: tagData.description,
      },
    });
    
    await redis.del('tags:all');
    
    return tag;
  }
  
  static async getAllTags() {
    const cached = await redis.get('tags:all');
    if (cached) return JSON.parse(cached);
    
    const tags = await prisma.tag.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { Posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await redis.setex('tags:all', 3600, JSON.stringify(tags));
    
    return tags;
  }
  
  static async updateTag(tagId, updateData) {
    const tag = await prisma.tag.update({
      where: { tag_id: tagId },
      data: {
        ...updateData,
        ...(updateData.name && !updateData.slug && {
          slug: updateData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }),
      },
    });
    
    await redis.del('tags:all');
    
    return tag;
  }
  
  static async deleteTag(tagId) {
    await prisma.tag.update({
      where: { tag_id: tagId },
      data: { isDeleted: true },
    });
    
    await redis.del('tags:all');
    
    return true;
  }
  
  // ==================== COMMENT MANAGEMENT ====================
  
  static async addComment(postId, userId, content, parentCommentId = null) {
    // Check if post exists and is published
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
      select: { status: true, authorId: true },
    });
    
    if (!post || post.status !== 'PUBLISHED') {
      throw new Error('Post not found or not published');
    }
    
    const comment = await prisma.comment.create({
      data: {
        comment_id: uuidv4(),
        content,
        authorId: userId,
        postId,
        targetId: postId,
        targetType: 'POST',
        parentCommentId,
        isApproved: true, // Auto-approve for now, can be set to false for moderation
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
    
    // Create notification for post author
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId: post.authorId,
          type: 'CONTENT_COMMENT',
          title: 'New Comment on Your Post',
          message: `${comment.author.display_name} commented on your post`,
          contentId: postId,
          contentType: 'POST',
          data: {
            commentId: comment.comment_id,
            postId,
          },
        },
      });
    }
    
    // Clear post cache
    await redis.del(`post:${postId}`);
    
    return comment;
  }
  
  static async getComments(postId, pagination) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId,
          isApproved: true,
          isDeleted: false,
          parentCommentId: null,
        },
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
          childComments: {
            where: { isApproved: true, isDeleted: false },
            take: 10,
            include: {
              author: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { childComments: true },
          },
        },
      }),
      prisma.comment.count({
        where: {
          postId,
          isApproved: true,
          isDeleted: false,
          parentCommentId: null,
        },
      }),
    ]);
    
    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  static async updateComment(commentId, userId, content) {
    const comment = await prisma.comment.findUnique({
      where: { comment_id: commentId },
      select: { authorId: true, postId: true },
    });
    
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId) throw new Error('Unauthorized to update this comment');
    
    const updatedComment = await prisma.comment.update({
      where: { comment_id: commentId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
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
    await redis.del(`post:${comment.postId}`);
    
    return updatedComment;
  }
  
  static async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await prisma.comment.findUnique({
      where: { comment_id: commentId },
      select: { authorId: true, postId: true },
    });
    
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }
    
    await prisma.comment.update({
      where: { comment_id: commentId },
      data: { isDeleted: true },
    });
    
    // Clear cache
    await redis.del(`post:${comment.postId}`);
    
    return true;
  }
  
  static async moderateComment(commentId, isApproved, moderationNote = null) {
    const comment = await prisma.comment.update({
      where: { comment_id: commentId },
      data: {
        isApproved,
        ...(moderationNote && { moderationNote }),
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            email: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
      },
    });
    
    // Notify author if comment was rejected
    if (!isApproved) {
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId: comment.author.id,
          type: 'MODERATION_WARNING',
          title: 'Comment Moderated',
          message: `Your comment on "${comment.post.title}" was not approved`,
          data: {
            commentId,
            reason: moderationNote,
          },
        },
      });
    }
    
    // Clear cache
    await redis.del(`post:${comment.postId}`);
    
    return comment;
  }
}

export default PostService;