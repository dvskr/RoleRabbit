/**
 * Password Reset Utility
 * Handles password reset token generation and validation
 */

const crypto = require('crypto');
const { prisma } = require('./db');
const { hashPassword } = require('./security');
const { sendPasswordResetEmail } = require('./emailService');
const logger = require('./logger');

/**
 * Generate a password reset token
 */
async function generatePasswordResetToken(userId) {
  try {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    
    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt
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
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });
    
    if (!resetToken) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token }
      });
      return { valid: false, error: 'Token expired' };
    }
    
    if (resetToken.used) {
      return { valid: false, error: 'Token already used' };
    }
    
    return { valid: true, user: resetToken.user };
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
    await prisma.user.update({
      where: { id: validation.user.id },
      data: { password: hashedPassword }
    });
    
    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true }
    });
    
    // Delete all other active reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
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
    const user = await prisma.user.findUnique({
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
    const result = await prisma.passwordResetToken.deleteMany({
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

module.exports = {
  generatePasswordResetToken,
  validatePasswordResetToken,
  resetUserPassword,
  sendPasswordResetEmailToUser,
  cleanupExpiredTokens
};
