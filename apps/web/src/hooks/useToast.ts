import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '../components/common/ToastNotification';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    options?: {
      message?: string;
      action?: { label: string; onClick: () => void };
      duration?: number;
    }
  ) => {
    const id = `toast-${++toastIdCounter}`;
    
    const newToast: Toast = {
      id,
      type,
      title,
      message: options?.message,
      action: options?.action,
      duration: options?.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, options?: Parameters<typeof showToast>[2]) => {
    return showToast('success', title, options);
  }, [showToast]);

  const error = useCallback((title: string, options?: Parameters<typeof showToast>[2]) => {
    return showToast('error', title, options);
  }, [showToast]);

  const warning = useCallback((title: string, options?: Parameters<typeof showToast>[2]) => {
    return showToast('warning', title, options);
  }, [showToast]);

  const info = useCallback((title: string, options?: Parameters<typeof showToast>[2]) => {
    return showToast('info', title, options);
  }, [showToast]);

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    success,
    error,
    warning,
    info
  };
}
