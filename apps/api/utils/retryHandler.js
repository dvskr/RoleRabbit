/**
 * Retry Handler with Exponential Backoff
 * Handles transient failures with intelligent retry logic
 */

const logger = require('./logger');
const { isRetryable, classifyError, ErrorCategory } = require('./errorHandler');

/**
 * Retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000,    // 30 seconds
  backoffMultiplier: 2, // Exponential backoff
  retryableErrors: [
    ErrorCategory.AI_SERVICE,
    ErrorCategory.NETWORK,
    ErrorCategory.DATABASE,
    ErrorCategory.RATE_LIMIT
  ]
};

/**
 * Calculate delay for next retry with exponential backoff
 */
function calculateDelay(attempt, config = DEFAULT_RETRY_CONFIG) {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay; // ±30% jitter
  return Math.floor(delay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if error should be retried
 */
function shouldRetry(error, attempt, config) {
  // Check max retries
  if (attempt >= config.maxRetries) {
    return false;
  }
  
  // Check if error is retryable
  if (!isRetryable(error)) {
    return false;
  }
  
  // Check if error category is in retryable list
  const category = classifyError(error);
  if (!config.retryableErrors.includes(category)) {
    return false;
  }
  
  return true;
}

/**
 * Execute function with retry logic
 */
async function withRetry(fn, config = {}) {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // First attempt or retry
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1, retryConfig);
        logger.info('Retrying operation', {
          attempt,
          maxRetries: retryConfig.maxRetries,
          delayMs: delay
        });
        await sleep(delay);
      }
      
      // Execute function
      const result = await fn();
      
      // Success
      if (attempt > 0) {
        logger.info('Retry succeeded', { attempt });
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (!shouldRetry(error, attempt, retryConfig)) {
        logger.warn('Error not retryable or max retries reached', {
          attempt,
          maxRetries: retryConfig.maxRetries,
          error: error.message,
          category: classifyError(error)
        });
        throw error;
      }
      
      // Log retry attempt
      logger.warn('Operation failed, will retry', {
        attempt,
        maxRetries: retryConfig.maxRetries,
        error: error.message,
        nextRetryIn: calculateDelay(attempt, retryConfig)
      });
    }
  }
  
  // All retries exhausted
  logger.error('All retry attempts exhausted', {
    maxRetries: retryConfig.maxRetries,
    finalError: lastError?.message
  });
  
  throw lastError;
}

/**
 * Retry specifically for OpenAI API calls
 */
async function retryOpenAI(fn, options = {}) {
  const config = {
    maxRetries: options.maxRetries || 3,
    initialDelay: 2000, // Start with 2 seconds for AI
    maxDelay: 60000,    // Max 60 seconds
    backoffMultiplier: 2,
    retryableErrors: [ErrorCategory.AI_SERVICE, ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT]
  };
  
  return withRetry(fn, config);
}

/**
 * Retry specifically for database operations
 */
async function retryDatabase(fn, options = {}) {
  const config = {
    maxRetries: options.maxRetries || 2,
    initialDelay: 500,  // Faster retries for DB
    maxDelay: 5000,     // Max 5 seconds
    backoffMultiplier: 2,
    retryableErrors: [ErrorCategory.DATABASE]
  };
  
  return withRetry(fn, config);
}

/**
 * Retry with custom predicate function
 */
async function retryWithPredicate(fn, shouldRetryFn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1);
        await sleep(delay);
      }
      
      return await fn();
      
    } catch (error) {
      lastError = error;
      
      if (attempt >= maxRetries || !shouldRetryFn(error, attempt)) {
        throw error;
      }
    }
  }
  
  throw lastError;
}

/**
 * Circuit breaker pattern for failing services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60 seconds
    this.halfOpenRequests = options.halfOpenRequests || 3;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
    // Circuit is OPEN - reject immediately
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
      // Time to try again - move to HALF_OPEN
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.halfOpenRequests) {
        this.state = 'CLOSED';
        logger.info('Circuit breaker CLOSED - service recovered');
      }
    }
  }
  
  onFailure() {
    this.failureCount++;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.warn('Circuit breaker OPEN - service still failing');
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.error('Circuit breaker OPEN - too many failures', {
        failureCount: this.failureCount,
        threshold: this.failureThreshold
      });
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }
}

// Global circuit breakers for different services
const circuitBreakers = {
  openai: new CircuitBreaker({ failureThreshold: 5, resetTimeout: 60000 }),
  database: new CircuitBreaker({ failureThreshold: 3, resetTimeout: 30000 })
};

/**
 * Get circuit breaker for service
 */
function getCircuitBreaker(service) {
  return circuitBreakers[service] || circuitBreakers.openai;
}

module.exports = {
  withRetry,
  retryOpenAI,
  retryDatabase,
  retryWithPredicate,
  calculateDelay,
  sleep,
  shouldRetry,
  CircuitBreaker,
  getCircuitBreaker
};

