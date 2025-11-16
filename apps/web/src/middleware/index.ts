/**
 * Middleware Exports
 * Central export point for all middleware utilities
 */

// Correlation ID middleware
export {
  addCorrelationId,
  getCorrelationId,
  addCorrelationIdToResponse,
  correlationIdMiddleware,
  CORRELATION_ID_HEADER,
} from './correlation-id.middleware';

// Authentication & Authorization middleware
export type { AuthUser } from './auth.middleware';
export {
  getCurrentUser,
  requireAuth,
  requireAdmin,
  verifyOwnership,
  isAdmin,
  ownsResource,
  withAuth,
  withAdmin,
  withOwnership,
} from './auth.middleware';

// Rate limiting middleware
export {
  portfolioCrudRateLimiter,
  deploymentRateLimiter,
  subdomainCheckRateLimiter,
  generalRateLimiter,
  shareAccessRateLimiter,
  createRateLimiter,
  withRateLimit,
  getRemainingRequests,
} from './rate-limit.middleware';

// Security middleware
export {
  MAX_REQUEST_SIZE,
  checkRequestSize,
  CSRFProtection,
  requireCSRFToken,
  CSP_DIRECTIVES,
  buildCSPHeader,
  addSecurityHeaders,
  sanitizeInput,
  sanitizeObject,
  validateNoRawSQL,
  IPAccessControl,
  detectSuspiciousActivity,
  withRequestSizeLimit,
} from './security.middleware';
