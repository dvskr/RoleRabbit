import { useState, useEffect, useRef } from 'react';

interface UseIdleOptions {
  timeout?: number;
  events?: string[];
}

export function useIdle(options: UseIdleOptions = {}) {
  const { timeout = 300000, events = ['mousemove', 'keydown', 'scroll'] } = options;
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimer = () => {
      setIsIdle(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, timeout);
    };

    // Set up event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout, events]);

  return isIdle;
}

