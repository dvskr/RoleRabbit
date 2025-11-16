/**
 * Safe Logging Utility
 * 
 * Ensures PII and secrets are never logged.
 * 
 * Rules:
 * - Never log: Full resume data, email, phone, passwords, API keys, tokens
 * - Mask email: j***n@example.com
 * - Log only: Resume ID, user ID, action
 * 
 * Usage:
 *   const { safeLog, maskEmail, sanitizeForLogging } = require('./utils/safeLogging');
 *   safeLog('info', 'User action', { userId, action });
 */

const winston = require('winston');

// Simple PII redaction function (standalone, no dependencies)
function redactPII(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Redact email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  
  // Redact phone numbers (various formats)
  text = text.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');
  
  // Redact SSN
  text = text.replace(/\d{3}-\d{2}-\d{4}/g, '[SSN_REDACTED]');
  
  // Redact credit card numbers
  text = text.replace(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, '[CC_REDACTED]');
  
  return text;
}

// Sensitive field names to remove
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'sessionId',
  'creditCard',
  'ssn',
  'data', // Resume data
  'resumeData',
  'fullData'
];

// PII field names to mask
const PII_FIELDS = [
  'email',
  'phone',
  'phoneNumber',
  'address',
  'name',
  'fullName',
  'firstName',
  'lastName'
];

/**
 * Mask email address
 * @param {string} email - Email address
 * @returns {string} Masked email (j***n@example.com)
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') {
    return email;
  }
  
  const [username, domain] = email.split('@');
  
  if (!username || !domain) {
    return '[INVALID_EMAIL]';
  }
  
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  
  return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
}

/**
 * Mask phone number
 * @param {string} phone - Phone number
 * @returns {string} Masked phone (***-***-1234)
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }
  
  // Keep last 4 digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) {
    return '***';
  }
  
  return `***-***-${digits.slice(-4)}`;
}

/**
 * Mask sensitive string (API keys, tokens)
 * @param {string} value - Sensitive value
 * @returns {string} Masked value
 */
function maskSensitive(value) {
  if (!value || typeof value !== 'string') {
    return value;
  }
  
  if (value.length <= 8) {
    return '***';
  }
  
  // Show first 4 and last 4 characters
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

/**
 * Sanitize object for logging
 * @param {any} obj - Object to sanitize
 * @param {number} depth - Current recursion depth
 * @returns {any} Sanitized object
 */
function sanitizeForLogging(obj, depth = 0) {
  // Prevent infinite recursion
  if (depth > 5) {
    return '[MAX_DEPTH_REACHED]';
  }
  
  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle primitives
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item, depth + 1));
  }
  
  // Handle objects
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Remove sensitive fields entirely
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Mask PII fields
    if (PII_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      if (lowerKey.includes('email')) {
        sanitized[key] = maskEmail(value);
      } else if (lowerKey.includes('phone')) {
        sanitized[key] = maskPhone(value);
      } else {
        sanitized[key] = '[PII_MASKED]';
      }
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Create safe logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'roleready-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs to file
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

/**
 * Safe log function
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} meta - Metadata to log
 */
function safeLog(level, message, meta = {}) {
  // Sanitize metadata
  const sanitizedMeta = sanitizeForLogging(meta);
  
  // Redact PII from message
  const sanitizedMessage = redactPII(message);
  
  logger.log(level, sanitizedMessage, sanitizedMeta);
}

/**
 * Log user action safely
 * @param {Object} params - Log parameters
 * @param {string} params.userId - User ID
 * @param {string} params.action - Action performed
 * @param {string} params.resourceType - Resource type
 * @param {string} params.resourceId - Resource ID
 * @param {Object} params.metadata - Additional metadata
 */
function logUserAction({ userId, action, resourceType, resourceId, metadata = {} }) {
  safeLog('info', 'User action', {
    userId,
    action,
    resourceType,
    resourceId,
    metadata: sanitizeForLogging(metadata),
    timestamp: new Date().toISOString()
  });
}

/**
 * Log API request safely
 * @param {Object} req - Express request
 */
function logAPIRequest(req) {
  const sanitizedBody = sanitizeForLogging(req.body);
  const sanitizedQuery = sanitizeForLogging(req.query);
  const sanitizedHeaders = sanitizeForLogging(req.headers);
  
  safeLog('info', 'API request', {
    method: req.method,
    path: req.path,
    userId: req.user?.userId,
    body: sanitizedBody,
    query: sanitizedQuery,
    headers: {
      'user-agent': sanitizedHeaders['user-agent'],
      'content-type': sanitizedHeaders['content-type']
      // Explicitly exclude authorization header
    },
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log error safely
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
function logError(error, context = {}) {
  const sanitizedContext = sanitizeForLogging(context);
  
  // Redact PII from error message and stack
  const sanitizedMessage = redactPII(error.message || '');
  const sanitizedStack = redactPII(error.stack || '');
  
  safeLog('error', sanitizedMessage, {
    error: {
      name: error.name,
      message: sanitizedMessage,
      stack: sanitizedStack
    },
    context: sanitizedContext,
    timestamp: new Date().toISOString()
  });
}

/**
 * Middleware to log API requests safely
 * @returns {Function} Express middleware
 */
function requestLoggingMiddleware() {
  return (req, res, next) => {
    // Log request
    logAPIRequest(req);
    
    // Capture response
    const originalSend = res.send;
    res.send = function(data) {
      // Log response (sanitized)
      if (res.statusCode >= 400) {
        safeLog('warn', 'API error response', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          userId: req.user?.userId,
          timestamp: new Date().toISOString()
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Check if accidentally logged secrets
 * @param {string} logMessage - Log message to check
 * @returns {Array} List of potential secrets found
 */
function detectSecrets(logMessage) {
  const secrets = [];
  
  // Check for API key patterns
  if (/sk-[a-zA-Z0-9]{32,}/.test(logMessage)) {
    secrets.push({ type: 'openai_api_key', pattern: 'sk-...' });
  }
  
  // Check for JWT tokens
  if (/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(logMessage)) {
    secrets.push({ type: 'jwt_token', pattern: 'eyJ...' });
  }
  
  // Check for AWS keys
  if (/AKIA[0-9A-Z]{16}/.test(logMessage)) {
    secrets.push({ type: 'aws_access_key', pattern: 'AKIA...' });
  }
  
  // Check for generic API keys
  if (/api[_-]?key["\s:=]+[a-zA-Z0-9]{20,}/.test(logMessage)) {
    secrets.push({ type: 'generic_api_key', pattern: 'api_key=...' });
  }
  
  return secrets;
}

/**
 * Scan logs for accidentally logged secrets
 * @param {string} logFilePath - Path to log file
 * @returns {Promise<Array>} List of potential secret leaks
 */
async function scanLogsForSecrets(logFilePath) {
  const fs = require('fs').promises;
  const readline = require('readline');
  const fileStream = require('fs').createReadStream(logFilePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  const findings = [];
  let lineNumber = 0;
  
  for await (const line of rl) {
    lineNumber++;
    const secrets = detectSecrets(line);
    
    if (secrets.length > 0) {
      findings.push({
        lineNumber,
        secrets,
        line: line.substring(0, 100) + '...' // Truncate for safety
      });
    }
  }
  
  return findings;
}

module.exports = {
  maskEmail,
  maskPhone,
  maskSensitive,
  sanitizeForLogging,
  safeLog,
  logUserAction,
  logAPIRequest,
  logError,
  requestLoggingMiddleware,
  detectSecrets,
  scanLogsForSecrets,
  logger
};

