/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorDisplay from './ErrorDisplay';
import { formatErrorForDisplay } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[]; // Array of values that trigger reset when they change
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    logger.error('React Error Boundary caught error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1
    });

    // Update state
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to monitoring service (if available)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if resetKeys change
    if (this.props.resetKeys && this.state.hasError) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Too many errors - show critical error
      if (this.state.errorCount >= 3) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">💥</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Critical Error
                  </h2>
                  <p className="text-gray-600 mb-4">
                    The application has encountered multiple errors. Please refresh the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Format error for display
      const formattedError = formatErrorForDisplay({
        message: this.state.error.message || 'A component error occurred',
        error: {
          message: this.state.error.message,
          category: 'UNKNOWN',
          retryable: true,
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support if the problem persists'
          ]
        }
      });

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-2xl w-full">
            <ErrorDisplay
              error={formattedError}
              onRetry={this.reset}
              className="shadow-lg"
            />
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Component Stack:</h3>
                <pre className="text-xs text-gray-300 overflow-auto max-h-96">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook to reset error boundary programmatically
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

export default ErrorBoundary;

