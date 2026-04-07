import OrganizationService from '../services/organization.service.js';

export class OrganizationController {
  /**
   * @swagger
   * /api/organizations:
   *   post:
   *     summary: Create a new organization
   *     tags: [Organizations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Organization created
   */
  static async createOrganization(req, res, next) {
    try {
      const { organization, admin } = await OrganizationService.createOrganization(
        req.body,
        req.body.admin
      );
      
      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: { organization, admin },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations:
   *   get:
   *     summary: Get all organizations
   *     tags: [Organizations]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *       - in: query
   *         name: type
   *         schema: { type: string }
   *       - in: query
   *         name: city
   *         schema: { type: string }
   *       - in: query
   *         name: country
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Organizations retrieved
   */
  static async getOrganizations(req, res, next) {
    try {
      const result = await OrganizationService.searchOrganizations(req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}:
   *   get:
   *     summary: Get organization by ID
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Organization found
   *       404:
   *         description: Organization not found
   */
  static async getOrganizationById(req, res, next) {
    try {
      const organization = await OrganizationService.getOrganizationById(req.params.orgId);
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      }
      
      res.json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}:
   *   put:
   *     summary: Update organization
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Organization updated
   */
  static async updateOrganization(req, res, next) {
    try {
      const organization = await OrganizationService.updateOrganization(
        req.params.orgId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Organization updated successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/departments:
   *   post:
   *     summary: Add department to organization
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               parentDeptId:
   *                 type: string
   *               headUserId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Department added
   */
  static async addDepartment(req, res, next) {
    try {
      const department = await OrganizationService.addDepartment(
        req.params.orgId,
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: 'Department added successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/departments/{deptId}:
   *   put:
   *     summary: Update department
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: path
   *         name: deptId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Department updated
   */
  static async updateDepartment(req, res, next) {
    try {
      const department = await OrganizationService.updateDepartment(
        req.params.orgId,
        req.params.deptId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Department updated successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/departments/{deptId}:
   *   delete:
   *     summary: Delete department
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: path
   *         name: deptId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Department deleted
   */
  static async deleteDepartment(req, res, next) {
    try {
      await OrganizationService.deleteDepartment(req.params.orgId, req.params.deptId);
      
      res.json({
        success: true,
        message: 'Department deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/members:
   *   post:
   *     summary: Add member to organization
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               role:
   *                 type: string
   *               departmentId:
   *                 type: string
   *               title:
   *                 type: string
   *     responses:
   *       201:
   *         description: Member added
   */
  static async addMember(req, res, next) {
    try {
      const member = await OrganizationService.addMember(
        req.params.orgId,
        req.body.userId,
        req.body.role,
        req.body.departmentId,
        req.body.title
      );
      
      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/members/{userId}:
   *   put:
   *     summary: Update member role
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: path
   *         name: userId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               role:
   *                 type: string
   *               departmentId:
   *                 type: string
   *               title:
   *                 type: string
   *               isPrimaryContact:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Member role updated
   */
  static async updateMemberRole(req, res, next) {
    try {
      const member = await OrganizationService.updateMemberRole(
        req.params.orgId,
        req.params.userId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Member updated successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/members/{userId}:
   *   delete:
   *     summary: Remove member from organization
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: path
   *         name: userId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Member removed
   */
  static async removeMember(req, res, next) {
    try {
      await OrganizationService.removeMember(req.params.orgId, req.params.userId);
      
      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/stats:
   *   get:
   *     summary: Get organization statistics
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: period
   *         schema: { type: string, enum: [day, week, month, year, all], default: month }
   *     responses:
   *       200:
   *         description: Organization statistics retrieved
   */
  static async getStats(req, res, next) {
    try {
      const stats = await OrganizationService.getOrganizationStats(
        req.params.orgId,
        req.query.period
      );
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/reviews:
   *   post:
   *     summary: Submit organization review
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating:
   *                 type: integer
   *               title:
   *                 type: string
   *               review:
   *                 type: string
   *               pros:
   *                 type: array
   *               cons:
   *                 type: array
   *               isAnonymous:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Review submitted
   */
  static async submitReview(req, res, next) {
    try {
      const review = await OrganizationService.submitReview(
        req.params.orgId,
        req.userId,
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Awaiting moderation.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/reviews:
   *   get:
   *     summary: Get organization reviews
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: rating
   *         schema: { type: integer, minimum: 1, maximum: 5 }
   *     responses:
   *       200:
   *         description: Reviews retrieved
   */
  static async getReviews(req, res, next) {
    try {
      const result = await OrganizationService.getOrganizationReviews(
        req.params.orgId,
        req.query
      );
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/reviews/{reviewId}:
   *   put:
   *     summary: Update review (admin/moderator)
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               isApproved:
   *                 type: boolean
   *               moderationNote:
   *                 type: string
   *     responses:
   *       200:
   *         description: Review updated
   */
  static async updateReview(req, res, next) {
    try {
      const review = await OrganizationService.updateReview(
        req.params.orgId,
        req.params.reviewId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/members:
   *   get:
   *     summary: Get organization members
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: role
   *         schema: { type: string }
   *       - in: query
   *         name: departmentId
   *         schema: { type: string }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Members retrieved
   */
  static async getMembers(req, res, next) {
    try {
      const result = await OrganizationService.getMembers(
        req.params.orgId,
        req.query
      );
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/departments:
   *   get:
   *     summary: Get organization departments
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: includeMembers
   *         schema: { type: boolean, default: false }
   *       - in: query
   *         name: includeSubDepartments
   *         schema: { type: boolean, default: true }
   *     responses:
   *       200:
   *         description: Departments retrieved
   */
  static async getDepartments(req, res, next) {
    try {
      const departments = await OrganizationService.getDepartments(
        req.params.orgId,
        req.query
      );
      
      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/verify:
   *   put:
   *     summary: Verify organization (admin only)
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               verified:
   *                 type: boolean
   *               verificationNote:
   *                 type: string
   *     responses:
   *       200:
   *         description: Organization verification status updated
   */
  static async verifyOrganization(req, res, next) {
    try {
      const organization = await OrganizationService.verifyOrganization(
        req.params.orgId,
        req.body
      );
      
      res.json({
        success: true,
        message: `Organization ${req.body.verified ? 'verified' : 'unverified'} successfully`,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/batch:
   *   post:
   *     summary: Batch organization actions (admin only)
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               orgIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               action:
   *                 type: string
   *                 enum: [activate, suspend, ban, verify, delete]
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Batch action completed
   */
  static async batchAction(req, res, next) {
    try {
      const result = await OrganizationService.batchAction(req.body);
      
      res.json({
        success: true,
        message: 'Batch action completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/organizations/{orgId}/export:
   *   get:
   *     summary: Export organization statistics
   *     tags: [Organizations]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: format
   *         schema: { type: string, enum: [csv, json, pdf], default: json }
   *       - in: query
   *         name: startDate
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: endDate
   *         schema: { type: string, format: date-time }
   *     responses:
   *       200:
   *         description: Export data
   */
  static async exportStats(req, res, next) {
    try {
      const exportData = await OrganizationService.exportStats(
        req.params.orgId,
        req.query
      );
      
      // Set appropriate headers based on format
      if (req.query.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=organization_stats_${req.params.orgId}.csv`);
      } else if (req.query.format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=organization_stats_${req.params.orgId}.pdf`);
      } else {
        res.json({
          success: true,
          data: exportData,
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

//export default new OrganizationController;