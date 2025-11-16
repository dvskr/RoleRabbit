/**
 * Session Management Utility
 * 
 * Implements secure session management with:
 * - Access token (15 minutes)
 * - Refresh token (7 days)
 * - Auto-logout on inactivity
 * - Session tracking
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Create new session with access and refresh tokens
 * 
 * @param {Object} user - User object
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {Object} - { accessToken, refreshToken, expiresIn }
 */
async function createSession(user, ipAddress, userAgent) {
  try {
    const userId = user.id || user.userId;
    const sessionId = crypto.randomUUID();
    
    // Generate access token
    const accessToken = jwt.sign(
      {
        userId,
        sessionId,
        type: 'access'
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId,
        sessionId,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    
    // Hash tokens for storage
    const accessTokenHash = hashToken(accessToken);
    const refreshTokenHash = hashToken(refreshToken);
    
    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    // Store session in database
    await prisma.$executeRaw`
      INSERT INTO user_sessions (
        id, user_id, refresh_token_hash, access_token_hash,
        ip_address, user_agent, is_active, expires_at,
        created_at, last_activity_at
      ) VALUES (
        ${sessionId},
        ${userId},
        ${refreshTokenHash},
        ${accessTokenHash},
        ${ipAddress},
        ${userAgent},
        true,
        ${expiresAt.toISOString()},
        NOW(),
        NOW()
      )
    `;
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      sessionId
    };
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Refresh access token using refresh token
 * 
 * @param {string} refreshToken - Refresh token
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {Object} - { accessToken, expiresIn }
 */
async function refreshAccessToken(refreshToken, ipAddress, userAgent) {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production'
    );
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    const { userId, sessionId } = decoded;
    
    // Check if session exists and is active
    const refreshTokenHash = hashToken(refreshToken);
    const session = await prisma.$queryRawUnsafe(`
      SELECT * FROM user_sessions
      WHERE id = '${sessionId}'
        AND user_id = '${userId}'
        AND refresh_token_hash = '${refreshTokenHash}'
        AND is_active = true
        AND expires_at > NOW()
      LIMIT 1
    `);
    
    if (!session || session.length === 0) {
      throw new Error('Invalid or expired session');
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId,
        sessionId,
        type: 'access'
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Update session with new access token hash
    const accessTokenHash = hashToken(accessToken);
    await prisma.$executeRawUnsafe(`
      UPDATE user_sessions
      SET access_token_hash = '${accessTokenHash}',
          last_activity_at = NOW()
      WHERE id = '${sessionId}'
    `);
    
    return {
      accessToken,
      expiresIn: 900 // 15 minutes in seconds
    };
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Verify access token
 * 
 * @param {string} accessToken - Access token
 * @returns {Object} - Decoded token payload
 */
function verifyAccessToken(accessToken) {
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || 'default-secret-change-in-production'
    );
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Invalidate session (logout)
 * 
 * @param {string} sessionId - Session ID
 * @returns {boolean} - Success
 */
async function invalidateSession(sessionId) {
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE user_sessions
      SET is_active = false
      WHERE id = '${sessionId}'
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to invalidate session:', error);
    return false;
  }
}

/**
 * Invalidate all sessions for a user (logout all devices)
 * 
 * @param {string} userId - User ID
 * @returns {number} - Number of sessions invalidated
 */
async function invalidateAllUserSessions(userId) {
  try {
    const result = await prisma.$executeRawUnsafe(`
      UPDATE user_sessions
      SET is_active = false
      WHERE user_id = '${userId}' AND is_active = true
    `);
    
    return result;
  } catch (error) {
    console.error('Failed to invalidate all user sessions:', error);
    return 0;
  }
}

/**
 * Update session activity
 * 
 * @param {string} sessionId - Session ID
 */
async function updateSessionActivity(sessionId) {
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE user_sessions
      SET last_activity_at = NOW()
      WHERE id = '${sessionId}'
    `);
  } catch (error) {
    console.error('Failed to update session activity:', error);
  }
}

/**
 * Get active sessions for a user
 * 
 * @param {string} userId - User ID
 * @returns {Array} - Active sessions
 */
async function getUserSessions(userId) {
  try {
    const sessions = await prisma.$queryRawUnsafe(`
      SELECT id, ip_address, user_agent, created_at, last_activity_at, expires_at
      FROM user_sessions
      WHERE user_id = '${userId}' AND is_active = true
      ORDER BY last_activity_at DESC
    `);
    
    return sessions;
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

/**
 * Clean up expired sessions
 * 
 * @returns {number} - Number of sessions cleaned up
 */
async function cleanupExpiredSessions() {
  try {
    const result = await prisma.$executeRawUnsafe(`
      UPDATE user_sessions
      SET is_active = false
      WHERE expires_at < NOW() AND is_active = true
    `);
    
    console.log(`Cleaned up ${result} expired sessions`);
    return result;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }
}

/**
 * Clean up inactive sessions
 * 
 * @returns {number} - Number of sessions cleaned up
 */
async function cleanupInactiveSessions() {
  try {
    const cutoffTime = new Date(Date.now() - INACTIVITY_TIMEOUT);
    
    const result = await prisma.$executeRawUnsafe(`
      UPDATE user_sessions
      SET is_active = false
      WHERE last_activity_at < '${cutoffTime.toISOString()}'
        AND is_active = true
    `);
    
    console.log(`Cleaned up ${result} inactive sessions`);
    return result;
  } catch (error) {
    console.error('Failed to cleanup inactive sessions:', error);
    return 0;
  }
}

/**
 * Middleware to authenticate requests using access token
 * 
 * @returns {Function} - Express middleware
 */
function authenticateToken() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          code: 'TOKEN_REQUIRED'
        });
      }
      
      // Verify token
      const decoded = verifyAccessToken(token);
      
      // Update session activity
      await updateSessionActivity(decoded.sessionId);
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      };
      
      next();
    } catch (error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          error: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(403).json({
        success: false,
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    }
  };
}

/**
 * Hash token for storage
 * 
 * @param {string} token - Token to hash
 * @returns {string} - Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  createSession,
  refreshAccessToken,
  verifyAccessToken,
  invalidateSession,
  invalidateAllUserSessions,
  updateSessionActivity,
  getUserSessions,
  cleanupExpiredSessions,
  cleanupInactiveSessions,
  authenticateToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  INACTIVITY_TIMEOUT
};

