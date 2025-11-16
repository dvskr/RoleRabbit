/**
 * Scaling Configuration
 * 
 * Configuration for horizontal scaling, load balancing, and CDN
 */

/**
 * Horizontal Scaling Configuration
 */
const HORIZONTAL_SCALING = {
  // Minimum number of API instances
  minInstances: process.env.MIN_INSTANCES || 2,
  
  // Maximum number of API instances
  maxInstances: process.env.MAX_INSTANCES || 10,
  
  // Target CPU utilization for auto-scaling
  targetCPU: process.env.TARGET_CPU || 70, // 70%
  
  // Target memory utilization for auto-scaling
  targetMemory: process.env.TARGET_MEMORY || 80, // 80%
  
  // Scale up threshold (requests per second)
  scaleUpThreshold: process.env.SCALE_UP_THRESHOLD || 1000,
  
  // Scale down threshold (requests per second)
  scaleDownThreshold: process.env.SCALE_DOWN_THRESHOLD || 200,
  
  // Cool down period between scaling operations (seconds)
  coolDownPeriod: process.env.COOL_DOWN_PERIOD || 300, // 5 minutes
  
  // Health check configuration
  healthCheck: {
    path: '/api/health',
    interval: 30, // seconds
    timeout: 5, // seconds
    unhealthyThreshold: 3,
    healthyThreshold: 2
  }
};

/**
 * Load Balancer Configuration
 */
const LOAD_BALANCER = {
  // Load balancing algorithm
  algorithm: process.env.LB_ALGORITHM || 'round-robin', // 'round-robin' | 'least-connections' | 'ip-hash'
  
  // Session affinity (sticky sessions)
  sessionAffinity: process.env.SESSION_AFFINITY === 'true',
  sessionAffinityTTL: 3600, // 1 hour
  
  // Connection draining timeout (seconds)
  drainingTimeout: 30,
  
  // Maximum connections per instance
  maxConnectionsPerInstance: 1000,
  
  // Timeout configuration
  timeouts: {
    idle: 60, // seconds
    request: 30, // seconds
    response: 30 // seconds
  }
};

/**
 * Database Connection Pooling Configuration
 */
const DATABASE_POOLING = {
  // Connection pool size per instance
  poolSize: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
  
  // Maximum connections across all instances
  maxTotalConnections: parseInt(process.env.MAX_TOTAL_DB_CONNECTIONS || '100'),
  
  // Connection timeout
  connectionTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000'),
  
  // Idle timeout
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
  
  // Connection lifetime
  maxLifetime: parseInt(process.env.DATABASE_MAX_LIFETIME || '1800000'), // 30 minutes
  
  // Query timeout
  queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '10000')
};

/**
 * CDN Configuration
 */
const CDN = {
  // CDN provider
  provider: process.env.CDN_PROVIDER || 'cloudflare', // 'cloudflare' | 'cloudfront' | 'fastly'
  
  // CDN URL
  url: process.env.CDN_URL || 'https://cdn.roleready.com',
  
  // Cache control headers
  cacheControl: {
    static: 'public, max-age=31536000, immutable', // 1 year for static assets
    templates: 'public, max-age=3600', // 1 hour for templates
    images: 'public, max-age=86400', // 1 day for images
    api: 'no-cache, no-store, must-revalidate' // No cache for API
  },
  
  // Assets to serve from CDN
  assets: [
    '/static/**',
    '/_next/static/**',
    '/images/**',
    '/fonts/**',
    '/templates/**'
  ],
  
  // Purge configuration
  purge: {
    onDeploy: true,
    patterns: [
      '/static/*',
      '/_next/static/*'
    ]
  }
};

/**
 * Caching Strategy for Scaling
 */
const CACHING_STRATEGY = {
  // Enable distributed caching
  distributed: true,
  
  // Cache layers
  layers: {
    // L1: In-memory cache (per instance)
    memory: {
      enabled: true,
      maxSize: '100mb',
      ttl: 60 // seconds
    },
    
    // L2: Redis cache (shared)
    redis: {
      enabled: true,
      ttl: 300 // seconds
    },
    
    // L3: CDN cache (edge)
    cdn: {
      enabled: true,
      ttl: 3600 // seconds
    }
  }
};

/**
 * Auto-scaling Rules
 */
const AUTO_SCALING_RULES = [
  {
    name: 'Scale up on high CPU',
    metric: 'cpu',
    threshold: 70,
    action: 'scale_up',
    adjustment: 2 // Add 2 instances
  },
  {
    name: 'Scale up on high memory',
    metric: 'memory',
    threshold: 80,
    action: 'scale_up',
    adjustment: 2
  },
  {
    name: 'Scale up on high request rate',
    metric: 'requests_per_second',
    threshold: 1000,
    action: 'scale_up',
    adjustment: 3
  },
  {
    name: 'Scale down on low CPU',
    metric: 'cpu',
    threshold: 30,
    action: 'scale_down',
    adjustment: 1 // Remove 1 instance
  },
  {
    name: 'Scale down on low request rate',
    metric: 'requests_per_second',
    threshold: 200,
    action: 'scale_down',
    adjustment: 1
  }
];

/**
 * Get scaling recommendations
 */
function getScalingRecommendations(metrics) {
  const recommendations = [];
  
  for (const rule of AUTO_SCALING_RULES) {
    const metricValue = metrics[rule.metric];
    
    if (rule.action === 'scale_up' && metricValue > rule.threshold) {
      recommendations.push({
        rule: rule.name,
        action: 'scale_up',
        adjustment: rule.adjustment,
        reason: `${rule.metric} (${metricValue}) exceeds threshold (${rule.threshold})`
      });
    } else if (rule.action === 'scale_down' && metricValue < rule.threshold) {
      recommendations.push({
        rule: rule.name,
        action: 'scale_down',
        adjustment: rule.adjustment,
        reason: `${rule.metric} (${metricValue}) below threshold (${rule.threshold})`
      });
    }
  }
  
  return recommendations;
}

/**
 * Calculate optimal instance count
 */
function calculateOptimalInstances(currentLoad, currentInstances) {
  const { minInstances, maxInstances, targetCPU } = HORIZONTAL_SCALING;
  
  // Calculate required instances based on CPU utilization
  const requiredInstances = Math.ceil((currentLoad / targetCPU) * currentInstances);
  
  // Ensure within min/max bounds
  return Math.max(minInstances, Math.min(maxInstances, requiredInstances));
}

module.exports = {
  HORIZONTAL_SCALING,
  LOAD_BALANCER,
  DATABASE_POOLING,
  CDN,
  CACHING_STRATEGY,
  AUTO_SCALING_RULES,
  getScalingRecommendations,
  calculateOptimalInstances
};

