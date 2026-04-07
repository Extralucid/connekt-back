import { z } from 'zod';

// Slug validation
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ==================== FORUM SCHEMAS ====================

// Create Forum Schema
const createForumSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Forum name must be at least 3 characters')
      .max(250, 'Forum name cannot exceed 250 characters'),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description cannot exceed 5000 characters'),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    parentForumId: z.string()
      .uuid('Invalid parent forum ID')
      .optional(),
    displayOrder: z.number()
      .int()
      .min(0)
      .default(0),
  }),
});

// Update Forum Schema
const updateForumSchema = z.object({
  params: z.object({
    forumId: z.string()
      .uuid('Invalid forum ID'),
  }),
  body: z.object({
    name: z.string()
      .min(3, 'Forum name must be at least 3 characters')
      .max(250, 'Forum name cannot exceed 250 characters')
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    parentForumId: z.string()
      .uuid('Invalid parent forum ID')
      .nullable()
      .optional(),
    displayOrder: z.number()
      .int()
      .min(0)
      .optional(),
  }),
});

// Get Forums Query Schema
const getForumsQuerySchema = z.object({
  query: z.object({
    includeStats: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .default('true'),
    includeSubForums: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .default('true'),
  }),
});

// ==================== TOPIC SCHEMAS ====================

// Create Topic Schema
const createTopicSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(250, 'Title cannot exceed 250 characters'),
    content: z.string()
      .min(20, 'Content must be at least 20 characters')
      .max(50000, 'Content cannot exceed 50000 characters'),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    status: z.enum(['OPEN', 'CLOSED', 'PINNED', 'ARCHIVED'])
      .default('OPEN'),
  }),
  params: z.object({
    forumId: z.string()
      .uuid('Invalid forum ID'),
  }),
});

// Update Topic Schema
const updateTopicSchema = z.object({
  params: z.object({
    topicId: z.string()
      .uuid('Invalid topic ID'),
  }),
  body: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(250, 'Title cannot exceed 250 characters')
      .optional(),
    content: z.string()
      .min(20, 'Content must be at least 20 characters')
      .max(50000, 'Content cannot exceed 50000 characters')
      .optional(),
    status: z.enum(['OPEN', 'CLOSED', 'PINNED', 'ARCHIVED'])
      .optional(),
  }),
});

// Get Topics Query Schema
const getTopicsQuerySchema = z.object({
  params: z.object({
    forumId: z.string()
      .uuid('Invalid forum ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20'),
    search: z.string()
      .min(2, 'Search query must be at least 2 characters')
      .optional(),
    status: z.enum(['OPEN', 'CLOSED', 'PINNED', 'ARCHIVED'])
      .optional(),
    authorId: z.string()
      .uuid('Invalid author ID')
      .optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'view_count', 'lastReplyAt'])
      .default('lastReplyAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Topic By Slug or ID Schema
const getTopicParamSchema = z.object({
  params: z.object({
    identifier: z.string()
      .min(1, 'Topic ID or slug is required'),
  }),
});

// Delete Topic Schema
const deleteTopicSchema = z.object({
  params: z.object({
    topicId: z.string()
      .uuid('Invalid topic ID'),
  }),
  body: z.object({
    permanent: z.boolean()
      .default(false),
  }),
});

// Pin/Unpin Topic Schema
const pinTopicSchema = z.object({
  params: z.object({
    topicId: z.string()
      .uuid('Invalid topic ID'),
  }),
  body: z.object({
    pin: z.boolean(),
  }),
});

// Close/Open Topic Schema
const closeTopicSchema = z.object({
  params: z.object({
    topicId: z.string()
      .uuid('Invalid topic ID'),
  }),
  body: z.object({
    close: z.boolean(),
  }),
});

// ==================== REPLY SCHEMAS ====================

// Create Reply Schema
const createReplySchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Reply cannot be empty')
      .max(10000, 'Reply cannot exceed 10000 characters'),
    isAcceptedAnswer: z.boolean()
      .default(false),
  }),
  params: z.object({
    topicId: z.string()
      .uuid('Invalid topic ID'),
  }),
});

// Update Reply Schema
const updateReplySchema = z.object({
  params: z.object({
    replyId: z.string()
      .uuid('Invalid reply ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Reply cannot be empty')
      .max(10000, 'Reply cannot exceed 10000 characters'),
  }),
});

// Get Replies Query Schema
const getRepliesQuerySchema = z.object({
  params: z.object({
    topicId: z.string()
      .uuid('Invalid topic ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20'),
    sortBy: z.enum(['createdAt', 'updatedAt', 'votes'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('asc'),
  }),
});

// ==================== VOTE SCHEMAS ====================

// Vote on Reply Schema
const voteOnReplySchema = z.object({
  params: z.object({
    replyId: z.string()
      .uuid('Invalid reply ID'),
  }),
  body: z.object({
    type: z.enum(['UPVOTE', 'DOWNVOTE']),
  }),
});

// Accept Answer Schema
const acceptAnswerSchema = z.object({
  params: z.object({
    replyId: z.string()
      .uuid('Invalid reply ID'),
  }),
  body: z.object({
    accept: z.boolean(),
  }),
});

// ==================== STATS SCHEMAS ====================

// Get Forum Stats Schema
const getForumStatsSchema = z.object({
  params: z.object({
    forumId: z.string()
      .uuid('Invalid forum ID'),
  }),
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

export {
  // Forum schemas
  createForumSchema,
  updateForumSchema,
  getForumsQuerySchema,
  
  // Topic schemas
  createTopicSchema,
  updateTopicSchema,
  getTopicsQuerySchema,
  getTopicParamSchema,
  deleteTopicSchema,
  pinTopicSchema,
  closeTopicSchema,
  
  // Reply schemas
  createReplySchema,
  updateReplySchema,
  getRepliesQuerySchema,
  
  // Vote schemas
  voteOnReplySchema,
  acceptAnswerSchema,
  
  // Stats schemas
  getForumStatsSchema,
};