/**
 * Rate Limiting System - Section 6.6
 *
 * Progressive rate limiting with different limits for different operations
 */

import { createSupabaseServiceClient } from '@/database/client';
import { logSecurityEvent, SecurityEventType } from '@/lib/logging/security-logger';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests in window
  identifier: string; // 'ip' or 'user'
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

/**
 * Rate limit tiers
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // General API requests
  'api:general': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    identifier: 'user',
  },

  // Expensive operations
  'api:deploy': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    identifier: 'user',
  },

  'api:export': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    identifier: 'user',
  },

  'api:generate': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    identifier: 'user',
  },

  // Public endpoints (IP-based)
  'public:view': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    identifier: 'ip',
  },

  'public:subdomain-check': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    identifier: 'ip',
  },

  // Authentication
  'auth:login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    identifier: 'ip',
  },

  'auth:register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    identifier: 'ip',
  },

  'auth:password-reset': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    identifier: 'ip',
  },

  // Portfolio creation
  'portfolio:create': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    identifier: 'user',
  },

  'portfolio:publish': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    identifier: 'user',
  },

  // Abuse reporting
  'abuse:report': {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 10,
    identifier: 'user',
  },
};

/**
 * In-memory rate limit store
 * In production, use Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetAt: number }>;

  constructor() {
    this.store = new Map();
    this.cleanupExpired();
  }

  get(key: string): { count: number; resetAt: number } | null {
    const data = this.store.get(key);

    if (!data) {
      return null;
    }

    // Check if expired
    if (Date.now() > data.resetAt) {
      this.store.delete(key);
      return null;
    }

    return data;
  }

  increment(key: string, windowMs: number): { count: number; resetAt: number } {
    const existing = this.get(key);

    if (existing) {
      existing.count++;
      this.store.set(key, existing);
      return existing;
    }

    // Create new entry
    const data = {
      count: 1,
      resetAt: Date.now() + windowMs,
    };

    this.store.set(key, data);
    return data;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  private cleanupExpired(): void {
    setInterval(() => {
      const now = Date.now();

      for (const [key, data] of this.store.entries()) {
        if (now > data.resetAt) {
          this.store.delete(key);
        }
      }
    }, 60 * 1000); // Cleanup every minute
  }
}

const rateLimitStore = new RateLimitStore();

/**
 * Check rate limit
 */
export async function checkRateLimit(
  rateLimitType: string,
  identifier: string // IP address or user ID
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[rateLimitType];

  if (!config) {
    throw new Error(`Unknown rate limit type: ${rateLimitType}`);
  }

  // Generate key
  const key = `${rateLimitType}:${identifier}`;

  // Get current usage
  const data = rateLimitStore.increment(key, config.windowMs);

  const allowed = data.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - data.count);
  const resetAt = new Date(data.resetAt);
  const retryAfter = allowed ? undefined : Math.ceil((data.resetAt - Date.now()) / 1000);

  // Log rate limit exceeded
  if (!allowed) {
    await logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      userId: config.identifier === 'user' ? identifier : undefined,
      ipAddress: config.identifier === 'ip' ? identifier : undefined,
      result: 'failure',
      metadata: {
        rateLimitType,
        limit: config.maxRequests,
        count: data.count,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return {
    allowed,
    limit: config.maxRequests,
    remaining,
    resetAt,
    retryAfter,
  };
}

/**
 * Rate limit middleware
 */
export function rateLimitMiddleware(rateLimitType: string) {
  return async (req: any, res: any, next: any) => {
    const config = RATE_LIMITS[rateLimitType];

    if (!config) {
      return next();
    }

    // Get identifier (IP or user ID)
    let identifier: string;

    if (config.identifier === 'user') {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      identifier = user.id;
    } else {
      // IP-based
      identifier =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        'unknown';
    }

    // Check rate limit
    const result = await checkRateLimit(rateLimitType, identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt.getTime());

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter!);

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        limit: result.limit,
        resetAt: result.resetAt.toISOString(),
      });
    }

    next();
  };
}

/**
 * Progressive rate limiting
 * Stricter limits after violations
 */
export class ProgressiveRateLimiter {
  private violations: Map<string, number>;

  constructor() {
    this.violations = new Map();
  }

  async checkLimit(
    userId: string,
    action: string
  ): Promise<RateLimitResult> {
    const violationCount = this.violations.get(userId) || 0;

    // Reduce limits based on violations
    let multiplier = 1;
    if (violationCount >= 5) {
      multiplier = 0.1; // 90% reduction
    } else if (violationCount >= 3) {
      multiplier = 0.5; // 50% reduction
    } else if (violationCount >= 1) {
      multiplier = 0.75; // 25% reduction
    }

    // Create custom rate limit
    const baseConfig = RATE_LIMITS[action] || RATE_LIMITS['api:general'];
    const adjustedLimit = Math.floor(baseConfig.maxRequests * multiplier);

    // Check with adjusted limit
    const result = await checkRateLimit(action, userId);

    // Override limit in result
    result.limit = adjustedLimit;
    result.remaining = Math.max(0, adjustedLimit - (baseConfig.maxRequests - result.remaining));
    result.allowed = result.remaining > 0;

    // Track violation
    if (!result.allowed) {
      this.violations.set(userId, violationCount + 1);
    }

    return result;
  }

  resetViolations(userId: string): void {
    this.violations.delete(userId);
  }
}

/**
 * CAPTCHA requirement check
 */
export async function requiresCaptcha(
  action: string,
  identifier: string
): Promise<boolean> {
  // Check if action has been abused recently
  const key = `${action}:${identifier}`;
  const data = rateLimitStore.get(key);

  if (!data) {
    return false;
  }

  const config = RATE_LIMITS[action];
  if (!config) {
    return false;
  }

  // Require CAPTCHA if > 80% of limit
  const usagePercent = (data.count / config.maxRequests) * 100;

  return usagePercent > 80;
}

/**
 * Track unusual activity
 */
export async function trackActivity(
  userId: string,
  activityType: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Store activity
  await supabase.from('user_activities').insert({
    user_id: userId,
    activity_type: activityType,
    metadata,
    created_at: new Date().toISOString(),
  });

  // Check for unusual patterns
  await checkUnusualActivity(userId, activityType);
}

/**
 * Check for unusual activity patterns
 */
async function checkUnusualActivity(
  userId: string,
  activityType: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  // Count activities in last hour
  const { count } = await supabase
    .from('user_activities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('activity_type', activityType)
    .gte('created_at', oneHourAgo.toISOString());

  // Alert thresholds
  const thresholds: Record<string, number> = {
    'portfolio:create': 10,
    'portfolio:deploy': 20,
    'portfolio:delete': 5,
  };

  const threshold = thresholds[activityType];

  if (threshold && count && count >= threshold) {
    // Log unusual activity
    await logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_IP,
      userId,
      result: 'failure',
      metadata: {
        activityType,
        count,
        threshold,
      },
      timestamp: new Date().toISOString(),
    });

    // Consider temporary restrictions
    // await applyTemporaryRestriction(userId, activityType);
  }
}

/**
 * Apply account-level restrictions
 */
export async function applyAccountRestriction(
  userId: string,
  restriction: string,
  durationHours: number,
  reason: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  await supabase.from('account_restrictions').insert({
    user_id: userId,
    restriction_type: restriction,
    reason,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });

  // Log restriction
  await logSecurityEvent({
    type: SecurityEventType.ADMIN_ACTION,
    userId,
    result: 'success',
    action: 'account_restricted',
    metadata: {
      restriction,
      reason,
      expiresAt: expiresAt.toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if user has active restrictions
 */
export async function checkRestrictions(
  userId: string,
  action: string
): Promise<{ restricted: boolean; reason?: string; expiresAt?: string }> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('account_restrictions')
    .select('*')
    .eq('user_id', userId)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return { restricted: false };
  }

  const restriction = data[0];

  // Check if restriction applies to this action
  if (restriction.restriction_type === 'all' || restriction.restriction_type === action) {
    return {
      restricted: true,
      reason: restriction.reason,
      expiresAt: restriction.expires_at,
    };
  }

  return { restricted: false };
}

/**
 * Get rate limit stats
 */
export async function getRateLimitStats(): Promise<{
  totalRequests: number;
  blockedRequests: number;
  topAbusers: Array<{ identifier: string; violations: number }>;
}> {
  const supabase = createSupabaseServiceClient();

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const { data } = await supabase
    .from('security_logs')
    .select('user_id, ip_address')
    .eq('event_type', SecurityEventType.RATE_LIMIT_EXCEEDED)
    .gte('created_at', oneHourAgo.toISOString());

  if (!data) {
    return {
      totalRequests: 0,
      blockedRequests: 0,
      topAbusers: [],
    };
  }

  // Group by identifier
  const abusers = data.reduce((acc, log) => {
    const identifier = log.user_id || log.ip_address;
    if (!identifier) return acc;

    if (!acc[identifier]) {
      acc[identifier] = { identifier, violations: 0 };
    }
    acc[identifier].violations++;

    return acc;
  }, {} as Record<string, { identifier: string; violations: number }>);

  const topAbusers = Object.values(abusers)
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 10);

  return {
    totalRequests: 0, // Would need to track separately
    blockedRequests: data.length,
    topAbusers,
  };
}
