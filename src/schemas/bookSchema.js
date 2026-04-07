import { z }  from 'zod';

// Custom validations
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i;

// ==================== BOOK SCHEMAS ====================

// Create Book Schema
const createBookSchema = z.object({
  body: z.object({
    title: z.string()
      .min(2, 'Book title must be at least 2 characters')
      .max(250, 'Book title cannot exceed 250 characters'),
    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(5000, 'Description cannot exceed 5000 characters'),
    coverImage: z.string()
      .url('Invalid cover image URL')
      .optional(),
    author: z.string()
      .min(2, 'Author name must be at least 2 characters')
      .max(250, 'Author name too long'),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .optional(),
    fileUrl: z.string()
      .url('Invalid file URL')
      .optional(),
    pages: z.number()
      .int()
      .min(1, 'Book must have at least 1 page')
      .max(10000, 'Book cannot exceed 10000 pages')
      .optional(),
    categoryIds: z.array(z.string().uuid())
      .min(1, 'At least one category is required')
      .max(10, 'Maximum 10 categories allowed'),
    isbn: z.string()
      .regex(isbnRegex, 'Invalid ISBN format')
      .optional(),
    publisher: z.string()
      .max(250, 'Publisher name too long')
      .optional(),
    publishedDate: z.string()
      .datetime()
      .optional(),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .default('en'),
  }),
});

// Update Book Schema
const updateBookSchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
  }),
  body: z.object({
    title: z.string()
      .min(2, 'Book title must be at least 2 characters')
      .max(250, 'Book title cannot exceed 250 characters')
      .optional(),
    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    coverImage: z.string()
      .url('Invalid cover image URL')
      .optional(),
    author: z.string()
      .min(2, 'Author name must be at least 2 characters')
      .max(250, 'Author name too long')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .optional(),
    fileUrl: z.string()
      .url('Invalid file URL')
      .optional(),
    pages: z.number()
      .int()
      .min(1)
      .max(10000)
      .optional(),
    isbn: z.string()
      .regex(isbnRegex, 'Invalid ISBN format')
      .optional(),
    publisher: z.string()
      .max(250, 'Publisher name too long')
      .optional(),
    publishedDate: z.string()
      .datetime()
      .optional(),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .optional(),
  }),
});

// Get Books Query Schema
const getBooksQuerySchema = z.object({
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
    author: z.string()
      .optional(),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .optional(),
    minPrice: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Must be a valid price')
      .transform(Number)
      .optional(),
    maxPrice: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Must be a valid price')
      .transform(Number)
      .optional(),
    sortBy: z.enum(['title', 'author', 'price', 'createdAt', 'publishedDate'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Book By ID/Slug Schema
const getBookParamSchema = z.object({
  params: z.object({
    identifier: z.string()
      .min(1, 'Book ID or slug is required'),
  }),
});

// Delete Book Schema
const deleteBookSchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
  }),
});

// ==================== BOOK CATEGORY SCHEMAS ====================

// Create Book Category Schema
const createBookCategorySchema = z.object({
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

// Update Book Category Schema
const updateBookCategorySchema = z.object({
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

// ==================== USER BOOK SCHEMAS ====================

// Add Book to Library Schema
const addToLibrarySchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
  }),
});

// Update Reading Progress Schema
const updateReadingProgressSchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
  }),
  body: z.object({
    progress: z.number()
      .int()
      .min(0, 'Progress cannot be negative')
      .max(100, 'Progress cannot exceed 100'),
    currentPage: z.number()
      .int()
      .min(0, 'Current page cannot be negative')
      .optional(),
  }),
});

// Get User Library Query Schema
const getUserLibraryQuerySchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20'),
    status: z.enum(['reading', 'completed', 'wishlist'])
      .optional(),
    sortBy: z.enum(['progress', 'createdAt', 'updatedAt', 'title'])
      .default('updatedAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// ==================== BOOK REVIEW SCHEMAS ====================

// Create Book Review Schema
const createBookReviewSchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
  }),
  body: z.object({
    rating: z.number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(250, 'Title too long'),
    review: z.string()
      .min(20, 'Review must be at least 20 characters')
      .max(5000, 'Review too long'),
  }),
});

// Update Book Review Schema
const updateBookReviewSchema = z.object({
  params: z.object({
    reviewId: z.string()
      .uuid('Invalid review ID'),
  }),
  body: z.object({
    rating: z.number()
      .int()
      .min(1)
      .max(5)
      .optional(),
    title: z.string()
      .min(3)
      .max(250)
      .optional(),
    review: z.string()
      .min(20)
      .max(5000)
      .optional(),
  }),
});

// Get Book Reviews Query Schema
const getBookReviewsQuerySchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
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
    sortBy: z.enum(['rating', 'createdAt', 'helpful'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Delete Book Review Schema
const deleteBookReviewSchema = z.object({
  params: z.object({
    reviewId: z.string()
      .uuid('Invalid review ID'),
  }),
});

// ==================== STATS SCHEMAS ====================

// Get Book Stats Schema
const getBookStatsSchema = z.object({
  params: z.object({
    bookId: z.string()
      .uuid('Invalid book ID'),
  }),
});

// Get Reading Stats Schema
const getReadingStatsSchema = z.object({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

export {
  // Book schemas
  createBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
  getBookParamSchema,
  deleteBookSchema,
  
  // Category schemas
  createBookCategorySchema,
  updateBookCategorySchema,
  
  // User book schemas
  addToLibrarySchema,
  updateReadingProgressSchema,
  getUserLibraryQuerySchema,
  
  // Review schemas
  createBookReviewSchema,
  updateBookReviewSchema,
  getBookReviewsQuerySchema,
  deleteBookReviewSchema,
  
  // Stats schemas
  getBookStatsSchema,
  getReadingStatsSchema,
};