/**
 * Advanced Database Configuration
 * 
 * Includes:
 * - Connection pooling
 * - Read replicas
 * - Query optimization
 * - Performance monitoring
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Connection Pool Configuration
 */
const CONNECTION_POOL_CONFIG = {
  // Maximum number of connections in the pool
  connection_limit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
  
  // Connection timeout (seconds)
  pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '20'),
  
  // Connection lifetime (seconds)
  connect_timeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10'),
  
  // Statement timeout (milliseconds)
  statement_timeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT || '30000'),
  
  // Query timeout (milliseconds)
  query_timeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '10000')
};

/**
 * Create Prisma client with connection pooling
 */
function createPrismaClient(options = {}) {
  const datasourceUrl = options.readReplica 
    ? process.env.DATABASE_READ_REPLICA_URL 
    : process.env.DATABASE_URL;

  return new PrismaClient({
    datasources: {
      db: {
        url: datasourceUrl
      }
    },
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' }
    ]
  });
}

/**
 * Primary database client (for writes)
 */
const prismaWrite = createPrismaClient({ readReplica: false });

/**
 * Read replica client (for reads)
 * Falls back to primary if read replica not configured
 */
const prismaRead = process.env.DATABASE_READ_REPLICA_URL
  ? createPrismaClient({ readReplica: true })
  : prismaWrite;

/**
 * Query performance monitoring
 */
let queryStats = {
  totalQueries: 0,
  slowQueries: 0,
  averageDuration: 0,
  maxDuration: 0
};

// Monitor query performance
prismaWrite.$on('query', (e) => {
  queryStats.totalQueries++;
  
  const duration = e.duration;
  queryStats.averageDuration = 
    (queryStats.averageDuration * (queryStats.totalQueries - 1) + duration) / queryStats.totalQueries;
  
  if (duration > queryStats.maxDuration) {
    queryStats.maxDuration = duration;
  }
  
  // Log slow queries (>100ms)
  if (duration > 100) {
    queryStats.slowQueries++;
    console.warn(`🐌 Slow query detected (${duration}ms):`, {
      query: e.query,
      params: e.params,
      duration: `${duration}ms`
    });
  }
});

// Monitor errors
prismaWrite.$on('error', (e) => {
  console.error('💥 Database error:', e);
});

/**
 * Get query statistics
 */
function getQueryStats() {
  return {
    ...queryStats,
    slowQueryPercentage: queryStats.totalQueries > 0
      ? ((queryStats.slowQueries / queryStats.totalQueries) * 100).toFixed(2) + '%'
      : '0%'
  };
}

/**
 * Reset query statistics
 */
function resetQueryStats() {
  queryStats = {
    totalQueries: 0,
    slowQueries: 0,
    averageDuration: 0,
    maxDuration: 0
  };
}

/**
 * Database health check
 */
async function healthCheck() {
  try {
    await prismaWrite.$queryRaw`SELECT 1`;
    
    if (prismaRead !== prismaWrite) {
      await prismaRead.$queryRaw`SELECT 1`;
    }
    
    return {
      status: 'healthy',
      write: 'connected',
      read: 'connected',
      stats: getQueryStats()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Graceful shutdown
 */
async function disconnect() {
  await prismaWrite.$disconnect();
  
  if (prismaRead !== prismaWrite) {
    await prismaRead.$disconnect();
  }
}

/**
 * Execute query with automatic routing
 * - Write operations → primary database
 * - Read operations → read replica (if available)
 */
function routeQuery(operation, isWrite = false) {
  const client = isWrite ? prismaWrite : prismaRead;
  return client[operation];
}

/**
 * Batch operations helper
 */
async function batchOperation(operations, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Transaction with retry logic
 */
async function transactionWithRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prismaWrite.$transaction(fn);
    } catch (error) {
      lastError = error;
      
      // Retry on connection errors
      if (error.code === 'P1001' || error.code === 'P1002') {
        console.warn(`Transaction attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      // Don't retry on other errors
      throw error;
    }
  }
  
  throw lastError;
}

module.exports = {
  // Clients
  prisma: prismaWrite, // Default export (write)
  prismaWrite,
  prismaRead,
  
  // Configuration
  CONNECTION_POOL_CONFIG,
  
  // Utilities
  routeQuery,
  batchOperation,
  transactionWithRetry,
  
  // Monitoring
  getQueryStats,
  resetQueryStats,
  healthCheck,
  
  // Lifecycle
  disconnect
};

