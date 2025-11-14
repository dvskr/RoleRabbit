/**
 * Cache Middleware for API Routes
 * Provides request-level caching with automatic invalidation
 */

const redisCache = require('../utils/redisCache');
const crypto = require('crypto');

/**
 * Generate cache key from request
 */
function generateCacheKey(req, prefix = 'api') {
  const { method, url, user } = req;

  // Include user ID for user-specific caches
  const userId = user?.id || 'anonymous';

  // Create hash of query params and body for consistent keys
  const params = {
    query: req.query || {},
    params: req.params || {},
  };

  const paramsHash = crypto
    .createHash('md5')
    .update(JSON.stringify(params))
    .digest('hex');

  return `${prefix}:${method}:${url.split('?')[0]}:${userId}:${paramsHash}`;
}

/**
 * Cache middleware factory
 */
function cacheMiddleware(options = {}) {
  const {
    ttl = 300, // 5 minutes default
    prefix = 'api',
    condition = () => true, // Function to determine if request should be cached
    keyGenerator = generateCacheKey, // Custom key generator
    tags = [], // Cache tags for invalidation
  } = options;

  return async (request, reply) => {
    // Only cache GET requests by default
    if (request.method !== 'GET') {
      return;
    }

    // Check custom condition
    if (!condition(request)) {
      return;
    }

    // Generate cache key
    const cacheKey = keyGenerator(request, prefix);

    // Try to get from cache
    const cached = await redisCache.get(cacheKey);

    if (cached) {
      // Set cache headers
      reply.header('X-Cache', 'HIT');
      reply.header('X-Cache-Key', cacheKey);

      // Return cached response
      reply.send(cached);
      return reply;
    }

    // Cache miss - mark for caching after response
    reply.header('X-Cache', 'MISS');
    reply.header('X-Cache-Key', cacheKey);

    // Hook to cache response after sending
    reply.addHook('onSend', async (request, reply, payload) => {
      // Only cache successful responses
      if (reply.statusCode >= 200 && reply.statusCode < 300) {
        try {
          const data = JSON.parse(payload);

          // Store in cache with tags
          if (tags.length > 0) {
            await redisCache.setWithTags(cacheKey, data, tags, ttl);
          } else {
            await redisCache.set(cacheKey, data, ttl);
          }
        } catch (error) {
          // Ignore caching errors
        }
      }

      return payload;
    });
  };
}

/**
 * Cache invalidation middleware
 * Invalidates cache after mutations (POST, PUT, DELETE)
 */
function cacheInvalidationMiddleware(options = {}) {
  const {
    pattern = null, // Pattern to match keys for deletion
    tag = null, // Tag to invalidate
    keys = [], // Specific keys to delete
  } = options;

  return async (request, reply) => {
    // Run after response is sent
    reply.addHook('onResponse', async (request, reply) => {
      // Only invalidate on successful mutations
      if (reply.statusCode >= 200 && reply.statusCode < 300) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          // Invalidate by tag
          if (tag) {
            await redisCache.invalidateTag(tag);
          }

          // Invalidate by pattern
          if (pattern) {
            await redisCache.delPattern(pattern);
          }

          // Invalidate specific keys
          if (keys.length > 0) {
            for (const key of keys) {
              await redisCache.del(key);
            }
          }
        }
      }
    });
  };
}

/**
 * Template-specific cache middleware
 */
const templatesCacheMiddleware = cacheMiddleware({
  ttl: 600, // 10 minutes
  prefix: 'templates',
  tags: ['templates'],
  condition: (req) => {
    // Don't cache if user has filters applied
    // (or adjust based on your needs)
    return true;
  },
});

/**
 * Template invalidation middleware
 */
const templatesInvalidationMiddleware = cacheInvalidationMiddleware({
  tag: 'templates',
});

module.exports = {
  cacheMiddleware,
  cacheInvalidationMiddleware,
  templatesCacheMiddleware,
  templatesInvalidationMiddleware,
  generateCacheKey,
};
