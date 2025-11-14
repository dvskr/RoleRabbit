/**
 * Data Retention & Cleanup Script
 * Cleans up old data according to retention policies
 * 
 * Run manually: node scripts/cleanup-old-data.js
 * Run with cron: 0 3 * * * node /path/to/cleanup-old-data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

/**
 * Data Retention Policies (in days)
 */
const RETENTION_POLICIES = {
  BASE_RESUMES: -1, // Keep forever (user owns)
  WORKING_DRAFTS_INACTIVE: 30, // Delete after 30 days of inactivity
  TAILORED_VERSIONS: 90, // Delete after 90 days
  AI_REQUESTS: 365, // Keep 1 year for analytics
  UPLOADED_FILES: 0, // Delete immediately after parsing
  RESUME_CACHE: 30, // Delete after 30 days
  GENERATED_DOCUMENTS: 90, // Delete after 90 days
  TAILORING_ANALYTICS: 365 // Keep 1 year for analytics
};

/**
 * Cleanup statistics
 */
const stats = {
  workingDrafts: 0,
  tailoredVersions: 0,
  aiRequests: 0,
  uploadedFiles: 0,
  resumeCache: 0,
  generatedDocuments: 0,
  tailoringAnalytics: 0,
  errors: 0
};

/**
 * Main cleanup function
 */
async function cleanupOldData() {
  logger.info('[CLEANUP] Starting data cleanup', {
    policies: RETENTION_POLICIES
  });

  const startTime = Date.now();

  try {
    // Run cleanup tasks in parallel
    await Promise.all([
      cleanupWorkingDrafts(),
      cleanupTailoredVersions(),
      cleanupAIRequests(),
      cleanupUploadedFiles(),
      cleanupResumeCache(),
      cleanupGeneratedDocuments(),
      cleanupTailoringAnalytics()
    ]);

    const duration = Date.now() - startTime;

    logger.info('[CLEANUP] Cleanup completed successfully', {
      stats,
      durationMs: duration
    });

    // Print summary
    printSummary();

    process.exit(0);
  } catch (error) {
    logger.error('[CLEANUP] Cleanup failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

/**
 * Clean up inactive working drafts
 */
async function cleanupWorkingDrafts() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.WORKING_DRAFTS_INACTIVE);

    // Find drafts that haven't been updated in 30 days
    const oldDrafts = await prisma.workingDraft.findMany({
      where: {
        updatedAt: {
          lt: cutoffDate
        }
      },
      select: {
        id: true,
        baseResumeId: true,
        updatedAt: true
      }
    });

    if (oldDrafts.length === 0) {
      logger.info('[CLEANUP] No old working drafts to delete');
      return;
    }

    // Delete old drafts
    const result = await prisma.workingDraft.deleteMany({
      where: {
        id: {
          in: oldDrafts.map(d => d.id)
        }
      }
    });

    stats.workingDrafts = result.count;

    logger.info('[CLEANUP] Deleted old working drafts', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup working drafts', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Clean up old tailored versions
 */
async function cleanupTailoredVersions() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.TAILORED_VERSIONS);

    // Find old tailored versions (not promoted to base)
    const oldVersions = await prisma.tailoredVersion.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        isPromoted: false // Don't delete promoted versions
      },
      select: {
        id: true,
        createdAt: true,
        isPromoted: true
      }
    });

    if (oldVersions.length === 0) {
      logger.info('[CLEANUP] No old tailored versions to delete');
      return;
    }

    // Delete old versions
    const result = await prisma.tailoredVersion.deleteMany({
      where: {
        id: {
          in: oldVersions.map(v => v.id)
        }
      }
    });

    stats.tailoredVersions = result.count;

    logger.info('[CLEANUP] Deleted old tailored versions', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup tailored versions', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Clean up old AI request logs
 */
async function cleanupAIRequests() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.AI_REQUESTS);

    // Delete old AI request logs
    const result = await prisma.aIRequestLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    stats.aiRequests = result.count;

    logger.info('[CLEANUP] Deleted old AI request logs', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup AI requests', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Clean up uploaded files (should be deleted after parsing)
 */
async function cleanupUploadedFiles() {
  try {
    // Find files older than 1 day (should have been deleted after parsing)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);

    const oldFiles = await prisma.storageFile.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        // Only delete files not linked to base resumes
        baseResumes: {
          none: {}
        }
      },
      select: {
        id: true,
        fileName: true,
        createdAt: true
      }
    });

    if (oldFiles.length === 0) {
      logger.info('[CLEANUP] No old uploaded files to delete');
      return;
    }

    // Delete old files
    const result = await prisma.storageFile.deleteMany({
      where: {
        id: {
          in: oldFiles.map(f => f.id)
        }
      }
    });

    stats.uploadedFiles = result.count;

    logger.info('[CLEANUP] Deleted old uploaded files', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup uploaded files', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Clean up old resume cache
 */
async function cleanupResumeCache() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.RESUME_CACHE);

    // Delete old cache entries
    const result = await prisma.resumeCache.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    stats.resumeCache = result.count;

    logger.info('[CLEANUP] Deleted old resume cache entries', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup resume cache', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Clean up old generated documents
 */
async function cleanupGeneratedDocuments() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.GENERATED_DOCUMENTS);

    // Delete old generated documents
    const result = await prisma.generatedDocument.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    stats.generatedDocuments = result.count;

    logger.info('[CLEANUP] Deleted old generated documents', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup generated documents', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Clean up old tailoring analytics
 */
async function cleanupTailoringAnalytics() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_POLICIES.TAILORING_ANALYTICS);

    // Delete old analytics
    const result = await prisma.tailoringAnalytics.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    stats.tailoringAnalytics = result.count;

    logger.info('[CLEANUP] Deleted old tailoring analytics', {
      count: result.count,
      cutoffDate
    });
  } catch (error) {
    logger.error('[CLEANUP] Failed to cleanup tailoring analytics', {
      error: error.message
    });
    stats.errors++;
  }
}

/**
 * Print cleanup summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('Data Cleanup Summary');
  console.log('='.repeat(60));
  console.log(`Working Drafts Deleted:      ${stats.workingDrafts}`);
  console.log(`Tailored Versions Deleted:   ${stats.tailoredVersions}`);
  console.log(`AI Requests Deleted:         ${stats.aiRequests}`);
  console.log(`Uploaded Files Deleted:      ${stats.uploadedFiles}`);
  console.log(`Resume Cache Deleted:        ${stats.resumeCache}`);
  console.log(`Generated Docs Deleted:      ${stats.generatedDocuments}`);
  console.log(`Tailoring Analytics Deleted: ${stats.tailoringAnalytics}`);
  console.log(`Errors:                      ${stats.errors}`);
  console.log('='.repeat(60));
  
  const total = Object.values(stats).reduce((a, b) => a + b, 0) - stats.errors;
  console.log(`Total Records Deleted:       ${total}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Dry run mode (preview what would be deleted)
 */
async function dryRun() {
  logger.info('[CLEANUP] Running in DRY RUN mode (no data will be deleted)');

  const cutoffDates = {
    workingDrafts: new Date(Date.now() - RETENTION_POLICIES.WORKING_DRAFTS_INACTIVE * 24 * 60 * 60 * 1000),
    tailoredVersions: new Date(Date.now() - RETENTION_POLICIES.TAILORED_VERSIONS * 24 * 60 * 60 * 1000),
    aiRequests: new Date(Date.now() - RETENTION_POLICIES.AI_REQUESTS * 24 * 60 * 60 * 1000),
    uploadedFiles: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resumeCache: new Date(Date.now() - RETENTION_POLICIES.RESUME_CACHE * 24 * 60 * 60 * 1000),
    generatedDocuments: new Date(Date.now() - RETENTION_POLICIES.GENERATED_DOCUMENTS * 24 * 60 * 60 * 1000),
    tailoringAnalytics: new Date(Date.now() - RETENTION_POLICIES.TAILORING_ANALYTICS * 24 * 60 * 60 * 1000)
  };

  // Count records that would be deleted
  const [
    workingDraftsCount,
    tailoredVersionsCount,
    aiRequestsCount,
    uploadedFilesCount,
    resumeCacheCount,
    generatedDocsCount,
    tailoringAnalyticsCount
  ] = await Promise.all([
    prisma.workingDraft.count({ where: { updatedAt: { lt: cutoffDates.workingDrafts } } }),
    prisma.tailoredVersion.count({ where: { createdAt: { lt: cutoffDates.tailoredVersions }, isPromoted: false } }),
    prisma.aIRequestLog.count({ where: { createdAt: { lt: cutoffDates.aiRequests } } }),
    prisma.storageFile.count({ where: { createdAt: { lt: cutoffDates.uploadedFiles }, baseResumes: { none: {} } } }),
    prisma.resumeCache.count({ where: { createdAt: { lt: cutoffDates.resumeCache } } }),
    prisma.generatedDocument.count({ where: { createdAt: { lt: cutoffDates.generatedDocuments } } }),
    prisma.tailoringAnalytics.count({ where: { createdAt: { lt: cutoffDates.tailoringAnalytics } } })
  ]);

  console.log('\n' + '='.repeat(60));
  console.log('DRY RUN - Records that would be deleted:');
  console.log('='.repeat(60));
  console.log(`Working Drafts:        ${workingDraftsCount} (older than ${RETENTION_POLICIES.WORKING_DRAFTS_INACTIVE} days)`);
  console.log(`Tailored Versions:     ${tailoredVersionsCount} (older than ${RETENTION_POLICIES.TAILORED_VERSIONS} days)`);
  console.log(`AI Requests:           ${aiRequestsCount} (older than ${RETENTION_POLICIES.AI_REQUESTS} days)`);
  console.log(`Uploaded Files:        ${uploadedFilesCount} (older than 1 day)`);
  console.log(`Resume Cache:          ${resumeCacheCount} (older than ${RETENTION_POLICIES.RESUME_CACHE} days)`);
  console.log(`Generated Documents:   ${generatedDocsCount} (older than ${RETENTION_POLICIES.GENERATED_DOCUMENTS} days)`);
  console.log(`Tailoring Analytics:   ${tailoringAnalyticsCount} (older than ${RETENTION_POLICIES.TAILORING_ANALYTICS} days)`);
  console.log('='.repeat(60));
  console.log(`Total:                 ${workingDraftsCount + tailoredVersionsCount + aiRequestsCount + uploadedFilesCount + resumeCacheCount + generatedDocsCount + tailoringAnalyticsCount}`);
  console.log('='.repeat(60) + '\n');
  console.log('To run actual cleanup: node scripts/cleanup-old-data.js --execute\n');

  process.exit(0);
}

// Check command line arguments
const args = process.argv.slice(2);
const isDryRun = !args.includes('--execute');

if (isDryRun) {
  dryRun().catch(error => {
    logger.error('[CLEANUP] Dry run failed', { error: error.message });
    process.exit(1);
  });
} else {
  cleanupOldData();
}

