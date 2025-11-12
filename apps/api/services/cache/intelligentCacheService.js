/**
 * Intelligent Caching Service
 * Advanced caching strategies for optimal performance
 */

const cacheManager = require('../../utils/cacheManager');
const { CACHE_NAMESPACES, buildCacheKey } = require('../../utils/cacheKeys');
const logger = require('../../utils/logger');
const crypto = require('crypto');

/**
 * Cache with automatic compression for large objects
 */
async function cacheWithCompression(namespace, keyParts, value, options = {}) {
  const serialized = JSON.stringify(value);
  const sizeKB = Buffer.byteLength(serialized) / 1024;

  // Compress if > 100KB
  if (sizeKB > 100) {
    const zlib = require('zlib');
    const compressed = zlib.gzipSync(serialized);
    const compressedSizeKB = compressed.length / 1024;
    
    logger.info('Caching with compression', {
      namespace,
      originalSizeKB: sizeKB.toFixed(2),
      compressedSizeKB: compressedSizeKB.toFixed(2),
      compressionRatio: `${((1 - compressedSizeKB / sizeKB) * 100).toFixed(1)}%`
    });

    await cacheManager.set(namespace, [...keyParts, '__compressed'], {
      compressed: true,
      data: compressed.toString('base64')
    }, options);
  } else {
    await cacheManager.set(namespace, keyParts, value, options);
  }
}

/**
 * Get cached value with automatic decompression
 */
async function getCachedWithDecompression(namespace, keyParts) {
  // Try compressed version first
  const compressed = await cacheManager.get(namespace, [...keyParts, '__compressed']);
  
  if (compressed && compressed.compressed) {
    const zlib = require('zlib');
    const buffer = Buffer.from(compressed.data, 'base64');
    const decompressed = zlib.gunzipSync(buffer).toString();
    return JSON.parse(decompressed);
  }

  // Fall back to regular cache
  return await cacheManager.get(namespace, keyParts);
}

/**
 * Cache ATS score with intelligent TTL based on change frequency
 */
async function cacheATSScore({ userId, resumeId, jobDescriptionHash, score }) {
  // Longer TTL for higher scores (they're less likely to be re-tailored soon)
  const baseTTL = 6 * 60 * 60 * 1000; // 6 hours
  const scoreFactor = score.overall / 100;
  const dynamicTTL = baseTTL * (0.5 + scoreFactor); // 3-9 hours based on score

  await cacheManager.set(
    CACHE_NAMESPACES.ATS_SCORE,
    [userId, resumeId, jobDescriptionHash],
    score,
    { ttl: dynamicTTL }
  );

  logger.debug('Cached ATS score with dynamic TTL', {
    userId,
    score: score.overall,
    ttlHours: (dynamicTTL / (60 * 60 * 1000)).toFixed(1)
  });
}

/**
 * Cache embedding with permanent storage (embeddings don't change)
 */
async function cacheEmbedding(resumeHash, embedding) {
  // Embeddings are permanent (resume content → fixed embedding)
  const ttl = 90 * 24 * 60 * 60 * 1000; // 90 days

  // Store with compression (embeddings are large arrays)
  await cacheWithCompression(
    CACHE_NAMESPACES.RESUME_EMBEDDING,
    [resumeHash],
    embedding,
    { ttl }
  );

  logger.info('Cached embedding (long-term)', {
    resumeHash: resumeHash.substring(0, 12),
    dimensions: embedding.length,
    ttlDays: 90
  });
}

/**
 * Get cached embedding
 */
async function getCachedEmbedding(resumeHash) {
  return await getCachedWithDecompression(
    CACHE_NAMESPACES.RESUME_EMBEDDING,
    [resumeHash]
  );
}

/**
 * Cache job analysis (skills, requirements) with long TTL
 */
async function cacheJobAnalysis(jobDescriptionHash, analysis) {
  const ttl = 24 * 60 * 60 * 1000; // 24 hours

  await cacheManager.set(
    CACHE_NAMESPACES.JOB_ANALYSIS,
    [jobDescriptionHash],
    analysis,
    { ttl }
  );
}

/**
 * Preload cache with frequently accessed data
 */
async function warmCache(userId) {
  try {
    logger.info('Starting cache warming for user', { userId });

    // Fetch user's recent resumes and pre-cache their data
    const { prisma } = require('../../utils/db');
    
    const resumes = await prisma.baseResume.findMany({
      where: { userId, isActive: true },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });

    const warmingTasks = resumes.map(async (resume) => {
      // Pre-cache resume data
      await cacheManager.set(
        CACHE_NAMESPACES.RESUME_DATA,
        [userId, resume.id],
        resume.data,
        { ttl: 60 * 60 * 1000 } // 1 hour
      );

      // Pre-generate embedding if not cached
      if (resume.data && !await getCachedEmbedding(resume.id)) {
        try {
          const { generateResumeEmbedding } = require('../embeddings/embeddingService');
          const embedding = await generateResumeEmbedding(resume.data);
          await cacheEmbedding(resume.id, embedding);
        } catch (err) {
          logger.warn('Failed to pre-generate embedding during cache warming', {
            resumeId: resume.id,
            error: err.message
          });
        }
      }
    });

    await Promise.all(warmingTasks);

    logger.info('Cache warming completed', { userId, resumesWarmed: resumes.length });
    
    return { success: true, resumesWarmed: resumes.length };

  } catch (error) {
    logger.error('Cache warming failed', { userId, error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Cache popular job descriptions and their analyses
 */
async function cachePopularJobs() {
  try {
    // Find most frequently used job descriptions
    const { prisma } = require('../../utils/db');
    
    const popularJobs = await prisma.$queryRaw`
      SELECT 
        "jobDescriptionHash",
        COUNT(*) as usage_count
      FROM "tailored_versions"
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY "jobDescriptionHash"
      ORDER BY usage_count DESC
      LIMIT 20
    `;

    logger.info('Caching popular job descriptions', { count: popularJobs.length });

    // Pre-cache their analyses
    for (const job of popularJobs) {
      const cached = await cacheManager.get(
        CACHE_NAMESPACES.JOB_ANALYSIS,
        [job.jobDescriptionHash]
      );

      if (!cached) {
        logger.debug('Job analysis not in cache (will be generated on next use)', {
          hash: job.jobDescriptionHash.substring(0, 12),
          usageCount: job.usage_count
        });
      }
    }

    return { success: true, jobsCached: popularJobs.length };

  } catch (error) {
    logger.error('Failed to cache popular jobs', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Get cache statistics and performance metrics
 */
async function getCacheStats() {
  const stats = cacheManager.getStats();

  return {
    ...stats,
    timestamp: new Date().toISOString(),
    recommendations: generateCacheRecommendations(stats)
  };
}

/**
 * Generate recommendations based on cache performance
 */
function generateCacheRecommendations(stats) {
  const recommendations = [];

  if (!stats.redisEnabled) {
    recommendations.push({
      level: 'high',
      message: 'Redis is not enabled. Enable it for better performance across multiple instances.',
      action: 'Set REDIS_URL environment variable'
    });
  }

  if (stats.redisStatus === 'error') {
    recommendations.push({
      level: 'critical',
      message: 'Redis connection error. Check Redis server status.',
      action: 'Verify Redis connection and credentials'
    });
  }

  const memoryUsage = (stats.memoryEntries / stats.memoryCapacity) * 100;
  if (memoryUsage > 80) {
    recommendations.push({
      level: 'medium',
      message: `Memory cache is ${memoryUsage.toFixed(0)}% full. Consider increasing capacity.`,
      action: 'Increase CACHE_LRU_MAX_ITEMS environment variable'
    });
  }

  return recommendations;
}

/**
 * Intelligent cache invalidation with cascade
 */
async function invalidateWithCascade(namespace, keyParts, options = {}) {
  const { cascadeTo = [] } = options;

  // Invalidate primary namespace
  await cacheManager.invalidateNamespace(namespace, keyParts);

  // Cascade to related namespaces
  for (const relatedNamespace of cascadeTo) {
    await cacheManager.invalidateNamespace(relatedNamespace, keyParts);
  }

  logger.info('Cache invalidated with cascade', {
    primary: namespace,
    cascaded: cascadeTo
  });
}

/**
 * Cache with automatic refresh for stale data
 */
async function cacheWithStaleWhileRevalidate({ namespace, keyParts, ttl, fetch, staleTtl }) {
  const cached = await cacheManager.get(namespace, keyParts);

  if (cached) {
    // Return cached immediately
    const cacheAge = Date.now() - (cached._cachedAt || 0);
    
    // If stale, refresh in background
    if (cacheAge > (staleTtl || ttl * 0.8)) {
      logger.debug('Cache stale, refreshing in background', { namespace });
      
      // Fire and forget refresh
      fetch()
        .then(value => {
          cacheManager.set(namespace, keyParts, {
            ...value,
            _cachedAt: Date.now()
          }, { ttl });
        })
        .catch(err => {
          logger.warn('Background cache refresh failed', {
            namespace,
            error: err.message
          });
        });
    }

    return { value: cached, fromCache: true, stale: cacheAge > (staleTtl || ttl * 0.8) };
  }

  // Not in cache, fetch and cache
  const value = await fetch();
  await cacheManager.set(namespace, keyParts, {
    ...value,
    _cachedAt: Date.now()
  }, { ttl });

  return { value, fromCache: false, stale: false };
}

/**
 * Batch cache operations for efficiency
 */
async function batchGet(requests) {
  const results = await Promise.all(
    requests.map(({ namespace, keyParts }) => 
      cacheManager.get(namespace, keyParts)
    )
  );

  return results;
}

async function batchSet(operations) {
  await Promise.all(
    operations.map(({ namespace, keyParts, value, options }) => 
      cacheManager.set(namespace, keyParts, value, options)
    )
  );
}

module.exports = {
  cacheWithCompression,
  getCachedWithDecompression,
  cacheATSScore,
  cacheEmbedding,
  getCachedEmbedding,
  cacheJobAnalysis,
  warmCache,
  cachePopularJobs,
  getCacheStats,
  invalidateWithCascade,
  cacheWithStaleWhileRevalidate,
  batchGet,
  batchSet
};

