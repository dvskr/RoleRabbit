/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to failing services.
 * If a service fails repeatedly, the circuit "opens" and requests are blocked
 * for a cooldown period, allowing the service to recover.
 */

/**
 * Circuit States
 */
const CircuitState = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Service is failing, block requests
  HALF_OPEN: 'HALF_OPEN' // Testing if service has recovered
};

/**
 * Circuit Breaker Class
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'unnamed';
    this.failureThreshold = options.failureThreshold || 5; // failures before opening
    this.successThreshold = options.successThreshold || 2; // successes to close from half-open
    this.timeout = options.timeout || 60000; // cooldown period (1 minute)
    this.monitoringPeriod = options.monitoringPeriod || 120000; // period to track failures (2 minutes)
    
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.failures = []; // Track failure timestamps
    
    console.log(`Circuit breaker "${this.name}" initialized:`, {
      failureThreshold: this.failureThreshold,
      timeout: this.timeout,
      monitoringPeriod: this.monitoringPeriod
    });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute(fn, fallback = null) {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      // Check if cooldown period has passed
      if (Date.now() < this.nextAttempt) {
        console.warn(`Circuit breaker "${this.name}" is OPEN. Request blocked.`);
        
        if (fallback) {
          console.log(`Using fallback for "${this.name}"`);
          return fallback();
        }
        
        throw new Error(`Service temporarily unavailable (circuit breaker open). Try again in ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`);
      }
      
      // Cooldown passed, try half-open
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
      console.log(`Circuit breaker "${this.name}" entering HALF_OPEN state`);
    }

    try {
      // Execute the function
      const result = await fn();
      
      // Success!
      this.onSuccess();
      return result;
      
    } catch (error) {
      // Failure
      this.onFailure(error);
      
      // Use fallback if available
      if (fallback && this.state === CircuitState.OPEN) {
        console.log(`Using fallback for "${this.name}" after failure`);
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        // Enough successes, close the circuit
        this.close();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = 0;
      this.failures = [];
    }
  }

  /**
   * Handle failed execution
   */
  onFailure(error) {
    const now = Date.now();
    this.failures.push(now);
    
    // Remove old failures outside monitoring period
    this.failures = this.failures.filter(
      timestamp => now - timestamp < this.monitoringPeriod
    );
    
    this.failureCount = this.failures.length;
    
    console.warn(`Circuit breaker "${this.name}" failure (${this.failureCount}/${this.failureThreshold}):`, error.message);
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during half-open, reopen circuit
      this.open();
    } else if (this.failureCount >= this.failureThreshold) {
      // Too many failures, open circuit
      this.open();
    }
  }

  /**
   * Open the circuit (block requests)
   */
  open() {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.timeout;
    
    console.error(`Circuit breaker "${this.name}" OPENED. Will retry at ${new Date(this.nextAttempt).toISOString()}`);
  }

  /**
   * Close the circuit (allow requests)
   */
  close() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failures = [];
    
    console.log(`Circuit breaker "${this.name}" CLOSED. Normal operation resumed.`);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt,
      isOpen: this.state === CircuitState.OPEN
    };
  }

  /**
   * Force reset the circuit breaker
   */
  reset() {
    console.log(`Circuit breaker "${this.name}" manually reset`);
    this.close();
  }
}

/**
 * Circuit Breaker Manager
 * Manages multiple circuit breakers for different services
 */
class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create a circuit breaker
   */
  getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ ...options, name }));
    }
    return this.breakers.get(name);
  }

  /**
   * Execute with circuit breaker
   */
  async execute(name, fn, fallback = null, options = {}) {
    const breaker = this.getBreaker(name, options);
    return breaker.execute(fn, fallback);
  }

  /**
   * Get state of all circuit breakers
   */
  getAllStates() {
    const states = {};
    this.breakers.forEach((breaker, name) => {
      states[name] = breaker.getState();
    });
    return states;
  }

  /**
   * Reset a specific circuit breaker
   */
  reset(name) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    this.breakers.forEach(breaker => breaker.reset());
  }
}

// Global circuit breaker manager instance
const circuitBreakerManager = new CircuitBreakerManager();

/**
 * Pre-configured circuit breakers for common services
 */
const CircuitBreakers = {
  OPENAI: 'openai',
  DATABASE: 'database',
  REDIS: 'redis',
  STORAGE: 'storage'
};

/**
 * Execute OpenAI request with circuit breaker
 */
async function executeWithOpenAIBreaker(fn, fallback = null) {
  return circuitBreakerManager.execute(
    CircuitBreakers.OPENAI,
    fn,
    fallback,
    {
      failureThreshold: 5,
      timeout: 60000, // 1 minute
      successThreshold: 2
    }
  );
}

/**
 * Execute database query with circuit breaker
 */
async function executeWithDatabaseBreaker(fn, fallback = null) {
  return circuitBreakerManager.execute(
    CircuitBreakers.DATABASE,
    fn,
    fallback,
    {
      failureThreshold: 3,
      timeout: 30000, // 30 seconds
      successThreshold: 2
    }
  );
}

/**
 * Execute Redis operation with circuit breaker
 */
async function executeWithRedisBreaker(fn, fallback = null) {
  return circuitBreakerManager.execute(
    CircuitBreakers.REDIS,
    fn,
    fallback,
    {
      failureThreshold: 3,
      timeout: 30000, // 30 seconds
      successThreshold: 2
    }
  );
}

module.exports = {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitState,
  CircuitBreakers,
  circuitBreakerManager,
  executeWithOpenAIBreaker,
  executeWithDatabaseBreaker,
  executeWithRedisBreaker
};

