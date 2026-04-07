import UserService from '../services/user.service.js';

export class UserController {
  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Get current user profile
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: User profile retrieved
   */
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getUserById(req.userId);
      
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Profile updated
   */
  static async updateProfile(req, res, next) {
    try {
      const user = await UserService.updateProfile(req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/preferences:
   *   get:
   *     summary: Get user preferences
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: User preferences retrieved
   */
  static async getPreferences(req, res, next) {
    try {
      const user = await UserService.getUserById(req.userId);
      
      res.json({
        success: true,
        data: user.preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/preferences:
   *   put:
   *     summary: Update user preferences
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Preferences updated
   */
  static async updatePreferences(req, res, next) {
    try {
      const preferences = await UserService.updatePreferences(req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/stats:
   *   get:
   *     summary: Get user statistics
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: User statistics retrieved
   */
  static async getStats(req, res, next) {
    try {
      const stats = await UserService.getUserStats(req.userId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/notifications:
   *   get:
   *     summary: Get user notifications
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: offset
   *         schema: { type: integer, default: 0 }
   *       - in: query
   *         name: isRead
   *         schema: { type: boolean }
   *       - in: query
   *         name: type
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Notifications retrieved
   */
  static async getNotifications(req, res, next) {
    try {
      const result = await UserService.getNotifications(req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/notifications/{notificationId}/read:
   *   put:
   *     summary: Mark notification as read
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: notificationId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Notification marked as read
   */
  static async markNotificationRead(req, res, next) {
    try {
      await UserService.markNotificationAsRead(req.userId, req.params.notificationId);
      
      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/notifications/read-all:
   *   put:
   *     summary: Mark all notifications as read
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: All notifications marked as read
   */
  static async markAllNotificationsRead(req, res, next) {
    try {
      await UserService.markAllNotificationsAsRead(req.userId);
      
      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/activity:
   *   get:
   *     summary: Get user activity log
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 50 }
   *     responses:
   *       200:
   *         description: User activity retrieved
   */
  static async getActivity(req, res, next) {
    try {
      const activities = await UserService.getUserActivity(req.userId, req.query.limit);
      
      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/profile/picture:
   *   post:
   *     summary: Upload profile picture
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Profile picture updated
   */
  static async uploadProfilePicture(req, res, next) {
    try {
      // This is handled by multer middleware
      // The file URL will be in req.file.location
      res.json({
        success: true,
        message: 'Profile picture updated successfully',
        data: {
          url: req.file.location,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/{userId}:
   *   get:
   *     summary: Get user by ID (admin only)
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: User found
   *       404:
   *         description: User not found
   */
  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.userId, true);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Search users (admin only)
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *       - in: query
   *         name: accountType
   *         schema: { type: string }
   *       - in: query
   *         name: status
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Users retrieved
   */
  static async searchUsers(req, res, next) {
    try {
      const result = await UserService.searchUsers(req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/top:
   *   get:
   *     summary: Get top users by category
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema: { type: string, enum: [points, posts, comments, engagement, followers], default: points }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *     responses:
   *       200:
   *         description: Top users retrieved
   */
  static async getTopUsers(req, res, next) {
    try {
      const { category = 'points', limit = 10 } = req.query;
      const users = await UserService.getTopUsers(category, parseInt(limit));
      
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/account:
   *   delete:
   *     summary: Delete user account
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Account deleted
   */
  static async deleteAccount(req, res, next) {
    try {
      await UserService.deleteAccount(req.userId, req.body.reason, req.body.password);
      
      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/batch:
   *   post:
   *     summary: Batch update users (admin only)
   *     tags: [Users]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Batch update completed
   */
  static async batchUpdate(req, res, next) {
    try {
      const result = await UserService.batchUpdate(req.body);
      
      res.json({
        success: true,
        message: 'Batch update completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;