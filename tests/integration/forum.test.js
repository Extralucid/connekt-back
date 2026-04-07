import request  from 'supertest';
import app  from '../../src/app.js';
import prisma  from '../../src/config/database.js';
import { userFixtures }  from '../fixtures';
import { generateTokens }  from '../../src/services/auth.service.js';

describe('Forum API', () => {
  let server;
  let authToken;
  let userId;
  let testForumId;
  let testTopicId;

  beforeAll(async () => {
    server = app.listen(4004);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: 'forum-user-123',
        email: 'forum@example.com',
        phone: '+237612345697',
        pwd_hash: 'hashed-password',
        codeuser: 'forum-code',
        unom: 'Forum',
        uprenom: 'User',
        username: 'forumuser',
        display_name: 'Forum User',
        accountType: 'INDIVIDUAL',
        status: 'ACTIVE',
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
      },
    });
    
    userId = user.id;
    
    // Create test forum
    const forum = await prisma.forum.create({
      data: {
        forum_id: 'forum-123',
        name: 'Test Forum',
        slug: 'test-forum',
        description: 'Test forum description',
        displayOrder: 1,
      },
    });
    
    testForumId = forum.forum_id;
    
    // Generate auth token
    const tokens = generateTokens(userId);
    authToken = tokens.accessToken;
    
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

  describe('POST /api/forums/:forumId/topics', () => {
    it('should create a new topic', async () => {
      const response = await request(server)
        .post(`/api/forums/${testForumId}/topics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Topic',
          content: 'This is a test topic content...',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Topic');
      
      testTopicId = response.body.data.topic_id;
    });
  });

  describe('GET /api/forums/:forumId/topics', () => {
    it('should get topics by forum', async () => {
      const response = await request(server)
        .get(`/api/forums/${testForumId}/topics`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.topics).toBeDefined();
    });
  });

  describe('POST /api/topics/:topicId/replies', () => {
    it('should add reply to topic', async () => {
      const response = await request(server)
        .post(`/api/topics/${testTopicId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'This is a test reply' });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('This is a test reply');
    });
  });

  describe('POST /api/replies/:replyId/vote', () => {
    it('should upvote a reply', async () => {
      // First create a reply
      const reply = await request(server)
        .post(`/api/topics/${testTopicId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Reply to vote on' });
      
      const replyId = reply.body.data.reply_id;
      
      const response = await request(server)
        .post(`/api/replies/${replyId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'UPVOTE' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});