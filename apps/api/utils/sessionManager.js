/**
 * Session Management Utilities
 */

const crypto = require('crypto');
const { prisma } = require('./db');

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Detect device type from user agent
 */
function detectDevice(userAgent) {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Create a new session for a user
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent string
 * @param {number} expiresInDays - Session expiration in days (default: 30)
 * @returns {Promise<string>} Session ID
 */
async function createSession(userId, ipAddress, userAgent, expiresInDays = 30) {
  const sessionId = generateSessionId();
  const device = detectDevice(userAgent);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      device,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
    },
  });

  return sessionId;
}

/**
 * Get active sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active sessions
 */
async function getUserSessions(userId) {
  return prisma.session.findMany({
    where: {
      userId,
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      lastActivity: 'desc',
    },
  });
}

/**
 * Get a specific session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session object or null
 */
async function getSession(sessionId) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
}

/**
 * Update session last activity
 * @param {string} sessionId - Session ID
 */
async function updateSessionActivity(sessionId) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        lastActivity: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Deactivate a session
 * @param {string} sessionId - Session ID
 */
async function deactivateSession(sessionId) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
      },
    });
  } catch (error) {
    console.error('Error deactivating session:', error);
  }
}

/**
 * Deactivate all sessions for a user
 * @param {string} userId - User ID
 */
async function deactivateAllUserSessions(userId) {
  try {
    await prisma.session.updateMany({
      where: { userId },
      data: {
        isActive: false,
      },
    });
  } catch (error) {
    console.error('Error deactivating user sessions:', error);
  }
}

/**
 * Clean up expired sessions (cron job)
 */
async function cleanupExpiredSessions() {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`Cleaned up ${result.count} expired sessions`);
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

module.exports = {
  createSession,
  getUserSessions,
  getSession,
  updateSessionActivity,
  deactivateSession,
  deactivateAllUserSessions,
  cleanupExpiredSessions,
};

