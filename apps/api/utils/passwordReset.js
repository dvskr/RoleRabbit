/**
 * Password Reset Utility
 * Handles password reset token generation and validation
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('./db');
const { hashPassword } = require('./security');
const { sendPasswordResetEmail } = require('./emailService');
const logger = require('./logger');

/**
 * Generate a password reset token
 * @param {string} userId - User ID
 * @param {number} expiresInHours - Token expiration in hours (default: 1)
 */
async function generatePasswordResetToken(userId, expiresInHours = 1) {
  try {
    // Ensure password_reset_tokens model exists (defensive check)
    if (!prisma.password_reset_tokens) {
      logger.error('Prisma password_reset_tokens model not found. Run "npx prisma generate" to regenerate the client.');
      throw new Error('Password reset token model not available');
    }
    
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000); // Default 1 hour expiry
    
    // Generate UUID for password reset token id
    const tokenId = uuidv4();
    const now = new Date();
    
    // Store token in database
    await prisma.password_reset_tokens.create({
      data: {
        id: tokenId,
        userId,
        token,
        expiresAt,
        createdAt: now
      }
    });
    
    return token;
  } catch (error) {
    logger.error('Failed to generate password reset token', error);
    throw error;
  }
}

/**
 * Validate a password reset token
 */
async function validatePasswordResetToken(token) {
  try {
    // Ensure password_reset_tokens model exists (defensive check)
    if (!prisma.password_reset_tokens) {
      logger.error('Prisma password_reset_tokens model not found. Run "npx prisma generate" to regenerate the client.');
      return { valid: false, error: 'Token model not available' };
    }
    
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { token },
      include: { users: true }
    });
    
    if (!resetToken) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await prisma.password_reset_tokens.delete({
        where: { token }
      });
      return { valid: false, error: 'Token expired' };
    }
    
    if (resetToken.used) {
      return { valid: false, error: 'Token already used' };
    }
    
    return { valid: true, user: resetToken.users };
  } catch (error) {
    logger.error('Failed to validate password reset token', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Reset user password with token
 */
async function resetUserPassword(token, newPassword) {
  try {
    const validation = await validatePasswordResetToken(token);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    const now = new Date();
    await prisma.users.update({
      where: { id: validation.user.id },
      data: { 
        password: hashedPassword,
        updatedAt: now
      }
    });
    
    // Mark token as used
    await prisma.password_reset_tokens.update({
      where: { token },
      data: { used: true }
    });
    
    // Delete all other active reset tokens for this user
    await prisma.password_reset_tokens.deleteMany({
      where: {
        userId: validation.user.id,
        used: false
      }
    });
    
    logger.info(`Password reset successful for user ${validation.user.id}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to reset password', error);
    return { success: false, error: 'Password reset failed' };
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmailToUser(email) {
  try {
    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }
    
    const token = await generatePasswordResetToken(user.id);
    
    await sendPasswordResetEmail(email, token);
    
    logger.info(`Password reset email sent to ${email}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to send password reset email', error);
    throw error;
  }
}

/**
 * Cleanup expired tokens
 */
async function cleanupExpiredTokens() {
  try {
    // Ensure password_reset_tokens model exists (defensive check)
    if (!prisma.password_reset_tokens) {
      logger.error('Prisma password_reset_tokens model not found. Run "npx prisma generate" to regenerate the client.');
      return 0;
    }
    
    const result = await prisma.password_reset_tokens.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    logger.info(`Cleaned up ${result.count} expired password reset tokens`);
    return result.count;
  } catch (error) {
    logger.error('Failed to cleanup expired tokens', error);
    throw error;
  }
}

// Alias for backward compatibility
const createPasswordResetToken = generatePasswordResetToken;

module.exports = {
  generatePasswordResetToken,
  createPasswordResetToken, // Alias for backward compatibility
  validatePasswordResetToken,
  resetUserPassword,
  sendPasswordResetEmailToUser,
  cleanupExpiredTokens
};
