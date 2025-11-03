/**
 * Validation Utilities
 * Common validation functions for API requests
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  // At least 8 characters
  if (password.length < 8) return false;
  return true;
}

/**
 * Validate required fields
 */
function validateRequired(fields, data) {
  if (!Array.isArray(fields) || !data) {
    return { isValid: false, missing: [] };
  }
  
  const missing = fields.filter(field => !data[field] || 
    (typeof data[field] === 'string' && data[field].trim().length === 0)
  );
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Validate string length
 */
function validateLength(label, value, min, max) {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: `${label} is required` };
  }
  if (min !== undefined && value.length < min) {
    return { isValid: false, message: `${label} must be at least ${min} characters` };
  }
  if (max !== undefined && value.length > max) {
    return { isValid: false, message: `${label} must be at most ${max} characters` };
  }
  return { isValid: true };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength
};

