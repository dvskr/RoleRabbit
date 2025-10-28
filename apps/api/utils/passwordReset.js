/**
 * Password Reset Utilities
 */

const crypto = require('crypto');
const { prisma } = require('./db');

/**
 * Generate a secure password reset token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset token for a user
 * @param {string} userId - User ID
 * @param {number} expiresInHours - Token expiration in hours (default: 1)
 * @returns {Promise<string>} Reset token
 */
async function createPasswordResetToken(userId, expiresInHours = 1) {
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  // Invalidate any existing unused reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      used: false,
    },
    data: {
      used: true,
    },
  });

  // Create new reset token
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify and get a password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object|null>} Token with user info or null
 */
async function verifyPasswordResetToken(token) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return null;
  }

  // Check if token is used
  if (resetToken.used) {
    return null;
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    return null;
  }

  return resetToken;
}

/**
 * Mark a password reset token as used
 * @param {string} token - Reset token
 */
async function markTokenAsUsed(token) {
  await prisma.passwordResetToken.updateMany({
    where: { token },
    data: { used: true },
  });
}

/**
 * Clean up expired tokens (cron job)
 */
async function cleanupExpiredTokens() {
  try {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`Cleaned up ${result.count} expired password reset tokens`);
  } catch (error) {
    console.error('Error cleaning up expired password reset tokens:', error);
  }
}

module.exports = {
  createPasswordResetToken,
  verifyPasswordResetToken,
  markTokenAsUsed,
  cleanupExpiredTokens,
};

