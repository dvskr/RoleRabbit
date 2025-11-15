/**
 * Global Error Handler
 * Section 2.9: Error Handling & Response Standardization
 *
 * Requirement #4: Global error handler middleware
 * Requirement #5: Map error types to HTTP status codes
 * Requirement #7: Log all errors with context
 * Requirement #8: Don't expose internal errors in production
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './custom-errors';
import { ErrorCode, ERROR_MESSAGES } from './error-codes';
import {
  createErrorResponse,
  sanitizeErrorDetails,
  isProduction,
} from './error-response';
import { logger, LogContext } from '../logger/logger';
import { getCorrelationId } from '../../middleware/correlation-id.middleware';

/**
 * Handle errors in Next.js API routes
 * This is a utility function to be used in try-catch blocks
 *
 * Requirement #4: Global error handler catching all errors
 * Requirement #5: Return standardized response with appropriate HTTP status
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  additionalContext?: LogContext
): NextResponse {
  const correlationId = getCorrelationId(request);
  const path = request.nextUrl.pathname;
  const method = request.method;
  const isProd = isProduction();

  // Build log context
  // Requirement #7: Log with userId, portfolioId, path, stack, correlationId
  const logContext: LogContext = {
    correlationId,
    path,
    method,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    ...additionalContext,
  };

  // Handle AppError (custom errors)
  if (error instanceof AppError) {
    // Requirement #7: Log all errors with context
    logger.error(
      `${error.code}: ${error.message}`,
      error,
      {
        ...logContext,
        errorCode: error.code,
        statusCode: error.statusCode,
      }
    );

    // Requirement #8: Sanitize details for production
    const details = sanitizeErrorDetails(error.details, isProd);

    // Requirement #5: Return standardized response with appropriate HTTP status
    return NextResponse.json(
      createErrorResponse(
        error.code,
        error.message,
        correlationId,
        details,
        path
      ),
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', {
      ...logContext,
      errors: error.errors,
    });

    const details = {
      errors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    };

    return NextResponse.json(
      createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
        correlationId,
        isProd ? undefined : details,
        path
      ),
      { status: 400 }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Requirement #7: Log with full context and stack trace
    logger.error(
      'Unhandled error',
      error,
      logContext
    );

    // Requirement #8: Don't expose internal details in production
    const message = isProd
      ? ERROR_MESSAGES[ErrorCode.INTERNAL_ERROR]
      : error.message;

    const details = isProd ? undefined : { stack: error.stack };

    // Requirement #5: InternalError → 500
    return NextResponse.json(
      createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        message,
        correlationId,
        details,
        path
      ),
      { status: 500 }
    );
  }

  // Handle unknown errors
  logger.error(
    'Unknown error type',
    new Error(String(error)),
    {
      ...logContext,
      errorType: typeof error,
      errorValue: String(error),
    }
  );

  return NextResponse.json(
    createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      ERROR_MESSAGES[ErrorCode.INTERNAL_ERROR],
      correlationId,
      undefined,
      path
    ),
    { status: 500 }
  );
}

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
export function asyncHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract NextRequest from args (usually first or second parameter)
      const request = args.find(
        (arg) => arg instanceof Request || arg?.nextUrl
      ) as NextRequest | undefined;

      if (request) {
        return handleApiError(error, request) as R;
      }

      // If no request found, re-throw
      throw error;
    }
  };
}

/**
 * Try-catch wrapper for API route handlers
 * Usage:
 * export const GET = withErrorHandler(async (request: NextRequest) => {
 *   // Your code here
 * });
 */
export function withErrorHandler(
  handler: (
    request: NextRequest,
    context?: { params: any }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context?: { params: any }
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request, {
        params: context?.params,
      });
    }
  };
}

/**
 * Error boundary for React Server Components
 * This can be used in error.tsx files
 */
export function createErrorBoundaryResponse(
  error: Error,
  correlationId: string
): {
  title: string;
  message: string;
  correlationId: string;
  showDetails: boolean;
} {
  const isProd = isProduction();

  // Log the error
  logger.error('Error boundary caught error', error, { correlationId });

  // Return user-friendly error info
  return {
    title: 'Something went wrong',
    message: isProd
      ? 'An unexpected error occurred. Please try again later.'
      : error.message,
    correlationId,
    showDetails: !isProd,
  };
}
