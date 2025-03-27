const rateLimit = require('express-rate-limit');
const ErrorResponse = require('../utils/errorResponse');

// Create rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many attempts. Please try again in 15 minutes.',
  handler: (req, res, next) => {
    next(new ErrorResponse('Too many attempts. Please try again in 15 minutes.', 429));
  }
});

// Custom middleware to bypass rate limiting for specific routes
const bypassRateLimit = (req, res, next) => {
  // Bypass rate limiting for availability endpoints
  if (req.baseUrl === '/api/availability') {
    return next();
  }
  limiter(req, res, next);
};

module.exports = bypassRateLimit; 