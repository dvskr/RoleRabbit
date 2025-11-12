/**
 * Error Display Component
 * Shows user-friendly error messages with recovery actions
 */

import React from 'react';
import { AlertCircle, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FormattedError } from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: FormattedError;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
  className?: string;
}

export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  compact = false,
  className = ''
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Wait a bit before re-enabling button
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-700 flex-1">{error.message}</span>
        {error.showRetry && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-red-200 bg-red-50 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-red-200 bg-red-100">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{error.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">{error.title}</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {error.suggestions && error.suggestions.length > 0 && (
        <div className="p-4 bg-white">
          <h4 className="text-sm font-medium text-gray-900 mb-2">What you can do:</h4>
          <ul className="space-y-1.5">
            {error.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 bg-red-50 border-t border-red-200 flex items-center gap-3">
        {error.showRetry && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
        
        {error.technicalDetails && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        )}
      </div>

      {/* Technical Details (collapsed) */}
      {showDetails && error.technicalDetails && (
        <div className="p-4 bg-gray-900 border-t border-red-200">
          <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
            {error.technicalDetails}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Inline error message (for forms)
 */
export function InlineError({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-red-600 text-sm mt-1 ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Toast error message
 */
export function ErrorToast({ 
  error, 
  onDismiss,
  autoClose = true,
  duration = 6000
}: { 
  error: FormattedError;
  onDismiss?: () => void;
  autoClose?: boolean;
  duration?: number;
}) {
  React.useEffect(() => {
    if (autoClose && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);

  return (
    <div className="min-w-[320px] max-w-md rounded-lg shadow-lg border-2 border-red-200 bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-xl flex-shrink-0">{error.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">{error.title}</h4>
            <p className="text-sm text-gray-700 mt-1">{error.message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {autoClose && (
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-red-500 transition-all ease-linear"
            style={{ 
              width: '100%',
              animation: `shrink ${duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  );
}

// Add animation for progress bar
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;
  document.head.appendChild(style);
}

