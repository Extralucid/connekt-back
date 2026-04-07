import request  from 'supertest';
import app  from '../../src/app.js';
import prisma  from '../../src/config/database.js';
import { userFixtures, jobFixtures, organizationFixtures }  from '../fixtures';
import { generateTokens }  from '../../src/services/auth.service.js';

describe('Jobs API', () => {
  let server;
  let employerToken;
  let employerId;
  let testJobId;

  beforeAll(async () => {
    server = app.listen(4003);
    
    // Create employer user
    const employer = await prisma.user.create({
      data: {
        id: 'employer-123',
        email: 'employer@company.com',
        phone: '+237612345695',
        pwd_hash: 'hashed-password',
        codeuser: 'employer-code',
        unom: 'Employer',
        uprenom: 'User',
        username: 'employer',
        display_name: 'Company Employer',
        accountType: 'COMPANY',
        status: 'ACTIVE',
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
      },
    });
    
    employerId = employer.id;
    
    // Create organization
    const organization = await prisma.organization.create({
      data: {
        id: 'org-123',
        name: 'Test Company',
        slug: 'test-company',
        email: 'test@company.com',
        phone: '+237612345696',
        type: 'COMPANY',
        status: 'ACTIVE',
      },
    });
    
    // Link employer to organization
    await prisma.organizationUser.create({
      data: {
        userId: employerId,
        organizationId: organization.id,
        role: 'OWNER',
        isPrimaryContact: true,
      },
    });
    
    // Generate auth token
    const tokens = generateTokens(employerId);
    employerToken = tokens.accessToken;
    
    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        jti: tokens.jti,
        userId: employerId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isValid: true,
      },
    });
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/jobs', () => {
    it('should create a new job as employer', async () => {
      const response = await request(server)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(jobFixtures.validJob);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(jobFixtures.validJob.title);
      
      testJobId = response.body.data.job_id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(server)
        .post('/api/jobs')
        .send(jobFixtures.validJob);
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/jobs', () => {
    it('should get all jobs', async () => {
      const response = await request(server)
        .get('/api/jobs');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs).toBeDefined();
    });

    it('should filter by job type', async () => {
      const response = await request(server)
        .get('/api/jobs?jobType=FULL_TIME');
      
      expect(response.status).toBe(200);
      expect(response.body.data.jobs).toBeDefined();
    });

    it('should filter by location', async () => {
      const response = await request(server)
        .get('/api/jobs?location=Douala');
      
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/jobs/:jobId', () => {
    it('should get job by ID', async () => {
      const response = await request(server)
        .get(`/api/jobs/${testJobId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.job_id).toBe(testJobId);
    });

    it('should increment view count', async () => {
      const firstView = await request(server).get(`/api/jobs/${testJobId}`);
      const secondView = await request(server).get(`/api/jobs/${testJobId}`);
      
      expect(secondView.body.data.views).toBe(firstView.body.data.views + 1);
    });
  });
});