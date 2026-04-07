import PostService  from '../../../src/services/post.service.js';
import prisma  from '../../../src/config/database.js';
import redis  from '../../../src/config/redis.js';
import { userFixtures, postFixtures }  from '../../fixtures';

jest.mock('../../../src/config/database');
jest.mock('../../../src/config/redis');

describe('PostService', () => {
  const mockUser = { id: 'user-123', ...userFixtures.validUser };
  const mockPost = {
    post_id: 'post-123',
    ...postFixtures.validPost,
    authorId: mockUser.id,
    slug: 'getting-started-with-web-development',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      prisma.post.create.mockResolvedValue(mockPost);
      
      const result = await PostService.createPost(mockUser.id, postFixtures.validPost);
      
      expect(result).toBeDefined();
      expect(result.title).toBe(postFixtures.validPost.title);
      expect(result.authorId).toBe(mockUser.id);
      expect(prisma.post.create).toHaveBeenCalled();
    });

    it('should generate unique slug', async () => {
      prisma.post.findUnique
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(null);
      prisma.post.create.mockResolvedValue({
        ...mockPost,
        slug: 'getting-started-with-web-development-1',
      });
      
      const result = await PostService.createPost(mockUser.id, postFixtures.validPost);
      
      expect(result.slug).toBe('getting-started-with-web-development-1');
    });
  });

  describe('getPostById', () => {
    it('should return post from cache', async () => {
      const cachedPost = JSON.stringify(mockPost);
      redis.get.mockResolvedValue(cachedPost);
      
      const result = await PostService.getPostById('post-123', false);
      
      expect(result).toEqual(JSON.parse(cachedPost));
      expect(prisma.post.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch post from database when not cached', async () => {
      redis.get.mockResolvedValue(null);
      prisma.post.findUnique.mockResolvedValue(mockPost);
      prisma.post.update.mockResolvedValue({ view_count: 151 });
      
      const result = await PostService.getPostById('post-123', true);
      
      expect(result).toBeDefined();
      expect(prisma.post.findUnique).toHaveBeenCalled();
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should return null for non-existent post', async () => {
      redis.get.mockResolvedValue(null);
      prisma.post.findUnique.mockResolvedValue(null);
      
      const result = await PostService.getPostById('non-existent', false);
      
      expect(result).toBeNull();
    });
  });

  describe('updatePost', () => {
    it('should update post as author', async () => {
      const updateData = { title: 'Updated Title' };
      prisma.post.findUnique.mockResolvedValue({ authorId: mockUser.id });
      prisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        userRoles: [{ role: { name: 'USER' } }],
      });
      prisma.post.update.mockResolvedValue({ ...mockPost, ...updateData });
      
      const result = await PostService.updatePost('post-123', mockUser.id, updateData);
      
      expect(result.title).toBe('Updated Title');
      expect(prisma.post.update).toHaveBeenCalled();
    });

    it('should throw error when user is not author or admin', async () => {
      const differentUser = { id: 'different-user' };
      prisma.post.findUnique.mockResolvedValue({ authorId: differentUser.id });
      prisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        userRoles: [{ role: { name: 'USER' } }],
      });
      
      await expect(PostService.updatePost('post-123', mockUser.id, {}))
        .rejects.toThrow('Unauthorized to update this post');
    });
  });

  describe('deletePost', () => {
    it('should soft delete post', async () => {
      prisma.post.findUnique.mockResolvedValue({ authorId: mockUser.id, slug: 'test-slug' });
      prisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        userRoles: [{ role: { name: 'USER' } }],
      });
      prisma.post.update.mockResolvedValue({ isDeleted: true });
      
      const result = await PostService.deletePost('post-123', mockUser.id, false);
      
      expect(result).toBe(true);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { post_id: 'post-123' },
        data: { isDeleted: true, status: 'ARCHIVED' },
      });
    });
  });

  describe('getAllPosts', () => {
    it('should return paginated posts', async () => {
      const mockPosts = [mockPost];
      const mockTotal = 1;
      
      prisma.post.findMany.mockResolvedValue(mockPosts);
      prisma.post.count.mockResolvedValue(mockTotal);
      
      const result = await PostService.getAllPosts({}, { page: 1, limit: 20 });
      
      expect(result.posts).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter by search query', async () => {
      const filters = { search: 'web development' };
      prisma.post.findMany.mockResolvedValue([mockPost]);
      prisma.post.count.mockResolvedValue(1);
      
      await PostService.getAllPosts(filters, { page: 1, limit: 20 });
      
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'web development', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });
  });

  describe('addComment', () => {
    it('should add comment to post', async () => {
      const commentData = { content: 'Great post!' };
      prisma.post.findUnique.mockResolvedValue({ status: 'PUBLISHED', authorId: 'author-123' });
      prisma.comment.create.mockResolvedValue({
        comment_id: 'comment-123',
        ...commentData,
        authorId: mockUser.id,
        postId: 'post-123',
      });
      
      const result = await PostService.addComment('post-123', mockUser.id, commentData.content);
      
      expect(result).toBeDefined();
      expect(result.content).toBe(commentData.content);
    });

    it('should throw error for non-existent post', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      
      await expect(PostService.addComment('post-123', mockUser.id, 'comment'))
        .rejects.toThrow('Post not found or not published');
    });
  });
});