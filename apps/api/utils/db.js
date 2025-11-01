// Database connection and utilities
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// Build DATABASE_URL with connection pool settings to prevent connection resets
let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
  // Add connection pool parameters to prevent connection resets
  const urlObj = new URL(databaseUrl);
  urlObj.searchParams.set('connection_limit', '10');
  urlObj.searchParams.set('pool_timeout', '20');
  urlObj.searchParams.set('connect_timeout', '10');
  databaseUrl = urlObj.toString();
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
    logger.info('✅ Database connected successfully');
    
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    reconnectAttempts = 0;
    return true;
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    isConnected = false;
    // Don't exit - let the server continue and retry
    return false;
  }
}

// Reconnect to database if connection is lost
async function reconnectDB() {
  // Prevent multiple simultaneous reconnection attempts
  if (isReconnecting) {
    logger.warn('Reconnection already in progress, waiting...');
    // Wait for ongoing reconnection to complete
    while (isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return isConnected;
  }
  
  isReconnecting = true;
  
  try {
    logger.info('Attempting to reconnect to database...');
    await prisma.$disconnect().catch(() => {}); // Ignore disconnect errors
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`; // Test connection
    
    isConnected = true;
    reconnectAttempts = 0;
    logger.info('✅ Database reconnected successfully');
    return true;
  } catch (error) {
    reconnectAttempts++;
    logger.error(`❌ Database reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} failed:`, error.message);
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error('❌ Max reconnection attempts reached. Database connection unavailable.');
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
      logger.warn('Database connection error detected, attempting to reconnect...', {
        error: errorMessage,
        code: error.code,
        retriesLeft: retries - 1
      });
      
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
    logger.info('🔌 Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
}

// Handle database connection errors (Prisma events)
try {
  prisma.$on('error', (e) => {
    logger.error('Prisma error:', e);
  });
} catch (error) {
  // Prisma event handlers may not be available in all versions
  logger.warn('Could not set Prisma error handler:', error.message);
}

module.exports = {
  prisma, // Export prisma directly - routes should use safeQuery wrapper for critical operations
  connectDB,
  disconnectDB,
  reconnectDB,
  safeQuery, // Use this wrapper for database operations that need retry logic
  isConnected: () => isConnected
};

