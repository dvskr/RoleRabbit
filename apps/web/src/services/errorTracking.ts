/**
 * Frontend Error Tracking Service
 * Integrates with backend API and third-party services (Sentry, LogRocket, etc.)
 */

import { ErrorDetails, parseAPIError } from '../utils/errorHandler';

// Error tracking configuration
interface ErrorTrackingConfig {
  enabled: boolean;
  environment: string;
  apiEndpoint: string;
  sentryDsn?: string;
  logRocketAppId?: string;
  sampleRate: number; // 0.0 to 1.0
  ignoreErrors: string[]; // Error messages to ignore
}

// Error context for tracking
interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'error' | 'warning' | 'info' | 'debug';
}

// Tracked error event
interface ErrorEvent {
  message: string;
  stack?: string;
  category?: string;
  component?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  context?: ErrorContext;
}

class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private initialized: boolean = false;
  private errorQueue: ErrorEvent[] = [];

  constructor() {
    this.config = {
      enabled: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === 'true',
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development',
      apiEndpoint: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      logRocketAppId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID,
      sampleRate: parseFloat(process.env.NEXT_PUBLIC_ERROR_SAMPLE_RATE || '1.0'),
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
      ],
    };
  }

  /**
   * Initialize error tracking
   */
  async initialize(userContext?: ErrorContext['user']): Promise<void> {
    if (this.initialized || !this.config.enabled) {
      return;
    }

    try {
      // Initialize Sentry if configured
      if (this.config.sentryDsn && typeof window !== 'undefined') {
        await this.initializeSentry(userContext);
      }

      // Initialize LogRocket if configured
      if (this.config.logRocketAppId && typeof window !== 'undefined') {
        await this.initializeLogRocket(userContext);
      }

      // Set up global error handlers
      this.setupGlobalHandlers();

      this.initialized = true;

      // Flush any queued errors
      await this.flushErrorQueue();
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  /**
   * Initialize Sentry (if installed)
   */
  private async initializeSentry(userContext?: ErrorContext['user']): Promise<void> {
    try {
      // Dynamic import to avoid bundling if not used
      const Sentry = await import('@sentry/nextjs');

      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        tracesSampleRate: this.config.sampleRate,
        beforeSend: (event) => this.filterSentryEvent(event),
        ignoreErrors: this.config.ignoreErrors,
      });

      if (userContext) {
        Sentry.setUser({
          id: userContext.id,
          email: userContext.email,
        });
      }

      console.log('[ErrorTracking] Sentry initialized');
    } catch (error) {
      // Sentry not installed, skip
      console.debug('[ErrorTracking] Sentry not available');
    }
  }

  /**
   * Initialize LogRocket (if installed)
   */
  private async initializeLogRocket(userContext?: ErrorContext['user']): Promise<void> {
    try {
      // Dynamic import to avoid bundling if not used
      const LogRocket = (await import('logrocket')).default;

      LogRocket.init(this.config.logRocketAppId!);

      if (userContext?.id) {
        LogRocket.identify(userContext.id, {
          email: userContext.email,
        });
      }

      console.log('[ErrorTracking] LogRocket initialized');
    } catch (error) {
      // LogRocket not installed, skip
      console.debug('[ErrorTracking] LogRocket not available');
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          tags: { type: 'unhandledRejection' },
        }
      );
    });
  }

  /**
   * Filter Sentry events (avoid sending in development)
   */
  private filterSentryEvent(event: any): any | null {
    // Don't send in development
    if (this.config.environment === 'development') {
      return null;
    }

    // Apply sample rate
    if (Math.random() > this.config.sampleRate) {
      return null;
    }

    return event;
  }

  /**
   * Capture an error
   */
  async captureError(error: Error | any, context?: ErrorContext): Promise<void> {
    if (!this.config.enabled) {
      // Still log to console
      console.error('[ErrorTracking] Error captured (tracking disabled):', error);
      return;
    }

    try {
      // Check if error should be ignored
      if (this.shouldIgnoreError(error)) {
        return;
      }

      // Parse error details
      const errorDetails = typeof error === 'object' ? parseAPIError(error) : { message: String(error) };

      // Create error event
      const errorEvent: ErrorEvent = {
        message: errorDetails.message || error.message || String(error),
        stack: error.stack,
        category: errorDetails.category,
        component: context?.tags?.component,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
        context,
      };

      // Log to console in development
      if (this.config.environment === 'development') {
        console.error('[ErrorTracking] Error:', errorEvent);
      }

      // Send to Sentry if available
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(error, {
          level: context?.level || 'error',
          tags: context?.tags,
          extra: {
            ...context?.extra,
            category: errorDetails.category,
          },
          user: context?.user,
        });
      } catch {
        // Sentry not available
      }

      // Send to backend API
      await this.sendToBackend(errorEvent);
    } catch (trackingError) {
      console.error('[ErrorTracking] Failed to track error:', trackingError);
    }
  }

  /**
   * Capture error boundary error
   */
  async captureErrorBoundary(
    error: Error,
    errorInfo: { componentStack: string },
    component: string
  ): Promise<void> {
    await this.captureError(error, {
      tags: {
        component,
        errorBoundary: 'true',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
      level: 'error',
    });
  }

  /**
   * Capture message (non-error)
   */
  async captureMessage(message: string, context?: ErrorContext): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureMessage(message, {
        level: context?.level || 'info',
        tags: context?.tags,
        extra: context?.extra,
      });
    } catch {
      // Sentry not available, just log
      console.log('[ErrorTracking] Message:', message, context);
    }
  }

  /**
   * Send error to backend API
   */
  private async sendToBackend(errorEvent: ErrorEvent): Promise<void> {
    if (!this.initialized) {
      // Queue error until initialized
      this.errorQueue.push(errorEvent);
      return;
    }

    try {
      await fetch(`${this.config.apiEndpoint}/api/errors/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(errorEvent),
      });
    } catch (error) {
      // Failed to send to backend, that's okay
      console.debug('[ErrorTracking] Failed to send error to backend:', error);
    }
  }

  /**
   * Flush queued errors
   */
  private async flushErrorQueue(): Promise<void> {
    const errors = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of errors) {
      await this.sendToBackend(error);
    }
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(error: any): boolean {
    const message = error?.message || String(error);

    return this.config.ignoreErrors.some((ignored) => message.includes(ignored));
  }

  /**
   * Set user context
   */
  async setUser(user: { id: string; email?: string } | null): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      const Sentry = await import('@sentry/nextjs');
      if (user) {
        Sentry.setUser({ id: user.id, email: user.email });
      } else {
        Sentry.setUser(null);
      }
    } catch {
      // Sentry not available
    }

    try {
      const LogRocket = (await import('logrocket')).default;
      if (user?.id) {
        LogRocket.identify(user.id, { email: user.email });
      }
    } catch {
      // LogRocket not available
    }
  }

  /**
   * Add breadcrumb
   */
  async addBreadcrumb(message: string, category?: string, data?: Record<string, any>): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        timestamp: Date.now() / 1000,
      });
    } catch {
      // Sentry not available
    }
  }
}

// Singleton instance
export const errorTracking = new ErrorTrackingService();

// Convenience exports
export const captureError = (error: Error | any, context?: ErrorContext) =>
  errorTracking.captureError(error, context);

export const captureErrorBoundary = (error: Error, errorInfo: { componentStack: string }, component: string) =>
  errorTracking.captureErrorBoundary(error, errorInfo, component);

export const captureMessage = (message: string, context?: ErrorContext) =>
  errorTracking.captureMessage(message, context);

export const setUser = (user: { id: string; email?: string } | null) => errorTracking.setUser(user);

export const addBreadcrumb = (message: string, category?: string, data?: Record<string, any>) =>
  errorTracking.addBreadcrumb(message, category, data);

export default errorTracking;
