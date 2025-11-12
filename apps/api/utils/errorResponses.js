/**
 * Standardized Error Response Utility
 * Provides consistent error formatting across all API endpoints
 */

/**
 * Standard error response format
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} error - Human-readable error message
 * @property {string} [code] - Machine-readable error code
 * @property {Object} [details] - Additional error details
 * @property {number} [statusCode] - HTTP status code
 */

/**
 * Error codes enum for consistent error identification
 */
const ErrorCodes = {
  // Authentication errors (4xx)
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation errors (4xx)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_MISSING_FIELD: 'VALIDATION_MISSING_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',

  // Resource errors (4xx)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Rate limiting (4xx)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};

/**
 * Create standardized error response
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {string} [code] - Machine-readable error code
 * @param {Object} [details] - Additional error details
 * @returns {ErrorResponse}
 */
function createErrorResponse(message, statusCode = 500, code = null, details = null) {
  const response = {
    success: false,
    error: message,
  };

  if (code) {
    response.code = code;
  }

  if (details) {
    response.details = details;
  }

  if (statusCode) {
    response.statusCode = statusCode;
  }

  return response;
}

/**
 * Send standardized error response
 * @param {Object} reply - Fastify reply object
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {string} [code] - Machine-readable error code
 * @param {Object} [details] - Additional error details
 */
function sendError(reply, message, statusCode = 500, code = null, details = null) {
  const response = createErrorResponse(message, statusCode, code, details);
  return reply.status(statusCode).send(response);
}

/**
 * Common error response helpers
 */
const ErrorResponses = {
  // 400 Bad Request
  badRequest: (reply, message = 'Bad request', details = null) =>
    sendError(reply, message, 400, ErrorCodes.VALIDATION_FAILED, details),

  // 401 Unauthorized
  unauthorized: (reply, message = 'Authentication required', details = null) =>
    sendError(reply, message, 401, ErrorCodes.AUTH_REQUIRED, details),

  invalidCredentials: (reply, message = 'Invalid email or password') =>
    sendError(reply, message, 401, ErrorCodes.AUTH_INVALID_CREDENTIALS),

  tokenExpired: (reply, message = 'Token has expired') =>
    sendError(reply, message, 401, ErrorCodes.AUTH_TOKEN_EXPIRED),

  tokenInvalid: (reply, message = 'Invalid token') =>
    sendError(reply, message, 401, ErrorCodes.AUTH_TOKEN_INVALID),

  // 403 Forbidden
  forbidden: (reply, message = 'Insufficient permissions', details = null) =>
    sendError(reply, message, 403, ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS, details),

  // 404 Not Found
  notFound: (reply, resource = 'Resource', details = null) =>
    sendError(reply, `${resource} not found`, 404, ErrorCodes.RESOURCE_NOT_FOUND, details),

  // 409 Conflict
  conflict: (reply, message = 'Resource already exists', details = null) =>
    sendError(reply, message, 409, ErrorCodes.RESOURCE_ALREADY_EXISTS, details),

  // 422 Unprocessable Entity
  validationError: (reply, message = 'Validation failed', details = null) =>
    sendError(reply, message, 422, ErrorCodes.VALIDATION_FAILED, details),

  missingField: (reply, fieldName) =>
    sendError(reply, `Missing required field: ${fieldName}`, 422, ErrorCodes.VALIDATION_MISSING_FIELD, { field: fieldName }),

  invalidFormat: (reply, fieldName, expectedFormat = null) => {
    const message = expectedFormat
      ? `Invalid format for ${fieldName}. Expected: ${expectedFormat}`
      : `Invalid format for ${fieldName}`;
    return sendError(reply, message, 422, ErrorCodes.VALIDATION_INVALID_FORMAT, { field: fieldName });
  },

  // 429 Too Many Requests
  rateLimitExceeded: (reply, message = 'Too many requests. Please try again later.') =>
    sendError(reply, message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED),

  // 500 Internal Server Error
  internalError: (reply, message = 'An unexpected error occurred', details = null) =>
    sendError(reply, message, 500, ErrorCodes.INTERNAL_ERROR, details),

  databaseError: (reply, message = 'Database error occurred') =>
    sendError(reply, message, 500, ErrorCodes.DATABASE_ERROR),

  externalServiceError: (reply, service = 'External service', details = null) =>
    sendError(reply, `${service} error`, 500, ErrorCodes.EXTERNAL_SERVICE_ERROR, details),
};

/**
 * Wrap async route handlers with automatic error handling
 * @param {Function} handler - Async route handler function
 * @returns {Function} Wrapped handler with error catching
 */
function asyncHandler(handler) {
  return async (request, reply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      console.error('Route handler error:', error);

      // Handle known error types
      if (error.statusCode) {
        return sendError(reply, error.message, error.statusCode, error.code, error.details);
      }

      // Handle database errors
      if (error.code && error.code.startsWith('P')) {
        // Prisma error codes start with P
        return ErrorResponses.databaseError(reply, 'Database operation failed');
      }

      // Default to internal server error
      return ErrorResponses.internalError(reply, error.message || 'An unexpected error occurred');
    }
  };
}

module.exports = {
  ErrorCodes,
  createErrorResponse,
  sendError,
  ErrorResponses,
  asyncHandler,
};
