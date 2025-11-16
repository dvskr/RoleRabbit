/**
 * EXAMPLE: Secure API Route Implementation
 * Demonstrates usage of all security and error handling middleware
 *
 * This is a reference implementation showing how to use:
 * - Error handling (Section 2.9)
 * - Authorization & Security (Section 2.10)
 */

import { NextRequest, NextResponse } from 'next/server';

// Section 2.9: Error Handling
import {
  withErrorHandler,
  PortfolioNotFoundError,
  OwnershipError,
  createSuccessResponse,
} from '@/lib/errors';
import { logger } from '@/lib/logger/logger';
import { getCorrelationId } from '@/middleware/correlation-id.middleware';

// Section 2.10: Authorization & Security
import { requireAuth, verifyOwnership } from '@/middleware/auth.middleware';
import { portfolioCrudRateLimiter } from '@/middleware/rate-limit.middleware';
import {
  checkRequestSize,
  requireCSRFToken,
  sanitizeObject,
  addSecurityHeaders,
} from '@/middleware/security.middleware';
import { PortfolioAuditLogger } from '@/lib/audit/audit-logger';

/**
 * Mock database
 */
interface Portfolio {
  id: string;
  userId: string;
  name: string;
  data: any;
}

const portfolios: Portfolio[] = [];

/**
 * Example: GET /api/portfolios/:id (Secure Route)
 *
 * Demonstrates:
 * - Error handling with withErrorHandler
 * - Authentication with requireAuth
 * - Ownership verification
 * - Rate limiting
 * - Correlation ID
 * - Logging
 * - Security headers
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Requirement 2.9 #6: Get correlation ID
  const correlationId = getCorrelationId(request);

  // Requirement 2.10 #6: Apply rate limiting (100 requests/hour)
  await portfolioCrudRateLimiter(request, 'portfolio-crud');

  // Requirement 2.10 #1-2: Require authentication and verify ownership
  const user = requireAuth(request);

  // Get portfolio ID from params
  const { id: portfolioId } = params;

  // Find portfolio
  const portfolio = portfolios.find((p) => p.id === portfolioId);

  // Requirement 2.9 #9: User-friendly error message
  if (!portfolio) {
    throw new PortfolioNotFoundError(portfolioId);
  }

  // Requirement 2.10 #1: Verify ownership
  await verifyOwnership(user.id, portfolio.userId, 'portfolio');

  // Requirement 2.9 #7: Log request with context
  logger.info('Portfolio retrieved', {
    correlationId,
    userId: user.id,
    portfolioId,
    path: request.nextUrl.pathname,
  });

  // Requirement 2.9 #1: Return standardized success response
  const response = NextResponse.json(
    createSuccessResponse({ portfolio }, correlationId)
  );

  // Requirement 2.10 #12: Add security headers
  return addSecurityHeaders(response);
});

/**
 * Example: PUT /api/portfolios/:id (Secure Update Route)
 *
 * Demonstrates:
 * - All security middleware
 * - Request size limits
 * - CSRF protection
 * - Input sanitization
 * - Audit logging
 */
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const correlationId = getCorrelationId(request);

  // Requirement 2.10 #6: Rate limiting
  await portfolioCrudRateLimiter(request, 'portfolio-crud');

  // Requirement 2.10 #9: Check request size limit (10MB)
  await checkRequestSize(request);

  // Requirement 2.10 #5: CSRF protection for state-changing requests
  requireCSRFToken(request);

  // Requirement 2.10 #1-2: Authentication and ownership
  const user = requireAuth(request);
  const { id: portfolioId } = params;

  const portfolio = portfolios.find((p) => p.id === portfolioId);

  if (!portfolio) {
    throw new PortfolioNotFoundError(portfolioId);
  }

  await verifyOwnership(user.id, portfolio.userId, 'portfolio');

  // Parse and validate request body
  const body = await request.json();

  // Requirement 2.10 #10: Sanitize inputs for XSS prevention
  const sanitizedData = sanitizeObject(body.data || {});

  // Update portfolio
  const updatedPortfolio = {
    ...portfolio,
    name: body.name || portfolio.name,
    data: sanitizedData,
  };

  // Find index and update
  const index = portfolios.findIndex((p) => p.id === portfolioId);
  portfolios[index] = updatedPortfolio;

  // Requirement 2.10 #14: Audit logging for sensitive operations
  PortfolioAuditLogger.logUpdate(
    portfolioId,
    request,
    user.id,
    { name: body.name }
  );

  // Requirement 2.9 #7: Log with context
  logger.info('Portfolio updated', {
    correlationId,
    userId: user.id,
    portfolioId,
    changes: { name: body.name },
  });

  const response = NextResponse.json(
    createSuccessResponse({ portfolio: updatedPortfolio }, correlationId)
  );

  return addSecurityHeaders(response);
});

/**
 * Example: DELETE /api/portfolios/:id (Secure Delete Route)
 *
 * Demonstrates audit logging for deletion
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const correlationId = getCorrelationId(request);

  // Apply all security middleware
  await portfolioCrudRateLimiter(request, 'portfolio-crud');
  requireCSRFToken(request);

  const user = requireAuth(request);
  const { id: portfolioId } = params;

  const portfolio = portfolios.find((p) => p.id === portfolioId);

  if (!portfolio) {
    throw new PortfolioNotFoundError(portfolioId);
  }

  await verifyOwnership(user.id, portfolio.userId, 'portfolio');

  // Soft delete
  const index = portfolios.findIndex((p) => p.id === portfolioId);
  portfolios.splice(index, 1);

  // Requirement 2.10 #14: Audit logging for portfolio delete
  PortfolioAuditLogger.logDelete(portfolioId, request, user.id);

  logger.info('Portfolio deleted', {
    correlationId,
    userId: user.id,
    portfolioId,
  });

  const response = NextResponse.json(
    createSuccessResponse({ message: 'Portfolio deleted successfully' }, correlationId)
  );

  return addSecurityHeaders(response);
});

/**
 * Example: POST /api/portfolios/:id/deploy (Deployment with Stricter Rate Limit)
 *
 * Demonstrates:
 * - Stricter rate limiting for deployments
 * - Audit logging for deployments
 */
import { deploymentRateLimiter } from '@/middleware/rate-limit.middleware';

export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const correlationId = getCorrelationId(request);

  // Requirement 2.10 #7: Stricter rate limiting for deployments (10/hour)
  await deploymentRateLimiter(request, 'deployment');

  requireCSRFToken(request);

  const user = requireAuth(request);
  const { id: portfolioId } = params;

  const portfolio = portfolios.find((p) => p.id === portfolioId);

  if (!portfolio) {
    throw new PortfolioNotFoundError(portfolioId);
  }

  await verifyOwnership(user.id, portfolio.userId, 'portfolio');

  // Simulate deployment
  const deploymentId = `deploy-${Date.now()}`;
  const deploymentUrl = `https://${portfolio.name}.example.com`;

  // Requirement 2.10 #14: Audit logging for deployment
  PortfolioAuditLogger.logDeploy(
    portfolioId,
    request,
    user.id,
    deploymentId,
    deploymentUrl
  );

  logger.info('Portfolio deployed', {
    correlationId,
    userId: user.id,
    portfolioId,
    deploymentId,
    url: deploymentUrl,
  });

  const response = NextResponse.json(
    createSuccessResponse({
      deploymentId,
      url: deploymentUrl,
      status: 'deploying',
    }, correlationId)
  );

  return addSecurityHeaders(response);
});
