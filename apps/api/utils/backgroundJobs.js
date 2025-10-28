/**
 * Background Jobs Handler
 * Manages long-running background tasks
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Process background jobs
 */
async function processBackgroundJobs() {
  console.log('Processing background jobs...');
  
  // Example: Clean up expired sessions
  await cleanupExpiredSessions();
  
  // Example: Clean up expired tokens
  await cleanupExpiredTokens();
  
  console.log('Background jobs processed');
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions() {
  const now = new Date();
  
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  });
  
  if (result.count > 0) {
    console.log(`Cleaned up ${result.count} expired sessions`);
  }
}

/**
 * Clean up expired tokens
 */
async function cleanupExpiredTokens() {
  const now = new Date();
  
  // Clean password reset tokens
  const resetTokens = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  });
  
  if (resetTokens.count > 0) {
    console.log(`Cleaned up ${resetTokens.count} expired password reset tokens`);
  }
}

module.exports = {
  processBackgroundJobs,
  cleanupExpiredSessions,
  cleanupExpiredTokens
};

