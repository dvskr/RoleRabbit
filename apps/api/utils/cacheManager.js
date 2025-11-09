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

function buildRedisOptions() {
  const options = {
    lazyConnect: cacheConfig.redisLazyConnect,
    maxRetriesPerRequest: 1,
    enableAutoPipelining: true
  };

  if (cacheConfig.redisTls) {
    options.tls = {};
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
    logger.info('Redis cache connected');
  });

  redisClient.on('error', (error) => {
    redisStatus = 'error';
    logger.error('Redis cache error', { error: error.message });
  });

  redisClient.on('end', () => {
    redisStatus = 'disconnected';
    if (cacheConfig.redisReconnectIntervalMs > 0) {
      setTimeout(() => {
        try {
          redisClient.connect().catch((error) => {
            logger.error('Redis reconnect failed', { error: error.message });
          });
        } catch (error) {
          logger.error('Redis reconnect threw', { error: error.message });
        }
      }, cacheConfig.redisReconnectIntervalMs);
    }
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
    return undefined;
  }

  try {
    const raw = await redisClient.get(toRedisKey(key));
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw);
  } catch (error) {
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

function getStats() {
  return {
    memoryEntries: memoryCache.size,
    memoryCapacity: cacheConfig.lruMaxItems,
    redisEnabled: cacheConfig.redisEnabled,
    redisStatus
  };
}

module.exports = {
  get,
  set,
  del,
  wrap,
  invalidateNamespace,
  getStats
};
