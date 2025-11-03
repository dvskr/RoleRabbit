'use client';

import React from 'react';
import { AlertTriangle, FileText, RefreshCw, Plus, X } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface DuplicateFileModalProps {
  isOpen: boolean;
  existingFileName: string;
  existingFileSize: string;
  existingFileDate: string;
  newFileName: string;
  newFileSize: string;
  onReplace: () => void;
  onKeepBoth: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export const DuplicateFileModal: React.FC<DuplicateFileModalProps> = ({
  isOpen,
  existingFileName,
  existingFileSize,
  existingFileDate,
  newFileName,
  newFileSize,
  onReplace,
  onKeepBoth,
  onSkip,
  onCancel,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: colors.badgeWarningBg }}
          >
            <AlertTriangle size={20} style={{ color: colors.badgeWarningText }} />
          </div>
          <div className="flex-1">
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: colors.primaryText }}
            >
              File Already Exists
            </h3>
            <p
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              A file with the name "<strong>{existingFileName}</strong>" already exists in this location.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded transition-colors flex-shrink-0"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* File Comparison */}
        <div className="space-y-3 mb-4">
          {/* Existing File */}
          <div
            className="p-3 rounded-lg"
            style={{ background: colors.inputBackground, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} style={{ color: colors.tertiaryText }} />
              <span className="text-xs font-medium" style={{ color: colors.tertiaryText }}>
                Existing File
              </span>
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: colors.primaryText }}>
              {existingFileName}
            </div>
            <div className="text-xs flex gap-3" style={{ color: colors.secondaryText }}>
              <span>{existingFileSize}</span>
              <span>•</span>
              <span>{new Date(existingFileDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* New File */}
          <div
            className="p-3 rounded-lg"
            style={{ background: colors.inputBackground, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} style={{ color: colors.primaryBlue }} />
              <span className="text-xs font-medium" style={{ color: colors.primaryBlue }}>
                New File
              </span>
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: colors.primaryText }}>
              {newFileName}
            </div>
            <div className="text-xs" style={{ color: colors.secondaryText }}>
              {newFileSize}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onReplace}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
            <span>Replace existing file</span>
          </button>

          <button
            onClick={onKeepBoth}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            <Plus size={16} />
            <span>Keep both files</span>
          </button>

          <button
            onClick={onSkip}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'transparent',
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.secondaryText;
            }}
          >
            Skip upload
          </button>
        </div>
      </div>
    </div>
  );
};


