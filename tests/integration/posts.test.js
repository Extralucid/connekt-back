import request  from 'supertest';
import app  from '../../src/app.js';
import prisma  from '../../src/config/database.js';
import { userFixtures, postFixtures }  from '../fixtures';
import { generateTokens }  from '../../src/services/auth.service.js';

describe('Posts API', () => {
  let server;
  let authToken;
  let userId;
  let testPostId;

  beforeAll(async () => {
    server = app.listen(4002);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: 'test-user-posts',
        email: 'postuser@example.com',
        phone: '+237612345690',
        pwd_hash: 'hashed-password',
        codeuser: 'posts-test-code',
        unom: 'Post',
        uprenom: 'Tester',
        username: 'posttester',
        display_name: 'Post Tester',
        accountType: 'INDIVIDUAL',
        status: 'ACTIVE',
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
      },
    });
    
    userId = user.id;
    
    // Generate auth token
    const tokens = generateTokens(userId);
    authToken = tokens.accessToken;
    
    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        jti: tokens.jti,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isValid: true,
      },
    });
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/posts', () => {
    it('should create a new post when authenticated', async () => {
      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postFixtures.validPost);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(postFixtures.validPost.title);
      
      testPostId = response.body.data.post_id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(server)
        .post('/api/posts')
        .send(postFixtures.validPost);
      
      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Short' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts', async () => {
      const response = await request(server)
        .get('/api/posts');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter posts by search query', async () => {
      const response = await request(server)
        .get('/api/posts?search=web');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(server)
        .get('/api/posts?page=1&limit=10');
      
      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/posts/:identifier', () => {
    it('should get post by ID', async () => {
      const response = await request(server)
        .get(`/api/posts/${testPostId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post_id).toBe(testPostId);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(server)
        .get('/api/posts/non-existent-id');
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/posts/:postId', () => {
    it('should update post as author', async () => {
      const response = await request(server)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Post Title' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Post Title');
    });
  });

  describe('DELETE /api/posts/:postId', () => {
    it('should delete post as author', async () => {
      const response = await request(server)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});