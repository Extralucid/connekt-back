import PodcastService  from '../services/podcast.service.js';

class PodcastController {
  // ==================== PODCAST CONTROLLERS ====================
  
  static async createPodcast(req, res, next) {
    try {
      const podcast = await PodcastService.createPodcast(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Podcast created successfully',
        data: podcast,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getPodcastById(req, res, next) {
    try {
      const { identifier } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let podcast;
      if (isUUID) {
        podcast = await PodcastService.getPodcastById(identifier);
      } else {
        podcast = await PodcastService.getPodcastBySlug(identifier);
      }
      
      if (!podcast) {
        return res.status(404).json({
          success: false,
          message: 'Podcast not found',
        });
      }
      
      res.json({
        success: true,
        data: podcast,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updatePodcast(req, res, next) {
    try {
      const { podcastId } = req.params;
      const podcast = await PodcastService.updatePodcast(podcastId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Podcast updated successfully',
        data: podcast,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deletePodcast(req, res, next) {
    try {
      const { podcastId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await PodcastService.deletePodcast(podcastId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Podcast deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllPodcasts(req, res, next) {
    try {
      const result = await PodcastService.getAllPodcasts(req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyPodcasts(req, res, next) {
    try {
      const result = await PodcastService.getMyPodcasts(req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getPodcastStats(req, res, next) {
    try {
      const { podcastId } = req.params;
      const { period = 'month' } = req.query;
      const stats = await PodcastService.getPodcastStats(podcastId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== EPISODE CONTROLLERS ====================
  
  static async createEpisode(req, res, next) {
    try {
      const { podcastId } = req.params;
      const episode = await PodcastService.createEpisode(podcastId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Episode created successfully',
        data: episode,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getEpisodeById(req, res, next) {
    try {
      const { episodeId } = req.params;
      const episode = await PodcastService.getEpisodeById(episodeId);
      
      if (!episode) {
        return res.status(404).json({
          success: false,
          message: 'Episode not found',
        });
      }
      
      res.json({
        success: true,
        data: episode,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getEpisodesByPodcast(req, res, next) {
    try {
      const { podcastId } = req.params;
      const result = await PodcastService.getEpisodesByPodcast(podcastId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateEpisode(req, res, next) {
    try {
      const { episodeId } = req.params;
      const episode = await PodcastService.updateEpisode(episodeId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Episode updated successfully',
        data: episode,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteEpisode(req, res, next) {
    try {
      const { episodeId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await PodcastService.deleteEpisode(episodeId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Episode deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== LISTEN TRACKING CONTROLLERS ====================
  
  static async trackListen(req, res, next) {
    try {
      const { episodeId } = req.params;
      const { progress, completed } = req.body;
      
      const listen = await PodcastService.trackListen(episodeId, req.userId, progress, completed);
      
      res.json({
        success: true,
        message: completed ? 'Episode marked as completed' : 'Progress saved',
        data: listen,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getListenStats(req, res, next) {
    try {
      const { episodeId } = req.params;
      const { period = 'month' } = req.query;
      const stats = await PodcastService.getListenStats(episodeId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== SUBSCRIPTION CONTROLLERS ====================
  
  static async subscribeToPodcast(req, res, next) {
    try {
      const { podcastId } = req.params;
      const result = await PodcastService.subscribeToPodcast(podcastId, req.userId);
      
      res.json({
        success: true,
        message: result.message,
        data: { subscribed: result.subscribed },
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getUserSubscriptions(req, res, next) {
    try {
      const result = await PodcastService.getUserSubscriptions(req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getPodcastSubscribers(req, res, next) {
    try {
      const { podcastId } = req.params;
      const result = await PodcastService.getPodcastSubscribers(podcastId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== COMMENT CONTROLLERS ====================
  
  static async addComment(req, res, next) {
    try {
      const { episodeId } = req.params;
      const { content, parentId } = req.body;
      
      const comment = await PodcastService.addComment(episodeId, req.userId, content, parentId);
      
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
      const { episodeId } = req.params;
      const result = await PodcastService.getComments(episodeId, req.query);
      
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
      
      const comment = await PodcastService.updateComment(commentId, req.userId, content);
      
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
      
      await PodcastService.deleteComment(commentId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== TRANSCRIPT CONTROLLERS ====================
  
  static async addTranscript(req, res, next) {
    try {
      const { episodeId } = req.params;
      const transcript = await PodcastService.addTranscript(episodeId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Transcript added successfully',
        data: transcript,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTranscript(req, res, next) {
    try {
      const { episodeId } = req.params;
      const transcript = await PodcastService.getTranscript(episodeId);
      
      if (!transcript) {
        return res.status(404).json({
          success: false,
          message: 'Transcript not found for this episode',
        });
      }
      
      res.json({
        success: true,
        data: transcript,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PodcastController;