// Database connection and utilities
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize database connection
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Graceful shutdown
async function disconnectDB() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};

