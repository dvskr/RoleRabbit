/**
 * Conflict indicator component
 * Displays when auto-save conflicts are detected
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ConflictIndicatorProps {
  conflictDetected: boolean;
  onRefresh?: () => void;
  onDismiss?: () => void;
  message?: string;
}

export const ConflictIndicator: React.FC<ConflictIndicatorProps> = ({
  conflictDetected,
  onRefresh,
  onDismiss,
  message = 'This resume was updated elsewhere. Please refresh to see the latest changes.',
}) => {
  const { colors } = useTheme();

  if (!conflictDetected) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5"
      style={{
        background: colors.badgePurpleBg,
        border: `2px solid ${colors.errorRed}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: `0 10px 25px -5px ${colors.errorRed}40`,
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle 
          size={24} 
          style={{ color: colors.errorRed }}
          className="flex-shrink-0 mt-0.5 animate-pulse"
        />
        <div className="flex-1">
          <h4 className="font-semibold mb-1" style={{ color: colors.primaryText }}>
            Conflict Detected
          </h4>
          <p className="text-sm mb-3" style={{ color: colors.secondaryText }}>
            {message}
          </p>
          <div className="flex gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: colors.primaryBlue,
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: 'transparent',
                  color: colors.tertiaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <X size={16} />
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

