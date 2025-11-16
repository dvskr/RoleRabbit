/**
 * Scaling Configuration
 * INFRA-015 to INFRA-020: Scaling considerations for My Files feature
 */

const logger = require('../utils/logger');
const { getEnv } = require('../utils/envValidation');

/**
 * INFRA-015: Horizontal scaling support for file uploads
 * Use shared storage (Supabase), not local filesystem
 */
function getStorageConfig() {
  const storageType = getEnv('STORAGE_TYPE', 'local').toLowerCase();
  
  if (storageType === 'local') {
    logger.warn('⚠️ Using local filesystem storage - not suitable for horizontal scaling');
    logger.warn('⚠️ Consider using Supabase Storage or S3 for production');
  }
  
  return {
    type: storageType,
    shared: storageType !== 'local', // Shared storage supports horizontal scaling
    path: getEnv('STORAGE_PATH', './storage')
  };
}

/**
 * INFRA-016: CDN for public file serving
 */
function getCDNConfig() {
  const cdnUrl = getEnv('CDN_URL');
  const cdnEnabled = !!cdnUrl;
  
  if (cdnEnabled) {
    logger.info(`✅ CDN enabled: ${cdnUrl}`);
  } else {
    logger.warn('⚠️ CDN not configured - consider using CDN for public file serving');
  }
  
  return {
    enabled: cdnEnabled,
    url: cdnUrl,
    // Replace Supabase domain with CDN URL for public files
    replaceDomain: (url) => {
      if (!cdnUrl || !url) return url;
      // Replace Supabase domain with CDN domain
      return url.replace(/https:\/\/[^/]+\.supabase\.co/, cdnUrl);
    }
  };
}

/**
 * INFRA-017: Database connection pooling configuration
 */
function getDatabasePoolConfig() {
  return {
    // Prisma connection pool settings
    // These should be set in DATABASE_URL or Prisma schema
    maxConnections: parseInt(getEnv('DB_POOL_MAX', '10')),
    minConnections: parseInt(getEnv('DB_POOL_MIN', '2')),
    connectionTimeout: parseInt(getEnv('DB_POOL_TIMEOUT', '10000')),
    
    // Optimize for file operations
    // File operations are typically read-heavy with occasional writes
    // Consider read replicas for scaling reads
    readReplicas: getEnv('DB_READ_REPLICA_URL') ? [getEnv('DB_READ_REPLICA_URL')] : []
  };
}

/**
 * INFRA-018: Caching layer for file metadata (Redis)
 */
function getCacheConfig() {
  const redisUrl = getEnv('REDIS_URL', 'redis://localhost:6379');
  const cacheEnabled = !!redisUrl;
  
  if (cacheEnabled) {
    logger.info('✅ Redis caching enabled');
  } else {
    logger.warn('⚠️ Redis caching not configured - consider using Redis for file metadata caching');
  }
  
  return {
    enabled: cacheEnabled,
    url: redisUrl,
    ttl: {
      fileMetadata: 3600, // 1 hour
      fileList: 300, // 5 minutes
      quota: 600 // 10 minutes
    }
  };
}

/**
 * INFRA-019: Load balancing configuration for file download endpoints
 */
function getLoadBalancerConfig() {
  return {
    // Sticky sessions not needed for file downloads (stateless)
    // Use round-robin or least-connections
    strategy: getEnv('LB_STRATEGY', 'round-robin'),
    
    // Health check configuration
    healthCheck: {
      enabled: true,
      path: '/api/storage/health',
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      unhealthyThreshold: 3,
      healthyThreshold: 2
    },
    
    // File download specific settings
    download: {
      // Use CDN for public files
      useCDN: true,
      // Direct storage access for private files (signed URLs)
      useSignedUrls: true,
      // Timeout for download requests
      timeout: 300000 // 5 minutes
    }
  };
}

/**
 * INFRA-020: Storage quota limits per subscription tier
 */
function getStorageQuotaLimits() {
  return {
    FREE: {
      limitBytes: 5 * 1024 * 1024 * 1024, // 5GB
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 100
    },
    PRO: {
      limitBytes: 50 * 1024 * 1024 * 1024, // 50GB
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 1000
    },
    PREMIUM: {
      limitBytes: 500 * 1024 * 1024 * 1024, // 500GB
      maxFileSize: 500 * 1024 * 1024, // 500MB
      maxFiles: 10000
    }
  };
}

/**
 * Get quota limit for subscription tier
 */
function getQuotaLimitForTier(tier) {
  const limits = getStorageQuotaLimits();
  // Handle null, undefined, or invalid tier by defaulting to FREE
  const normalizedTier = (tier && typeof tier === 'string') ? tier.toUpperCase() : 'FREE';
  return limits[normalizedTier] || limits.FREE;
}

/**
 * Enforce quota limits based on subscription tier
 */
async function enforceQuotaLimits(userId, fileSize, prisma) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const limits = getQuotaLimitForTier(user.subscriptionTier);
  
  // Check file size limit
  if (fileSize > limits.maxFileSize) {
    throw new Error(`File size exceeds limit for ${user.subscriptionTier} tier: ${(limits.maxFileSize / 1024 / 1024).toFixed(0)}MB`);
  }
  
  // Check total quota
  const quota = await prisma.storage_quotas.findUnique({
    where: { userId }
  });
  
  if (quota) {
    const newUsed = Number(quota.usedBytes) + fileSize;
    if (newUsed > limits.limitBytes) {
      throw new Error(`Storage quota exceeded for ${user.subscriptionTier} tier: ${(limits.limitBytes / 1024 / 1024 / 1024).toFixed(0)}GB`);
    }
  }
  
  return limits;
}

module.exports = {
  getStorageConfig,
  getCDNConfig,
  getDatabasePoolConfig,
  getCacheConfig,
  getLoadBalancerConfig,
  getStorageQuotaLimits,
  getQuotaLimitForTier,
  enforceQuotaLimits
};

