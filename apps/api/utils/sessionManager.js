/**
 * Session Management Utility
 * Handles user session creation, validation, and cleanup
 */

const crypto = require('crypto');
const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Create a new session for user
 */
async function createSession(userId, ipAddress, userAgent, daysToExpire = 7) {
  try {
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000)
      }
    });
    
    logger.info(`Session created for user ${userId}`);
    
    return sessionId; // Return sessionId, not the full session object
  } catch (error) {
    logger.error('Failed to create session', error);
    throw error;
  }
}

/**
 * Get active session by ID
 */
async function getSession(sessionId) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await deactivateSession(sessionId);
      return null;
    }
    
    // Check if session is active
    if (!session.isActive) {
      return null;
    }
    
    return session;
  } catch (error) {
    logger.error('Failed to get session', error);
    return null;
  }
}

/**
 * Deactivate a session
 */
async function deactivateSession(sessionId) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    });
    
    logger.info(`Session deactivated: ${sessionId}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to deactivate session', error);
    throw error;
  }
}

/**
 * Deactivate all sessions for a user
 */
async function deactivateAllUserSessions(userId) {
  try {
    const result = await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });
    
    logger.info(`Deactivated ${result.count} sessions for user ${userId}`);
    
    return result.count;
  } catch (error) {
    logger.error('Failed to deactivate user sessions', error);
    throw error;
  }
}

/**
 * Get all active sessions for a user
 */
async function getUserSessions(userId) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return sessions;
  } catch (error) {
    logger.error('Failed to get user sessions', error);
    return [];
  }
}

/**
 * Refresh session expiry
 */
async function refreshSession(sessionId) {
  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Extend 7 days
        lastActivityAt: new Date()
      }
    });
    
    return session;
  } catch (error) {
    logger.error('Failed to refresh session', error);
    throw error;
  }
}

/**
 * Cleanup expired sessions
 */
async function cleanupExpiredSessions() {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    logger.info(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    logger.error('Failed to cleanup expired sessions', error);
    throw error;
  }
}

module.exports = {
  createSession,
  getSession,
  deactivateSession,
  deactivateAllUserSessions,
  getUserSessions,
  refreshSession,
  cleanupExpiredSessions
};
