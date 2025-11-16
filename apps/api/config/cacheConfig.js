/**
 * Cache Configuration
 * 
 * Defines TTLs, invalidation rules, and cache strategies for all namespaces
 */

/**
 * Cache TTL Configuration (in seconds)
 */
const CACHE_TTL = {
  // AI Operations
  JOB_ANALYSIS: 30 * 60,        // 30 minutes (reduced from 1 hour)
  ATS_SCORE: 60 * 60,           // 1 hour
  AI_DRAFT: 24 * 60 * 60,       // 24 hours
  AI_SUGGESTIONS: 15 * 60,      // 15 minutes
  
  // Resume Data
  RESUME_DATA: 5 * 60,          // 5 minutes
  RESUME_LIST: 2 * 60,          // 2 minutes
  WORKING_DRAFT: 1 * 60,        // 1 minute
  TAILORED_VERSIONS: 10 * 60,   // 10 minutes
  
  // Templates
  TEMPLATE_LIST: 60 * 60,       // 1 hour
  TEMPLATE_DETAIL: 60 * 60,     // 1 hour
  
  // User Data
  USER_PROFILE: 15 * 60,        // 15 minutes
  USER_SETTINGS: 30 * 60,       // 30 minutes
  
  // Analytics
  ANALYTICS: 60 * 60,           // 1 hour
  USAGE_STATS: 30 * 60,         // 30 minutes
  
  // Static Data
  CONSTANTS: 24 * 60 * 60,      // 24 hours
  CONFIG: 12 * 60 * 60          // 12 hours
};

/**
 * Cache Key Patterns
 */
const CACHE_KEYS = {
  // AI Operations
  JOB_ANALYSIS: (resumeId, jobId) => `job_analysis:${resumeId}:${jobId}`,
  ATS_SCORE: (resumeId) => `ats_score:${resumeId}`,
  AI_DRAFT: (resumeId, operation) => `ai_draft:${resumeId}:${operation}`,
  AI_SUGGESTIONS: (resumeId, type) => `ai_suggestions:${resumeId}:${type}`,
  
  // Resume Data
  RESUME_DATA: (resumeId) => `resume:${resumeId}`,
  RESUME_LIST: (userId) => `resume_list:${userId}`,
  WORKING_DRAFT: (resumeId) => `draft:${resumeId}`,
  TAILORED_VERSIONS: (resumeId) => `tailored:${resumeId}`,
  
  // Templates
  TEMPLATE_LIST: () => `templates:list`,
  TEMPLATE_DETAIL: (templateId) => `template:${templateId}`,
  
  // User Data
  USER_PROFILE: (userId) => `user:${userId}`,
  USER_SETTINGS: (userId) => `user_settings:${userId}`,
  
  // Analytics
  ANALYTICS: (resumeId) => `analytics:${resumeId}`,
  USAGE_STATS: (userId) => `usage:${userId}`
};

/**
 * Cache Invalidation Rules
 * 
 * Defines which caches to invalidate when certain events occur
 */
const INVALIDATION_RULES = {
  // When resume is updated
  RESUME_UPDATED: (resumeId, userId) => [
    CACHE_KEYS.RESUME_DATA(resumeId),
    CACHE_KEYS.RESUME_LIST(userId),
    CACHE_KEYS.WORKING_DRAFT(resumeId),
    CACHE_KEYS.ATS_SCORE(resumeId),
    CACHE_KEYS.JOB_ANALYSIS(resumeId, '*'), // Wildcard for all job analyses
    CACHE_KEYS.AI_SUGGESTIONS(resumeId, '*'),
    CACHE_KEYS.ANALYTICS(resumeId)
  ],
  
  // When draft is saved
  DRAFT_SAVED: (resumeId, userId) => [
    CACHE_KEYS.WORKING_DRAFT(resumeId),
    CACHE_KEYS.RESUME_LIST(userId),
    CACHE_KEYS.ATS_SCORE(resumeId)
  ],
  
  // When draft is committed to base resume
  DRAFT_COMMITTED: (resumeId, userId) => [
    CACHE_KEYS.RESUME_DATA(resumeId),
    CACHE_KEYS.WORKING_DRAFT(resumeId),
    CACHE_KEYS.RESUME_LIST(userId),
    CACHE_KEYS.ATS_SCORE(resumeId),
    CACHE_KEYS.JOB_ANALYSIS(resumeId, '*'),
    CACHE_KEYS.AI_SUGGESTIONS(resumeId, '*'),
    CACHE_KEYS.ANALYTICS(resumeId)
  ],
  
  // When tailored version is created
  TAILORED_CREATED: (resumeId, userId) => [
    CACHE_KEYS.TAILORED_VERSIONS(resumeId),
    CACHE_KEYS.RESUME_LIST(userId),
    CACHE_KEYS.ANALYTICS(resumeId)
  ],
  
  // When resume is deleted
  RESUME_DELETED: (resumeId, userId) => [
    CACHE_KEYS.RESUME_DATA(resumeId),
    CACHE_KEYS.RESUME_LIST(userId),
    CACHE_KEYS.WORKING_DRAFT(resumeId),
    CACHE_KEYS.TAILORED_VERSIONS(resumeId),
    CACHE_KEYS.ATS_SCORE(resumeId),
    CACHE_KEYS.JOB_ANALYSIS(resumeId, '*'),
    CACHE_KEYS.AI_SUGGESTIONS(resumeId, '*'),
    CACHE_KEYS.ANALYTICS(resumeId)
  ],
  
  // When user settings are updated
  USER_UPDATED: (userId) => [
    CACHE_KEYS.USER_PROFILE(userId),
    CACHE_KEYS.USER_SETTINGS(userId)
  ],
  
  // When template is updated
  TEMPLATE_UPDATED: (templateId) => [
    CACHE_KEYS.TEMPLATE_LIST(),
    CACHE_KEYS.TEMPLATE_DETAIL(templateId)
  ]
};

/**
 * Cache Warming Configuration
 * 
 * Data to pre-cache on application startup or user login
 */
const CACHE_WARMING = {
  // On application startup
  STARTUP: [
    {
      key: CACHE_KEYS.TEMPLATE_LIST(),
      fetch: async () => {
        const { prisma } = require('../config/database-advanced');
        return prisma.resumeTemplate.findMany({
          where: { isActive: true },
          orderBy: { usageCount: 'desc' }
        });
      },
      ttl: CACHE_TTL.TEMPLATE_LIST
    },
    {
      key: 'constants:app_config',
      fetch: async () => ({
        maxResumeSlots: 5,
        maxFileSize: 10485760,
        supportedFormats: ['pdf', 'docx', 'txt', 'json'],
        aiModels: ['gpt-4', 'gpt-3.5-turbo']
      }),
      ttl: CACHE_TTL.CONSTANTS
    }
  ],
  
  // On user login
  USER_LOGIN: (userId) => [
    {
      key: CACHE_KEYS.USER_PROFILE(userId),
      fetch: async () => {
        const { prisma } = require('../config/database-advanced');
        return prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            tier: true,
            resumeAiUsageCount: true,
            createdAt: true
          }
        });
      },
      ttl: CACHE_TTL.USER_PROFILE
    },
    {
      key: CACHE_KEYS.RESUME_LIST(userId),
      fetch: async () => {
        const { prisma } = require('../config/database-advanced');
        return prisma.baseResume.findMany({
          where: {
            userId,
            deletedAt: null
          },
          orderBy: { updatedAt: 'desc' }
        });
      },
      ttl: CACHE_TTL.RESUME_LIST
    }
  ]
};

/**
 * Cache Monitoring Configuration
 */
const CACHE_MONITORING = {
  // Alert thresholds
  MIN_HIT_RATE: 0.5,           // Alert if hit rate < 50%
  MAX_MISS_RATE: 0.5,          // Alert if miss rate > 50%
  MAX_ERROR_RATE: 0.05,        // Alert if error rate > 5%
  
  // Metrics collection interval
  METRICS_INTERVAL: 60000,     // 1 minute
  
  // Metrics retention
  METRICS_RETENTION: 7 * 24 * 60 * 60 // 7 days
};

/**
 * Cache Strategy Configuration
 */
const CACHE_STRATEGY = {
  // Default strategy: Cache-Aside (Lazy Loading)
  DEFAULT: 'cache-aside',
  
  // Write-Through: Write to cache and database simultaneously
  WRITE_THROUGH: ['USER_PROFILE', 'USER_SETTINGS'],
  
  // Write-Behind: Write to cache immediately, database asynchronously
  WRITE_BEHIND: ['ANALYTICS', 'USAGE_STATS'],
  
  // Cache-Aside: Check cache first, fetch from DB if miss
  CACHE_ASIDE: ['RESUME_DATA', 'TEMPLATE_LIST', 'ATS_SCORE']
};

/**
 * Get cache TTL for a namespace
 */
function getCacheTTL(namespace) {
  return CACHE_TTL[namespace] || CACHE_TTL.RESUME_DATA;
}

/**
 * Get cache key
 */
function getCacheKey(namespace, ...params) {
  const keyGenerator = CACHE_KEYS[namespace];
  if (!keyGenerator) {
    throw new Error(`Unknown cache namespace: ${namespace}`);
  }
  return keyGenerator(...params);
}

/**
 * Get invalidation keys for an event
 */
function getInvalidationKeys(event, ...params) {
  const rule = INVALIDATION_RULES[event];
  if (!rule) {
    console.warn(`No invalidation rule for event: ${event}`);
    return [];
  }
  return rule(...params);
}

/**
 * Get cache warming tasks
 */
function getCacheWarmingTasks(type, ...params) {
  if (type === 'STARTUP') {
    return CACHE_WARMING.STARTUP;
  } else if (type === 'USER_LOGIN') {
    return CACHE_WARMING.USER_LOGIN(...params);
  }
  return [];
}

module.exports = {
  CACHE_TTL,
  CACHE_KEYS,
  INVALIDATION_RULES,
  CACHE_WARMING,
  CACHE_MONITORING,
  CACHE_STRATEGY,
  getCacheTTL,
  getCacheKey,
  getInvalidationKeys,
  getCacheWarmingTasks
};
