/**
 * Data Migration Utility
 * Handles data migration and transformation
 */

const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Migrate user data
 */
async function migrateUserData(oldUserId, newUserId) {
  try {
    // Migrate resumes
    await prisma.resume.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    });
    
    // Migrate jobs
    await prisma.job.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    });
    
    // Migrate emails
    await prisma.email.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    });
    
    // Migrate portfolios
    await prisma.portfolio.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    });
    
    // Migrate cloud files
    await prisma.cloudFile.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    });
    
    logger.info(`Data migrated from user ${oldUserId} to ${newUserId}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Data migration failed', error);
    return { success: false, error: error.message };
  }
}

/**
 * Backup user data
 */
async function backupUserData(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: true,
        jobs: true,
        emails: true,
        portfolios: true,
        cloudFiles: true
      }
    });
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    logger.error('Data backup failed', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  migrateUserData,
  backupUserData
};
