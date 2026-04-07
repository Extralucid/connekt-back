import express  from 'express';
const router = express.Router();
import ForumController  from '../controllers/forum.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createForumSchema,
  updateForumSchema,
  getForumsQuerySchema,
  createTopicSchema,
  updateTopicSchema,
  getTopicsQuerySchema,
  getTopicParamSchema,
  deleteTopicSchema,
  pinTopicSchema,
  closeTopicSchema,
  createReplySchema,
  updateReplySchema,
  getRepliesQuerySchema,
  voteOnReplySchema,
  acceptAnswerSchema,
  getForumStatsSchema,
}  from '../schemas/forumSchema.js';

/**
 * @swagger
 * tags:
 *   name: Forums
 *   description: Forum, topics, and replies management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Forum:
 *       type: object
 *       properties:
 *         forum_id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         displayOrder:
 *           type: integer
 *         parentForumId:
 *           type: string
 *         childForums:
 *           type: array
 *         topicCount:
 *           type: integer
 *         replyCount:
 *           type: integer
 *     
 *     Topic:
 *       type: object
 *       properties:
 *         topic_id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         content:
 *           type: string
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, PINNED, ARCHIVED]
 *         view_count:
 *           type: integer
 *         author:
 *           $ref: '#/components/schemas/User'
 *         replyCount:
 *           type: integer
 *         lastReply:
 *           type: object
 *     
 *     Reply:
 *       type: object
 *       properties:
 *         reply_id:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/User'
 *         isAcceptedAnswer:
 *           type: boolean
 *         votes:
 *           type: object
 *         upvotes:
 *           type: integer
 *         downvotes:
 *           type: integer
 *         score:
 *           type: integer
 */

// ==================== FORUM ROUTES ====================

/**
 * @swagger
 * /api/forums:
 *   post:
 *     summary: Create a new forum (admin only)
 *     tags: [Forums]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               slug:
 *                 type: string
 *               parentForumId:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Forum created
 */
router.post(
  '/',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(createForumSchema),
  ForumController.createForum
);

/**
 * @swagger
 * /api/forums:
 *   get:
 *     summary: Get all forums
 *     tags: [Forums]
 *     parameters:
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: includeSubForums
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Forums retrieved
 */
router.get(
  '/',
  validate(getForumsQuerySchema),
  ForumController.getAllForums
);

/**
 * @swagger
 * /api/forums/{forumId}:
 *   get:
 *     summary: Get forum by ID
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Forum retrieved
 *       404:
 *         description: Forum not found
 */
router.get(
  '/:forumId',
  //validate(getForumByIdSchema),
  ForumController.getForumById
);

/**
 * @swagger
 * /api/forums/{forumId}:
 *   put:
 *     summary: Update forum (admin only)
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
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
 *         description: Forum updated
 */
router.put(
  '/:forumId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(updateForumSchema),
  ForumController.updateForum
);

/**
 * @swagger
 * /api/forums/{forumId}:
 *   delete:
 *     summary: Delete forum (admin only)
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forum deleted
 */
router.delete(
  '/:forumId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  ForumController.deleteForum
);

/**
 * @swagger
 * /api/forums/{forumId}/stats:
 *   get:
 *     summary: Get forum statistics
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: forumId
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
 *         description: Forum statistics retrieved
 */
router.get(
  '/:forumId/stats',
  validate(getForumStatsSchema),
  ForumController.getForumStats
);

// ==================== TOPIC ROUTES ====================

/**
 * @swagger
 * /api/forums/{forumId}/topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
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
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               slug:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED, PINNED, ARCHIVED]
 *     responses:
 *       201:
 *         description: Topic created
 */
router.post(
  '/:forumId/topics',
  verifyAccessToken,
  validate(createTopicSchema),
  ForumController.createTopic
);

/**
 * @swagger
 * /api/forums/{forumId}/topics:
 *   get:
 *     summary: Get topics by forum
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: forumId
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED, PINNED, ARCHIVED]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, view_count, lastReplyAt]
 *           default: lastReplyAt
 *     responses:
 *       200:
 *         description: Topics retrieved
 */
router.get(
  '/:forumId/topics',
  validate(getTopicsQuerySchema),
  ForumController.getTopicsByForum
);

/**
 * @swagger
 * /api/topics/{identifier}:
 *   get:
 *     summary: Get topic by ID or slug
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic retrieved
 *       404:
 *         description: Topic not found
 */
router.get(
  '/topics/:identifier',
  validate(getTopicParamSchema),
  ForumController.getTopicById
);

/**
 * @swagger
 * /api/topics/{topicId}:
 *   put:
 *     summary: Update topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
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
 *         description: Topic updated
 */
router.put(
  '/topics/:topicId',
  verifyAccessToken,
  validate(updateTopicSchema),
  ForumController.updateTopic
);

/**
 * @swagger
 * /api/topics/{topicId}:
 *   delete:
 *     summary: Delete topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permanent:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Topic deleted
 */
router.delete(
  '/topics/:topicId',
  verifyAccessToken,
  validate(deleteTopicSchema),
  ForumController.deleteTopic
);

/**
 * @swagger
 * /api/topics/{topicId}/pin:
 *   put:
 *     summary: Pin/unpin topic (moderator only)
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
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
 *               - pin
 *             properties:
 *               pin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Topic pin status updated
 */
router.put(
  '/topics/:topicId/pin',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  validate(pinTopicSchema),
  ForumController.pinTopic
);

/**
 * @swagger
 * /api/topics/{topicId}/close:
 *   put:
 *     summary: Close/open topic (moderator only)
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
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
 *               - close
 *             properties:
 *               close:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Topic status updated
 */
router.put(
  '/topics/:topicId/close',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  validate(closeTopicSchema),
  ForumController.closeTopic
);

// ==================== REPLY ROUTES ====================

/**
 * @swagger
 * /api/topics/{topicId}/replies:
 *   post:
 *     summary: Add reply to topic
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               isAcceptedAnswer:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Reply added
 */
router.post(
  '/topics/:topicId/replies',
  verifyAccessToken,
  validate(createReplySchema),
  ForumController.addReply
);

/**
 * @swagger
 * /api/topics/{topicId}/replies:
 *   get:
 *     summary: Get topic replies
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: topicId
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, votes]
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Replies retrieved
 */
router.get(
  '/topics/:topicId/replies',
  validate(getRepliesQuerySchema),
  ForumController.getReplies
);

/**
 * @swagger
 * /api/replies/{replyId}:
 *   put:
 *     summary: Update reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated
 */
router.put(
  '/replies/:replyId',
  verifyAccessToken,
  validate(updateReplySchema),
  ForumController.updateReply
);

/**
 * @swagger
 * /api/replies/{replyId}:
 *   delete:
 *     summary: Delete reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reply deleted
 */
router.delete(
  '/replies/:replyId',
  verifyAccessToken,
  ForumController.deleteReply
);

// ==================== VOTE ROUTES ====================

/**
 * @swagger
 * /api/replies/{replyId}/vote:
 *   post:
 *     summary: Vote on a reply
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
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
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [UPVOTE, DOWNVOTE]
 *     responses:
 *       200:
 *         description: Vote recorded
 */
router.post(
  '/replies/:replyId/vote',
  verifyAccessToken,
  validate(voteOnReplySchema),
  ForumController.voteOnReply
);

/**
 * @swagger
 * /api/replies/{replyId}/accept:
 *   put:
 *     summary: Accept/reject as answer (topic author only)
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
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
 *               - accept
 *             properties:
 *               accept:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Answer status updated
 */
router.put(
  '/replies/:replyId/accept',
  verifyAccessToken,
  validate(acceptAnswerSchema),
  ForumController.acceptAnswer
);

export default router;