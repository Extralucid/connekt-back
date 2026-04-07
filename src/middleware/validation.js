import { validationResult } from 'express-validator';

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

const validatePhoneNumber = (value) => {
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Invalid phone number format');
  }
  return true;
};

const validatePassword = (value) => {
  if (value.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(value)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(value)) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(value)) {
    throw new Error('Password must contain at least one number');
  }
  return true;
};

export default {
  validate,
  validatePhoneNumber,
  validatePassword,
};