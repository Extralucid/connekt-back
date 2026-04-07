import prisma from '../config/database.js';
import redis  from '../config/redis.js';

class UserService {
  static async getUserById(userId, includeSensitive = false) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      include: {
        preferences: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        organizations: {
          include: {
            organization: true,
            department: true,
          },
        },
        userPoints: true,
        userAchievements: {
          include: {
            achievement: true,
          },
          take: 10,
        },
      },
    });
    
    if (!user) return null;
    
    if (!includeSensitive) {
      delete user.pwd_hash;
      delete user.two_factor_secret;
      delete user.usession;
    }
    
    return user;
  }

  static async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email, isDeleted: false },
    });
  }

  static async getUserByPhone(phone) {
    return prisma.user.findUnique({
      where: { phone, isDeleted: false },
    });
  }

  static async updateProfile(userId, updateData) {
    const { email, phone, username, ...otherData } = updateData;
    
    // Check uniqueness for updated fields
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      if (existing) throw new Error('Email already in use');
    }
    
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, id: { not: userId } },
      });
      if (existing) throw new Error('Phone number already in use');
    }
    
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } },
      });
      if (existing) throw new Error('Username already taken');
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...otherData,
        email,
        phone,
        username,
        updatedAt: new Date(),
      },
      include: {
        preferences: true,
      },
    });
    
    delete user.pwd_hash;
    
    // Clear user cache
    await redis.del(`user:${userId}`);
    
    return user;
  }

  static async updatePreferences(userId, preferences) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          upsert: {
            create: preferences,
            update: preferences,
          },
        },
      },
      include: {
        preferences: true,
      },
    });
    
    return user.preferences;
  }

  static async getUserStats(userId) {
    const [
      postsCount,
      commentsCount,
      topicsCount,
      repliesCount,
      applicationsCount,
      bookmarksCount,
      achievementsCount,
      totalPoints,
    ] = await Promise.all([
      prisma.post.count({ where: { authorId: userId, isDeleted: false } }),
      prisma.comment.count({ where: { authorId: userId, isDeleted: false } }),
      prisma.topic.count({ where: { authorId: userId } }),
      prisma.reply.count({ where: { authorId: userId } }),
      prisma.application.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.userPoints.findUnique({ where: { userId }, select: { totalPoints: true } }),
    ]);
    
    return {
      postsCount,
      commentsCount,
      topicsCount,
      repliesCount,
      applicationsCount,
      bookmarksCount,
      achievementsCount,
      totalPoints: totalPoints?.totalPoints || 0,
    };
  }

  static async searchUsers(filters, pagination) {
    const { query, accountType, status, role, isVerified } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    
    const where = { isDeleted: false };
    
    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { display_name: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { unom: { contains: query, mode: 'insensitive' } },
        { uprenom: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (accountType) where.accountType = accountType;
    if (status) where.status = status;
    if (isVerified !== undefined) {
      where.email_verified_at = isVerified ? { not: null } : null;
    }
    
    if (role) {
      where.userRoles = { some: { role: { name: role } } };
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          phone: true,
          display_name: true,
          username: true,
          profile_picture_url: true,
          bio: true,
          accountType: true,
          status: true,
          email_verified_at: true,
          createdAt: true,
          lastActiveAt: true,
          userRoles: {
            include: { role: true },
          },
          _count: {
            select: {
              posts: true,
              comments: true,
              applications: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async uploadProfilePicture(userId, fileUrl) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profile_picture_url: fileUrl,
        updatedAt: new Date(),
      },
    });
    
    delete user.pwd_hash;
    
    return user;
  }

  static async getUserActivity(userId, limit = 50) {
    const activities = await prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return activities;
  }

  static async getNotifications(userId, filters = {}) {
    const { isRead, type, limit = 20, offset = 0 } = filters;
    
    const where = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    if (type) where.type = type;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);
    
    return {
      notifications,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    };
  }

  static async markNotificationAsRead(userId, notificationId) {
    return prisma.notification.update({
      where: { notification_id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllNotificationsAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async deleteAccount(userId, reason) {
    // Soft delete user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        status: 'DEACTIVATED',
        email: null, // Clear email for GDPR
        updatedAt: new Date(),
      },
    });
    
    // Revoke all tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isValid: false, revoked: true },
    });
    
    // Log deletion
    await prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_DELETED',
        userId,
        metadata: { reason },
      },
    });
    
    return true;
  }

  static async getTopUsers(category = 'points', limit = 10) {
    let orderBy = {};
    
    switch (category) {
      case 'points':
        orderBy = { userPoints: { totalPoints: 'desc' } };
        break;
      case 'posts':
        orderBy = { posts: { _count: 'desc' } };
        break;
      case 'engagement':
        orderBy = { lastActiveAt: 'desc' };
        break;
      default:
        orderBy = { userPoints: { totalPoints: 'desc' } };
    }
    
    const users = await prisma.user.findMany({
      where: { isDeleted: false, status: 'ACTIVE' },
      orderBy,
      take: limit,
      include: {
        userPoints: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            replies: true,
          },
        },
      },
    });
    
    return users.map(user => ({
      id: user.id,
      display_name: user.display_name,
      profile_picture_url: user.profile_picture_url,
      points: user.userPoints?.totalPoints || 0,
      level: user.userPoints?.level || 1,
      postsCount: user._count.posts,
      commentsCount: user._count.comments,
    }));
  }
}

export default UserService;