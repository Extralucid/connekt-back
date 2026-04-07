import request  from 'supertest';
import app  from '../../src/app.js';
import prisma  from '../../src/config/database.js';
import { userFixtures }  from '../fixtures';
import { hashPassword }  from '../../src/services/auth.service.js';

describe('Authentication API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(4001);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/auth/send-phone-otp', () => {
    it('should send OTP to phone', async () => {
      const response = await request(server)
        .post('/api/auth/send-phone-otp')
        .send({ phone: '+237612345678' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('OTP sent successfully');
    });

    it('should return error for invalid phone', async () => {
      const response = await request(server)
        .post('/api/auth/send-phone-otp')
        .send({ phone: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const userData = {
        ...userFixtures.validUser,
        otp: '123456',
      };
      
      // Mock OTP verification
      jest.spyOn(require('../../src/services/smsService'), 'verifyOTP').mockResolvedValue(true);
      
      const response = await request(server)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should return validation error for missing fields', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await hashPassword('Password123!');
      await prisma.user.create({
        data: {
          id: 'test-user-123',
          email: 'test@example.com',
          phone: '+237612345678',
          pwd_hash: hashedPassword,
          codeuser: 'test-code',
          unom: 'Test',
          uprenom: 'User',
          username: 'testuser',
          display_name: 'Test User',
          accountType: 'INDIVIDUAL',
          status: 'ACTIVE',
          email_verified_at: new Date(),
          phone_verified_at: new Date(),
        },
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'Password123!',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'WrongPassword123!',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});