/**
 * Input Sanitization Utilities
 * Prevents XSS, SQL injection, and other injection attacks
 */

const logger = require('./logger');

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
function sanitizeHTML(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Decode HTML entities first to handle encoded attacks
  let sanitized = decodeHTMLEntities(input);

  // Remove script tags and their content (multiple passes for nested tags)
  for (let i = 0; i < 3; i++) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized.trim();
}

/**
 * Decode HTML entities
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHTMLEntities(text) {
  const entities = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#39;': "'",
    '&#47;': '/'
  };

  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
}

/**
 * Sanitize job description input
 * @param {string} jobDescription - Raw job description
 * @param {Object} options - Sanitization options
 * @returns {Object} { sanitized, warnings }
 */
function sanitizeJobDescription(jobDescription, options = {}) {
  const {
    maxLength = 50000,
    allowBasicFormatting = false
  } = options;

  const warnings = [];

  if (!jobDescription || typeof jobDescription !== 'string') {
    return { sanitized: '', warnings: ['Invalid job description'] };
  }

  // Check length
  if (jobDescription.length > maxLength) {
    warnings.push(`Job description truncated from ${jobDescription.length} to ${maxLength} characters`);
    jobDescription = jobDescription.slice(0, maxLength);
  }

  // Sanitize HTML
  let sanitized = allowBasicFormatting
    ? sanitizeBasicFormatting(jobDescription)
    : sanitizeHTML(jobDescription);

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(jobDescription)) {
      warnings.push('Suspicious content detected and removed');
      logger.warn('[SANITIZER] Suspicious pattern detected in job description', {
        pattern: pattern.toString()
      });
      break;
    }
  }

  return { sanitized, warnings };
}

/**
 * Sanitize but preserve basic formatting (bold, italic, lists)
 * @param {string} input - Raw input
 * @returns {string} Sanitized input with basic formatting
 */
function sanitizeBasicFormatting(input) {
  // Allow only safe tags: <b>, <i>, <u>, <br>, <p>, <ul>, <ol>, <li>
  const allowedTags = ['b', 'i', 'u', 'br', 'p', 'ul', 'ol', 'li', 'strong', 'em'];
  
  // Remove all tags except allowed ones
  let sanitized = input.replace(/<([^>]+)>/g, (match, tag) => {
    const tagName = tag.split(' ')[0].toLowerCase();
    if (allowedTags.includes(tagName) || allowedTags.includes(tagName.replace('/', ''))) {
      return match;
    }
    return '';
  });

  // Remove event handlers from allowed tags
  sanitized = sanitized.replace(/(<[^>]+)\s+on\w+\s*=\s*["'][^"']*["']([^>]*>)/gi, '$1$2');

  return sanitized;
}

/**
 * Sanitize user instructions
 * @param {string} instructions - Raw instructions
 * @returns {Object} { sanitized, warnings }
 */
function sanitizeInstructions(instructions, options = {}) {
  const { maxLength = 5000 } = options;

  const warnings = [];

  if (!instructions || typeof instructions !== 'string') {
    return { sanitized: '', warnings: [] };
  }

  // Check length
  if (instructions.length > maxLength) {
    warnings.push(`Instructions truncated from ${instructions.length} to ${maxLength} characters`);
    instructions = instructions.slice(0, maxLength);
  }

  // Sanitize HTML
  const sanitized = sanitizeHTML(instructions);

  return { sanitized, warnings };
}

/**
 * Validate and sanitize email
 * @param {string} email - Raw email
 * @returns {Object} { valid, sanitized, error }
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Invalid email' };
  }

  // Basic sanitization
  let sanitized = email.trim().toLowerCase();

  // Remove any HTML tags
  sanitized = sanitizeHTML(sanitized);

  // Email regex (basic validation)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid email format' };
  }

  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return { valid: false, sanitized, error: 'Invalid email format' };
  }

  return { valid: true, sanitized, error: null };
}

/**
 * Validate and sanitize URL
 * @param {string} url - Raw URL
 * @returns {Object} { valid, sanitized, error }
 */
function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'Invalid URL' };
  }

  // Basic sanitization
  let sanitized = url.trim();

  // Check for dangerous protocols BEFORE sanitizing HTML (which might remove them)
  const lowerURL = sanitized.toLowerCase();
  
  // Check for javascript: protocol
  if (lowerURL.startsWith('javascript:') || lowerURL.includes('javascript:')) {
    return { valid: false, sanitized: '', error: 'Invalid URL protocol' };
  }

  // Check for data: protocol
  if (lowerURL.startsWith('data:') || lowerURL.includes('data:')) {
    return { valid: false, sanitized: '', error: 'Invalid URL protocol' };
  }

  // Remove HTML tags
  sanitized = sanitizeHTML(sanitized);

  // Check for file: protocol
  if (sanitized.toLowerCase().startsWith('file:')) {
    return { valid: false, sanitized: '', error: 'Invalid URL protocol' };
  }

  // Only allow http and https
  if (!sanitized.match(/^https?:\/\//i)) {
    // Don't add https:// to invalid protocols
    if (sanitized.includes(':')) {
      return { valid: false, sanitized: '', error: 'Invalid URL protocol' };
    }
    sanitized = 'https://' + sanitized;
  }

  // URL validation
  try {
    const urlObj = new URL(sanitized);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, sanitized: '', error: 'Invalid URL protocol' };
    }

    return { valid: true, sanitized: urlObj.href, error: null };
  } catch (error) {
    return { valid: false, sanitized, error: 'Invalid URL format' };
  }
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {Object} { valid, error }
 */
function validateLength(str, min, max) {
  if (typeof str !== 'string') {
    return { valid: false, error: 'Invalid input type' };
  }

  if (str.length < min) {
    return { valid: false, error: `Input too short (minimum ${min} characters)` };
  }

  if (str.length > max) {
    return { valid: false, error: `Input too long (maximum ${max} characters)` };
  }

  return { valid: true, error: null };
}

/**
 * Check for SQL injection patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if suspicious
 */
function hasSQLInjectionPattern(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\bUNION\b\s+\bSELECT\b)/i, // More specific: UNION SELECT (with whitespace)
    /(\bSELECT\b\s+\*\s+\bFROM\b)/i, // More specific: SELECT * FROM
    /(\bINSERT\b\s+\bINTO\b)/i,
    /(\bDELETE\b\s+\bFROM\b)/i,
    /(\bDROP\b\s+\bTABLE\b)/i,
    /(\bUPDATE\b\s+\w+\s+\bSET\b)/i,
    /(--\s*$)/m, // SQL comment at end of line
    /(\#\s*$)/m, // MySQL comment
    /(\/\*.*\*\/)/,  // Block comment
    /(\bOR\b\s+['"][\w\d]+['"]\s*=\s*['"][\w\d]+['"])/i, // OR '1'='1' or OR 'a'='a'
    /(\bAND\b\s+['"][\w\d]+['"]\s*=\s*['"][\w\d]+['"])/i, // AND '1'='1'
    /(;\s*DROP)/i,
    /(;\s*DELETE)/i,
    /(\bEXEC\b\s*\(|\bEXECUTE\b\s*\()/i // EXEC( or EXECUTE(
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      logger.warn('[SANITIZER] SQL injection pattern detected', {
        pattern: pattern.toString(),
        input: input.slice(0, 100)
      });
      return true;
    }
  }

  return false;
}

/**
 * Sanitize request body
 * @param {Object} body - Request body
 * @param {Object} schema - Expected schema
 * @returns {Object} { sanitized, errors }
 */
function sanitizeRequestBody(body, schema = {}) {
  const errors = [];
  const sanitized = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = body[key];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip if not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${key} must be of type ${rules.type}`);
      continue;
    }

    // Sanitize based on type
    if (typeof value === 'string') {
      // Check length
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${key} must be at most ${rules.maxLength} characters`);
      }

      // Sanitize
      if (rules.sanitize !== false) {
        sanitized[key] = sanitizeHTML(value);
      } else {
        sanitized[key] = value;
      }

      // Check for SQL injection
      if (hasSQLInjectionPattern(value)) {
        errors.push(`${key} contains suspicious content`);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return { sanitized, errors };
}

module.exports = {
  sanitizeHTML,
  sanitizeJobDescription,
  sanitizeInstructions,
  sanitizeEmail,
  sanitizeURL,
  sanitizeObject,
  sanitizeBasicFormatting,
  validateLength,
  hasSQLInjectionPattern,
  sanitizeRequestBody
};
