/**
 * Timeout Handler Utility
 * Section 1.6: Handles long-running operations with timeout warnings
 */

export interface TimeoutConfig {
  warningThreshold?: number; // Time in ms before showing warning (default: 30000 = 30s)
  maxTimeout?: number; // Maximum timeout before aborting (default: 60000 = 60s)
  onWarning?: () => void;
  onTimeout?: () => void;
}

/**
 * Hook for handling long-running operations with timeout warnings
 * Shows "This is taking longer than expected..." after 30s
 */
export function useOperationTimeout(config: TimeoutConfig = {}) {
  const {
    warningThreshold = 30000, // 30 seconds
    maxTimeout = 60000, // 60 seconds
    onWarning,
    onTimeout,
  } = config;

  const [showWarning, setShowWarning] = React.useState(false);
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  const warningTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startTimer = React.useCallback(() => {
    setShowWarning(false);
    setHasTimedOut(false);

    // Warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      if (onWarning) {
        onWarning();
      }
    }, warningThreshold);

    // Timeout timer
    timeoutTimerRef.current = setTimeout(() => {
      setHasTimedOut(true);
      if (onTimeout) {
        onTimeout();
      }
    }, maxTimeout);
  }, [warningThreshold, maxTimeout, onWarning, onTimeout]);

  const clearTimer = React.useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    setShowWarning(false);
    setHasTimedOut(false);
  }, []);

  const reset = React.useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    showWarning,
    hasTimedOut,
    startTimer,
    clearTimer,
    reset,
  };
}

/**
 * Execute an async operation with timeout handling
 */
export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  config: TimeoutConfig = {}
): Promise<T> {
  const {
    warningThreshold = 30000,
    maxTimeout = 60000,
    onWarning,
    onTimeout,
  } = config;

  let warningTimer: NodeJS.Timeout | null = null;
  let timeoutTimer: NodeJS.Timeout | null = null;

  try {
    // Set up warning timer
    warningTimer = setTimeout(() => {
      if (onWarning) {
        onWarning();
      }
    }, warningThreshold);

    // Set up timeout timer
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        }
        reject(new Error('Operation timed out'));
      }, maxTimeout);
    });

    // Race between operation and timeout
    const result = await Promise.race([operation(), timeoutPromise]);

    return result;
  } finally {
    if (warningTimer) clearTimeout(warningTimer);
    if (timeoutTimer) clearTimeout(timeoutTimer);
  }
}

/**
 * Format elapsed time for display
 */
export function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Hook for tracking operation duration
 */
export function useOperationDuration() {
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [duration, setDuration] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const start = React.useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setDuration(0);

    // Update duration every second
    intervalRef.current = setInterval(() => {
      setDuration(Date.now() - now);
    }, 1000);
  }, []);

  const stop = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = React.useCallback(() => {
    stop();
    setStartTime(null);
    setDuration(0);
  }, [stop]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    duration,
    formattedDuration: formatElapsedTime(duration),
    start,
    stop,
    reset,
    isRunning: startTime !== null && intervalRef.current !== null,
  };
}

// Need to import React
import React from 'react';

export default {
  useOperationTimeout,
  executeWithTimeout,
  formatElapsedTime,
  useOperationDuration,
};
