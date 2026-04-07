import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import redis from '../config/redis.js';
import { sendVerificationEmail, sendWelcomeEmail } from './email.service.js';
import SMSService from './sms.service.js';

class AuthService {
  static async hashPassword(password) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: parseInt(process.env.ARGON2_MEMORY_COST) || 4096,
      timeCost: parseInt(process.env.ARGON2_TIME_COST) || 3,
      parallelism: parseInt(process.env.ARGON2_PARALLELISM) || 1,
    });
  }

  static async verifyPassword(hash, password) {
    return argon2.verify(hash, password);
  }

  static generateTokens(userId, jti = null) {
    const tokenJti = jti || uuidv4();
    
    const accessToken = jwt.sign(
      { userId, jti: tokenJti },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, jti: tokenJti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
    
    return { accessToken, refreshToken, jti: tokenJti };
  }

  static async saveRefreshToken(userId, token, jti, clientInfo = {}) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    return prisma.refreshToken.create({
      data: {
        token,
        jti,
        userId,
        expiresAt,
        clientType: clientInfo.clientType || 'web',
        userAgent: clientInfo.userAgent,
        ipAddress: clientInfo.ipAddress,
        isValid: true,
      },
    });
  }

  static async revokeRefreshToken(jti) {
    return prisma.refreshToken.updateMany({
      where: { jti },
      data: {
        isValid: false,
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  static async revokeAllUserTokens(userId, exceptJti = null) {
    const where = { userId, isValid: true };
    if (exceptJti) {
      where.jti = { not: exceptJti };
    }
    
    return prisma.refreshToken.updateMany({
      where,
      data: {
        isValid: false,
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  static async sendPhoneVerification(phone) {
    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });
    
    if (existingUser) {
      throw new Error('Phone number already registered');
    }
    
    // Send OTP via SMS
    await SMSService.sendVerificationCode(phone);
    
    return {
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes
    };
  }

  static async verifyPhoneAndRegister(userData, otp) {
    // Verify OTP
    await SMSService.verifyOTP(userData.phone, otp);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { phone: userData.phone },
          { username: userData.username },
        ],
      },
    });
    
    if (existingUser) {
      throw new Error('User with this email, phone, or username already exists');
    }
    
    // Create user
    const hashedPassword = await this.hashPassword(userData.password);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        phone: userData.phone,
        pwd_hash: hashedPassword,
        codeuser: uuidv4(),
        unom: userData.unom,
        uprenom: userData.uprenom,
        username: userData.username || `${userData.unom.toLowerCase()}.${userData.uprenom.toLowerCase()}`,
        accountType: userData.accountType || 'INDIVIDUAL',
        registration_date: new Date(),
        display_name: `${userData.unom} ${userData.uprenom}`,
        phone_verified_at: new Date(), // Mark phone as verified
        preferences: {
          create: {
            language: 'en',
            notifyNewContent: true,
          },
        },
      },
      include: {
        preferences: true,
      },
    });
    
    // Assign default role
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });
    
    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    }
    
    // Send verification email
    await sendVerificationEmail(user.email, user.id);
    
    // Remove sensitive data
    delete user.pwd_hash;
    
    return user;
  }

  static async login(identifier, password, clientInfo) {
    // Find user by email, phone, or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { username: identifier },
        ],
        isDeleted: false,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new Error(`Account is ${user.status.toLowerCase()}. Please contact support.`);
    }
    
    const isValidPassword = await this.verifyPassword(user.pwd_hash, password);
    if (!isValidPassword) {
      // Track failed attempts in Redis
      const attempts = await redis.incr(`failed_login:${user.id}`);
      await redis.expire(`failed_login:${user.id}`, 900);
      
      if (attempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'SUSPENDED' },
        });
        throw new Error('Account suspended due to multiple failed login attempts');
      }
      
      throw new Error('Invalid credentials');
    }
    
    // Clear failed attempts
    await redis.del(`failed_login:${user.id}`);
    
    // Generate tokens
    const { accessToken, refreshToken, jti } = this.generateTokens(user.id);
    
    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken, jti, clientInfo);
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_login: new Date(),
        lastActiveAt: new Date(),
      },
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        metadata: { loginMethod: identifier.includes('@') ? 'email' : 'phone' },
      },
    });
    
    delete user.pwd_hash;
    
    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
    };
  }

  static async refreshTokens(refreshToken, clientInfo) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    
    if (!tokenRecord || !tokenRecord.isValid || tokenRecord.revoked) {
      throw new Error('Invalid refresh token');
    }
    
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }
    
    // Rotate tokens
    await this.revokeRefreshToken(tokenRecord.jti);
    
    const { accessToken, refreshToken: newRefreshToken, jti } = this.generateTokens(
      tokenRecord.userId,
      tokenRecord.jti
    );
    
    await this.saveRefreshToken(tokenRecord.userId, newRefreshToken, jti, clientInfo);
    
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
    };
  }

  static async logout(userId, jti) {
    await this.revokeRefreshToken(jti);
    
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        userId,
      },
    });
    
    return true;
  }

  static async logoutAllDevices(userId, exceptJti = null) {
    await this.revokeAllUserTokens(userId, exceptJti);
    
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT_ALL',
        userId,
        metadata: { exceptJti },
      },
    });
    
    return true;
  }

  static async verifyEmail(token) {
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!verification || verification.expiresAt < new Date()) {
      throw new Error('Invalid or expired verification token');
    }
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { email_verified_at: new Date() },
      }),
      prisma.emailVerification.delete({
        where: { id: verification.id },
      }),
    ]);
    
    await sendWelcomeEmail(verification.email, verification.user.display_name);
    
    return true;
  }

  static async resendVerificationEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.email_verified_at) {
      throw new Error('Email already verified');
    }
    
    await sendVerificationEmail(user.email, user.id);
    
    return true;
  }

  static async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return true;
    }
    
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });
    
    // Send password reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    // Implement email sending here
    
    return true;
  }

  static async resetPassword(token, newPassword) {
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!resetRecord || resetRecord.expiresAt < new Date() || resetRecord.usedAt) {
      throw new Error('Invalid or expired reset token');
    }
    
    const hashedPassword = await this.hashPassword(newPassword);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { pwd_hash: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: resetRecord.userId, isValid: true },
        data: { isValid: false, revoked: true },
      }),
    ]);
    
    return true;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    const isValid = await this.verifyPassword(user.pwd_hash, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    const hashedPassword = await this.hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { pwd_hash: hashedPassword },
    });
    
    // Revoke all tokens except current session
    await this.revokeAllUserTokens(userId);
    
    return true;
  }
}

export default AuthService;