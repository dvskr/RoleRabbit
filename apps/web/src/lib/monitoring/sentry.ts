/**
 * Sentry Error Tracking Integration (Section 4.6)
 *
 * Captures unhandled exceptions and sends to Sentry with user context
 */

import * as Sentry from '@sentry/nextjs';
import type { User, Scope } from '@sentry/nextjs';

/**
 * Sentry configuration
 */
export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
}

/**
 * User context for Sentry
 */
export interface SentryUser {
  id: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

/**
 * Sentry service class
 */
export class SentryService {
  private static instance: SentryService;
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SentryService {
    if (!SentryService.instance) {
      SentryService.instance = new SentryService();
    }
    return SentryService.instance;
  }

  /**
   * Initialize Sentry
   */
  public initialize(config?: SentryConfig): void {
    if (this.initialized) {
      return;
    }

    const sentryDsn = config?.dsn || process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

    if (!sentryDsn) {
      console.warn('Sentry DSN not configured, error tracking disabled');
      return;
    }

    const environment = config?.environment || process.env.NODE_ENV || 'development';
    const release = config?.release || process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION;

    Sentry.init({
      dsn: sentryDsn,
      environment,
      release,

      // Performance monitoring
      tracesSampleRate: config?.tracesSampleRate ?? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // Error filtering
      beforeSend: config?.beforeSend || this.defaultBeforeSend,

      // Integrations
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/.*\.rolerabbit\.com/],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Session replay sampling
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Additional options
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      autoSessionTracking: true,

      // Ignore certain errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
        /^ChunkLoadError/,
        /Loading chunk \d+ failed/,
      ],

      // Deny URLs (privacy)
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
      ],
    });

    this.initialized = true;
    console.log('Sentry initialized:', { environment, release });
  }

  /**
   * Default beforeSend filter
   */
  private defaultBeforeSend(event: Sentry.Event): Sentry.Event | null {
    // Filter out development errors
    if (event.environment === 'development') {
      return null;
    }

    // Filter out bot/crawler errors
    if (event.request?.headers?.['user-agent']?.match(/bot|crawler|spider/i)) {
      return null;
    }

    // Sanitize sensitive data
    if (event.request?.data) {
      const sanitized = this.sanitizeData(event.request.data);
      event.request.data = sanitized;
    }

    return event;
  }

  /**
   * Sanitize sensitive data from error reports
   */
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'];
    const sanitized = { ...data };

    for (const key in sanitized) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Set user context
   */
  public setUser(user: SentryUser | null): void {
    if (!this.initialized) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        ip_address: user.ip_address,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  /**
   * Set custom context
   */
  public setContext(name: string, context: Record<string, any>): void {
    if (!this.initialized) return;
    Sentry.setContext(name, context);
  }

  /**
   * Set portfolio context
   */
  public setPortfolioContext(portfolioId: string, template?: string, subdomain?: string): void {
    this.setContext('portfolio', {
      portfolioId,
      template,
      subdomain,
    });
  }

  /**
   * Set deployment context
   */
  public setDeploymentContext(deploymentId: string, portfolioId: string, status: string): void {
    this.setContext('deployment', {
      deploymentId,
      portfolioId,
      status,
    });
  }

  /**
   * Add breadcrumb
   */
  public addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info', data?: Record<string, any>): void {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Capture exception
   */
  public captureException(error: Error | unknown, context?: Record<string, any>): string | undefined {
    if (!this.initialized) {
      console.error('Sentry not initialized, error not captured:', error);
      return undefined;
    }

    return Sentry.captureException(error, {
      contexts: context ? { extra: context } : undefined,
    });
  }

  /**
   * Capture message
   */
  public captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): string | undefined {
    if (!this.initialized) return undefined;

    return Sentry.captureMessage(message, {
      level,
      contexts: context ? { extra: context } : undefined,
    });
  }

  /**
   * Capture portfolio deployment error
   */
  public captureDeploymentError(
    error: Error,
    portfolioId: string,
    deploymentId: string,
    template: string
  ): string | undefined {
    this.setDeploymentContext(deploymentId, portfolioId, 'failed');
    this.addBreadcrumb('Deployment failed', 'deployment', 'error', {
      portfolioId,
      deploymentId,
      template,
    });

    return this.captureException(error, {
      portfolioId,
      deploymentId,
      template,
      component: 'deployment',
    });
  }

  /**
   * Capture API error
   */
  public captureAPIError(
    error: Error,
    method: string,
    path: string,
    statusCode: number,
    userId?: string
  ): string | undefined {
    this.addBreadcrumb(`API ${method} ${path} - ${statusCode}`, 'api', 'error', {
      method,
      path,
      statusCode,
      userId,
    });

    return this.captureException(error, {
      method,
      path,
      statusCode,
      userId,
      component: 'api',
    });
  }

  /**
   * Capture database error
   */
  public captureDatabaseError(
    error: Error,
    operation: string,
    table: string,
    query?: string
  ): string | undefined {
    this.addBreadcrumb(`Database ${operation} on ${table}`, 'database', 'error', {
      operation,
      table,
    });

    return this.captureException(error, {
      operation,
      table,
      query: query ? query.substring(0, 500) : undefined, // Limit query length
      component: 'database',
    });
  }

  /**
   * Capture queue job error
   */
  public captureQueueJobError(
    error: Error,
    queue: string,
    jobName: string,
    jobId: string,
    attemptsMade: number
  ): string | undefined {
    this.addBreadcrumb(`Queue job failed: ${jobName}`, 'queue', 'error', {
      queue,
      jobName,
      jobId,
      attemptsMade,
    });

    return this.captureException(error, {
      queue,
      jobName,
      jobId,
      attemptsMade,
      component: 'queue',
    });
  }

  /**
   * Start transaction for performance monitoring
   */
  public startTransaction(name: string, op: string): Sentry.Transaction {
    return Sentry.startTransaction({ name, op });
  }

  /**
   * Wrap async function with Sentry error capturing
   */
  public async captureAsync<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.captureException(error, context);
      throw error;
    }
  }

  /**
   * Configure scope for current context
   */
  public configureScope(callback: (scope: Scope) => void): void {
    if (!this.initialized) return;
    Sentry.configureScope(callback);
  }

  /**
   * Flush Sentry events
   */
  public async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    return Sentry.flush(timeout);
  }

  /**
   * Close Sentry connection
   */
  public async close(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    return Sentry.close(timeout);
  }

  /**
   * Check if Sentry is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Export singleton instance
 */
export const sentry = SentryService.getInstance();

/**
 * Auto-initialize if DSN is provided
 */
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  sentry.initialize();
}
