/**
 * Audit Logging Utility
 * 
 * Logs sensitive operations for security and compliance.
 * Stores logs in database for review and analysis.
 */

/**
 * Audit Action Types
 */
const AuditAction = {
  // Resume operations
  RESUME_CREATED: 'RESUME_CREATED',
  RESUME_UPDATED: 'RESUME_UPDATED',
  RESUME_DELETED: 'RESUME_DELETED',
  RESUME_EXPORTED: 'RESUME_EXPORTED',
  RESUME_DUPLICATED: 'RESUME_DUPLICATED',
  RESUME_RESTORED: 'RESUME_RESTORED',
  
  // Sharing operations
  RESUME_SHARED: 'RESUME_SHARED',
  SHARE_LINK_CREATED: 'SHARE_LINK_CREATED',
  SHARE_LINK_REVOKED: 'SHARE_LINK_REVOKED',
  
  // AI operations
  AI_ANALYSIS_PERFORMED: 'AI_ANALYSIS_PERFORMED',
  RESUME_TAILORED: 'RESUME_TAILORED',
  COVER_LETTER_GENERATED: 'COVER_LETTER_GENERATED',
  
  // Authentication
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // Admin operations
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  USER_IMPERSONATED: 'USER_IMPERSONATED'
};

/**
 * Get client IP address
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Get user agent
 */
function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Log audit event
 */
async function logAuditEvent(prisma, event) {
  const {
    userId,
    action,
    resourceType,
    resourceId,
    details = {},
    ipAddress,
    userAgent,
    success = true
  } = event;

  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        details: JSON.stringify(details),
        ipAddress,
        userAgent,
        success,
        timestamp: new Date()
      }
    });

    console.log('Audit log created:', {
      id: auditLog.id,
      userId,
      action,
      resourceType,
      resourceId
    });

    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
}

/**
 * Middleware: Audit logging for sensitive operations
 */
function auditLogMiddleware(action, options = {}) {
  return async (req, res, next) => {
    const {
      resourceType = 'resume',
      getResourceId = (req) => req.params.id,
      getDetails = () => ({}),
      logOnSuccess = true,
      logOnError = true
    } = options;

    // Store original send function
    const originalSend = res.send;
    const originalJson = res.json;

    // Track if response was successful
    let responseSuccess = true;
    let responseData = null;

    // Override send function
    res.send = function(data) {
      responseData = data;
      responseSuccess = res.statusCode < 400;
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      responseData = data;
      responseSuccess = res.statusCode < 400;
      return originalJson.call(this, data);
    };

    // Wait for response to complete
    res.on('finish', async () => {
      try {
        // Check if we should log
        if ((responseSuccess && !logOnSuccess) || (!responseSuccess && !logOnError)) {
          return;
        }

        const userId = req.user?.id;
        const resourceId = getResourceId(req);
        const details = getDetails(req, res, responseData);
        const ipAddress = getClientIP(req);
        const userAgent = getUserAgent(req);

        await logAuditEvent(req.prisma || global.prisma, {
          userId,
          action,
          resourceType,
          resourceId,
          details,
          ipAddress,
          userAgent,
          success: responseSuccess
        });
      } catch (error) {
        console.error('Audit middleware error:', error);
      }
    });

    next();
  };
}

/**
 * Helper: Log resume deletion
 */
async function logResumeDeletion(prisma, req, resumeId, resumeName) {
  return logAuditEvent(prisma, {
    userId: req.user.id,
    action: AuditAction.RESUME_DELETED,
    resourceType: 'resume',
    resourceId: resumeId,
    details: {
      resumeName,
      deletedAt: new Date().toISOString()
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req)
  });
}

/**
 * Helper: Log resume export
 */
async function logResumeExport(prisma, req, resumeId, format) {
  return logAuditEvent(prisma, {
    userId: req.user.id,
    action: AuditAction.RESUME_EXPORTED,
    resourceType: 'resume',
    resourceId: resumeId,
    details: {
      format,
      exportedAt: new Date().toISOString()
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req)
  });
}

/**
 * Helper: Log share link creation
 */
async function logShareLinkCreation(prisma, req, resumeId, shareUrl, expiresAt) {
  return logAuditEvent(prisma, {
    userId: req.user.id,
    action: AuditAction.SHARE_LINK_CREATED,
    resourceType: 'resume',
    resourceId: resumeId,
    details: {
      shareUrl,
      expiresAt: expiresAt?.toISOString(),
      createdAt: new Date().toISOString()
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req)
  });
}

/**
 * Helper: Log AI operation
 */
async function logAIOperation(prisma, req, action, resumeId, details = {}) {
  return logAuditEvent(prisma, {
    userId: req.user.id,
    action,
    resourceType: 'resume',
    resourceId: resumeId,
    details: {
      ...details,
      performedAt: new Date().toISOString()
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req)
  });
}

/**
 * Get audit logs for user
 */
async function getUserAuditLogs(prisma, userId, options = {}) {
  const {
    limit = 100,
    offset = 0,
    action = null,
    resourceType = null,
    startDate = null,
    endDate = null
  } = options;

  const where = { userId };

  if (action) {
    where.action = action;
  }

  if (resourceType) {
    where.resourceType = resourceType;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = new Date(startDate);
    }
    if (endDate) {
      where.timestamp.lte = new Date(endDate);
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    logs: logs.map(log => ({
      ...log,
      details: JSON.parse(log.details || '{}')
    })),
    total,
    limit,
    offset
  };
}

/**
 * Get audit statistics
 */
async function getAuditStatistics(prisma, userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      timestamp: { gte: startDate }
    },
    select: {
      action: true,
      success: true
    }
  });

  const stats = {
    totalEvents: logs.length,
    successfulEvents: logs.filter(l => l.success).length,
    failedEvents: logs.filter(l => !l.success).length,
    actionCounts: {}
  };

  logs.forEach(log => {
    stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;
  });

  return stats;
}

/**
 * Clean up old audit logs
 */
async function cleanupOldAuditLogs(prisma, daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: cutoffDate }
    }
  });

  console.log(`Cleaned up ${result.count} old audit logs`);
  return result.count;
}

module.exports = {
  AuditAction,
  logAuditEvent,
  auditLogMiddleware,
  logResumeDeletion,
  logResumeExport,
  logShareLinkCreation,
  logAIOperation,
  getUserAuditLogs,
  getAuditStatistics,
  cleanupOldAuditLogs,
  getClientIP,
  getUserAgent
};

