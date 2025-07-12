export const dynamicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // Allow more requests for premium users
    if (req.user?.role === 'PREMIUM') return 500;
    // Stricter limits for sensitive routes (e.g., password reset)
    if (req.path.includes('/reset-password')) return 3;
    // Default limit
    return 100;
  },
  message: 'Too many requests, please try again later.',
});