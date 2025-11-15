/**
 * HTTPS Enforcement Middleware - Section 6.2
 *
 * Enforces HTTPS for all connections and sets secure headers
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
export function enforceHttps(req: NextRequest): NextResponse | null {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Check if request is already HTTPS
  const proto = req.headers.get('x-forwarded-proto');
  const isHttps = proto === 'https' || req.nextUrl.protocol === 'https:';

  if (!isHttps) {
    // Redirect to HTTPS
    const httpsUrl = req.nextUrl.clone();
    httpsUrl.protocol = 'https:';

    return NextResponse.redirect(httpsUrl, 301); // Permanent redirect
  }

  return null;
}

/**
 * Set HSTS (HTTP Strict Transport Security) header
 */
export function setHstsHeader(response: NextResponse): void {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // HSTS: Force HTTPS for 1 year, include subdomains
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
}

/**
 * Check if request uses secure protocol
 */
export function isSecureRequest(req: NextRequest): boolean {
  const proto = req.headers.get('x-forwarded-proto');
  return proto === 'https' || req.nextUrl.protocol === 'https:';
}

/**
 * Require HTTPS middleware
 * Returns 403 if not HTTPS in production
 */
export function requireHttps(req: NextRequest): NextResponse | null {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  if (!isSecureRequest(req)) {
    return new NextResponse('HTTPS Required', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return null;
}

/**
 * Set secure cookie attributes
 */
export interface SecureCookieOptions {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  domain?: string;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function setSecureCookie(
  response: NextResponse,
  options: SecureCookieOptions
): void {
  const cookieParts = [
    `${options.name}=${options.value}`,
    `Path=${options.path || '/'}`,
    `Max-Age=${options.maxAge || 86400}`,
    'HttpOnly',
    'Secure',
    `SameSite=${options.sameSite || 'Lax'}`,
  ];

  if (options.domain) {
    cookieParts.push(`Domain=${options.domain}`);
  }

  response.headers.append('Set-Cookie', cookieParts.join('; '));
}

/**
 * Clear secure cookie
 */
export function clearSecureCookie(
  response: NextResponse,
  name: string,
  path: string = '/'
): void {
  response.headers.append(
    'Set-Cookie',
    `${name}=; Path=${path}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
  );
}

/**
 * Validate origin for CORS
 */
export function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'https://rolerabbit.com',
    'https://www.rolerabbit.com',
    'https://app.rolerabbit.com',
  ];

  // Allow all subdomains of rolerabbit.com in production
  if (origin.endsWith('.rolerabbit.com')) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Set CORS headers for API
 */
export function setCorsHeaders(
  response: NextResponse,
  origin: string
): void {
  if (isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }
}

/**
 * Combined security middleware
 */
export function securityMiddleware(req: NextRequest): NextResponse {
  // Enforce HTTPS
  const httpsRedirect = enforceHttps(req);
  if (httpsRedirect) {
    return httpsRedirect;
  }

  // Continue with request
  const response = NextResponse.next();

  // Set HSTS header
  setHstsHeader(response);

  // Set additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}
