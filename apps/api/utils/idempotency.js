/**
 * Idempotency Utility
 * 
 * Prevents duplicate operations on double-click or network retry.
 * Stores idempotency keys and returns existing resources.
 */

/**
 * Idempotency store (in-memory)
 * For production, use Redis
 */
class IdempotencyStore {
  constructor() {
    this.store = new Map();
    this.ttl = 86400000; // 24 hours
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000); // Cleanup every hour
  }

  /**
   * Check if key exists and return cached response
   */
  async get(key) {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.response;
  }

  /**
   * Store response for key
   */
  async set(key, response, ttl = this.ttl) {
    this.store.set(key, {
      response,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  /**
   * Delete key
   */
  async delete(key) {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy store
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Global idempotency store
const globalStore = new IdempotencyStore();

/**
 * Redis-based idempotency store (for production)
 */
class RedisIdempotencyStore {
  constructor(redisClient) {
    this.redis = redisClient;
    this.ttl = 86400; // 24 hours in seconds
  }

  async get(key) {
    try {
      const value = await this.redis.get(`idempotency:${key}`);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      console.error('Redis idempotency get error:', error);
      return null;
    }
  }

  async set(key, response, ttl = this.ttl) {
    try {
      await this.redis.setex(
        `idempotency:${key}`,
        ttl,
        JSON.stringify(response)
      );
    } catch (error) {
      console.error('Redis idempotency set error:', error);
    }
  }

  async delete(key) {
    try {
      await this.redis.del(`idempotency:${key}`);
    } catch (error) {
      console.error('Redis idempotency delete error:', error);
    }
  }
}

/**
 * Generate idempotency key from request
 */
function generateIdempotencyKey(req, customKey = null) {
  if (customKey) {
    return customKey;
  }

  // Use header if provided
  if (req.headers['idempotency-key']) {
    return req.headers['idempotency-key'];
  }

  // Generate from request details
  const userId = req.user?.id || 'anonymous';
  const method = req.method;
  const path = req.path;
  const body = JSON.stringify(req.body || {});
  
  // Create hash
  const crypto = require('crypto');
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}:${method}:${path}:${body}`)
    .digest('hex');

  return hash;
}

/**
 * Idempotency middleware
 * 
 * Usage:
 *   router.post('/resumes', idempotencyMiddleware(), handler);
 */
function idempotencyMiddleware(options = {}) {
  const {
    store = globalStore,
    ttl = 86400000, // 24 hours
    methods = ['POST', 'PUT', 'PATCH'],
    keyGenerator = generateIdempotencyKey
  } = options;

  return async (req, res, next) => {
    try {
      // Only apply to specified methods
      if (!methods.includes(req.method)) {
        return next();
      }

      // Generate idempotency key
      const key = keyGenerator(req);
      if (!key) {
        return next();
      }

      // Check if key exists
      const cached = await store.get(key);
      if (cached) {
        console.log(`Idempotency hit: ${key}`);
        return res.status(cached.statusCode || 200).json(cached.body);
      }

      // Store original send function
      const originalJson = res.json;

      // Override json function to cache response
      res.json = function(body) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          store.set(key, {
            statusCode: res.statusCode,
            body
          }, ttl).catch(error => {
            console.error('Idempotency store error:', error);
          });
        }

        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Idempotency middleware error:', error);
      // Don't block request on idempotency error
      next();
    }
  };
}

/**
 * Manual idempotency check
 */
async function checkIdempotency(key, store = globalStore) {
  const cached = await store.get(key);
  return {
    exists: !!cached,
    response: cached
  };
}

/**
 * Manual idempotency store
 */
async function storeIdempotency(key, response, store = globalStore, ttl = 86400000) {
  await store.set(key, response, ttl);
}

/**
 * Create idempotency store
 */
function createIdempotencyStore(redisClient = null) {
  if (redisClient) {
    return new RedisIdempotencyStore(redisClient);
  }
  return new IdempotencyStore();
}

module.exports = {
  IdempotencyStore,
  RedisIdempotencyStore,
  generateIdempotencyKey,
  idempotencyMiddleware,
  checkIdempotency,
  storeIdempotency,
  createIdempotencyStore,
  globalStore
};

