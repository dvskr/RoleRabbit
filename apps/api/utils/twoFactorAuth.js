/**
 * Two-Factor Authentication (2FA) Utility
 * Implements TOTP-based 2FA using RFC 6238
 */

const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Generate a secret for a user
 */
function generateSecret(username) {
  return speakeasy.generateSecret({
    name: `RoleReady (${username})`,
    issuer: 'RoleReady'
  });
}

/**
 * Verify a 2FA token
 */
function verifyToken(token, secret) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow tokens 1 minute before/after
  });
}

/**
 * Generate a QR code URL for secret
 */
async function generateQRCode(secret) {
  try {
    return await qrcode.toDataURL(secret);
  } catch (error) {
    logger.error('Failed to generate QR code', error);
    throw error;
  }
}

/**
 * Enable 2FA for a user
 */
async function enable2FA(userId, secret, backupCodes) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes)
      }
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to enable 2FA', error);
    throw error;
  }
}

/**
 * Disable 2FA for a user
 */
async function disable2FA(userId) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to disable 2FA', error);
    throw error;
  }
}

/**
 * Generate backup codes
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Verify backup code
 */
async function verifyBackupCode(userId, code) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.twoFactorBackupCodes) {
      return false;
    }

    const backupCodes = JSON.parse(user.twoFactorBackupCodes);
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: JSON.stringify(backupCodes)
      }
    });

    return true;
  } catch (error) {
    logger.error('Failed to verify backup code', error);
    return false;
  }
}

module.exports = {
  generateSecret,
  verifyToken,
  generateQRCode,
  enable2FA,
  disable2FA,
  generateBackupCodes,
  verifyBackupCode
};

