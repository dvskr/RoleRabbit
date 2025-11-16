/**
 * Toaster Component
 * Displays toast notifications using Radix UI Toast
 * Listens to toast service and renders notifications
 * Section 1.8 requirement #5: role="alert" for error messages
 * Section 1.8 requirement #6: role="status" for success messages
 * Section 1.8 requirement #1: aria-label on close button
 */

'use client';

import React, { useEffect, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast as toastService, ToastMessage, ToastType } from '../../utils/toast';

/**
 * Individual toast notification
 */
function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} className="text-green-600" />,
    error: <XCircle size={20} className="text-red-600" />,
    warning: <AlertCircle size={20} className="text-yellow-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const titleStyles: Record<ToastType, string> = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  };

  const descriptionStyles: Record<ToastType, string> = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700',
  };

  return (
    <Toast.Root
      className={`${styles[toast.type]} border rounded-lg shadow-lg p-4 flex items-start gap-3 mb-4 animate-in slide-in-from-right-full duration-300`}
      duration={toast.duration}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <Toast.Title className={`font-semibold ${titleStyles[toast.type]}`}>
          {toast.title}
        </Toast.Title>
        {toast.description && (
          <Toast.Description className={`text-sm mt-1 ${descriptionStyles[toast.type]}`}>
            {toast.description}
          </Toast.Description>
        )}
      </div>

      <Toast.Close
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} className="text-gray-600" />
      </Toast.Close>
    </Toast.Root>
  );
}

/**
 * Toaster container - manages and displays all active toasts
 */
export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Subscribe to toast service
    const unsubscribe = toastService.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 5000);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}

      <Toast.Viewport className="fixed top-0 right-0 p-6 flex flex-col gap-2 w-full max-w-md z-50" />
    </Toast.Provider>
  );
}

export default Toaster;
