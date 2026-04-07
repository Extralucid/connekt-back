import express from 'express';
const router = express.Router();
import AuthController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import rateLimiter from '../middleware/rateLimiter.js';
import { verifyAccessToken } from '../middleware/auth.js';

import {
  registerSchema,
  loginSchema,
  verifyPhoneSchema,
  sendPhoneOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
}  from '../schemas/authSchema.js';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and user management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - phone
 *         - password
 *         - unom
 *         - uprenom
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         phone:
 *           type: string
 *           example: +237612345678
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: Password123!
 *         unom:
 *           type: string
 *           example: John
 *         uprenom:
 *           type: string
 *           example: Doe
 *         username:
 *           type: string
 *           example: johndoe
 *         otp:
 *           type: string
 *           example: 123456
 *         accountType:
 *           type: string
 *           enum: [INDIVIDUAL, COMPANY, UNIVERSITY, GOVERNMENT, NGO]
 *           default: INDIVIDUAL
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           description: Email, phone number, or username
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: Password123!
 *         rememberMe:
 *           type: boolean
 *           default: false
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *             expiresIn:
 *               type: string
 */

/**
 * @swagger
 * /api/auth/send-phone-otp:
 *   post:
 *     summary: Send OTP to phone number for verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: +237612345678
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiresIn:
 *                       type: integer
 *                       example: 600
 *       400:
 *         description: Invalid phone number
 *       429:
 *         description: Too many requests
 */
router.post(
  '/send-phone-otp',
  rateLimiter.authLimiter,
  validate(sendPhoneOtpSchema),
  AuthController.sendPhoneOtp
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with phone verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or invalid OTP
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  rateLimiter.authLimiter,
  validate(registerSchema),
  AuthController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user with email, phone, or username
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       423:
 *         description: Account locked or suspended
 */
router.post(
  '/login',
  rateLimiter.authLimiter,
  validate(loginSchema),
  AuthController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  AuthController.refresh
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (invalidate current session)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/logout',
  verifyAccessToken,
  AuthController.logout
);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/logout-all',
  verifyAccessToken,
  AuthController.logoutAll
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  AuthController.verifyEmail
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       404:
 *         description: User not found
 */
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  AuthController.resendVerification
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent if account exists
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password (authenticated)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password incorrect
 */
router.post(
  '/change-password',
  verifyAccessToken,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;