/**
 * Error Boundary for Templates Component
 *
 * Catches runtime errors in template rendering and displays a fallback UI
 * Prevents entire dashboard from crashing due to template errors
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { trackErrorBoundary } from '../utils/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class TemplatesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('Templates Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      errorInfo,
    });

    // Track error in analytics
    trackErrorBoundary(error, errorInfo);

    // TODO: Log to error monitoring service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error while loading the templates.
              Don't worry, your data is safe.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-48 text-xs">
                  <p className="font-bold text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TemplatesErrorBoundary;
