import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import AuthService from './auth.service.js';

class OrganizationService {
  static async createOrganization(orgData, adminData) {
    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: orgData.name,
        slug: orgData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        email: orgData.email,
        phone: orgData.phone,
        type: orgData.type,
        description: orgData.description,
        website: orgData.website,
        address: orgData.address,
        city: orgData.city,
        country: orgData.country,
        taxId: orgData.taxId,
        metadata: orgData.metadata || {},
      },
    });
    
    // Create admin user for organization
    const hashedPassword = await AuthService.hashPassword(adminData.password);
    
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        phone: adminData.phone,
        pwd_hash: hashedPassword,
        codeuser: uuidv4(),
        unom: adminData.unom,
        uprenom: adminData.uprenom,
        username: adminData.username || `${adminData.unom.toLowerCase()}.${adminData.uprenom.toLowerCase()}`,
        accountType: orgData.type,
        registration_date: new Date(),
        display_name: `${adminData.unom} ${adminData.uprenom}`,
      },
    });
    
    // Link admin to organization
    await prisma.organizationUser.create({
      data: {
        userId: admin.id,
        organizationId: organization.id,
        role: 'OWNER',
        isPrimaryContact: true,
      },
    });
    
    // Assign organization admin role
    const role = await prisma.role.findUnique({
      where: { name: 'ORGANIZATION_ADMIN' },
    });
    
    if (role) {
      await prisma.userRole.create({
        data: {
          userId: admin.id,
          roleId: role.id,
        },
      });
    }
    
    return { organization, admin };
  }

  static async getOrganizationById(orgId) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId, isDeleted: false },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
            department: true,
          },
        },
        departments: {
          where: { isDeleted: false },
        },
        postedJobs: {
          where: { expiryDate: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    
    return organization;
  }

  static async updateOrganization(orgId, updateData) {
    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...updateData,
        updatedAt: new Date(),
        // Update slug if name changed
        ...(updateData.name && {
          slug: updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      },
    });
    
    return organization;
  }

  static async addDepartment(orgId, deptData) {
    const department = await prisma.department.create({
      data: {
        name: deptData.name,
        description: deptData.description,
        organizationId: orgId,
        parentDeptId: deptData.parentDeptId,
        headUserId: deptData.headUserId,
      },
      include: {
        headUser: {
          select: {
            id: true,
            display_name: true,
            email: true,
          },
        },
      },
    });
    
    return department;
  }

  static async addMember(orgId, userId, role = 'MEMBER', departmentId = null) {
    // Check if user is already a member
    const existing = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    
    if (existing) {
      throw new Error('User is already a member of this organization');
    }
    
    const member = await prisma.organizationUser.create({
      data: {
        userId,
        organizationId: orgId,
        role,
        departmentId,
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            email: true,
            profile_picture_url: true,
          },
        },
        department: true,
      },
    });
    
    return member;
  }

  static async updateMemberRole(orgId, userId, newRole) {
    const member = await prisma.organizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      data: { role: newRole, updatedAt: new Date() },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            email: true,
          },
        },
      },
    });
    
    return member;
  }

  static async removeMember(orgId, userId) {
    // Check if user is the only owner
    const owners = await prisma.organizationUser.count({
      where: {
        organizationId: orgId,
        role: 'OWNER',
      },
    });
    
    const targetMember = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    
    if (targetMember.role === 'OWNER' && owners === 1) {
      throw new Error('Cannot remove the only owner. Transfer ownership first.');
    }
    
    await prisma.organizationUser.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    
    return true;
  }

  static async getOrganizationStats(orgId) {
    const [
      membersCount,
      jobsCount,
      activeJobsCount,
      departmentsCount,
      reviewsCount,
      averageRating,
    ] = await Promise.all([
      prisma.organizationUser.count({ where: { organizationId: orgId } }),
      prisma.job.count({ where: { sponsoredById: orgId } }),
      prisma.job.count({
        where: {
          sponsoredById: orgId,
          expiryDate: { gt: new Date() },
        },
      }),
      prisma.department.count({ where: { organizationId: orgId, isDeleted: false } }),
      prisma.companyReview.count({ where: { organizationId: orgId, isApproved: true } }),
      prisma.companyReview.aggregate({
        where: { organizationId: orgId, isApproved: true },
        _avg: { rating: true },
      }),
    ]);
    
    return {
      membersCount,
      jobsCount,
      activeJobsCount,
      departmentsCount,
      reviewsCount,
      averageRating: averageRating._avg.rating || 0,
    };
  }

  static async searchOrganizations(filters, pagination) {
    const { query, type, status, city, country } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    
    const where = { isDeleted: false };
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = country;
    
    const skip = (page - 1) * limit;
    
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              users: true,
              postedJobs: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);
    
    return {
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async submitReview(orgId, userId, reviewData) {
    const review = await prisma.companyReview.create({
      data: {
        rating: reviewData.rating,
        title: reviewData.title,
        review: reviewData.review,
        pros: reviewData.pros || [],
        cons: reviewData.cons || [],
        userId,
        employerId: userId, // Note: This might need adjustment based on your schema
        organizationId: orgId,
        isApproved: false, // Requires moderation
      },
    });
    
    return review;
  }

  static async getOrganizationReviews(orgId, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      prisma.companyReview.findMany({
        where: { organizationId: orgId, isApproved: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      prisma.companyReview.count({
        where: { organizationId: orgId, isApproved: true },
      }),
    ]);
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default OrganizationService;