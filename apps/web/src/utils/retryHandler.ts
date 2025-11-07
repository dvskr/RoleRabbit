/**
 * Retry handler utility with exponential backoff
 * Handles retry logic for failed network requests
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  retryableErrors?: string[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
  retryableErrors: ['NetworkError', 'Failed to fetch', 'timeout', 'ECONNRESET'],
};

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: any, options: Required<RetryOptions>): boolean => {
  // Network errors are always retryable
  const errorMessage = String(error?.message || error || '').toLowerCase();
  const isNetworkError = options.retryableErrors.some(retryableError =>
    errorMessage.includes(retryableError.toLowerCase())
  );

  if (isNetworkError) {
    return true;
  }

  // Check status codes
  const statusCode = error?.statusCode || error?.status;
  if (statusCode && options.retryableStatusCodes.includes(statusCode)) {
    return true;
  }

  // 401 (Unauthorized) should not be retried automatically
  // 403 (Forbidden) should not be retried
  // 404 (Not Found) should not be retried
  if (statusCode && (statusCode === 401 || statusCode === 403 || statusCode === 404)) {
    return false;
  }

  return false;
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number => {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt + 1,
      };
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt >= opts.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error, opts)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: opts.maxRetries + 1,
  };
}

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true; // Assume online if navigator is not available (SSR)
};

/**
 * Wait for online status
 */
export const waitForOnline = (timeout: number = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', handleOnline);
      resolve(false);
    }, timeout);

    const handleOnline = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      resolve(true);
    };

    window.addEventListener('online', handleOnline);
  });
};

