import React from 'react';

// Global error handling service
class ErrorHandlerService {
  private errorQueue: Array<{
    id: string;
    error: Error;
    context: string;
    timestamp: Date;
    userAgent: string;
    url: string;
    userId?: string;
  }> = [];

  private maxQueueSize = 100;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupEventListeners();
    this.setupUnhandledErrorHandlers();
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.flushErrorQueue();
      }
    });
  }

  private setupUnhandledErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
      this.captureError(error, 'unhandled-promise-rejection');
      event.preventDefault(); // Prevent default browser behavior
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      const error = new Error(`Uncaught Error: ${event.message}`);
      error.stack = event.error?.stack;
      this.captureError(error, 'uncaught-error');
    });
  }

  public captureError(error: Error, context: string = 'unknown', userId?: string) {
    const errorId = this.generateErrorId();
    
    const errorData = {
      id: errorId,
      error,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId
    };

    // Add to queue
    this.errorQueue.push(errorData);

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Try to send immediately if online
    if (this.isOnline) {
      this.sendError(errorData);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}] Error captured:`, error);
    }

    return errorId;
  }

  private async sendError(errorData: any) {
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...errorData,
          error: {
            message: errorData.error.message,
            stack: errorData.error.stack,
            name: errorData.error.name
          }
        })
      });

      if (response.ok) {
        // Remove from queue on successful send
        this.errorQueue = this.errorQueue.filter(e => e.id !== errorData.id);
      }
    } catch (error) {
      console.error('Failed to send error to server:', error);
    }
  }

  private async flushErrorQueue() {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const errorsToSend = [...this.errorQueue];
    
    for (const errorData of errorsToSend) {
      await this.sendError(errorData);
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getErrorStats() {
    return {
      queueSize: this.errorQueue.length,
      isOnline: this.isOnline,
      totalErrors: this.errorQueue.length
    };
  }

  public clearErrorQueue() {
    this.errorQueue = [];
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandlerService();

// Utility functions for common error scenarios
export const captureAsyncError = (error: Error, context: string, userId?: string) => {
  return errorHandler.captureError(error, context, userId);
};

export const captureNetworkError = (error: Error, url: string, method: string) => {
  return errorHandler.captureError(error, `network-${method.toLowerCase()}`, undefined);
};

export const captureValidationError = (error: Error, field: string) => {
  return errorHandler.captureError(error, `validation-${field}`, undefined);
};

export const captureAuthError = (error: Error, action: string) => {
  return errorHandler.captureError(error, `auth-${action}`, undefined);
};

// React hook for error handling
export const useErrorCapture = () => {
  const captureError = React.useCallback((error: Error, context: string, userId?: string) => {
    return errorHandler.captureError(error, context, userId);
  }, []);

  const captureAsyncError = React.useCallback((error: Error, context: string, userId?: string) => {
    return captureAsyncError(error, context, userId);
  }, []);

  return {
    captureError,
    captureAsyncError,
    errorStats: errorHandler.getErrorStats()
  };
};

// Error boundary wrapper for specific components
export const withErrorCapture = <P extends object>(
  Component: React.ComponentType<P>,
  context: string
) => {
  const WrappedComponent = (props: P) => {
    const { captureError } = useErrorCapture();

    React.useEffect(() => {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0] instanceof Error) {
          captureError(args[0], context);
        }
        originalConsoleError.apply(console, args);
      };

      return () => {
        console.error = originalConsoleError;
      };
    }, [captureError]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withErrorCapture(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default errorHandler;
