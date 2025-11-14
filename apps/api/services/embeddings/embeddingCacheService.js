// ============================================================
// EMBEDDING CACHE SERVICE
// ============================================================
// This service manages the caching of job description embeddings
// to avoid redundant OpenAI API calls and improve performance

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const logger = require('../../utils/logger');
const { generateJobEmbedding } = require('./embeddingService');

const prisma = new PrismaClient();

/**
 * Generate hash for job description
 * Uses SHA-256 to create a unique identifier for cache lookup
 * @param {string} jobDescription - Job description text
 * @returns {string} SHA-256 hash
 */
function generateJobHash(jobDescription) {
  // Normalize the job description before hashing
  // - Convert to lowercase
  // - Remove extra whitespace
  // - Trim
  const normalized = jobDescription
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}

/**
 * Get job embedding from cache
 * @param {string} jobDescription - Job description text
 * @returns {Promise<{embedding: Array<number>, fromCache: boolean, metadata?: Object}|null>}
 */
async function getCachedJobEmbedding(jobDescription) {
  try {
    const jobHash = generateJobHash(jobDescription);
    
    logger.debug('Checking cache for job embedding', { jobHash });
    
    // Query cache
    const cached = await prisma.$queryRaw`
      SELECT 
        job_hash,
        embedding::text as embedding_text,
        metadata,
        hit_count,
        created_at,
        expires_at
      FROM job_embeddings
      WHERE job_hash = ${jobHash}
      AND expires_at > NOW()
    `;
    
    if (cached.length === 0) {
      logger.debug('Cache miss for job embedding', { jobHash });
      return null;
    }
    
    const entry = cached[0];
    
    // Parse embedding from text format
    const embeddingArray = JSON.parse(entry.embedding_text);
    
    // Update hit count and updated_at
    await prisma.$executeRawUnsafe(
      `UPDATE job_embeddings 
       SET hit_count = hit_count + 1, updated_at = NOW() 
       WHERE job_hash = $1`,
      jobHash
    );
    
    logger.info('Cache hit for job embedding', {
      jobHash,
      hitCount: entry.hit_count + 1,
      age: Date.now() - new Date(entry.created_at).getTime(),
      ttl: new Date(entry.expires_at).getTime() - Date.now()
    });
    
    return {
      embedding: embeddingArray,
      fromCache: true,
      metadata: entry.metadata || {},
      cacheInfo: {
        jobHash,
        hitCount: entry.hit_count + 1,
        createdAt: entry.created_at,
        expiresAt: entry.expires_at
      }
    };
    
  } catch (error) {
    logger.error('Error retrieving from cache', {
      error: error.message,
      stack: error.stack
    });
    // Return null on error so caller can generate new embedding
    return null;
  }
}

/**
 * Store job embedding in cache
 * @param {string} jobDescription - Job description text
 * @param {Array<number>} embedding - Embedding vector
 * @param {Object} metadata - Optional metadata (e.g., extracted skills)
 * @param {number} ttlHours - Time to live in hours (default: 24)
 * @returns {Promise<{jobHash: string, stored: boolean}>}
 */
async function cacheJobEmbedding(jobDescription, embedding, metadata = {}, ttlHours = 24) {
  try {
    const jobHash = generateJobHash(jobDescription);
    
    logger.debug('Storing job embedding in cache', {
      jobHash,
      embeddingDimensions: embedding.length,
      metadataKeys: Object.keys(metadata),
      ttlHours
    });
    
    // Validate embedding
    if (!Array.isArray(embedding) || embedding.length !== 1536) {
      throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0}`);
    }
    
    // Convert embedding to PostgreSQL vector format
    const embeddingStr = `[${embedding.join(',')}]`;
    
    // Upsert (insert or update if exists)
    await prisma.$executeRawUnsafe(
      `INSERT INTO job_embeddings (
        job_hash,
        job_description,
        embedding,
        metadata,
        created_at,
        updated_at,
        expires_at
      ) VALUES (
        $1, $2, $3::vector, $4::jsonb, NOW(), NOW(), NOW() + INTERVAL '${ttlHours} hours'
      )
      ON CONFLICT (job_hash) DO UPDATE SET
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata,
        updated_at = NOW(),
        expires_at = NOW() + INTERVAL '${ttlHours} hours'`,
      jobHash,
      jobDescription.substring(0, 5000), // Limit job description length
      embeddingStr,
      JSON.stringify(metadata)
    );
    
    logger.info('Job embedding cached successfully', {
      jobHash,
      ttlHours,
      expiresAt: new Date(Date.now() + ttlHours * 3600000).toISOString()
    });
    
    return {
      jobHash,
      stored: true
    };
    
  } catch (error) {
    logger.error('Error caching job embedding', {
      error: error.message,
      stack: error.stack
    });
    
    // Don't throw - caching failure shouldn't block the operation
    return {
      jobHash: generateJobHash(jobDescription),
      stored: false,
      error: error.message
    };
  }
}

/**
 * Get or generate job embedding
 * This is the main method to use - checks cache first, generates if not found
 * @param {string} jobDescription - Job description text
 * @param {Object} options - Options
 * @param {Object} options.metadata - Metadata to store with embedding
 * @param {number} options.ttlHours - Cache TTL in hours (default: 24)
 * @param {boolean} options.forceRefresh - Skip cache and generate new (default: false)
 * @returns {Promise<{embedding: Array<number>, fromCache: boolean, metadata?: Object}>}
 */
async function getOrGenerateJobEmbedding(jobDescription, options = {}) {
  const {
    metadata = {},
    ttlHours = 24,
    forceRefresh = false
  } = options;
  
  const startTime = Date.now();
  
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await getCachedJobEmbedding(jobDescription);
      
      if (cached) {
        const duration = Date.now() - startTime;
        logger.info('Using cached job embedding', {
          duration,
          hitCount: cached.cacheInfo.hitCount
        });
        return cached;
      }
    }
    
    // Cache miss or force refresh - generate new embedding
    logger.info('Generating new job embedding', {
      forceRefresh,
      jobDescriptionLength: jobDescription.length
    });
    
    const embedding = await generateJobEmbedding(jobDescription);
    
    // Store in cache
    await cacheJobEmbedding(jobDescription, embedding, metadata, ttlHours);
    
    const duration = Date.now() - startTime;
    
    logger.info('Job embedding generated and cached', {
      duration,
      fromCache: false
    });
    
    return {
      embedding,
      fromCache: false,
      metadata
    };
    
  } catch (error) {
    logger.error('Failed to get or generate job embedding', {
      error: error.message,
      jobDescriptionLength: jobDescription.length
    });
    throw error;
  }
}

/**
 * Clean up expired cache entries
 * @returns {Promise<{deleted: number}>}
 */
async function cleanupExpiredCache() {
  try {
    logger.info('Starting cache cleanup');
    
    const result = await prisma.$queryRaw`
      SELECT cleanup_expired_job_embeddings() AS deleted
    `;
    
    const deleted = result[0].deleted;
    
    logger.info('Cache cleanup complete', { deleted });
    
    return { deleted };
    
  } catch (error) {
    logger.error('Cache cleanup failed', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
async function getCacheStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        total_cached_jobs,
        total_cache_hits,
        avg_hits_per_job,
        expired_entries,
        active_entries,
        most_recent_use,
        oldest_entry
      FROM job_embedding_cache_stats
    `;
    
    if (stats.length === 0) {
      return {
        totalCachedJobs: 0,
        totalCacheHits: 0,
        avgHitsPerJob: 0,
        expiredEntries: 0,
        activeEntries: 0,
        mostRecentUse: null,
        oldestEntry: null
      };
    }
    
    const s = stats[0];
    
    // Convert BigInt values to regular numbers
    const totalCachedJobs = Number(s.total_cached_jobs || 0);
    const totalCacheHits = Number(s.total_cache_hits || 0);
    const expiredEntries = Number(s.expired_entries || 0);
    const activeEntries = Number(s.active_entries || 0);
    
    // Calculate hit rate
    const hitRate = totalCachedJobs > 0 
      ? (totalCacheHits / totalCachedJobs * 100).toFixed(2)
      : 0;
    
    return {
      totalCachedJobs,
      totalCacheHits,
      avgHitsPerJob: parseFloat(s.avg_hits_per_job) || 0,
      expiredEntries,
      activeEntries,
      hitRate: parseFloat(hitRate),
      mostRecentUse: s.most_recent_use,
      oldestEntry: s.oldest_entry
    };
    
  } catch (error) {
    logger.error('Failed to get cache stats', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Invalidate cache entry for specific job description
 * @param {string} jobDescription - Job description text
 * @returns {Promise<{deleted: boolean}>}
 */
async function invalidateCacheEntry(jobDescription) {
  try {
    const jobHash = generateJobHash(jobDescription);
    
    logger.info('Invalidating cache entry', { jobHash });
    
    await prisma.$executeRawUnsafe(
      `DELETE FROM job_embeddings WHERE job_hash = $1`,
      jobHash
    );
    
    logger.info('Cache entry invalidated', { jobHash });
    
    return { deleted: true };
    
  } catch (error) {
    logger.error('Failed to invalidate cache entry', {
      error: error.message
    });
    return { deleted: false, error: error.message };
  }
}

/**
 * Clear all cache entries
 * USE WITH CAUTION!
 * @returns {Promise<{deleted: number}>}
 */
async function clearAllCache() {
  try {
    logger.warn('Clearing ALL cache entries');
    
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM job_embeddings`
    );
    
    logger.warn('All cache cleared', { deleted: result });
    
    return { deleted: result };
    
  } catch (error) {
    logger.error('Failed to clear cache', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  generateJobHash,
  getCachedJobEmbedding,
  cacheJobEmbedding,
  getOrGenerateJobEmbedding,
  cleanupExpiredCache,
  getCacheStats,
  invalidateCacheEntry,
  clearAllCache
};

