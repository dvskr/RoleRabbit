/**
 * Toast Notification Service
 * Provides simple API for showing success and error toast notifications
 * Uses event emitter pattern to communicate with Toaster component
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

type ToastListener = (toast: ToastMessage) => void;

class ToastService {
  private listeners: Set<ToastListener> = new Set();
  private toastCounter = 0;

  /**
   * Subscribe to toast events
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit a toast notification
   */
  private emit(toast: Omit<ToastMessage, 'id'>): void {
    const toastWithId: ToastMessage = {
      ...toast,
      id: `toast-${++this.toastCounter}-${Date.now()}`,
    };

    this.listeners.forEach(listener => listener(toastWithId));
  }

  /**
   * Show success toast
   */
  success(title: string, description?: string, duration?: number): void {
    this.emit({
      type: 'success',
      title,
      description,
      duration: duration || 5000,
    });
  }

  /**
   * Show error toast
   */
  error(title: string, description?: string, duration?: number): void {
    this.emit({
      type: 'error',
      title,
      description,
      duration: duration || 7000, // Longer for errors so users can read
    });
  }

  /**
   * Show info toast
   */
  info(title: string, description?: string, duration?: number): void {
    this.emit({
      type: 'info',
      title,
      description,
      duration: duration || 5000,
    });
  }

  /**
   * Show warning toast
   */
  warning(title: string, description?: string, duration?: number): void {
    this.emit({
      type: 'warning',
      title,
      description,
      duration: duration || 6000,
    });
  }
}

// Export singleton instance
export const toast = new ToastService();

// Portfolio-specific toast helpers (Section 1.5 requirement)
export const portfolioToasts = {
  created: () => toast.success('Portfolio created', 'Your portfolio has been successfully created.'),
  updated: () => toast.success('Portfolio updated', 'Your changes have been saved.'),
  published: () => toast.success('Portfolio published', 'Your portfolio is now live!'),
  unpublished: () => toast.success('Portfolio unpublished', 'Your portfolio has been taken offline.'),
  deleted: () => toast.success('Portfolio deleted', 'Portfolio has been removed.'),

  createFailed: (error?: string) =>
    toast.error('Failed to create portfolio', error || 'Please try again.'),
  updateFailed: (error?: string) =>
    toast.error('Failed to update portfolio', error || 'Please try again.'),
  publishFailed: (error?: string) =>
    toast.error('Failed to publish portfolio', error || 'Please try again.'),
  deleteFailed: (error?: string) =>
    toast.error('Failed to delete portfolio', error || 'Please try again.'),
  loadFailed: (error?: string) =>
    toast.error('Failed to load portfolio', error || 'Please refresh the page.'),
};

export default toast;
