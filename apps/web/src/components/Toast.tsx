/**
 * Toast notification component
 * Displays success/error/info messages
 */

'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { colors } = useTheme();

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'info':
        return '#eff6ff';
      default:
        return colors.background;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return colors.border;
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5 shadow-lg rounded-lg p-4 flex items-start gap-3"
      style={{
        background: getBgColor(),
        border: `2px solid ${getBorderColor()}`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: colors.primaryText }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
        style={{ color: colors.tertiaryText }}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast manager hook
export const useToasts = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, dismissToast };
};

// Toast container component
export const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

