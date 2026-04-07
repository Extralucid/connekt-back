const { body, param, query } = require('express-validator');
const { validatePhoneNumber } = require('../middleware/validation');

const updateProfileValidator = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .optional()
    .custom(validatePhoneNumber)
    .withMessage('Invalid phone number'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore'),
  body('display_name')
    .optional()
    .isLength({ max: 250 })
    .withMessage('Display name too long'),
  body('bio')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Bio cannot exceed 5000 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender option'),
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location too long'),
];

const updatePreferencesValidator = [
  body('language')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid language code'),
  body('notifyNewContent')
    .optional()
    .isBoolean()
    .withMessage('Must be boolean'),
  body('bookCategories')
    .optional()
    .isArray()
    .withMessage('Must be an array'),
  body('tutorialTopics')
    .optional()
    .isArray()
    .withMessage('Must be an array'),
  body('blogCategories')
    .optional()
    .isArray()
    .withMessage('Must be an array'),
  body('jobCategories')
    .optional()
    .isArray()
    .withMessage('Must be an array'),
];

const getUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('query')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('accountType')
    .optional()
    .isIn(['INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
    .withMessage('Invalid account type'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION'])
    .withMessage('Invalid status'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'lastActiveAt', 'display_name', 'email'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const getNotificationsValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be boolean'),
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string'),
];

const markNotificationValidator = [
  param('notificationId')
    .notEmpty()
    .withMessage('Notification ID is required'),
];

module.exports = {
  updateProfileValidator,
  updatePreferencesValidator,
  getUsersValidator,
  getNotificationsValidator,
  markNotificationValidator,
};