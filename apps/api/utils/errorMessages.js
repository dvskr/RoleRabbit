/**
 * User-Friendly Error Messages
 * Maps technical errors to helpful, actionable messages for users
 */

const logger = require('./logger');

/**
 * Error message library with user-friendly messages and next steps
 */
const ERROR_MESSAGES = {
  // OpenAI / AI Service Errors
  AI_TIMEOUT: {
    code: 'AI_TIMEOUT',
    message: 'The AI service is taking longer than expected.',
    userMessage: 'Our AI service is taking longer than usual. Please try again in a few moments.',
    nextSteps: [
      'Wait a few seconds and try again',
      'If the issue persists, try with a shorter resume or job description',
      'Contact support if the problem continues'
    ],
    severity: 'warning'
  },
  
  AI_RATE_LIMIT: {
    code: 'AI_RATE_LIMIT',
    message: 'OpenAI rate limit exceeded.',
    userMessage: 'We\'re experiencing high demand right now. Please wait a moment and try again.',
    nextSteps: [
      'Wait 30-60 seconds before trying again',
      'Our system will automatically retry for you',
      'Consider upgrading to Pro for higher limits'
    ],
    severity: 'warning'
  },
  
  AI_INVALID_RESPONSE: {
    code: 'AI_INVALID_RESPONSE',
    message: 'AI returned invalid response format.',
    userMessage: 'We couldn\'t process the AI response. This is usually temporary.',
    nextSteps: [
      'Try again - this usually works on the second attempt',
      'If it fails again, try simplifying your input',
      'Contact support if the issue persists'
    ],
    severity: 'error'
  },
  
  AI_SERVICE_DOWN: {
    code: 'AI_SERVICE_DOWN',
    message: 'OpenAI service is unavailable.',
    userMessage: 'The AI service is temporarily unavailable. We\'re working to restore it.',
    nextSteps: [
      'Try again in 5-10 minutes',
      'Check our status page for updates',
      'Your data is safe and will be ready when service resumes'
    ],
    severity: 'error'
  },

  // File Upload Errors
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: 'File exceeds maximum size limit.',
    userMessage: 'Your file is too large. Maximum size is 10 MB.',
    nextSteps: [
      'Compress your PDF or reduce image quality',
      'Remove unnecessary pages or images',
      'Convert to a simpler format (e.g., plain PDF without images)'
    ],
    severity: 'warning'
  },
  
  FILE_INVALID_TYPE: {
    code: 'FILE_INVALID_TYPE',
    message: 'Invalid file type uploaded.',
    userMessage: 'This file type is not supported. Please upload a PDF or DOCX file.',
    nextSteps: [
      'Convert your resume to PDF or DOCX format',
      'Ensure the file extension matches the actual file type',
      'Try exporting from your word processor again'
    ],
    severity: 'warning'
  },
  
  FILE_CORRUPTED: {
    code: 'FILE_CORRUPTED',
    message: 'File is corrupted or unreadable.',
    userMessage: 'We couldn\'t read your file. It may be corrupted or password-protected.',
    nextSteps: [
      'Try opening the file on your computer to verify it works',
      'Re-export or re-save the file',
      'Remove any password protection',
      'Try a different file format (PDF or DOCX)'
    ],
    severity: 'error'
  },

  // Parsing Errors
  PARSE_FAILED: {
    code: 'PARSE_FAILED',
    message: 'Failed to parse resume.',
    userMessage: 'We couldn\'t extract information from your resume.',
    nextSteps: [
      'Ensure your resume has clear text (not just images)',
      'Try a simpler format with standard sections',
      'Upload a different version of your resume',
      'Contact support with your file for assistance'
    ],
    severity: 'error'
  },
  
  PARSE_NO_TEXT: {
    code: 'PARSE_NO_TEXT',
    message: 'No text found in resume.',
    userMessage: 'Your resume appears to be empty or contains only images.',
    nextSteps: [
      'Ensure your resume contains actual text, not just images',
      'Try converting images to text using OCR first',
      'Re-save your resume with text layers enabled',
      'Use a text-based format instead of scanned images'
    ],
    severity: 'error'
  },

  // Rate Limiting Errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'User rate limit exceeded.',
    userMessage: 'You\'ve reached your daily limit for this feature.',
    nextSteps: [
      'Try again tomorrow (limits reset at midnight UTC)',
      'Upgrade to Pro for higher limits',
      'Contact support if you need an exception'
    ],
    severity: 'warning',
    showUpgradeButton: true
  },

  // Authentication Errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'User not authenticated.',
    userMessage: 'Your session has expired. Please log in again.',
    nextSteps: [
      'Log in to continue',
      'Your work is saved and will be available after login'
    ],
    severity: 'warning',
    requiresAuth: true
  },
  
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'User does not have permission.',
    userMessage: 'You don\'t have permission to perform this action.',
    nextSteps: [
      'Upgrade your plan to access this feature',
      'Contact support if you believe this is an error'
    ],
    severity: 'warning',
    showUpgradeButton: true
  },

  // Database Errors
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Database operation failed.',
    userMessage: 'We\'re having trouble saving your data. Please try again.',
    nextSteps: [
      'Try again in a moment',
      'Check your internet connection',
      'Contact support if the issue persists'
    ],
    severity: 'error'
  },
  
  RESUME_NOT_FOUND: {
    code: 'RESUME_NOT_FOUND',
    message: 'Resume not found.',
    userMessage: 'We couldn\'t find that resume. It may have been deleted.',
    nextSteps: [
      'Check your resume list',
      'Try refreshing the page',
      'Contact support if you believe this is an error'
    ],
    severity: 'error'
  },

  // Validation Errors
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input provided.',
    userMessage: 'Some of the information you provided is invalid.',
    nextSteps: [
      'Check for special characters or formatting issues',
      'Ensure all required fields are filled',
      'Try simplifying your input'
    ],
    severity: 'warning'
  },
  
  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    message: 'Required field is missing.',
    userMessage: 'Please fill in all required fields.',
    nextSteps: [
      'Check for fields marked with *',
      'Ensure you\'ve provided all necessary information'
    ],
    severity: 'warning'
  },

  // Network Errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network request failed.',
    userMessage: 'We couldn\'t connect to our servers. Please check your internet connection.',
    nextSteps: [
      'Check your internet connection',
      'Try refreshing the page',
      'If on VPN, try disconnecting temporarily',
      'Contact support if the issue persists'
    ],
    severity: 'error'
  },

  // Generic Fallback
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    userMessage: 'Something went wrong. We\'ve been notified and are looking into it.',
    nextSteps: [
      'Try again in a moment',
      'Refresh the page if the issue persists',
      'Contact support with error code if problem continues'
    ],
    severity: 'error'
  }
};

/**
 * Get user-friendly error message
 * @param {string|Error} error - Error code or Error object
 * @param {Object} context - Additional context (e.g., field name, limit value)
 * @returns {Object} User-friendly error object
 */
function getUserFriendlyError(error, context = {}) {
  let errorCode = 'UNKNOWN_ERROR';
  let originalMessage = '';

  // Extract error code from various error types
  if (typeof error === 'string') {
    errorCode = error;
  } else if (error?.code) {
    errorCode = error.code;
  } else if (error?.message) {
    originalMessage = error.message;
    // Try to match common error patterns
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      errorCode = 'AI_TIMEOUT';
    } else if (error.message.includes('rate limit')) {
      errorCode = 'AI_RATE_LIMIT';
    } else if (error.message.includes('unauthorized') || error.message.includes('not authenticated')) {
      errorCode = 'UNAUTHORIZED';
    } else if (error.message.includes('forbidden') || error.message.includes('permission')) {
      errorCode = 'FORBIDDEN';
    } else if (error.message.includes('not found')) {
      errorCode = 'RESUME_NOT_FOUND';
    } else if (error.message.includes('invalid')) {
      errorCode = 'INVALID_INPUT';
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      errorCode = 'NETWORK_ERROR';
    }
  }

  // Get error template
  const errorTemplate = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;

  // Build user-friendly error object
  const userError = {
    code: errorCode,
    message: errorTemplate.userMessage,
    nextSteps: errorTemplate.nextSteps,
    severity: errorTemplate.severity,
    originalMessage: originalMessage || errorTemplate.message,
    timestamp: new Date().toISOString(),
    ...context
  };

  // Add optional flags
  if (errorTemplate.showUpgradeButton) {
    userError.showUpgradeButton = true;
  }
  if (errorTemplate.requiresAuth) {
    userError.requiresAuth = true;
  }

  // Log error for monitoring
  logger.error('[USER_ERROR] Mapped error for user', {
    errorCode,
    originalMessage,
    context
  });

  return userError;
}

/**
 * Format error for API response
 * @param {string|Error} error - Error code or Error object
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, context = {}) {
  const userError = getUserFriendlyError(error, context);
  
  return {
    success: false,
    error: userError.message,
    errorCode: userError.code,
    nextSteps: userError.nextSteps,
    severity: userError.severity,
    timestamp: userError.timestamp,
    ...(userError.showUpgradeButton && { showUpgradeButton: true }),
    ...(userError.requiresAuth && { requiresAuth: true }),
    ...context
  };
}

/**
 * Map HTTP status code to error code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error code
 */
function mapStatusCodeToError(statusCode) {
  const statusMap = {
    400: 'INVALID_INPUT',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'RESUME_NOT_FOUND',
    408: 'AI_TIMEOUT',
    413: 'FILE_TOO_LARGE',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'DATABASE_ERROR',
    502: 'AI_SERVICE_DOWN',
    503: 'AI_SERVICE_DOWN',
    504: 'AI_TIMEOUT'
  };

  return statusMap[statusCode] || 'UNKNOWN_ERROR';
}

module.exports = {
  ERROR_MESSAGES,
  getUserFriendlyError,
  formatErrorResponse,
  mapStatusCodeToError
};

