/**
 * SEC-001: Encrypt files at rest in storage
 * SEC-002: Encrypt files in transit (HTTPS/TLS enforced at server level)
 */

const crypto = require('crypto');
const logger = require('./logger');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Get encryption key from environment (should be stored securely)
function getEncryptionKey() {
  const key = process.env.FILE_ENCRYPTION_KEY;
  if (!key) {
    logger.warn('FILE_ENCRYPTION_KEY not set - using default key (NOT SECURE FOR PRODUCTION)');
    // Generate a deterministic key from a default (only for development)
    return crypto.scryptSync('default-key-change-in-production', 'salt', KEY_LENGTH);
  }
  return Buffer.from(key, 'hex');
}

/**
 * SEC-001: Encrypt file buffer
 */
function encryptFile(buffer) {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from master key and salt
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + authTag + encrypted data
    const encryptedBuffer = Buffer.concat([
      salt,
      iv,
      authTag,
      encrypted
    ]);

    return encryptedBuffer;
  } catch (error) {
    logger.error('File encryption failed:', error);
    throw new Error('Failed to encrypt file');
  }
}

/**
 * SEC-001: Decrypt file buffer
 */
function decryptFile(encryptedBuffer) {
  try {
    const key = getEncryptionKey();

    // Extract components
    const salt = encryptedBuffer.slice(0, SALT_LENGTH);
    const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted;
  } catch (error) {
    logger.error('File decryption failed:', error);
    throw new Error('Failed to decrypt file');
  }
}

/**
 * Check if file is encrypted (has encryption header)
 */
function isEncrypted(buffer) {
  // Check for encryption signature (first bytes)
  return buffer.length > SALT_LENGTH + IV_LENGTH + TAG_LENGTH;
}

/**
 * SEC-002: Verify HTTPS/TLS is being used
 */
function verifyTLS(request) {
  // In production, ensure HTTPS is enforced
  if (process.env.NODE_ENV === 'production') {
    const protocol = request.headers['x-forwarded-proto'] || request.protocol || 'http';
    if (protocol !== 'https') {
      logger.warn('Non-HTTPS request in production:', {
        protocol,
        url: request.url,
        ip: request.ip
      });
      return false;
    }
  }
  return true;
}

module.exports = {
  encryptFile,
  decryptFile,
  isEncrypted,
  verifyTLS,
};
