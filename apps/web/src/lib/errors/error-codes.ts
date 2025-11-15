/**
 * Error Codes and Types
 * Section 2.9: Error Handling & Response Standardization
 *
 * Requirements #2: Error code enum
 */

/**
 * Standard error codes used throughout the application
 */
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  OWNERSHIP_ERROR = 'OWNERSHIP_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ADMIN_REQUIRED = 'ADMIN_REQUIRED',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  PORTFOLIO_NOT_FOUND = 'PORTFOLIO_NOT_FOUND',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VERSION_NOT_FOUND = 'VERSION_NOT_FOUND',
  SHARE_NOT_FOUND = 'SHARE_NOT_FOUND',
  DOMAIN_NOT_FOUND = 'DOMAIN_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_SLUG = 'DUPLICATE_SLUG',
  DUPLICATE_SUBDOMAIN = 'DUPLICATE_SUBDOMAIN',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  SUBDOMAIN_TAKEN = 'SUBDOMAIN_TAKEN',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  DEPLOYMENT_LIMIT_EXCEEDED = 'DEPLOYMENT_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',

  // Business logic errors
  PORTFOLIO_NOT_PUBLISHED = 'PORTFOLIO_NOT_PUBLISHED',
  PORTFOLIO_INCOMPLETE = 'PORTFOLIO_INCOMPLETE',
  SHARE_EXPIRED = 'SHARE_EXPIRED',
  SHARE_MAX_VIEWS_REACHED = 'SHARE_MAX_VIEWS_REACHED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',

  // File/upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

/**
 * Map error codes to HTTP status codes
 * Requirement #5: Map error types to HTTP status codes
 */
export const ERROR_CODE_TO_HTTP_STATUS: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.PORTFOLIO_INCOMPLETE]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 400,
  [ErrorCode.INVALID_FILE_TYPE]: 400,

  // 401 Unauthorized
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.MISSING_CREDENTIALS]: 401,
  [ErrorCode.INVALID_PASSWORD]: 401,

  // 403 Forbidden
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.OWNERSHIP_ERROR]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.ADMIN_REQUIRED]: 403,
  [ErrorCode.PORTFOLIO_NOT_PUBLISHED]: 403,
  [ErrorCode.SHARE_EXPIRED]: 403,
  [ErrorCode.SHARE_MAX_VIEWS_REACHED]: 403,

  // 404 Not Found
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.PORTFOLIO_NOT_FOUND]: 404,
  [ErrorCode.TEMPLATE_NOT_FOUND]: 404,
  [ErrorCode.VERSION_NOT_FOUND]: 404,
  [ErrorCode.SHARE_NOT_FOUND]: 404,
  [ErrorCode.DOMAIN_NOT_FOUND]: 404,

  // 409 Conflict
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.DUPLICATE_SLUG]: 409,
  [ErrorCode.DUPLICATE_SUBDOMAIN]: 409,
  [ErrorCode.VERSION_CONFLICT]: 409,
  [ErrorCode.SUBDOMAIN_TAKEN]: 409,

  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.DEPLOYMENT_LIMIT_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 500,
  [ErrorCode.DEPLOYMENT_FAILED]: 500,
  [ErrorCode.UPLOAD_FAILED]: 500,
};

/**
 * User-friendly error messages
 * Requirement #9: Add user-friendly error messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Validation errors
  [ErrorCode.VALIDATION_ERROR]: 'The provided data is invalid. Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field is missing.',
  [ErrorCode.INVALID_FORMAT]: 'The format of the provided data is invalid.',

  // Authentication errors
  [ErrorCode.UNAUTHORIZED]: 'You must be logged in to perform this action.',
  [ErrorCode.INVALID_TOKEN]: 'Invalid authentication token.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.MISSING_CREDENTIALS]: 'Authentication credentials are missing.',

  // Authorization errors
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.OWNERSHIP_ERROR]: 'You do not own this resource.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions.',
  [ErrorCode.ADMIN_REQUIRED]: 'Admin access is required for this operation.',

  // Not found errors
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.PORTFOLIO_NOT_FOUND]: 'Portfolio not found.',
  [ErrorCode.TEMPLATE_NOT_FOUND]: 'Template not found.',
  [ErrorCode.VERSION_NOT_FOUND]: 'Version not found.',
  [ErrorCode.SHARE_NOT_FOUND]: 'Share link not found or has been revoked.',
  [ErrorCode.DOMAIN_NOT_FOUND]: 'Domain not found.',

  // Conflict errors
  [ErrorCode.CONFLICT]: 'A conflict occurred with the current state of the resource.',
  [ErrorCode.DUPLICATE_SLUG]: 'This slug is already in use. Please choose a different one.',
  [ErrorCode.DUPLICATE_SUBDOMAIN]: 'This subdomain is already taken. Please choose a different one.',
  [ErrorCode.VERSION_CONFLICT]: 'The portfolio was modified by another process. Please refresh and try again.',
  [ErrorCode.SUBDOMAIN_TAKEN]: 'This subdomain is already taken.',

  // Rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please slow down and try again later.',
  [ErrorCode.TOO_MANY_REQUESTS]: 'You have exceeded the rate limit. Please try again later.',
  [ErrorCode.DEPLOYMENT_LIMIT_EXCEEDED]: 'You have exceeded the deployment limit. Please try again later.',

  // Server errors
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'An external service is currently unavailable. Please try again later.',
  [ErrorCode.DEPLOYMENT_FAILED]: 'Deployment failed. Please try again.',

  // Business logic errors
  [ErrorCode.PORTFOLIO_NOT_PUBLISHED]: 'This portfolio is not published.',
  [ErrorCode.PORTFOLIO_INCOMPLETE]: 'Portfolio data is incomplete. Please fill in all required fields.',
  [ErrorCode.SHARE_EXPIRED]: 'This share link has expired.',
  [ErrorCode.SHARE_MAX_VIEWS_REACHED]: 'This share link has reached its maximum view limit.',
  [ErrorCode.INVALID_PASSWORD]: 'Incorrect password.',

  // File/upload errors
  [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported file format.',
  [ErrorCode.UPLOAD_FAILED]: 'File upload failed. Please try again.',
};
