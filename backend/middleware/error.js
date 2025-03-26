const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      stack: err.stack
    });
  }

  // Handle specific error types
  switch (err.name) {
    case 'CastError':
      error = new ErrorResponse('Resource not found', 404);
      break;

    case 'ValidationError':
      error = new ErrorResponse(
        Object.values(err.errors).map(val => val.message).join('. '),
        400
      );
      break;

    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      error = new ErrorResponse('Your session has expired. Please log in again.', 401);
      break;

    case 'MongoError':
    case 'MongoServerError':
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        error = new ErrorResponse(
          `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
          400
        );
      }
      break;

    default:
      // Handle other specific error codes
      switch (err.code) {
        case 'ECONNREFUSED':
          error = new ErrorResponse('Unable to connect to the server. Please try again later.', 503);
          break;

        case 'ETIMEDOUT':
          error = new ErrorResponse('Request timed out. Please try again.', 504);
          break;

        case 'ERR_ENCRYPTION':
          error = new ErrorResponse('Error processing secure data. Please try again.', 500);
          break;

        case 'ERR_JWT':
          error = new ErrorResponse('Authentication error. Please try logging in again.', 401);
          break;
      }
  }

  // Registration specific errors
  if (req.path === '/api/auth/register' && error.statusCode === 500) {
    error = new ErrorResponse(
      'Unable to complete registration. Please check your information and try again.',
      500
    );
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'An unexpected error occurred. Please try again.',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: {
        name: err.name,
        code: err.code,
        path: req.path
      }
    })
  });
};

module.exports = errorHandler;