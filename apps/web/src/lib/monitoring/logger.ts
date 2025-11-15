/**
 * Structured Logging Service (Section 4.6)
 *
 * JSON-formatted logging with correlation IDs and context
 */

import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Log level type
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

/**
 * Log context
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  portfolioId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

/**
 * Log metadata
 */
export interface LogMetadata extends LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  component?: string;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Async local storage for request context
 */
const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

/**
 * Logger service class
 */
export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  private defaultContext: LogContext = {};

  private constructor() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logFormat = process.env.LOG_FORMAT || 'json';

    // Create Winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      format: this.getLogFormat(logFormat),
      defaultMeta: {
        service: 'rolerabbit',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      transports: this.getTransports(),
      exitOnError: false,
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Get log format based on configuration
   */
  private getLogFormat(format: string): winston.Logform.Format {
    if (format === 'json') {
      return winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      );
    }

    // Pretty format for development
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );
  }

  /**
   * Get Winston transports
   */
  private getTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    // Console transport
    transports.push(
      new winston.transports.Console({
        handleExceptions: true,
      })
    );

    // File transport for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        })
      );

      transports.push(
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10485760, // 10MB
          maxFiles: 10,
        })
      );
    }

    return transports;
  }

  /**
   * Get current context from async local storage
   */
  private getContext(): LogContext {
    const asyncContext = asyncLocalStorage.getStore() || {};
    return { ...this.defaultContext, ...asyncContext };
  }

  /**
   * Set default context (persists across all logs)
   */
  public setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  /**
   * Set request context (scoped to current async operation)
   */
  public static setRequestContext(context: LogContext): void {
    const currentContext = asyncLocalStorage.getStore() || {};
    asyncLocalStorage.enterWith({ ...currentContext, ...context });
  }

  /**
   * Run function with context
   */
  public static runWithContext<T>(context: LogContext, fn: () => T): T {
    return asyncLocalStorage.run(context, fn);
  }

  /**
   * Generate correlation ID
   */
  public static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Log error
   */
  public error(message: string, error?: Error | unknown, meta?: LogContext): void {
    const context = this.getContext();
    const logMeta: any = { ...context, ...meta };

    if (error) {
      if (error instanceof Error) {
        logMeta.error = {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        };
      } else {
        logMeta.error = { message: String(error) };
      }
    }

    this.logger.error(message, logMeta);
  }

  /**
   * Log warning
   */
  public warn(message: string, meta?: LogContext): void {
    const context = this.getContext();
    this.logger.warn(message, { ...context, ...meta });
  }

  /**
   * Log info
   */
  public info(message: string, meta?: LogContext): void {
    const context = this.getContext();
    this.logger.info(message, { ...context, ...meta });
  }

  /**
   * Log HTTP request
   */
  public http(message: string, meta?: LogContext): void {
    const context = this.getContext();
    this.logger.http(message, { ...context, ...meta });
  }

  /**
   * Log debug
   */
  public debug(message: string, meta?: LogContext): void {
    const context = this.getContext();
    this.logger.debug(message, { ...context, ...meta });
  }

  /**
   * Log with custom level
   */
  public log(level: LogLevel, message: string, meta?: LogContext): void {
    const context = this.getContext();
    this.logger.log(level, message, { ...context, ...meta });
  }

  /**
   * Log portfolio creation
   */
  public logPortfolioCreation(portfolioId: string, userId: string, template: string): void {
    this.info('Portfolio created', {
      component: 'portfolio',
      portfolioId,
      userId,
      template,
      event: 'portfolio.created',
    });
  }

  /**
   * Log portfolio deployment
   */
  public logPortfolioDeployment(
    portfolioId: string,
    deploymentId: string,
    status: 'started' | 'completed' | 'failed',
    duration?: number
  ): void {
    const level = status === 'failed' ? 'error' : 'info';
    this.log(level, `Portfolio deployment ${status}`, {
      component: 'deployment',
      portfolioId,
      deploymentId,
      status,
      duration,
      event: `deployment.${status}`,
    });
  }

  /**
   * Log API request
   */
  public logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    this.http('API request', {
      component: 'api',
      method,
      path,
      statusCode,
      duration,
      userId,
      event: 'api.request',
    });
  }

  /**
   * Log database query
   */
  public logDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    rowCount?: number
  ): void {
    this.debug('Database query', {
      component: 'database',
      operation,
      table,
      duration,
      rowCount,
      event: 'database.query',
    });
  }

  /**
   * Log queue job
   */
  public logQueueJob(
    queue: string,
    jobName: string,
    jobId: string,
    status: 'started' | 'completed' | 'failed',
    duration?: number
  ): void {
    const level = status === 'failed' ? 'error' : 'info';
    this.log(level, `Queue job ${status}`, {
      component: 'queue',
      queue,
      jobName,
      jobId,
      status,
      duration,
      event: `queue.job.${status}`,
    });
  }

  /**
   * Log authentication event
   */
  public logAuth(
    event: 'login' | 'logout' | 'register' | 'password_reset',
    userId: string,
    success: boolean
  ): void {
    this.info(`Authentication ${event}`, {
      component: 'auth',
      event: `auth.${event}`,
      userId,
      success,
    });
  }

  /**
   * Log security event
   */
  public logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: LogContext
  ): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.log(level, `Security event: ${event}`, {
      component: 'security',
      event: `security.${event}`,
      severity,
      ...details,
    });
  }

  /**
   * Create child logger with additional context
   */
  public child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.defaultContext = { ...this.defaultContext, ...context };
    return childLogger;
  }

  /**
   * Measure and log function execution time
   */
  public async measure<T>(
    name: string,
    fn: () => Promise<T>,
    meta?: LogContext
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`${name} completed`, { ...meta, duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`${name} failed`, error, { ...meta, duration });
      throw error;
    }
  }

  /**
   * Get Winston logger instance (for advanced usage)
   */
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

/**
 * Export singleton instance
 */
export const logger = Logger.getInstance();

/**
 * Export request context helpers
 */
export const setRequestContext = Logger.setRequestContext;
export const runWithContext = Logger.runWithContext;
export const generateCorrelationId = Logger.generateCorrelationId;
