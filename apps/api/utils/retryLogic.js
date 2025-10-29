/**
 * Retry Logic Utility
 * Implements exponential backoff retry mechanism
 */

const logger = require('./logger');

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(
  fn,
  options = {}
) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    shouldRetry = () => true
  } = options;
  
  let attempt = 0;
  let delay = initialDelay;
  
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      logger.warn(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);
      
      await sleep(Math.min(delay, maxDelay));
      delay *= factor;
    }
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  retryWithBackoff,
  sleep
};
