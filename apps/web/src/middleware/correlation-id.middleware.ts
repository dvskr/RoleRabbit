/**
 * Correlation ID Middleware
 * Section 2.9: Error Handling & Response Standardization
 *
 * Requirement #6: Add correlation ID to all requests using UUID middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * Correlation ID header name
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Add correlation ID to request
 * Uses existing correlation ID from header if present, otherwise generates new UUID
 */
export function addCorrelationId(request: NextRequest): string {
  // Check if correlation ID already exists in request headers
  let correlationId = request.headers.get(CORRELATION_ID_HEADER);

  if (!correlationId) {
    // Generate new UUID for correlation ID
    correlationId = randomUUID();
  }

  return correlationId;
}

/**
 * Get correlation ID from request headers
 */
export function getCorrelationId(request: NextRequest): string {
  return request.headers.get(CORRELATION_ID_HEADER) || randomUUID();
}

/**
 * Add correlation ID to response headers
 */
export function addCorrelationIdToResponse(
  response: NextResponse,
  correlationId: string
): NextResponse {
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return response;
}

/**
 * Next.js middleware to add correlation ID
 * This should be added to middleware.ts in the app root
 */
export function correlationIdMiddleware(request: NextRequest): NextResponse {
  const correlationId = getCorrelationId(request);

  // Clone the request headers and add correlation ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);

  // Create response with correlation ID header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add correlation ID to response headers
  response.headers.set(CORRELATION_ID_HEADER, correlationId);

  return response;
}
