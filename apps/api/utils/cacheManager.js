const { LRUCache } = require('lru-cache');
const Redis = require('ioredis');
const logger = require('./logger');
const cacheConfig = require('../config/cacheConfig');
const { buildCacheKey } = require('./cacheKeys');

const memoryCache = new LRUCache({
  max: cacheConfig.lruMaxItems,
  ttl: cacheConfig.lruDefaultTtlMs,
  allowStale: false
});

let redisClient = null;
let redisStatus = 'disabled';
let redisLastError = null;
let redisLastErrorTime = null;
let redisReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Track Redis metrics
const redisMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,
  reconnects: 0,
  lastHealthCheck: null,
  lastHealthCheckResult: null
};

function buildRedisOptions() {
  const options = {
    lazyConnect: cacheConfig.redisLazyConnect,
    maxRetriesPerRequest: 3, // Increased from 1 for better reliability
    enableAutoPipelining: true,
    retryStrategy: (times) => {
      // Exponential backoff with max 10 seconds
      const delay = Math.min(times * 1000, 10000);
      logger.info(`Redis retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err) => {
      // Reconnect on specific errors
      const targetErrors = ['READONLY', 'ECONNREFUSED', 'ETIMEDOUT'];
      return targetErrors.some(targetError => err.message.includes(targetError));
    }
  };

  if (cacheConfig.redisTls) {
    options.tls = {
      rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false'
    };
  }

  return options;
}

function initializeRedis() {
  if (!cacheConfig.redisEnabled || redisClient) {
    return;
  }

  redisStatus = 'connecting';
  redisClient = new Redis(cacheConfig.redisUrl, buildRedisOptions());

  redisClient.on('ready', () => {
    redisStatus = 'ready';
    redisReconnectAttempts = 0;
    redisLastError = null;
    logger.info('✅ Redis cache connected and ready');
  });

  redisClient.on('connect', () => {
    logger.info('Redis cache connecting...');
  });

  redisClient.on('reconnecting', (delay) => {
    redisStatus = 'reconnecting';
    redisReconnectAttempts++;
    redisMetrics.reconnects++;
    logger.warn(`Redis reconnecting (attempt ${redisReconnectAttempts}), delay: ${delay}ms`);
    
    if (redisReconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      logger.error(`Redis max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached, giving up`);
      redisClient.disconnect();
      redisStatus = 'failed';
    }
  });

  redisClient.on('error', (error) => {
    redisStatus = 'error';
    redisLastError = error.message;
    redisLastErrorTime = new Date().toISOString();
    redisMetrics.errors++;
    
    // Log error but don't spam logs
    if (redisMetrics.errors % 10 === 1) { // Log every 10th error
      logger.error('Redis cache error', { 
        error: error.message,
        errorCount: redisMetrics.errors,
        reconnectAttempts: redisReconnectAttempts
      });
    }
  });

  redisClient.on('end', () => {
    redisStatus = 'disconnected';
    logger.warn('Redis connection ended');
    
    // Automatic reconnection is handled by ioredis retryStrategy
    // Manual reconnection as fallback
    if (cacheConfig.redisReconnectIntervalMs > 0 && redisReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        try {
          logger.info('Attempting manual Redis reconnection...');
          redisClient.connect().catch((error) => {
            logger.error('Manual Redis reconnect failed', { error: error.message });
          });
        } catch (error) {
          logger.error('Manual Redis reconnect threw', { error: error.message });
        }
      }, cacheConfig.redisReconnectIntervalMs);
    }
  });

  redisClient.on('close', () => {
    redisStatus = 'closed';
    logger.warn('Redis connection closed');
  });
}

initializeRedis();

function isRedisReady() {
  return redisClient && redisStatus === 'ready';
}

function toRedisKey(key) {
  if (!cacheConfig.redisEnabled) {
    return key;
  }
  const prefix = cacheConfig.redisKeyPrefix ? `${cacheConfig.redisKeyPrefix}:` : '';
  return `${prefix}${key}`;
}

async function readRedis(key) {
  if (!isRedisReady()) {
    redisMetrics.misses++;
    return undefined;
  }

  try {
    const raw = await redisClient.get(toRedisKey(key));
    if (!raw) {
      redisMetrics.misses++;
      return undefined;
    }
    redisMetrics.hits++;
    return JSON.parse(raw);
  } catch (error) {
    redisMetrics.errors++;
    logger.error('Failed to read value from Redis cache', { error: error.message, key });
    return undefined;
  }
}

async function writeRedis(key, value, ttlMs) {
  if (!isRedisReady()) {
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    if (typeof ttlMs === 'number' && ttlMs > 0) {
      await redisClient.set(toRedisKey(key), serialized, 'PX', ttlMs);
    } else {
      await redisClient.set(toRedisKey(key), serialized);
    }
  } catch (error) {
    logger.error('Failed to write value to Redis cache', { error: error.message, key });
  }
}

async function deleteRedisKey(key) {
  if (!isRedisReady()) {
    return;
  }

  try {
    await redisClient.del(toRedisKey(key));
  } catch (error) {
    logger.error('Failed to delete Redis cache key', { error: error.message, key });
  }
}

async function get(namespace, parts) {
  const cacheKey = buildCacheKey(namespace, parts);
  const memoryValue = memoryCache.get(cacheKey);

  if (memoryValue !== undefined) {
    return memoryValue;
  }

  const remoteValue = await readRedis(cacheKey);
  if (remoteValue !== undefined) {
    memoryCache.set(cacheKey, remoteValue);
  }
  return remoteValue;
}

async function set(namespace, parts, value, options = {}) {
  const cacheKey = buildCacheKey(namespace, parts);
  const ttlMs = typeof options.ttl === 'number' ? options.ttl : cacheConfig.defaultTtlMs;

  memoryCache.set(cacheKey, value, { ttl: ttlMs });

  if (options.skipRemote !== true) {
    await writeRedis(cacheKey, value, ttlMs);
  }

  return cacheKey;
}

async function del(namespace, parts) {
  const cacheKey = buildCacheKey(namespace, parts);
  memoryCache.delete(cacheKey);
  await deleteRedisKey(cacheKey);
}

async function invalidateNamespace(namespace, parts = []) {
  const prefix = buildCacheKey(namespace, parts);

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  if (!isRedisReady()) {
    return;
  }

  const pattern = `${toRedisKey(prefix)}*`;
  let cursor = '0';
  try {
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
      cursor = nextCursor;
    } while (cursor !== '0');
  } catch (error) {
    logger.error('Failed to invalidate Redis namespace', { error: error.message, namespace, prefix });
  }
}

async function wrap({ namespace, keyParts, ttl, fetch, forceRefresh = false, skipRemote = false }) {
  if (!forceRefresh) {
    const cached = await get(namespace, keyParts);
    if (cached !== undefined) {
      return { value: cached, hit: true };
    }
  }

  const value = await fetch();
  if (value !== undefined) {
    await set(namespace, keyParts, value, { ttl, skipRemote });
  }
  return { value, hit: false };
}

/**
 * Perform Redis health check
 */
async function checkRedisHealth() {
  if (!cacheConfig.redisEnabled) {
    return {
      status: 'disabled',
      message: 'Redis is not enabled'
    };
  }

  if (!redisClient) {
    return {
      status: 'not_initialized',
      message: 'Redis client not initialized'
    };
  }

  try {
    const startTime = Date.now();
    await redisClient.ping();
    const responseTime = Date.now() - startTime;
    
    // Get Redis info
    const info = await redisClient.info('memory');
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memoryUsed = memoryMatch ? memoryMatch[1] : 'unknown';
    
    redisMetrics.lastHealthCheck = new Date().toISOString();
    redisMetrics.lastHealthCheckResult = 'healthy';
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      memoryUsed,
      connectionStatus: redisStatus,
      reconnectAttempts: redisReconnectAttempts,
      lastError: redisLastError,
      lastErrorTime: redisLastErrorTime
    };
  } catch (error) {
    redisMetrics.lastHealthCheck = new Date().toISOString();
    redisMetrics.lastHealthCheckResult = 'unhealthy';
    redisMetrics.errors++;
    
    return {
      status: 'unhealthy',
      error: error.message,
      connectionStatus: redisStatus,
      reconnectAttempts: redisReconnectAttempts,
      lastError: redisLastError,
      lastErrorTime: redisLastErrorTime
    };
  }
}

/**
 * Get Redis memory usage
 */
async function getRedisMemoryUsage() {
  if (!isRedisReady()) {
    return null;
  }

  try {
    const info = await redisClient.info('memory');
    const stats = {};
    
    // Parse memory info
    const patterns = {
      used_memory: /used_memory:(\d+)/,
      used_memory_human: /used_memory_human:([^\r\n]+)/,
      used_memory_peak: /used_memory_peak:(\d+)/,
      used_memory_peak_human: /used_memory_peak_human:([^\r\n]+)/,
      maxmemory: /maxmemory:(\d+)/,
      maxmemory_human: /maxmemory_human:([^\r\n]+)/
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = info.match(pattern);
      if (match) {
        stats[key] = match[1];
      }
    }
    
    return stats;
  } catch (error) {
    logger.error('Failed to get Redis memory usage', { error: error.message });
    return null;
  }
}

function getStats() {
  const totalRequests = redisMetrics.hits + redisMetrics.misses;
  const hitRate = totalRequests > 0 
    ? ((redisMetrics.hits / totalRequests) * 100).toFixed(2)
    : 0;

  return {
    memory: {
      entries: memoryCache.size,
      capacity: cacheConfig.lruMaxItems,
      utilizationPercent: ((memoryCache.size / cacheConfig.lruMaxItems) * 100).toFixed(2)
    },
    redis: {
      enabled: cacheConfig.redisEnabled,
      status: redisStatus,
      hits: redisMetrics.hits,
      misses: redisMetrics.misses,
      errors: redisMetrics.errors,
      reconnects: redisMetrics.reconnects,
      hitRate: `${hitRate}%`,
      lastHealthCheck: redisMetrics.lastHealthCheck,
      lastHealthCheckResult: redisMetrics.lastHealthCheckResult,
      lastError: redisLastError,
      lastErrorTime: redisLastErrorTime,
      reconnectAttempts: redisReconnectAttempts
    }
  };
}

module.exports = {
  get,
  set,
  del,
  wrap,
  invalidateNamespace,
  getStats,
  checkRedisHealth,
  getRedisMemoryUsage,
  isRedisReady: () => isRedisReady()
};
