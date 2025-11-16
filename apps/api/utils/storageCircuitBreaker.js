/**
 * BE-061: Circuit breaker for Supabase Storage
 * Prevents cascading failures by stopping requests when service is down
 */

const logger = require('./logger');

/**
 * Circuit breaker states
 */
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',      // Normal operation
  OPEN: 'OPEN',          // Service is down, reject requests immediately
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
};

/**
 * Circuit breaker configuration
 */
const DEFAULT_CONFIG = {
  failureThreshold: parseInt(process.env.STORAGE_CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5,
  resetTimeout: parseInt(process.env.STORAGE_CIRCUIT_BREAKER_RESET_TIMEOUT_MS) || 60000, // 1 minute
  monitoringWindow: parseInt(process.env.STORAGE_CIRCUIT_BREAKER_MONITORING_WINDOW_MS) || 60000 // 1 minute
};

/**
 * Circuit breaker class
 */
class StorageCircuitBreaker {
  constructor(config = DEFAULT_CONFIG) {
    this.config = config;
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    this.failures = []; // Track failures in time window
  }

  /**
   * Record a failure
   */
  recordFailure() {
    const now = Date.now();
    this.failureCount++;
    this.lastFailureTime = now;
    this.failures.push(now);
    
    // Clean old failures outside monitoring window
    this.failures = this.failures.filter(
      time => now - time < this.config.monitoringWindow
    );
    
    // Check if we should open the circuit
    if (this.failures.length >= this.config.failureThreshold) {
      this.open();
    }
  }

  /**
   * Record a success
   */
  recordSuccess() {
    this.successCount++;
    
    // If in half-open state and we have successes, close the circuit
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.close();
    }
    
    // Reset failure tracking periodically
    if (this.successCount % 10 === 0) {
      this.failures = [];
    }
  }

  /**
   * Open the circuit (service is down)
   */
  open() {
    if (this.state !== CIRCUIT_STATES.OPEN) {
      logger.error('🔴 Circuit breaker OPENED - Supabase Storage appears to be down');
      this.state = CIRCUIT_STATES.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    }
  }

  /**
   * Close the circuit (service is healthy)
   */
  close() {
    if (this.state !== CIRCUIT_STATES.CLOSED) {
      logger.info('🟢 Circuit breaker CLOSED - Supabase Storage is healthy');
      this.state = CIRCUIT_STATES.CLOSED;
      this.failureCount = 0;
      this.failures = [];
      this.nextAttemptTime = null;
    }
  }

  /**
   * Check if circuit breaker allows the request
   */
  canExecute() {
    const now = Date.now();
    
    // If circuit is closed, allow execution
    if (this.state === CIRCUIT_STATES.CLOSED) {
      return { allowed: true };
    }
    
    // If circuit is open, check if we should try half-open
    if (this.state === CIRCUIT_STATES.OPEN) {
      if (now >= this.nextAttemptTime) {
        logger.info('🟡 Circuit breaker HALF_OPEN - Testing if Supabase Storage recovered');
        this.state = CIRCUIT_STATES.HALF_OPEN;
        return { allowed: true, halfOpen: true };
      }
      return { 
        allowed: false, 
        reason: 'Circuit breaker is OPEN. Service appears to be down.',
        retryAfter: Math.ceil((this.nextAttemptTime - now) / 1000)
      };
    }
    
    // If circuit is half-open, allow one test request
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      return { allowed: true, halfOpen: true };
    }
    
    return { allowed: true };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failuresInWindow: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker (for manual recovery)
   */
  reset() {
    logger.info('🔄 Circuit breaker RESET');
    this.close();
  }
}

// Singleton instance
let circuitBreakerInstance = null;

/**
 * Get circuit breaker instance
 * BE-061: Circuit breaker for Supabase Storage
 */
function getCircuitBreaker(config = DEFAULT_CONFIG) {
  if (!circuitBreakerInstance) {
    circuitBreakerInstance = new StorageCircuitBreaker(config);
  }
  return circuitBreakerInstance;
}

module.exports = {
  getCircuitBreaker,
  CIRCUIT_STATES,
  StorageCircuitBreaker
};

