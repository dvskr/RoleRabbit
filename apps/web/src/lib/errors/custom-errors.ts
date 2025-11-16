/**
 * Custom Error Classes
 * Section 2.9: Error Handling & Response Standardization
 *
 * Requirement #3: Create custom error classes extending Error
 */

import { ErrorCode, ERROR_CODE_TO_HTTP_STATUS, ERROR_MESSAGES } from './error-codes';

/**
 * Base application error class
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message || ERROR_MESSAGES[code]);
    this.code = code;
    this.statusCode = ERROR_CODE_TO_HTTP_STATUS[code];
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error (400)
 * Thrown when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message?: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not Found Error (404)
 * Thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: any) {
    const message = `${resource} not found`;
    super(ErrorCode.NOT_FOUND, message, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Portfolio Not Found Error (404)
 */
export class PortfolioNotFoundError extends AppError {
  constructor(portfolioId?: string) {
    super(
      ErrorCode.PORTFOLIO_NOT_FOUND,
      'Portfolio not found',
      { portfolioId }
    );
    Object.setPrototypeOf(this, PortfolioNotFoundError.prototype);
  }
}

/**
 * Template Not Found Error (404)
 */
export class TemplateNotFoundError extends AppError {
  constructor(templateId?: string) {
    super(
      ErrorCode.TEMPLATE_NOT_FOUND,
      'Template not found',
      { templateId }
    );
    Object.setPrototypeOf(this, TemplateNotFoundError.prototype);
  }
}

/**
 * Version Not Found Error (404)
 */
export class VersionNotFoundError extends AppError {
  constructor(versionId?: string) {
    super(
      ErrorCode.VERSION_NOT_FOUND,
      'Version not found',
      { versionId }
    );
    Object.setPrototypeOf(this, VersionNotFoundError.prototype);
  }
}

/**
 * Share Not Found Error (404)
 */
export class ShareNotFoundError extends AppError {
  constructor(shareId?: string) {
    super(
      ErrorCode.SHARE_NOT_FOUND,
      'Share link not found or has been revoked',
      { shareId }
    );
    Object.setPrototypeOf(this, ShareNotFoundError.prototype);
  }
}

/**
 * Unauthorized Error (401)
 * Thrown when authentication is required but missing or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message?: string, details?: any) {
    super(ErrorCode.UNAUTHORIZED, message, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden Error (403)
 * Thrown when user lacks permission to perform an action
 */
export class ForbiddenError extends AppError {
  constructor(message?: string, details?: any) {
    super(ErrorCode.FORBIDDEN, message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Ownership Error (403)
 * Thrown when user doesn't own the resource they're trying to modify
 * Requirement #5: Map OwnershipError → 403
 */
export class OwnershipError extends AppError {
  constructor(resource: string = 'resource', details?: any) {
    super(
      ErrorCode.OWNERSHIP_ERROR,
      `You do not own this ${resource}`,
      details
    );
    Object.setPrototypeOf(this, OwnershipError.prototype);
  }
}

/**
 * Admin Required Error (403)
 * Thrown when an operation requires admin privileges
 */
export class AdminRequiredError extends AppError {
  constructor(message?: string) {
    super(ErrorCode.ADMIN_REQUIRED, message);
    Object.setPrototypeOf(this, AdminRequiredError.prototype);
  }
}

/**
 * Conflict Error (409)
 * Thrown when there's a conflict with the current state
 */
export class ConflictError extends AppError {
  constructor(message?: string, details?: any) {
    super(ErrorCode.CONFLICT, message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Duplicate Error (409)
 * Thrown when trying to create a resource that already exists
 */
export class DuplicateError extends AppError {
  constructor(field: string, value: string) {
    super(
      ErrorCode.CONFLICT,
      `${field} '${value}' is already in use`,
      { field, value }
    );
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }
}

/**
 * Version Conflict Error (409)
 * Thrown when optimistic locking fails
 */
export class VersionConflictError extends AppError {
  constructor(currentVersion?: number) {
    super(
      ErrorCode.VERSION_CONFLICT,
      'The resource was modified by another process. Please refresh and try again.',
      { currentVersion }
    );
    Object.setPrototypeOf(this, VersionConflictError.prototype);
  }
}

/**
 * Rate Limit Error (429)
 * Thrown when rate limit is exceeded
 * Requirement #5: Map RateLimitError → 429
 */
export class RateLimitError extends AppError {
  constructor(message?: string, details?: any) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, details);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Internal Server Error (500)
 * Thrown for unexpected server errors
 * Requirement #5: Map InternalError → 500
 */
export class InternalError extends AppError {
  constructor(message?: string, details?: any) {
    super(
      ErrorCode.INTERNAL_ERROR,
      message || 'An unexpected error occurred',
      details,
      false // Not operational
    );
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/**
 * Database Error (500)
 * Thrown when a database operation fails
 */
export class DatabaseError extends AppError {
  constructor(message?: string, details?: any) {
    super(
      ErrorCode.DATABASE_ERROR,
      message || 'A database error occurred',
      details,
      false // Not operational
    );
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External Service Error (500)
 * Thrown when an external service call fails
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, details?: any) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      message || `${service} is currently unavailable`,
      { service, ...details },
      true // Operational (expected to happen sometimes)
    );
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * File Too Large Error (400)
 */
export class FileTooLargeError extends AppError {
  constructor(maxSize: number, actualSize?: number) {
    super(
      ErrorCode.FILE_TOO_LARGE,
      `File size exceeds maximum allowed size of ${maxSize} bytes`,
      { maxSize, actualSize }
    );
    Object.setPrototypeOf(this, FileTooLargeError.prototype);
  }
}

/**
 * Invalid File Type Error (400)
 */
export class InvalidFileTypeError extends AppError {
  constructor(allowedTypes: string[], receivedType?: string) {
    super(
      ErrorCode.INVALID_FILE_TYPE,
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      { allowedTypes, receivedType }
    );
    Object.setPrototypeOf(this, InvalidFileTypeError.prototype);
  }
}

/**
 * Check if error is an operational error (expected) vs programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.statusCode >= 400 && error.statusCode < 500;
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.statusCode >= 500;
  }
  return false;
}
