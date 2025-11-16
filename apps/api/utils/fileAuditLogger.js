/**
 * SEC-004: File access logging for compliance
 * SEC-008: File access audit trail (comprehensive logging)
 * SEC-016: Ensure file content is never logged
 * SEC-017: Ensure file paths are sanitized in logs
 * SEC-018: Ensure user emails are masked in logs
 * SEC-019: Ensure share link tokens are never logged
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * SEC-018: Mask email address
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) {
    return email;
  }
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local.substring(0, 2) + '*'.repeat(local.length - 2)
    : '**';
  return `${maskedLocal}@${domain}`;
}

/**
 * SEC-017: Sanitize file path (remove sensitive info)
 */
function sanitizePath(path) {
  if (!path) return null;
  // Remove user IDs from path
  return path.replace(/\/[a-f0-9-]{36}\//g, '/[USER_ID]/');
}

/**
 * SEC-019: Mask share link token
 */
function maskToken(token) {
  if (!token || token.length < 8) {
    return '[TOKEN]';
  }
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

/**
 * SEC-004, SEC-008: Log file access
 */
async function logFileAccess(data) {
  try {
    const {
      fileId,
      userId,
      action, // 'view', 'download', 'upload', 'delete', 'share', 'edit'
      ipAddress,
      userAgent,
      success,
      error,
      metadata = {},
    } = data;

    // SEC-016: Never log file content
    // SEC-017: Sanitize paths
    // SEC-018: Mask emails
    // SEC-019: Mask tokens
    const sanitizedMetadata = {
      ...metadata,
      // Remove any potential file content
      fileContent: undefined,
      fileBuffer: undefined,
      // Sanitize paths
      filePath: metadata.filePath ? sanitizePath(metadata.filePath) : undefined,
      storagePath: metadata.storagePath ? sanitizePath(metadata.storagePath) : undefined,
      // Mask emails
      userEmail: metadata.userEmail ? maskEmail(metadata.userEmail) : undefined,
      sharedWithEmail: metadata.sharedWithEmail ? maskEmail(metadata.sharedWithEmail) : undefined,
      // Mask tokens
      shareToken: metadata.shareToken ? maskToken(metadata.shareToken) : undefined,
      // Only log safe metadata
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      contentType: metadata.contentType,
      permission: metadata.permission,
    };

    // Log to database
    await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        success,
        error: error ? error.message : null,
        metadata: sanitizedMetadata,
      },
    });

    // Log to application logs (structured)
    logger.info('[FileAccess]', {
      fileId,
      userId,
      action,
      success,
      // SEC-016, SEC-017, SEC-018, SEC-019: Only safe metadata
      metadata: sanitizedMetadata,
    });
  } catch (error) {
    logger.error('Failed to log file access:', error);
    // Don't throw - logging failures shouldn't break the application
  }
}

/**
 * SEC-004: Log file view/download
 */
async function logFileView(fileId, userId, ipAddress, userAgent, success = true, error = null) {
  await logFileAccess({
    fileId,
    userId,
    action: 'view',
    ipAddress,
    userAgent,
    success,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * SEC-004: Log file download
 */
async function logFileDownload(fileId, userId, ipAddress, userAgent, success = true, error = null) {
  await logFileAccess({
    fileId,
    userId,
    action: 'download',
    ipAddress,
    userAgent,
    success,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * SEC-004: Log file upload
 */
async function logFileUpload(fileId, userId, fileName, fileSize, contentType, success = true, error = null) {
  await logFileAccess({
    fileId,
    userId,
    action: 'upload',
    success,
    error,
    metadata: {
      fileName,
      fileSize,
      contentType,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * SEC-004: Log file delete
 */
async function logFileDelete(fileId, userId, permanent = false, success = true, error = null) {
  await logFileAccess({
    fileId,
    userId,
    action: permanent ? 'delete_permanent' : 'delete',
    success,
    error,
    metadata: {
      permanent,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * SEC-004: Log file share
 */
async function logFileShare(fileId, userId, sharedWithEmail, permission, success = true, error = null) {
  await logFileAccess({
    fileId,
    userId,
    action: 'share',
    success,
    error,
    metadata: {
      sharedWithEmail, // Will be masked by logFileAccess
      permission,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * SEC-004: Log file edit
 */
async function logFileEdit(fileId, userId, changes, success = true, error = null) {
  await logFileAccess({
    fileId,
    userId,
    action: 'edit',
    success,
    error,
    metadata: {
      changes: Object.keys(changes), // Only log field names, not values
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  logFileAccess,
  logFileView,
  logFileDownload,
  logFileUpload,
  logFileDelete,
  logFileShare,
  logFileEdit,
  maskEmail,
  sanitizePath,
  maskToken,
};
