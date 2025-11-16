/**
 * PII Access Logging Utility
 * 
 * Logs all access to Personally Identifiable Information (PII)
 * Required for GDPR compliance and security auditing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

/**
 * Log PII access
 * 
 * @param {Object} params - Access log parameters
 * @param {string} params.userId - User ID accessing the PII
 * @param {string} params.resourceType - Type of resource ("resume", "user_profile", etc.)
 * @param {string} params.resourceId - ID of the resource
 * @param {string} params.action - Action performed ("read", "write", "export", "delete")
 * @param {string[]} params.accessedFields - Fields accessed (["name", "email", "phone"])
 * @param {string} params.reason - Reason for access
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent of the request
 */
async function logPIIAccess({
  userId,
  resourceType,
  resourceId,
  action,
  accessedFields = [],
  reason = 'user_request',
  ipAddress = null,
  userAgent = null
}) {
  try {
    // Use raw SQL since this table may not be in Prisma schema yet
    await prisma.$executeRaw`
      INSERT INTO pii_access_logs (
        id, user_id, resource_type, resource_id, action,
        accessed_fields, reason, ip_address, user_agent, created_at
      ) VALUES (
        ${crypto.randomUUID()},
        ${userId},
        ${resourceType},
        ${resourceId},
        ${action},
        ${accessedFields}::text[],
        ${reason},
        ${ipAddress},
        ${userAgent},
        NOW()
      )
    `;
    
    console.log(`PII access logged: ${userId} ${action} ${resourceType}/${resourceId}`);
  } catch (error) {
    // Don't fail the request if logging fails, but log the error
    console.error('Failed to log PII access:', error);
  }
}

/**
 * Log resume PII access
 * 
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.resumeId - Resume ID
 * @param {string} params.action - Action ("read", "write", "export")
 * @param {Object} params.request - Express request object
 */
async function logResumePIIAccess({ userId, resumeId, action, request }) {
  const piiFields = ['contact.name', 'contact.email', 'contact.phone', 'contact.location'];
  
  await logPIIAccess({
    userId,
    resourceType: 'resume',
    resourceId: resumeId,
    action,
    accessedFields: piiFields,
    reason: 'user_request',
    ipAddress: request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress,
    userAgent: request.headers['user-agent']
  });
}

/**
 * Log user profile PII access
 * 
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.action - Action ("read", "write", "export")
 * @param {string[]} params.fields - Fields accessed
 * @param {Object} params.request - Express request object
 */
async function logUserProfilePIIAccess({ userId, action, fields, request }) {
  await logPIIAccess({
    userId,
    resourceType: 'user_profile',
    resourceId: userId,
    action,
    accessedFields: fields,
    reason: 'user_request',
    ipAddress: request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress,
    userAgent: request.headers['user-agent']
  });
}

/**
 * Get PII access logs for a user
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} - Access logs
 */
async function getPIIAccessLogs(userId, options = {}) {
  const {
    limit = 100,
    offset = 0,
    resourceType = null,
    action = null,
    startDate = null,
    endDate = null
  } = options;
  
  try {
    let whereClause = `user_id = '${userId}'`;
    
    if (resourceType) {
      whereClause += ` AND resource_type = '${resourceType}'`;
    }
    
    if (action) {
      whereClause += ` AND action = '${action}'`;
    }
    
    if (startDate) {
      whereClause += ` AND created_at >= '${startDate}'`;
    }
    
    if (endDate) {
      whereClause += ` AND created_at <= '${endDate}'`;
    }
    
    const logs = await prisma.$queryRawUnsafe(`
      SELECT * FROM pii_access_logs
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    return logs;
  } catch (error) {
    console.error('Failed to get PII access logs:', error);
    return [];
  }
}

/**
 * Middleware to automatically log PII access
 * 
 * @param {Object} options - Middleware options
 * @returns {Function} - Express middleware
 */
function piiAccessLogMiddleware(options = {}) {
  const {
    resourceType = 'resume',
    getResourceId = (req) => req.params.id,
    getAction = (req) => {
      const method = req.method;
      if (method === 'GET') return 'read';
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') return 'write';
      if (method === 'DELETE') return 'delete';
      return 'unknown';
    },
    getAccessedFields = () => []
  } = options;
  
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const resourceId = getResourceId(req);
      const action = getAction(req);
      const accessedFields = getAccessedFields(req);
      
      if (userId && resourceId) {
        // Log asynchronously, don't wait
        logPIIAccess({
          userId,
          resourceType,
          resourceId,
          action,
          accessedFields,
          reason: 'user_request',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(error => {
          console.error('PII access log middleware error:', error);
        });
      }
      
      next();
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('PII access log middleware error:', error);
      next();
    }
  };
}

module.exports = {
  logPIIAccess,
  logResumePIIAccess,
  logUserProfilePIIAccess,
  getPIIAccessLogs,
  piiAccessLogMiddleware
};

