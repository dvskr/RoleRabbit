/**
 * Two-Factor Authentication (2FA) Utility
 * 
 * Implements TOTP-based 2FA for sensitive operations
 * Uses speakeasy for TOTP generation and qrcode for QR code generation
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generate 2FA secret for user
 * 
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @returns {Object} - { secret, qrCodeUrl, backupCodes }
 */
async function generate2FASecret(userId, userEmail) {
  try {
    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `RoleReady (${userEmail})`,
      issuer: 'RoleReady',
      length: 32
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    
    // Encrypt secret and backup codes
    const encryptedSecret = encryptSecret(secret.base32);
    const encryptedBackupCodes = backupCodes.map(code => encryptSecret(code));
    
    // Store in database (not enabled yet)
    const twoFactorId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO two_factor_auth (
        id, user_id, secret, backup_codes, is_enabled, created_at, updated_at
      ) VALUES (
        ${twoFactorId},
        ${userId},
        ${encryptedSecret},
        ${encryptedBackupCodes}::text[],
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE
      SET secret = ${encryptedSecret},
          backup_codes = ${encryptedBackupCodes}::text[],
          is_enabled = false,
          updated_at = NOW()
    `;
    
    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  } catch (error) {
    console.error('Failed to generate 2FA secret:', error);
    throw new Error('Failed to generate 2FA secret');
  }
}

/**
 * Verify 2FA token
 * 
 * @param {string} userId - User ID
 * @param {string} token - 6-digit token
 * @returns {boolean} - Whether token is valid
 */
async function verify2FAToken(userId, token) {
  try {
    // Get user's 2FA secret
    const twoFactor = await prisma.$queryRawUnsafe(`
      SELECT * FROM two_factor_auth
      WHERE user_id = '${userId}' AND is_enabled = true
      LIMIT 1
    `);
    
    if (!twoFactor || twoFactor.length === 0) {
      return false;
    }
    
    const encryptedSecret = twoFactor[0].secret;
    const secret = decryptSecret(encryptedSecret);
    
    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps before/after (60 seconds)
    });
    
    // Log attempt
    await log2FAAttempt(userId, verified, null);
    
    return verified;
  } catch (error) {
    console.error('Failed to verify 2FA token:', error);
    return false;
  }
}

/**
 * Verify backup code
 * 
 * @param {string} userId - User ID
 * @param {string} backupCode - Backup code
 * @returns {boolean} - Whether backup code is valid
 */
async function verifyBackupCode(userId, backupCode) {
  try {
    // Get user's backup codes
    const twoFactor = await prisma.$queryRawUnsafe(`
      SELECT * FROM two_factor_auth
      WHERE user_id = '${userId}' AND is_enabled = true
      LIMIT 1
    `);
    
    if (!twoFactor || twoFactor.length === 0) {
      return false;
    }
    
    const encryptedBackupCodes = twoFactor[0].backup_codes;
    
    // Check if backup code matches any stored code
    for (let i = 0; i < encryptedBackupCodes.length; i++) {
      const storedCode = decryptSecret(encryptedBackupCodes[i]);
      
      if (storedCode === backupCode) {
        // Remove used backup code
        encryptedBackupCodes.splice(i, 1);
        
        await prisma.$executeRawUnsafe(`
          UPDATE two_factor_auth
          SET backup_codes = ARRAY[${encryptedBackupCodes.map(c => `'${c}'`).join(',')}]::text[],
              updated_at = NOW()
          WHERE user_id = '${userId}'
        `);
        
        // Log attempt
        await log2FAAttempt(userId, true, 'backup_code');
        
        return true;
      }
    }
    
    // Log failed attempt
    await log2FAAttempt(userId, false, 'backup_code');
    
    return false;
  } catch (error) {
    console.error('Failed to verify backup code:', error);
    return false;
  }
}

/**
 * Enable 2FA for user
 * 
 * @param {string} userId - User ID
 * @param {string} token - Verification token
 * @returns {boolean} - Success
 */
async function enable2FA(userId, token) {
  try {
    // Verify token first
    const twoFactor = await prisma.$queryRawUnsafe(`
      SELECT * FROM two_factor_auth
      WHERE user_id = '${userId}'
      LIMIT 1
    `);
    
    if (!twoFactor || twoFactor.length === 0) {
      throw new Error('2FA not set up');
    }
    
    const encryptedSecret = twoFactor[0].secret;
    const secret = decryptSecret(encryptedSecret);
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
    
    if (!verified) {
      throw new Error('Invalid token');
    }
    
    // Enable 2FA
    await prisma.$executeRawUnsafe(`
      UPDATE two_factor_auth
      SET is_enabled = true,
          enabled_at = NOW(),
          updated_at = NOW()
      WHERE user_id = '${userId}'
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    throw error;
  }
}

/**
 * Disable 2FA for user
 * 
 * @param {string} userId - User ID
 * @param {string} token - Verification token
 * @returns {boolean} - Success
 */
async function disable2FA(userId, token) {
  try {
    // Verify token first
    const verified = await verify2FAToken(userId, token);
    
    if (!verified) {
      throw new Error('Invalid token');
    }
    
    // Disable 2FA
    await prisma.$executeRawUnsafe(`
      UPDATE two_factor_auth
      SET is_enabled = false,
          updated_at = NOW()
      WHERE user_id = '${userId}'
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    throw error;
  }
}

/**
 * Check if user has 2FA enabled
 * 
 * @param {string} userId - User ID
 * @returns {boolean} - Whether 2FA is enabled
 */
async function is2FAEnabled(userId) {
  try {
    const twoFactor = await prisma.$queryRawUnsafe(`
      SELECT is_enabled FROM two_factor_auth
      WHERE user_id = '${userId}'
      LIMIT 1
    `);
    
    return twoFactor && twoFactor.length > 0 && twoFactor[0].is_enabled;
  } catch (error) {
    console.error('Failed to check 2FA status:', error);
    return false;
  }
}

/**
 * Middleware to require 2FA for sensitive operations
 * 
 * @returns {Function} - Express middleware
 */
function require2FA() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const token = req.headers['x-2fa-token'] || req.body.twoFactorToken;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }
      
      // Check if user has 2FA enabled
      const enabled = await is2FAEnabled(userId);
      
      if (!enabled) {
        // 2FA not enabled, allow operation
        return next();
      }
      
      // 2FA enabled, require token
      if (!token) {
        return res.status(403).json({
          success: false,
          error: '2FA token required',
          code: '2FA_REQUIRED'
        });
      }
      
      // Verify token
      const verified = await verify2FAToken(userId, token);
      
      if (!verified) {
        // Try backup code
        const backupVerified = await verifyBackupCode(userId, token);
        
        if (!backupVerified) {
          return res.status(403).json({
            success: false,
            error: 'Invalid 2FA token',
            code: '2FA_INVALID'
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('2FA middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA'
      });
    }
  };
}

/**
 * Generate backup codes
 * 
 * @param {number} count - Number of codes to generate
 * @returns {Array} - Backup codes
 */
function generateBackupCodes(count = 8) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Encrypt secret
 * 
 * @param {string} secret - Secret to encrypt
 * @returns {string} - Encrypted secret
 */
function encryptSecret(secret) {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
  
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt secret
 * 
 * @param {string} encryptedSecret - Encrypted secret
 * @returns {string} - Decrypted secret
 */
function decryptSecret(encryptedSecret) {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';
  const parts = encryptedSecret.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Log 2FA attempt
 * 
 * @param {string} userId - User ID
 * @param {boolean} success - Whether attempt was successful
 * @param {string} method - Method used ('totp' or 'backup_code')
 */
async function log2FAAttempt(userId, success, method = 'totp') {
  try {
    await prisma.$executeRaw`
      INSERT INTO two_factor_attempts (
        id, user_id, success, attempted_at
      ) VALUES (
        ${uuidv4()},
        ${userId},
        ${success},
        NOW()
      )
    `;
    
    // Update last_used_at if successful
    if (success) {
      await prisma.$executeRawUnsafe(`
        UPDATE two_factor_auth
        SET last_used_at = NOW()
        WHERE user_id = '${userId}'
      `);
    }
  } catch (error) {
    console.error('Failed to log 2FA attempt:', error);
  }
}

module.exports = {
  generate2FASecret,
  verify2FAToken,
  verifyBackupCode,
  enable2FA,
  disable2FA,
  is2FAEnabled,
  require2FA
};
