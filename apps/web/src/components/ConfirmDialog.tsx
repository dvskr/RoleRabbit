/**
 * Confirmation dialog component
 * Reusable confirmation dialog for delete operations and other confirmations
 */

'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}) => {
  const { colors } = useTheme();

  if (!isOpen) return null;

  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: '#fef2f2',
          border: colors.errorRed,
          icon: colors.errorRed,
          button: colors.errorRed,
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#f59e0b',
          icon: '#f59e0b',
          button: '#f59e0b',
        };
      default:
        return {
          bg: '#eff6ff',
          border: colors.primaryBlue,
          icon: colors.primaryBlue,
          button: colors.primaryBlue,
        };
    }
  };

  const typeColors = getTypeColors();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
        style={{
          background: typeColors.bg,
          border: `2px solid ${typeColors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="flex items-start gap-4 mb-4">
          <AlertTriangle size={24} style={{ color: typeColors.icon }} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-lg font-semibold mb-2" style={{ color: colors.primaryText }}>
              {title}
            </h3>
            <p id="confirm-dialog-message" className="text-sm" style={{ color: colors.secondaryText }}>
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} style={{ color: colors.tertiaryText }} />
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'transparent',
              color: colors.tertiaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{
              background: typeColors.button,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

