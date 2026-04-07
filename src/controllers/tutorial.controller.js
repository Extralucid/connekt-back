import TutorialService  from '../services/tutorial.service.js';

class TutorialController {
  // ==================== TUTORIAL CONTROLLERS ====================
  
  static async createTutorial(req, res, next) {
    try {
      const tutorial = await TutorialService.createTutorial(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tutorial created successfully',
        data: tutorial,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTutorialById(req, res, next) {
    try {
      const { identifier } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let tutorial;
      if (isUUID) {
        tutorial = await TutorialService.getTutorialById(identifier, req.userId);
      } else {
        tutorial = await TutorialService.getTutorialBySlug(identifier, req.userId);
      }
      
      if (!tutorial) {
        return res.status(404).json({
          success: false,
          message: 'Tutorial not found',
        });
      }
      
      res.json({
        success: true,
        data: tutorial,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateTutorial(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      const tutorial = await TutorialService.updateTutorial(tutorialId, req.userId, req.body, isAdmin);
      
      res.json({
        success: true,
        message: 'Tutorial updated successfully',
        data: tutorial,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteTutorial(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await TutorialService.deleteTutorial(tutorialId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Tutorial deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllTutorials(req, res, next) {
    try {
      const result = await TutorialService.getAllTutorials(req.query, req.query, req.userId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyTutorials(req, res, next) {
    try {
      const result = await TutorialService.getAuthorTutorials(req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTutorialStats(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const stats = await TutorialService.getTutorialStats(tutorialId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== CATEGORY CONTROLLERS ====================
  
  static async createCategory(req, res, next) {
    try {
      const category = await TutorialService.createCategory(req.body);
      
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
      const categories = await TutorialService.getAllCategories();
      
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
      const { categoryId } = req.params;
      const category = await TutorialService.updateCategory(categoryId, req.body);
      
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
      const { categoryId } = req.params;
      await TutorialService.deleteCategory(categoryId);
      
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== SECTION CONTROLLERS ====================
  
  static async createSection(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const section = await TutorialService.createSection(tutorialId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Section created successfully',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getSections(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const result = await TutorialService.getSections(tutorialId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateSection(req, res, next) {
    try {
      const { sectionId } = req.params;
      const section = await TutorialService.updateSection(sectionId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Section updated successfully',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteSection(req, res, next) {
    try {
      const { sectionId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await TutorialService.deleteSection(sectionId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Section deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async reorderSections(req, res, next) {
    try {
      const { tutorialId } = req.params;
      await TutorialService.reorderSections(tutorialId, req.userId, req.body.sections);
      
      res.json({
        success: true,
        message: 'Sections reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== USER PROGRESS CONTROLLERS ====================
  
  static async enrollInTutorial(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const result = await TutorialService.enrollInTutorial(req.userId, tutorialId);
      
      res.status(result.enrolled ? 201 : 200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateProgress(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const { sectionId, isDone } = req.body;
      
      const progress = await TutorialService.updateProgress(
        req.userId,
        tutorialId,
        sectionId,
        isDone
      );
      
      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getUserProgress(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const progress = await TutorialService.getUserProgress(req.userId, tutorialId);
      
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'You are not enrolled in this tutorial',
        });
      }
      
      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getEnrolledTutorials(req, res, next) {
    try {
      const result = await TutorialService.getEnrolledTutorials(req.userId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getLearningStats(req, res, next) {
    try {
      const stats = await TutorialService.getLearningStats(req.userId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== CERTIFICATE CONTROLLERS ====================
  
  static async generateCertificate(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const certificate = await TutorialService.generateCertificate(req.userId, tutorialId);
      
      res.json({
        success: true,
        message: 'Certificate generated successfully',
        data: certificate,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async verifyCertificate(req, res, next) {
    try {
      const { certificateId } = req.query;
      const certificate = await TutorialService.verifyCertificate(certificateId);
      
      res.json({
        success: true,
        data: certificate,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== REVIEW CONTROLLERS ====================
  
  static async addReview(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const review = await TutorialService.addReview(req.userId, tutorialId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTutorialReviews(req, res, next) {
    try {
      const { tutorialId } = req.params;
      const result = await TutorialService.getTutorialReviews(tutorialId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TutorialController;