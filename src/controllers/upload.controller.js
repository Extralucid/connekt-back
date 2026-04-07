import S3Service from '../services/s3.service.js';
import prisma  from '../config/database.js';

class UploadController {
  /**
   * Generate presigned URL for direct upload
   */
  static async getPresignedUrl(req, res, next) {
    try {
      const { fileName, fileType, folder = 'uploads' } = req.body;
      
      if (!fileName || !fileType) {
        return res.status(400).json({
          success: false,
          message: 'fileName and fileType are required',
        });
      }
      
      const result = await S3Service.generatePresignedUploadUrl(
        fileName,
        fileType,
        req.userId,
        folder
      );
      
      res.json({
        success: true,
        message: 'Presigned URL generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }
      
      // Upload to S3
      const uploadResult = await S3Service.uploadFile(
        req.file,
        'profiles',
        req.userId
      );
      
      // Get old profile picture URL
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { profile_picture_url: true },
      });
      
      // Delete old profile picture from S3 if exists
      if (user.profile_picture_url) {
        const oldKey = S3Service.extractKeyFromUrl(user.profile_picture_url);
        if (oldKey) {
          await S3Service.deleteFile(oldKey).catch(console.error);
        }
      }
      
      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id: req.userId },
        data: {
          profile_picture_url: uploadResult.location,
          updatedAt: new Date(),
        },
      });
      
      // Save document record
      const document = await prisma.document.create({
        data: {
          fileUrl: uploadResult.location,
          name: req.file.originalname,
          originalName: req.file.originalname,
          fileName: uploadResult.key.split('/').pop(),
          fileType: req.file.mimetype,
          mimeType: req.file.mimetype,
          fileExtension: req.file.originalname.split('.').pop(),
          fileSize: req.file.size,
          storagePath: uploadResult.key,
          storageProvider: 'S3',
          userId: req.userId,
          published: true,
        },
      });
      
      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          url: uploadResult.location,
          document,
          user: {
            id: updatedUser.id,
            profile_picture_url: updatedUser.profile_picture_url,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload document
   */
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }
      
      const folder = req.params.module || 'documents';
      
      // Upload to S3
      const uploadResult = await S3Service.uploadFile(
        req.file,
        folder,
        req.userId
      );
      
      // Save document metadata to database
      const document = await prisma.document.create({
        data: {
          fileUrl: uploadResult.location,
          name: req.body.name || req.file.originalname,
          originalName: req.file.originalname,
          fileName: uploadResult.key.split('/').pop(),
          fileType: req.file.mimetype,
          mimeType: req.file.mimetype,
          fileExtension: req.file.originalname.split('.').pop(),
          fileSize: req.file.size,
          storagePath: uploadResult.key,
          storageProvider: 'S3',
          description: req.body.description,
          userId: req.userId,
          published: req.body.published === 'true' || true,
        },
      });
      
      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple documents
   */
  static async uploadMultipleDocuments(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }
      
      const folder = req.params.module || 'documents';
      
      // Upload all files to S3
      const uploadResults = await S3Service.uploadMultipleFiles(
        req.files,
        folder,
        req.userId
      );
      
      // Save all document metadata to database
      const documents = await Promise.all(
        uploadResults.files.map(async (result, index) => {
          const file = req.files[index];
          return prisma.document.create({
            data: {
              fileUrl: result.location,
              name: file.originalname,
              originalName: file.originalname,
              fileName: result.key.split('/').pop(),
              fileType: file.mimetype,
              mimeType: file.mimetype,
              fileExtension: file.originalname.split('.').pop(),
              fileSize: file.size,
              storagePath: result.key,
              storageProvider: 'S3',
              userId: req.userId,
              published: true,
            },
          });
        })
      );
      
      res.status(201).json({
        success: true,
        message: `${documents.length} documents uploaded successfully`,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(req, res, next) {
    try {
      const document = await prisma.document.findUnique({
        where: { iddocument: req.params.documentId },
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }
      
      // Check ownership or admin role
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      if (document.userId !== req.userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this document',
        });
      }
      
      // Delete from S3
      const key = S3Service.extractKeyFromUrl(document.fileUrl);
      if (key) {
        await S3Service.deleteFile(key);
      }
      
      // Soft delete from database
      await prisma.document.update({
        where: { iddocument: req.params.documentId },
        data: {
          isDeleted: true,
          published: false,
          updatedAt: new Date(),
        },
      });
      
      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get signed URL for document (for private files)
   */
  static async getDocumentUrl(req, res, next) {
    try {
      const document = await prisma.document.findUnique({
        where: { iddocument: req.params.documentId },
      });
      
      if (!document || document.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }
      
      // Check permissions
      const isOwner = document.userId === req.userId;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      if (!document.isPublic && !isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this document',
        });
      }
      
      // Generate signed URL for private files
      let url = document.fileUrl;
      if (!document.isPublic) {
        const key = S3Service.extractKeyFromUrl(document.fileUrl);
        const signedUrlResult = await S3Service.generatePresignedDownloadUrl(
          key,
          document.originalName,
          3600 // 1 hour
        );
        url = signedUrlResult.url;
      }
      
      // Update access count
      await prisma.document.update({
        where: { iddocument: req.params.documentId },
        data: { accessCount: { increment: 1 } },
      });
      
      res.json({
        success: true,
        data: {
          url,
          documentId: document.iddocument,
          fileName: document.originalName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          expiresIn: document.isPublic ? null : 3600,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List user documents
   */
  static async listUserDocuments(req, res, next) {
    try {
      const { page = 1, limit = 20, fileType, search } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {
        userId: req.userId,
        isDeleted: false,
      };
      
      if (fileType) {
        where.fileType = { contains: fileType };
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: parseInt(limit),
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
}

export default UploadController;