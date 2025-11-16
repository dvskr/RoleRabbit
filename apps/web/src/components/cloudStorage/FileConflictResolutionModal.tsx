'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Clock, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime } from '../../utils/formatters';

interface FileConflict {
  fileId: string;
  fileName: string;
  localVersion: {
    modifiedAt: string;
    modifiedBy: string;
    size: number;
  };
  serverVersion: {
    modifiedAt: string;
    modifiedBy: string;
    size: number;
  };
}

interface FileConflictResolutionModalProps {
  isOpen: boolean;
  conflict: FileConflict | null;
  onResolve: (action: 'keep-local' | 'keep-server' | 'keep-both') => void;
  onClose: () => void;
}

export const FileConflictResolutionModal: React.FC<FileConflictResolutionModalProps> = ({
  isOpen,
  conflict,
  onResolve,
  onClose,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [selectedAction, setSelectedAction] = useState<'keep-local' | 'keep-server' | 'keep-both' | null>(null);

  if (!isOpen || !conflict) return null;

  const handleResolve = () => {
    if (selectedAction) {
      onResolve(selectedAction);
      setSelectedAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-full max-w-2xl"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgeWarningBg }}
            >
              <AlertTriangle size={20} style={{ color: colors.badgeWarningText }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                File Conflict Detected
              </h2>
              <p className="text-xs mt-0.5" style={{ color: colors.secondaryText }}>
                This file was modified by another user
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close conflict modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: colors.primaryText }} />
            <span className="font-medium" style={{ color: colors.primaryText }}>
              {conflict.fileName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Local Version */}
            <div
              className="p-4 rounded-lg border"
              style={{
                background: colors.inputBackground,
                borderColor: selectedAction === 'keep-local' ? colors.primaryBlue : colors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: colors.primaryBlue }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
                  Your Version
                </span>
              </div>
              <div className="space-y-2 text-xs" style={{ color: colors.secondaryText }}>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Modified {formatRelativeTime(conflict.localVersion.modifiedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={12} />
                  <span>By {conflict.localVersion.modifiedBy}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAction('keep-local')}
                className="mt-3 w-full px-3 py-2 rounded text-xs font-medium transition-colors"
                style={{
                  background: selectedAction === 'keep-local' ? colors.primaryBlue : colors.cardBackground,
                  color: selectedAction === 'keep-local' ? 'white' : colors.primaryText,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Keep This Version
              </button>
            </div>

            {/* Server Version */}
            <div
              className="p-4 rounded-lg border"
              style={{
                background: colors.inputBackground,
                borderColor: selectedAction === 'keep-server' ? colors.primaryBlue : colors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: colors.badgeWarningText }} />
                <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
                  Server Version
                </span>
              </div>
              <div className="space-y-2 text-xs" style={{ color: colors.secondaryText }}>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Modified {formatRelativeTime(conflict.serverVersion.modifiedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={12} />
                  <span>By {conflict.serverVersion.modifiedBy}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAction('keep-server')}
                className="mt-3 w-full px-3 py-2 rounded text-xs font-medium transition-colors"
                style={{
                  background: selectedAction === 'keep-server' ? colors.primaryBlue : colors.cardBackground,
                  color: selectedAction === 'keep-server' ? 'white' : colors.primaryText,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Keep This Version
              </button>
            </div>
          </div>

          {/* Keep Both Option */}
          <button
            onClick={() => setSelectedAction('keep-both')}
            className="mt-4 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: selectedAction === 'keep-both' ? colors.primaryBlue : colors.inputBackground,
              color: selectedAction === 'keep-both' ? 'white' : colors.primaryText,
              border: `1px solid ${colors.border}`,
            }}
          >
            Keep Both Versions (rename one)
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={!selectedAction}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background: selectedAction ? colors.primaryBlue : colors.inputBackground,
              color: selectedAction ? 'white' : colors.tertiaryText,
            }}
          >
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
};

