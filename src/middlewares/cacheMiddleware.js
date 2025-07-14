import redisClient from '../config/redis.js';

// Cache GET requests for a specified time (in seconds)
export const cache = (expiryTime = 60) => async (req, res, next) => {
  if (req.method !== 'GET') return next(); // Only cache GET requests

  const key = `cache:${req.originalUrl}`;

  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      console.log('Serving from cache');
      return res.json(JSON.parse(cachedData));
    }

    // Override `res.json` to cache responses before sending
    const originalJson = res.json;
    res.json = (body) => {
      redisClient.setEx(key, expiryTime, JSON.stringify(body)); // Cache for `expiryTime` seconds
      return originalJson.call(res, body);
    };

    next();
  } catch (err) {
    console.error('Caching error:', err);
    next();
  }
};