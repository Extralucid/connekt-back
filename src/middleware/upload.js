import multer from'multer';
import S3Service from '../services/s3.service.js';

// Memory storage for multer (since we're uploading to S3 directly)
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req, file, cb) => {
  try {
    // Validate file using S3Service
    S3Service.validateFile({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
    });
    cb(null, true);
  } catch (error) {
    cb(new Error(error.message), false);
  }
};

// Multer upload instances
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

// Profile picture upload (single file)
const profileUpload = upload.single('image');

// Document upload (single file)
const documentUpload = upload.single('document');

// Multiple documents upload
const multipleDocumentsUpload = upload.array('documents', 10);

// Generic upload for any field
const genericUpload = upload.any();

export {
  upload,
  profileUpload,
  documentUpload,
  multipleDocumentsUpload,
  genericUpload,
};