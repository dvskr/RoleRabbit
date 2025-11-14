/**
 * Application Performance Monitoring (APM) Utility
 * Tracks API response times, database queries, and AI operations
 */

const logger = require('./logger');

/**
 * Performance metrics storage (in-memory)
 * In production, this should be sent to APM service (New Relic, Datadog, etc.)
 */
const metrics = {
  apiRequests: [],
  databaseQueries: [],
  aiOperations: [],
  cacheHits: 0,
  cacheMisses: 0
};

// Keep only last 1000 entries to prevent memory leak
const MAX_METRICS = 1000;

/**
 * Track API request performance
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} duration - Duration in milliseconds
 * @param {number} statusCode - HTTP status code
 */
function trackAPIRequest(method, path, duration, statusCode) {
  const metric = {
    type: 'api_request',
    method,
    path,
    duration,
    statusCode,
    timestamp: Date.now()
  };

  metrics.apiRequests.push(metric);
  
  // Trim array if too large
  if (metrics.apiRequests.length > MAX_METRICS) {
    metrics.apiRequests.shift();
  }

  // Log slow requests (>5 seconds)
  if (duration > 5000) {
    logger.warn('[APM] Slow API request detected', {
      method,
      path,
      duration,
      statusCode
    });
  }
}

/**
 * Track database query performance
 * @param {string} operation - Query operation (SELECT, INSERT, etc.)
 * @param {string} table - Table name
 * @param {number} duration - Duration in milliseconds
 */
function trackDatabaseQuery(operation, table, duration) {
  const metric = {
    type: 'database_query',
    operation,
    table,
    duration,
    timestamp: Date.now()
  };

  metrics.databaseQueries.push(metric);
  
  // Trim array if too large
  if (metrics.databaseQueries.length > MAX_METRICS) {
    metrics.databaseQueries.shift();
  }

  // Log slow queries (>100ms)
  if (duration > 100) {
    logger.warn('[APM] Slow database query detected', {
      operation,
      table,
      duration
    });
  }
}

/**
 * Track AI operation performance
 * @param {string} operation - AI operation type (parsing, ats, tailoring)
 * @param {string} model - AI model used
 * @param {number} duration - Duration in milliseconds
 * @param {number} tokens - Tokens used
 * @param {boolean} success - Whether operation succeeded
 */
function trackAIOperation(operation, model, duration, tokens, success) {
  const metric = {
    type: 'ai_operation',
    operation,
    model,
    duration,
    tokens,
    success,
    timestamp: Date.now()
  };

  metrics.aiOperations.push(metric);
  
  // Trim array if too large
  if (metrics.aiOperations.length > MAX_METRICS) {
    metrics.aiOperations.shift();
  }

  // Log slow AI operations (>30 seconds)
  if (duration > 30000) {
    logger.warn('[APM] Slow AI operation detected', {
      operation,
      model,
      duration,
      tokens,
      success
    });
  }

  // Log failed operations
  if (!success) {
    logger.error('[APM] AI operation failed', {
      operation,
      model,
      duration
    });
  }
}

/**
 * Track cache hit
 */
function trackCacheHit() {
  metrics.cacheHits++;
}

/**
 * Track cache miss
 */
function trackCacheMiss() {
  metrics.cacheMisses++;
}

/**
 * Get performance statistics
 * @returns {Object} Performance statistics
 */
function getStatistics() {
  const now = Date.now();
  const last5Minutes = now - 5 * 60 * 1000;
  const last1Hour = now - 60 * 60 * 1000;

  // Filter recent metrics
  const recentAPIRequests = metrics.apiRequests.filter(m => m.timestamp > last5Minutes);
  const recentDBQueries = metrics.databaseQueries.filter(m => m.timestamp > last5Minutes);
  const recentAIOperations = metrics.aiOperations.filter(m => m.timestamp > last5Minutes);

  // Calculate statistics
  const apiStats = calculateStats(recentAPIRequests.map(m => m.duration));
  const dbStats = calculateStats(recentDBQueries.map(m => m.duration));
  const aiStats = calculateStats(recentAIOperations.map(m => m.duration));

  // Calculate cache hit rate
  const totalCacheRequests = metrics.cacheHits + metrics.cacheMisses;
  const cacheHitRate = totalCacheRequests > 0 
    ? (metrics.cacheHits / totalCacheRequests * 100).toFixed(2) 
    : 0;

  // Calculate error rates
  const apiErrorRate = recentAPIRequests.length > 0
    ? (recentAPIRequests.filter(m => m.statusCode >= 500).length / recentAPIRequests.length * 100).toFixed(2)
    : 0;

  const aiSuccessRate = recentAIOperations.length > 0
    ? (recentAIOperations.filter(m => m.success).length / recentAIOperations.length * 100).toFixed(2)
    : 0;

  return {
    period: 'last_5_minutes',
    timestamp: new Date().toISOString(),
    api: {
      totalRequests: recentAPIRequests.length,
      errorRate: `${apiErrorRate}%`,
      responseTime: apiStats
    },
    database: {
      totalQueries: recentDBQueries.length,
      queryTime: dbStats
    },
    ai: {
      totalOperations: recentAIOperations.length,
      successRate: `${aiSuccessRate}%`,
      operationTime: aiStats,
      totalTokens: recentAIOperations.reduce((sum, m) => sum + (m.tokens || 0), 0)
    },
    cache: {
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      hitRate: `${cacheHitRate}%`
    }
  };
}

/**
 * Calculate statistics (min, max, avg, p50, p95, p99)
 * @param {number[]} values - Array of values
 * @returns {Object} Statistics
 */
function calculateStats(values) {
  if (values.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      p50: 0,
      p95: 0,
      p99: 0
    };
  }

  const sorted = values.slice().sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);

  return {
    count: values.length,
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
    avg: Math.round(sum / values.length),
    p50: Math.round(sorted[Math.floor(sorted.length * 0.5)]),
    p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
    p99: Math.round(sorted[Math.floor(sorted.length * 0.99)])
  };
}

/**
 * Fastify plugin to automatically track all requests
 * @param {FastifyInstance} fastify
 */
async function performanceMonitorPlugin(fastify, options) {
  // Add hook to track request duration
  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = Date.now() - request.startTime;
    trackAPIRequest(
      request.method,
      request.routerPath || request.url,
      duration,
      reply.statusCode
    );
  });

  logger.info('[APM] Performance monitoring plugin registered');
}

/**
 * Export metrics in Prometheus format
 * @returns {string} Prometheus metrics
 */
function exportPrometheusMetrics() {
  const stats = getStatistics();
  
  return `
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total ${stats.api.totalRequests}

# HELP api_response_time_ms API response time in milliseconds
# TYPE api_response_time_ms summary
api_response_time_ms{quantile="0.5"} ${stats.api.responseTime.p50}
api_response_time_ms{quantile="0.95"} ${stats.api.responseTime.p95}
api_response_time_ms{quantile="0.99"} ${stats.api.responseTime.p99}

# HELP database_queries_total Total number of database queries
# TYPE database_queries_total counter
database_queries_total ${stats.database.totalQueries}

# HELP database_query_time_ms Database query time in milliseconds
# TYPE database_query_time_ms summary
database_query_time_ms{quantile="0.5"} ${stats.database.queryTime.p50}
database_query_time_ms{quantile="0.95"} ${stats.database.queryTime.p95}
database_query_time_ms{quantile="0.99"} ${stats.database.queryTime.p99}

# HELP ai_operations_total Total number of AI operations
# TYPE ai_operations_total counter
ai_operations_total ${stats.ai.totalOperations}

# HELP ai_operation_time_ms AI operation time in milliseconds
# TYPE ai_operation_time_ms summary
ai_operation_time_ms{quantile="0.5"} ${stats.ai.operationTime.p50}
ai_operation_time_ms{quantile="0.95"} ${stats.ai.operationTime.p95}
ai_operation_time_ms{quantile="0.99"} ${stats.ai.operationTime.p99}

# HELP cache_hit_rate Cache hit rate percentage
# TYPE cache_hit_rate gauge
cache_hit_rate ${parseFloat(stats.cache.hitRate)}
`.trim();
}

/**
 * Reset metrics (useful for testing)
 */
function resetMetrics() {
  metrics.apiRequests = [];
  metrics.databaseQueries = [];
  metrics.aiOperations = [];
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
}

module.exports = {
  trackAPIRequest,
  trackDatabaseQuery,
  trackAIOperation,
  trackCacheHit,
  trackCacheMiss,
  getStatistics,
  exportPrometheusMetrics,
  performanceMonitorPlugin,
  resetMetrics
};

