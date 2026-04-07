import PostService  from '../services/post.service.js';

class PostController {
  // ==================== POST CONTROLLERS ====================
  
  static async createPost(req, res, next) {
    try {
      const post = await PostService.createPost(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getPostById(req, res, next) {
    try {
      const { identifier } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let post;
      if (isUUID) {
        post = await PostService.getPostById(identifier);
      } else {
        post = await PostService.getPostBySlug(identifier);
      }
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }
      
      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updatePost(req, res, next) {
    try {
      const post = await PostService.updatePost(req.params.postId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deletePost(req, res, next) {
    try {
      await PostService.deletePost(req.params.postId, req.userId, req.body.permanent);
      
      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllPosts(req, res, next) {
    try {
      const result = await PostService.getAllPosts(req.query, req.query, req.userId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getRelatedPosts(req, res, next) {
    try {
      const { postId } = req.params;
      const { limit = 5 } = req.query;
      
      const posts = await PostService.getRelatedPosts(postId, parseInt(limit));
      
      res.json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== CATEGORY CONTROLLERS ====================
  
  static async createCategory(req, res, next) {
    try {
      const category = await PostService.createCategory(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllCategories(req, res, next) {
    try {
      const categories = await PostService.getAllCategories();
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateCategory(req, res, next) {
    try {
      const category = await PostService.updateCategory(req.params.categoryId, req.body);
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteCategory(req, res, next) {
    try {
      await PostService.deleteCategory(req.params.categoryId);
      
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== TAG CONTROLLERS ====================
  
  static async createTag(req, res, next) {
    try {
      const tag = await PostService.createTag(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllTags(req, res, next) {
    try {
      const tags = await PostService.getAllTags();
      
      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateTag(req, res, next) {
    try {
      const tag = await PostService.updateTag(req.params.tagId, req.body);
      
      res.json({
        success: true,
        message: 'Tag updated successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteTag(req, res, next) {
    try {
      await PostService.deleteTag(req.params.tagId);
      
      res.json({
        success: true,
        message: 'Tag deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== COMMENT CONTROLLERS ====================
  
  static async addComment(req, res, next) {
    try {
      const { postId } = req.params;
      const { content, parentCommentId } = req.body;
      
      const comment = await PostService.addComment(
        postId,
        req.userId,
        content,
        parentCommentId
      );
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getComments(req, res, next) {
    try {
      const { postId } = req.params;
      const result = await PostService.getComments(postId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      
      const comment = await PostService.updateComment(commentId, req.userId, content);
      
      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await PostService.deleteComment(commentId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async moderateComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const { isApproved, moderationNote } = req.body;
      
      const comment = await PostService.moderateComment(commentId, isApproved, moderationNote);
      
      res.json({
        success: true,
        message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PostController;