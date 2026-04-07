import { z } from 'zod';

// Custom validations
const salaryRangeRegex = /^\d+-\d+$|^\d+\+$|^\d+k-\d+k$|^\d+k\+$/;
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// ==================== JOB SCHEMAS ====================

// Create Job Schema
const createJobSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Job title must be at least 5 characters')
      .max(250, 'Job title cannot exceed 250 characters'),
    description: z.string()
      .min(50, 'Job description must be at least 50 characters')
      .max(50000, 'Job description cannot exceed 50000 characters'),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])
      .default('FULL_TIME'),
    location: z.string()
      .max(250, 'Location too long')
      .optional(),
    remote: z.boolean()
      .default(false),
    salaryMin: z.number()
      .int()
      .min(0, 'Minimum salary must be at least 0')
      .optional(),
    salaryMax: z.number()
      .int()
      .min(0, 'Maximum salary must be at least 0')
      .optional(),
    salaryCurrency: z.string()
      .length(3, 'Currency code must be 3 characters')
      .default('USD'),
    expiryDate: z.string()
      .datetime()
      .refine(date => new Date(date) > new Date(), {
        message: 'Expiry date must be in the future',
      }),
    categoryIds: z.array(z.string().uuid())
      .min(1, 'At least one category is required')
      .max(10, 'Maximum 10 categories allowed'),
    skillIds: z.array(z.string().uuid())
      .max(20, 'Maximum 20 skills allowed')
      .optional(),
    isPromoted: z.boolean()
      .default(false),
  }).refine(data => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  }, {
    message: 'Minimum salary must be less than or equal to maximum salary',
    path: ['salaryRange'],
  }),
});

// Update Job Schema
const updateJobSchema = z.object({
  params: z.object({
    jobId: z.string()
      .uuid('Invalid job ID'),
  }),
  body: z.object({
    title: z.string()
      .min(5, 'Job title must be at least 5 characters')
      .max(250, 'Job title cannot exceed 250 characters')
      .optional(),
    description: z.string()
      .min(50, 'Job description must be at least 50 characters')
      .max(50000, 'Job description cannot exceed 50000 characters')
      .optional(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])
      .optional(),
    location: z.string()
      .max(250, 'Location too long')
      .optional(),
    remote: z.boolean()
      .optional(),
    salaryMin: z.number()
      .int()
      .min(0)
      .optional(),
    salaryMax: z.number()
      .int()
      .min(0)
      .optional(),
    salaryCurrency: z.string()
      .length(3)
      .optional(),
    expiryDate: z.string()
      .datetime()
      .optional(),
    isActive: z.boolean()
      .optional(),
    isPromoted: z.boolean()
      .optional(),
  }),
});

// Get Jobs Query Schema
const getJobsQuerySchema = z.object({
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
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])
      .optional(),
    location: z.string()
      .optional(),
    remote: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    categoryId: z.string()
      .uuid('Invalid category ID')
      .optional(),
    skillId: z.string()
      .uuid('Invalid skill ID')
      .optional(),
    employerId: z.string()
      .uuid('Invalid employer ID')
      .optional(),
    salaryMin: z.string()
      .regex(/^\d+$/, 'Must be a number')
      .transform(Number)
      .optional(),
    salaryMax: z.string()
      .regex(/^\d+$/, 'Must be a number')
      .transform(Number)
      .optional(),
    dateFrom: z.string()
      .datetime()
      .optional(),
    dateTo: z.string()
      .datetime()
      .optional(),
    sortBy: z.enum(['createdAt', 'salaryMin', 'salaryMax', 'expiryDate', 'views'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Job By ID Schema
const getJobParamSchema = z.object({
  params: z.object({
    jobId: z.string()
      .uuid('Invalid job ID'),
  }),
});

// Delete Job Schema
const deleteJobSchema = z.object({
  params: z.object({
    jobId: z.string()
      .uuid('Invalid job ID'),
  }),
});

// ==================== APPLICATION SCHEMAS ====================

// Apply for Job Schema
const applyForJobSchema = z.object({
  body: z.object({
    coverLetter: z.string()
      .min(50, 'Cover letter must be at least 50 characters')
      .max(5000, 'Cover letter cannot exceed 5000 characters'),
    documentIds: z.array(z.string().uuid())
      .min(1, 'At least one document is required')
      .max(5, 'Maximum 5 documents allowed'),
  }),
  params: z.object({
    jobId: z.string()
      .uuid('Invalid job ID'),
  }),
});

// Update Application Status Schema (Employer/Admin)
const updateApplicationStatusSchema = z.object({
  params: z.object({
    applicationId: z.string()
      .uuid('Invalid application ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'REVIEWED', 'REJECTED', 'INTERVIEW', 'HIRED']),
    notes: z.string()
      .max(1000, 'Notes too long')
      .optional(),
    interviewDate: z.string()
      .datetime()
      .optional(),
  }),
});

// Get Applications Query Schema
const getApplicationsQuerySchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20'),
    status: z.enum(['PENDING', 'REVIEWED', 'REJECTED', 'INTERVIEW', 'HIRED'])
      .optional(),
    jobId: z.string()
      .uuid('Invalid job ID')
      .optional(),
  }),
});

// ==================== CATEGORY & SKILL SCHEMAS ====================

// Create Category Schema
const createJobCategorySchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(250, 'Category name too long'),
    slug: z.string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// Create Skill Schema
const createSkillSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Skill name must be at least 2 characters')
      .max(250, 'Skill name too long'),
    slug: z.string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// ==================== JOB ALERT SCHEMAS ====================

// Create Job Alert Schema
const createJobAlertSchema = z.object({
  body: z.object({
    keywords: z.array(z.string())
      .min(1, 'At least one keyword is required')
      .max(10, 'Maximum 10 keywords allowed'),
    categoryIds: z.array(z.string().uuid())
      .max(10, 'Maximum 10 categories allowed')
      .optional(),
    frequency: z.enum(['INSTANT', 'DAILY', 'WEEKLY'])
      .default('DAILY'),
  }),
});

// Update Job Alert Schema
const updateJobAlertSchema = z.object({
  params: z.object({
    alertId: z.string()
      .uuid('Invalid alert ID'),
  }),
  body: z.object({
    keywords: z.array(z.string())
      .min(1, 'At least one keyword is required')
      .max(10, 'Maximum 10 keywords allowed')
      .optional(),
    categoryIds: z.array(z.string().uuid())
      .max(10, 'Maximum 10 categories allowed')
      .optional(),
    frequency: z.enum(['INSTANT', 'DAILY', 'WEEKLY'])
      .optional(),
    isActive: z.boolean()
      .optional(),
  }),
});

// ==================== COMPANY REVIEW SCHEMAS ====================

// Create Company Review Schema
const createCompanyReviewSchema = z.object({
  params: z.object({
    employerId: z.string()
      .uuid('Invalid employer ID'),
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
    pros: z.array(z.string())
      .max(10, 'Maximum 10 pros allowed')
      .optional(),
    cons: z.array(z.string())
      .max(10, 'Maximum 10 cons allowed')
      .optional(),
  }),
});

// Get Company Reviews Query Schema
const getCompanyReviewsQuerySchema = z.object({
  params: z.object({
    employerId: z.string()
      .uuid('Invalid employer ID'),
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

// ==================== STATS SCHEMAS ====================

// Get Job Stats Schema
const getJobStatsSchema = z.object({
  params: z.object({
    jobId: z.string()
      .uuid('Invalid job ID'),
  }),
});

// Get Employer Stats Schema
const getEmployerStatsSchema = z.object({
  params: z.object({
    employerId: z.string()
      .uuid('Invalid employer ID'),
  }),
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

export {
  // Job schemas
  createJobSchema,
  updateJobSchema,
  getJobsQuerySchema,
  getJobParamSchema,
  deleteJobSchema,
  
  // Application schemas
  applyForJobSchema,
  updateApplicationStatusSchema,
  getApplicationsQuerySchema,
  
  // Category & Skill schemas
  createJobCategorySchema,
  createSkillSchema,
  
  // Job Alert schemas
  createJobAlertSchema,
  updateJobAlertSchema,
  
  // Review schemas
  createCompanyReviewSchema,
  getCompanyReviewsQuerySchema,
  
  // Stats schemas
  getJobStatsSchema,
  getEmployerStatsSchema,
};