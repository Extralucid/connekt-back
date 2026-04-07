import express  from 'express';
const router = express.Router();
import TutorialController  from '../controllers/tutorial.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createTutorialSchema,
  updateTutorialSchema,
  getTutorialsQuerySchema,
  getTutorialParamSchema,
  deleteTutorialSchema,
  createSectionSchema,
  updateSectionSchema,
  getSectionsQuerySchema,
  deleteSectionSchema,
  reorderSectionsSchema,
  createTutorialCategorySchema,
  updateTutorialCategorySchema,
  enrollTutorialSchema,
  updateProgressSchema,
  getUserProgressSchema,
  getEnrolledTutorialsSchema,
  generateCertificateSchema,
  verifyCertificateSchema,
  createTutorialReviewSchema,
  getTutorialReviewsSchema,
  getTutorialStatsSchema,
  getLearningStatsSchema,
}  from '../schemas/tutorialSchema.js';

/**
 * @swagger
 * tags:
 *   name: Tutorials
 *   description: Learning tutorials, sections, progress tracking, and certificates
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tutorial:
 *       type: object
 *       properties:
 *         tutorial_id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         thumbnail:
 *           type: string
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         duration:
 *           type: integer
 *         price:
 *           type: number
 *         prerequisites:
 *           type: array
 *         learningOutcomes:
 *           type: array
 *         certificateEnabled:
 *           type: boolean
 *         averageRating:
 *           type: number
 *         enrollmentCount:
 *           type: integer
 *         sectionCount:
 *           type: integer
 *         author:
 *           $ref: '#/components/schemas/User'
 *         categories:
 *           type: array
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     TutorialSection:
 *       type: object
 *       properties:
 *         tutsection_id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         videoUrl:
 *           type: string
 *         order:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     TutorialProgress:
 *       type: object
 *       properties:
 *         progress:
 *           type: integer
 *         completionPercentage:
 *           type: integer
 *         isDone:
 *           type: boolean
 *         completedAt:
 *           type: string
 *           format: date-time
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *     
 *     Certificate:
 *       type: object
 *       properties:
 *         certificateId:
 *           type: string
 *         certificateUrl:
 *           type: string
 *         tutorialTitle:
 *           type: string
 *         completedAt:
 *           type: string
 *           format: date-time
 */

// ==================== TUTORIAL ROUTES ====================

/**
 * @swagger
 * /api/tutorials:
 *   post:
 *     summary: Create a new tutorial
 *     tags: [Tutorials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - learningOutcomes
 *               - categoryIds
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               duration:
 *                 type: integer
 *               categoryIds:
 *                 type: array
 *               prerequisites:
 *                 type: array
 *               learningOutcomes:
 *                 type: array
 *               price:
 *                 type: number
 *               certificateEnabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tutorial created successfully
 */
router.post(
  '/',
  verifyAccessToken,
  validate(createTutorialSchema),
  TutorialController.createTutorial
);

/**
 * @swagger
 * /api/tutorials:
 *   get:
 *     summary: Get all tutorials with filtering
 *     tags: [Tutorials]
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
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, difficulty, price, createdAt, rating, enrollments]
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Tutorials retrieved
 */
router.get(
  '/',
  validate(getTutorialsQuerySchema),
  TutorialController.getAllTutorials
);

/**
 * @swagger
 * /api/tutorials/my:
 *   get:
 *     summary: Get my created tutorials
 *     tags: [Tutorials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My tutorials retrieved
 */
router.get(
  '/my',
  verifyAccessToken,
  TutorialController.getMyTutorials
);

/**
 * @swagger
 * /api/tutorials/enrolled:
 *   get:
 *     summary: Get my enrolled tutorials
 *     tags: [Tutorials]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in-progress, completed]
 *     responses:
 *       200:
 *         description: Enrolled tutorials retrieved
 */
router.get(
  '/enrolled',
  verifyAccessToken,
  validate(getEnrolledTutorialsSchema),
  TutorialController.getEnrolledTutorials
);

/**
 * @swagger
 * /api/tutorials/{identifier}:
 *   get:
 *     summary: Get tutorial by ID or slug
 *     tags: [Tutorials]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tutorial retrieved
 *       404:
 *         description: Tutorial not found
 */
router.get(
  '/:identifier',
  validate(getTutorialParamSchema),
  TutorialController.getTutorialById
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}:
 *   put:
 *     summary: Update tutorial
 *     tags: [Tutorials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tutorial updated
 */
router.put(
  '/:tutorialId',
  verifyAccessToken,
  validate(updateTutorialSchema),
  TutorialController.updateTutorial
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}:
 *   delete:
 *     summary: Delete tutorial
 *     tags: [Tutorials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tutorial deleted
 */
router.delete(
  '/:tutorialId',
  verifyAccessToken,
  validate(deleteTutorialSchema),
  TutorialController.deleteTutorial
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}/stats:
 *   get:
 *     summary: Get tutorial statistics
 *     tags: [Tutorials]
 *     parameters:
 *       - in: path
 *         name: tutorialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tutorial statistics retrieved
 */
router.get(
  '/:tutorialId/stats',
  validate(getTutorialStatsSchema),
  TutorialController.getTutorialStats
);

// ==================== TUTORIAL CATEGORY ROUTES ====================

/**
 * @swagger
 * /api/tutorials/categories:
 *   post:
 *     summary: Create tutorial category (admin only)
 *     tags: [Tutorial Categories]
 *     security:
 *       - bearerAuth: []
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/categories',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(createTutorialCategorySchema),
  TutorialController.createCategory
);

/**
 * @swagger
 * /api/tutorials/categories:
 *   get:
 *     summary: Get all tutorial categories
 *     tags: [Tutorial Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved
 */
router.get(
  '/categories',
  TutorialController.getAllCategories
);

/**
 * @swagger
 * /api/tutorials/categories/{categoryId}:
 *   put:
 *     summary: Update tutorial category (admin only)
 *     tags: [Tutorial Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put(
  '/categories/:categoryId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(updateTutorialCategorySchema),
  TutorialController.updateCategory
);

/**
 * @swagger
 * /api/tutorials/categories/{categoryId}:
 *   delete:
 *     summary: Delete tutorial category (admin only)
 *     tags: [Tutorial Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete(
  '/categories/:categoryId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  TutorialController.deleteCategory
);

// ==================== SECTION ROUTES ====================

/**
 * @swagger
 * /api/tutorials/{tutorialId}/sections:
 *   post:
 *     summary: Create tutorial section
 *     tags: [Tutorial Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
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
 *               - title
 *               - content
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Section created
 */
router.post(
  '/:tutorialId/sections',
  verifyAccessToken,
  validate(createSectionSchema),
  TutorialController.createSection
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}/sections:
 *   get:
 *     summary: Get tutorial sections
 *     tags: [Tutorial Sections]
 *     parameters:
 *       - in: path
 *         name: tutorialId
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
 *           default: 50
 *     responses:
 *       200:
 *         description: Sections retrieved
 */
router.get(
  '/:tutorialId/sections',
  validate(getSectionsQuerySchema),
  TutorialController.getSections
);

/**
 * @swagger
 * /api/tutorials/sections/{sectionId}:
 *   put:
 *     summary: Update tutorial section
 *     tags: [Tutorial Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Section updated
 */
router.put(
  '/sections/:sectionId',
  verifyAccessToken,
  validate(updateSectionSchema),
  TutorialController.updateSection
);

/**
 * @swagger
 * /api/tutorials/sections/{sectionId}:
 *   delete:
 *     summary: Delete tutorial section
 *     tags: [Tutorial Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section deleted
 */
router.delete(
  '/sections/:sectionId',
  verifyAccessToken,
  validate(deleteSectionSchema),
  TutorialController.deleteSection
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}/sections/reorder:
 *   put:
 *     summary: Reorder tutorial sections
 *     tags: [Tutorial Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
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
 *               - sections
 *             properties:
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sectionId:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Sections reordered
 */
router.put(
  '/:tutorialId/sections/reorder',
  verifyAccessToken,
  validate(reorderSectionsSchema),
  TutorialController.reorderSections
);

// ==================== USER PROGRESS ROUTES ====================

/**
 * @swagger
 * /api/tutorials/{tutorialId}/enroll:
 *   post:
 *     summary: Enroll in tutorial
 *     tags: [Tutorial Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Enrolled successfully
 */
router.post(
  '/:tutorialId/enroll',
  verifyAccessToken,
  validate(enrollTutorialSchema),
  TutorialController.enrollInTutorial
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}/progress:
 *   get:
 *     summary: Get user progress in tutorial
 *     tags: [Tutorial Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress retrieved
 */
router.get(
  '/:tutorialId/progress',
  verifyAccessToken,
  validate(getUserProgressSchema),
  TutorialController.getUserProgress
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}/progress:
 *   put:
 *     summary: Update user progress
 *     tags: [Tutorial Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
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
 *               - sectionId
 *             properties:
 *               sectionId:
 *                 type: string
 *               isDone:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put(
  '/:tutorialId/progress',
  verifyAccessToken,
  validate(updateProgressSchema),
  TutorialController.updateProgress
);

/**
 * @swagger
 * /api/my-learning/stats:
 *   get:
 *     summary: Get user learning statistics
 *     tags: [Tutorial Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learning statistics retrieved
 */
router.get(
  '/my-learning/stats',
  verifyAccessToken,
  TutorialController.getLearningStats
);

// ==================== CERTIFICATE ROUTES ====================

/**
 * @swagger
 * /api/tutorials/{tutorialId}/certificate:
 *   post:
 *     summary: Generate completion certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate generated
 */
router.post(
  '/:tutorialId/certificate',
  verifyAccessToken,
  validate(generateCertificateSchema),
  TutorialController.generateCertificate
);

/**
 * @swagger
 * /api/certificates/verify:
 *   get:
 *     summary: Verify certificate
 *     tags: [Certificates]
 *     parameters:
 *       - in: query
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate verified
 *       404:
 *         description: Certificate not found
 */
router.get(
  '/certificates/verify',
  validate(verifyCertificateSchema),
  TutorialController.verifyCertificate
);

// ==================== REVIEW ROUTES ====================

/**
 * @swagger
 * /api/tutorials/{tutorialId}/reviews:
 *   post:
 *     summary: Add tutorial review
 *     tags: [Tutorial Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorialId
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
 *               - review
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 */
router.post(
  '/:tutorialId/reviews',
  verifyAccessToken,
  validate(createTutorialReviewSchema),
  TutorialController.addReview
);

/**
 * @swagger
 * /api/tutorials/{tutorialId}/reviews:
 *   get:
 *     summary: Get tutorial reviews
 *     tags: [Tutorial Reviews]
 *     parameters:
 *       - in: path
 *         name: tutorialId
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
 *     responses:
 *       200:
 *         description: Reviews retrieved
 */
router.get(
  '/:tutorialId/reviews',
  validate(getTutorialReviewsSchema),
  TutorialController.getTutorialReviews
);

export default router;