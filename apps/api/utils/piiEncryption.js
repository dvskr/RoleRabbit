/**
 * PII Encryption Utility
 * 
 * Handles encryption and decryption of Personally Identifiable Information (PII)
 * Uses AES-256-GCM encryption with key rotation support
 */

const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * In production, this should come from a secrets manager
 */
function getEncryptionKey() {
  const key = process.env.PII_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('PII_ENCRYPTION_KEY environment variable not set');
  }
  
  // Derive a proper 256-bit key from the environment variable
  return crypto.pbkdf2Sync(key, 'roleready-salt', 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt PII data
 * 
 * @param {string} plaintext - The data to encrypt
 * @param {number} version - Encryption version (for key rotation)
 * @returns {Object} - { encrypted: string, version: number }
 */
function encryptPII(plaintext, version = 1) {
  try {
    if (!plaintext) {
      return { encrypted: null, version };
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag
    ]);
    
    return {
      encrypted: combined.toString('base64'),
      version
    };
  } catch (error) {
    console.error('PII encryption error:', error);
    throw new Error('Failed to encrypt PII data');
  }
}

/**
 * Decrypt PII data
 * 
 * @param {string} encryptedData - The encrypted data (base64)
 * @param {number} version - Encryption version used
 * @returns {string} - Decrypted plaintext
 */
function decryptPII(encryptedData, version = 1) {
  try {
    if (!encryptedData) {
      return null;
    }

    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, encrypted data, and auth tag
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(-AUTH_TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH, -AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('PII decryption error:', error);
    throw new Error('Failed to decrypt PII data');
  }
}

/**
 * Encrypt PII fields in resume data
 * 
 * @param {Object} resumeData - Resume data object
 * @returns {Object} - { encrypted: Object, piiFields: string[] }
 */
function encryptResumeData(resumeData) {
  const piiFields = [];
  const encrypted = JSON.parse(JSON.stringify(resumeData)); // Deep clone
  
  // Encrypt contact information
  if (encrypted.contact) {
    if (encrypted.contact.name) {
      const result = encryptPII(encrypted.contact.name);
      encrypted.contact.name = result.encrypted;
      piiFields.push('contact.name');
    }
    
    if (encrypted.contact.email) {
      const result = encryptPII(encrypted.contact.email);
      encrypted.contact.email = result.encrypted;
      piiFields.push('contact.email');
    }
    
    if (encrypted.contact.phone) {
      const result = encryptPII(encrypted.contact.phone);
      encrypted.contact.phone = result.encrypted;
      piiFields.push('contact.phone');
    }
    
    if (encrypted.contact.location) {
      const result = encryptPII(encrypted.contact.location);
      encrypted.contact.location = result.encrypted;
      piiFields.push('contact.location');
    }
  }
  
  return { encrypted, piiFields };
}

/**
 * Decrypt PII fields in resume data
 * 
 * @param {Object} resumeData - Resume data with encrypted fields
 * @returns {Object} - Decrypted resume data
 */
function decryptResumeData(resumeData) {
  const decrypted = JSON.parse(JSON.stringify(resumeData)); // Deep clone
  
  // Decrypt contact information
  if (decrypted.contact) {
    if (decrypted.contact.name) {
      decrypted.contact.name = decryptPII(decrypted.contact.name);
    }
    
    if (decrypted.contact.email) {
      decrypted.contact.email = decryptPII(decrypted.contact.email);
    }
    
    if (decrypted.contact.phone) {
      decrypted.contact.phone = decryptPII(decrypted.contact.phone);
    }
    
    if (decrypted.contact.location) {
      decrypted.contact.location = decryptPII(decrypted.contact.location);
    }
  }
  
  return decrypted;
}

/**
 * Hash sensitive data for comparison (one-way)
 * 
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
function hashSensitiveData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Anonymize data for analytics
 * 
 * @param {Object} data - Data to anonymize
 * @returns {Object} - Anonymized data
 */
function anonymizeForAnalytics(data) {
  const anonymized = { ...data };
  
  // Hash user ID
  if (anonymized.userId) {
    anonymized.userId = hashSensitiveData(anonymized.userId);
  }
  
  // Remove PII fields
  const piiFields = ['name', 'email', 'phone', 'location', 'ipAddress', 'userAgent'];
  piiFields.forEach(field => {
    if (anonymized[field]) {
      delete anonymized[field];
    }
  });
  
  // Truncate IP address to /24 subnet
  if (data.ipAddress) {
    const parts = data.ipAddress.split('.');
    if (parts.length === 4) {
      anonymized.ipSubnet = `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  
  return anonymized;
}

/**
 * Redact PII from error logs
 * 
 * @param {string} message - Error message
 * @returns {string} - Redacted message
 */
function redactPII(message) {
  if (!message) return message;
  
  let redacted = message;
  
  // Redact email addresses
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Redact phone numbers (various formats)
  redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
  redacted = redacted.replace(/\b\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, '[PHONE]');
  
  // Redact potential names (capitalized words, 2-4 words)
  // Note: This is a simple heuristic and may have false positives
  redacted = redacted.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?( [A-Z][a-z]+)?\b/g, '[NAME]');
  
  // Redact IP addresses
  redacted = redacted.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
  
  return redacted;
}

module.exports = {
  encryptPII,
  decryptPII,
  encryptResumeData,
  decryptResumeData,
  hashSensitiveData,
  anonymizeForAnalytics,
  redactPII
};
