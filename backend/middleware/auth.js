const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Rate limiting for auth attempts
const rateLimit = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Clean up old entries
  for (const [key, data] of rateLimit.entries()) {
    if (data.timestamp < windowStart) {
      rateLimit.delete(key);
    }
  }
  
  const attempts = rateLimit.get(ip);
  if (attempts) {
    if (attempts.blocked && now < attempts.blockedUntil) {
      const minutesLeft = Math.ceil((attempts.blockedUntil - now) / (60 * 1000));
      throw new Error(`Too many attempts. Please try again in ${minutesLeft} minutes.`);
    }
    
    if (attempts.count >= MAX_ATTEMPTS) {
      attempts.blocked = true;
      attempts.blockedUntil = now + BLOCK_DURATION;
      throw new Error('Too many attempts. Please try again in 30 minutes.');
    }
    
    attempts.count++;
    attempts.timestamp = now;
  } else {
    rateLimit.set(ip, {
      count: 1,
      timestamp: now,
      blocked: false,
      blockedUntil: null
    });
  }
};

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  try {
    // Skip rate limiting for development environment
    if (process.env.NODE_ENV === 'production') {
      checkRateLimit(req.ip);
    }
    
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return next(new ErrorResponse('Please log in to access this resource', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ErrorResponse('User account no longer exists', 401));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(new ErrorResponse('Your account has been deactivated. Please contact support.', 401));
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Your session has expired. Please log in again.', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new ErrorResponse('Your session has expired. Please log in again.', 401));
      }
      return next(new ErrorResponse('Authentication failed. Please log in again.', 401));
    }
  } catch (error) {
    return next(error);
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `You don't have permission to perform this action`,
          403
        )
      );
    }
    next();
  };
};