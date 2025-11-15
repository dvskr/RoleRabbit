/**
 * Circuit Breaker Pattern for External API Calls
 * Section 2.13: External Integrations
 *
 * Requirement #6: Circuit breaker pattern using opossum
 * Requirement #7: Timeout configuration for external calls
 * Requirement #8: Exponential backoff retry
 */

import CircuitBreaker from 'opossum';
import { logger } from '@/lib/logger/logger';
import { ExternalServiceError } from '@/lib/errors';

/**
 * Circuit breaker options
 * Requirement #6: Open circuit after 5 consecutive failures, half-open after 30s
 */
export interface CircuitBreakerOptions {
  timeout?: number; // Request timeout in ms
  errorThresholdPercentage?: number; // % of failures to open circuit
  resetTimeout?: number; // Time in ms before attempting half-open
  rollingCountTimeout?: number; // Time window for counting failures
  rollingCountBuckets?: number; // Number of buckets in the window
  name?: string; // Circuit name for logging
}

/**
 * Default circuit breaker options
 */
const defaultOptions: CircuitBreakerOptions = {
  timeout: 30000, // 30 seconds default
  errorThresholdPercentage: 50, // Open if >50% of requests fail
  resetTimeout: 30000, // Try again after 30 seconds
  rollingCountTimeout: 10000, // 10 second window
  rollingCountBuckets: 10, // 10 buckets of 1 second each
};

/**
 * Timeout configurations for external services
 * Requirement #7: Timeout configuration
 */
export const TIMEOUTS = {
  STORAGE_UPLOAD: 60000, // 60 seconds for file uploads
  DNS_QUERY: 10000, // 10 seconds for DNS queries
  SSL_PROVISION: 120000, // 120 seconds for SSL provisioning
  HTTP_REQUEST: 30000, // 30 seconds for general HTTP requests
  WEBHOOK: 10000, // 10 seconds for webhooks
  GEOLOCATION: 5000, // 5 seconds for IP geolocation
};

/**
 * Retry configuration
 * Requirement #8: Exponential backoff retry with 2s, 4s, 8s delays
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in ms
  maxDelay: number; // Maximum delay in ms
  exponential: boolean; // Use exponential backoff
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 2000, // Start with 2 seconds
  maxDelay: 8000, // Cap at 8 seconds
  exponential: true,
};

/**
 * Create circuit breaker for a function
 */
export const createCircuitBreaker = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: CircuitBreakerOptions = {}
): CircuitBreaker<T, R> => {
  const opts = { ...defaultOptions, ...options };

  const breaker = new CircuitBreaker<T, R>(fn, opts);

  // Event listeners for logging
  breaker.on('open', () => {
    logger.warn(`Circuit breaker opened for ${opts.name || 'unknown'}`, {
      circuit: opts.name,
    });
  });

  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker half-open for ${opts.name || 'unknown'}`, {
      circuit: opts.name,
    });
  });

  breaker.on('close', () => {
    logger.info(`Circuit breaker closed for ${opts.name || 'unknown'}`, {
      circuit: opts.name,
    });
  });

  breaker.on('timeout', () => {
    logger.error(`Circuit breaker timeout for ${opts.name || 'unknown'}`, {
      circuit: opts.name,
      timeout: opts.timeout,
    });
  });

  breaker.on('reject', () => {
    logger.error(`Circuit breaker rejected request for ${opts.name || 'unknown'}`, {
      circuit: opts.name,
    });
  });

  return breaker;
};

/**
 * Retry with exponential backoff
 * Requirement #8: Exponential backoff retry
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
  context?: string
): Promise<T> => {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < config.maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      attempt++;

      if (attempt >= config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = config.exponential
        ? Math.min(config.baseDelay * Math.pow(2, attempt - 1), config.maxDelay)
        : config.baseDelay;

      logger.warn(`Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms`, {
        context,
        error: error.message,
        attempt,
        delay,
      });

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries failed
  throw new ExternalServiceError(
    context || 'Unknown',
    `Failed after ${config.maxRetries} retries`,
    { lastError: lastError?.message }
  );
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create circuit breaker with retry
 * Combines circuit breaker + exponential backoff
 */
export const createResilientFunction = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    circuitBreaker?: CircuitBreakerOptions;
    retry?: RetryConfig;
    name?: string;
  } = {}
): ((...args: T) => Promise<R>) => {
  const { circuitBreaker: cbOptions, retry: retryConfig, name } = options;

  // Wrap function with retry logic
  const fnWithRetry = async (...args: T): Promise<R> => {
    return retryWithBackoff(
      () => fn(...args),
      retryConfig,
      name
    );
  };

  // Wrap with circuit breaker
  const breaker = createCircuitBreaker(fnWithRetry, {
    ...cbOptions,
    name,
  });

  // Return function that calls circuit breaker
  return async (...args: T): Promise<R> => {
    try {
      return await breaker.fire(...args);
    } catch (error: any) {
      logger.error(`Resilient function failed: ${name}`, {
        error: error.message,
        isOpen: breaker.opened,
      });
      throw error;
    }
  };
};

/**
 * Pre-configured circuit breakers for common services
 */

// Supabase Storage circuit breaker
export const storageCircuitBreaker = createCircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: TIMEOUTS.STORAGE_UPLOAD,
    name: 'supabase-storage',
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

// DNS query circuit breaker
export const dnsCircuitBreaker = createCircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: TIMEOUTS.DNS_QUERY,
    name: 'dns-query',
    errorThresholdPercentage: 70, // DNS is more tolerant
    resetTimeout: 30000,
  }
);

// SSL provisioning circuit breaker
export const sslCircuitBreaker = createCircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: TIMEOUTS.SSL_PROVISION,
    name: 'ssl-provision',
    errorThresholdPercentage: 50,
    resetTimeout: 60000, // Longer reset for SSL
  }
);

// HTTP request circuit breaker
export const httpCircuitBreaker = createCircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: TIMEOUTS.HTTP_REQUEST,
    name: 'http-request',
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

// Webhook circuit breaker
export const webhookCircuitBreaker = createCircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: TIMEOUTS.WEBHOOK,
    name: 'webhook',
    errorThresholdPercentage: 60, // Webhooks can be flaky
    resetTimeout: 20000,
  }
);

// IP geolocation circuit breaker
export const geolocationCircuitBreaker = createCircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: TIMEOUTS.GEOLOCATION,
    name: 'geolocation',
    errorThresholdPercentage: 70, // Non-critical service
    resetTimeout: 15000,
  }
);

/**
 * Get circuit breaker stats
 */
export const getCircuitBreakerStats = (breaker: CircuitBreaker<any, any>) => {
  return {
    isOpen: breaker.opened,
    isHalfOpen: breaker.halfOpen,
    isClosed: breaker.closed,
    stats: breaker.stats,
  };
};

/**
 * Example usage:
 *
 * // Create resilient function with circuit breaker + retry
 * const uploadToStorage = createResilientFunction(
 *   async (file: Buffer) => {
 *     // Upload logic
 *   },
 *   {
 *     circuitBreaker: { timeout: TIMEOUTS.STORAGE_UPLOAD },
 *     retry: { maxRetries: 3, baseDelay: 2000 },
 *     name: 'upload-to-storage',
 *   }
 * );
 *
 * // Use pre-configured circuit breaker
 * await storageCircuitBreaker.fire(async () => {
 *   // Upload logic
 * });
 */
