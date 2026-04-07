import express  from 'express';
const router = express.Router();
import UserController  from '../controllers/user.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import rateLimiter from '../middleware/rateLimiter.js';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  getUsersQuerySchema,
  userIdParamSchema,
  getUserActivitySchema,
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  deleteAccountSchema,
  getTopUsersSchema,
  batchUserUpdateSchema,
}  from '../schemas/userSchema.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         email:
 *           type: string
 *           example: user@example.com
 *         phone:
 *           type: string
 *           example: +237612345678
 *         display_name:
 *           type: string
 *           example: John Doe
 *         username:
 *           type: string
 *           example: johndoe
 *         profile_picture_url:
 *           type: string
 *           example: https://cdn.example.com/profiles/avatar.jpg
 *         bio:
 *           type: string
 *         accountType:
 *           type: string
 *           enum: [INDIVIDUAL, COMPANY, UNIVERSITY, GOVERNMENT, NGO]
 *         status:
 *           type: string
 *           enum: [PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED]
 *         email_verified_at:
 *           type: string
 *           format: date-time
 *         phone_verified_at:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 *     
 *     UserStats:
 *       type: object
 *       properties:
 *         postsCount:
 *           type: integer
 *         commentsCount:
 *           type: integer
 *         topicsCount:
 *           type: integer
 *         repliesCount:
 *           type: integer
 *         applicationsCount:
 *           type: integer
 *         bookmarksCount:
 *           type: integer
 *         achievementsCount:
 *           type: integer
 *         totalPoints:
 *           type: integer
 *         level:
 *           type: integer
 *     
 *     Notification:
 *       type: object
 *       properties:
 *         notification_id:
 *           type: string
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', verifyAccessToken, UserController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               username:
 *                 type: string
 *               display_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer_not_to_say]
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/profile',
  verifyAccessToken,
  validate(updateProfileSchema),
  UserController.updateProfile
);

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', verifyAccessToken, UserController.getPreferences);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 example: en
 *               notifyNewContent:
 *                 type: boolean
 *               bookCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tutorialTopics:
 *                 type: array
 *                 items:
 *                   type: string
 *               blogCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               jobCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/preferences',
  verifyAccessToken,
  validate(updatePreferencesSchema),
  UserController.updatePreferences
);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 */
router.get('/stats', verifyAccessToken, UserController.getStats);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     summary: Get user activity log
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to return
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *         description: Filter by activity type
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: User activity retrieved
 */
router.get(
  '/activity',
  verifyAccessToken,
  validate(getUserActivitySchema),
  UserController.getActivity
);

/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 */
router.get(
  '/notifications',
  verifyAccessToken,
  validate(getNotificationsQuerySchema),
  UserController.getNotifications
);

/**
 * @swagger
 * /api/users/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put(
  '/notifications/read-all',
  verifyAccessToken,
  UserController.markAllNotificationsRead
);

/**
 * @swagger
 * /api/users/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark a specific notification as read
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put(
  '/notifications/:notificationId/read',
  verifyAccessToken,
  validate(notificationIdParamSchema),
  UserController.markNotificationRead
);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Invalid password
 */
router.delete(
  '/account',
  verifyAccessToken,
  validate(deleteAccountSchema),
  UserController.deleteAccount
);

/**
 * @swagger
 * /api/users/top:
 *   get:
 *     summary: Get top users by category
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [points, posts, comments, engagement, followers]
 *           default: points
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, week, month, year]
 *           default: all
 *     responses:
 *       200:
 *         description: Top users retrieved
 */
router.get(
  '/top',
  validate(getTopUsersSchema),
  UserController.getTopUsers
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Search users (admin only)
 *     tags: [Users]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [INDIVIDUAL, COMPANY, UNIVERSITY, GOVERNMENT, NGO]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, BANNED, PENDING_VERIFICATION]
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved
 *       403:
 *         description: Admin access required
 */
router.get(
  '/',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validate(getUsersQuerySchema),
  UserController.searchUsers
);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.get(
  '/:userId',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validate(userIdParamSchema),
  UserController.getUserById
);

/**
 * @swagger
 * /api/users/batch:
 *   post:
 *     summary: Batch update users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - action
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               action:
 *                 type: string
 *                 enum: [activate, suspend, ban, delete, assignRole, removeRole]
 *               roleName:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Batch update completed
 *       403:
 *         description: Admin access required
 */
router.post(
  '/batch',
  verifyAccessToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  validate(batchUserUpdateSchema),
  rateLimiter.userRateLimiter(10, 60000),
  UserController.batchUpdate
);

export default router;