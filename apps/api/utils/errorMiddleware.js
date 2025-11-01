/**
 * Standardized Error Handling Middleware
 * 
 * Provides consistent error handling across all routes
 * Replaces ad-hoc try/catch blocks and error responses
 */

const { ApiError, formatError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Wraps async route handlers to catch errors automatically
 * Usage: fastify.get('/path', errorHandler(async (request, reply) => { ... }))
 */
function errorHandler(handler) {
  return async (request, reply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      // Handle ApiError instances
      if (error instanceof ApiError) {
        logger.error({
          error: error.message,
          statusCode: error.statusCode,
          url: request.url,
          method: request.method,
          userId: request.user?.userId
        });
        return reply.status(error.statusCode).send(formatError(error));
      }

      // Handle Prisma errors
      if (error.code && error.code.startsWith('P')) {
        logger.error({
          error: error.message,
          prismaCode: error.code,
          url: request.url,
          method: request.method
        });

        // Handle connection errors
        if (error.code === 'P1001' || error.message?.includes('connection') || error.message?.includes('10054')) {
          logger.warn('Database connection error detected, attempting reconnect...');
          const { reconnectDB } = require('./db');
          try {
            await reconnectDB();
            // Return 503 Service Unavailable - client can retry
            return reply.status(503).send({
              success: false,
              error: 'Database connection temporarily unavailable. Please try again in a moment.'
            });
          } catch (reconnectError) {
            logger.error('Reconnection failed:', reconnectError);
            return reply.status(503).send({
              success: false,
              error: 'Database service unavailable. Please try again later.'
            });
          }
        }

        // Common Prisma error codes
        const prismaErrorMap = {
          'P2002': { status: 409, message: 'Record already exists' },
          'P2025': { status: 404, message: 'Record not found' },
          'P2003': { status: 400, message: 'Invalid reference' }
        };

        const mappedError = prismaErrorMap[error.code];
        if (mappedError) {
          return reply.status(mappedError.status).send({
            success: false,
            error: mappedError.message
          });
        }
        
        // For other Prisma errors, return 500
        return reply.status(500).send({
          success: false,
          error: process.env.NODE_ENV === 'production' 
            ? 'A database error occurred'
            : error.message
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError' || error.isJoi) {
        return reply.status(400).send({
          success: false,
          error: error.message || 'Validation failed',
          details: error.details || error.errors
        });
      }

      // Handle JWT errors
      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || 
          error.code === 'FST_JWT_BAD_REQUEST') {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized'
        });
      }

      // Generic error handling
      logger.error({
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        userId: request.user?.userId
      });

      return reply.status(500).send({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred'
          : error.message
      });
    }
  };
}

/**
 * Validates that a record exists and belongs to user
 * Returns 404 if not found, 403 if doesn't belong to user
 */
async function requireOwnership(service, id, userId) {
  try {
    const record = await service.verifyOwnership(id, userId);
    return record;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    // Convert other errors to ApiError
    throw new ApiError(500, error.message || 'Failed to verify ownership');
  }
}

/**
 * Validates required fields in request body
 */
function validateRequired(fields, body) {
  const missing = fields.filter(field => !body[field]);
  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validates that record exists
 * Returns 404 if not found
 */
function requireRecord(record, resourceName) {
  if (!record) {
    throw new ApiError(404, `${resourceName} not found`);
  }
  return record;
}

module.exports = {
  errorHandler,
  requireOwnership,
  validateRequired,
  requireRecord
};

