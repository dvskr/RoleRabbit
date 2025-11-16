/**
 * Data Retention Policy Utility
 * 
 * Implements automated data retention and deletion policies
 * Ensures compliance with GDPR and other privacy regulations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get retention policy for a resource type
 * 
 * @param {string} resourceType - Type of resource
 * @returns {Object} - Retention policy
 */
async function getRetentionPolicy(resourceType) {
  try {
    const policy = await prisma.$queryRawUnsafe(`
      SELECT * FROM data_retention_policies
      WHERE resource_type = '${resourceType}' AND is_active = true
      LIMIT 1
    `);
    
    return policy[0] || null;
  } catch (error) {
    console.error(`Failed to get retention policy for ${resourceType}:`, error);
    return null;
  }
}

/**
 * Delete expired resumes (soft-deleted resumes past retention period)
 * 
 * @returns {number} - Number of resumes deleted
 */
async function deleteExpiredResumes() {
  try {
    const policy = await getRetentionPolicy('deleted_resume');
    
    if (!policy) {
      console.log('No retention policy found for deleted_resume');
      return 0;
    }
    
    const retentionDays = policy.retention_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`Deleting resumes soft-deleted before ${cutoffDate.toISOString()}`);
    
    // Find resumes to delete
    const resumesToDelete = await prisma.baseResume.findMany({
      where: {
        deletedAt: {
          lte: cutoffDate
        }
      },
      select: {
        id: true,
        userId: true,
        name: true,
        deletedAt: true
      }
    });
    
    console.log(`Found ${resumesToDelete.length} resumes to permanently delete`);
    
    // Delete associated data first
    for (const resume of resumesToDelete) {
      // Delete working drafts
      await prisma.workingDraft.deleteMany({
        where: { baseResumeId: resume.id }
      });
      
      // Delete tailored versions
      await prisma.tailoredVersion.deleteMany({
        where: { baseResumeId: resume.id }
      });
      
      // Delete cache entries
      await prisma.resumeCache.deleteMany({
        where: { resumeId: resume.id }
      });
      
      console.log(`Deleted associated data for resume ${resume.id}`);
    }
    
    // Permanently delete resumes
    const result = await prisma.baseResume.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate
        }
      }
    });
    
    console.log(`Permanently deleted ${result.count} resumes`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete expired resumes:', error);
    throw error;
  }
}

/**
 * Delete old AI request logs
 * 
 * @returns {number} - Number of logs deleted
 */
async function deleteOldAILogs() {
  try {
    const policy = await getRetentionPolicy('ai_request_log');
    
    if (!policy) {
      console.log('No retention policy found for ai_request_log');
      return 0;
    }
    
    const retentionDays = policy.retention_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`Deleting AI logs created before ${cutoffDate.toISOString()}`);
    
    const result = await prisma.aIRequestLog.deleteMany({
      where: {
        createdAt: {
          lte: cutoffDate
        }
      }
    });
    
    console.log(`Deleted ${result.count} AI request logs`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete old AI logs:', error);
    throw error;
  }
}

/**
 * Delete old export files
 * 
 * @returns {number} - Number of files deleted
 */
async function deleteOldExportFiles() {
  try {
    const policy = await getRetentionPolicy('export_file');
    
    if (!policy) {
      console.log('No retention policy found for export_file');
      return 0;
    }
    
    const retentionDays = policy.retention_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`Deleting export files created before ${cutoffDate.toISOString()}`);
    
    // Find old export files
    const oldFiles = await prisma.storageFile.findMany({
      where: {
        fileType: 'export',
        createdAt: {
          lte: cutoffDate
        }
      }
    });
    
    console.log(`Found ${oldFiles.length} export files to delete`);
    
    // Delete files from storage (implement based on your storage solution)
    // For now, just delete from database
    const result = await prisma.storageFile.deleteMany({
      where: {
        fileType: 'export',
        createdAt: {
          lte: cutoffDate
        }
      }
    });
    
    console.log(`Deleted ${result.count} export files`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete old export files:', error);
    throw error;
  }
}

/**
 * Delete old PII access logs
 * 
 * @returns {number} - Number of logs deleted
 */
async function deleteOldPIIAccessLogs() {
  try {
    const policy = await getRetentionPolicy('pii_access_log');
    
    if (!policy) {
      console.log('No retention policy found for pii_access_log');
      return 0;
    }
    
    const retentionDays = policy.retention_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`Deleting PII access logs created before ${cutoffDate.toISOString()}`);
    
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM pii_access_logs
      WHERE created_at <= '${cutoffDate.toISOString()}'
    `);
    
    console.log(`Deleted PII access logs`);
    return result;
  } catch (error) {
    console.error('Failed to delete old PII access logs:', error);
    throw error;
  }
}

/**
 * Delete old audit logs
 * 
 * @returns {number} - Number of logs deleted
 */
async function deleteOldAuditLogs() {
  try {
    const policy = await getRetentionPolicy('audit_log');
    
    if (!policy) {
      console.log('No retention policy found for audit_log');
      return 0;
    }
    
    const retentionDays = policy.retention_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`Deleting audit logs created before ${cutoffDate.toISOString()}`);
    
    // Assuming audit logs are in a separate table
    // Adjust based on your actual schema
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM audit_logs
      WHERE created_at <= '${cutoffDate.toISOString()}'
    `);
    
    console.log(`Deleted audit logs`);
    return result;
  } catch (error) {
    console.error('Failed to delete old audit logs:', error);
    // Don't throw - audit_logs table might not exist yet
    return 0;
  }
}

/**
 * Run all data retention cleanup tasks
 * 
 * @returns {Object} - Summary of deletions
 */
async function runDataRetentionCleanup() {
  console.log('========================================');
  console.log('Starting Data Retention Cleanup');
  console.log('========================================');
  
  const summary = {
    startTime: new Date(),
    resumes: 0,
    aiLogs: 0,
    exportFiles: 0,
    piiAccessLogs: 0,
    auditLogs: 0,
    errors: []
  };
  
  try {
    summary.resumes = await deleteExpiredResumes();
  } catch (error) {
    summary.errors.push({ task: 'deleteExpiredResumes', error: error.message });
  }
  
  try {
    summary.aiLogs = await deleteOldAILogs();
  } catch (error) {
    summary.errors.push({ task: 'deleteOldAILogs', error: error.message });
  }
  
  try {
    summary.exportFiles = await deleteOldExportFiles();
  } catch (error) {
    summary.errors.push({ task: 'deleteOldExportFiles', error: error.message });
  }
  
  try {
    summary.piiAccessLogs = await deleteOldPIIAccessLogs();
  } catch (error) {
    summary.errors.push({ task: 'deleteOldPIIAccessLogs', error: error.message });
  }
  
  try {
    summary.auditLogs = await deleteOldAuditLogs();
  } catch (error) {
    summary.errors.push({ task: 'deleteOldAuditLogs', error: error.message });
  }
  
  summary.endTime = new Date();
  summary.duration = summary.endTime - summary.startTime;
  
  console.log('========================================');
  console.log('Data Retention Cleanup Complete');
  console.log('========================================');
  console.log('Summary:');
  console.log(`  Resumes deleted: ${summary.resumes}`);
  console.log(`  AI logs deleted: ${summary.aiLogs}`);
  console.log(`  Export files deleted: ${summary.exportFiles}`);
  console.log(`  PII access logs deleted: ${summary.piiAccessLogs}`);
  console.log(`  Audit logs deleted: ${summary.auditLogs}`);
  console.log(`  Duration: ${summary.duration}ms`);
  
  if (summary.errors.length > 0) {
    console.log('Errors:');
    summary.errors.forEach(err => {
      console.log(`  ${err.task}: ${err.error}`);
    });
  }
  
  return summary;
}

/**
 * Schedule data retention cleanup (to be called from a cron job)
 */
function scheduleDataRetentionCleanup() {
  // Run daily at 2 AM
  const schedule = '0 2 * * *'; // Cron format
  
  console.log(`Data retention cleanup scheduled: ${schedule}`);
  
  // In production, use a proper cron library or background job system
  // For now, just export the function to be called manually or by BullMQ
  return schedule;
}

module.exports = {
  getRetentionPolicy,
  deleteExpiredResumes,
  deleteOldAILogs,
  deleteOldExportFiles,
  deleteOldPIIAccessLogs,
  deleteOldAuditLogs,
  runDataRetentionCleanup,
  scheduleDataRetentionCleanup
};
