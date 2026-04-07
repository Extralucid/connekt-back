import AuthService  from '../../../src/services/auth.service.js';
import prisma  from '../../../src/config/database.js';
import redis  from '../../../src/config/redis.js';
import SMSService  from '../../../src/services/sms.service.js';
import { userFixtures, tokenFixtures }  from '../../fixtures';

jest.mock('../../../src/config/database');
jest.mock('../../../src/config/redis');
jest.mock('../../../src/services/smsService');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ userId: 'user-123', jti: 'jti-123' })),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'Password123!';
      const hashed = await AuthService.hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(password);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'Password123!';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(hash, password);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'Password123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(hash, wrongPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe('sendPhoneVerification', () => {
    it('should send OTP to phone', async () => {
      const phone = '+237612345678';
      prisma.user.findUnique.mockResolvedValue(null);
      SMSService.sendVerificationCode.mockResolvedValue({ success: true });
      
      const result = await AuthService.sendPhoneVerification(phone);
      
      expect(result.message).toBe('OTP sent successfully');
      expect(SMSService.sendVerificationCode).toHaveBeenCalledWith(phone);
    });

    it('should throw error if phone already registered', async () => {
      const phone = '+237612345678';
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123', phone });
      
      await expect(AuthService.sendPhoneVerification(phone))
        .rejects.toThrow('Phone number already registered');
    });
  });

  describe('register', () => {
    it('should register new user with valid data', async () => {
      const userData = userFixtures.validUser;
      const otp = '123456';
      
      SMSService.verifyOTP.mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-123',
        ...userData,
        pwd_hash: 'hashed-password',
      });
      prisma.role.findUnique.mockResolvedValue({ id: 'role-123' });
      prisma.userRole.create.mockResolvedValue({});
      
      const result = await AuthService.verifyPhoneAndRegister(userData, otp);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(SMSService.verifyOTP).toHaveBeenCalledWith(userData.phone, otp);
    });

    it('should throw error if user already exists', async () => {
      const userData = userFixtures.validUser;
      const otp = '123456';
      
      SMSService.verifyOTP.mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });
      
      await expect(AuthService.verifyPhoneAndRegister(userData, otp))
        .rejects.toThrow('User with this email, phone, or username already exists');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const identifier = 'test@example.com';
      const password = 'Password123!';
      const hashedPassword = await AuthService.hashPassword(password);
      
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: identifier,
        pwd_hash: hashedPassword,
        status: 'ACTIVE',
        userRoles: [],
      });
      
      const result = await AuthService.login(identifier, password, {});
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      const identifier = 'test@example.com';
      const password = 'WrongPassword123!';
      
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: identifier,
        pwd_hash: await AuthService.hashPassword('Password123!'),
        status: 'ACTIVE',
      });
      
      await expect(AuthService.login(identifier, password, {}))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for suspended account', async () => {
      const identifier = 'test@example.com';
      const password = 'Password123!';
      
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: identifier,
        pwd_hash: await AuthService.hashPassword(password),
        status: 'SUSPENDED',
      });
      
      await expect(AuthService.login(identifier, password, {}))
        .rejects.toThrow('Account is suspended');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      
      prisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        isValid: true,
        revoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: 'user-123',
        jti: 'jti-123',
      });
      
      const result = await AuthService.refreshTokens(refreshToken, {});
      
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      
      await expect(AuthService.refreshTokens(refreshToken, {}))
        .rejects.toThrow('Invalid refresh token');
    });
  });
});