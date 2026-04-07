import {
    s3Client,
    BUCKET_NAME,
} from '../config/s3.config.js';
import {
    PutObjectCommand,
    GetObjectCommand,
    CopyObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
    HeadBucketCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Constants
const FILE_SIZE_LIMITS = {
    IMAGE: 5 * 1024 * 1024,      // 5MB
    VIDEO: 100 * 1024 * 1024,    // 100MB
    AUDIO: 50 * 1024 * 1024,     // 50MB
    PDF: 20 * 1024 * 1024,       // 20MB
    DOCUMENT: 50 * 1024 * 1024,  // 50MB
    GENERAL: 10 * 1024 * 1024,   // 10MB
};

const ALLOWED_MIME_TYPES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'],
    PDF: ['application/pdf'],
    DOCUMENT: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
    ],
};

class S3Service {
    constructor() {
        this.bucket = BUCKET_NAME;
        this.publicUrl = `${process.env.S3_PUBLIC_URL}`;;
    }

    /**
     * Initialize bucket if it doesn't exist
     */
    static async initializeBucket() {
        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
            console.log(`✅ Bucket ${BUCKET_NAME} exists`);
            console.log(`Bucket ${BUCKET_NAME} exists`);
        } catch (error) {
            if (error.name === 'NotFound') {
                console.log(`Creating bucket ${BUCKET_NAME}`);
                await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
            } else {
                throw error;
            }
        }
    }

    /**
     * Generate presigned URL for direct upload from client
     */
    static async generatePresignedUploadUrl(fileName, fileType, userId, folder = 'uploads') {
        try {
            const fileExtension = path.extname(fileName);
            const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

            // Organize files by user, folder, and date
            const date = new Date().toISOString().split('T')[0];
            const key = `${folder}/${userId}/${date}/${uniqueFileName}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: fileType,
                Metadata: {
                    originalName: Buffer.from(fileName).toString('base64'),
                    uploadedBy: userId.toString(),
                    uploadedAt: new Date().toISOString(),
                },
            });

            const presignedUrl = await getSignedUrl(s3Client, command, {
                expiresIn: parseInt(process.env.PRESIGNED_URL_EXPIRY) || 900, // 15 minutes default
            });

            const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

            return {
                uploadUrl: presignedUrl,
                fileUrl: publicUrl,
                key,
                fileName: uniqueFileName,
                originalName: fileName,
                expiresIn: parseInt(process.env.PRESIGNED_URL_EXPIRY) || 900,
            };
        } catch (error) {
            throw new Error(`Failed to generate presigned URL: ${error.message}`);
        }
    }

    /**
     * Upload file buffer directly to S3
     */
    static async uploadFile(file, folder = 'uploads', userId = null) {
        try {
            this.validateFile(file);

            const timestamp = Date.now();
            const sanitizedName = file.originalname.replace(/\s/g, '_');
            const key = `${folder}/${userId ? userId + '/' : ''}${timestamp}-${sanitizedName}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    originalName: Buffer.from(file.originalname).toString('base64'),
                    uploadedAt: new Date().toISOString(),
                    fileSize: file.size.toString(),
                    ...(userId && { uploadedBy: userId.toString() }),
                },
            });

            const result = await s3Client.send(command);

            return {
                success: true,
                location: `${PUBLIC_URL}/${key}`,
                key: key,
                bucket: BUCKET_NAME,
                etag: result.ETag,
                originalName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
            };
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Upload multiple files
     */
    static async uploadMultipleFiles(files, folder = 'uploads', userId = null) {
        try {
            const uploadPromises = files.map(file => this.uploadFile(file, folder, userId));
            const results = await Promise.all(uploadPromises);

            return {
                success: true,
                files: results,
                count: results.length,
            };
        } catch (error) {
            throw new Error(`Bulk upload failed: ${error.message}`);
        }
    }

    /**
     * Upload buffer directly (for generated content)
     */
    static async uploadBuffer(buffer, fileName, mimeType, folder = 'uploads', userId = null) {
        try {
            const timestamp = Date.now();
            const sanitizedName = fileName.replace(/\s/g, '_');
            const key = `${folder}/${userId ? userId + '/' : ''}${timestamp}-${sanitizedName}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                Metadata: {
                    originalName: Buffer.from(fileName).toString('base64'),
                    uploadedAt: new Date().toISOString(),
                    ...(userId && { uploadedBy: userId.toString() }),
                },
            });

            await s3Client.send(command);

            return {
                location: `${process.env.S3_PUBLIC_URL}/${key}`,
                key: key,
                bucket: BUCKET_NAME,
            };
        } catch (error) {
            throw new Error(`Buffer upload failed: ${error.message}`);
        }
    }

    /**
     * Generate presigned URL for download (private files)
     */
    static async generatePresignedDownloadUrl(key, fileName, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
            });

            const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });

            return {
                url: presignedUrl,
                expiresIn,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            };
        } catch (error) {
            throw new Error(`Failed to generate download URL: ${error.message}`);
        }
    }

    /**
     * Copy file within S3
     */
    static async copyFile(sourceKey, destinationFolder, userId = null) {
        try {
            const fileName = sourceKey.split('/').pop();
            const timestamp = Date.now();
            const destinationKey = `${destinationFolder}/${userId ? userId + '/' : ''}${timestamp}-${fileName}`;

            const command = new CopyObjectCommand({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${sourceKey}`,
                Key: destinationKey,
                MetadataDirective: 'COPY',
            });

            await s3Client.send(command);

            return {
                sourceKey,
                destinationKey,
                location: `${process.env.S3_PUBLIC_URL}/${destinationKey}`,
            };
        } catch (error) {
            throw new Error(`Copy failed: ${error.message}`);
        }
    }

    /**
     * Delete single file
     */
    static async deleteFile(key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(command);

            return {
                success: true,
                message: 'File deleted successfully',
                key,
            };
        } catch (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    }

    /**
     * Delete multiple files
     */
    static async deleteFiles(keys) {
        try {
            const objects = keys.map(key => ({ Key: key }));

            const command = new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: objects,
                    Quiet: false,
                },
            });

            const response = await s3Client.send(command);

            return {
                success: true,
                deleted: response.Deleted?.map(d => d.Key) || [],
                errors: response.Errors || [],
                deletedCount: response.Deleted?.length || 0,
                errorCount: response.Errors?.length || 0,
            };
        } catch (error) {
            throw new Error(`Bulk delete failed: ${error.message}`);
        }
    }

    /**
     * List files with pagination
     */
    static async listFiles(prefix = 'uploads/', maxKeys = 50, continuationToken = null) {
        try {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                MaxKeys: maxKeys,
                ContinuationToken: continuationToken,
            });

            const response = await s3Client.send(command);

            const files = (response.Contents || []).map(file => ({
                key: file.Key,
                size: file.Size,
                lastModified: file.LastModified,
                etag: file.ETag,
                url: `${process.env.S3_PUBLIC_URL}/${file.Key}`,
            }));

            return {
                files,
                isTruncated: response.IsTruncated,
                continuationToken: response.NextContinuationToken,
                keyCount: response.KeyCount,
                totalCount: response.KeyCount,
            };
        } catch (error) {
            throw new Error(`List files failed: ${error.message}`);
        }
    }

    /**
     * Get file metadata
     */
    static async getFileMetadata(key) {
        try {
            const command = new HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            const response = await s3Client.send(command);

            return {
                contentType: response.ContentType,
                contentLength: response.ContentLength,
                lastModified: response.LastModified,
                metadata: response.Metadata,
                etag: response.ETag,
                key,
            };
        } catch (error) {
            if (error.name === 'NotFound') {
                return null;
            }
            throw new Error(`Get metadata failed: ${error.message}`);
        }
    }

    /**
     * Check if file exists
     */
    static async fileExists(key) {
        try {
            const metadata = await this.getFileMetadata(key);
            return !!metadata;
        } catch {
            return false;
        }
    }

    /**
     * Determine file type from MIME
     */
    static getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'IMAGE';
        if (mimeType.startsWith('video/')) return 'VIDEO';
        if (mimeType.startsWith('audio/')) return 'AUDIO';
        if (mimeType === 'application/pdf') return 'PDF';
        if (ALLOWED_MIME_TYPES.DOCUMENT.includes(mimeType)) return 'DOCUMENT';
        return 'GENERAL';
    }

    /**
     * Validate file before upload
     */
    static validateFile(file) {
        if (!file || !file.buffer || !file.mimetype || !file.originalname) {
            throw new Error('Invalid file object');
        }

        const fileType = this.getFileType(file.mimetype);
        const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.GENERAL;

        if (file.size > maxSize) {
            throw new Error(
                `File too large. Maximum size for ${fileType.toLowerCase()}: ${maxSize / 1024 / 1024}MB`
            );
        }

        const allowedMimes = ALLOWED_MIME_TYPES[fileType] || ALLOWED_MIME_TYPES.GENERAL || [];
        if (allowedMimes.length > 0 && !allowedMimes.includes(file.mimetype)) {
            throw new Error(`File type not allowed: ${file.mimetype}`);
        }

        return true;
    }

    /**
     * Generate file URL
     */
    static getFileUrl(key) {
        if (!key) return null;
        return `${process.env.S3_PUBLIC_URL}/${key}`;
    }

    /**
     * Extract key from URL
     */
    static extractKeyFromUrl(url) {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            return path.startsWith('/') ? path.substring(1) : path;
        } catch {
            // If URL parsing fails, try to extract after bucket name
            const bucketPattern = new RegExp(`${BUCKET_NAME}/(.+)`);
            const match = url.match(bucketPattern);
            return match ? match[1] : null;
        }
    }

    /**
     * Get user's files with filtering
     */
    static async getUserFiles(userId, fileType = null, limit = 50, offset = 0) {
        try {
            const prefix = `uploads/${userId}/`;
            const allFiles = await this.listFiles(prefix, 1000);

            let files = allFiles.files;

            // Filter by file type if specified
            if (fileType) {
                const fileMetadataPromises = files.map(file => this.getFileMetadata(file.key));
                const metadataArray = await Promise.all(fileMetadataPromises);

                files = files.filter((file, index) => {
                    const metadata = metadataArray[index];
                    return metadata && this.getFileType(metadata.contentType) === fileType;
                });
            }

            // Apply pagination
            const paginatedFiles = files.slice(offset, offset + limit);

            return {
                files: paginatedFiles,
                total: files.length,
                limit,
                offset,
                hasMore: offset + limit < files.length,
            };
        } catch (error) {
            throw new Error(`Get user files failed: ${error.message}`);
        }
    }

    /**
     * Move file to different folder (copy + delete)
     */
    static async moveFile(sourceKey, destinationFolder, userId = null) {
        try {
            // Copy to new location
            const copyResult = await this.copyFile(sourceKey, destinationFolder, userId);

            // Delete original
            await this.deleteFile(sourceKey);

            return {
                success: true,
                newLocation: copyResult.location,
                newKey: copyResult.destinationKey,
                oldKey: sourceKey,
            };
        } catch (error) {
            throw new Error(`Move file failed: ${error.message}`);
        }
    }

    /**
     * Get file size in human readable format
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate a signed URL for temporary access to private file
     */
    static async getSignedUrl(key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

            return {
                url: signedUrl,
                expiresIn,
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            };
        } catch (error) {
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }
    }
}

export default S3Service;