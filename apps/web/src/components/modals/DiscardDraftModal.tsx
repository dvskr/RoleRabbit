'use client';

import React from 'react';
import { X, AlertTriangle, FileX, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DiscardDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changeCount?: number;
}

/**
 * DiscardDraftModal Component
 * 
 * Confirmation modal for discarding draft changes
 * Shows warning and diff summary before discarding
 */
export default function DiscardDraftModal({
  isOpen,
  onClose,
  onConfirm,
  changeCount = 0,
}: DiscardDraftModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="discard-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-xl shadow-2xl p-6 space-y-6"
        style={{
          background: colors.background,
          color: colors.primaryText,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              }}
            >
              <AlertTriangle size={24} style={{ color: '#dc2626' }} />
            </div>
            <h3 id="discard-modal-title" className="text-xl font-bold">
              Discard Draft?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: colors.secondaryText }}
            aria-label="Close discard draft modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning Message */}
        <div className="space-y-4">
          <div
            className="p-4 rounded-lg border"
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderColor: '#fbbf24',
            }}
          >
            <p className="text-sm font-medium" style={{ color: '#92400e' }}>
              ⚠️ This action cannot be undone
            </p>
            <p className="text-xs mt-2" style={{ color: '#78350f' }}>
              Your draft changes will be permanently deleted and your resume will revert to the last saved base version.
            </p>
          </div>

          {/* Change Summary */}
          {changeCount > 0 && (
            <div
              className="p-3 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
                Changes to be discarded:
              </p>
              <div className="flex items-center gap-2">
                <FileX size={16} style={{ color: colors.errorRed }} />
                <span className="text-sm" style={{ color: colors.secondaryText }}>
                  {changeCount} {changeCount === 1 ? 'change' : 'changes'} will be lost
                </span>
              </div>
            </div>
          )}

          {/* What Happens */}
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: colors.secondaryText }}>
              What happens next:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <RotateCcw size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.activeBlueText }} />
                <span className="text-xs" style={{ color: colors.tertiaryText }}>
                  Resume reverts to last saved base version
                </span>
              </div>
              <div className="flex items-start gap-2">
                <FileX size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.errorRed }} />
                <span className="text-xs" style={{ color: colors.tertiaryText }}>
                  All draft changes are permanently deleted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: colors.inputBackground,
              color: colors.primaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            Keep Draft
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
            }}
          >
            <FileX size={16} />
            Discard Draft
          </button>
        </div>
      </div>
    </div>
  );
}

