/**
 * Standardized Error Handler
 * Provides consistent error responses across all API endpoints
 */

const logger = require('./logger');

// ============================================
// ERROR CODES
// ============================================

const ErrorCodes = {
  // Client Errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESUME_NOT_FOUND: 'RESUME_NOT_FOUND',
  DRAFT_NOT_FOUND: 'DRAFT_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SLOT_LIMIT_REACHED: 'SLOT_LIMIT_REACHED',
  DUPLICATE_RESUME_NAME: 'DUPLICATE_RESUME_NAME',
  INVALID_TEMPLATE: 'INVALID_TEMPLATE',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  RESUME_CONFLICT: 'RESUME_CONFLICT',
  AI_USAGE_LIMIT_EXCEEDED: 'AI_USAGE_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  FILE_PROCESSING_ERROR: 'FILE_PROCESSING_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR'
};

// ============================================
// ERROR CLASSES
// ============================================

class AppError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400, details);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource, details = null) {
    super(`${resource} not found`, ErrorCodes[`${resource.toUpperCase()}_NOT_FOUND`] || ErrorCodes.RESUME_NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, ErrorCodes.UNAUTHORIZED, 401, details);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, ErrorCodes.FORBIDDEN, 403, details);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, ErrorCodes.RESUME_CONFLICT, 409, details);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details = null) {
    super(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429, details);
    this.name = 'RateLimitError';
  }
}

// ============================================
// ERROR RESPONSE FORMATTER
// ============================================

/**
 * Format error response in standardized format
 * @param {Error} error - Error object
 * @param {Object} context - Additional context (userId, requestId, etc.)
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, context = {}) {
  const response = {
    success: false,
    error: error.message || 'An error occurred',
    code: error.code || ErrorCodes.INTERNAL_ERROR,
    timestamp: new Date().toISOString()
  };

  // Add details if available (validation errors, etc.)
  if (error.details) {
    response.details = error.details;
  }

  // Add request ID if available
  if (context.requestId) {
    response.requestId = context.requestId;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

/**
 * Global error handler middleware for Fastify
 * @param {Error} error - Error object
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
async function errorHandler(error, request, reply) {
  const context = {
    requestId: request.id,
    userId: request.user?.userId,
    method: request.method,
    url: request.url
  };

  // Determine status code
  let statusCode = 500;
  let errorCode = ErrorCodes.INTERNAL_ERROR;
  let errorMessage = 'Internal server error';

  if (error instanceof AppError) {
    // Our custom errors
    statusCode = error.statusCode;
    errorCode = error.code;
    errorMessage = error.message;
  } else if (error.validation) {
    // Fastify validation errors
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    errorMessage = 'Validation failed';
    error.details = error.validation;
  } else if (error.statusCode) {
    // HTTP errors
    statusCode = error.statusCode;
    errorMessage = error.message;
  } else if (error.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    errorCode = ErrorCodes.DUPLICATE_RESUME_NAME;
    errorMessage = 'A resume with this name already exists';
  } else if (error.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    errorCode = ErrorCodes.RESUME_NOT_FOUND;
    errorMessage = 'Resource not found';
  } else if (error.code?.startsWith('P')) {
    // Other Prisma errors
    statusCode = 500;
    errorCode = ErrorCodes.DATABASE_ERROR;
    errorMessage = 'Database error occurred';
  }

  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Request error', {
    ...context,
    statusCode,
    errorCode,
    errorMessage,
    originalError: error.message,
    stack: error.stack
  });

  // Send response
  const response = formatErrorResponse(
    {
      message: errorMessage,
      code: errorCode,
      details: error.details,
      stack: error.stack
    },
    context
  );

  reply.status(statusCode).send(response);
}

// ============================================
// ERROR UTILITIES
// ============================================

/**
 * Wrap async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
  return async (request, reply) => {
    try {
      await fn(request, reply);
    } catch (error) {
      await errorHandler(error, request, reply);
    }
  };
}

/**
 * Assert condition or throw error
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message if condition is false
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 */
function assert(condition, message, code = ErrorCodes.VALIDATION_ERROR, statusCode = 400) {
  if (!condition) {
    throw new AppError(message, code, statusCode);
  }
}

/**
 * Assert resource exists or throw NotFoundError
 * @param {any} resource - Resource to check
 * @param {string} resourceName - Name of resource for error message
 */
function assertExists(resource, resourceName = 'Resource') {
  if (!resource) {
    throw new NotFoundError(resourceName);
  }
}

/**
 * Assert user owns resource or throw ForbiddenError
 * @param {string} resourceUserId - User ID from resource
 * @param {string} requestUserId - User ID from request
 * @param {string} message - Custom error message
 */
function assertOwnership(resourceUserId, requestUserId, message = 'You do not have permission to access this resource') {
  if (resourceUserId !== requestUserId) {
    throw new ForbiddenError(message);
  }
}

/**
 * Handle Zod validation errors
 * @param {Object} zodResult - Result from Zod validation
 * @throws {ValidationError} If validation failed
 */
function handleZodValidation(zodResult) {
  if (!zodResult.success) {
    throw new ValidationError('Validation failed', zodResult.errors);
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Error codes
  ErrorCodes,
  
  // Error classes
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  
  // Middleware
  errorHandler,
  asyncHandler,
  
  // Utilities
  formatErrorResponse,
  assert,
  assertExists,
  assertOwnership,
  handleZodValidation
};
