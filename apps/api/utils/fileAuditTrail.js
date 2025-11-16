/**
 * SEC-004: File access logging for compliance
 * SEC-008: File access audit trail (comprehensive logging)
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * SEC-004, SEC-008: Log file access
 * Supports both signatures:
 * - logFileAccess({ fileId, userId, action, ipAddress, userAgent })
 * - logFileAccess(fileId, userId, action, metadata)
 */
async function logFileAccess(fileIdOrObj, userId, action, metadata = {}) {
  // Support both call signatures
  let fileId, actualUserId, actualAction, actualMetadata;
  
  if (typeof fileIdOrObj === 'object' && fileIdOrObj !== null) {
    // Called as: logFileAccess({ fileId, userId, action, ipAddress, userAgent })
    const obj = fileIdOrObj;
    fileId = obj.fileId;
    actualUserId = obj.userId;
    actualAction = obj.action;
    actualMetadata = {
      ipAddress: obj.ipAddress,
      userAgent: obj.userAgent,
      ...obj
    };
  } else {
    // Called as: logFileAccess(fileId, userId, action, metadata)
    fileId = fileIdOrObj;
    actualUserId = userId;
    actualAction = action;
    actualMetadata = metadata;
  }
  try {
    // SEC-016: Never log file content, only metadata
    const sanitizedMetadata = {
      fileId,
      fileName: actualMetadata.fileName || null,
      fileType: actualMetadata.fileType || null,
      fileSize: actualMetadata.fileSize || null,
      // SEC-017: Sanitize file paths
      storagePath: actualMetadata.storagePath ? sanitizePath(actualMetadata.storagePath) : null,
      ipAddress: actualMetadata.ipAddress || null,
      userAgent: actualMetadata.userAgent || null,
      // SEC-018: Mask user emails (only log userId)
      userId: actualUserId,
      // SEC-019: Never log share link tokens
      shareTokenUsed: actualMetadata.shareTokenUsed ? '***' : null,
      timestamp: new Date(),
    };

    // Store in database
    await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId: actualUserId,
        action: actualAction,
        metadata: sanitizedMetadata,
        ipAddress: sanitizedMetadata.ipAddress,
        userAgent: sanitizedMetadata.userAgent,
      },
    });

    // Also log to application logs (structured)
    logger.info(`[FileAccess] ${actualAction}`, {
      fileId,
      userId: actualUserId,
      action: actualAction,
      // SEC-016: Only safe metadata
      metadata: {
        fileName: sanitizedMetadata.fileName,
        fileType: sanitizedMetadata.fileType,
        fileSize: sanitizedMetadata.fileSize,
      },
    });
  } catch (error) {
    logger.error('Failed to log file access:', error);
    // Don't throw - logging failures shouldn't break operations
  }
}

/**
 * SEC-017: Sanitize file paths in logs
 */
function sanitizePath(path) {
  if (!path) return null;
  // Remove sensitive parts, keep only structure
  return path.replace(/\/[^/]+\//g, '/***/').substring(0, 100); // Limit length
}

/**
 * SEC-018: Mask user email in logs
 */
function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 2 
    ? `${local[0]}***${local[local.length - 1]}`
    : '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * SEC-019: Never log share link tokens
 */
function sanitizeShareToken(token) {
  if (!token) return null;
  return '***'; // Always mask tokens
}

/**
 * Get audit trail for file
 */
async function getFileAuditTrail(fileId, limit = 100) {
  try {
    const logs = await prisma.fileAccessLog.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        userId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        metadata: true,
      },
    });

    return logs;
  } catch (error) {
    logger.error('Failed to get audit trail:', error);
    throw error;
  }
}

/**
 * Get audit trail for user
 */
async function getUserAuditTrail(userId, limit = 100) {
  try {
    const logs = await prisma.fileAccessLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        fileId: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    });

    return logs;
  } catch (error) {
    logger.error('Failed to get user audit trail:', error);
    throw error;
  }
}

module.exports = {
  logFileAccess,
  sanitizePath,
  maskEmail,
  sanitizeShareToken,
  getFileAuditTrail,
  getUserAuditTrail,
};

