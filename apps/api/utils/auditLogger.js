/**
 * Audit Logging System
 * Tracks all important user actions and system events
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');

const AuditActions = {
  // User actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  USER_PROFILE_UPDATE: 'USER_PROFILE_UPDATE',
  
  // Resume actions
  RESUME_CREATE: 'RESUME_CREATE',
  RESUME_UPDATE: 'RESUME_UPDATE',
  RESUME_DELETE: 'RESUME_DELETE',
  RESUME_EXPORT: 'RESUME_EXPORT',
  
  // Job actions
  JOB_CREATE: 'JOB_CREATE',
  JOB_UPDATE: 'JOB_UPDATE',
  JOB_DELETE: 'JOB_DELETE',
  
  // Document actions
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',
  DOCUMENT_SHARE: 'DOCUMENT_SHARE',
  
  // System actions
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SECURITY_ALERT: 'SECURITY_ALERT'
};

/**
 * Log an audit event
 */
async function logAuditEvent({ userId, action, resource, resourceId, details, ip, userAgent }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resource: resource || null,
        resourceId: resourceId || null,
        details: details ? JSON.stringify(details) : null,
        ip,
        userAgent
      }
    });
  } catch (error) {
    logger.error('Failed to log audit event:', error);
    // Don't throw - audit logging should never break the application
  }
}

/**
 * Get audit logs for a user
 */
async function getUserAuditLogs(userId, limit = 100) {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    logger.error('Failed to get audit logs:', error);
    throw error;
  }
}

/**
 * Get audit logs for a resource
 */
async function getResourceAuditLogs(resource, resourceId, limit = 100) {
  try {
    return await prisma.auditLog.findMany({
      where: { resource, resourceId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    logger.error('Failed to get resource audit logs:', error);
    throw error;
  }
}

module.exports = {
  AuditActions,
  logAuditEvent,
  getUserAuditLogs,
  getResourceAuditLogs
};

