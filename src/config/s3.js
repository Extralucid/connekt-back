import AWS   from 'aws-sdk';
import multer   from 'multer';
import multerS3   from 'multer-s3';
import path   from 'path';
import { v4 as uuidv4 }   from 'uuid';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// File filter for uploads
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4',
    'video/mpeg',
    'audio/mpeg',
    'audio/wav',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Generate unique filename
const generateFileName = (file) => {
  const extension = path.extname(file.originalname);
  return `${uuidv4()}${extension}`;
};

// Multer S3 configuration for general uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      const folder = req.params.folder || 'general';
      const fileName = generateFileName(file);
      cb(null, `${folder}/${fileName}`);
    },
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId: req.userId,
      });
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Profile picture upload (specific limits)
const profileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `profiles/${req.userId}/${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Document upload for specific modules
const documentUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      const module = req.params.module || 'documents';
      const fileName = generateFileName(file);
      cb(null, `${module}/${req.userId}/${fileName}`);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for documents
  },
});

// Helper function to delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split('/').slice(3).join('/');
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// Helper function to get signed URL for private files
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

export {
  s3,
  upload,
  profileUpload,
  documentUpload,
  deleteFileFromS3,
  getSignedUrl,
};