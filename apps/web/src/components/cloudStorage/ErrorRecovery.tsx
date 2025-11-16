'use client';

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorRecoveryProps {
  error: string;
  onRetry: () => void | Promise<void>;
  onDismiss?: () => void;
  operation?: string;
  colors?: any;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onDismiss,
  operation = 'operation',
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className="p-4 rounded-lg border flex items-start gap-3"
      style={{
        background: palette.badgeErrorBg,
        borderColor: palette.errorRed,
      }}
    >
      <AlertCircle size={20} style={{ color: palette.errorRed }} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1" style={{ color: palette.errorRed }}>
          {operation} failed
        </p>
        <p className="text-xs mb-3" style={{ color: palette.secondaryText }}>
          {error}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            style={{
              background: palette.errorRed,
              color: 'white',
            }}
          >
            <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background: palette.inputBackground,
                border: `1px solid ${palette.border}`,
                color: palette.secondaryText,
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded transition-colors flex-shrink-0"
          style={{ color: palette.secondaryText }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

