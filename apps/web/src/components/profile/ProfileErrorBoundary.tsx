'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Profile component
 * Catches React errors and displays a user-friendly error message
 */
export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Profile Error Boundary caught an error:', error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
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

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-8"
      style={{ background: colors.background }}
    >
      <div 
        className="max-w-md w-full p-8 rounded-2xl shadow-lg"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="flex items-center justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: colors.badgeErrorBg }}
          >
            <AlertCircle size={32} style={{ color: colors.errorRed }} />
          </div>
        </div>
        
        <h2 
          className="text-2xl font-bold text-center mb-4"
          style={{ color: colors.primaryText }}
        >
          Something went wrong
        </h2>
        
        <p 
          className="text-center mb-6"
          style={{ color: colors.secondaryText }}
        >
          We encountered an error while loading your profile. Please try refreshing the page or go back to the dashboard.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details 
            className="mb-6 p-4 rounded-lg"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`
            }}
          >
            <summary 
              className="cursor-pointer text-sm font-semibold mb-2"
              style={{ color: colors.errorRed }}
            >
              Error Details (Development Only)
            </summary>
            <pre 
              className="text-xs overflow-auto"
              style={{ color: colors.errorRed }}
            >
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: colors.primaryBlue,
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: colors.inputBackground,
              color: colors.primaryText,
              border: `1px solid ${colors.border}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            <Home size={18} />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileErrorBoundary;

