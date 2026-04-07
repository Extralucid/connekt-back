import express  from 'express';
const router = express.Router();
import UploadController  from '../controllers/upload.controller.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import { 
  profileUpload, 
  documentUpload, 
  multipleDocumentsUpload 
}  from '../middleware/upload.js';

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         iddocument:
 *           type: string
 *         name:
 *           type: string
 *         originalName:
 *           type: string
 *         fileName:
 *           type: string
 *         fileType:
 *           type: string
 *         fileSize:
 *           type: integer
 *         fileUrl:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/upload/presigned-url:
 *   post:
 *     summary: Generate presigned URL for direct upload
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileType
 *             properties:
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               folder:
 *                 type: string
 *                 default: uploads
 *     responses:
 *       200:
 *         description: Presigned URL generated
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
 *                     uploadUrl:
 *                       type: string
 *                     fileUrl:
 *                       type: string
 *                     key:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 */
router.post(
  '/presigned-url',
  verifyAccessToken,
  UploadController.getPresignedUrl
);

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded
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
 *                     url:
 *                       type: string
 *                     document:
 *                       $ref: '#/components/schemas/Document'
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/profile',
  verifyAccessToken,
  profileUpload,
  UploadController.uploadProfilePicture
);

/**
 * @swagger
 * /api/upload/document/{module}:
 *   post:
 *     summary: Upload a document
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *         description: Module name (e.g., posts, jobs, tutorials)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *               published:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 */
router.post(
  '/document/:module',
  verifyAccessToken,
  documentUpload,
  UploadController.uploadDocument
);

/**
 * @swagger
 * /api/upload/documents/{module}:
 *   post:
 *     summary: Upload multiple documents
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
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
 *                     $ref: '#/components/schemas/Document'
 */
router.post(
  '/documents/:module',
  verifyAccessToken,
  multipleDocumentsUpload,
  UploadController.uploadMultipleDocuments
);

/**
 * @swagger
 * /api/upload/documents:
 *   get:
 *     summary: List user documents
 *     tags: [Upload]
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
 *         name: fileType
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documents retrieved
 */
router.get(
  '/documents',
  verifyAccessToken,
  UploadController.listUserDocuments
);

/**
 * @swagger
 * /api/upload/document/{documentId}/url:
 *   get:
 *     summary: Get document URL (signed for private files)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document URL generated
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
 *                     url:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Document not found
 */
router.get(
  '/document/:documentId/url',
  verifyAccessToken,
  UploadController.getDocumentUrl
);

/**
 * @swagger
 * /api/upload/document/{documentId}:
 *   delete:
 *     summary: Delete document
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.delete(
  '/document/:documentId',
  verifyAccessToken,
  UploadController.deleteDocument
);

/**
 * @swagger
 * /api/upload/admin/documents:
 *   get:
 *     summary: Get all documents (admin only)
 *     tags: [Upload]
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
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documents retrieved
 *       403:
 *         description: Admin access required
 */
router.get(
  '/admin/documents',
  verifyAccessToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  async (req, res, next) => {
    try {
      const prisma = require('../config/database');
      const { page = 1, limit = 20, userId, fileType } = req.query;
      const skip = (page - 1) * limit;
      
      const where = { isDeleted: false };
      if (userId) where.userId = userId;
      if (fileType) where.fileType = { contains: fileType };
      
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: { User: { select: { display_name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.document.count({ where }),
      ]);
      
      res.json({
        success: true,
        data: {
          documents,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;