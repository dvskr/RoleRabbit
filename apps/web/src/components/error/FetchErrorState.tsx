/**
 * Fetch Error State Component
 * Section 1.5: Error states for failed data fetches with retry button
 * Shows loading, error, and empty states for data fetching
 */

'use client';

import React from 'react';
import { Loader2, RefreshCw, Database, WifiOff } from 'lucide-react';
import { ErrorDisplay } from './ErrorDisplay';

interface FetchErrorStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Handles loading, error, and empty states for data fetching
 * @param isLoading - Whether data is currently being fetched
 * @param isError - Whether an error occurred
 * @param error - The error object (if any)
 * @param isEmpty - Whether the fetched data is empty
 * @param onRetry - Callback to retry the fetch
 * @param loadingMessage - Custom loading message
 * @param emptyMessage - Custom empty state message
 * @param emptyDescription - Custom empty state description
 * @param children - Content to render when data is successfully loaded
 */
export function FetchErrorState({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  onRetry,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data found',
  emptyDescription = 'There is nothing to display at the moment.',
  children,
  className = '',
}: FetchErrorStateProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
        <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
        <p className="text-gray-600 font-medium">{loadingMessage}</p>
      </div>
    );
  }

  // Error state with retry button
  if (isError && error) {
    return (
      <div className={`p-6 ${className}`}>
        <ErrorDisplay error={error} onRetry={onRetry} showDetails={false} />
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Database className="text-gray-400" size={48} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-600 mb-6 max-w-md">{emptyDescription}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        )}
      </div>
    );
  }

  // Success state - render children
  return <>{children}</>;
}

/**
 * Compact version for smaller areas (e.g., dropdowns, modals)
 */
export function CompactFetchErrorState({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  onRetry,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data',
  children,
  className = '',
}: Omit<FetchErrorStateProps, 'emptyDescription'>) {
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <Loader2 className="text-blue-500 animate-spin mr-2" size={20} />
        <span className="text-sm text-gray-600">{loadingMessage}</span>
      </div>
    );
  }

  // Error state
  if (isError && error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-start gap-2 text-sm text-red-600 mb-3">
          <WifiOff size={16} className="flex-shrink-0 mt-0.5" />
          <p className="flex-1">{error.message || 'Failed to load data'}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <p className="text-sm text-gray-500 mb-2">{emptyMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  // Success state
  return <>{children}</>;
}

/**
 * Hook for managing fetch state
 * Returns state and handlers for loading, error, and retry
 */
export function useFetchState<T = any>() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<T | null>(null);

  const execute = React.useCallback(async (fetchFn: () => Promise<T>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err: any) {
      setIsError(true);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = React.useCallback(
    (fetchFn: () => Promise<T>) => {
      return execute(fetchFn);
    },
    [execute]
  );

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    isError,
    error,
    data,
    execute,
    retry,
    reset,
    isEmpty: !isLoading && !isError && (data === null || (Array.isArray(data) && data.length === 0)),
  };
}

export default FetchErrorState;
