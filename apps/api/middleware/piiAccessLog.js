/**
 * PII Access Logging Middleware
 * 
 * Logs all access to Personally Identifiable Information (PII)
 * for compliance and audit purposes.
 * 
 * Logged actions:
 * - VIEW_RESUME: User views their resume
 * - EXPORT_RESUME: User exports resume
 * - SHARE_RESUME: User creates share link
 * - UPDATE_RESUME: User updates resume
 * - DELETE_RESUME: User deletes resume
 * - ADMIN_ACCESS: Admin views user data
 * 
 * Usage:
 *   router.get('/api/base-resumes/:id', logPIIAccess('VIEW_RESUME'), handler);
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Log PII access to audit_logs table
 * @param {string} action - Action performed (VIEW_RESUME, EXPORT_RESUME, etc.)
 * @returns {Function} Express middleware
 */
function logPIIAccess(action) {
  return async (req, res, next) => {
    const userId = req.user?.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const resourceId = req.params.id || req.body.id;

    // Log the access
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || 'anonymous',
          action,
          resourceType: 'RESUME',
          resourceId,
          ipAddress,
          userAgent,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      // Don't block request if logging fails
      console.error('Failed to log PII access:', error);
    }

    next();
  };
}

/**
 * Get PII access logs for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Audit logs
 */
async function getPIIAccessLogs(userId, options = {}) {
  const {
    startDate,
    endDate,
    action,
    limit = 100,
    offset = 0,
  } = options;

  const where = {
    userId,
    resourceType: 'RESUME',
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (action) {
    where.action = action;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return logs;
}

/**
 * Get PII access summary for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Access summary
 */
async function getPIIAccessSummary(userId) {
  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      resourceType: 'RESUME',
    },
    select: {
      action: true,
      createdAt: true,
    },
  });

  const summary = {
    totalAccesses: logs.length,
    byAction: {},
    lastAccess: null,
    firstAccess: null,
  };

  logs.forEach(log => {
    summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
  });

  if (logs.length > 0) {
    summary.lastAccess = logs[0].createdAt;
    summary.firstAccess = logs[logs.length - 1].createdAt;
  }

  return summary;
}

/**
 * Detect suspicious PII access patterns
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Suspicious activities
 */
async function detectSuspiciousPIIAccess(userId) {
  const suspicious = [];

  // Check for rapid access (>50 in 1 minute)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentAccesses = await prisma.auditLog.count({
    where: {
      userId,
      resourceType: 'RESUME',
      createdAt: { gte: oneMinuteAgo },
    },
  });

  if (recentAccesses > 50) {
    suspicious.push({
      type: 'RAPID_ACCESS',
      count: recentAccesses,
      message: `${recentAccesses} PII accesses in last minute`,
    });
  }

  // Check for access from multiple IPs in short time
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentIPs = await prisma.auditLog.findMany({
    where: {
      userId,
      resourceType: 'RESUME',
      createdAt: { gte: oneHourAgo },
    },
    select: { ipAddress: true },
    distinct: ['ipAddress'],
  });

  if (recentIPs.length > 5) {
    suspicious.push({
      type: 'MULTIPLE_IPS',
      count: recentIPs.length,
      message: `Access from ${recentIPs.length} different IPs in last hour`,
    });
  }

  // Check for unusual export activity (>10 exports in 1 hour)
  const recentExports = await prisma.auditLog.count({
    where: {
      userId,
      action: 'EXPORT_RESUME',
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentExports > 10) {
    suspicious.push({
      type: 'EXCESSIVE_EXPORTS',
      count: recentExports,
      message: `${recentExports} resume exports in last hour`,
    });
  }

  return suspicious;
}

module.exports = {
  logPIIAccess,
  getPIIAccessLogs,
  getPIIAccessSummary,
  detectSuspiciousPIIAccess,
};

