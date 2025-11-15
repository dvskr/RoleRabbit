/**
 * Error Tracking Utility
 * Integrates with error tracking services (Sentry, etc.)
 * Captures errors with user context and additional metadata
 */

// Sentry configuration (stub - replace with actual Sentry setup)
// import * as Sentry from '@sentry/react';

interface ErrorContext {
  userId?: string;
  portfolioId?: string;
  action?: string;
  context?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  [key: string]: unknown;
}

interface UserContext {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Initialize error tracking service
 * Should be called once at app startup
 */
export function initErrorTracking(): void {
  // Only initialize in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Error Tracking] Running in development mode - errors will be logged to console only');
    return;
  }

  // TODO: Initialize Sentry or other error tracking service
  // Example Sentry initialization:
  /*
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  */

  console.log('[Error Tracking] Service initialized');
}

/**
 * Set user context for error tracking
 * Call this when user logs in or user data is available
 */
export function setUserContext(user: UserContext | null): void {
  if (!user) {
    // Clear user context on logout
    if (process.env.NODE_ENV === 'production') {
      // Sentry.setUser(null);
    }
    console.log('[Error Tracking] User context cleared');
    return;
  }

  const userContext = {
    id: user.id,
    email: user.email,
    username: user.name,
  };

  if (process.env.NODE_ENV === 'production') {
    // Sentry.setUser(userContext);
  }

  console.log('[Error Tracking] User context set:', userContext);
}

/**
 * Track error with context
 * Sends error to tracking service with additional metadata
 */
export function trackError(
  error: Error,
  context?: ErrorContext
): void {
  // Always log to console for debugging
  console.error('[Error Tracked]', error);
  if (context) {
    console.error('[Error Context]', context);
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    try {
      // TODO: Send to Sentry or other service
      /*
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
        tags: {
          action: context?.action,
          portfolioId: context?.portfolioId,
        },
      });
      */

      // For now, just log that we would send it
      console.log('[Error Tracking] Would send to service in production:', {
        error: error.message,
        context,
      });
    } catch (trackingError) {
      // Don't let error tracking errors break the app
      console.error('[Error Tracking] Failed to track error:', trackingError);
    }
  }
}

/**
 * Track API error with additional context
 */
export function trackApiError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number,
  context?: ErrorContext
): void {
  trackError(error, {
    ...context,
    endpoint,
    method,
    statusCode,
    errorType: 'api_error',
  });
}

/**
 * Track validation error
 */
export function trackValidationError(
  error: Error,
  field: string,
  value: unknown,
  context?: ErrorContext
): void {
  trackError(error, {
    ...context,
    field,
    value: typeof value === 'string' ? value.substring(0, 100) : String(value),
    errorType: 'validation_error',
  });
}

/**
 * Track custom event (non-error tracking)
 * Useful for tracking user actions, performance, etc.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  console.log('[Event Tracked]', eventName, properties);

  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to analytics/tracking service
    /*
    Sentry.addBreadcrumb({
      category: 'event',
      message: eventName,
      level: 'info',
      data: properties,
    });
    */
  }
}

/**
 * Set additional context for all future error reports
 * Useful for setting portfolio context, feature flags, etc.
 */
export function setErrorContext(key: string, value: unknown): void {
  if (process.env.NODE_ENV === 'production') {
    // Sentry.setContext(key, value);
  }
  console.log(`[Error Tracking] Context set: ${key}`, value);
}

/**
 * Clear specific error context
 */
export function clearErrorContext(key: string): void {
  if (process.env.NODE_ENV === 'production') {
    // Sentry.setContext(key, null);
  }
  console.log(`[Error Tracking] Context cleared: ${key}`);
}

export default {
  init: initErrorTracking,
  setUser: setUserContext,
  trackError,
  trackApiError,
  trackValidationError,
  trackEvent,
  setContext: setErrorContext,
  clearContext: clearErrorContext,
};
