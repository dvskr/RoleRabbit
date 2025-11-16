/**
 * BE-047: Consistently log file access in FileAccessLog table
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Log file access
 * BE-047: Consistently log file access
 */
async function logFileAccess({ fileId, userId, action, ipAddress, userAgent }) {
  try {
    await prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        action, // view, download, share, edit, delete
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    });
  } catch (error) {
    // Don't fail the request if logging fails
    logger.error('Failed to log file access:', error);
  }
}

/**
 * Get file access logs
 */
async function getFileAccessLogs(fileId, limit = 100) {
  try {
    return await prisma.fileAccessLog.findMany({
      where: { fileId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    logger.error('Failed to get file access logs:', error);
    throw error;
  }
}

/**
 * Get user's file access logs
 */
async function getUserFileAccessLogs(userId, limit = 100) {
  try {
    return await prisma.fileAccessLog.findMany({
      where: { userId },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            fileName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    logger.error('Failed to get user file access logs:', error);
    throw error;
  }
}

module.exports = {
  logFileAccess,
  getFileAccessLogs,
  getUserFileAccessLogs
};

