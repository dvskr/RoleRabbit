/**
 * Refresh Token Management Utilities
 */

const crypto = require('crypto');
const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Generate a secure random refresh token
 */
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Create a refresh token for a user
 * @param {string} userId - User ID
 * @param {number} expiresInDays - Token expiration in days (default: 7)
 * @returns {Promise<string>} The refresh token
 */
async function createRefreshToken(userId, expiresInDays = 7) {
  const token = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Promise<{userId: string}|null>} User ID if valid, null otherwise
 */
async function verifyRefreshToken(token) {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    // Check if token is expired
    if (new Date() > refreshToken.expiresAt) {
      // Remove expired token
      await prisma.refreshToken.delete({
        where: { token },
      });
      return null;
    }

    return {
      userId: refreshToken.userId,
      user: refreshToken.user,
    };
  } catch (error) {
    logger.error('Error decoding refresh token:', error);
    return null;
  }
}

/**
 * Delete a refresh token
 * @param {string} token - Refresh token to delete
 */
async function deleteRefreshToken(token) {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
  } catch (error) {
    logger.error('Error deleting refresh token:', error);
  }
}

/**
 * Delete all refresh tokens for a user
 * @param {string} userId - User ID
 */
async function deleteAllUserRefreshTokens(userId) {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  } catch (error) {
    logger.error('Error deleting user refresh tokens:', error);
  }
}

/**
 * Clean up expired refresh tokens (cron job)
 */
async function cleanupExpiredTokens() {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    logger.info(`Cleaned up ${result.count} expired refresh tokens`);
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
}

module.exports = {
  createRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  cleanupExpiredTokens,
};

