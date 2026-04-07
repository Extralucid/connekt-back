import express  from 'express';
const router = express.Router();
import BookController  from '../controllers/book.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
  getBookParamSchema,
  deleteBookSchema,
  createBookCategorySchema,
  updateBookCategorySchema,
  addToLibrarySchema,
  updateReadingProgressSchema,
  getUserLibraryQuerySchema,
  createBookReviewSchema,
  updateBookReviewSchema,
  getBookReviewsQuerySchema,
  deleteBookReviewSchema,
  getBookStatsSchema,
  getReadingStatsSchema,
}  from '../schemas/bookSchema.js';

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Digital library, books, reading progress, and reviews
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         book_id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         coverImage:
 *           type: string
 *         author:
 *           type: string
 *         price:
 *           type: number
 *         pages:
 *           type: integer
 *         isbn:
 *           type: string
 *         publisher:
 *           type: string
 *         language:
 *           type: string
 *         averageRating:
 *           type: number
 *         reviewCount:
 *           type: integer
 *         readersCount:
 *           type: integer
 *         categories:
 *           type: array
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     BookCategory:
 *       type: object
 *       properties:
 *         bookcat_id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         bookCount:
 *           type: integer
 *     
 *     BookReview:
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
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     UserBook:
 *       type: object
 *       properties:
 *         progress:
 *           type: integer
 *         addedAt:
 *           type: string
 *           format: date-time
 *         lastRead:
 *           type: string
 *           format: date-time
 *         book:
 *           $ref: '#/components/schemas/Book'
 */

// ==================== BOOK ROUTES ====================

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book (admin only)
 *     tags: [Books]
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
 *               - author
 *               - categoryIds
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               author:
 *                 type: string
 *               price:
 *                 type: number
 *               fileUrl:
 *                 type: string
 *               pages:
 *                 type: integer
 *               isbn:
 *                 type: string
 *               publisher:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               language:
 *                 type: string
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 */
router.post(
  '/',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(createBookSchema),
  BookController.createBook
);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with filtering
 *     tags: [Books]
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
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
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
 *           enum: [title, author, price, createdAt, publishedDate]
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Books retrieved
 */
router.get(
  '/',
  validate(getBooksQuerySchema),
  BookController.getAllBooks
);

/**
 * @swagger
 * /api/books/featured:
 *   get:
 *     summary: Get featured books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Featured books retrieved
 */
router.get(
  '/featured',
  BookController.getFeaturedBooks
);

/**
 * @swagger
 * /api/books/{identifier}:
 *   get:
 *     summary: Get book by ID or slug
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book retrieved
 *       404:
 *         description: Book not found
 */
router.get(
  '/:identifier',
  validate(getBookParamSchema),
  BookController.getBookById
);

/**
 * @swagger
 * /api/books/{bookId}:
 *   put:
 *     summary: Update book (admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
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
 *         description: Book updated
 */
router.put(
  '/:bookId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(updateBookSchema),
  BookController.updateBook
);

/**
 * @swagger
 * /api/books/{bookId}:
 *   delete:
 *     summary: Delete book (admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted
 */
router.delete(
  '/:bookId',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validate(deleteBookSchema),
  BookController.deleteBook
);

/**
 * @swagger
 * /api/books/{bookId}/stats:
 *   get:
 *     summary: Get book statistics
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book statistics retrieved
 */
router.get(
  '/:bookId/stats',
  validate(getBookStatsSchema),
  BookController.getBookStats
);

// ==================== CATEGORY ROUTES ====================

/**
 * @swagger
 * /api/books/categories:
 *   post:
 *     summary: Create book category (admin only)
 *     tags: [Book Categories]
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
  validate(createBookCategorySchema),
  BookController.createCategory
);

/**
 * @swagger
 * /api/books/categories:
 *   get:
 *     summary: Get all book categories
 *     tags: [Book Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved
 */
router.get(
  '/categories',
  BookController.getAllCategories
);

/**
 * @swagger
 * /api/books/categories/{categoryId}:
 *   put:
 *     summary: Update book category (admin only)
 *     tags: [Book Categories]
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
  validate(updateBookCategorySchema),
  BookController.updateCategory
);

/**
 * @swagger
 * /api/books/categories/{categoryId}:
 *   delete:
 *     summary: Delete book category (admin only)
 *     tags: [Book Categories]
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
  BookController.deleteCategory
);

// ==================== USER LIBRARY ROUTES ====================

/**
 * @swagger
 * /api/books/{bookId}/library:
 *   post:
 *     summary: Add book to my library
 *     tags: [User Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Book added to library
 */
router.post(
  '/:bookId/library',
  verifyAccessToken,
  validate(addToLibrarySchema),
  BookController.addToLibrary
);

/**
 * @swagger
 * /api/books/{bookId}/library:
 *   delete:
 *     summary: Remove book from my library
 *     tags: [User Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book removed from library
 */
router.delete(
  '/:bookId/library',
  verifyAccessToken,
  validate(addToLibrarySchema),
  BookController.removeFromLibrary
);

/**
 * @swagger
 * /api/books/{bookId}/progress:
 *   put:
 *     summary: Update reading progress
 *     tags: [User Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
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
 *               - progress
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               currentPage:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put(
  '/:bookId/progress',
  verifyAccessToken,
  validate(updateReadingProgressSchema),
  BookController.updateReadingProgress
);

/**
 * @swagger
 * /api/my-library:
 *   get:
 *     summary: Get my library
 *     tags: [User Library]
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
 *           enum: [reading, completed, wishlist]
 *     responses:
 *       200:
 *         description: Library retrieved
 */
router.get(
  '/my-library',
  verifyAccessToken,
  validate(getUserLibraryQuerySchema),
  BookController.getUserLibrary
);

/**
 * @swagger
 * /api/my-library/stats:
 *   get:
 *     summary: Get my reading statistics
 *     tags: [User Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reading statistics retrieved
 */
router.get(
  '/my-library/stats',
  verifyAccessToken,
  BookController.getReadingStats
);

// ==================== REVIEW ROUTES ====================

/**
 * @swagger
 * /api/books/{bookId}/reviews:
 *   post:
 *     summary: Add review to book
 *     tags: [Book Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
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
 *     responses:
 *       201:
 *         description: Review added
 */
router.post(
  '/:bookId/reviews',
  verifyAccessToken,
  validate(createBookReviewSchema),
  BookController.addReview
);

/**
 * @swagger
 * /api/books/{bookId}/reviews:
 *   get:
 *     summary: Get book reviews
 *     tags: [Book Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
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
  '/:bookId/reviews',
  validate(getBookReviewsQuerySchema),
  BookController.getBookReviews
);

/**
 * @swagger
 * /api/book-reviews/{reviewId}:
 *   put:
 *     summary: Update review
 *     tags: [Book Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Review updated
 */
router.put(
  '/book-reviews/:reviewId',
  verifyAccessToken,
  validate(updateBookReviewSchema),
  BookController.updateReview
);

/**
 * @swagger
 * /api/book-reviews/{reviewId}:
 *   delete:
 *     summary: Delete review
 *     tags: [Book Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete(
  '/book-reviews/:reviewId',
  verifyAccessToken,
  validate(deleteBookReviewSchema),
  BookController.deleteReview
);

export default router;