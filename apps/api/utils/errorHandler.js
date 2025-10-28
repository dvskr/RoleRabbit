/**
 * Global Error Handler
 * Provides consistent error responses across the application
 */

class AppError extends Error {
  constructor(message, statusCode, code, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

/**
 * Format error response
 */
function formatError(error, includeStack = false) {
  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      ...(error.statusCode && { statusCode: error.statusCode })
    }
  };

  if (error.details && Object.keys(error.details).length > 0) {
    response.error.details = error.details;
  }

  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Global error handler
 */
function globalErrorHandler(error, request, reply) {
  const logger = require('./logger');
  
  // Log the error
  logger.logError(error, {
    url: request.url,
    method: request.method,
    ip: request.ip,
    userId: request.user?.userId
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Format error response
  const includeStack = process.env.NODE_ENV === 'development';
  const response = formatError(error, includeStack);

  reply.status(statusCode).send(response);
}

/**
 * Handle async errors
 */
function asyncHandler(fn) {
  return (request, reply) => {
    Promise.resolve(fn(request, reply)).catch((error) => {
      globalErrorHandler(error, request, reply);
    });
  };
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  globalErrorHandler,
  asyncHandler
};

