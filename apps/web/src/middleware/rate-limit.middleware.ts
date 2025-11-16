/**
 * Rate Limiting Middleware
 * Section 2.10: Authorization & Security
 *
 * Requirement #6: Rate limiting to portfolio CRUD endpoints: 100 requests per hour
 * Requirement #7: Stricter rate limiting to deployment: 10 deploys per hour
 * Requirement #8: Rate limiting to subdomain check: 30 requests per minute
 */

import { NextRequest } from 'next/server';
import { RateLimitError } from '../lib/errors/custom-errors';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests in window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  message?: string; // Custom error message
}

/**
 * Rate limit store (in-memory)
 * TODO: In production, use Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Increment request count for key
   * Returns current count and reset time
   */
  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    // If no existing record or window expired, create new
    if (!existing || existing.resetTime < now) {
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Increment existing count
    existing.count += 1;
    this.store.set(key, existing);
    return existing;
  }

  /**
   * Get current count for key
   */
  get(key: string): { count: number; resetTime: number } | null {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetTime < now) {
      return null;
    }

    return existing;
  }

  /**
   * Reset count for key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const rateLimitStore = new RateLimitStore();

// Cleanup expired entries every minute
setInterval(() => rateLimitStore.cleanup(), 60 * 1000);

/**
 * Default key generator (uses user ID + IP)
 */
function defaultKeyGenerator(request: NextRequest, prefix: string): string {
  const userId = request.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  return `${prefix}:${userId}:${ip}`;
}

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest, prefix: string = 'rate-limit'): Promise<void> => {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : defaultKeyGenerator(request, prefix);

    const { count, resetTime } = rateLimitStore.increment(key, config.windowMs);

    // Check if limit exceeded
    if (count > config.maxRequests) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      throw new RateLimitError(
        config.message || `Too many requests. Please try again in ${retryAfter} seconds.`,
        {
          limit: config.maxRequests,
          current: count,
          retryAfter,
          resetTime: new Date(resetTime).toISOString(),
        }
      );
    }
  };
}

/**
 * Requirement #6: Portfolio CRUD rate limiter (100 requests per hour)
 */
export const portfolioCrudRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100,
  message: 'Too many portfolio operations. Please try again later.',
});

/**
 * Requirement #7: Deployment rate limiter (10 deploys per hour)
 */
export const deploymentRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many deployment requests. Please try again later.',
});

/**
 * Requirement #8: Subdomain check rate limiter (30 requests per minute)
 */
export const subdomainCheckRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many subdomain checks. Please try again in a moment.',
});

/**
 * General API rate limiter (higher limit for general endpoints)
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000,
  message: 'Too many requests. Please try again later.',
});

/**
 * Share access rate limiter (prevent abuse of public shares)
 */
export const shareAccessRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  keyGenerator: (request: NextRequest) => {
    // Rate limit by IP only (no auth for public shares)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    return `share-access:${ip}`;
  },
  message: 'Too many share access attempts. Please try again in a moment.',
});

/**
 * Wrapper function to apply rate limiting to route handlers
 */
export function withRateLimit(
  rateLimiter: (request: NextRequest, prefix?: string) => Promise<void>,
  prefix?: string
) {
  return async (request: NextRequest): Promise<void> => {
    await rateLimiter(request, prefix);
  };
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(
  request: NextRequest,
  config: RateLimitConfig,
  prefix: string = 'rate-limit'
): number {
  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : defaultKeyGenerator(request, prefix);

  const current = rateLimitStore.get(key);

  if (!current) {
    return config.maxRequests;
  }

  return Math.max(0, config.maxRequests - current.count);
}
