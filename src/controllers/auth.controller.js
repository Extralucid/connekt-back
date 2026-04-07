import AuthService  from '../services/auth.service.js';
import SMSService  from '../services/sms.service.js';

class AuthController {
  /**
   * @swagger
   * /api/auth/send-phone-otp:
   *   post:
   *     summary: Send OTP for phone verification
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               phone:
   *                 type: string
   *     responses:
   *       200:
   *         description: OTP sent successfully
   */
  static async sendPhoneOtp(req, res, next) {
    try {
      const result = await AuthService.sendPhoneVerification(req.body.phone);
      
      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

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
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *               unom:
   *                 type: string
   *               uprenom:
   *                 type: string
   *               username:
   *                 type: string
   *               otp:
   *                 type: string
   *               accountType:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   */
  static async register(req, res, next) {
    try {
      const { otp, ...userData } = req.body;
      const user = await AuthService.verifyPhoneAndRegister(userData, otp);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               identifier:
   *                 type: string
   *               password:
   *                 type: string
   *               rememberMe:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Login successful
   */
  static async login(req, res, next) {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        clientType: req.headers['x-client-type'] || 'web',
      };
      
      const result = await AuthService.login(
        req.body.identifier,
        req.body.password,
        clientInfo
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Tokens refreshed successfully
   */
  static async refresh(req, res, next) {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        clientType: req.headers['x-client-type'] || 'web',
      };
      
      const result = await AuthService.refreshTokens(req.body.refreshToken, clientInfo);
      
      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Logout successful
   */
  static async logout(req, res, next) {
    try {
      await AuthService.logout(req.userId, req.tokenJti);
      
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/logout-all:
   *   post:
   *     summary: Logout from all devices
   *     tags: [Authentication]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Logged out from all devices
   */
  static async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAllDevices(req.userId, req.tokenJti);
      
      res.json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/verify-email:
   *   post:
   *     summary: Verify email address
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: Email verified successfully
   */
  static async verifyEmail(req, res, next) {
    try {
      await AuthService.verifyEmail(req.body.token);
      
      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/resend-verification:
   *   post:
   *     summary: Resend verification email
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Verification email sent
   */
  static async resendVerification(req, res, next) {
    try {
      await AuthService.resendVerificationEmail(req.body.email);
      
      res.json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset email sent
   */
  static async forgotPassword(req, res, next) {
    try {
      await AuthService.requestPasswordReset(req.body.email);
      
      res.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     summary: Reset password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *               newPassword:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset successfully
   */
  static async resetPassword(req, res, next) {
    try {
      await AuthService.resetPassword(req.body.token, req.body.newPassword);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/change-password:
   *   post:
   *     summary: Change password (authenticated)
   *     tags: [Authentication]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   */
  static async changePassword(req, res, next) {
    try {
      await AuthService.changePassword(
        req.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      
      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;