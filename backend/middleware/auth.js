const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
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
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Skip role check for team creation
    if (req.method === 'POST' && req.baseUrl === '/api/teams' && req.path === '/') {
      return next();
    }

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