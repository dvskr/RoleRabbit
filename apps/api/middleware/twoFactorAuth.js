/**
 * Two-Factor Authentication (2FA) Middleware
 * 
 * Requires 2FA verification for sensitive operations:
 * - Delete account
 * - Export all resumes
 * - Change password
 * - Update email
 * 
 * Uses TOTP (Time-based One-Time Password) via authenticator apps.
 * 
 * Usage:
 *   router.post('/api/gdpr/delete-my-account', require2FA, handler);
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to require 2FA verification
 */
function require2FA(req, res, next) {
  return async (req, res, next) => {
    const userId = req.user?.userId;
    const twoFactorCode = req.headers['x-2fa-code'] || req.body.twoFactorCode;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    try {
      // Check if user has 2FA enabled
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
          twoFactorSecret: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      // If 2FA not enabled, allow operation
      if (!user.twoFactorEnabled) {
        return next();
      }

      // 2FA is enabled - require verification
      if (!twoFactorCode) {
        return res.status(403).json({
          success: false,
          error: 'Two-factor authentication required',
          code: '2FA_REQUIRED',
          details: {
            message: 'Please provide 2FA code in X-2FA-Code header or twoFactorCode field',
          },
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2, // Allow 2 time steps before/after (60 seconds tolerance)
      });

      if (!verified) {
        // Log failed attempt
        await prisma.auditLog.create({
          data: {
            userId,
            action: '2FA_FAILED',
            resourceType: 'USER',
            resourceId: userId,
            ipAddress: req.ip,
            metadata: {
              timestamp: new Date().toISOString(),
              path: req.path,
            },
          },
        });

        return res.status(403).json({
          success: false,
          error: 'Invalid 2FA code',
          code: '2FA_INVALID',
        });
      }

      // Log successful 2FA
      await prisma.auditLog.create({
        data: {
          userId,
          action: '2FA_SUCCESS',
          resourceType: 'USER',
          resourceId: userId,
          ipAddress: req.ip,
          metadata: {
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        },
      });

      next();
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA',
        code: '2FA_ERROR',
      });
    }
  };
}

/**
 * Enable 2FA for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} 2FA setup data (secret, QR code)
 */
async function enable2FA(userId) {
  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `RoleReady (${userId})`,
      issuer: 'RoleReady',
    });

    // Update user with secret (but don't enable yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false, // Enable after verification
      },
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: generateBackupCodes(),
    };
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    throw error;
  }
}

/**
 * Verify and activate 2FA
 * @param {string} userId - User ID
 * @param {string} code - 2FA code to verify
 * @returns {Promise<boolean>} True if verified and activated
 */
async function verify2FASetup(userId, code) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not initialized');
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (verified) {
      // Activate 2FA
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });

      // Log activation
      await prisma.auditLog.create({
        data: {
          userId,
          action: '2FA_ENABLED',
          resourceType: 'USER',
          resourceId: userId,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to verify 2FA setup:', error);
    throw error;
  }
}

/**
 * Disable 2FA for a user
 * @param {string} userId - User ID
 * @param {string} code - 2FA code to verify before disabling
 * @returns {Promise<boolean>} True if disabled
 */
async function disable2FA(userId, code) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new Error('2FA not enabled');
    }

    // Verify code before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      throw new Error('Invalid 2FA code');
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Log deactivation
    await prisma.auditLog.create({
      data: {
        userId,
        action: '2FA_DISABLED',
        resourceType: 'USER',
        resourceId: userId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    throw error;
  }
}

/**
 * Generate backup codes for 2FA
 * @returns {Array<string>} Array of backup codes
 */
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

module.exports = {
  require2FA,
  enable2FA,
  verify2FASetup,
  disable2FA,
  generateBackupCodes,
};

