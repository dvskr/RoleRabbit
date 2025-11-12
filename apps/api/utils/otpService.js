/**
 * OTP Service
 * Handles generation, storage, and verification of OTP codes for email/password updates
 */

const { prisma } = require('./db');
const logger = require('./logger');

const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store an OTP for a user
 * @param {string} userId - User ID
 * @param {string} email - Email to send OTP to
 * @param {string} purpose - Purpose: 'email_update' or 'password_reset'
 * @returns {Promise<string>} - The generated OTP
 */
async function createOTP(userId, email, purpose) {
  const otp = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  // Delete any existing unused OTPs for this user (to prevent multiple active OTPs)
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: userId,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  // Create new OTP token with purpose encoded in token (prefix)
  // Format: {purpose}_{otp} where purpose is 'e' for email_update, 'p' for password_reset
  const purposePrefix = purpose === 'email_update' ? 'e' : 'p';
  const tokenWithPurpose = `${purposePrefix}_${otp}`;

  await prisma.passwordResetToken.create({
    data: {
      userId: userId,
      token: tokenWithPurpose,
      expiresAt: expiresAt
    }
  });

  logger.info(`OTP created for user ${userId}, purpose: ${purpose}, expires at: ${expiresAt}`);
  return otp;
}

/**
 * Verify an OTP
 * @param {string} userId - User ID
 * @param {string} otp - OTP code to verify (without prefix)
 * @param {string} purpose - Purpose: 'email_update' or 'password_reset'
 * @returns {Promise<boolean>} - True if OTP is valid
 */
async function verifyOTP(userId, otp, purpose) {
  const purposePrefix = purpose === 'email_update' ? 'e' : 'p';
  const tokenWithPurpose = `${purposePrefix}_${otp}`;

  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      userId: userId,
      token: tokenWithPurpose,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!tokenRecord) {
    return false;
  }

  // Mark OTP as used
  await prisma.passwordResetToken.update({
    where: { id: tokenRecord.id },
    data: { used: true }
  });

  return true;
}

/**
 * Get user by email and create OTP
 * @param {string} email - User email
 * @param {string} purpose - Purpose: 'email_update' or 'password_reset'
 * @returns {Promise<{success: boolean, otp?: string, userId?: string, error?: string}>}
 */
async function sendOTPToEmail(email, purpose) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: 'If an account with that email exists, an OTP has been sent.'
      };
    }

    const otp = await createOTP(user.id, email, purpose);
    
    return {
      success: true,
      otp: otp, // Only for development/testing
      userId: user.id,
      message: 'OTP has been sent to your email.'
    };
  } catch (error) {
    logger.error('Error creating OTP:', error);
    return {
      success: false,
      error: 'Failed to create OTP'
    };
  }
}

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  sendOTPToEmail,
  OTP_EXPIRY_MINUTES
};

