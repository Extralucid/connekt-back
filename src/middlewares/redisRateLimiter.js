import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import rateLimit from 'express-rate-limit';

// Initialize Redis client
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Redis-based rate limiter
export const redisLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Requests per IP per window
  message: 'Too many requests, please try again later.',
  skip: (req) => req.ip === '127.0.0.1', // Bypass for localhost
});