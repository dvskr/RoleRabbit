/**
 * Error Display Component
 * Consistent API error display with retry functionality
 * Shows user-friendly error messages with optional retry button
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { getUserFriendlyError } from '../../utils/errorMessages';

interface ErrorDisplayProps {
  error: Error | any;
  onRetry?: () => void;
  className?: string;
  variant?: 'banner' | 'card' | 'inline';
  showDetails?: boolean;
  context?: {
    action?: string;
    feature?: string;
  };
}

/**
 * Displays API errors in a consistent, user-friendly way
 * @param error - The error object to display
 * @param onRetry - Optional callback to retry the failed operation
 * @param variant - Display style: 'banner' (full width), 'card' (contained), or 'inline' (minimal)
 * @param showDetails - Whether to show technical error details (dev mode only)
 * @param context - Additional context about where/when the error occurred
 */
export function ErrorDisplay({
  error,
  onRetry,
  className = '',
  variant = 'card',
  showDetails = false,
  context,
}: ErrorDisplayProps) {
  if (!error) return null;

  const friendlyError = getUserFriendlyError(error, context);
  const canRetry = friendlyError.canRetry && onRetry;

  // Inline variant - minimal display
  if (variant === 'inline') {
    return (
      <div className={`flex items-start gap-2 text-sm text-red-600 ${className}`}>
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p>{friendlyError.message}</p>
          {canRetry && (
            <button
              onClick={onRetry}
              className="text-blue-600 hover:text-blue-700 underline mt-1"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Banner variant - full width alert
  if (variant === 'banner') {
    return (
      <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-sm text-red-800">{friendlyError.message}</p>
            {friendlyError.action && (
              <p className="text-sm text-red-700 mt-2">
                <strong>Next step:</strong> {friendlyError.action}
              </p>
            )}
            {canRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            )}
            {showDetails && process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                  Technical Details
                </summary>
                <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-32 bg-red-100 p-2 rounded">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default) - contained card with border
  return (
    <div className={`bg-white border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
          <XCircle className="text-red-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 text-lg mb-2">
            {context?.action ? `Failed to ${context.action}` : 'An error occurred'}
          </h3>
          <p className="text-gray-700 mb-3">{friendlyError.message}</p>

          {friendlyError.action && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-900">
                <strong>Recommended action:</strong> {friendlyError.action}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {canRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {showDetails && process.env.NODE_ENV === 'development' && (
            <details className="mt-4 pt-4 border-t border-gray-200">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
                Technical Details (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                <div className="text-xs">
                  <span className="font-semibold text-gray-700">Message:</span>{' '}
                  <span className="text-gray-600">{error?.message || 'No message'}</span>
                </div>
                {error?.code && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-700">Code:</span>{' '}
                    <span className="text-gray-600">{error.code}</span>
                  </div>
                )}
                {error?.statusCode && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-700">Status:</span>{' '}
                    <span className="text-gray-600">{error.statusCode}</span>
                  </div>
                )}
                <pre className="text-xs text-gray-700 overflow-auto max-h-48 bg-gray-50 p-3 rounded border border-gray-200">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact error display for forms and smaller areas
 */
export function CompactErrorDisplay({
  error,
  onRetry,
  className = '',
}: Omit<ErrorDisplayProps, 'variant'>) {
  return <ErrorDisplay error={error} onRetry={onRetry} variant="inline" className={className} />;
}

/**
 * Banner error display for page-level errors
 */
export function BannerErrorDisplay({
  error,
  onRetry,
  className = '',
  showDetails = false,
}: Omit<ErrorDisplayProps, 'variant'>) {
  return (
    <ErrorDisplay
      error={error}
      onRetry={onRetry}
      variant="banner"
      showDetails={showDetails}
      className={className}
    />
  );
}

export default ErrorDisplay;
