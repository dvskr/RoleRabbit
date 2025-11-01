// Database connection and utilities
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool settings to prevent exhaustion
  connection_limit: 10,
});

// Initialize database connection
async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    // Don't exit - let the server continue and retry
    return false;
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
  prisma,
  connectDB,
  disconnectDB
};

