/**
 * SEC-009, SEC-010, SEC-014, SEC-015: Access control middleware
 */

const { checkFilePermission } = require('../utils/filePermissions');
const { requireAdmin } = require('../utils/rbac');
const { getStorageRateLimiter } = require('../utils/storageRateLimiter');
const logger = require('../utils/logger');

/**
 * SEC-009: Enforce file ownership check
 */
async function enforceFileOwnership(request, reply) {
  const userId = request.user?.userId || request.user?.id;
  const fileId = request.params.id;

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'User ID not found in token',
    });
  }

  // Check ownership
  const permissionCheck = await checkFilePermission(userId, fileId, 'admin');
  if (!permissionCheck.allowed) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'You do not own this file',
    });
  }

  return true;
}

/**
 * SEC-010: Enforce share permission check
 */
async function enforceSharePermission(request, reply, requiredPermission) {
  const userId = request.user?.userId || request.user?.id;
  const fileId = request.params.id;

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'User ID not found in token',
    });
  }

  const permissionCheck = await checkFilePermission(userId, fileId, requiredPermission);
  if (!permissionCheck.allowed) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: permissionCheck.reason || 'Insufficient permissions',
    });
  }

  // Attach file to request for use in handler
  request.file = permissionCheck.file;
  return true;
}

/**
 * SEC-014: Tenant isolation check
 */
async function enforceTenantIsolation(request, reply) {
  const userId = request.user?.userId || request.user?.id;

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'User ID not found in token',
    });
  }

  // All file operations should filter by userId
  // This is enforced in the route handlers by checking file ownership
  // Additional checks are done in checkFilePermission

  return true;
}

/**
 * SEC-015: File access rate limiting per user
 */
function createUserRateLimitMiddleware(operation) {
  return async (request, reply) => {
    const userId = request.user?.userId || request.user?.id;

    if (!userId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User ID not found in token',
      });
    }

    const rateLimiter = getStorageRateLimiter(operation);
    const key = `user:${userId}:${operation}`;

    try {
      await rateLimiter.consume(key);
      return true;
    } catch (error) {
      logger.warn(`Rate limit exceeded for user ${userId} on operation ${operation}`);
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${operation}. Please try again later.`,
      });
    }
  };
}

/**
 * SEC-021: Admin role check middleware
 */
async function requireAdminRole(request, reply) {
  const userId = request.user?.userId || request.user?.id;

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'User ID not found in token',
    });
  }

  try {
    await requireAdmin(userId);
    return true;
  } catch (error) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
}

module.exports = {
  enforceFileOwnership,
  enforceSharePermission,
  enforceTenantIsolation,
  createUserRateLimitMiddleware,
  requireAdminRole,
};

