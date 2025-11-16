/**
 * Data Anonymization Utility
 * 
 * Anonymizes PII in analytics events and error logs
 * to comply with privacy regulations.
 * 
 * Anonymization strategies:
 * - Hash user IDs (SHA-256)
 * - Remove email addresses
 * - Remove phone numbers
 * - Remove IP addresses (keep country only)
 * - Redact names
 * 
 * Usage:
 *   const anonymized = anonymizeForAnalytics(userData);
 *   const sanitized = sanitizeErrorLog(error, context);
 */

const crypto = require('crypto');

/**
 * Hash a value using SHA-256
 * @param {string} value - Value to hash
 * @returns {string} Hashed value
 */
function hashValue(value) {
  if (!value) return null;
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Anonymize user ID for analytics
 * @param {string} userId - User ID
 * @returns {string} Hashed user ID
 */
function anonymizeUserId(userId) {
  return hashValue(userId);
}

/**
 * Extract country from IP address (mock implementation)
 * In production, use a GeoIP service
 * @param {string} ipAddress - IP address
 * @returns {string} Country code
 */
function extractCountry(ipAddress) {
  // Mock implementation - in production, use MaxMind GeoIP or similar
  if (!ipAddress) return 'UNKNOWN';
  
  // For demo purposes, return a placeholder
  return 'US'; // Replace with actual GeoIP lookup
}

/**
 * Redact email addresses from text
 * @param {string} text - Text containing email
 * @returns {string} Text with redacted emails
 */
function redactEmail(text) {
  if (!text) return text;
  return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
}

/**
 * Redact phone numbers from text
 * @param {string} text - Text containing phone
 * @returns {string} Text with redacted phones
 */
function redactPhone(text) {
  if (!text) return text;
  return text.replace(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g, '[PHONE_REDACTED]');
}

/**
 * Redact names from text (simple implementation)
 * @param {string} text - Text containing names
 * @returns {string} Text with redacted names
 */
function redactNames(text) {
  if (!text) return text;
  
  // This is a simple implementation - in production, use NER (Named Entity Recognition)
  const commonNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'];
  let redacted = text;
  
  commonNames.forEach(name => {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    redacted = redacted.replace(regex, '[NAME_REDACTED]');
  });
  
  return redacted;
}

/**
 * Anonymize data for analytics
 * @param {object} data - Data to anonymize
 * @returns {object} Anonymized data
 */
function anonymizeForAnalytics(data) {
  const anonymized = { ...data };

  // Hash user ID
  if (anonymized.userId) {
    anonymized.userId = anonymizeUserId(anonymized.userId);
  }

  // Remove email
  if (anonymized.email) {
    delete anonymized.email;
  }

  // Remove phone
  if (anonymized.phone) {
    delete anonymized.phone;
  }

  // Anonymize IP address (keep country only)
  if (anonymized.ipAddress) {
    anonymized.country = extractCountry(anonymized.ipAddress);
    delete anonymized.ipAddress;
  }

  // Remove name
  if (anonymized.name) {
    delete anonymized.name;
  }

  // Recursively anonymize nested objects
  Object.keys(anonymized).forEach(key => {
    if (typeof anonymized[key] === 'object' && anonymized[key] !== null) {
      anonymized[key] = anonymizeForAnalytics(anonymized[key]);
    }
  });

  return anonymized;
}

/**
 * Sanitize error log (remove PII)
 * @param {Error} error - Error object
 * @param {object} context - Error context
 * @returns {object} Sanitized error log
 */
function sanitizeErrorLog(error, context = {}) {
  let message = error.message || '';
  let stack = error.stack || '';

  // Redact PII from message and stack
  message = redactEmail(message);
  message = redactPhone(message);
  message = redactNames(message);

  stack = redactEmail(stack);
  stack = redactPhone(stack);
  stack = redactNames(stack);

  // Sanitize context
  const sanitizedContext = { ...context };

  // Hash user ID
  if (sanitizedContext.userId) {
    sanitizedContext.userId = anonymizeUserId(sanitizedContext.userId);
  }

  // Remove sensitive fields
  delete sanitizedContext.email;
  delete sanitizedContext.phone;
  delete sanitizedContext.name;
  delete sanitizedContext.password;
  delete sanitizedContext.token;
  delete sanitizedContext.apiKey;

  // Anonymize IP
  if (sanitizedContext.ipAddress) {
    sanitizedContext.country = extractCountry(sanitizedContext.ipAddress);
    delete sanitizedContext.ipAddress;
  }

  return {
    name: error.name,
    message,
    stack,
    context: sanitizedContext,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Anonymize resume data for analytics
 * @param {object} resumeData - Resume data
 * @returns {object} Anonymized resume data
 */
function anonymizeResumeForAnalytics(resumeData) {
  if (!resumeData) return null;

  const anonymized = JSON.parse(JSON.stringify(resumeData)); // Deep clone

  // Remove contact info
  if (anonymized.contact) {
    delete anonymized.contact.name;
    delete anonymized.contact.email;
    delete anonymized.contact.phone;
    delete anonymized.contact.address;
    
    // Keep only link types (not URLs)
    if (anonymized.contact.links) {
      anonymized.contact.links = anonymized.contact.links.map(link => ({
        type: link.type,
      }));
    }
  }

  // Remove company names from experience
  if (anonymized.experience) {
    anonymized.experience = anonymized.experience.map(exp => ({
      ...exp,
      company: '[REDACTED]',
      bullets: exp.bullets?.map(() => '[REDACTED]'),
    }));
  }

  // Remove school names from education
  if (anonymized.education) {
    anonymized.education = anonymized.education.map(edu => ({
      ...edu,
      school: '[REDACTED]',
    }));
  }

  // Redact summary
  if (anonymized.summary) {
    anonymized.summary = '[REDACTED]';
  }

  return anonymized;
}

/**
 * Check if data contains PII
 * @param {any} data - Data to check
 * @returns {boolean} True if PII detected
 */
function containsPII(data) {
  if (!data) return false;

  const dataString = JSON.stringify(data);

  // Check for email pattern
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(dataString)) {
    return true;
  }

  // Check for phone pattern
  if (/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(dataString)) {
    return true;
  }

  // Check for common PII field names
  const piiFields = ['email', 'phone', 'ssn', 'password', 'creditCard'];
  const hasFieldNames = piiFields.some(field => dataString.toLowerCase().includes(field));

  return hasFieldNames;
}

module.exports = {
  hashValue,
  anonymizeUserId,
  extractCountry,
  redactEmail,
  redactPhone,
  redactNames,
  anonymizeForAnalytics,
  sanitizeErrorLog,
  anonymizeResumeForAnalytics,
  containsPII,
};

