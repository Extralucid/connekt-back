import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';

class JobService {
  // ==================== JOB CRUD OPERATIONS ====================
  
  static async createJob(employerId, jobData, organizationId = null) {
    const { categoryIds, skillIds, ...data } = jobData;
    
    const job = await prisma.job.create({
      data: {
        job_id: uuidv4(),
        employerId,
        ...(organizationId && { sponsoredById: organizationId }),
        title: data.title,
        description: data.description,
        jobType: data.jobType,
        location: data.location,
        remote: data.remote,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryCurrency: data.salaryCurrency,
        expiryDate: new Date(data.expiryDate),
        isPromoted: data.isPromoted || false,
        categories: {
          create: categoryIds.map(categoryId => ({
            categorie: { connect: { cat_id: categoryId } }
          }))
        },
        ...(skillIds && skillIds.length > 0 && {
          skills: {
            create: skillIds.map(skillId => ({
              skill: { connect: { skill_id: skillId } }
            }))
          }
        }),
      },
      include: {
        employer: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            email: true,
          },
        },
        categories: {
          include: {
            categorie: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
    
    // Clear cache
    await redis.del('jobs:list:*');
    await redis.del(`employer:${employerId}:jobs:*`);
    
    return job;
  }
  
  static async getJobById(jobId, incrementView = true) {
    const cacheKey = `job:${jobId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached && !incrementView) {
      return JSON.parse(cached);
    }
    
    const job = await prisma.job.findUnique({
      where: { job_id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            email: true,
            bio: true,
            companyReview: {
              where: { isApproved: true },
              select: {
                rating: true,
                review: true,
              },
            },
          },
        },
        categories: {
          include: {
            categorie: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        applications: {
          where: { status: { not: 'REJECTED' } },
          select: {
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            applications: true,
            bookmarks: true,
          },
        },
      },
    });
    
    if (!job) return null;
    
    // Calculate average rating
    if (job.employer.companyReview && job.employer.companyReview.length > 0) {
      const totalRating = job.employer.companyReview.reduce((sum, review) => sum + review.rating, 0);
      job.employer.averageRating = totalRating / job.employer.companyReview.length;
      delete job.employer.companyReview;
    }
    
    // Increment view count
    if (incrementView) {
      await prisma.job.update({
        where: { job_id: jobId },
        data: { views: { increment: 1 } },
      });
      job.views += 1;
      
      // Track view
      await prisma.jobView.create({
        data: {
          job_view_id: uuidv4(),
          jobId,
        },
      });
    }
    
    await redis.setex(cacheKey, 300, JSON.stringify(job));
    
    return job;
  }
  
  static async updateJob(jobId, employerId, updateData) {
    const job = await prisma.job.findUnique({
      where: { job_id: jobId },
      select: { employerId: true },
    });
    
    if (!job) throw new Error('Job not found');
    if (job.employerId !== employerId) {
      throw new Error('Unauthorized to update this job');
    }
    
    const { categoryIds, skillIds, ...data } = updateData;
    
    const updatedJob = await prisma.job.update({
      where: { job_id: jobId },
      data: {
        ...data,
        ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
        updatedAt: new Date(),
        ...(categoryIds && {
          categories: {
            deleteMany: {},
            create: categoryIds.map(categoryId => ({
              categorie: { connect: { cat_id: categoryId } }
            }))
          }
        }),
        ...(skillIds && {
          skills: {
            deleteMany: {},
            create: skillIds.map(skillId => ({
              skill: { connect: { skill_id: skillId } }
            }))
          }
        }),
      },
      include: {
        categories: { include: { categorie: true } },
        skills: { include: { skill: true } },
      },
    });
    
    // Clear cache
    await redis.del(`job:${jobId}`);
    await redis.del('jobs:list:*');
    await redis.del(`employer:${employerId}:jobs:*`);
    
    return updatedJob;
  }
  
  static async deleteJob(jobId, employerId, isAdmin = false) {
    const job = await prisma.job.findUnique({
      where: { job_id: jobId },
      select: { employerId: true },
    });
    
    if (!job) throw new Error('Job not found');
    if (job.employerId !== employerId && !isAdmin) {
      throw new Error('Unauthorized to delete this job');
    }
    
    await prisma.job.delete({
      where: { job_id: jobId },
    });
    
    // Clear cache
    await redis.del(`job:${jobId}`);
    await redis.del('jobs:list:*');
    await redis.del(`employer:${employerId}:jobs:*`);
    
    return true;
  }
  
  static async getAllJobs(filters, pagination, userId = null) {
    const {
      search,
      jobType,
      location,
      remote,
      categoryId,
      skillId,
      employerId,
      salaryMin,
      salaryMax,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = {
      expiryDate: { gt: new Date() },
    };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (jobType) where.jobType = jobType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (remote !== undefined) where.remote = remote;
    if (employerId) where.employerId = employerId;
    
    if (salaryMin || salaryMax) {
      where.salaryMin = {};
      where.salaryMax = {};
      if (salaryMin) where.salaryMin.gte = salaryMin;
      if (salaryMax) where.salaryMax.lte = salaryMax;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    if (categoryId) {
      where.categories = { some: { categorieId: categoryId } };
    }
    
    if (skillId) {
      where.skills = { some: { skillId } };
    }
    
    // Cache key for identical queries
    const cacheKey = `jobs:list:${JSON.stringify({ where, skip, limit, sortBy, sortOrder })}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employer: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
          categories: {
            include: {
              categorie: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          _count: {
            select: {
              applications: true,
              bookmarks: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);
    
    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 120, JSON.stringify(result));
    
    return result;
  }
  
  static async getEmployerJobs(employerId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `employer:${employerId}:jobs:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { employerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { categorie: true } },
          skills: { include: { skill: true } },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where: { employerId } }),
    ]);
    
    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  // ==================== APPLICATION MANAGEMENT ====================
  
  static async applyForJob(jobId, userId, applicationData) {
    const job = await prisma.job.findUnique({
      where: { job_id: jobId },
      select: { expiryDate: true, employerId: true, title: true },
    });
    
    if (!job) throw new Error('Job not found');
    if (new Date(job.expiryDate) < new Date()) {
      throw new Error('Job has expired');
    }
    
    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: { jobId, userId },
    });
    
    if (existingApplication) {
      throw new Error('You have already applied for this job');
    }
    
    const application = await prisma.application.create({
      data: {
        app_id: uuidv4(),
        jobId,
        userId,
        coverLetter: applicationData.coverLetter,
        status: 'PENDING',
        documents: {
          create: applicationData.documentIds.map(docId => ({
            document: { connect: { iddocument: docId } }
          }))
        },
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            email: true,
            phone: true,
            profile_picture_url: true,
          },
        },
        documents: {
          include: {
            document: true,
          },
        },
      },
    });
    
    // Update job application count
    await prisma.job.update({
      where: { job_id: jobId },
      data: { applicationsCount: { increment: 1 } },
    });
    
    // Create notification for employer
    await prisma.notification.create({
      data: {
        notification_id: uuidv4(),
        userId: job.employerId,
        type: 'JOB_ALERT',
        title: 'New Job Application',
        message: `${application.user.display_name} applied for "${job.title}"`,
        data: {
          jobId,
          applicationId: application.app_id,
        },
      },
    });
    
    // Clear cache
    await redis.del(`job:${jobId}`);
    await redis.del(`employer:${job.employerId}:jobs:*`);
    
    return application;
  }
  
  static async getApplications(userId, filters, pagination, isEmployer = false) {
    const { status, jobId } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (isEmployer) {
      const employerJobs = await prisma.job.findMany({
        where: { employerId: userId },
        select: { job_id: true },
      });
      const jobIds = employerJobs.map(j => j.job_id);
      where.jobId = { in: jobIds };
      if (jobId) where.jobId = jobId;
    } else {
      where.userId = userId;
    }
    
    if (status) where.status = status;
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              job_id: true,
              title: true,
              location: true,
              jobType: true,
              salaryMin: true,
              salaryMax: true,
              employer: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
            },
          },
          user: isEmployer ? {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
              profile_picture_url: true,
              bio: true,
            },
          } : undefined,
          documents: {
            include: {
              document: true,
            },
          },
          ApplicationEvent: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.application.count({ where }),
    ]);
    
    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  static async updateApplicationStatus(applicationId, employerId, updateData) {
    const application = await prisma.application.findUnique({
      where: { app_id: applicationId },
      include: {
        job: {
          select: { employerId: true, title: true },
        },
        user: {
          select: { id: true, display_name: true },
        },
      },
    });
    
    if (!application) throw new Error('Application not found');
    if (application.job.employerId !== employerId) {
      throw new Error('Unauthorized to update this application');
    }
    
    const updatedApplication = await prisma.application.update({
      where: { app_id: applicationId },
      data: {
        status: updateData.status,
        updatedAt: new Date(),
      },
    });
    
    // Add application event
    await prisma.applicationEvent.create({
      data: {
        app_event_id: uuidv4(),
        applicationId,
        type: 'STATUS_CHANGE',
        message: updateData.notes || `Application status changed to ${updateData.status}`,
        createdBy: employerId,
      },
    });
    
    // Create notification for applicant
    await prisma.notification.create({
      data: {
        notification_id: uuidv4(),
        userId: application.user.id,
        type: 'JOB_ALERT',
        title: 'Application Status Update',
        message: `Your application for "${application.job.title}" has been ${updateData.status.toLowerCase()}`,
        data: {
          applicationId,
          status: updateData.status,
        },
      },
    });
    
    return updatedApplication;
  }
  
  // ==================== BOOKMARK MANAGEMENT ====================
  
  static async bookmarkJob(jobId, userId) {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });
    
    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return { bookmarked: false, message: 'Job removed from bookmarks' };
    }
    
    const bookmark = await prisma.bookmark.create({
      data: {
        id: uuidv4(),
        userId,
        jobId,
      },
    });
    
    return { bookmarked: true, message: 'Job bookmarked successfully', bookmark };
  }
  
  static async getBookmarkedJobs(userId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            include: {
              employer: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
              categories: {
                include: {
                  categorie: true,
                },
              },
              _count: {
                select: { applications: true },
              },
            },
          },
        },
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);
    
    return {
      bookmarks: bookmarks.map(b => ({ ...b.job, bookmarkedAt: b.createdAt })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    
    const category = await prisma.categorie.create({
      data: {
        cat_id: uuidv4(),
        name: categoryData.name,
        slug,
        description: categoryData.description,
      },
    });
    
    await redis.del('job:categories:all');
    
    return category;
  }
  
  static async getAllCategories() {
    const cached = await redis.get('job:categories:all');
    if (cached) return JSON.parse(cached);
    
    const categories = await prisma.categorie.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await redis.setex('job:categories:all', 3600, JSON.stringify(categories));
    
    return categories;
  }
  
  // ==================== SKILL MANAGEMENT ====================
  
  static async createSkill(skillData) {
    let slug = skillData.slug;
    if (!slug) {
      slug = skillData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const skill = await prisma.skill.create({
      data: {
        skill_id: uuidv4(),
        name: skillData.name,
        slug,
        description: skillData.description,
      },
    });
    
    await redis.del('job:skills:all');
    
    return skill;
  }
  
  static async getAllSkills() {
    const cached = await redis.get('job:skills:all');
    if (cached) return JSON.parse(cached);
    
    const skills = await prisma.skill.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await redis.setex('job:skills:all', 3600, JSON.stringify(skills));
    
    return skills;
  }
  
  // ==================== JOB ALERT MANAGEMENT ====================
  
  static async createJobAlert(userId, alertData) {
    const alert = await prisma.jobAlert.create({
      data: {
        jobalert_id: uuidv4(),
        userId,
        keywords: alertData.keywords,
        frequency: alertData.frequency,
        isActive: true,
        ...(alertData.categoryIds && {
          categories: {
            connect: alertData.categoryIds.map(id => ({ cat_id: id })),
          },
        }),
      },
      include: {
        categories: true,
      },
    });
    
    return alert;
  }
  
  static async getUserJobAlerts(userId) {
    const alerts = await prisma.jobAlert.findMany({
      where: { userId },
      include: {
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return alerts;
  }
  
  static async updateJobAlert(alertId, userId, updateData) {
    const alert = await prisma.jobAlert.findFirst({
      where: { jobalert_id: alertId, userId },
    });
    
    if (!alert) throw new Error('Job alert not found');
    
    const updatedAlert = await prisma.jobAlert.update({
      where: { jobalert_id: alertId },
      data: {
        ...updateData,
        ...(updateData.categoryIds && {
          categories: {
            set: updateData.categoryIds.map(id => ({ cat_id: id })),
          },
        }),
      },
      include: {
        categories: true,
      },
    });
    
    return updatedAlert;
  }
  
  static async deleteJobAlert(alertId, userId) {
    const alert = await prisma.jobAlert.findFirst({
      where: { jobalert_id: alertId, userId },
    });
    
    if (!alert) throw new Error('Job alert not found');
    
    await prisma.jobAlert.delete({
      where: { jobalert_id: alertId },
    });
    
    return true;
  }
  
  // ==================== COMPANY REVIEWS ====================
  
  static async createCompanyReview(employerId, userId, reviewData) {
    // Check if user has worked with this employer (has applied to jobs)
    const hasApplied = await prisma.application.findFirst({
      where: {
        userId,
        job: { employerId },
        status: { in: ['INTERVIEW', 'HIRED'] },
      },
    });
    
    if (!hasApplied) {
      throw new Error('You can only review companies you have interacted with');
    }
    
    // Check if already reviewed
    const existingReview = await prisma.companyReview.findFirst({
      where: { userId, employerId },
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this company');
    }
    
    const review = await prisma.companyReview.create({
      data: {
        review_id: uuidv4(),
        rating: reviewData.rating,
        title: reviewData.title,
        review: reviewData.review,
        pros: reviewData.pros || [],
        cons: reviewData.cons || [],
        userId,
        employerId,
        isApproved: false, // Requires moderation
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    return review;
  }
  
  static async getCompanyReviews(employerId, filters, pagination) {
    const { rating, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = {
      employerId,
      isApproved: true,
    };
    
    if (rating) where.rating = rating;
    
    const [reviews, total] = await Promise.all([
      prisma.companyReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
        },
      }),
      prisma.companyReview.count({ where }),
    ]);
    
    // Calculate average rating
    const avgRating = await prisma.companyReview.aggregate({
      where: { employerId, isApproved: true },
      _avg: { rating: true },
    });
    
    return {
      reviews,
      averageRating: avgRating._avg.rating || 0,
      totalReviews: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  // ==================== STATISTICS ====================
  
  static async getJobStats(jobId) {
    const stats = await prisma.job.findUnique({
      where: { job_id: jobId },
      select: {
        views: true,
        applicationsCount: true,
        applications: {
          select: {
            status: true,
          },
        },
        bookmarks: {
          select: {
            id: true,
          },
        },
      },
    });
    
    if (!stats) throw new Error('Job not found');
    
    const statusCounts = stats.applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      views: stats.views,
      applications: stats.applicationsCount,
      bookmarks: stats.bookmarks.length,
      applicationBreakdown: statusCounts,
      conversionRate: stats.views > 0 
        ? ((stats.applicationsCount / stats.views) * 100).toFixed(2)
        : 0,
    };
  }
  
  static async getEmployerStats(employerId, period = 'month') {
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        dateFilter = {};
    }
    
    const [jobs, applications, reviews, views] = await Promise.all([
      prisma.job.aggregate({
        where: { employerId },
        _count: true,
      }),
      prisma.application.aggregate({
        where: {
          job: { employerId },
          createdAt: dateFilter,
        },
        _count: true,
      }),
      prisma.companyReview.aggregate({
        where: {
          employerId,
          isApproved: true,
          createdAt: dateFilter,
        },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.jobView.aggregate({
        where: {
          job: { employerId },
          viewedAt: dateFilter,
        },
        _count: true,
      }),
    ]);
    
    return {
      period,
      totalJobs: jobs._count,
      totalApplications: applications._count,
      totalReviews: reviews._count,
      averageRating: reviews._avg.rating || 0,
      totalViews: views._count,
      applicationRate: jobs._count > 0 
        ? (applications._count / jobs._count).toFixed(2)
        : 0,
    };
  }
}

export default JobService;