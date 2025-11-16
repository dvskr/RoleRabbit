/**
 * Retry Handler with Exponential Backoff
 * 
 * Automatically retries failed operations with exponential backoff.
 * Useful for transient errors like network issues, rate limits, etc.
 */

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  // Network errors
  if (error.code === 'ECONNRESET' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENETUNREACH') {
    return true;
  }

  // HTTP status codes that are retryable
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Database connection errors (Prisma)
  if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
    return true;
  }

  // OpenAI specific errors
  if (error.type === 'server_error' || error.type === 'rate_limit_error') {
    return true;
  }

  return false;
}

/**
 * Retry with exponential backoff
 * 
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {number} options.backoffMultiplier - Multiplier for exponential backoff (default: 2)
 * @param {Function} options.onRetry - Callback called before each retry
 * @param {Function} options.shouldRetry - Custom function to determine if error is retryable
 * @returns {Promise} Result of the function or throws last error
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry = null,
    shouldRetry = isRetryableError
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // Success!
      if (attempt > 0) {
        console.log(`Operation succeeded after ${attempt} retries`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const isLastAttempt = attempt === maxRetries;
      const canRetry = shouldRetry(error);
      
      if (isLastAttempt || !canRetry) {
        // No more retries or error is not retryable
        if (isLastAttempt && canRetry) {
          console.error(`Operation failed after ${maxRetries} retries:`, error.message);
        }
        throw error;
      }
      
      // Log retry
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      
      // Call onRetry callback if provided
      if (onRetry) {
        await onRetry(error, attempt, delay);
      }
      
      // Wait before retrying
      await sleep(delay);
      
      // Increase delay exponentially
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Retry database operation
 */
async function retryDatabaseOperation(fn, options = {}) {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    onRetry: (error, attempt, delay) => {
      console.warn(`Database operation failed (attempt ${attempt + 1}), retrying in ${delay}ms`);
    },
    ...options
  });
}

/**
 * Retry LLM operation (with rate limit handling)
 */
async function retryLLMOperation(fn, options = {}) {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 2000, // Longer initial delay for rate limits
    maxDelay: 60000, // Up to 1 minute
    backoffMultiplier: 3, // Faster backoff for rate limits
    onRetry: (error, attempt, delay) => {
      if (error.status === 429) {
        console.warn(`LLM rate limit hit (attempt ${attempt + 1}), waiting ${delay}ms`);
      } else {
        console.warn(`LLM operation failed (attempt ${attempt + 1}), retrying in ${delay}ms`);
      }
    },
    shouldRetry: (error) => {
      // Always retry rate limits
      if (error.status === 429 || error.type === 'rate_limit_error') {
        return true;
      }
      return isRetryableError(error);
    },
    ...options
  });
}

/**
 * Retry with jitter (adds randomness to prevent thundering herd)
 */
async function retryWithJitter(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    ...otherOptions
  } = options;

  return retryWithBackoff(fn, {
    ...otherOptions,
    maxRetries,
    initialDelay: baseDelay,
    maxDelay,
    onRetry: async (error, attempt, delay) => {
      // Add jitter (random delay between 0 and delay)
      const jitter = Math.random() * delay;
      const totalDelay = delay + jitter;
      
      console.warn(`Operation failed (attempt ${attempt + 1}), retrying in ${Math.round(totalDelay)}ms (with jitter)`);
      
      // Sleep for jitter amount
      await sleep(jitter);
      
      if (otherOptions.onRetry) {
        await otherOptions.onRetry(error, attempt, totalDelay);
      }
    }
  });
}

/**
 * Batch retry - retry multiple operations with shared backoff
 */
async function retryBatch(operations, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    continueOnError = false
  } = options;

  const results = [];
  const errors = [];
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const failedOperations = [];
    
    for (let i = 0; i < operations.length; i++) {
      // Skip if already succeeded
      if (results[i] !== undefined) {
        continue;
      }
      
      try {
        results[i] = await operations[i]();
      } catch (error) {
        if (isRetryableError(error)) {
          failedOperations.push({ index: i, error });
        } else {
          // Non-retryable error
          errors[i] = error;
          if (!continueOnError) {
            throw error;
          }
        }
      }
    }
    
    // All operations succeeded
    if (failedOperations.length === 0) {
      return results;
    }
    
    // Check if we should retry
    const isLastAttempt = attempt === maxRetries;
    if (isLastAttempt) {
      // Save final errors
      failedOperations.forEach(({ index, error }) => {
        errors[index] = error;
      });
      
      if (!continueOnError) {
        throw new Error(`Batch operation failed: ${failedOperations.length} operations failed after ${maxRetries} retries`);
      }
      
      break;
    }
    
    // Wait before retrying
    console.warn(`Batch retry: ${failedOperations.length} operations failed, retrying in ${delay}ms`);
    await sleep(delay);
    delay = Math.min(delay * backoffMultiplier, maxDelay);
  }

  return {
    results,
    errors,
    hasErrors: errors.some(e => e !== undefined)
  };
}

module.exports = {
  retryWithBackoff,
  retryDatabaseOperation,
  retryLLMOperation,
  retryWithJitter,
  retryBatch,
  isRetryableError,
  sleep
};
