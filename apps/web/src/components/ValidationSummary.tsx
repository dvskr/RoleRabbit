'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ValidationSummaryProps {
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  onClose: () => void;
  onJumpToField?: (field: string) => void;
}

/**
 * ValidationSummary Component
 * 
 * Displays a summary of validation errors at the top of the page
 * Allows users to click errors to jump to the problematic field
 */
export function ValidationSummary({
  errors,
  warnings = {},
  onClose,
  onJumpToField,
}: ValidationSummaryProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const errorCount = Object.keys(errors).length;
  const warningCount = Object.keys(warnings).length;

  if (errorCount === 0 && warningCount === 0) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-top duration-300"
      style={{
        background: errorCount > 0 ? '#fef2f2' : '#fef3c7',
        border: `2px solid ${errorCount > 0 ? '#fca5a5' : '#fbbf24'}`,
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle
              size={20}
              style={{ color: errorCount > 0 ? '#dc2626' : '#f59e0b' }}
            />
            <h4
              className="font-semibold"
              style={{ color: errorCount > 0 ? '#991b1b' : '#92400e' }}
            >
              {errorCount > 0
                ? `You have ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`
                : `You have ${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}`}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            style={{ color: errorCount > 0 ? '#991b1b' : '#92400e' }}
            aria-label="Close validation summary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Errors List */}
        {errorCount > 0 && (
          <ul className="space-y-1 mb-2">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                {onJumpToField ? (
                  <button
                    onClick={() => onJumpToField(field)}
                    className="text-sm hover:underline text-left w-full"
                    style={{ color: '#7f1d1d' }}
                  >
                    • {error}
                  </button>
                ) : (
                  <span className="text-sm" style={{ color: '#7f1d1d' }}>
                    • {error}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Warnings List */}
        {warningCount > 0 && errorCount === 0 && (
          <ul className="space-y-1">
            {Object.entries(warnings).map(([field, warning]) => (
              <li key={field}>
                {onJumpToField ? (
                  <button
                    onClick={() => onJumpToField(field)}
                    className="text-sm hover:underline text-left w-full"
                    style={{ color: '#78350f' }}
                  >
                    • {warning}
                  </button>
                ) : (
                  <span className="text-sm" style={{ color: '#78350f' }}>
                    • {warning}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Help Text */}
        <p className="text-xs mt-3" style={{ color: errorCount > 0 ? '#7f1d1d' : '#78350f' }}>
          {errorCount > 0
            ? 'Please fix these errors before saving your resume.'
            : 'These warnings are optional but recommended to review.'}
        </p>
      </div>
    </div>
  );
}

