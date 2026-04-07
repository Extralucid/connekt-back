import { z }  from 'zod';

// Custom validations
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const durationRegex = /^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$/;

// ==================== PODCAST SCHEMAS ====================

// Create Podcast Schema
const createPodcastSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Podcast title must be at least 3 characters')
      .max(250, 'Podcast title cannot exceed 250 characters'),
    description: z.string()
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description cannot exceed 5000 characters'),
    coverImage: z.string()
      .url('Invalid cover image URL')
      .optional(),
    isExplicit: z.boolean()
      .default(false),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .default('en'),
    categories: z.array(z.string())
      .max(10, 'Maximum 10 categories allowed')
      .optional(),
  }),
});

// Update Podcast Schema
const updatePodcastSchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
  }),
  body: z.object({
    title: z.string()
      .min(3, 'Podcast title must be at least 3 characters')
      .max(250, 'Podcast title cannot exceed 250 characters')
      .optional(),
    description: z.string()
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    coverImage: z.string()
      .url('Invalid cover image URL')
      .optional(),
    isExplicit: z.boolean()
      .optional(),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .optional(),
    categories: z.array(z.string())
      .max(10, 'Maximum 10 categories allowed')
      .optional(),
  }),
});

// Get Podcasts Query Schema
const getPodcastsQuerySchema = z.object({
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
    category: z.string()
      .optional(),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .optional(),
    sortBy: z.enum(['createdAt', 'title', 'totalListens', 'rating'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Podcast By ID/Slug Schema
const getPodcastParamSchema = z.object({
  params: z.object({
    identifier: z.string()
      .min(1, 'Podcast ID or slug is required'),
  }),
});

// Delete Podcast Schema
const deletePodcastSchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
  }),
});

// ==================== EPISODE SCHEMAS ====================

// Create Episode Schema
const createEpisodeSchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
  }),
  body: z.object({
    title: z.string()
      .min(3, 'Episode title must be at least 3 characters')
      .max(250, 'Episode title cannot exceed 250 characters'),
    description: z.string()
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description cannot exceed 5000 characters'),
    audioUrl: z.string()
      .url('Invalid audio URL'),
    duration: z.number()
      .int()
      .min(1, 'Duration must be at least 1 second')
      .max(86400, 'Duration cannot exceed 24 hours'),
    publishDate: z.string()
      .datetime()
      .optional(),
    transcript: z.string()
      .max(50000, 'Transcript too long')
      .optional(),
  }),
});

// Update Episode Schema
const updateEpisodeSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
  body: z.object({
    title: z.string()
      .min(3, 'Episode title must be at least 3 characters')
      .max(250, 'Episode title cannot exceed 250 characters')
      .optional(),
    description: z.string()
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    audioUrl: z.string()
      .url('Invalid audio URL')
      .optional(),
    duration: z.number()
      .int()
      .min(1)
      .max(86400)
      .optional(),
    publishDate: z.string()
      .datetime()
      .optional(),
  }),
});

// Get Episodes Query Schema
const getEpisodesQuerySchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
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
    sortBy: z.enum(['publishDate', 'createdAt', 'duration', 'title'])
      .default('publishDate'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Episode By ID Schema
const getEpisodeParamSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
});

// Delete Episode Schema
const deleteEpisodeSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
});

// ==================== LISTEN TRACKING SCHEMAS ====================

// Track Listen Schema
const trackListenSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
  body: z.object({
    progress: z.number()
      .int()
      .min(0, 'Progress cannot be negative')
      .max(100, 'Progress cannot exceed 100')
      .optional(),
    completed: z.boolean()
      .default(false),
  }),
});

// Get Listen Stats Schema
const getListenStatsSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

// ==================== SUBSCRIPTION SCHEMAS ====================

// Subscribe to Podcast Schema
const subscribeSchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
  }),
});

// Get Subscribers Query Schema
const getSubscribersQuerySchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
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
  }),
});

// ==================== COMMENT SCHEMAS ====================

// Create Podcast Comment Schema
const createPodcastCommentSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Comment cannot be empty')
      .max(5000, 'Comment cannot exceed 5000 characters'),
    parentId: z.string()
      .uuid('Invalid parent comment ID')
      .optional(),
  }),
});

// Update Podcast Comment Schema
const updatePodcastCommentSchema = z.object({
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

// Get Podcast Comments Query Schema
const getPodcastCommentsQuerySchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
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

// Delete Podcast Comment Schema
const deletePodcastCommentSchema = z.object({
  params: z.object({
    commentId: z.string()
      .uuid('Invalid comment ID'),
  }),
});

// ==================== TRANSCRIPT SCHEMAS ====================

// Add Transcript Schema
const addTranscriptSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
  body: z.object({
    content: z.string()
      .min(100, 'Transcript must be at least 100 characters')
      .max(100000, 'Transcript too large'),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .default('en'),
  }),
});

// Update Transcript Schema
const updateTranscriptSchema = z.object({
  params: z.object({
    episodeId: z.string()
      .uuid('Invalid episode ID'),
  }),
  body: z.object({
    content: z.string()
      .min(100, 'Transcript must be at least 100 characters')
      .max(100000, 'Transcript too large')
      .optional(),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .optional(),
  }),
});

// ==================== STATS SCHEMAS ====================

// Get Podcast Stats Schema
const getPodcastStatsSchema = z.object({
  params: z.object({
    podcastId: z.string()
      .uuid('Invalid podcast ID'),
  }),
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

export {
  // Podcast schemas
  createPodcastSchema,
  updatePodcastSchema,
  getPodcastsQuerySchema,
  getPodcastParamSchema,
  deletePodcastSchema,
  
  // Episode schemas
  createEpisodeSchema,
  updateEpisodeSchema,
  getEpisodesQuerySchema,
  getEpisodeParamSchema,
  deleteEpisodeSchema,
  
  // Listen tracking schemas
  trackListenSchema,
  getListenStatsSchema,
  
  // Subscription schemas
  subscribeSchema,
  getSubscribersQuerySchema,
  
  // Comment schemas
  createPodcastCommentSchema,
  updatePodcastCommentSchema,
  getPodcastCommentsQuerySchema,
  deletePodcastCommentSchema,
  
  // Transcript schemas
  addTranscriptSchema,
  updateTranscriptSchema,
  
  // Stats schemas
  getPodcastStatsSchema,
};