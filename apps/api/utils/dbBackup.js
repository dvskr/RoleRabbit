/**
 * Database Backup Utility
 * Provides database backup and restore functionality
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

/**
 * Create database backup
 */
async function createBackup() {
  try {
    const prisma = new PrismaClient();
    
    // Get database path (SQLite)
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
    
    // Copy database file
    await fs.copyFile(dbPath, backupPath);
    
    logger.info('Database backup created', { backupPath });
    
    // Keep only last 10 backups
    await cleanupOldBackups(backupDir, 10);
    
    await prisma.$disconnect();
    
    return backupPath;
  } catch (error) {
    logger.logError(error, { context: 'database backup' });
    throw error;
  }
}

/**
 * Cleanup old backups
 */
async function cleanupOldBackups(backupDir, keepCount = 10) {
  try {
    const files = await fs.readdir(backupDir);
    const backups = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: null
      }));
    
    // Get stats for all backups
    for (const backup of backups) {
      backup.stats = await fs.stat(backup.path);
    }
    
    // Sort by modification time (newest first)
    backups.sort((a, b) => b.stats.mtime - a.stats.mtime);
    
    // Delete backups beyond the keep count
    const toDelete = backups.slice(keepCount);
    for (const backup of toDelete) {
      await fs.unlink(backup.path);
      logger.info('Old backup deleted', { path: backup.path });
    }
    
  } catch (error) {
    logger.logError(error, { context: 'backup cleanup' });
  }
}

/**
 * Restore from backup
 */
async function restoreBackup(backupPath) {
  try {
    // Verify backup file exists
    await fs.access(backupPath);
    
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    
    // Backup current database first
    await createBackup();
    
    // Restore from backup
    await fs.copyFile(backupPath, dbPath);
    
    logger.info('Database restored from backup', { backupPath });
    
    return true;
  } catch (error) {
    logger.logError(error, { context: 'database restore' });
    throw error;
  }
}

/**
 * Get backup list
 */
async function getBackupList() {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backups = [];
      
      for (const file of files) {
        if (file.startsWith('backup-') && file.endsWith('.db')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            name: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        }
      }
      
      // Sort by creation time (newest first)
      backups.sort((a, b) => b.createdAt - a.createdAt);
      
      return backups;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  } catch (error) {
    logger.logError(error, { context: 'get backup list' });
    throw error;
  }
}

module.exports = {
  createBackup,
  restoreBackup,
  getBackupList,
  cleanupOldBackups
};

