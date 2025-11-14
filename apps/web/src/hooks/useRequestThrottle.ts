/**
 * Request Throttling Hook
 * Prevents button spam and ensures only one request at a time
 */

import { useState, useRef, useCallback } from 'react';

interface ThrottleOptions {
  minDelay?: number; // Minimum time between requests (ms)
  maxConcurrent?: number; // Maximum concurrent requests
}

interface ThrottleState {
  isProcessing: boolean;
  lastRequestTime: number;
  activeRequests: number;
}

/**
 * Hook to throttle requests and prevent spam
 * @param options Throttle configuration
 * @returns Throttled request handler
 */
export function useRequestThrottle(options: ThrottleOptions = {}) {
  const {
    minDelay = 1000, // 1 second minimum between requests
    maxConcurrent = 1 // Only 1 request at a time by default
  } = options;

  const [state, setState] = useState<ThrottleState>({
    isProcessing: false,
    lastRequestTime: 0,
    activeRequests: 0
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Execute a throttled request
   * @param fn Async function to execute
   * @returns Result of the function or null if throttled
   */
  const throttledRequest = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      const now = Date.now();
      const timeSinceLastRequest = now - stateRef.current.lastRequestTime;

      // Check if too soon since last request
      if (timeSinceLastRequest < minDelay) {
        console.warn(
          `[THROTTLE] Request blocked: Too soon (${timeSinceLastRequest}ms < ${minDelay}ms)`
        );
        return null;
      }

      // Check if too many concurrent requests
      if (stateRef.current.activeRequests >= maxConcurrent) {
        console.warn(
          `[THROTTLE] Request blocked: Too many concurrent requests (${stateRef.current.activeRequests}/${maxConcurrent})`
        );
        return null;
      }

      // Update state
      setState(prev => ({
        ...prev,
        isProcessing: true,
        lastRequestTime: now,
        activeRequests: prev.activeRequests + 1
      }));

      try {
        const result = await fn();
        return result;
      } finally {
        // Always decrement active requests
        setState(prev => ({
          ...prev,
          isProcessing: prev.activeRequests <= 1 ? false : true,
          activeRequests: Math.max(0, prev.activeRequests - 1)
        }));
      }
    },
    [minDelay, maxConcurrent]
  );

  /**
   * Check if a request can be made
   */
  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - stateRef.current.lastRequestTime;
    
    return (
      timeSinceLastRequest >= minDelay &&
      stateRef.current.activeRequests < maxConcurrent
    );
  }, [minDelay, maxConcurrent]);

  /**
   * Reset throttle state (useful for cleanup)
   */
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      lastRequestTime: 0,
      activeRequests: 0
    });
  }, []);

  return {
    throttledRequest,
    canMakeRequest,
    isProcessing: state.isProcessing,
    activeRequests: state.activeRequests,
    reset
  };
}

/**
 * Simple debounce hook
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Hook to prevent rapid button clicks
 * @param delay Minimum time between clicks (ms)
 * @returns Click handler and disabled state
 */
export function useClickThrottle(delay: number = 1000) {
  const [isThrottled, setIsThrottled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledClick = useCallback(
    (callback: () => void) => {
      if (isThrottled) {
        console.warn('[THROTTLE] Click ignored: Button is throttled');
        return;
      }

      // Execute callback
      callback();

      // Set throttled state
      setIsThrottled(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset after delay
      timeoutRef.current = setTimeout(() => {
        setIsThrottled(false);
      }, delay);
    },
    [isThrottled, delay]
  );

  return {
    throttledClick,
    isThrottled
  };
}

