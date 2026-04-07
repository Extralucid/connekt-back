import express  from 'express';
const router = express.Router();
import PostController  from '../controllers/post.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  getPostParamSchema,
  deletePostSchema,
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  createCommentSchema,
  updateCommentSchema,
  getCommentsQuerySchema,
  moderateCommentSchema,
}  from '../schemas/postSchema.js';

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog post management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         post_id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         content:
 *           type: string
 *         excerpt:
 *           type: string
 *         featured_image_url:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         view_count:
 *           type: integer
 *         published_date:
 *           type: string
 *           format: date-time
 *         author:
 *           $ref: '#/components/schemas/User'
 *         categories:
 *           type: array
 *         tags:
 *           type: array
 *         _count:
 *           type: object
 *     
 *     Category:
 *       type: object
 *       properties:
 *         category_id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         postCount:
 *           type: integer
 *     
 *     Tag:
 *       type: object
 *       properties:
 *         tag_id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         postCount:
 *           type: integer
 *     
 *     Comment:
 *       type: object
 *       properties:
 *         comment_id:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         childComments:
 *           type: array
 */

// ==================== POST ROUTES ====================

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featured_image_url:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post(
  '/',
  verifyAccessToken,
  validate(createPostSchema),
  PostController.createPost
);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with filtering
 *     tags: [Posts]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: string
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts retrieved
 */
router.get(
  '/',
  validate(getPostsQuerySchema),
  PostController.getAllPosts
);

/**
 * @swagger
 * /api/posts/{identifier}:
 *   get:
 *     summary: Get post by ID or slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post retrieved
 *       404:
 *         description: Post not found
 */
router.get(
  '/:identifier',
  validate(getPostParamSchema),
  PostController.getPostById
);

/**
 * @swagger
 * /api/posts/{postId}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *         description: Post updated
 */
router.put(
  '/:postId',
  verifyAccessToken,
  validate(updatePostSchema),
  PostController.updatePost
);

/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *         description: Post deleted
 */
router.delete(
  '/:postId',
  verifyAccessToken,
  validate(deletePostSchema),
  PostController.deletePost
);

/**
 * @swagger
 * /api/posts/{postId}/related:
 *   get:
 *     summary: Get related posts
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Related posts retrieved
 */
router.get(
  '/:postId/related',
  PostController.getRelatedPosts
);

// ==================== CATEGORY ROUTES ====================

/**
 * @swagger
 * /api/posts/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
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
  validate(createCategorySchema),
  PostController.createCategory
);

/**
 * @swagger
 * /api/posts/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved
 */
router.get('/categories', PostController.getAllCategories);

/**
 * @swagger
 * /api/posts/categories/{categoryId}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
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
  validate(updateCategorySchema),
  PostController.updateCategory
);

/**
 * @swagger
 * /api/posts/categories/{categoryId}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
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
  PostController.deleteCategory
);

// ==================== TAG ROUTES ====================

/**
 * @swagger
 * /api/posts/tags:
 *   post:
 *     summary: Create a tag
 *     tags: [Tags]
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
 *         description: Tag created
 */
router.post(
  '/tags',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(createTagSchema),
  PostController.createTag
);

/**
 * @swagger
 * /api/posts/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Tags retrieved
 */
router.get('/tags', PostController.getAllTags);

/**
 * @swagger
 * /api/posts/tags/{tagId}:
 *   put:
 *     summary: Update tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
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
 *         description: Tag updated
 */
router.put(
  '/tags/:tagId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  //validate(updateTagSchema),
  PostController.updateTag
);

/**
 * @swagger
 * /api/posts/tags/{tagId}:
 *   delete:
 *     summary: Delete tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag deleted
 */
router.delete(
  '/tags/:tagId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  PostController.deleteTag
);

// ==================== COMMENT ROUTES ====================

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Add comment to post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post(
  '/:postId/comments',
  verifyAccessToken,
  validate(createCommentSchema),
  PostController.addComment
);

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Get post comments
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
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
  '/:postId/comments',
  validate(getCommentsQuerySchema),
  PostController.getComments
);

/**
 * @swagger
 * /api/posts/comments/{commentId}:
 *   put:
 *     summary: Update comment
 *     tags: [Comments]
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
  '/comments/:commentId',
  verifyAccessToken,
  validate(updateCommentSchema),
  PostController.updateComment
);

/**
 * @swagger
 * /api/posts/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Comments]
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
  '/comments/:commentId',
  verifyAccessToken,
  PostController.deleteComment
);

/**
 * @swagger
 * /api/posts/comments/{commentId}/moderate:
 *   put:
 *     summary: Moderate comment (admin only)
 *     tags: [Comments]
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
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *               moderationNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment moderated
 */
router.put(
  '/comments/:commentId/moderate',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  validate(moderateCommentSchema),
  PostController.moderateComment
);

export default router;