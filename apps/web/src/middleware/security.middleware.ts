/**
 * Security Middleware
 * Section 2.10: Authorization & Security
 *
 * Requirement #5: CSRF protection
 * Requirement #9: Request size limits
 * Requirement #10: Sanitize inputs for XSS
 * Requirement #11: Prevent SQL injection
 * Requirement #12: Add CSP headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { ForbiddenError, ValidationError } from '../lib/errors/custom-errors';

/**
 * Requirement #9: Request size limits (max 10MB)
 */
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Check request size limit
 * Requirement #9: Max 10MB for portfolio create/update
 */
export async function checkRequestSize(request: NextRequest): Promise<void> {
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);

    if (size > MAX_REQUEST_SIZE) {
      throw new ValidationError(
        `Request size ${size} bytes exceeds maximum allowed size of ${MAX_REQUEST_SIZE} bytes`,
        { size, maxSize: MAX_REQUEST_SIZE }
      );
    }
  }
}

/**
 * CSRF Token Management
 * Requirement #5: CSRF protection for state-changing endpoints
 */
export class CSRFProtection {
  private static tokens: Map<string, { token: string; expiresAt: number }> = new Map();

  /**
   * Generate CSRF token for session
   */
  static generateToken(sessionId: string): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    this.tokens.set(sessionId, { token, expiresAt });

    return token;
  }

  /**
   * Verify CSRF token
   * Requirement #5: CSRF protection to POST, PUT, PATCH, DELETE
   */
  static verifyToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);

    if (!stored) {
      return false;
    }

    // Check expiration
    if (stored.expiresAt < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  /**
   * Cleanup expired tokens
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (data.expiresAt < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// Cleanup expired CSRF tokens every 5 minutes
setInterval(() => CSRFProtection.cleanup(), 5 * 60 * 1000);

/**
 * CSRF middleware for state-changing requests
 * Requirement #5: Add CSRF protection to POST, PUT, PATCH, DELETE
 */
export function requireCSRFToken(request: NextRequest): void {
  const method = request.method;

  // Only check CSRF for state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return;
  }

  // Skip CSRF for API authentication endpoints
  const path = request.nextUrl.pathname;
  if (path.includes('/api/auth/')) {
    return;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const sessionId = request.headers.get('x-session-id') || 'default';

  if (!csrfToken || !CSRFProtection.verifyToken(sessionId, csrfToken)) {
    throw new ForbiddenError('Invalid or missing CSRF token', { csrfRequired: true });
  }
}

/**
 * Content Security Policy (CSP) headers
 * Requirement #12: Add CSP headers using helmet
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.anthropic.com', 'https://ipapi.co'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Build CSP header string
 */
export function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Add security headers to response
 * Requirement #12: Add CSP and other security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', buildCSPHeader());

  // X-Frame-Options (prevent clickjacking)
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options (prevent MIME sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (restrict browser features)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * XSS Prevention - Sanitize user inputs
 * Requirement #10: Sanitize all user inputs to prevent XSS
 *
 * TODO: In production, use DOMPurify or sanitize-html
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;

  // Basic HTML escaping
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize object recursively
 * Requirement #10: Sanitize text fields before storing
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // TODO: In production, use DOMPurify.sanitize(value)
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * SQL Injection Prevention
 * Requirement #11: Prevent SQL injection using parameterized queries
 *
 * NOTE: Prisma automatically handles this with parameterized queries
 * This is a reminder to NEVER use raw SQL queries without parameterization
 */
export function validateNoRawSQL(query: string): void {
  // Check for common SQL injection patterns
  const sqlInjectionPatterns = [
    /(\bor\b|\band\b).*=.*\d+/i,
    /union.*select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update.*set/i,
    /--/,
    /;.*--/,
    /\/\*/,
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(query)) {
      throw new ValidationError('Invalid input detected', {
        reason: 'Potential SQL injection attempt',
      });
    }
  }
}

/**
 * IP-based access control
 * Requirement #14: IP-based access controls
 */
export class IPAccessControl {
  private static blockedIPs: Set<string> = new Set();
  private static allowedIPs: Set<string> = new Set();

  /**
   * Block an IP address
   */
  static blockIP(ip: string): void {
    this.blockedIPs.add(ip);
  }

  /**
   * Allow an IP address (for admin endpoints)
   */
  static allowIP(ip: string): void {
    this.allowedIPs.add(ip);
  }

  /**
   * Check if IP is blocked
   */
  static isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Check if IP is allowed for admin operations
   */
  static isAllowed(ip: string): boolean {
    // If allowlist is empty, all IPs are allowed
    if (this.allowedIPs.size === 0) {
      return true;
    }

    return this.allowedIPs.has(ip);
  }

  /**
   * Verify IP access
   */
  static verifyAccess(request: NextRequest, requireAllowlist: boolean = false): void {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Check if IP is blocked
    if (this.isBlocked(ip)) {
      throw new ForbiddenError('Access denied from this IP address', { ip });
    }

    // Check if IP is in allowlist (for admin endpoints)
    if (requireAllowlist && !this.isAllowed(ip)) {
      throw new ForbiddenError('Access denied. IP not in allowlist.', { ip });
    }
  }
}

/**
 * Detect suspicious activity
 */
export function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent');

  // Check for missing user agent
  if (!userAgent) {
    return true;
  }

  // Check for suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Request size limit middleware wrapper
 */
export function withRequestSizeLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    await checkRequestSize(request);
    return handler(request, ...args);
  };
}
