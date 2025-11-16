/**
 * BE-043: Share link token entropy check
 * BE-044: Hash share link passwords using bcrypt
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const logger = require('./logger');

const MIN_TOKEN_LENGTH = 32; // Minimum token length for sufficient entropy
const MIN_ENTROPY_BITS = 128; // Minimum entropy in bits

/**
 * Calculate entropy of a token
 * BE-043: Share link token entropy check
 */
function calculateEntropy(token) {
  if (!token || token.length === 0) {
    return 0;
  }

  // Count character frequency
  const charCounts = {};
  for (const char of token) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }

  // Calculate Shannon entropy
  let entropy = 0;
  const length = token.length;
  
  for (const count of Object.values(charCounts)) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }

  // Total entropy = entropy per character * length
  return entropy * length;
}

/**
 * Generate secure share link token
 * BE-043: Share link token entropy check
 */
function generateSecureToken(length = 32) {
  // Use crypto.randomBytes for cryptographically secure random tokens
  const bytes = crypto.randomBytes(length);
  return bytes.toString('hex');
}

/**
 * Validate token entropy
 * BE-043: Share link token entropy check
 */
function validateTokenEntropy(token) {
  if (!token || token.length < MIN_TOKEN_LENGTH) {
    return {
      valid: false,
      error: `Token must be at least ${MIN_TOKEN_LENGTH} characters long`
    };
  }

  const entropy = calculateEntropy(token);
  
  if (entropy < MIN_ENTROPY_BITS) {
    return {
      valid: false,
      error: `Token entropy (${entropy.toFixed(2)} bits) is below minimum (${MIN_ENTROPY_BITS} bits)`
    };
  }

  return {
    valid: true,
    entropy
  };
}

/**
 * Hash share link password
 * BE-044: Hash share link passwords using bcrypt
 */
async function hashShareLinkPassword(password) {
  if (!password) {
    return null;
  }

  try {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  } catch (error) {
    logger.error('Error hashing share link password:', error);
    throw error;
  }
}

/**
 * Verify share link password
 * BE-044: Hash share link passwords using bcrypt
 */
async function verifyShareLinkPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error verifying share link password:', error);
    return false;
  }
}

module.exports = {
  generateSecureToken,
  validateTokenEntropy,
  calculateEntropy,
  hashShareLinkPassword,
  verifyShareLinkPassword
};

