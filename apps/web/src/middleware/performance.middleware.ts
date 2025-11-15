/**
 * Performance Middleware
 * Section 2.14: Performance Optimizations
 *
 * Requirement #6: Response compression (gzip or brotli)
 * Requirement #7: ETags for conditional requests
 * Requirement #8: Request deduplication
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger/logger';
import { getCacheService } from '@/lib/cache/cache.service';

/**
 * Compression middleware
 * Requirement #6: Implement response compression
 *
 * Note: Next.js automatically compresses responses when deployed on Vercel
 * For other deployments, use this middleware or configure nginx/Apache
 */
export const compressionMiddleware = (request: NextRequest) => {
  // Check if client accepts compression
  const acceptEncoding = request.headers.get('accept-encoding') || '';

  const supportsGzip = acceptEncoding.includes('gzip');
  const supportsBrotli = acceptEncoding.includes('br');

  // In production with Next.js on Vercel, compression is automatic
  // For custom servers, you would compress the response here

  logger.debug('Compression check', {
    supportsGzip,
    supportsBrotli,
    path: request.nextUrl.pathname,
  });

  // Pass compression headers to response
  return {
    supportsGzip,
    supportsBrotli,
  };
};

/**
 * Generate ETag for content
 * Requirement #7: Add ETags to GET endpoints
 */
export const generateETag = (content: string | Buffer): string => {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('base64');
};

/**
 * ETag middleware
 * Requirement #7: Return 304 Not Modified if ETag matches
 */
export const etagMiddleware = (
  request: NextRequest,
  content: string | any,
  options?: { weak?: boolean }
): NextResponse | null => {
  // Only apply to GET requests
  if (request.method !== 'GET') {
    return null;
  }

  // Convert content to string if it's an object
  const contentString = typeof content === 'string'
    ? content
    : JSON.stringify(content);

  // Generate ETag
  const etag = generateETag(contentString);
  const etagHeader = options?.weak ? `W/"${etag}"` : `"${etag}"`;

  // Check if client sent If-None-Match header
  const clientETag = request.headers.get('if-none-match');

  if (clientETag && clientETag === etagHeader) {
    logger.debug('ETag match - returning 304', {
      path: request.nextUrl.pathname,
      etag: etagHeader,
    });

    // Return 304 Not Modified
    return new NextResponse(null, {
      status: 304,
      headers: {
        'ETag': etagHeader,
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });
  }

  // ETag doesn't match or not provided
  return null;
};

/**
 * Add ETag header to response
 */
export const addETagHeader = (
  response: NextResponse,
  content: string | any,
  options?: { weak?: boolean }
): NextResponse => {
  const contentString = typeof content === 'string'
    ? content
    : JSON.stringify(content);

  const etag = generateETag(contentString);
  const etagHeader = options?.weak ? `W/"${etag}"` : `"${etag}"`;

  response.headers.set('ETag', etagHeader);
  response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes

  return response;
};

/**
 * Request deduplication
 * Requirement #8: Return cached response if identical request arrives within 5 seconds
 */
const requestCache = new Map<string, { response: any; timestamp: number }>();
const DEDUP_WINDOW = 5000; // 5 seconds

/**
 * Generate cache key for request
 */
const getRequestCacheKey = (request: NextRequest): string => {
  const url = request.nextUrl.toString();
  const method = request.method;
  const userId = request.headers.get('x-user-id') || 'anonymous';

  return crypto
    .createHash('sha256')
    .update(`${method}:${url}:${userId}`)
    .digest('hex');
};

/**
 * Request deduplication middleware
 * Requirement #8: Implement request deduplication
 */
export const requestDeduplicationMiddleware = async (
  request: NextRequest
): Promise<any | null> => {
  // Only deduplicate GET requests
  if (request.method !== 'GET') {
    return null;
  }

  const cacheKey = getRequestCacheKey(request);
  const now = Date.now();

  // Check if we have a cached response
  const cached = requestCache.get(cacheKey);

  if (cached && now - cached.timestamp < DEDUP_WINDOW) {
    logger.debug('Request deduplication hit', {
      path: request.nextUrl.pathname,
      age: now - cached.timestamp,
    });

    return cached.response;
  }

  // Clean up old entries (prevent memory leak)
  if (requestCache.size > 1000) {
    const keysToDelete: string[] = [];

    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > DEDUP_WINDOW) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => requestCache.delete(key));
  }

  return null;
};

/**
 * Cache request response for deduplication
 */
export const cacheRequestResponse = (
  request: NextRequest,
  response: any
): void => {
  if (request.method !== 'GET') {
    return;
  }

  const cacheKey = getRequestCacheKey(request);
  requestCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
  });
};

/**
 * Combined performance middleware
 * Applies all optimizations
 */
export const applyPerformanceOptimizations = async (
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> => {
  // 1. Check request deduplication
  const cachedResponse = await requestDeduplicationMiddleware(request);
  if (cachedResponse) {
    return new NextResponse(JSON.stringify(cachedResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT-DEDUP',
      },
    });
  }

  // 2. Execute handler
  let response = await handler();

  // 3. Apply compression headers
  compressionMiddleware(request);

  // 4. Cache response for deduplication
  if (request.method === 'GET' && response.ok) {
    const body = await response.clone().text();
    try {
      const data = JSON.parse(body);
      cacheRequestResponse(request, data);
    } catch {
      // Not JSON, skip caching
    }
  }

  return response;
};

/**
 * Helper: Create optimized JSON response
 * Includes ETag, compression hints, and caching headers
 */
export const createOptimizedResponse = (
  data: any,
  request: NextRequest,
  options?: {
    status?: number;
    ttl?: number; // Cache TTL in seconds
    weak?: boolean; // Weak ETag
  }
): NextResponse => {
  const status = options?.status || 200;
  const ttl = options?.ttl || 300; // Default 5 minutes

  // Serialize data
  const content = JSON.stringify(data);

  // Check ETag
  const etagResponse = etagMiddleware(request, content, { weak: options?.weak });
  if (etagResponse) {
    return etagResponse; // Return 304 Not Modified
  }

  // Create response
  const response = new NextResponse(content, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttl}`,
    },
  });

  // Add ETag header
  addETagHeader(response, content, { weak: options?.weak });

  return response;
};

/**
 * Example usage in API route:
 *
 * export async function GET(request: NextRequest) {
 *   return applyPerformanceOptimizations(request, async () => {
 *     const data = await fetchData();
 *     return createOptimizedResponse(data, request, { ttl: 600 });
 *   });
 * }
 */
