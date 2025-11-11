/**
 * Request Sanitization Utilities
 * Sanitizes user input to prevent XSS, injection attacks, and malformed data
 */

/**
 * Sanitize string input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize URL
 */
function sanitizeURL(url) {
  if (typeof url !== 'string') return url;
  
  // Remove dangerous protocols
  const dangerous = ['javascript:', 'data:', 'vbscript:', 'onload=', 'onerror='];
  let sanitized = url.toLowerCase();
  
  for (const danger of dangerous) {
    sanitized = sanitized.replace(danger, '');
  }
  
  return sanitized;
}

/**
 * Sanitize email address
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[<>'"%;()&+]/g, '') // Remove dangerous characters
    .substring(0, 254); // Email max length
}

/**
 * Sanitize SQL-like input
 */
function sanitizeSQL(input) {
  if (typeof input !== 'string') return input;
  
  // Remove SQL injection patterns
  return input
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '');
}

/**
 * Sanitize HTML
 */
function sanitizeHTML(html) {
  if (typeof html !== 'string') return html;
  
  // Remove all HTML tags, keeping only content
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[#\w]+;/g, entity => {
      const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
      };
      return entities[entity.toLowerCase()] || entity;
    });
}

/**
 * Sanitize file name
 */
function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string') return fileName;
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 255); // Max filename length
}

/**
 * Sanitize path
 */
function sanitizePath(path) {
  if (typeof path !== 'string') return path;
  
  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/^\//g, '') // Remove leading slash
    .replace(/[^a-zA-Z0-9._/-]/g, '') // Remove special characters
    .substring(0, 1000); // Max path length
}

/**
 * Validate and sanitize JSON
 */
function sanitizeJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch (error) {
    return jsonString; // Return as-is if not valid JSON
  }
}

/**
 * Create sanitization middleware
 */
function sanitizationMiddleware() {
  return async (request, _reply) => {
    // Sanitize request body
    if (request.body) {
      request.body = sanitizeObject(request.body);
    }
    
    // Sanitize query parameters
    if (request.query) {
      request.query = sanitizeObject(request.query);
    }
    
    // Sanitize URL parameters
    if (request.params) {
      request.params = sanitizeObject(request.params);
    }
  };
}

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeURL,
  sanitizeEmail,
  sanitizeSQL,
  sanitizeHTML,
  sanitizeFileName,
  sanitizePath,
  sanitizeJSON,
  sanitizationMiddleware
};

