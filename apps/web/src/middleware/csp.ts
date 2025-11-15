/**
 * Content Security Policy (CSP) Middleware - Section 6.2
 *
 * Sets CSP headers to prevent XSS and other injection attacks
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate CSP nonce for inline scripts
 */
export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

/**
 * Build CSP header value
 */
export function buildCspHeader(nonce?: string): string {
  const directives = [
    // Default: only allow same origin
    "default-src 'self'",

    // Scripts: self + nonce for inline scripts
    nonce
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : "script-src 'self' 'unsafe-inline' https://vercel.live",

    // Styles: self + inline styles (needed for styled-components, etc.)
    "style-src 'self' 'unsafe-inline'",

    // Images: self + data URIs + common CDNs
    "img-src 'self' data: https: blob:",

    // Fonts: self + data URIs
    "font-src 'self' data:",

    // Connect: self + API endpoints
    "connect-src 'self' https://api.rolerabbit.com https://*.supabase.co",

    // Media: self + CDNs
    "media-src 'self' https:",

    // Objects: none (prevent Flash, etc.)
    "object-src 'none'",

    // Base URI: self only
    "base-uri 'self'",

    // Form actions: self only
    "form-action 'self'",

    // Frame ancestors: none (prevent clickjacking)
    "frame-ancestors 'none'",

    // Upgrade insecure requests
    'upgrade-insecure-requests',

    // Block mixed content
    'block-all-mixed-content',
  ];

  return directives.join('; ');
}

/**
 * Build CSP for portfolio pages (more permissive)
 */
export function buildPortfolioCspHeader(): string {
  const directives = [
    "default-src 'self'",

    // Allow custom scripts for portfolio customization
    "script-src 'self' 'unsafe-inline' https:",

    // Allow custom styles
    "style-src 'self' 'unsafe-inline' https:",

    // Allow images from anywhere
    "img-src * data: blob:",

    // Allow fonts from anywhere
    "font-src 'self' data: https:",

    // Allow connections to analytics, etc.
    "connect-src 'self' https:",

    // Allow media from anywhere
    "media-src 'self' https:",

    // Allow iframes from trusted sources
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://codepen.io",

    // No objects
    "object-src 'none'",

    // Base URI
    "base-uri 'self'",

    // Form actions
    "form-action 'self'",

    // Upgrade insecure requests
    'upgrade-insecure-requests',
  ];

  return directives.join('; ');
}

/**
 * CSP middleware for Next.js
 */
export function cspMiddleware(req: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Determine which CSP to use based on path
  const isPortfolioPage = req.nextUrl.pathname.startsWith('/p/');

  const cspHeader = isPortfolioPage
    ? buildPortfolioCspHeader()
    : buildCspHeader();

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspHeader);

  // Set additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

/**
 * Set security headers for API responses
 */
export function setApiSecurityHeaders(headers: Headers): void {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Cache-Control', 'no-store, max-age=0');
}

/**
 * Validate CSP violation reports
 */
export interface CspViolationReport {
  'document-uri': string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  'blocked-uri': string;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
  'status-code': number;
}

/**
 * Handle CSP violation reports
 */
export function handleCspViolation(report: CspViolationReport): void {
  console.warn('CSP Violation:', {
    directive: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
  });

  // In production, send to logging service
  // Example: Sentry, Datadog, etc.
}
