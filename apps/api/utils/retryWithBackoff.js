/**
 * Retry Utility with Exponential Backoff
 * Implements retry logic for OpenAI API calls and other operations
 */

const logger = require('./logger');

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.backoffMultiplier - Multiplier for exponential backoff (default: 2)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @param {Function} options.onRetry - Callback called before each retry
 * @param {string} options.operationName - Name of operation for logging
 * @returns {Promise<any>} Result of the function
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    onRetry = null,
    operationName = 'operation'
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.info(`[RETRY] Attempting ${operationName} (attempt ${attempt}/${maxAttempts})`);
      
      const result = await fn(attempt);
      
      if (attempt > 1) {
        logger.info(`[RETRY] ${operationName} succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      logger.warn(`[RETRY] ${operationName} failed on attempt ${attempt}/${maxAttempts}`, {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        attempt,
        maxAttempts
      });

      // Check if we should retry this error
      if (!shouldRetry(error, attempt)) {
        logger.info(`[RETRY] Error not retryable for ${operationName}, throwing immediately`);
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        logger.error(`[RETRY] ${operationName} failed after ${maxAttempts} attempts`, {
          finalError: error.message,
          code: error.code,
          statusCode: error.statusCode
        });
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        await onRetry(error, attempt, delay);
      }

      // Wait before retrying (exponential backoff)
      logger.info(`[RETRY] Waiting ${delay}ms before retry ${attempt + 1}/${maxAttempts}`);
      await sleep(delay);

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default retry strategy for OpenAI errors
 * @param {Error} error - The error that occurred
 * @param {number} attempt - Current attempt number
 * @returns {boolean} Whether to retry
 */
function shouldRetryOpenAIError(error, attempt) {
  // Don't retry on first attempt for these errors
  const nonRetryableErrors = [
    'AI_INVALID_KEY',           // Invalid API key - won't fix with retry
    'AI_QUOTA_EXCEEDED',        // Quota exceeded - won't fix with retry
    'EMBEDDING_INVALID_KEY',    // Invalid API key
    'EMBEDDING_QUOTA_EXCEEDED'  // Quota exceeded
  ];

  if (error.code && nonRetryableErrors.includes(error.code)) {
    return false;
  }

  // Don't retry 400-level errors except 408 (timeout) and 429 (rate limit)
  const statusCode = error.statusCode || error.status;
  if (statusCode >= 400 && statusCode < 500) {
    return statusCode === 408 || statusCode === 429;
  }

  // Retry 500-level errors (server errors)
  if (statusCode >= 500) {
    return true;
  }

  // Retry timeouts
  if (error.code === 'AI_TIMEOUT' || error.code === 'EMBEDDING_TIMEOUT') {
    return true;
  }

  // Retry rate limits
  if (error.code === 'AI_RATE_LIMIT' || error.code === 'EMBEDDING_RATE_LIMIT') {
    return true;
  }

  // Retry service unavailable
  if (error.code === 'AI_SERVICE_UNAVAILABLE' || error.code === 'EMBEDDING_SERVICE_UNAVAILABLE') {
    return true;
  }

  // Retry network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // Default: retry unknown errors
  return true;
}

/**
 * Retry an OpenAI operation with sensible defaults
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Additional options (merged with defaults)
 * @returns {Promise<any>} Result of the function
 */
async function retryOpenAIOperation(fn, options = {}) {
  return retryWithBackoff(fn, {
    maxAttempts: 3,
    initialDelay: 1000,      // 1 second
    maxDelay: 8000,          // 8 seconds max
    backoffMultiplier: 2,    // 1s, 2s, 4s
    shouldRetry: shouldRetryOpenAIError,
    ...options
  });
}

module.exports = {
  retryWithBackoff,
  retryOpenAIOperation,
  shouldRetryOpenAIError,
  sleep
};

