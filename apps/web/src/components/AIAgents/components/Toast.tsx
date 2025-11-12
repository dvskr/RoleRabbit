import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!colors) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: colors.badgeGreenBg,
          text: colors.badgeGreenText,
          icon: CheckCircle,
        };
      case 'error':
        return {
          bg: colors.badgeRedBg,
          text: colors.badgeRedText,
          icon: AlertCircle,
        };
      case 'info':
        return {
          bg: colors.badgeBlueBg,
          text: colors.badgeBlueText,
          icon: Info,
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl min-w-[320px] max-w-md animate-slide-up"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.text}`,
      }}
    >
      <Icon size={20} style={{ color: styles.text }} />
      <p className="flex-1 text-sm font-medium" style={{ color: styles.text }}>
        {message}
      </p>
      <button
        onClick={onClose}
        className="p-1 rounded transition-opacity hover:opacity-70"
        style={{ color: styles.text }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            bottom: `${24 + index * 80}px`,
            right: '24px',
            zIndex: 100,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  );
};

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = React.useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = React.useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showInfo = React.useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast,
  };
}
