/**
 * Error Boundary Component
 * Section 1.5: Error Handling & User Feedback
 *
 * Features:
 * - Catches React errors in component tree
 * - Displays fallback UI
 * - Logs errors for debugging
 * - Retry functionality
 * - Custom error pages
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { isApiError, ApiError } from '@/types/portfolio';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  showRetry?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================================================

/**
 * Error Boundary Component
 * Catches and handles errors in the React component tree
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <h1>Oops! {error.message}</h1>
 *     <button onClick={reset}>Try again</button>
 *   </div>
 * )}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // TODO: Send error to logging service (Sentry, LogRocket, etc.)
    // sendToErrorLogging(error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false, showRetry = true } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.reset);
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          reset={this.reset}
          showDetails={showDetails}
          showRetry={showRetry}
        />
      );
    }

    return children;
  }
}

// ============================================================================
// DEFAULT ERROR FALLBACK COMPONENT
// ============================================================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  reset: () => void;
  showDetails?: boolean;
  showRetry?: boolean;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  reset,
  showDetails = false,
  showRetry = true,
}: DefaultErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(showDetails);

  const errorType = isApiError(error) ? 'api' : 'react';
  const statusCode = isApiError(error) ? (error as ApiError).statusCode : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {statusCode ? `Error ${statusCode}` : 'Oops! Something went wrong'}
              </h1>
              <p className="text-red-100">
                {errorType === 'api'
                  ? "We're having trouble connecting to our servers"
                  : "We've encountered an unexpected error"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Error Message */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What happened?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>

          {/* Error Details (Collapsible) */}
          {(errorInfo || (isApiError(error) && (error as ApiError).details)) && (
            <div className="mb-6">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
              >
                {showErrorDetails ? 'Hide' : 'Show'} technical details
                <svg
                  className={`w-4 h-4 transition-transform ${showErrorDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showErrorDetails && (
                <div className="mt-3 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {isApiError(error) && (error as ApiError).details
                      ? JSON.stringify((error as ApiError).details, null, 2)
                      : errorInfo?.componentStack || 'No additional details available'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && (
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
            )}

            <button
              onClick={() => (window.location.href = '/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
            >
              <Home size={20} />
              Go Home
            </button>

            <button
              onClick={() => (window.location.href = '/support')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
            >
              <Mail size={20} />
              Contact Support
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Need help?
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache</li>
              <li>• If the problem persists, contact our support team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR MESSAGE COMPONENT
// ============================================================================

interface ErrorMessageProps {
  error: Error | ApiError | string | null;
  title?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * Simple error message component
 * For displaying inline errors
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   error={error}
 *   title="Failed to load data"
 *   showRetry
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorMessage({
  error,
  title = 'Error',
  showRetry = false,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string'
    ? error
    : error.message || 'An error occurred';

  const statusCode = isApiError(error) ? (error as ApiError).statusCode : undefined;

  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
            {statusCode ? `${title} (${statusCode})` : title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>

          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

interface ErrorStateProps {
  error: Error | ApiError | string;
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHome?: boolean;
}

/**
 * Full-page error state component
 * For displaying errors in place of content
 *
 * @example
 * ```tsx
 * if (error) {
 *   return <ErrorState error={error} showRetry onRetry={() => refetch()} />;
 * }
 * ```
 */
export function ErrorState({
  error,
  title,
  message,
  showRetry = true,
  onRetry,
  showHome = false,
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string'
    ? error
    : error.message || 'An error occurred';

  const statusCode = isApiError(error) ? (error as ApiError).statusCode : undefined;

  const defaultTitle = statusCode
    ? `Error ${statusCode}`
    : 'Something went wrong';

  const defaultMessage = statusCode === 404
    ? "The resource you're looking for doesn't exist"
    : statusCode === 403
    ? "You don't have permission to access this resource"
    : statusCode === 500
    ? "We're experiencing server issues. Please try again later."
    : errorMessage;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title || defaultTitle}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message || defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
          )}

          {showHome && (
            <button
              onClick={() => (window.location.href = '/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
            >
              <Home size={20} />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
