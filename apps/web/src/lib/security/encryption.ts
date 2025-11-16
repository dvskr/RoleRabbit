/**
 * Field-Level Encryption - Section 6.2
 *
 * Provides encryption for sensitive data like password-protected share links
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 12;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Hash password using bcrypt
 * Used for password-protected share links
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 16): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  const randomValues = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

/**
 * Generate secure random token
 * Used for share links, reset tokens, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt sensitive data
 * Returns base64-encoded encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string, encryptionKey: string): string {
  const key = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest();

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted data + auth tag
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, 'hex'),
    authTag,
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string, encryptionKey: string): string {
  const key = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest();

  const combined = Buffer.from(ciphertext, 'base64');

  const iv = combined.slice(0, IV_LENGTH);
  const authTag = combined.slice(-AUTH_TAG_LENGTH);
  const encrypted = combined.slice(IV_LENGTH, -AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Get encryption key from environment
 */
export function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  return key;
}

/**
 * Hash data for anonymization
 * One-way hash for privacy (e.g., IP addresses, user agents)
 */
export function hashForPrivacy(data: string, salt?: string): string {
  const hashSalt = salt || process.env.PRIVACY_HASH_SALT || 'default-salt';

  return crypto
    .createHash('sha256')
    .update(data + hashSalt)
    .digest('hex');
}

/**
 * Anonymize IP address
 * Hashes IP for privacy compliance
 */
export function anonymizeIp(ipAddress: string): string {
  return hashForPrivacy(ipAddress);
}

/**
 * Anonymize user agent
 */
export function anonymizeUserAgent(userAgent: string): string {
  return hashForPrivacy(userAgent);
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  const prefix = 'rr'; // RoleRabbit prefix
  const key = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${key}`;
}

/**
 * Hash API key for storage
 * Store only hashes, not raw keys
 */
export function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '***';
  }

  return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}
