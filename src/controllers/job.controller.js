import JobService from '../services/job.service.js';

class JobController {
  // ==================== JOB CONTROLLERS ====================
  
  static async createJob(req, res, next) {
    try {
      const organizationId = req.user.organizations?.[0]?.organizationId;
      const job = await JobService.createJob(req.userId, req.body, organizationId);
      
      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getJobById(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await JobService.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }
      
      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await JobService.updateJob(jobId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Job updated successfully',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await JobService.deleteJob(jobId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllJobs(req, res, next) {
    try {
      const result = await JobService.getAllJobs(req.query, req.query, req.userId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getEmployerJobs(req, res, next) {
    try {
      const { employerId } = req.params;
      const result = await JobService.getEmployerJobs(employerId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyJobs(req, res, next) {
    try {
      const result = await JobService.getEmployerJobs(req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getJobStats(req, res, next) {
    try {
      const { jobId } = req.params;
      const stats = await JobService.getJobStats(jobId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getEmployerStats(req, res, next) {
    try {
      const { employerId } = req.params;
      const { period = 'month' } = req.query;
      const stats = await JobService.getEmployerStats(employerId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== APPLICATION CONTROLLERS ====================
  
  static async applyForJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const application = await JobService.applyForJob(jobId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyApplications(req, res, next) {
    try {
      const result = await JobService.getApplications(req.userId, req.query, req.query, false);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getEmployerApplications(req, res, next) {
    try {
      const result = await JobService.getApplications(req.userId, req.query, req.query, true);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateApplicationStatus(req, res, next) {
    try {
      const { applicationId } = req.params;
      const application = await JobService.updateApplicationStatus(
        applicationId,
        req.userId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== BOOKMARK CONTROLLERS ====================
  
  static async bookmarkJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const result = await JobService.bookmarkJob(jobId, req.userId);
      
      res.json({
        success: true,
        message: result.message,
        data: { bookmarked: result.bookmarked },
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getBookmarkedJobs(req, res, next) {
    try {
      const result = await JobService.getBookmarkedJobs(req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== CATEGORY CONTROLLERS ====================
  
  static async createCategory(req, res, next) {
    try {
      const category = await JobService.createCategory(req.body);
      
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
      const categories = await JobService.getAllCategories();
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== SKILL CONTROLLERS ====================
  
  static async createSkill(req, res, next) {
    try {
      const skill = await JobService.createSkill(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllSkills(req, res, next) {
    try {
      const skills = await JobService.getAllSkills();
      
      res.json({
        success: true,
        data: skills,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== JOB ALERT CONTROLLERS ====================
  
  static async createJobAlert(req, res, next) {
    try {
      const alert = await JobService.createJobAlert(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Job alert created successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMyJobAlerts(req, res, next) {
    try {
      const alerts = await JobService.getUserJobAlerts(req.userId);
      
      res.json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateJobAlert(req, res, next) {
    try {
      const { alertId } = req.params;
      const alert = await JobService.updateJobAlert(alertId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Job alert updated successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteJobAlert(req, res, next) {
    try {
      const { alertId } = req.params;
      await JobService.deleteJobAlert(alertId, req.userId);
      
      res.json({
        success: true,
        message: 'Job alert deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== COMPANY REVIEW CONTROLLERS ====================
  
  static async createCompanyReview(req, res, next) {
    try {
      const { employerId } = req.params;
      const review = await JobService.createCompanyReview(employerId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Awaiting moderation.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getCompanyReviews(req, res, next) {
    try {
      const { employerId } = req.params;
      const result = await JobService.getCompanyReviews(employerId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default JobController;