/**
 * Comprehensive Error Handling System
 * Provides graceful error recovery, user-friendly messages, and monitoring
 */

const logger = require('./logger');
const { getUserFriendlyError, formatErrorResponse } = require('./errorMessages');

/**
 * Error categories for classification
 */
const ErrorCategory = {
  VALIDATION: 'VALIDATION',
  AI_SERVICE: 'AI_SERVICE',
  DATABASE: 'DATABASE',
  NETWORK: 'NETWORK',
  RATE_LIMIT: 'RATE_LIMIT',
  AUTHENTICATION: 'AUTHENTICATION',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Error severity levels
 */
const ErrorSeverity = {
  LOW: 'LOW',           // User can continue, minor issue
  MEDIUM: 'MEDIUM',     // User can retry, temporary issue
  HIGH: 'HIGH',         // User cannot proceed, needs fix
  CRITICAL: 'CRITICAL'  // System issue, requires immediate attention
};

/**
 * Custom error class with enhanced metadata
 */
class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.userMessage = options.userMessage || message;
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.retryable = options.retryable !== false; // Default true
    this.metadata = options.metadata || {};
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error classes for different scenarios
 */
class ValidationError extends AppError {
  constructor(message, field, suggestion) {
    super(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      statusCode: 400,
      retryable: false,
      userMessage: `Invalid input: ${message}`,
      metadata: { field, suggestion }
    });
    this.name = 'ValidationError';
  }
}

class AIServiceError extends AppError {
  constructor(message, originalError, options = {}) {
    super(message, {
      category: ErrorCategory.AI_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      statusCode: 503,
      retryable: true,
      userMessage: options.userMessage || 'AI service temporarily unavailable. Please try again.',
      metadata: {
        originalError: originalError?.message,
        model: options.model,
        tokens: options.tokens,
        ...options.metadata
      }
    });
    this.name = 'AIServiceError';
    this.originalError = originalError;
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter) {
    super('Rate limit exceeded', {
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      statusCode: 429,
      retryable: true,
      userMessage: `Please wait ${retryAfter} seconds before trying again.`,
      metadata: { retryAfter }
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError) {
    super(message, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      statusCode: 500,
      retryable: true,
      userMessage: 'Database error. Our team has been notified.',
      metadata: { originalError: originalError?.message }
    });
    this.name = 'DatabaseError';
  }
}

class NetworkError extends AppError {
  constructor(message, originalError) {
    super(message, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      statusCode: 503,
      retryable: true,
      userMessage: 'Network error. Please check your connection and try again.',
      metadata: { originalError: originalError?.message }
    });
    this.name = 'NetworkError';
  }
}

/**
 * Classify errors by examining error objects
 */
function classifyError(error) {
  if (!error) return ErrorCategory.UNKNOWN;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  // AI Service errors
  if (message.includes('openai') || 
      message.includes('rate limit') ||
      message.includes('token') ||
      code === 'insufficient_quota' ||
      code === 'context_length_exceeded') {
    return ErrorCategory.AI_SERVICE;
  }
  
  // Database errors
  if (message.includes('prisma') ||
      message.includes('database') ||
      code.startsWith('p') || // Prisma error codes
      message.includes('connection')) {
    return ErrorCategory.DATABASE;
  }
  
  // Network errors
  if (message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      code === 'enotfound' ||
      code === 'etimedout') {
    return ErrorCategory.NETWORK;
  }
  
  // Validation errors
  if (message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      error.statusCode === 400) {
    return ErrorCategory.VALIDATION;
  }
  
  // Rate limit
  if (message.includes('rate limit') ||
      error.statusCode === 429) {
    return ErrorCategory.RATE_LIMIT;
  }
  
  // Authentication
  if (message.includes('unauthorized') ||
      message.includes('authentication') ||
      error.statusCode === 401) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyMessage(error) {
  if (error.userMessage) return error.userMessage;
  
  const category = error.category || classifyError(error);
  
  const messages = {
    [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
    [ErrorCategory.AI_SERVICE]: 'AI service is temporarily unavailable. Please try again in a moment.',
    [ErrorCategory.DATABASE]: 'We encountered a database issue. Our team has been notified.',
    [ErrorCategory.NETWORK]: 'Network connection issue. Please check your internet and try again.',
    [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again.',
    [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please log in again.',
    [ErrorCategory.BUSINESS_LOGIC]: 'Unable to complete this action. Please try again or contact support.',
    [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };
  
  return messages[category] || messages[ErrorCategory.UNKNOWN];
}

/**
 * Get suggested actions for user based on error
 */
function getSuggestedActions(error) {
  const category = error.category || classifyError(error);
  
  const actions = {
    [ErrorCategory.VALIDATION]: [
      'Review the highlighted fields',
      'Ensure all required information is provided',
      'Check that values are in the correct format'
    ],
    [ErrorCategory.AI_SERVICE]: [
      'Wait a few seconds and try again',
      'If the problem persists, try a different mode (Partial instead of Full)',
      'Contact support if the issue continues'
    ],
    [ErrorCategory.DATABASE]: [
      'Wait a moment and try again',
      'Save your work locally if possible',
      'Contact support if the issue persists'
    ],
    [ErrorCategory.NETWORK]: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a moment and retry'
    ],
    [ErrorCategory.RATE_LIMIT]: [
      'Wait a few seconds before trying again',
      'Reduce the frequency of requests',
      'Consider upgrading your plan for higher limits'
    ],
    [ErrorCategory.AUTHENTICATION]: [
      'Log out and log back in',
      'Clear your browser cache',
      'Contact support if you continue to have issues'
    ],
    [ErrorCategory.UNKNOWN]: [
      'Try refreshing the page',
      'Wait a moment and try again',
      'Contact support if the problem persists'
    ]
  };
  
  return actions[category] || actions[ErrorCategory.UNKNOWN];
}

/**
 * Determine if error is retryable
 */
function isRetryable(error) {
  if (error.retryable !== undefined) return error.retryable;
  
  const category = classifyError(error);
  
  // Non-retryable errors
  if (category === ErrorCategory.VALIDATION ||
      category === ErrorCategory.AUTHENTICATION) {
    return false;
  }
  
  // Check status codes
  const nonRetryableStatusCodes = [400, 401, 403, 404, 422];
  if (error.statusCode && nonRetryableStatusCodes.includes(error.statusCode)) {
    return false;
  }
  
  // Everything else is potentially retryable
  return true;
}

/**
 * Log error with appropriate level and metadata
 */
function logError(error, context = {}) {
  const category = error.category || classifyError(error);
  const severity = error.severity || ErrorSeverity.MEDIUM;
  
  const logData = {
    message: error.message,
    category,
    severity,
    statusCode: error.statusCode,
    retryable: isRetryable(error),
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
    ...error.metadata
  };
  
  // Log based on severity
  if (severity === ErrorSeverity.CRITICAL) {
    logger.error('CRITICAL ERROR', logData);
    // TODO: Send alert to monitoring service (Sentry, etc.)
  } else if (severity === ErrorSeverity.HIGH) {
    logger.error('HIGH SEVERITY ERROR', logData);
  } else if (severity === ErrorSeverity.MEDIUM) {
    logger.warn('ERROR', logData);
  } else {
    logger.info('Low severity error', logData);
  }
  
  return logData;
}

/**
 * Create error response object for API responses
 */
function createErrorResponse(error, includeStack = false) {
  const category = error.category || classifyError(error);
  
  const response = {
    success: false,
    error: {
      message: getUserFriendlyMessage(error),
      code: error.code,
      category,
      retryable: isRetryable(error),
      suggestions: getSuggestedActions(error),
      timestamp: error.timestamp || new Date().toISOString()
    }
  };
  
  // Include metadata if present
  if (error.metadata && Object.keys(error.metadata).length > 0) {
    response.error.details = error.metadata;
  }
  
  // Include stack trace only in development
  if (includeStack && process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }
  
  return response;
}

/**
 * Wrap async functions with error handling
 */
function asyncErrorHandler(fn) {
  return async (request, reply) => {
    try {
      return await fn(request, reply);
    } catch (error) {
      // Log the error
      logError(error, {
        path: request.url,
        method: request.method,
        userId: request.user?.id
      });
      
      // Send error response
      const statusCode = error.statusCode || 500;
      const errorResponse = createErrorResponse(error);
      
      return reply.status(statusCode).send(errorResponse);
    }
  };
}

/**
 * Parse OpenAI errors and convert to AppError
 */
function parseOpenAIError(error) {
  const message = error.message || 'OpenAI API error';
  
  // Rate limit
  if (message.includes('Rate limit') || error.status === 429) {
    const retryAfter = error.headers?.['retry-after'] || 60;
    return new RateLimitError(retryAfter);
  }
  
  // Token limit
  if (message.includes('maximum context length') || 
      message.includes('token')) {
    return new AIServiceError(
      'Content too large for AI processing',
      error,
      {
        userMessage: 'Your resume or job description is too large. Please shorten it and try again.',
        code: 'CONTENT_TOO_LARGE'
      }
    );
  }
  
  // Quota exceeded
  if (message.includes('quota') || 
      message.includes('insufficient')) {
    return new AIServiceError(
      'AI service quota exceeded',
      error,
      {
        userMessage: 'AI service is temporarily unavailable. Please try again later.',
        code: 'QUOTA_EXCEEDED',
        severity: ErrorSeverity.HIGH,
        retryable: false
      }
    );
  }
  
  // Generic AI error
  return new AIServiceError(message, error);
}

/**
 * Parse Prisma errors and convert to AppError
 */
function parsePrismaError(error) {
  const code = error.code;
  
  // Unique constraint violation
  if (code === 'P2002') {
    return new ValidationError(
      'Record already exists',
      error.meta?.target,
      'Use a different value or update the existing record'
    );
  }
  
  // Record not found
  if (code === 'P2025') {
    return new ValidationError(
      'Record not found',
      null,
      'The requested record does not exist'
    );
  }
  
  // Foreign key constraint
  if (code === 'P2003') {
    return new ValidationError(
      'Invalid reference',
      error.meta?.field_name,
      'Referenced record does not exist'
    );
  }
  
  // Generic database error
  return new DatabaseError('Database operation failed', error);
}

/**
 * Central error parser - converts any error to AppError
 */
function parseError(error) {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }
  
  // OpenAI errors
  if (error.type?.includes('openai') || 
      error.constructor?.name === 'OpenAIError') {
    return parseOpenAIError(error);
  }
  
  // Prisma errors
  if (error.code?.startsWith('P')) {
    return parsePrismaError(error);
  }
  
  // Network errors
  if (error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND') {
    return new NetworkError(error.message, error);
  }
  
  // Generic error - try to classify
  const category = classifyError(error);
  return new AppError(error.message, {
    category,
    statusCode: error.statusCode || error.status || 500,
    metadata: { originalError: error.toString() }
  });
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AIServiceError,
  RateLimitError,
  DatabaseError,
  NetworkError,
  
  // Error categories and severity
  ErrorCategory,
  ErrorSeverity,
  
  // Utility functions
  classifyError,
  getUserFriendlyMessage,
  getSuggestedActions,
  isRetryable,
  logError,
  createErrorResponse,
  asyncErrorHandler,
  parseError,
  parseOpenAIError,
  parsePrismaError
};
