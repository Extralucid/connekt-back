import { z } from 'zod';

// Custom validation for slug
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Create Post Schema
const createPostSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(250, 'Title cannot exceed 250 characters'),
    content: z.string()
      .min(50, 'Content must be at least 50 characters')
      .max(50000, 'Content cannot exceed 50000 characters'),
    excerpt: z.string()
      .max(250, 'Excerpt cannot exceed 250 characters')
      .optional(),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly (lowercase, hyphens only)')
      .optional(),
    featured_image_url: z.string()
      .url('Invalid image URL')
      .optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
      .default('DRAFT'),
    published_date: z.string()
      .datetime()
      .optional(),
    categoryIds: z.array(z.string().uuid())
      .max(10, 'Maximum 10 categories per post')
      .optional(),
    tagIds: z.array(z.string().uuid())
      .max(20, 'Maximum 20 tags per post')
      .optional(),
  }),
});

// Update Post Schema
const updatePostSchema = z.object({
  params: z.object({
    postId: z.string()
      .uuid('Invalid post ID'),
  }),
  body: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(250, 'Title cannot exceed 250 characters')
      .optional(),
    content: z.string()
      .min(50, 'Content must be at least 50 characters')
      .max(50000, 'Content cannot exceed 50000 characters')
      .optional(),
    excerpt: z.string()
      .max(250, 'Excerpt cannot exceed 250 characters')
      .optional(),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    featured_image_url: z.string()
      .url('Invalid image URL')
      .optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
      .optional(),
    published_date: z.string()
      .datetime()
      .optional(),
  }),
});

// Get Posts Query Schema
const getPostsQuerySchema = z.object({
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
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
      .optional(),
    categoryId: z.string()
      .uuid('Invalid category ID')
      .optional(),
    tagId: z.string()
      .uuid('Invalid tag ID')
      .optional(),
    authorId: z.string()
      .uuid('Invalid author ID')
      .optional(),
    dateFrom: z.string()
      .datetime()
      .optional(),
    dateTo: z.string()
      .datetime()
      .optional(),
    sortBy: z.enum(['createdAt', 'published_date', 'view_count', 'title'])
      .default('published_date'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Post By Slug or ID Schema
const getPostParamSchema = z.object({
  params: z.object({
    identifier: z.string()
      .min(1, 'Post ID or slug is required'),
  }),
});

// Delete Post Schema
const deletePostSchema = z.object({
  params: z.object({
    postId: z.string()
      .uuid('Invalid post ID'),
  }),
  body: z.object({
    permanent: z.boolean()
      .default(false),
  }),
});

// Create Category Schema
const createCategorySchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(250, 'Category name too long'),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// Update Category Schema
const updateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string()
      .uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(250, 'Category name too long')
      .optional(),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// Create Tag Schema
const createTagSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Tag name must be at least 2 characters')
      .max(250, 'Tag name too long'),
    slug: z.string()
      .regex(slugRegex, 'Slug must be URL-friendly')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// Create Comment Schema
const createCommentSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Comment cannot be empty')
      .max(5000, 'Comment cannot exceed 5000 characters'),
    parentCommentId: z.string()
      .uuid('Invalid parent comment ID')
      .optional(),
  }),
  params: z.object({
    postId: z.string()
      .uuid('Invalid post ID'),
  }),
});

// Update Comment Schema
const updateCommentSchema = z.object({
  params: z.object({
    commentId: z.string()
      .uuid('Invalid comment ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Comment cannot be empty')
      .max(5000, 'Comment cannot exceed 5000 characters'),
  }),
});

// Get Comments Query Schema
const getCommentsQuerySchema = z.object({
  params: z.object({
    postId: z.string()
      .uuid('Invalid post ID'),
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
    sortBy: z.enum(['createdAt', 'updatedAt'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Moderate Comment Schema (Admin)
const moderateCommentSchema = z.object({
  params: z.object({
    commentId: z.string()
      .uuid('Invalid comment ID'),
  }),
  body: z.object({
    isApproved: z.boolean(),
    moderationNote: z.string()
      .max(500, 'Moderation note too long')
      .optional(),
  }),
});

export  {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  getPostParamSchema,
  deletePostSchema,
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  createCommentSchema,
  updateCommentSchema,
  getCommentsQuerySchema,
  moderateCommentSchema,
};