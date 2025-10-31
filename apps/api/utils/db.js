// Database connection and utilities
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize database connection
async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    return false;
  }
}

// Graceful shutdown
async function disconnectDB() {
  await prisma.$disconnect();
  logger.info('🔌 Database disconnected');
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};

