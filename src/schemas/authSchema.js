import { z } from 'zod';

// Phone number validation regex (international format)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Username validation
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .min(5, 'Email too short')
      .max(255, 'Email too long'),
    phone: z.string()
      .regex(phoneRegex, 'Invalid phone number format. Use international format (e.g., +1234567890)'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    unom: z.string()
      .min(1, 'First name is required')
      .max(250, 'First name too long'),
    uprenom: z.string()
      .min(1, 'Last name is required')
      .max(250, 'Last name too long'),
    username: z.string()
      .regex(usernameRegex, 'Username must be 3-30 characters and can only contain letters, numbers, and underscore')
      .optional(),
    accountType: z.enum(['INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'])
      .default('INDIVIDUAL'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string()
      .min(1, 'Email, phone, or username is required'),
    password: z.string()
      .min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
});

export const verifyPhoneSchema = z.object({
  body: z.object({
    phone: z.string()
      .regex(phoneRegex, 'Invalid phone number format'),
    otp: z.string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers'),
  }),
});

export const sendPhoneOtpSchema = z.object({
  body: z.object({
    phone: z.string()
      .regex(phoneRegex, 'Invalid phone number format'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
      .min(1, 'Refresh token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Reset token is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Verification token is required'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address'),
  }),
});