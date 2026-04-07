import express  from 'express';
const router = express.Router();
import PodcastController  from '../controllers/podcast.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createPodcastSchema,
  updatePodcastSchema,
  getPodcastsQuerySchema,
  getPodcastParamSchema,
  deletePodcastSchema,
  createEpisodeSchema,
  updateEpisodeSchema,
  getEpisodesQuerySchema,
  getEpisodeParamSchema,
  deleteEpisodeSchema,
  trackListenSchema,
  getListenStatsSchema,
  subscribeSchema,
  getSubscribersQuerySchema,
  createPodcastCommentSchema,
  updatePodcastCommentSchema,
  getPodcastCommentsQuerySchema,
  deletePodcastCommentSchema,
  addTranscriptSchema,
  updateTranscriptSchema,
  getPodcastStatsSchema,
}  from '../schemas/podcastSchema.js';

/**
 * @swagger
 * tags:
 *   name: Podcasts
 *   description: Podcast management, episodes, and subscriptions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Podcast:
 *       type: object
 *       properties:
 *         podcast_id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         coverImage:
 *           type: string
 *         isExplicit:
 *           type: boolean
 *         language:
 *           type: string
 *         categories:
 *           type: array
 *         totalEpisodes:
 *           type: integer
 *         totalListens:
 *           type: integer
 *         author:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     Episode:
 *       type: object
 *       properties:
 *         episode_id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         audioUrl:
 *           type: string
 *         duration:
 *           type: integer
 *         publishDate:
 *           type: string
 *           format: date-time
 *         listenCount:
 *           type: integer
 *         commentCount:
 *           type: integer
 *         podcast:
 *           $ref: '#/components/schemas/Podcast'
 *     
 *     PodcastComment:
 *       type: object
 *       properties:
 *         podcom_id:
 *           type: string
 *         content:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         replies:
 *           type: array
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ==================== PODCAST ROUTES ====================

/**
 * @swagger
 * /api/podcasts:
 *   post:
 *     summary: Create a new podcast
 *     tags: [Podcasts]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               isExplicit:
 *                 type: boolean
 *               language:
 *                 type: string
 *               categories:
 *                 type: array
 *     responses:
 *       201:
 *         description: Podcast created successfully
 */
router.post(
  '/',
  verifyAccessToken,
  validate(createPodcastSchema),
  PodcastController.createPodcast
);

/**
 * @swagger
 * /api/podcasts:
 *   get:
 *     summary: Get all podcasts with filtering
 *     tags: [Podcasts]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, totalListens, rating]
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Podcasts retrieved
 */
router.get(
  '/',
  validate(getPodcastsQuerySchema),
  PodcastController.getAllPodcasts
);

/**
 * @swagger
 * /api/podcasts/my:
 *   get:
 *     summary: Get my podcasts
 *     tags: [Podcasts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My podcasts retrieved
 */
router.get(
  '/my',
  verifyAccessToken,
  PodcastController.getMyPodcasts
);

/**
 * @swagger
 * /api/podcasts/{identifier}:
 *   get:
 *     summary: Get podcast by ID or slug
 *     tags: [Podcasts]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast retrieved
 *       404:
 *         description: Podcast not found
 */
router.get(
  '/:identifier',
  validate(getPodcastParamSchema),
  PodcastController.getPodcastById
);

/**
 * @swagger
 * /api/podcasts/{podcastId}:
 *   put:
 *     summary: Update podcast
 *     tags: [Podcasts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: podcastId
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
 *         description: Podcast updated
 */
router.put(
  '/:podcastId',
  verifyAccessToken,
  validate(updatePodcastSchema),
  PodcastController.updatePodcast
);

/**
 * @swagger
 * /api/podcasts/{podcastId}:
 *   delete:
 *     summary: Delete podcast
 *     tags: [Podcasts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast deleted
 */
router.delete(
  '/:podcastId',
  verifyAccessToken,
  validate(deletePodcastSchema),
  PodcastController.deletePodcast
);

/**
 * @swagger
 * /api/podcasts/{podcastId}/stats:
 *   get:
 *     summary: Get podcast statistics
 *     tags: [Podcasts]
 *     parameters:
 *       - in: path
 *         name: podcastId
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
 *         description: Podcast statistics retrieved
 */
router.get(
  '/:podcastId/stats',
  validate(getPodcastStatsSchema),
  PodcastController.getPodcastStats
);

// ==================== EPISODE ROUTES ====================

/**
 * @swagger
 * /api/podcasts/{podcastId}/episodes:
 *   post:
 *     summary: Create a new episode
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: podcastId
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
 *               - description
 *               - audioUrl
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               duration:
 *                 type: integer
 *               publishDate:
 *                 type: string
 *                 format: date-time
 *               transcript:
 *                 type: string
 *     responses:
 *       201:
 *         description: Episode created
 */
router.post(
  '/:podcastId/episodes',
  verifyAccessToken,
  validate(createEpisodeSchema),
  PodcastController.createEpisode
);

/**
 * @swagger
 * /api/podcasts/{podcastId}/episodes:
 *   get:
 *     summary: Get episodes by podcast
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: podcastId
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
 *           enum: [publishDate, createdAt, duration, title]
 *           default: publishDate
 *     responses:
 *       200:
 *         description: Episodes retrieved
 */
router.get(
  '/:podcastId/episodes',
  validate(getEpisodesQuerySchema),
  PodcastController.getEpisodesByPodcast
);

/**
 * @swagger
 * /api/episodes/{episodeId}:
 *   get:
 *     summary: Get episode by ID
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Episode retrieved
 *       404:
 *         description: Episode not found
 */
router.get(
  '/episodes/:episodeId',
  validate(getEpisodeParamSchema),
  PodcastController.getEpisodeById
);

/**
 * @swagger
 * /api/episodes/{episodeId}:
 *   put:
 *     summary: Update episode
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodeId
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
 *         description: Episode updated
 */
router.put(
  '/episodes/:episodeId',
  verifyAccessToken,
  validate(updateEpisodeSchema),
  PodcastController.updateEpisode
);

/**
 * @swagger
 * /api/episodes/{episodeId}:
 *   delete:
 *     summary: Delete episode
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Episode deleted
 */
router.delete(
  '/episodes/:episodeId',
  verifyAccessToken,
  validate(deleteEpisodeSchema),
  PodcastController.deleteEpisode
);

// ==================== LISTEN TRACKING ROUTES ====================

/**
 * @swagger
 * /api/episodes/{episodeId}/listen:
 *   post:
 *     summary: Track episode listen progress
 *     tags: [Listen Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodeId
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
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Listen tracked
 */
router.post(
  '/episodes/:episodeId/listen',
  verifyAccessToken,
  validate(trackListenSchema),
  PodcastController.trackListen
);

/**
 * @swagger
 * /api/episodes/{episodeId}/stats:
 *   get:
 *     summary: Get episode listen statistics
 *     tags: [Listen Tracking]
 *     parameters:
 *       - in: path
 *         name: episodeId
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
 *         description: Listen statistics retrieved
 */
router.get(
  '/episodes/:episodeId/stats',
  validate(getListenStatsSchema),
  PodcastController.getListenStats
);

// ==================== SUBSCRIPTION ROUTES ====================

/**
 * @swagger
 * /api/podcasts/{podcastId}/subscribe:
 *   post:
 *     summary: Subscribe/unsubscribe to podcast
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription toggled
 */
router.post(
  '/:podcastId/subscribe',
  verifyAccessToken,
  validate(subscribeSchema),
  PodcastController.subscribeToPodcast
);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get my podcast subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved
 */
router.get(
  '/subscriptions',
  verifyAccessToken,
  PodcastController.getUserSubscriptions
);

/**
 * @swagger
 * /api/podcasts/{podcastId}/subscribers:
 *   get:
 *     summary: Get podcast subscribers (author only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscribers retrieved
 */
router.get(
  '/:podcastId/subscribers',
  verifyAccessToken,
  validate(getSubscribersQuerySchema),
  PodcastController.getPodcastSubscribers
);

// ==================== COMMENT ROUTES ====================

/**
 * @swagger
 * /api/episodes/{episodeId}/comments:
 *   post:
 *     summary: Add comment to episode
 *     tags: [Podcast Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodeId
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
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post(
  '/episodes/:episodeId/comments',
  verifyAccessToken,
  validate(createPodcastCommentSchema),
  PodcastController.addComment
);

/**
 * @swagger
 * /api/episodes/{episodeId}/comments:
 *   get:
 *     summary: Get episode comments
 *     tags: [Podcast Comments]
 *     parameters:
 *       - in: path
 *         name: episodeId
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
 *     responses:
 *       200:
 *         description: Comments retrieved
 */
router.get(
  '/episodes/:episodeId/comments',
  validate(getPodcastCommentsQuerySchema),
  PodcastController.getComments
);

/**
 * @swagger
 * /api/podcast-comments/{commentId}:
 *   put:
 *     summary: Update comment
 *     tags: [Podcast Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *         description: Comment updated
 */
router.put(
  '/podcast-comments/:commentId',
  verifyAccessToken,
  validate(updatePodcastCommentSchema),
  PodcastController.updateComment
);

/**
 * @swagger
 * /api/podcast-comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Podcast Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete(
  '/podcast-comments/:commentId',
  verifyAccessToken,
  validate(deletePodcastCommentSchema),
  PodcastController.deleteComment
);

// ==================== TRANSCRIPT ROUTES ====================

/**
 * @swagger
 * /api/episodes/{episodeId}/transcript:
 *   post:
 *     summary: Add transcript to episode
 *     tags: [Transcripts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodeId
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
 *               language:
 *                 type: string
 *                 default: en
 *     responses:
 *       201:
 *         description: Transcript added
 */
router.post(
  '/episodes/:episodeId/transcript',
  verifyAccessToken,
  validate(addTranscriptSchema),
  PodcastController.addTranscript
);

/**
 * @swagger
 * /api/episodes/{episodeId}/transcript:
 *   get:
 *     summary: Get episode transcript
 *     tags: [Transcripts]
 *     parameters:
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transcript retrieved
 *       404:
 *         description: Transcript not found
 */
router.get(
  '/episodes/:episodeId/transcript',
  validate(getEpisodeParamSchema),
  PodcastController.getTranscript
);

export default router;