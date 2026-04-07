import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';
import crypto  from 'crypto';

class TutorialService {
  // ==================== TUTORIAL CRUD OPERATIONS ====================
  
  static async createTutorial(authorId, tutorialData) {
    const { categoryIds, prerequisites, learningOutcomes, ...data } = tutorialData;
    
    // Generate slug from title
    let slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure unique slug
    let existingTutorial = await prisma.tutorial.findFirst({
      where: { slug, isDeleted: false },
    });
    let counter = 1;
    while (existingTutorial) {
      slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
      existingTutorial = await prisma.tutorial.findFirst({
        where: { slug, isDeleted: false },
      });
      counter++;
    }
    
    const tutorial = await prisma.tutorial.create({
      data: {
        tutorial_id: uuidv4(),
        slug,
        authorId,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        difficulty: data.difficulty,
        duration: data.duration,
        prerequisites: prerequisites || [],
        learningOutcomes: learningOutcomes,
        price: data.price || 0,
        certificateEnabled: data.certificateEnabled || false,
        categories: {
          create: categoryIds.map(categoryId => ({
            tutorialCategory: { connect: { tutcat_id: categoryId } }
          }))
        },
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
        categories: {
          include: {
            tutorialCategory: true,
          },
        },
      },
    });
    
    await redis.del('tutorials:list:*');
    
    return tutorial;
  }
  
  static async getTutorialById(tutorialId, userId = null) {
    const cacheKey = `tutorial:${tutorialId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const tutorial = await prisma.tutorial.findUnique({
      where: { tutorial_id: tutorialId, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
            bio: true,
          },
        },
        categories: {
          include: {
            tutorialCategory: true,
          },
        },
        sections: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' },
          select: {
            tutsection_id: true,
            title: true,
            content: true,
            videoUrl: true,
            order: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            TutorialProgress: true,
            sections: true,
          },
        },
      },
    });
    
    if (!tutorial) return null;
    
    // Get user progress if logged in
    if (userId) {
      const progress = await prisma.tutorialProgress.findUnique({
        where: {
          userId_tutorialId: {
            userId,
            tutorialId,
          },
        },
      });
      tutorial.userProgress = progress;
    }
    
    // Calculate average rating
    const reviews = await prisma.tutorialReview.aggregate({
      where: { tutorialId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    
    tutorial.averageRating = reviews._avg.rating || 0;
    tutorial.reviewCount = reviews._count;
    tutorial.enrollmentCount = tutorial._count.TutorialProgress;
    tutorial.sectionCount = tutorial._count.sections;
    
    delete tutorial._count;
    
    await redis.setex(cacheKey, 300, JSON.stringify(tutorial));
    
    return tutorial;
  }
  
  static async getTutorialBySlug(slug, userId = null) {
    const tutorial = await prisma.tutorial.findFirst({
      where: { slug, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
        categories: {
          include: {
            tutorialCategory: true,
          },
        },
        sections: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            TutorialProgress: true,
            sections: true,
          },
        },
      },
    });
    
    if (!tutorial) return null;
    
    if (userId) {
      const progress = await prisma.tutorialProgress.findUnique({
        where: {
          userId_tutorialId: {
            userId,
            tutorialId: tutorial.tutorial_id,
          },
        },
      });
      tutorial.userProgress = progress;
    }
    
    const reviews = await prisma.tutorialReview.aggregate({
      where: { tutorialId: tutorial.tutorial_id, isApproved: true },
      _avg: { rating: true },
    });
    
    tutorial.averageRating = reviews._avg.rating || 0;
    tutorial.enrollmentCount = tutorial._count.TutorialProgress;
    
    delete tutorial._count;
    
    return tutorial;
  }
  
  static async updateTutorial(tutorialId, authorId, updateData, isAdmin = false) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { tutorial_id: tutorialId },
      select: { authorId: true },
    });
    
    if (!tutorial) throw new Error('Tutorial not found');
    if (tutorial.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized to update this tutorial');
    }
    
    const { categoryIds, prerequisites, learningOutcomes, ...data } = updateData;
    
    const updatedTutorial = await prisma.tutorial.update({
      where: { tutorial_id: tutorialId },
      data: {
        ...data,
        updatedAt: new Date(),
        ...(prerequisites && { prerequisites }),
        ...(learningOutcomes && { learningOutcomes }),
        ...(categoryIds && {
          categories: {
            deleteMany: {},
            create: categoryIds.map(categoryId => ({
              tutorialCategory: { connect: { tutcat_id: categoryId } }
            }))
          }
        }),
      },
      include: {
        categories: {
          include: {
            tutorialCategory: true,
          },
        },
      },
    });
    
    await redis.del(`tutorial:${tutorialId}`);
    await redis.del('tutorials:list:*');
    
    return updatedTutorial;
  }
  
  static async deleteTutorial(tutorialId, authorId, isAdmin = false) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { tutorial_id: tutorialId },
      select: { authorId: true, slug: true },
    });
    
    if (!tutorial) throw new Error('Tutorial not found');
    if (tutorial.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized to delete this tutorial');
    }
    
    await prisma.tutorial.update({
      where: { tutorial_id: tutorialId },
      data: { isDeleted: true },
    });
    
    await redis.del(`tutorial:${tutorialId}`);
    await redis.del(`tutorial:${tutorial.slug}`);
    await redis.del('tutorials:list:*');
    
    return true;
  }
  
  static async getAllTutorials(filters, pagination, userId = null) {
    const {
      search,
      categoryId,
      difficulty,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = { isDeleted: false };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (difficulty) where.difficulty = difficulty;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    
    if (categoryId) {
      where.categories = { some: { tutorialCategoryId: categoryId } };
    }
    
    const cacheKey = `tutorials:list:${JSON.stringify({ where, skip, limit, sortBy, sortOrder })}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [tutorials, total] = await Promise.all([
      prisma.tutorial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
          categories: {
            include: {
              tutorialCategory: true,
            },
          },
          _count: {
            select: { TutorialProgress: true, sections: true },
          },
        },
      }),
      prisma.tutorial.count({ where }),
    ]);
    
    // Get ratings for each tutorial
    for (const tutorial of tutorials) {
      const reviews = await prisma.tutorialReview.aggregate({
        where: { tutorialId: tutorial.tutorial_id, isApproved: true },
        _avg: { rating: true },
      });
      tutorial.averageRating = reviews._avg.rating || 0;
      tutorial.enrollmentCount = tutorial._count.TutorialProgress;
      delete tutorial._count;
    }
    
    const result = {
      tutorials,
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
  
  static async getAuthorTutorials(authorId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const [tutorials, total] = await Promise.all([
      prisma.tutorial.findMany({
        where: { authorId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            include: {
              tutorialCategory: true,
            },
          },
          _count: {
            select: { TutorialProgress: true, sections: true },
          },
        },
      }),
      prisma.tutorial.count({ where: { authorId, isDeleted: false } }),
    ]);
    
    for (const tutorial of tutorials) {
      const reviews = await prisma.tutorialReview.aggregate({
        where: { tutorialId: tutorial.tutorial_id, isApproved: true },
        _avg: { rating: true },
      });
      tutorial.averageRating = reviews._avg.rating || 0;
      tutorial.enrollmentCount = tutorial._count.TutorialProgress;
      delete tutorial._count;
    }
    
    return {
      tutorials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  // ==================== TUTORIAL CATEGORY MANAGEMENT ====================
  
  static async createCategory(categoryData) {
    let slug = categoryData.slug;
    if (!slug) {
      slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const category = await prisma.tutorialCategory.create({
      data: {
        tutcat_id: uuidv4(),
        name: categoryData.name,
        slug,
        description: categoryData.description,
      },
    });
    
    await redis.del('tutorial:categories:all');
    
    return category;
  }
  
  static async getAllCategories() {
    const cached = await redis.get('tutorial:categories:all');
    if (cached) return JSON.parse(cached);
    
    const categories = await prisma.tutorialCategory.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { tutorials: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await redis.setex('tutorial:categories:all', 3600, JSON.stringify(categories));
    
    return categories;
  }
  
  static async updateCategory(categoryId, updateData) {
    const category = await prisma.tutorialCategory.update({
      where: { tutcat_id: categoryId },
      data: {
        ...updateData,
        ...(updateData.name && !updateData.slug && {
          slug: updateData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }),
      },
    });
    
    await redis.del('tutorial:categories:all');
    
    return category;
  }
  
  static async deleteCategory(categoryId) {
    // Check if category has tutorials
    const tutorialCount = await prisma.tutorialCategory.count({
      where: { tutcat_id: categoryId, tutorials: { some: {} } },
    });
    
    if (tutorialCount > 0) {
      throw new Error('Cannot delete category with associated tutorials');
    }
    
    await prisma.tutorialCategory.update({
      where: { tutcat_id: categoryId },
      data: { isDeleted: true },
    });
    
    await redis.del('tutorial:categories:all');
    
    return true;
  }
  
  // ==================== SECTION MANAGEMENT ====================
  
  static async createSection(tutorialId, authorId, sectionData) {
    // Verify ownership
    const tutorial = await prisma.tutorial.findUnique({
      where: { tutorial_id: tutorialId },
      select: { authorId: true },
    });
    
    if (!tutorial) throw new Error('Tutorial not found');
    if (tutorial.authorId !== authorId) {
      throw new Error('Unauthorized to add sections to this tutorial');
    }
    
    const section = await prisma.tutorialSection.create({
      data: {
        tutsection_id: uuidv4(),
        tutorialId,
        title: sectionData.title,
        content: sectionData.content,
        videoUrl: sectionData.videoUrl,
        order: sectionData.order,
      },
    });
    
    // Update tutorial duration
    await this.updateTutorialDuration(tutorialId);
    
    await redis.del(`tutorial:${tutorialId}`);
    await redis.del(`tutorial:${tutorialId}:sections:*`);
    
    return section;
  }
  
  static async getSections(tutorialId, pagination) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `tutorial:${tutorialId}:sections:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [sections, total] = await Promise.all([
      prisma.tutorialSection.findMany({
        where: { tutorialId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      prisma.tutorialSection.count({ where: { tutorialId, isDeleted: false } }),
    ]);
    
    const result = {
      sections,
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
  
  static async updateSection(sectionId, authorId, updateData) {
    const section = await prisma.tutorialSection.findUnique({
      where: { tutsection_id: sectionId },
      include: {
        tutorial: {
          select: { authorId: true, tutorial_id: true },
        },
      },
    });
    
    if (!section) throw new Error('Section not found');
    if (section.tutorial.authorId !== authorId) {
      throw new Error('Unauthorized to update this section');
    }
    
    const updatedSection = await prisma.tutorialSection.update({
      where: { tutsection_id: sectionId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
    
    await this.updateTutorialDuration(section.tutorial.tutorial_id);
    await redis.del(`tutorial:${section.tutorial.tutorial_id}`);
    await redis.del(`tutorial:${section.tutorial.tutorial_id}:sections:*`);
    
    return updatedSection;
  }
  
  static async deleteSection(sectionId, authorId, isAdmin = false) {
    const section = await prisma.tutorialSection.findUnique({
      where: { tutsection_id: sectionId },
      include: {
        tutorial: {
          select: { authorId: true, tutorial_id: true },
        },
      },
    });
    
    if (!section) throw new Error('Section not found');
    if (section.tutorial.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized to delete this section');
    }
    
    await prisma.tutorialSection.update({
      where: { tutsection_id: sectionId },
      data: { isDeleted: true },
    });
    
    await this.updateTutorialDuration(section.tutorial.tutorial_id);
    await redis.del(`tutorial:${section.tutorial.tutorial_id}`);
    await redis.del(`tutorial:${section.tutorial.tutorial_id}:sections:*`);
    
    return true;
  }
  
  static async reorderSections(tutorialId, authorId, sections) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { tutorial_id: tutorialId },
      select: { authorId: true },
    });
    
    if (!tutorial) throw new Error('Tutorial not found');
    if (tutorial.authorId !== authorId) {
      throw new Error('Unauthorized to reorder sections');
    }
    
    const updates = sections.map(section =>
      prisma.tutorialSection.update({
        where: { tutsection_id: section.sectionId },
        data: { order: section.order },
      })
    );
    
    await Promise.all(updates);
    
    await redis.del(`tutorial:${tutorialId}`);
    await redis.del(`tutorial:${tutorialId}:sections:*`);
    
    return true;
  }
  
  static async updateTutorialDuration(tutorialId) {
    const sections = await prisma.tutorialSection.findMany({
      where: { tutorialId, isDeleted: false },
      select: { duration: true },
    });
    
    // Calculate total duration (assuming each section has duration estimate)
    // For now, we'll just count sections * 5 minutes as estimate
    const totalDuration = sections.length * 5;
    
    await prisma.tutorial.update({
      where: { tutorial_id: tutorialId },
      data: { duration: totalDuration },
    });
  }
  
  // ==================== USER PROGRESS & ENROLLMENT ====================
  
  static async enrollInTutorial(userId, tutorialId) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { tutorial_id: tutorialId, isDeleted: false },
      select: { price: true, title: true, authorId: true },
    });
    
    if (!tutorial) throw new Error('Tutorial not found');
    
    // Check if already enrolled
    const existingEnrollment = await prisma.tutorialProgress.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
    });
    
    if (existingEnrollment) {
      return { enrolled: false, message: 'Already enrolled in this tutorial' };
    }
    
    const enrollment = await prisma.tutorialProgress.create({
      data: {
        tutprogress_id: uuidv4(),
        userId,
        tutorialId,
        isDone: false,
      },
    });
    
    await prisma.tutorial.update({
      where: { tutorial_id: tutorialId },
      data: { totalEnrollments: { increment: 1 } },
    });
    
    await redis.del(`tutorial:${tutorialId}`);
    await redis.del(`user:${userId}:enrollments:*`);
    
    // Award points for enrolling
    await this.awardPoints(userId, 'enroll_tutorial');
    
    // Notify tutorial author
    if (tutorial.authorId !== userId) {
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId: tutorial.authorId,
          type: 'SYSTEM_ALERT',
          title: 'New Student Enrolled',
          message: `A new student enrolled in your tutorial "${tutorial.title}"`,
          data: { tutorialId, userId },
        },
      });
    }
    
    return { enrolled: true, message: 'Successfully enrolled in tutorial', enrollment };
  }
  
  static async updateProgress(userId, tutorialId, sectionId, isDone = true) {
    const enrollment = await prisma.tutorialProgress.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
    });
    
    if (!enrollment) {
      throw new Error('You are not enrolled in this tutorial');
    }
    
    const updatedProgress = await prisma.tutorialProgress.update({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      data: {
        sectionId,
        isDone,
        completedAt: isDone ? new Date() : null,
        updatedAt: new Date(),
      },
    });
    
    // Check if tutorial is completed
    const sections = await prisma.tutorialSection.findMany({
      where: { tutorialId, isDeleted: false },
      select: { tutsection_id: true },
    });
    
    const completedSections = await prisma.tutorialProgress.findFirst({
      where: {
        userId,
        tutorialId,
        isDone: true,
      },
    });
    
    // If all sections are completed, mark tutorial as done
    if (completedSections && sections.length > 0) {
      // This is simplified - in production, track which sections are completed
      await prisma.tutorialProgress.update({
        where: {
          userId_tutorialId: {
            userId,
            tutorialId,
          },
        },
        data: { isDone: true, completedAt: new Date() },
      });
      
      // Award points for completing tutorial
      await this.awardPoints(userId, 'complete_tutorial');
      
      // Generate certificate if enabled
      const tutorial = await prisma.tutorial.findUnique({
        where: { tutorial_id: tutorialId },
        select: { certificateEnabled: true, title: true },
      });
      
      if (tutorial.certificateEnabled) {
        await this.generateCertificate(userId, tutorialId);
      }
    }
    
    await redis.del(`user:${userId}:progress:${tutorialId}`);
    await redis.del(`user:${userId}:enrollments:*`);
    
    return updatedProgress;
  }
  
  static async getUserProgress(userId, tutorialId) {
    const cacheKey = `user:${userId}:progress:${tutorialId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const progress = await prisma.tutorialProgress.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      include: {
        tutorial: {
          select: {
            title: true,
            sections: {
              where: { isDeleted: false },
              orderBy: { order: 'asc' },
              select: {
                tutsection_id: true,
                title: true,
                order: true,
              },
            },
          },
        },
      },
    });
    
    if (!progress) return null;
    
    // Calculate completion percentage
    const totalSections = progress.tutorial.sections.length;
    // This is simplified - track completed sections separately in production
    const completionPercentage = progress.isDone ? 100 : 
      (progress.sectionId ? Math.floor((progress.tutorial.sections.findIndex(s => s.tutsection_id === progress.sectionId) + 1) / totalSections * 100) : 0);
    
    const result = {
      ...progress,
      completionPercentage,
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async getEnrolledTutorials(userId, filters, pagination) {
    const { status, sortBy = 'lastAccessed', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `user:${userId}:enrollments:${page}:${limit}:${status}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    let where = { userId };
    
    const [enrollments, total] = await Promise.all([
      prisma.tutorialProgress.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          tutorial: {
            include: {
              author: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
              categories: {
                include: {
                  tutorialCategory: true,
                },
              },
              _count: {
                select: { sections: true },
              },
            },
          },
        },
      }),
      prisma.tutorialProgress.count({ where }),
    ]);
    
    const result = {
      tutorials: enrollments.map(e => ({
        ...e.tutorial,
        enrolledAt: e.createdAt,
        progress: e.isDone ? 100 : (e.sectionId ? 50 : 0),
        completedAt: e.completedAt,
        lastAccessed: e.updatedAt,
      })),
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
  
  // ==================== CERTIFICATE MANAGEMENT ====================
  
  static async generateCertificate(userId, tutorialId) {
    const progress = await prisma.tutorialProgress.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      include: {
        tutorial: {
          select: { title: true, certificateEnabled: true },
        },
        user: {
          select: { display_name: true, email: true },
        },
      },
    });
    
    if (!progress || !progress.isDone) {
      throw new Error('Tutorial must be completed to generate certificate');
    }
    
    if (!progress.tutorial.certificateEnabled) {
      throw new Error('Certificate not enabled for this tutorial');
    }
    
    const certificateId = crypto.randomBytes(16).toString('hex');
    const certificateUrl = `${process.env.APP_URL}/certificates/${certificateId}`;
    
    // Store certificate info in database or Redis
    await redis.setex(`certificate:${certificateId}`, 31536000, JSON.stringify({
      userId,
      tutorialId,
      tutorialTitle: progress.tutorial.title,
      userName: progress.user.display_name,
      completedAt: progress.completedAt,
      certificateUrl,
    }));
    
    return {
      certificateId,
      certificateUrl,
      tutorialTitle: progress.tutorial.title,
      completedAt: progress.completedAt,
    };
  }
  
  static async verifyCertificate(certificateId) {
    const certificate = await redis.get(`certificate:${certificateId}`);
    
    if (!certificate) {
      throw new Error('Invalid or expired certificate');
    }
    
    return JSON.parse(certificate);
  }
  
  // ==================== REVIEWS ====================
  
  static async addReview(userId, tutorialId, reviewData) {
    // Check if user is enrolled
    const enrollment = await prisma.tutorialProgress.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
    });
    
    if (!enrollment) {
      throw new Error('You must be enrolled in this tutorial to review it');
    }
    
    // Check if already reviewed
    const existingReview = await prisma.tutorialReview.findFirst({
      where: { userId, tutorialId },
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this tutorial');
    }
    
    const review = await prisma.tutorialReview.create({
      data: {
        review_id: uuidv4(),
        tutorialId,
        userId,
        rating: reviewData.rating,
        review: reviewData.review,
        isApproved: true,
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
    
    // Update tutorial rating
    const avgRating = await prisma.tutorialReview.aggregate({
      where: { tutorialId, isApproved: true },
      _avg: { rating: true },
    });
    
    await prisma.tutorial.update({
      where: { tutorial_id: tutorialId },
      data: { rating: avgRating._avg.rating || 0 },
    });
    
    await redis.del(`tutorial:${tutorialId}`);
    await redis.del(`tutorial:${tutorialId}:reviews:*`);
    
    // Award points for reviewing
    await this.awardPoints(userId, 'write_review');
    
    return review;
  }
  
  static async getTutorialReviews(tutorialId, filters, pagination) {
    const { rating, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `tutorial:${tutorialId}:reviews:${page}:${limit}:${rating}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const where = { tutorialId, isApproved: true };
    if (rating) where.rating = rating;
    
    const [reviews, total] = await Promise.all([
      prisma.tutorialReview.findMany({
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
      prisma.tutorialReview.count({ where }),
    ]);
    
    const result = {
      reviews,
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
  
  // ==================== STATISTICS ====================
  
  static async getTutorialStats(tutorialId) {
    const [enrollments, completions, reviews, sections] = await Promise.all([
      prisma.tutorialProgress.count({ where: { tutorialId } }),
      prisma.tutorialProgress.count({ where: { tutorialId, isDone: true } }),
      prisma.tutorialReview.aggregate({
        where: { tutorialId, isApproved: true },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.tutorialSection.count({ where: { tutorialId, isDeleted: false } }),
    ]);
    
    return {
      totalEnrollments: enrollments,
      totalCompletions: completions,
      completionRate: enrollments > 0 ? ((completions / enrollments) * 100).toFixed(2) : 0,
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count,
      totalSections: sections,
    };
  }
  
  static async getLearningStats(userId) {
    const cacheKey = `user:${userId}:learning:stats`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [enrolledTutorials, completedTutorials, inProgressTutorials, totalProgress] = await Promise.all([
      prisma.tutorialProgress.count({ where: { userId } }),
      prisma.tutorialProgress.count({ where: { userId, isDone: true } }),
      prisma.tutorialProgress.count({ where: { userId, isDone: false } }),
      prisma.tutorialProgress.aggregate({
        where: { userId },
        _avg: { progress: true },
      }),
    ]);
    
    const stats = {
      enrolledTutorials,
      completedTutorials,
      inProgressTutorials,
      completionRate: enrolledTutorials > 0 ? ((completedTutorials / enrolledTutorials) * 100).toFixed(2) : 0,
      averageProgress: totalProgress._avg.progress || 0,
    };
    
    await redis.setex(cacheKey, 600, JSON.stringify(stats));
    
    return stats;
  }
  
  // ==================== POINTS SYSTEM ====================
  
  static async awardPoints(userId, action) {
    const pointsMap = {
      'enroll_tutorial': 10,
      'complete_tutorial': 100,
      'write_review': 15,
    };
    
    const points = pointsMap[action];
    if (!points) return;
    
    const userPoints = await prisma.userPoints.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points },
        experiencePoints: { increment: points },
      },
      create: {
        userId,
        totalPoints: points,
        experiencePoints: points,
        level: 1,
      },
    });
    
    const newLevel = Math.floor(userPoints.totalPoints / 100) + 1;
    if (newLevel > userPoints.level) {
      await prisma.userPoints.update({
        where: { userId },
        data: { level: newLevel },
      });
      
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId,
          type: 'ACHIEVEMENT_EARNED',
          title: 'Level Up! 🎉',
          message: `Congratulations! You've reached level ${newLevel}`,
        },
      });
    }
    
    return userPoints;
  }
}

export default  TutorialService;