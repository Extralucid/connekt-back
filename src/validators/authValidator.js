const { body } = require('express-validator');
const { validatePhoneNumber, validatePassword } = require('../middleware/validation');

const registerValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .custom(validatePhoneNumber)
    .withMessage('Invalid phone number'),
  body('password')
    .custom(validatePassword)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('unom')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('uprenom')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore'),
  body('accountType')
    .optional()
    .isIn(['INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
    .withMessage('Invalid account type'),
];

const loginValidator = [
  body('identifier')
    .notEmpty()
    .withMessage('Email, phone, or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be boolean'),
];

const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const forgotPasswordValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .custom(validatePassword)
    .withMessage('Password must meet requirements'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .custom(validatePassword)
    .withMessage('New password must meet requirements'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

const verifyEmailValidator = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
};