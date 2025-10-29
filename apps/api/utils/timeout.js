/**
 * Timeout Utility
 * Provides timeout functionality for async operations
 */

/**
 * Wrap an async function with a timeout
 * @param {Function} fn - Async function to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {Error} timeoutError - Custom error to throw on timeout
 * @returns {Promise} - Result or timeout error
 */
function withTimeout(fn, timeoutMs = 5000, timeoutError = null) {
  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      const error = timeoutError || new Error(`Operation timed out after ${timeoutMs}ms`);
      reject(error);
    }, timeoutMs);

    try {
      const result = await fn();
      clearTimeout(timer);
      resolve(result);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

/**
 * Create a timeout promise
 */
function createTimeout(ms, message = 'Timeout') {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
}

/**
 * Race between a promise and timeout
 */
async function raceWithTimeout(promise, timeoutMs, timeoutMessage) {
  const timeoutPromise = createTimeout(timeoutMs, timeoutMessage || `Operation timed out after ${timeoutMs}ms`);
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    // Cancel the other promise if possible
    throw error;
  }
}

/**
 * Abortable timeout (using AbortController)
 */
function withAbortableTimeout(fn, timeoutMs = 5000) {
  return new Promise(async (resolve, reject) => {
    const abortController = new AbortController();
    const timer = setTimeout(() => {
      abortController.abort();
      reject(new Error(`Operation aborted after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      const result = await fn(abortController.signal);
      clearTimeout(timer);
      resolve(result);
    } catch (error) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        reject(new Error(`Operation aborted after ${timeoutMs}ms`));
      } else {
        reject(error);
      }
    }
  });
}

module.exports = {
  withTimeout,
  createTimeout,
  raceWithTimeout,
  withAbortableTimeout
};

