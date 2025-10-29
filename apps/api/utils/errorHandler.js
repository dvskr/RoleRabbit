/**
 * Global Error Handler
 * Centralized error handling for the API
 */

const logger = require('./logger');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Convert error to API response format
 */
function formatError(error) {
  // Don't leak internal errors to client
  const message = error.isOperational 
    ? error.message 
    : 'An unexpected error occurred';
  
  return {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    })
  };
}

/**
 * Global error handler middleware
 */
async function globalErrorHandler(error, request, reply) {
  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: error.statusCode || 500
  });
  
  // Determine status code
  const statusCode = error.statusCode || 500;
  
  // Send error response
  return reply.code(statusCode).send(formatError(error));
}

/**
 * Handle 404 Not Found
 */
async function notFoundHandler(request, reply) {
  return reply.code(404).send({
    success: false,
    error: 'Route not found',
    path: request.url
  });
}

/**
 * Async error wrapper for route handlers
 */
function asyncHandler(fn) {
  return (request, reply) => {
    Promise.resolve(fn(request, reply)).catch((error) => {
      globalErrorHandler(error, request, reply);
    });
  };
}

module.exports = {
  ApiError,
  formatError,
  globalErrorHandler,
  notFoundHandler,
  asyncHandler
};
