/**
 * Cache Manager
 * 
 * Unified cache management with invalidation, warming, and monitoring
 */

const { redisCache } = require('./redisCache');
const { getInvalidationKeys, getCacheWarmingTasks, CACHE_MONITORING } = require('../config/cacheConfig');

/**
 * Cache statistics
 */
const cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  sets: 0,
  deletes: 0,
  lastReset: Date.now()
};

/**
 * Invalidate cache based on event
 */
async function invalidateCache(event, ...params) {
  try {
    const keys = getInvalidationKeys(event, ...params);
    
    if (keys.length === 0) {
      return { success: true, keysInvalidated: 0 };
    }

    console.log(`🗑️  Invalidating ${keys.length} cache keys for event: ${event}`);

    let invalidated = 0;
    for (const key of keys) {
      // Handle wildcard keys
      if (key.includes('*')) {
        const pattern = key.replace('*', '*');
        const matchingKeys = await redisCache.keys(pattern);
        for (const matchingKey of matchingKeys) {
          await redisCache.del(matchingKey);
          invalidated++;
        }
      } else {
        await redisCache.del(key);
        invalidated++;
      }
    }

    cacheStats.deletes += invalidated;

    console.log(`✅ Invalidated ${invalidated} cache keys`);

    return {
      success: true,
      keysInvalidated: invalidated,
      event
    };

  } catch (error) {
    console.error(`❌ Cache invalidation failed for event: ${event}`, error);
    cacheStats.errors++;
    return {
      success: false,
      error: error.message,
      event
    };
  }
}

/**
 * Warm cache with predefined data
 */
async function warmCache(type, ...params) {
  try {
    const tasks = getCacheWarmingTasks(type, ...params);
    
    if (tasks.length === 0) {
      return { success: true, keysWarmed: 0 };
    }

    console.log(`🔥 Warming ${tasks.length} cache keys for: ${type}`);

    let warmed = 0;
    for (const task of tasks) {
      try {
        const data = await task.fetch();
        await redisCache.set(task.key, data, task.ttl);
        warmed++;
        cacheStats.sets++;
      } catch (error) {
        console.error(`Failed to warm cache key: ${task.key}`, error);
        cacheStats.errors++;
      }
    }

    console.log(`✅ Warmed ${warmed} cache keys`);

    return {
      success: true,
      keysWarmed: warmed,
      type
    };

  } catch (error) {
    console.error(`❌ Cache warming failed for type: ${type}`, error);
    cacheStats.errors++;
    return {
      success: false,
      error: error.message,
      type
    };
  }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? cacheStats.hits / total : 0;
  const missRate = total > 0 ? cacheStats.misses / total : 0;
  const errorRate = total > 0 ? cacheStats.errors / total : 0;

  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    errors: cacheStats.errors,
    sets: cacheStats.sets,
    deletes: cacheStats.deletes,
    total,
    hitRate: (hitRate * 100).toFixed(2) + '%',
    missRate: (missRate * 100).toFixed(2) + '%',
    errorRate: (errorRate * 100).toFixed(2) + '%',
    uptime: Date.now() - cacheStats.lastReset,
    lastReset: new Date(cacheStats.lastReset).toISOString()
  };
}

/**
 * Reset cache statistics
 */
function resetCacheStats() {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.errors = 0;
  cacheStats.sets = 0;
  cacheStats.deletes = 0;
  cacheStats.lastReset = Date.now();
  
  console.log('📊 Cache statistics reset');
}

/**
 * Track cache hit
 */
function trackCacheHit() {
  cacheStats.hits++;
}

/**
 * Track cache miss
 */
function trackCacheMiss() {
  cacheStats.misses++;
}

/**
 * Track cache error
 */
function trackCacheError() {
  cacheStats.errors++;
}

/**
 * Check cache health
 */
function checkCacheHealth() {
  const stats = getCacheStats();
  const hitRate = parseFloat(stats.hitRate) / 100;
  const errorRate = parseFloat(stats.errorRate) / 100;

  const issues = [];

  // Check hit rate
  if (hitRate < CACHE_MONITORING.MIN_HIT_RATE) {
    issues.push({
      severity: 'warning',
      message: `Cache hit rate is low: ${stats.hitRate} (threshold: ${CACHE_MONITORING.MIN_HIT_RATE * 100}%)`,
      recommendation: 'Consider increasing cache TTLs or improving cache warming strategy'
    });
  }

  // Check error rate
  if (errorRate > CACHE_MONITORING.MAX_ERROR_RATE) {
    issues.push({
      severity: 'critical',
      message: `Cache error rate is high: ${stats.errorRate} (threshold: ${CACHE_MONITORING.MAX_ERROR_RATE * 100}%)`,
      recommendation: 'Check Redis connection and error logs'
    });
  }

  return {
    healthy: issues.length === 0,
    stats,
    issues
  };
}

/**
 * Monitor cache performance
 */
function startCacheMonitoring() {
  console.log('📊 Starting cache monitoring...');

  const interval = setInterval(() => {
    const health = checkCacheHealth();

    if (!health.healthy) {
      console.warn('⚠️  Cache health issues detected:');
      health.issues.forEach(issue => {
        console.warn(`  [${issue.severity}] ${issue.message}`);
        console.warn(`  → ${issue.recommendation}`);
      });
    }

    // Log stats periodically
    if (process.env.LOG_CACHE_STATS === 'true') {
      console.log('📊 Cache Stats:', health.stats);
    }

  }, CACHE_MONITORING.METRICS_INTERVAL);

  // Cleanup on shutdown
  process.on('SIGTERM', () => {
    clearInterval(interval);
  });

  return interval;
}

/**
 * Flush all cache
 */
async function flushCache() {
  try {
    await redisCache.flushall();
    resetCacheStats();
    console.log('🗑️  Cache flushed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to flush cache:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  invalidateCache,
  warmCache,
  getCacheStats,
  resetCacheStats,
  trackCacheHit,
  trackCacheMiss,
  trackCacheError,
  checkCacheHealth,
  startCacheMonitoring,
  flushCache
};
