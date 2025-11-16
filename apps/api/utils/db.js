// Database connection and utilities
const { PrismaClient } = require('@prisma/client');

// Lazy load logger to avoid circular dependencies
let logger;
const getLogger = () => {
  if (!logger) {
    try {
      logger = require('./logger');
    } catch (error) {
      // Fallback to console if logger fails
      logger = console;
    }
  }
  return logger;
};

// ============================================
// CONNECTION POOL CONFIGURATION
// ============================================
// Production-ready connection pool settings
// These values can be overridden via environment variables

const POOL_CONFIG = {
  // Maximum number of connections in the pool
  // Default: 10 (suitable for most applications)
  // Increase for high-traffic applications (e.g., 20-50)
  // Formula: (number_of_app_instances * connection_limit) should not exceed database max_connections
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  
  // Maximum time (in seconds) a connection can be idle before being closed
  // Default: 20 seconds
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT) || 20,
  
  // Maximum time (in seconds) to wait for a new connection
  // Default: 10 seconds
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10,
  
  // Enable connection pooling (pgBouncer compatible)
  // Default: true
  pgbouncer: process.env.DB_PGBOUNCER === 'true' || false,
  
  // Schema cache TTL (in seconds) - useful for pgBouncer
  // Default: 300 seconds (5 minutes)
  schemaCacheTTL: parseInt(process.env.DB_SCHEMA_CACHE_TTL) || 300
};

// Build DATABASE_URL with connection pool settings
let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
  const urlObj = new URL(databaseUrl);
  
  // Add connection pool parameters
  urlObj.searchParams.set('connection_limit', String(POOL_CONFIG.connectionLimit));
  urlObj.searchParams.set('pool_timeout', String(POOL_CONFIG.poolTimeout));
  urlObj.searchParams.set('connect_timeout', String(POOL_CONFIG.connectTimeout));
  
  // Add pgBouncer compatibility if enabled
  if (POOL_CONFIG.pgbouncer) {
    urlObj.searchParams.set('pgbouncer', 'true');
    urlObj.searchParams.set('schema_cache', String(POOL_CONFIG.schemaCacheTTL));
  }
  
  // Add statement timeout (30 seconds) to prevent long-running queries
  urlObj.searchParams.set('statement_timeout', '30000');
  
  databaseUrl = urlObj.toString();
  
  const log = getLogger();
  if (log && typeof log.info === 'function') {
    log.info('Database connection pool configured', {
      connectionLimit: POOL_CONFIG.connectionLimit,
      poolTimeout: POOL_CONFIG.poolTimeout,
      connectTimeout: POOL_CONFIG.connectTimeout,
      pgbouncer: POOL_CONFIG.pgbouncer
    });
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: databaseUrl || process.env.DATABASE_URL
    }
  },
});

// Track connection state
let isConnected = false;
let reconnectAttempts = 0;
let isReconnecting = false;
const MAX_RECONNECT_ATTEMPTS = 5;

// Initialize database connection
async function connectDB() {
  try {
    await prisma.$connect();
    const log = getLogger();
    if (log && typeof log.info === 'function') {
      log.info('✅ Database connected successfully');
    }
    
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    reconnectAttempts = 0;
    return true;
  } catch (error) {
    const log = getLogger();
    if (log && typeof log.error === 'function') {
      log.error('❌ Database connection error:', error);
    }
    isConnected = false;
    // Don't exit - let the server continue and retry
    return false;
  }
}

// Reconnect to database if connection is lost
async function reconnectDB() {
  // Prevent multiple simultaneous reconnection attempts
  if (isReconnecting) {
    const log = getLogger();
    if (log && typeof log.warn === 'function') {
      log.warn('Reconnection already in progress, waiting...');
    }
    // Wait for ongoing reconnection to complete
    while (isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return isConnected;
  }
  
  isReconnecting = true;
  
  try {
    const log = getLogger();
    if (log && typeof log.info === 'function') {
      log.info('Attempting to reconnect to database...');
    }
    await prisma.$disconnect().catch(() => {}); // Ignore disconnect errors
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`; // Test connection
    
    isConnected = true;
    reconnectAttempts = 0;
    const logSuccess = getLogger();
    if (logSuccess && typeof logSuccess.info === 'function') {
      logSuccess.info('✅ Database reconnected successfully');
    }
    return true;
  } catch (error) {
    reconnectAttempts++;
    const logError = getLogger();
    if (logError && typeof logError.error === 'function') {
      logError.error(`❌ Database reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} failed:`, error.message);
    }
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      if (logError && typeof logError.error === 'function') {
        logError.error('❌ Max reconnection attempts reached. Database connection unavailable.');
      }
      isConnected = false;
      isReconnecting = false;
      return false;
    }
    
    // Exponential backoff (max 5 seconds)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 5000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    isReconnecting = false;
    return reconnectDB();
  } finally {
    isReconnecting = false;
  }
}

// Wrapper for Prisma queries that handles connection resets
async function safeQuery(queryFn, retries = 1) {
  try {
    return await queryFn();
  } catch (error) {
    // Check if it's a connection error
    const errorMessage = error.message || '';
    const isConnectionError = 
      errorMessage.includes('connection') ||
      errorMessage.includes('ConnectionReset') ||
      errorMessage.includes('10054') ||
      errorMessage.includes('ECONNRESET') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('P1001') || // Prisma connection error code
      error.code === 'P1001' ||
      error.code === 'P1000'; // P1000 = connection string missing
    
    if (isConnectionError && retries > 0) {
      const log = getLogger();
      if (log && typeof log.warn === 'function') {
        log.warn('Database connection error detected, attempting to reconnect...', {
          error: errorMessage,
          code: error.code,
          retriesLeft: retries - 1
        });
      }
      
      isConnected = false;
      
      // Try to reconnect
      const reconnected = await reconnectDB();
      if (reconnected) {
        // Retry the query once
        return safeQuery(queryFn, retries - 1);
      } else {
        throw new Error('Database connection unavailable after reconnection attempts');
      }
    }
    
    // Re-throw if not a connection error or reconnection failed
    throw error;
  }
}

// Graceful shutdown
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    const log = getLogger();
    if (log && typeof log.info === 'function') {
      log.info('🔌 Database disconnected');
    }
  } catch (error) {
    const log = getLogger();
    if (log && typeof log.error === 'function') {
      log.error('Error disconnecting database:', error);
    }
  }
}

// Handle database connection errors (Prisma events)
try {
  prisma.$on('error', (e) => {
    const log = getLogger();
    if (log && typeof log.error === 'function') {
      log.error('Prisma error:', e);
    }
  });
} catch (error) {
  // Prisma event handlers may not be available in all versions
  const log = getLogger();
  if (log && typeof log.warn === 'function') {
    log.warn('Could not set Prisma error handler:', error.message);
  }
}

// Get connection pool statistics
function getPoolStats() {
  // Prisma doesn't expose pool stats directly, but we can provide configuration info
  return {
    config: POOL_CONFIG,
    isConnected: isConnected,
    reconnectAttempts: reconnectAttempts,
    isReconnecting: isReconnecting,
    databaseUrl: databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ':****@') : 'Not configured' // Mask password
  };
}

module.exports = {
  prisma, // Export prisma directly - routes should use safeQuery wrapper for critical operations
  connectDB,
  disconnectDB,
  reconnectDB,
  safeQuery, // Use this wrapper for database operations that need retry logic
  isConnected: () => isConnected,
  getPoolStats // Export pool statistics for monitoring
};

