import ForumService  from '../services/forum.service.js';

class ForumController {
  // ==================== FORUM CONTROLLERS ====================
  
  static async createForum(req, res, next) {
    try {
      const forum = await ForumService.createForum(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Forum created successfully',
        data: forum,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllForums(req, res, next) {
    try {
      const { includeStats = 'true', includeSubForums = 'true' } = req.query;
      const forums = await ForumService.getAllForums(
        includeStats === 'true',
        includeSubForums === 'true'
      );
      
      res.json({
        success: true,
        data: forums,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getForumById(req, res, next) {
    try {
      const { forumId } = req.params;
      const { includeStats = 'true' } = req.query;
      
      const forum = await ForumService.getForumById(forumId, includeStats === 'true');
      
      if (!forum) {
        return res.status(404).json({
          success: false,
          message: 'Forum not found',
        });
      }
      
      res.json({
        success: true,
        data: forum,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateForum(req, res, next) {
    try {
      const { forumId } = req.params;
      const forum = await ForumService.updateForum(forumId, req.body);
      
      res.json({
        success: true,
        message: 'Forum updated successfully',
        data: forum,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteForum(req, res, next) {
    try {
      const { forumId } = req.params;
      await ForumService.deleteForum(forumId);
      
      res.json({
        success: true,
        message: 'Forum deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getForumStats(req, res, next) {
    try {
      const { forumId } = req.params;
      const { period = 'month' } = req.query;
      
      const stats = await ForumService.getForumStats(forumId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== TOPIC CONTROLLERS ====================
  
  static async createTopic(req, res, next) {
    try {
      const { forumId } = req.params;
      const topic = await ForumService.createTopic(forumId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Topic created successfully',
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTopicById(req, res, next) {
    try {
      const { identifier } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let topic;
      if (isUUID) {
        topic = await ForumService.getTopicById(identifier);
      } else {
        topic = await ForumService.getTopicBySlug(identifier);
      }
      
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found',
        });
      }
      
      res.json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTopicsByForum(req, res, next) {
    try {
      const { forumId } = req.params;
      const result = await ForumService.getTopicsByForum(forumId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      const topic = await ForumService.updateTopic(topicId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Topic updated successfully',
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      await ForumService.deleteTopic(topicId, req.userId, req.body.permanent);
      
      res.json({
        success: true,
        message: 'Topic deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async pinTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      const { pin } = req.body;
      
      const topic = await ForumService.pinTopic(topicId, pin);
      
      res.json({
        success: true,
        message: pin ? 'Topic pinned successfully' : 'Topic unpinned successfully',
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async closeTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      const { close } = req.body;
      
      const topic = await ForumService.closeTopic(topicId, close);
      
      res.json({
        success: true,
        message: close ? 'Topic closed successfully' : 'Topic opened successfully',
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== REPLY CONTROLLERS ====================
  
  static async addReply(req, res, next) {
    try {
      const { topicId } = req.params;
      const { content, isAcceptedAnswer } = req.body;
      
      const reply = await ForumService.addReply(topicId, req.userId, content, isAcceptedAnswer);
      
      res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getReplies(req, res, next) {
    try {
      const { topicId } = req.params;
      const result = await ForumService.getReplies(topicId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateReply(req, res, next) {
    try {
      const { replyId } = req.params;
      const { content } = req.body;
      
      const reply = await ForumService.updateReply(replyId, req.userId, content);
      
      res.json({
        success: true,
        message: 'Reply updated successfully',
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteReply(req, res, next) {
    try {
      const { replyId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(r.role.name)
      );
      
      await ForumService.deleteReply(replyId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== VOTE CONTROLLERS ====================
  
  static async voteOnReply(req, res, next) {
    try {
      const { replyId } = req.params;
      const { type } = req.body;
      
      const vote = await ForumService.voteOnReply(replyId, req.userId, type);
      
      res.json({
        success: true,
        message: vote.removed ? 'Vote removed' : 'Vote recorded successfully',
        data: vote,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async acceptAnswer(req, res, next) {
    try {
      const { replyId } = req.params;
      const { accept } = req.body;
      
      const reply = await ForumService.acceptAnswer(replyId, req.userId, accept);
      
      res.json({
        success: true,
        message: accept ? 'Answer accepted' : 'Answer unaccepted',
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ForumController;