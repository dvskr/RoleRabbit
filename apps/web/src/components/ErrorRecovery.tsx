import React, { useState, useCallback } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';

interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
  onDismiss?: () => void;
  context?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onDismiss,
  context = 'unknown',
  maxRetries = 3,
  retryDelay = 1000
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Add delay before retry
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, isRetrying, onRetry, retryDelay]);

  const canRetry = retryCount < maxRetries && !isRetrying;
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch');

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            {isNetworkError ? 'Connection Error' : 'Something went wrong'}
          </h3>
          
          <p className="text-sm text-red-700 mb-3">
            {isNetworkError 
              ? 'Unable to connect to the server. Please check your internet connection.'
              : error.message || 'An unexpected error occurred.'
            }
          </p>

          {context && (
            <p className="text-xs text-red-600 mb-3">
              Context: {context}
            </p>
          )}

          <div className="flex items-center gap-2 mb-3">
            {/* Online status indicator */}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-xs text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Retry count indicator */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">
                Attempts: {retryCount}/{maxRetries}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {canRetry && (
              <button
                onClick={handleRetry}
                disabled={!isOnline}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </>
                )}
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>

          {retryCount >= maxRetries && (
            <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
              Maximum retry attempts reached. Please refresh the page or contact support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Network status indicator
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      showStatus ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Connection restored</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
};

// Error boundary fallback with recovery options
export const ErrorRecoveryFallback: React.FC<{
  error: Error;
  resetError: () => void;
  context?: string;
}> = ({ error, resetError, context }) => {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecover = useCallback(async () => {
    setIsRecovering(true);
    
    try {
      // Attempt recovery strategies
      await Promise.all([
        // Clear localStorage if needed
        localStorage.removeItem('corrupted-data'),
        
        // Reset application state
        resetError(),
        
        // Wait a bit
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    } finally {
      setIsRecovering(false);
    }
  }, [resetError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Application Error
        </h1>
        
        <p className="text-gray-600 mb-6">
          The application encountered an error and needs to be recovered.
        </p>

        {context && (
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-700">
            <strong>Context:</strong> {context}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRecover}
            disabled={isRecovering}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isRecovering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recovering...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Recover Application
              </>
            )}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reload Page
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>If the problem persists, please contact support.</p>
          <p className="mt-1">Error: {error.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorRecovery;
