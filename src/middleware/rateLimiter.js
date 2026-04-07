import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';
import { de } from 'zod/v4/locales';

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:api:',
  }),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

// Mobile app limiter (higher limits)
const mobileLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:mobile:',
  }),
  windowMs: 60000, // 1 minute
  max: 200, // 200 requests per minute
  keyGenerator: (req) => {
    // Use device ID for mobile rate limiting
    return req.headers['x-device-id'] || req.ip;
  },
  message: {
    success: false,
    message: 'Rate limit exceeded for mobile device.',
  },
});

// Per-user rate limiter for sensitive operations
const userRateLimiter = (maxRequests, windowMs) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: 'rl:user:',
    }),
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => `user:${req.userId}`,
    message: {
      success: false,
      message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
    },
  });
};

export default {
  apiLimiter,
  authLimiter,
  mobileLimiter,
  userRateLimiter,
};