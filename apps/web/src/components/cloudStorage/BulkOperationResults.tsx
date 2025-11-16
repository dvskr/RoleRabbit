'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface BulkOperationResult {
  fileId: string;
  fileName: string;
  success: boolean;
  error?: string;
}

interface BulkOperationResultsProps {
  results: BulkOperationResult[];
  operation: string;
  onDismiss?: () => void;
  colors?: any;
}

/**
 * FE-038: Partial failure handling for bulk operations
 */
export const BulkOperationResults: React.FC<BulkOperationResultsProps> = ({
  results,
  operation,
  onDismiss,
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const hasFailures = failureCount > 0;

  if (results.length === 0) return null;

  return (
    <div
      className="p-4 rounded-lg border mb-4"
      style={{
        background: hasFailures ? palette.badgeWarningBg : palette.badgeSuccessBg,
        borderColor: hasFailures ? palette.badgeWarningText : palette.badgeSuccessText,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {hasFailures ? (
            <AlertCircle size={20} style={{ color: palette.badgeWarningText }} />
          ) : (
            <CheckCircle size={20} style={{ color: palette.badgeSuccessText }} />
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: palette.primaryText }}>
              {operation} completed
            </p>
            <p className="text-xs" style={{ color: palette.secondaryText }}>
              {successCount} succeeded{hasFailures ? `, ${failureCount} failed` : ''}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded transition-colors"
            style={{ color: palette.secondaryText }}
          >
            <XCircle size={16} />
          </button>
        )}
      </div>

      {hasFailures && (
        <div className="space-y-2 mt-3">
          <p className="text-xs font-medium" style={{ color: palette.primaryText }}>
            Failed files:
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {results.filter(r => !r.success).map((result) => (
              <div
                key={result.fileId}
                className="flex items-center gap-2 p-2 rounded text-xs"
                style={{ background: palette.inputBackground }}
              >
                <XCircle size={14} style={{ color: palette.errorRed }} />
                <span className="flex-1 truncate" style={{ color: palette.primaryText }}>
                  {result.fileName}
                </span>
                {result.error && (
                  <span className="text-xs" style={{ color: palette.errorRed }}>
                    {result.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

