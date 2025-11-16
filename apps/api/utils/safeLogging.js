/**
 * SEC-016 to SEC-020: Safe logging utilities (prevent leaking sensitive data)
 */

const logger = require('./logger');
const { maskEmail, sanitizePath, sanitizeShareToken } = require('./fileAuditTrail');

/**
 * SEC-016: Ensure file content is never logged
 * SEC-017: Ensure file paths are sanitized in logs
 * SEC-018: Ensure user emails are masked in logs
 * SEC-019: Ensure share link tokens are never logged
 */
class SafeLogger {
  /**
   * Log file operation without sensitive data
   */
  static logFileOperation(operation, data) {
    const safeData = {
      operation,
      fileId: data.fileId,
      userId: data.userId,
      // SEC-016: Never log file content
      fileName: data.fileName ? sanitizePath(data.fileName) : null,
      fileType: data.fileType || null,
      fileSize: data.fileSize || null,
      // SEC-017: Sanitize paths
      storagePath: data.storagePath ? sanitizePath(data.storagePath) : null,
      // SEC-018: Mask emails
      userEmail: data.userEmail ? maskEmail(data.userEmail) : null,
      // SEC-019: Never log tokens
      shareToken: data.shareToken ? sanitizeShareToken(data.shareToken) : null,
      timestamp: new Date().toISOString(),
    };

    logger.info(`[FileOperation] ${operation}`, safeData);
    return safeData;
  }

  /**
   * Log error without sensitive data
   */
  static logError(operation, error, context = {}) {
    const safeContext = {
      operation,
      error: {
        message: error.message,
        name: error.name,
        // Never log stack traces in production
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      // Sanitize context
      fileId: context.fileId,
      userId: context.userId,
      fileName: context.fileName ? sanitizePath(context.fileName) : null,
      userEmail: context.userEmail ? maskEmail(context.userEmail) : null,
      shareToken: context.shareToken ? sanitizeShareToken(context.shareToken) : null,
    };

    logger.error(`[FileOperation] ${operation} failed`, safeContext);
    return safeContext;
  }
}

/**
 * SEC-020: Log rotation and retention policies
 */
class LogRotation {
  /**
   * Clean up old logs (retention policy)
   */
  static async cleanupOldLogs(retentionDays = 90) {
    try {
      const { prisma } = require('./db');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await prisma.file_access_logs.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${result.count} old log entries (older than ${retentionDays} days)`);
      return result.count;
    } catch (error) {
      logger.error('Log cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Schedule log rotation
   */
  static scheduleLogRotation(retentionDays = 90) {
    // Run weekly
    setInterval(async () => {
      try {
        await this.cleanupOldLogs(retentionDays);
      } catch (error) {
        logger.error('Scheduled log rotation failed:', error);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    // Also run on startup
    this.cleanupOldLogs(retentionDays).catch(error => {
      logger.error('Initial log cleanup failed:', error);
    });
  }
}

module.exports = {
  SafeLogger,
  LogRotation,
};

