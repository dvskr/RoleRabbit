import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to manage timeouts
 * 
 * @param callback - Callback function
 * @param delay - Delay in milliseconds
 * @returns [clear function, reset function]
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    if (delay === null) return;
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { clear, reset };
}
