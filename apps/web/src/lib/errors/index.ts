/**
 * Error Handling Exports
 * Central export point for all error handling utilities
 */

// Error codes
export { ErrorCode, ERROR_CODE_TO_HTTP_STATUS, ERROR_MESSAGES } from './error-codes';

// Custom errors
export {
  AppError,
  ValidationError,
  NotFoundError,
  PortfolioNotFoundError,
  TemplateNotFoundError,
  VersionNotFoundError,
  ShareNotFoundError,
  UnauthorizedError,
  ForbiddenError,
  OwnershipError,
  AdminRequiredError,
  ConflictError,
  DuplicateError,
  VersionConflictError,
  RateLimitError,
  InternalError,
  DatabaseError,
  ExternalServiceError,
  FileTooLargeError,
  InvalidFileTypeError,
  isOperationalError,
  isClientError,
  isServerError,
} from './custom-errors';

// Error response types and utilities
export type { ErrorResponse, SuccessResponse } from './error-response';
export {
  createErrorResponse,
  createSuccessResponse,
  sanitizeErrorDetails,
  sanitizeStackTrace,
  isProduction,
} from './error-response';

// Error handler
export {
  handleApiError,
  asyncHandler,
  withErrorHandler,
  createErrorBoundaryResponse,
} from './error-handler';
