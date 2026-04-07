import express  from 'express';
const router = express.Router();
import JobController  from '../controllers/job.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createJobSchema,
  updateJobSchema,
  getJobsQuerySchema,
  getJobParamSchema,
  deleteJobSchema,
  applyForJobSchema,
  updateApplicationStatusSchema,
  getApplicationsQuerySchema,
  createJobCategorySchema,
  createSkillSchema,
  createJobAlertSchema,
  updateJobAlertSchema,
  createCompanyReviewSchema,
  getCompanyReviewsQuerySchema,
  getJobStatsSchema,
  getEmployerStatsSchema,
}  from '../schemas/jobSchema.js';

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job board, applications, and employer management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         job_id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         jobType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE]
 *         location:
 *           type: string
 *         remote:
 *           type: boolean
 *         salaryMin:
 *           type: integer
 *         salaryMax:
 *           type: integer
 *         salaryCurrency:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         views:
 *           type: integer
 *         applicationsCount:
 *           type: integer
 *         employer:
 *           $ref: '#/components/schemas/User'
 *         categories:
 *           type: array
 *         skills:
 *           type: array
 *     
 *     Application:
 *       type: object
 *       properties:
 *         app_id:
 *           type: string
 *         coverLetter:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, REVIEWED, REJECTED, INTERVIEW, HIRED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         job:
 *           $ref: '#/components/schemas/Job'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         documents:
 *           type: array
 *     
 *     JobAlert:
 *       type: object
 *       properties:
 *         jobalert_id:
 *           type: string
 *         keywords:
 *           type: array
 *         frequency:
 *           type: string
 *           enum: [INSTANT, DAILY, WEEKLY]
 *         isActive:
 *           type: boolean
 *         categories:
 *           type: array
 *     
 *     CompanyReview:
 *       type: object
 *       properties:
 *         review_id:
 *           type: string
 *         rating:
 *           type: integer
 *         title:
 *           type: string
 *         review:
 *           type: string
 *         pros:
 *           type: array
 *         cons:
 *           type: array
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ==================== JOB ROUTES ====================

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Post a new job
 *     tags: [Jobs]
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
 *               - expiryDate
 *               - categoryIds
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               jobType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE]
 *               location:
 *                 type: string
 *               remote:
 *                 type: boolean
 *               salaryMin:
 *                 type: integer
 *               salaryMax:
 *                 type: integer
 *               salaryCurrency:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               skillIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPromoted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Job posted successfully
 */
router.post(
  '/',
  verifyAccessToken,
  validate(createJobSchema),
  JobController.createJob
);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filtering
 *     tags: [Jobs]
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
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE]
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: remote
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: skillId
 *         schema:
 *           type: string
 *       - in: query
 *         name: salaryMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: salaryMax
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jobs retrieved
 */
router.get(
  '/',
  validate(getJobsQuerySchema),
  JobController.getAllJobs
);

/**
 * @swagger
 * /api/jobs/my:
 *   get:
 *     summary: Get my posted jobs (employer)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My jobs retrieved
 */
router.get(
  '/my',
  verifyAccessToken,
  JobController.getMyJobs
);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved
 *       404:
 *         description: Job not found
 */
router.get(
  '/:jobId',
  validate(getJobParamSchema),
  JobController.getJobById
);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
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
 *         description: Job updated
 */
router.put(
  '/:jobId',
  verifyAccessToken,
  validate(updateJobSchema),
  JobController.updateJob
);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted
 */
router.delete(
  '/:jobId',
  verifyAccessToken,
  validate(deleteJobSchema),
  JobController.deleteJob
);

/**
 * @swagger
 * /api/jobs/{jobId}/stats:
 *   get:
 *     summary: Get job statistics
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job statistics retrieved
 */
router.get(
  '/:jobId/stats',
  validate(getJobStatsSchema),
  JobController.getJobStats
);

/**
 * @swagger
 * /api/jobs/employer/{employerId}/stats:
 *   get:
 *     summary: Get employer statistics
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: employerId
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
 *         description: Employer statistics retrieved
 */
router.get(
  '/employer/:employerId/stats',
  validate(getEmployerStatsSchema),
  JobController.getEmployerStats
);

// ==================== APPLICATION ROUTES ====================

/**
 * @swagger
 * /api/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
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
 *               - coverLetter
 *               - documentIds
 *             properties:
 *               coverLetter:
 *                 type: string
 *               documentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Application submitted
 */
router.post(
  '/:jobId/apply',
  verifyAccessToken,
  validate(applyForJobSchema),
  JobController.applyForJob
);

/**
 * @swagger
 * /api/applications/my:
 *   get:
 *     summary: Get my job applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My applications retrieved
 */
router.get(
  '/applications/my',
  verifyAccessToken,
  JobController.getMyApplications
);

/**
 * @swagger
 * /api/applications/employer:
 *   get:
 *     summary: Get applications for my jobs (employer)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer applications retrieved
 */
router.get(
  '/applications/employer',
  verifyAccessToken,
  JobController.getEmployerApplications
);

/**
 * @swagger
 * /api/applications/{applicationId}/status:
 *   put:
 *     summary: Update application status (employer)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWED, REJECTED, INTERVIEW, HIRED]
 *               notes:
 *                 type: string
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Application status updated
 */
router.put(
  '/applications/:applicationId/status',
  verifyAccessToken,
  validate(updateApplicationStatusSchema),
  JobController.updateApplicationStatus
);

// ==================== BOOKMARK ROUTES ====================

/**
 * @swagger
 * /api/jobs/{jobId}/bookmark:
 *   post:
 *     summary: Bookmark/unbookmark a job
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark toggled
 */
router.post(
  '/:jobId/bookmark',
  verifyAccessToken,
  JobController.bookmarkJob
);

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: Get my bookmarked jobs
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmarked jobs retrieved
 */
router.get(
  '/bookmarks',
  verifyAccessToken,
  JobController.getBookmarkedJobs
);

// ==================== CATEGORY ROUTES ====================

/**
 * @swagger
 * /api/jobs/categories:
 *   post:
 *     summary: Create job category (admin)
 *     tags: [Job Categories]
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
  validate(createJobCategorySchema),
  JobController.createCategory
);

/**
 * @swagger
 * /api/jobs/categories:
 *   get:
 *     summary: Get all job categories
 *     tags: [Job Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved
 */
router.get(
  '/categories',
  JobController.getAllCategories
);

// ==================== SKILL ROUTES ====================

/**
 * @swagger
 * /api/jobs/skills:
 *   post:
 *     summary: Create skill (admin)
 *     tags: [Job Skills]
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
 *         description: Skill created
 */
router.post(
  '/skills',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(createSkillSchema),
  JobController.createSkill
);

/**
 * @swagger
 * /api/jobs/skills:
 *   get:
 *     summary: Get all skills
 *     tags: [Job Skills]
 *     responses:
 *       200:
 *         description: Skills retrieved
 */
router.get(
  '/skills',
  JobController.getAllSkills
);

// ==================== JOB ALERT ROUTES ====================

/**
 * @swagger
 * /api/job-alerts:
 *   post:
 *     summary: Create job alert
 *     tags: [Job Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keywords
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               frequency:
 *                 type: string
 *                 enum: [INSTANT, DAILY, WEEKLY]
 *                 default: DAILY
 *     responses:
 *       201:
 *         description: Job alert created
 */
router.post(
  '/job-alerts',
  verifyAccessToken,
  validate(createJobAlertSchema),
  JobController.createJobAlert
);

/**
 * @swagger
 * /api/job-alerts:
 *   get:
 *     summary: Get my job alerts
 *     tags: [Job Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job alerts retrieved
 */
router.get(
  '/job-alerts',
  verifyAccessToken,
  JobController.getMyJobAlerts
);

/**
 * @swagger
 * /api/job-alerts/{alertId}:
 *   put:
 *     summary: Update job alert
 *     tags: [Job Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
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
 *         description: Job alert updated
 */
router.put(
  '/job-alerts/:alertId',
  verifyAccessToken,
  validate(updateJobAlertSchema),
  JobController.updateJobAlert
);

/**
 * @swagger
 * /api/job-alerts/{alertId}:
 *   delete:
 *     summary: Delete job alert
 *     tags: [Job Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job alert deleted
 */
router.delete(
  '/job-alerts/:alertId',
  verifyAccessToken,
  JobController.deleteJobAlert
);

// ==================== COMPANY REVIEW ROUTES ====================

/**
 * @swagger
 * /api/employers/{employerId}/reviews:
 *   post:
 *     summary: Review an employer
 *     tags: [Company Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employerId
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
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post(
  '/employers/:employerId/reviews',
  verifyAccessToken,
  validate(createCompanyReviewSchema),
  JobController.createCompanyReview
);

/**
 * @swagger
 * /api/employers/{employerId}/reviews:
 *   get:
 *     summary: Get employer reviews
 *     tags: [Company Reviews]
 *     parameters:
 *       - in: path
 *         name: employerId
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
  '/employers/:employerId/reviews',
  validate(getCompanyReviewsQuerySchema),
  JobController.getCompanyReviews
);

export default router;