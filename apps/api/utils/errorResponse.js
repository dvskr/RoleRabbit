/**
 * Standardized Error Response Utility
 * BE-026: Standardize error response format across all endpoints
 */

const { ERROR_CODES, getStatusCodeForErrorCode } = require('./errorCodes');
const logger = require('./logger');

/**
 * Create standardized error response
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {object} details - Optional additional details
 * @returns {object} Standardized error response
 */
function createErrorResponse(errorCode, message, details = null) {
  const response = {
    error: errorCode,
    message
  };
  
  if (details) {
    response.details = details;
  }
  
  // Add code for backward compatibility
  response.code = errorCode;
  
  return response;
}

/**
 * Send standardized error response
 * @param {object} reply - Fastify reply object
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {object} details - Optional additional details
 * @param {number} statusCode - Optional custom status code (overrides default)
 */
function sendErrorResponse(reply, errorCode, message, details = null, statusCode = null) {
  const response = createErrorResponse(errorCode, message, details);
  const code = statusCode || getStatusCodeForErrorCode(errorCode);
  
  logger.error(`Error Response [${errorCode}]: ${message}`, details || {});
  
  return reply.status(code).send(response);
}

/**
 * Handle and send error response from caught exception
 * @param {object} reply - Fastify reply object
 * @param {Error} error - Caught error
 * @param {string} defaultErrorCode - Default error code if error doesn't have one
 * @param {string} defaultMessage - Default message if error doesn't have one
 */
function handleError(reply, error, defaultErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR, defaultMessage = 'An unexpected error occurred') {
  // Check if error has errorCode property (from our custom errors)
  const errorCode = error.errorCode || defaultErrorCode;
  const message = error.message || defaultMessage;
  const details = error.details || (process.env.NODE_ENV === 'development' ? { stack: error.stack } : null);
  
  return sendErrorResponse(reply, errorCode, message, details);
}

/**
 * Create custom error with error code
 */
class AppError extends Error {
  constructor(errorCode, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.errorCode = errorCode;
    this.details = details;
  }
}

module.exports = {
  createErrorResponse,
  sendErrorResponse,
  handleError,
  AppError,
  ERROR_CODES
};

