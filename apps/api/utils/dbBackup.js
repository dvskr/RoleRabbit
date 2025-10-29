/**
 * Database Backup Utility
 * Handles database backups and restoration
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      reject(new Error('DATABASE_URL not configured'));
      return;
    }

    // Extract database name from URL
    const dbName = process.env.POSTGRES_DB || 'roleready';
    const dbUser = process.env.POSTGRES_USER || 'postgres';
    const dbHost = process.env.POSTGRES_HOST || 'localhost';
    const dbPort = process.env.POSTGRES_PORT || '5432';

    // Create PostgreSQL backup
    const command = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f ${backupFile}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup error:', error);
        reject(error);
        return;
      }

      console.log(`✅ Backup created: ${backupFile}`);
      resolve({
        file: backupFile,
        size: fs.statSync(backupFile).size,
        timestamp: new Date().toISOString()
      });
    });
  });
}

async function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const backups = files
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        file,
        size: stats.size,
        created: stats.birthtime,
        path: filePath
      };
    })
    .sort((a, b) => b.created - a.created);

  return backups;
}

async function deleteOldBackups(daysToKeep = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const backups = await listBackups();
  const toDelete = backups.filter(backup => backup.created < cutoffDate);

  for (const backup of toDelete) {
    fs.unlinkSync(backup.path);
    console.log(`🗑️ Deleted old backup: ${backup.file}`);
  }

  return toDelete.length;
}

async function restoreBackup(backupFile) {
  return new Promise((resolve, reject) => {
    const dbName = process.env.POSTGRES_DB || 'roleready';
    const dbUser = process.env.POSTGRES_USER || 'postgres';
    const dbHost = process.env.POSTGRES_HOST || 'localhost';
    const dbPort = process.env.POSTGRES_PORT || '5432';

    const command = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c -O ${backupFile}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore error:', error);
        reject(error);
        return;
      }

      console.log(`✅ Database restored from: ${backupFile}`);
      resolve(true);
    });
  });
}

module.exports = {
  createBackup,
  listBackups,
  deleteOldBackups,
  restoreBackup
};
