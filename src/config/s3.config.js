// src/config/s3.config.js
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:8333',
  region: process.env.S3_REGION || 'us-east-1',
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET || 'saz-bucket';

export { s3Client, BUCKET_NAME };