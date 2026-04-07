import { z } from 'zod';

// Custom validations
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const durationRegex = /^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$/;

// ==================== TUTORIAL SCHEMAS ====================

// Create Tutorial Schema
const createTutorialSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Tutorial title must be at least 5 characters')
      .max(250, 'Tutorial title cannot exceed 250 characters'),
    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(5000, 'Description cannot exceed 5000 characters'),
    thumbnail: z.string()
      .url('Invalid thumbnail URL')
      .optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
      .default('beginner'),
    duration: z.number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .max(10080, 'Duration cannot exceed 7 days')
      .optional(),
    categoryIds: z.array(z.string().uuid())
      .min(1, 'At least one category is required')
      .max(10, 'Maximum 10 categories allowed'),
    prerequisites: z.array(z.string())
      .max(10, 'Maximum 10 prerequisites')
      .optional(),
    learningOutcomes: z.array(z.string())
      .min(1, 'At least one learning outcome is required')
      .max(20, 'Maximum 20 learning outcomes'),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .default(0),
    certificateEnabled: z.boolean()
      .default(false),
  }),
});

// Update Tutorial Schema
const updateTutorialSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
  body: z.object({
    title: z.string()
      .min(5, 'Tutorial title must be at least 5 characters')
      .max(250, 'Tutorial title cannot exceed 250 characters')
      .optional(),
    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    thumbnail: z.string()
      .url('Invalid thumbnail URL')
      .optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
      .optional(),
    duration: z.number()
      .int()
      .min(1)
      .max(10080)
      .optional(),
    prerequisites: z.array(z.string())
      .max(10)
      .optional(),
    learningOutcomes: z.array(z.string())
      .max(20)
      .optional(),
    price: z.number()
      .min(0)
      .optional(),
    certificateEnabled: z.boolean()
      .optional(),
  }),
});

// Get Tutorials Query Schema
const getTutorialsQuerySchema = z.object({
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
    categoryId: z.string()
      .uuid('Invalid category ID')
      .optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
      .optional(),
    minPrice: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Must be a valid price')
      .transform(Number)
      .optional(),
    maxPrice: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Must be a valid price')
      .transform(Number)
      .optional(),
    sortBy: z.enum(['title', 'difficulty', 'price', 'createdAt', 'rating', 'enrollments'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Tutorial By ID/Slug Schema
const getTutorialParamSchema = z.object({
  params: z.object({
    identifier: z.string()
      .min(1, 'Tutorial ID or slug is required'),
  }),
});

// Delete Tutorial Schema
const deleteTutorialSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
});

// ==================== TUTORIAL SECTION SCHEMAS ====================

// Create Section Schema
const createSectionSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
  body: z.object({
    title: z.string()
      .min(3, 'Section title must be at least 3 characters')
      .max(250, 'Section title cannot exceed 250 characters'),
    content: z.string()
      .min(20, 'Content must be at least 20 characters')
      .max(50000, 'Content cannot exceed 50000 characters'),
    videoUrl: z.string()
      .url('Invalid video URL')
      .optional(),
    order: z.number()
      .int()
      .min(0, 'Order must be a positive number'),
  }),
});

// Update Section Schema
const updateSectionSchema = z.object({
  params: z.object({
    sectionId: z.string()
      .uuid('Invalid section ID'),
  }),
  body: z.object({
    title: z.string()
      .min(3, 'Section title must be at least 3 characters')
      .max(250, 'Section title cannot exceed 250 characters')
      .optional(),
    content: z.string()
      .min(20, 'Content must be at least 20 characters')
      .max(50000, 'Content cannot exceed 50000 characters')
      .optional(),
    videoUrl: z.string()
      .url('Invalid video URL')
      .nullable()
      .optional(),
    order: z.number()
      .int()
      .min(0)
      .optional(),
  }),
});

// Get Sections Query Schema
const getSectionsQuerySchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('50'),
  }),
});

// Delete Section Schema
const deleteSectionSchema = z.object({
  params: z.object({
    sectionId: z.string()
      .uuid('Invalid section ID'),
  }),
});

// Reorder Sections Schema
const reorderSectionsSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
  body: z.object({
    sections: z.array(z.object({
      sectionId: z.string().uuid(),
      order: z.number().int().min(0),
    })),
  }),
});

// ==================== TUTORIAL CATEGORY SCHEMAS ====================

// Create Tutorial Category Schema
const createTutorialCategorySchema = z.object({
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

// Update Tutorial Category Schema
const updateTutorialCategorySchema = z.object({
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

// ==================== USER PROGRESS SCHEMAS ====================

// Enroll in Tutorial Schema
const enrollTutorialSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
});

// Update Progress Schema
const updateProgressSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
  body: z.object({
    sectionId: z.string()
      .uuid('Invalid section ID'),
    isDone: z.boolean()
      .default(true),
  }),
});

// Get User Progress Schema
const getUserProgressSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
});

// Get Enrolled Tutorials Query Schema
const getEnrolledTutorialsSchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20'),
    status: z.enum(['in-progress', 'completed'])
      .optional(),
    sortBy: z.enum(['progress', 'enrolledAt', 'lastAccessed'])
      .default('lastAccessed'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// ==================== CERTIFICATE SCHEMAS ====================

// Generate Certificate Schema
const generateCertificateSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
});

// Verify Certificate Schema
const verifyCertificateSchema = z.object({
  query: z.object({
    certificateId: z.string()
      .min(1, 'Certificate ID is required'),
  }),
});

// ==================== REVIEW SCHEMAS ====================

// Create Tutorial Review Schema
const createTutorialReviewSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
  body: z.object({
    rating: z.number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    review: z.string()
      .min(20, 'Review must be at least 20 characters')
      .max(5000, 'Review too long'),
  }),
});

// Get Tutorial Reviews Query Schema
const getTutorialReviewsSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
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
    rating: z.string()
      .regex(/^[1-5]$/, 'Rating must be between 1 and 5')
      .transform(Number)
      .optional(),
  }),
});

// ==================== STATS SCHEMAS ====================

// Get Tutorial Stats Schema
const getTutorialStatsSchema = z.object({
  params: z.object({
    tutorialId: z.string()
      .uuid('Invalid tutorial ID'),
  }),
});

// Get Learning Stats Schema
const getLearningStatsSchema = z.object({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

export {
  // Tutorial schemas
  createTutorialSchema,
  updateTutorialSchema,
  getTutorialsQuerySchema,
  getTutorialParamSchema,
  deleteTutorialSchema,
  
  // Section schemas
  createSectionSchema,
  updateSectionSchema,
  getSectionsQuerySchema,
  deleteSectionSchema,
  reorderSectionsSchema,
  
  // Category schemas
  createTutorialCategorySchema,
  updateTutorialCategorySchema,
  
  // User progress schemas
  enrollTutorialSchema,
  updateProgressSchema,
  getUserProgressSchema,
  getEnrolledTutorialsSchema,
  
  // Certificate schemas
  generateCertificateSchema,
  verifyCertificateSchema,
  
  // Review schemas
  createTutorialReviewSchema,
  getTutorialReviewsSchema,
  
  // Stats schemas
  getTutorialStatsSchema,
  getLearningStatsSchema,
};