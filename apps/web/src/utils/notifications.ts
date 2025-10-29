/**
 * Notification utilities for user notifications
 */

export interface NotificationOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

export class NotificationManager {
  private notifications: NotificationOptions[] = [];
  private listeners: Set<(notifications: NotificationOptions[]) => void> = new Set();

  /**
   * Show a notification
   */
  show(options: NotificationOptions) {
    this.notifications.unshift({
      duration: 5000,
      type: 'info',
      ...options
    });

    this.notifyListeners();

    // Auto-dismiss
    if (!options.persistent && options.duration !== 0) {
      setTimeout(() => {
        this.dismiss(0);
      }, options.duration || 5000);
    }
  }

  /**
   * Dismiss a notification
   */
  dismiss(index: number) {
    this.notifications.splice(index, 1);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get notifications
   */
  getNotifications() {
    return this.notifications;
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notifications: NotificationOptions[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }
}

export const notificationManager = new NotificationManager();

/**
 * Helper functions
 */
export const showSuccess = (title: string, message: string) => {
  notificationManager.show({ title, message, type: 'success' });
};

export const showError = (title: string, message: string) => {
  notificationManager.show({ title, message, type: 'error', persistent: true });
};

export const showWarning = (title: string, message: string) => {
  notificationManager.show({ title, message, type: 'warning' });
};

export const showInfo = (title: string, message: string) => {
  notificationManager.show({ title, message, type: 'info' });
};

