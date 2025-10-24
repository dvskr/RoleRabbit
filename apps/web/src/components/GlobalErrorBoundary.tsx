import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'feature';
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    
    // Send to error reporting service
    this.reportError(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
      retryCount: this.retryCount
    };

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorReport });
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(console.error);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const bugReport = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Open bug report modal or redirect to support
    console.log('Bug report:', bugReport);
    // Implement bug reporting logic
  };

  private handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Different UI based on error level
      const isPageLevel = this.props.level === 'page';
      const isComponentLevel = this.props.level === 'component';

      if (isPageLevel) {
        return this.renderPageError();
      } else if (isComponentLevel) {
        return this.renderComponentError();
      } else {
        return this.renderFeatureError();
      }
    }

    return this.props.children;
  }

  private renderPageError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-8">
            We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
          </p>

          {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-4">
                Error Details (Development)
              </summary>
              <div className="p-4 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-60">
                <div className="mb-3">
                  <strong>Error ID:</strong> {this.state.errorId}
                </div>
                <div className="mb-3">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div className="mb-3">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {this.retryCount < this.maxRetries && (
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again ({this.maxRetries - this.retryCount} attempts left)
              </button>
            )}
            
            <button
              onClick={this.handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>

            <button
              onClick={this.handleReportBug}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Bug className="w-4 h-4" />
              Report Bug
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            <p>Error ID: {this.state.errorId}</p>
            <p>If this problem persists, please contact support with this error ID.</p>
          </div>
        </div>
      </div>
    );
  }

  private renderComponentError() {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Component Error
            </h3>
            <p className="text-sm text-red-700 mb-3">
              This component encountered an error and couldn't render properly.
            </p>
            <div className="flex gap-2">
              <button
                onClick={this.handleRetry}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={this.handleDismiss}
                className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={this.handleDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  private renderFeatureError() {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            This feature is temporarily unavailable
          </span>
          <button
            onClick={this.handleRetry}
            className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors ml-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error, context?: string) => {
    setError(error);
    console.error(`Error caught by useErrorHandler${context ? ` in ${context}` : ''}:`, error);
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { tags: { context } });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, clearError };
};

// Hook for async error handling
export const useAsyncError = () => {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

export default GlobalErrorBoundary;
