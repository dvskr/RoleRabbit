/**
 * Cancellable Operation Component
 * Provides UI for cancelling long-running operations (LLM, file processing, etc.)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CancellableOperationProps {
  isRunning: boolean;
  onCancel: () => void;
  operationName?: string;
  progress?: number; // 0-100
  estimatedTime?: number; // in seconds
  className?: string;
}

export const CancellableOperation: React.FC<CancellableOperationProps> = ({
  isRunning,
  onCancel,
  operationName = 'Operation',
  progress,
  estimatedTime,
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);

      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  if (!isRunning) {
    return null;
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Spinner */}
        <div className="flex-shrink-0">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {operationName} in progress...
          </p>
          
          {/* Progress bar */}
          {typeof progress === 'number' && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{Math.round(progress)}%</span>
                {estimatedTime && (
                  <span>~{formatTime(estimatedTime - elapsedTime)} remaining</span>
                )}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Elapsed time */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Elapsed: {formatTime(elapsedTime)}
          </p>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Cancel operation"
          title="Cancel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ============================================
// HOOK FOR CANCELLABLE OPERATIONS
// ============================================

interface UseCancellableOperationOptions {
  onCancel?: () => void;
  autoCloseOnComplete?: boolean;
  autoCloseDelay?: number; // in ms
}

export function useCancellableOperation(options: UseCancellableOperationOptions = {}) {
  const { onCancel, autoCloseOnComplete = true, autoCloseDelay = 2000 } = options;
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operationName, setOperationName] = useState('Operation');
  const abortControllerRef = useRef<AbortController | null>(null);

  const start = (name?: string) => {
    setIsRunning(true);
    setProgress(0);
    if (name) setOperationName(name);
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
  };

  const updateProgress = (value: number) => {
    setProgress(value);
  };

  const cancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsRunning(false);
    setProgress(0);
    
    if (onCancel) {
      onCancel();
    }
  };

  const complete = () => {
    setProgress(100);
    
    if (autoCloseOnComplete) {
      setTimeout(() => {
        setIsRunning(false);
        setProgress(0);
      }, autoCloseDelay);
    } else {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const getSignal = () => {
    return abortControllerRef.current?.signal;
  };

  return {
    isRunning,
    progress,
    operationName,
    start,
    updateProgress,
    cancel,
    complete,
    getSignal
  };
}

// ============================================
// EXPORTS
// ============================================

export default CancellableOperation;



