import { z } from 'zod';

// Custom validation functions
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const taxIdRegex = /^[A-Z0-9\-]{6,20}$/;

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

const organizationIdParamSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
});

// Create Organization Schema
const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name cannot exceed 100 characters')
      .regex(/^[a-zA-Z0-9\s\-&.]+$/, 'Organization name can only contain letters, numbers, spaces, and &.-'),
    email: z.string()
      .email('Invalid email address')
      .min(5, 'Email too short')
      .max(255, 'Email too long'),
    phone: z.string()
      .regex(phoneRegex, 'Invalid phone number format. Use international format (e.g., +1234567890)'),
    type: z.enum(['COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO']),
    description: z.string()
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    website: z.string()
      .regex(urlRegex, 'Invalid website URL')
      .optional(),
    address: z.string()
      .max(500, 'Address cannot exceed 500 characters')
      .optional(),
    city: z.string()
      .max(100, 'City name too long')
      .optional(),
    country: z.string()
      .max(100, 'Country name too long')
      .optional(),
    taxId: z.string()
      .regex(taxIdRegex, 'Invalid Tax ID format')
      .optional(),
    metadata: z.record(z.any())
      .optional(),
    admin: z.object({
      email: z.string()
        .email('Invalid admin email'),
      phone: z.string()
        .regex(phoneRegex, 'Invalid admin phone number'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      unom: z.string()
        .min(1, 'Admin first name is required')
        .max(250, 'First name too long'),
      uprenom: z.string()
        .min(1, 'Admin last name is required')
        .max(250, 'Last name too long'),
      username: z.string()
        .regex(/^[a-zA-Z0-9_]{3,30}$/, 'Username must be 3-30 characters and can only contain letters, numbers, and underscore')
        .optional(),
    }),
  }),
});

// Update Organization Schema
const updateOrganizationSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name cannot exceed 100 characters')
      .regex(/^[a-zA-Z0-9\s\-&.]+$/, 'Organization name can only contain letters, numbers, spaces, and &.-')
      .optional(),
    email: z.string()
      .email('Invalid email address')
      .optional(),
    phone: z.string()
      .regex(phoneRegex, 'Invalid phone number format')
      .optional(),
    description: z.string()
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional(),
    website: z.string()
      .regex(urlRegex, 'Invalid website URL')
      .optional(),
    logo: z.string()
      .url('Invalid logo URL')
      .optional(),
    coverImage: z.string()
      .url('Invalid cover image URL')
      .optional(),
    address: z.string()
      .max(500, 'Address cannot exceed 500 characters')
      .optional(),
    city: z.string()
      .max(100, 'City name too long')
      .optional(),
    country: z.string()
      .max(100, 'Country name too long')
      .optional(),
    taxId: z.string()
      .regex(taxIdRegex, 'Invalid Tax ID format')
      .optional(),
    metadata: z.record(z.any())
      .optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Add Department Schema
const addDepartmentSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name too long')
      .regex(/^[a-zA-Z0-9\s\-&]+$/, 'Department name can only contain letters, numbers, spaces, and &-'),
    description: z.string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    parentDeptId: z.string()
      .uuid('Invalid parent department ID')
      .optional(),
    headUserId: z.string()
      .uuid('Invalid user ID')
      .optional(),
  }),
});

// Update Department Schema
const updateDepartmentSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
    deptId: z.string()
      .uuid('Invalid department ID'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name too long')
      .optional(),
    description: z.string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    parentDeptId: z.string()
      .uuid('Invalid parent department ID')
      .nullable()
      .optional(),
    headUserId: z.string()
      .uuid('Invalid user ID')
      .nullable()
      .optional(),
  }),
});

// Add Member Schema
const addMemberSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  body: z.object({
    userId: z.string()
      .uuid('Invalid user ID'),
    role: z.enum(['MEMBER', 'MANAGER', 'ADMIN'])
      .default('MEMBER'),
    departmentId: z.string()
      .uuid('Invalid department ID')
      .optional(),
    title: z.string()
      .max(100, 'Job title too long')
      .optional(),
  }),
});

// Update Member Schema
const updateMemberSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
    userId: z.string()
      .uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'])
      .optional(),
    departmentId: z.string()
      .uuid('Invalid department ID')
      .nullable()
      .optional(),
    title: z.string()
      .max(100, 'Job title too long')
      .optional(),
    isPrimaryContact: z.boolean()
      .optional(),
  }),
});

// Submit Review Schema
const submitReviewSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  body: z.object({
    rating: z.number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(250, 'Title cannot exceed 250 characters'),
    review: z.string()
      .min(10, 'Review must be at least 10 characters')
      .max(5000, 'Review cannot exceed 5000 characters'),
    pros: z.array(z.string())
      .max(10, 'Maximum 10 pros allowed')
      .max(100, 'Each pro cannot exceed 100 characters', { path: ['pros'] })
      .optional(),
    cons: z.array(z.string())
      .max(10, 'Maximum 10 cons allowed')
      .max(100, 'Each con cannot exceed 100 characters', { path: ['cons'] })
      .optional(),
    isAnonymous: z.boolean()
      .default(false),
  }),
});

// Update Review Schema (Admin/Moderator)
const updateReviewSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
    reviewId: z.string()
      .uuid('Invalid review ID'),
  }),
  body: z.object({
    isApproved: z.boolean()
      .optional(),
    moderationNote: z.string()
      .max(500, 'Moderation note too long')
      .optional(),
  }),
});

// Get Organizations Query Schema
const getOrganizationsQuerySchema = z.object({
  query: paginationSchema.extend({
    search: z.string()
      .min(2, 'Search query must be at least 2 characters')
      .max(100, 'Search query too long')
      .optional(),
    type: z.enum(['COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
      .optional(),
    status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'])
      .optional(),
    city: z.string()
      .max(100, 'City name too long')
      .optional(),
    country: z.string()
      .max(100, 'Country name too long')
      .optional(),
    hasJobs: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    minRating: z.string()
      .regex(/^[1-5]$/, 'Rating must be between 1 and 5')
      .transform(Number)
      .optional(),
    sortBy: z.enum(['name', 'createdAt', 'rating', 'memberCount', 'jobCount'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Organization Statistics Schema
const getOrganizationStatsSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

// Get Organization Reviews Query Schema
const getReviewsQuerySchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1')
      .pipe(z.number().int().positive()),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20')
      .pipe(z.number().int().min(1).max(50)),
    rating: z.string()
      .regex(/^[1-5]$/, 'Rating must be between 1 and 5')
      .transform(Number)
      .optional(),
    hasComment: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    sortBy: z.enum(['rating', 'createdAt', 'helpful'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc'),
  }),
});

// Get Organization Members Query Schema
const getMembersQuerySchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
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
    role: z.enum(['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'])
      .optional(),
    departmentId: z.string()
      .uuid('Invalid department ID')
      .optional(),
    search: z.string()
      .min(2, 'Search query must be at least 2 characters')
      .optional(),
  }),
});

// Get Organization Departments Query Schema
const getDepartmentsQuerySchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  query: z.object({
    includeMembers: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .default('false'),
    includeSubDepartments: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .default('true'),
  }),
});

// Verify Organization Schema (Admin only)
const verifyOrganizationSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  body: z.object({
    verified: z.boolean(),
    verificationNote: z.string()
      .max(500, 'Verification note too long')
      .optional(),
  }),
});

// Batch Organization Action Schema (Admin only)
const batchOrganizationActionSchema = z.object({
  body: z.object({
    orgIds: z.array(z.string().uuid('Invalid organization ID'))
      .min(1, 'At least one organization ID is required')
      .max(50, 'Maximum 50 organizations per batch'),
    action: z.enum(['activate', 'suspend', 'ban', 'verify', 'delete']),
    reason: z.string()
      .max(500, 'Reason too long')
      .optional(),
  }),
});

// Export Organization Stats Schema
const exportOrganizationStatsSchema = z.object({
  params: z.object({
    orgId: z.string()
      .uuid('Invalid organization ID'),
  }),
  query: z.object({
    format: z.enum(['csv', 'json', 'pdf'])
      .default('json'),
    startDate: z.string()
      .datetime()
      .optional(),
    endDate: z.string()
      .datetime()
      .optional(),
    includeMetrics: z.array(z.enum([
      'members', 'jobs', 'applications', 'reviews', 'revenue', 'engagement'
    ])).optional(),
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, { message: 'startDate must be less than or equal to endDate' }),
});

export {
  createOrganizationSchema,
  updateOrganizationSchema,
  addDepartmentSchema,
  updateDepartmentSchema,
  addMemberSchema,
  updateMemberSchema,
  submitReviewSchema,
  updateReviewSchema,
  getOrganizationsQuerySchema,
  organizationIdParamSchema,
  getOrganizationStatsSchema,
  getReviewsQuerySchema,
  getMembersQuerySchema,
  getDepartmentsQuerySchema,
  verifyOrganizationSchema,
  batchOrganizationActionSchema,
  exportOrganizationStatsSchema,
};