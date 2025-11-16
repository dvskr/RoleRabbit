/**
 * Retry Logic Utilities
 * BE-028: Retry logic for storage service failures
 */

const logger = require('./logger');

/**
 * Retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'TIMEOUT',
    'NetworkError',
    'TimeoutError'
  ]
};

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const errorCode = error.code || '';
  
  // Check error code
  if (DEFAULT_RETRY_CONFIG.retryableErrors.includes(errorCode)) {
    return true;
  }
  
  // Check error message
  const lowerMessage = errorMessage.toLowerCase();
  if (lowerMessage.includes('timeout') || 
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('econnreset') ||
      lowerMessage.includes('etimedout')) {
    return true;
  }
  
  // Check for HTTP status codes that are retryable
  if (error.statusCode) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (retryableStatusCodes.includes(error.statusCode)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate delay for retry attempt
 */
function calculateDelay(attempt, config = DEFAULT_RETRY_CONFIG) {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {object} config - Retry configuration
 * @returns {Promise} Result of function execution
 */
async function retry(fn, config = {}) {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        logger.warn(`Error is not retryable: ${error.message}`);
        throw error;
      }
      
      // Don't retry if we've exhausted retries
      if (attempt >= retryConfig.maxRetries) {
        logger.error(`Max retries (${retryConfig.maxRetries}) exceeded for operation`);
        throw error;
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, retryConfig);
      logger.warn(`Retry attempt ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms. Error: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Retry with custom error handler
 */
async function retryWithHandler(fn, errorHandler, config = {}) {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Use custom error handler to determine if retryable
      const shouldRetry = errorHandler ? await errorHandler(error, attempt) : isRetryableError(error);
      
      if (!shouldRetry) {
        throw error;
      }
      
      if (attempt >= retryConfig.maxRetries) {
        throw error;
      }
      
      const delay = calculateDelay(attempt, retryConfig);
      logger.warn(`Retry attempt ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

module.exports = {
  retry,
  retryWithHandler,
  isRetryableError,
  calculateDelay,
  DEFAULT_RETRY_CONFIG
};

