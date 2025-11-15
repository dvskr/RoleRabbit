/**
 * Error Response Format
 * Section 2.9: Error Handling & Response Standardization
 *
 * Requirement #1: Define standard error response format
 */

import { ErrorCode } from './error-codes';

/**
 * Standard error response structure
 * Requirement #1: success, error, code, message, details, timestamp, correlationId
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    correlationId: string;
    path?: string;
  };
}

/**
 * Success response structure (for consistency)
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    correlationId: string;
  };
}

/**
 * Create standardized error response
 * Requirement #1: Standardized format for all errors
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  correlationId: string,
  details?: any,
  path?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      correlationId,
      path,
    },
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  correlationId?: string
): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (correlationId) {
    response.meta = {
      timestamp: new Date().toISOString(),
      correlationId,
    };
  }

  return response;
}

/**
 * Sanitize error details for production
 * Requirement #8: Do not expose internal error details in production
 */
export function sanitizeErrorDetails(
  details: any,
  isProd: boolean
): any {
  if (!isProd) {
    // In development, return full details
    return details;
  }

  // In production, remove sensitive information
  if (!details) {
    return undefined;
  }

  // If it's a validation error with field details, keep those
  if (details.errors && Array.isArray(details.errors)) {
    return { errors: details.errors };
  }

  // If it's a simple object with non-sensitive data, keep it
  if (typeof details === 'object' && !details.stack && !details.sql) {
    const sanitized: any = {};
    const allowedKeys = ['field', 'value', 'portfolioId', 'userId', 'versionId', 'templateId', 'shareId'];

    for (const key of allowedKeys) {
      if (key in details) {
        sanitized[key] = details[key];
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  // Otherwise, don't expose details in production
  return undefined;
}

/**
 * Sanitize error stack trace for production
 * Requirement #8: Only show stack traces in development
 */
export function sanitizeStackTrace(
  stack: string | undefined,
  isProd: boolean
): string | undefined {
  if (!isProd && stack) {
    return stack;
  }
  return undefined;
}

/**
 * Get environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
