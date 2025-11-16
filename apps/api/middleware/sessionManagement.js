/**
 * Session Management Middleware
 * 
 * Manages JWT token lifecycle:
 * - Access token: 15 minutes
 * - Refresh token: 7 days
 * - Auto-logout on expiration
 * - Token refresh mechanism
 * 
 * Usage:
 *   router.post('/api/auth/refresh', refreshAccessToken);
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

/**
 * Generate access token
 * @param {object} payload - Token payload (userId, email, etc.)
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token
 * @param {object} payload - Token payload (userId)
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Generate token pair (access + refresh)
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {object} Token pair
 */
function generateTokenPair(userId, email) {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = generateRefreshToken({ userId });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {object|null} Decoded token or null if invalid
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { expired: true };
    }
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object|null} Decoded token or null if invalid
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to check token expiration and auto-refresh
 */
async function checkTokenExpiration(req, res, next) {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  const refreshToken = req.headers['x-refresh-token'];

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'No access token provided',
      code: 'NO_TOKEN',
    });
  }

  const decoded = verifyAccessToken(accessToken);

  // Token is valid
  if (decoded && !decoded.expired) {
    req.user = decoded;
    return next();
  }

  // Token expired - try to refresh
  if (decoded?.expired && refreshToken) {
    try {
      const refreshDecoded = verifyRefreshToken(refreshToken);

      if (!refreshDecoded) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }

      // Check if refresh token is blacklisted
      const blacklisted = await prisma.tokenBlacklist.findUnique({
        where: { token: refreshToken },
      });

      if (blacklisted) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED',
        });
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: refreshDecoded.userId },
        select: { id: true, email: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        return res.status(401).json({
          success: false,
          error: 'User not found or deleted',
          code: 'USER_NOT_FOUND',
        });
      }

      // Generate new token pair
      const tokens = generateTokenPair(user.id, user.email);

      // Send new tokens in response headers
      res.setHeader('X-New-Access-Token', tokens.accessToken);
      res.setHeader('X-New-Refresh-Token', tokens.refreshToken);

      req.user = { userId: user.id, email: user.email };
      return next();
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({
        success: false,
        error: 'Failed to refresh token',
        code: 'REFRESH_FAILED',
      });
    }
  }

  // No valid token
  return res.status(401).json({
    success: false,
    error: 'Access token expired',
    code: 'TOKEN_EXPIRED',
    details: {
      message: 'Please refresh your token or log in again',
    },
  });
}

/**
 * Refresh access token endpoint handler
 */
async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token required',
      code: 'NO_REFRESH_TOKEN',
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Check blacklist
    const blacklisted = await prisma.tokenBlacklist.findUnique({
      where: { token: refreshToken },
    });

    if (blacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token has been revoked',
        code: 'TOKEN_REVOKED',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: 'User not found or deleted',
        code: 'USER_NOT_FOUND',
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user.id, user.email);

    // Blacklist old refresh token
    await prisma.tokenBlacklist.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      ...tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
      code: 'REFRESH_FAILED',
    });
  }
}

/**
 * Logout (blacklist tokens)
 */
async function logout(req, res) {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  const refreshToken = req.headers['x-refresh-token'] || req.body.refreshToken;
  const userId = req.user?.userId;

  try {
    const blacklistPromises = [];

    // Blacklist refresh token
    if (refreshToken) {
      blacklistPromises.push(
        prisma.tokenBlacklist.create({
          data: {
            token: refreshToken,
            userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        })
      );
    }

    // Blacklist access token (optional, since it expires in 15 min)
    if (accessToken) {
      blacklistPromises.push(
        prisma.tokenBlacklist.create({
          data: {
            token: accessToken,
            userId,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },
        })
      );
    }

    await Promise.all(blacklistPromises);

    // Log logout
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resourceType: 'USER',
        resourceId: userId,
        ipAddress: req.ip,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
      code: 'LOGOUT_FAILED',
    });
  }
}

/**
 * Clean up expired tokens from blacklist
 */
async function cleanupExpiredTokens() {
  try {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    console.log(`✅ Cleaned up ${result.count} expired tokens`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error);
    throw error;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  checkTokenExpiration,
  refreshAccessToken,
  logout,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};

