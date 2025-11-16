/**
 * BE-060: Retry logic with exponential backoff for Supabase Storage operations
 */

const logger = require('./logger');

/**
 * Retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: parseInt(process.env.STORAGE_MAX_RETRIES) || 3,
  initialDelay: parseInt(process.env.STORAGE_RETRY_INITIAL_DELAY_MS) || 1000,
  maxDelay: parseInt(process.env.STORAGE_RETRY_MAX_DELAY_MS) || 10000,
  backoffMultiplier: parseFloat(process.env.STORAGE_RETRY_BACKOFF_MULTIPLIER) || 2
};

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || '';
  
  // Network errors
  if (errorCode === 'ECONNRESET' || errorCode === 'ETIMEDOUT' || errorCode === 'ENOTFOUND') {
    return true;
  }
  
  // Supabase specific errors
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('503') ||
      errorMessage.includes('502') ||
      errorMessage.includes('504')) {
    return true;
  }
  
  // Rate limiting (retry after delay)
  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return true;
  }
  
  return false;
}

/**
 * Calculate delay for exponential backoff
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
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * BE-060: Retry logic with exponential backoff
 */
async function retryWithBackoff(fn, config = DEFAULT_RETRY_CONFIG, context = '') {
  let lastError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        logger.info(`✅ ${context} succeeded after ${attempt} retry(ies)`);
      }
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        logger.warn(`❌ ${context} failed with non-retryable error: ${error.message}`);
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === config.maxRetries) {
        logger.error(`❌ ${context} failed after ${config.maxRetries} retries: ${error.message}`);
        throw error;
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      logger.warn(`⚠️ ${context} failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${Math.round(delay)}ms: ${error.message}`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

module.exports = {
  retryWithBackoff,
  isRetryableError,
  DEFAULT_RETRY_CONFIG
};

