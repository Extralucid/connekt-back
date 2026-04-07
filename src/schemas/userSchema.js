import { z } from 'zod';

// Custom validation functions
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Reusable schemas
const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .default('1')
    .pipe(z.number().int().positive()),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .default('20')
    .pipe(z.number().int().min(1).max(100)),
});

const sortSchema = z.object({
  sortBy: z.enum(['createdAt', 'updatedAt', 'display_name', 'email', 'lastActiveAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
});

// User Profile Update Schema
const updateProfileSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .min(5, 'Email too short')
      .max(255, 'Email too long')
      .optional(),
    phone: z.string()
      .regex(phoneRegex, 'Invalid phone number format. Use international format (e.g., +1234567890)')
      .optional(),
    username: z.string()
      .regex(usernameRegex, 'Username must be 3-30 characters and can only contain letters, numbers, and underscore')
      .optional(),
    display_name: z.string()
      .min(1, 'Display name cannot be empty')
      .max(250, 'Display name too long')
      .optional(),
    bio: z.string()
      .max(5000, 'Bio cannot exceed 5000 characters')
      .optional(),
    dateOfBirth: z.string()
      .datetime({ message: 'Invalid date format' })
      .refine((date) => {
        const age = Math.floor((new Date() - new Date(date)) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 13 && age <= 120;
      }, { message: 'User must be at least 13 years old and not exceed 120 years' })
      .optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'])
      .optional(),
    location: z.string()
      .max(255, 'Location too long')
      .optional(),
    timezone: z.string()
      .regex(/^[+-]?(?:[0-9]|1[0-2]):[0-5][0-9]$/, 'Invalid timezone format')
      .optional(),
    profile_picture_url: z.string()
      .url('Invalid URL')
      .optional(),
    cover_photo_url: z.string()
      .url('Invalid URL')
      .optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// User Preferences Schema
const updatePreferencesSchema = z.object({
  body: z.object({
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .regex(/^[a-z]{2}$/, 'Language code must be lowercase letters')
      .default('en'),
    notifyNewContent: z.boolean()
      .default(true),
    bookCategories: z.array(z.string().uuid('Invalid book category ID'))
      .max(20, 'Maximum 20 book categories allowed')
      .optional(),
    tutorialTopics: z.array(z.string().uuid('Invalid tutorial topic ID'))
      .max(20, 'Maximum 20 tutorial topics allowed')
      .optional(),
    blogCategories: z.array(z.string().uuid('Invalid blog category ID'))
      .max(20, 'Maximum 20 blog categories allowed')
      .optional(),
    jobCategories: z.array(z.string().uuid('Invalid job category ID'))
      .max(20, 'Maximum 20 job categories allowed')
      .optional(),
    emailNotifications: z.object({
      marketing: z.boolean().default(true),
      jobAlerts: z.boolean().default(true),
      contentUpdates: z.boolean().default(true),
      eventReminders: z.boolean().default(true),
      messageNotifications: z.boolean().default(true),
    }).optional(),
    privacySettings: z.object({
      profileVisibility: z.enum(['public', 'connections', 'private']).default('public'),
      showEmail: z.boolean().default(false),
      showPhone: z.boolean().default(false),
      showLastActive: z.boolean().default(true),
    }).optional(),
  }),
});

// Get Users Query Schema
const getUsersQuerySchema = z.object({
  query: paginationSchema.merge(sortSchema).extend({
    search: z.string()
      .min(2, 'Search query must be at least 2 characters')
      .max(100, 'Search query too long')
      .optional(),
    accountType: z.enum(['INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
      .optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION', 'DEACTIVATED'])
      .optional(),
    isVerified: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    role: z.string()
      .optional(),
    dateFrom: z.string()
      .datetime({ message: 'Invalid date format' })
      .optional(),
    dateTo: z.string()
      .datetime({ message: 'Invalid date format' })
      .optional(),
    minPosts: z.string()
      .regex(/^\d+$/, 'Must be a number')
      .transform(Number)
      .optional(),
    minComments: z.string()
      .regex(/^\d+$/, 'Must be a number')
      .transform(Number)
      .optional(),
  }).refine(data => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  }, { message: 'dateFrom must be less than or equal to dateTo' }),
});

// Get User by ID Param Schema
const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string()
      .uuid('Invalid user ID format'),
  }),
});

// Get User Stats Schema
const getUserStatsSchema = z.object({
  params: z.object({
    userId: z.string()
      .uuid('Invalid user ID format')
      .optional(),
  }),
});

// Get User Activity Schema
const getUserActivitySchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('50')
      .pipe(z.number().int().min(1).max(500)),
    activityType: z.string()
      .optional(),
    dateFrom: z.string()
      .datetime()
      .optional(),
    dateTo: z.string()
      .datetime()
      .optional(),
  }),
});

// Get Notifications Query Schema
const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20')
      .pipe(z.number().int().min(1).max(100)),
    offset: z.string()
      .regex(/^\d+$/, 'Offset must be a number')
      .transform(Number)
      .default('0')
      .pipe(z.number().int().min(0)),
    isRead: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    type: z.enum([
      'CONTENT_LIKE',
      'CONTENT_COMMENT',
      'CONTENT_SHARE',
      'MENTION',
      'MESSAGE',
      'EVENT_REMINDER',
      'JOB_ALERT',
      'ACHIEVEMENT_EARNED',
      'REPORT_RESOLVED',
      'SYSTEM_ALERT',
      'MODERATION_WARNING',
      'SUBSCRIPTION_UPDATE'
    ]).optional(),
  }),
});

// Notification ID Param Schema
const notificationIdParamSchema = z.object({
  params: z.object({
    notificationId: z.string()
      .uuid('Invalid notification ID'),
  }),
});

// Delete Account Schema
const deleteAccountSchema = z.object({
  body: z.object({
    reason: z.string()
      .max(500, 'Reason too long')
      .optional(),
    password: z.string()
      .min(1, 'Password is required to confirm account deletion'),
  }),
});

// Upload Profile Picture Schema
const uploadProfilePictureSchema = z.object({
  file: z.object({
    mimetype: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Only image files are allowed'),
    size: z.number().max(5 * 1024 * 1024, 'File size cannot exceed 5MB'),
  }).optional(),
});

// Get Top Users Schema
const getTopUsersSchema = z.object({
  query: z.object({
    category: z.enum(['points', 'posts', 'comments', 'engagement', 'followers'])
      .default('points'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('10')
      .pipe(z.number().int().min(1).max(50)),
    period: z.enum(['all', 'week', 'month', 'year'])
      .default('all'),
  }),
});

// Batch User Update Schema (Admin only)
const batchUserUpdateSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().uuid('Invalid user ID'))
      .min(1, 'At least one user ID is required')
      .max(100, 'Maximum 100 users per batch'),
    action: z.enum(['activate', 'suspend', 'ban', 'delete', 'assignRole', 'removeRole']),
    roleName: z.string().optional(),
    reason: z.string().max(500, 'Reason too long').optional(),
  }).refine(data => {
    if (data.action === 'assignRole' || data.action === 'removeRole') {
      return data.roleName && data.roleName.length > 0;
    }
    return true;
  }, { message: 'roleName is required for assignRole or removeRole actions' }),
});

// Export all schemas
export {
  updateProfileSchema,
  updatePreferencesSchema,
  getUsersQuerySchema,
  userIdParamSchema,
  getUserStatsSchema,
  getUserActivitySchema,
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  deleteAccountSchema,
  uploadProfilePictureSchema,
  getTopUsersSchema,
  batchUserUpdateSchema,
};