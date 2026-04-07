import express  from 'express';
const router = express.Router();
import {OrganizationController}  from '../controllers/organization.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
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
}  from '../schemas/organizationSchema.js';

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization, company, university, and NGO management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         type:
 *           type: string
 *           enum: [COMPANY, UNIVERSITY, GOVERNMENT, NGO]
 *         logo:
 *           type: string
 *         coverImage:
 *           type: string
 *         description:
 *           type: string
 *         website:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED]
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         parentDeptId:
 *           type: string
 *         headUserId:
 *           type: string
 *         memberCount:
 *           type: integer
 *     
 *     OrganizationMember:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         role:
 *           type: string
 *           enum: [MEMBER, MANAGER, ADMIN, OWNER]
 *         title:
 *           type: string
 *         departmentId:
 *           type: string
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     
 *     OrganizationReview:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         title:
 *           type: string
 *         review:
 *           type: string
 *         pros:
 *           type: array
 *           items:
 *             type: string
 *         cons:
 *           type: array
 *           items:
 *             type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 */

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
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - type
 *               - admin
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [COMPANY, UNIVERSITY, GOVERNMENT, NGO]
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               taxId:
 *                 type: string
 *               admin:
 *                 type: object
 *                 required:
 *                   - email
 *                   - phone
 *                   - password
 *                   - unom
 *                   - uprenom
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   password:
 *                     type: string
 *                   unom:
 *                     type: string
 *                   uprenom:
 *                     type: string
 *                   username:
 *                     type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Organization already exists
 */
router.post('/', validate(createOrganizationSchema), OrganizationController.createOrganization);

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get all organizations with filtering
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [COMPANY, UNIVERSITY, GOVERNMENT, NGO]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, rating, memberCount, jobCount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Organizations retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Organization'
 *                     pagination:
 *                       type: object
 */
router.get('/', validate(getOrganizationsQuerySchema), OrganizationController.getOrganizations);

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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 */
router.get('/:orgId', validate(organizationIdParamSchema), OrganizationController.getOrganizationById);

/**
 * @swagger
 * /api/organizations/{orgId}:
 *   put:
 *     summary: Update organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Organization not found
 */
router.put(
  '/:orgId',
  verifyAccessToken,
  validate(updateOrganizationSchema),
  OrganizationController.updateOrganization
);

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
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Organization statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     membersCount:
 *                       type: integer
 *                     jobsCount:
 *                       type: integer
 *                     activeJobsCount:
 *                       type: integer
 *                     departmentsCount:
 *                       type: integer
 *                     reviewsCount:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     totalApplications:
 *                       type: integer
 *                     engagementRate:
 *                       type: number
 */
router.get(
  '/:orgId/stats',
  validate(getOrganizationStatsSchema),
  OrganizationController.getStats
);

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
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeMembers
 *         schema:
 *           type: boolean
 *           default: false
 *       - in: query
 *         name: includeSubDepartments
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Departments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 */
router.get(
  '/:orgId/departments',
  validate(getDepartmentsQuerySchema),
  OrganizationController.getDepartments
);

/**
 * @swagger
 * /api/organizations/{orgId}/departments:
 *   post:
 *     summary: Add department to organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
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
 *         description: Department added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/:orgId/departments',
  verifyAccessToken,
  validate(addDepartmentSchema),
  OrganizationController.addDepartment
);

/**
 * @swagger
 * /api/organizations/{orgId}/departments/{deptId}:
 *   put:
 *     summary: Update department
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deptId
 *         required: true
 *         schema:
 *           type: string
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
 *       200:
 *         description: Department updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Department not found
 */
router.put(
  '/:orgId/departments/:deptId',
  verifyAccessToken,
  validate(updateDepartmentSchema),
  OrganizationController.updateDepartment
);

/**
 * @swagger
 * /api/organizations/{orgId}/departments/{deptId}:
 *   delete:
 *     summary: Delete department
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.delete(
  '/:orgId/departments/:deptId',
  verifyAccessToken,
  OrganizationController.deleteDepartment
);

/**
 * @swagger
 * /api/organizations/{orgId}/members:
 *   get:
 *     summary: Get organization members
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [MEMBER, MANAGER, ADMIN, OWNER]
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Members retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrganizationMember'
 *                     pagination:
 *                       type: object
 */
router.get(
  '/:orgId/members',
  validate(getMembersQuerySchema),
  OrganizationController.getMembers
);

/**
 * @swagger
 * /api/organizations/{orgId}/members:
 *   post:
 *     summary: Add member to organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MEMBER, MANAGER, ADMIN]
 *                 default: MEMBER
 *               departmentId:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User or organization not found
 */
router.post(
  '/:orgId/members',
  verifyAccessToken,
  validate(addMemberSchema),
  OrganizationController.addMember
);

/**
 * @swagger
 * /api/organizations/{orgId}/members/{userId}:
 *   put:
 *     summary: Update member role
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [MEMBER, MANAGER, ADMIN, OWNER]
 *               departmentId:
 *                 type: string
 *               title:
 *                 type: string
 *               isPrimaryContact:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.put(
  '/:orgId/members/:userId',
  verifyAccessToken,
  validate(updateMemberSchema),
  OrganizationController.updateMemberRole
);

/**
 * @swagger
 * /api/organizations/{orgId}/members/{userId}:
 *   delete:
 *     summary: Remove member from organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Cannot remove the only owner
 */
router.delete(
  '/:orgId/members/:userId',
  verifyAccessToken,
  OrganizationController.removeMember
);

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
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, createdAt, helpful]
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Reviews retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrganizationReview'
 *                     pagination:
 *                       type: object
 */
router.get(
  '/:orgId/reviews',
  validate(getReviewsQuerySchema),
  OrganizationController.getReviews
);

/**
 * @swagger
 * /api/organizations/{orgId}/reviews:
 *   post:
 *     summary: Submit organization review
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - title
 *               - review
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               review:
 *                 type: string
 *               pros:
 *                 type: array
 *                 items:
 *                   type: string
 *               cons:
 *                 type: array
 *                 items:
 *                   type: string
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot review own organization
 */
router.post(
  '/:orgId/reviews',
  verifyAccessToken,
  validate(submitReviewSchema),
  OrganizationController.submitReview
);

/**
 * @swagger
 * /api/organizations/{orgId}/reviews/{reviewId}:
 *   put:
 *     summary: Update review (admin/moderator)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put(
  '/:orgId/reviews/:reviewId',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validate(updateReviewSchema),
  OrganizationController.updateReview
);

/**
 * @swagger
 * /api/organizations/{orgId}/verify:
 *   put:
 *     summary: Verify organization (admin only)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verified
 *             properties:
 *               verified:
 *                 type: boolean
 *               verificationNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization verification status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put(
  '/:orgId/verify',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validate(verifyOrganizationSchema),
  OrganizationController.verifyOrganization
);

/**
 * @swagger
 * /api/organizations/batch:
 *   post:
 *     summary: Batch organization actions (admin only)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orgIds
 *               - action
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
  '/batch',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validate(batchOrganizationActionSchema),
  OrganizationController.batchAction
);

/**
 * @swagger
 * /api/organizations/{orgId}/export:
 *   get:
 *     summary: Export organization statistics
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json, pdf]
 *           default: json
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: includeMetrics
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [members, jobs, applications, reviews, revenue, engagement]
 *     responses:
 *       200:
 *         description: Export data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/:orgId/export',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN']),
  validate(exportOrganizationStatsSchema),
  OrganizationController.exportStats
);

export default router;