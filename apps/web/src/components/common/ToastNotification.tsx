'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // milliseconds, 0 = no auto-dismiss
}

export interface ToastNotificationProps extends Toast {
  onDismiss: (id: string) => void;
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const TOAST_COLORS = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700'
  }
};

export function ToastNotification({
  id,
  type,
  title,
  message,
  action,
  duration = 5000,
  onDismiss
}: ToastNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = TOAST_ICONS[type];
  const colors = TOAST_COLORS[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        max-w-sm w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${colors.title} text-sm`}>
            {title}
          </h4>
          {message && (
            <p className={`mt-1 text-sm ${colors.message}`}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleDismiss();
              }}
              className={`mt-2 text-sm font-medium ${colors.icon} hover:underline focus:outline-none`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Container
export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const POSITION_CLASSES = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4'
};

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'bottom-right'
}: ToastContainerProps) {
  return (
    <div 
      className={`fixed ${POSITION_CLASSES[position]} z-50 space-y-2 pointer-events-none`}
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification
            {...toast}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}

