/**
 * Database Backup Utility
 * Handles database backups
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const execAsync = promisify(exec);

/**
 * Backup PostgreSQL database
 */
async function backupPostgreSQL(databaseUrl, outputPath) {
  try {
    // Parse DATABASE_URL
    const url = new URL(databaseUrl);
    const dbName = url.pathname.slice(1);
    
    const backupCommand = `pg_dump "${databaseUrl}" -F c -f "${outputPath}"`;
    
    await execAsync(backupCommand);
    
    logger.info(`Database backup created: ${outputPath}`);
    
    return { success: true, path: outputPath };
  } catch (error) {
    logger.error('Backup failed', error);
    throw error;
  }
}

/**
 * List all backups
 */
async function listBackups(backupDir) {
  try {
    const files = await fs.readdir(backupDir);
    return files
      .filter(file => file.endsWith('.backup'))
      .sort()
      .reverse();
  } catch (error) {
    logger.error('Failed to list backups', error);
    return [];
  }
}

/**
 * Clean old backups
 */
async function cleanOldBackups(backupDir, keepDays = 30) {
  try {
    const files = await listBackups(backupDir);
    const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
    
    let deleted = 0;
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        deleted++;
      }
    }
    
    logger.info(`Cleaned ${deleted} old backups`);
    
    return deleted;
  } catch (error) {
    logger.error('Failed to clean backups', error);
    throw error;
  }
}

module.exports = {
  backupPostgreSQL,
  listBackups,
  cleanOldBackups
};
