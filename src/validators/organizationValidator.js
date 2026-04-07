const { body, param, query } = require('express-validator');
const { validatePhoneNumber } = require('../middleware/validation');

const createOrganizationValidator = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .custom(validatePhoneNumber)
    .withMessage('Valid phone number is required'),
  body('type')
    .isIn(['COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
    .withMessage('Invalid organization type'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Invalid URL'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City name too long'),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country name too long'),
  // Admin user data
  body('admin.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Admin email is required and must be valid'),
  body('admin.phone')
    .custom(validatePhoneNumber)
    .withMessage('Admin phone number is required'),
  body('admin.password')
    .isLength({ min: 8 })
    .withMessage('Admin password must be at least 8 characters'),
  body('admin.unom')
    .notEmpty()
    .withMessage('Admin first name is required'),
  body('admin.uprenom')
    .notEmpty()
    .withMessage('Admin last name is required'),
];

const updateOrganizationValidator = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('phone')
    .optional()
    .custom(validatePhoneNumber)
    .withMessage('Invalid phone number'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Invalid URL'),
  body('logo')
    .optional()
    .isURL()
    .withMessage('Invalid logo URL'),
];

const addDepartmentValidator = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('parentDeptId')
    .optional()
    .isString()
    .withMessage('Invalid parent department ID'),
  body('headUserId')
    .optional()
    .isString()
    .withMessage('Invalid user ID'),
];

const addMemberValidator = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('role')
    .optional()
    .isIn(['MEMBER', 'MANAGER', 'ADMIN'])
    .withMessage('Invalid role'),
  body('departmentId')
    .optional()
    .isString()
    .withMessage('Invalid department ID'),
];

const updateMemberValidator = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  param('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('role')
    .isIn(['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'])
    .withMessage('Invalid role'),
];

const submitReviewValidator = [
  param('orgId')
    .notEmpty()
    .withMessage('Organization ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .notEmpty()
    .isLength({ max: 250 })
    .withMessage('Title is required and must be less than 250 characters'),
  body('review')
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Review is required'),
  body('pros')
    .optional()
    .isArray()
    .withMessage('Pros must be an array'),
  body('cons')
    .optional()
    .isArray()
    .withMessage('Cons must be an array'),
];

const getOrganizationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('query')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('type')
    .optional()
    .isIn(['COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
    .withMessage('Invalid organization type'),
  query('city')
    .optional()
    .isString()
    .withMessage('Invalid city name'),
  query('country')
    .optional()
    .isString()
    .withMessage('Invalid country name'),
];

module.exports = {
  createOrganizationValidator,
  updateOrganizationValidator,
  addDepartmentValidator,
  addMemberValidator,
  updateMemberValidator,
  submitReviewValidator,
  getOrganizationsValidator,
};