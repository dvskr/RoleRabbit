'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * FE-036: Error boundary around CloudStorage component
 */
export class CloudStorageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CloudStorage Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service (if available)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] p-6"
      style={{ background: colors.background }}
    >
      <div
        className="max-w-md w-full p-6 rounded-lg border"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeErrorBg }}
          >
            <AlertTriangle size={24} style={{ color: colors.errorRed }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
              Something went wrong
            </h3>
            <p className="text-sm" style={{ color: colors.secondaryText }}>
              An error occurred in the file manager
            </p>
          </div>
        </div>

        {error && (
          <div
            className="p-3 rounded mb-4 text-xs font-mono overflow-auto max-h-32"
            style={{
              background: colors.inputBackground,
              color: colors.errorRed,
            }}
          >
            {error.message || 'Unknown error'}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
          >
            <Home size={16} />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

