/**
 * Logging Configuration
 * Section 2.9: Error Handling & Response Standardization
 *
 * Requirement #7: Log all errors with context using Winston or similar logger
 * Requirement #13 (Section 2.10): Mask sensitive data in logs
 */

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log context interface
 * Requirement #7: Include userId, portfolioId, request path, error stack, correlationId
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  portfolioId?: string;
  templateId?: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * Sensitive fields that should be masked in logs
 * Requirement #13: Never log passwords, tokens, API keys, full credit card numbers
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'secret',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'creditCard',
  'credit_card',
  'authorization',
];

/**
 * Mask sensitive data in objects
 * Requirement #13: Mask sensitive data in logs
 */
export function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  const masked: any = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Check if field is sensitive
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      masked[key] = '***MASKED***';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Format log message
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(maskSensitiveData(context))}` : '';

  return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
}

/**
 * Logger class
 * TODO: In production, replace with Winston, Pino, or similar
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Log error
   * Requirement #7: Log with userId, portfolioId, path, stack, correlationId
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const logContext: LogContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: this.isDevelopment ? error?.stack : undefined,
    };

    const formattedMessage = formatLogMessage(LogLevel.ERROR, message, logContext);

    console.error(formattedMessage);

    // TODO: In production, send to external logging service
    // await sendToLoggingService(LogLevel.ERROR, message, logContext);
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext): void {
    const formattedMessage = formatLogMessage(LogLevel.WARN, message, context);
    console.warn(formattedMessage);

    // TODO: In production, send to external logging service
  }

  /**
   * Log info
   */
  info(message: string, context?: LogContext): void {
    const formattedMessage = formatLogMessage(LogLevel.INFO, message, context);
    console.log(formattedMessage);

    // TODO: In production, send to external logging service
  }

  /**
   * Log debug (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) {
      return;
    }

    const formattedMessage = formatLogMessage(LogLevel.DEBUG, message, context);
    console.log(formattedMessage);
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    const logContext: LogContext = {
      ...context,
      method,
      path,
      statusCode,
      duration,
    };

    const message = `${method} ${path} ${statusCode} ${duration}ms`;

    if (level === LogLevel.ERROR) {
      this.error(message, undefined, logContext);
    } else if (level === LogLevel.WARN) {
      this.warn(message, logContext);
    } else {
      this.info(message, logContext);
    }
  }

  /**
   * Log audit event
   * Section 2.10 Requirement #14: Audit logging for sensitive operations
   */
  audit(
    action: string,
    resource: string,
    userId: string,
    ip: string,
    context?: LogContext
  ): void {
    const logContext: LogContext = {
      ...context,
      action,
      resource,
      userId,
      ip,
      timestamp: new Date().toISOString(),
    };

    const message = `AUDIT: ${action} on ${resource} by user ${userId} from ${ip}`;
    this.info(message, logContext);

    // TODO: Store audit logs in separate audit table/service
    // await db.auditLog.create({ data: logContext });
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Audit action types
 * Section 2.10 Requirement #14: Sensitive operations to audit
 */
export enum AuditAction {
  PORTFOLIO_CREATE = 'PORTFOLIO_CREATE',
  PORTFOLIO_UPDATE = 'PORTFOLIO_UPDATE',
  PORTFOLIO_DELETE = 'PORTFOLIO_DELETE',
  PORTFOLIO_PUBLISH = 'PORTFOLIO_PUBLISH',
  PORTFOLIO_UNPUBLISH = 'PORTFOLIO_UNPUBLISH',
  PORTFOLIO_DEPLOY = 'PORTFOLIO_DEPLOY',
  TEMPLATE_CREATE = 'TEMPLATE_CREATE',
  TEMPLATE_UPDATE = 'TEMPLATE_UPDATE',
  TEMPLATE_DELETE = 'TEMPLATE_DELETE',
  VERSION_CREATE = 'VERSION_CREATE',
  VERSION_RESTORE = 'VERSION_RESTORE',
  SHARE_CREATE = 'SHARE_CREATE',
  SHARE_REVOKE = 'SHARE_REVOKE',
  DOMAIN_ADD = 'DOMAIN_ADD',
  DOMAIN_VERIFY = 'DOMAIN_VERIFY',
  DOMAIN_REMOVE = 'DOMAIN_REMOVE',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  ADMIN_ACTION = 'ADMIN_ACTION',
}
