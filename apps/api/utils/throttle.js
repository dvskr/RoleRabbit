/**
 * Throttling Utility
 * Rate-limit function execution
 */

/**
 * Throttle function execution
 */
function throttle(func, wait) {
  let timeout;
  let previous = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      return func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        return func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Debounce function execution
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function(...args) {
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, wait);
    
    if (callNow) func.apply(this, args);
  };
}

module.exports = {
  throttle,
  debounce
};
