/**
 * Circuit Breaker for Database and External Services
 * BE-029: Database connection error handling with retry and circuit breaker
 */

const logger = require('./logger');

/**
 * Circuit breaker states
 */
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',      // Normal operation
  OPEN: 'OPEN',          // Failing, reject requests immediately
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
};

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CONFIG = {
  failureThreshold: 5,        // Open circuit after 5 failures
  successThreshold: 2,        // Close circuit after 2 successes
  timeout: 60000,             // 60 seconds before trying half-open
  resetTimeout: 30000         // 30 seconds before attempting reset
};

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
  constructor(name, config = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute(fn, ...args) {
    // Check if circuit is open and should remain open
    if (this.state === CIRCUIT_STATES.OPEN) {
      const now = Date.now();
      if (now < this.nextAttemptTime) {
        const remaining = Math.ceil((this.nextAttemptTime - now) / 1000);
        throw new Error(`Circuit breaker is OPEN. Service unavailable. Retry after ${remaining} seconds.`);
      }
      
      // Transition to half-open
      this.state = CIRCUIT_STATES.HALF_OPEN;
      this.successCount = 0;
      logger.info(`Circuit breaker [${this.name}] transitioning to HALF_OPEN`);
    }

    try {
      // Execute the function
      const result = await fn(...args);
      
      // On success, reset failure count
      this.onSuccess();
      return result;
    } catch (error) {
      // On failure, increment failure count
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.successCount++;
      
      // If we have enough successes, close the circuit
      if (this.successCount >= this.config.successThreshold) {
        this.state = CIRCUIT_STATES.CLOSED;
        this.successCount = 0;
        logger.info(`Circuit breaker [${this.name}] CLOSED - service recovered`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      // If we fail in half-open, immediately open the circuit
      this.state = CIRCUIT_STATES.OPEN;
      this.nextAttemptTime = Date.now() + this.config.timeout;
      logger.warn(`Circuit breaker [${this.name}] OPENED - service still failing`);
    } else if (this.state === CIRCUIT_STATES.CLOSED) {
      // Check if we should open the circuit
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CIRCUIT_STATES.OPEN;
        this.nextAttemptTime = Date.now() + this.config.timeout;
        logger.error(`Circuit breaker [${this.name}] OPENED after ${this.failureCount} failures`);
      }
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    logger.info(`Circuit breaker [${this.name}] RESET`);
  }
}

// Global circuit breakers
const circuitBreakers = {
  database: new CircuitBreaker('database', { failureThreshold: 5, timeout: 30000 }),
  storage: new CircuitBreaker('storage', { failureThreshold: 5, timeout: 30000 }),
  email: new CircuitBreaker('email', { failureThreshold: 3, timeout: 60000 })
};

module.exports = {
  CircuitBreaker,
  CIRCUIT_STATES,
  circuitBreakers
};

