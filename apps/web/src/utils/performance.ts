/**
 * Performance optimization utilities
 * These utilities help improve UI responsiveness throughout the app
 */

/**
 * Debounce function to limit how often a function is called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize expensive computation results
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Check if code is running on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Use requestIdleCallback with fallback for better performance
 */
export function requestIdleCallbackPolyfill(callback: () => void): number {
  if (isClient && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout: 1000 });
  } else {
    return setTimeout(callback, 1);
  }
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallbackPolyfill(id: number): void {
  if (isClient && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Batch state updates for better performance
 */
export function batchUpdates(updates: (() => void)[]): void {
  if (isClient && 'requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
}
