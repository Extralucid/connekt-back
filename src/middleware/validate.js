import { z } from 'zod';

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request parts based on schema
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      
      next(error);
    }
  };
};

// Custom validators
const validators = {
  isPhoneNumber: (value) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value);
  },
  
  isUsername: (value) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(value);
  },
  
  isStrongPassword: (value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
  },
};

export { validate, validators };