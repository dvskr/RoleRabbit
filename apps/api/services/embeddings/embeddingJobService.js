// ============================================================
// BACKGROUND EMBEDDING JOB SERVICE
// ============================================================
// This service handles batch generation of embeddings for existing resumes

const { PrismaClient } = require('@prisma/client');
const logger = require('../../utils/logger');
const { generateResumeEmbedding } = require('./embeddingService');
const { storeResumeEmbedding } = require('./resumeEmbeddingStorage');

const prisma = new PrismaClient();

// Job state management (in-memory for now, could be moved to Redis)
const jobState = {
  isRunning: false,
  currentJobId: null,
  startTime: null,
  totalResumes: 0,
  processedResumes: 0,
  successfulResumes: 0,
  failedResumes: 0,
  errors: [],
  lastProcessedResumeId: null,
  estimatedTimeRemaining: null
};

/**
 * Get current job status
 * @returns {Object} Job status information
 */
function getJobStatus() {
  const status = { ...jobState };
  
  if (jobState.isRunning && jobState.startTime) {
    const elapsed = Date.now() - jobState.startTime;
    const avgTimePerResume = elapsed / (jobState.processedResumes || 1);
    const remaining = jobState.totalResumes - jobState.processedResumes;
    status.estimatedTimeRemaining = Math.round(avgTimePerResume * remaining);
    status.elapsedTime = elapsed;
    status.progressPercentage = Math.round(
      (jobState.processedResumes / jobState.totalResumes) * 100
    );
  }
  
  return status;
}

/**
 * Reset job state
 */
function resetJobState() {
  jobState.isRunning = false;
  jobState.currentJobId = null;
  jobState.startTime = null;
  jobState.totalResumes = 0;
  jobState.processedResumes = 0;
  jobState.successfulResumes = 0;
  jobState.failedResumes = 0;
  jobState.errors = [];
  jobState.lastProcessedResumeId = null;
  jobState.estimatedTimeRemaining = null;
}

/**
 * Process a single resume to generate and store embedding
 * @param {Object} resume - Resume object with id and data
 * @returns {Promise<{success: boolean, resumeId: string, error?: string}>}
 */
async function processResumeEmbedding(resume) {
  const startTime = Date.now();
  
  try {
    logger.debug('Processing resume for embedding', {
      resumeId: resume.id,
      hasData: !!resume.data
    });

    // Generate embedding
    const embedding = await generateResumeEmbedding(resume.data);

    // Store in database
    const storeResult = await storeResumeEmbedding(resume.id, embedding);

    if (!storeResult.stored) {
      throw new Error(storeResult.error || 'Failed to store embedding');
    }

    const duration = Date.now() - startTime;

    logger.info('Resume embedding processed successfully', {
      resumeId: resume.id,
      duration
    });

    return {
      success: true,
      resumeId: resume.id,
      duration
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Failed to process resume embedding', {
      resumeId: resume.id,
      error: error.message,
      duration
    });

    return {
      success: false,
      resumeId: resume.id,
      error: error.message,
      duration
    };
  }
}

/**
 * Generate embeddings for all resumes without embeddings
 * @param {Object} options - Job options
 * @param {number} options.batchSize - Number of resumes to process per batch (default: 10)
 * @param {number} options.delayBetweenBatches - Delay in ms between batches (default: 1000)
 * @param {boolean} options.skipExisting - Skip resumes that already have embeddings (default: true)
 * @param {string} options.resumeFrom - Resume ID to start from (for resuming interrupted jobs)
 * @returns {Promise<Object>} Job results
 */
async function generateEmbeddingsForAllResumes(options = {}) {
  const {
    batchSize = 10,
    delayBetweenBatches = 1000,
    skipExisting = true,
    resumeFrom = null
  } = options;

  // Check if a job is already running
  if (jobState.isRunning) {
    throw new Error('A background job is already running');
  }

  // Initialize job state
  const jobId = `emb-job-${Date.now()}`;
  jobState.isRunning = true;
  jobState.currentJobId = jobId;
  jobState.startTime = Date.now();
  jobState.processedResumes = 0;
  jobState.successfulResumes = 0;
  jobState.failedResumes = 0;
  jobState.errors = [];
  jobState.lastProcessedResumeId = resumeFrom;

  logger.info('Starting background embedding generation job', {
    jobId,
    batchSize,
    delayBetweenBatches,
    skipExisting,
    resumeFrom
  });

  try {
    // Build query conditions
    const whereConditions = {
      AND: []
    };

    // Skip resumes with existing embeddings
    if (skipExisting) {
      whereConditions.AND.push({
        embedding: null
      });
    }

    // Resume from specific ID
    if (resumeFrom) {
      whereConditions.AND.push({
        id: {
          gt: resumeFrom
        }
      });
    }

    // Get total count
    const totalResumes = await prisma.baseResume.count({
      where: whereConditions.AND.length > 0 ? whereConditions : undefined
    });

    jobState.totalResumes = totalResumes;

    logger.info('Found resumes to process', {
      totalResumes,
      skipExisting,
      resumeFrom
    });

    if (totalResumes === 0) {
      logger.info('No resumes to process');
      resetJobState();
      return {
        jobId,
        success: true,
        totalResumes: 0,
        processedResumes: 0,
        successfulResumes: 0,
        failedResumes: 0,
        duration: 0,
        message: 'No resumes to process'
      };
    }

    // Process in batches
    let offset = 0;
    const results = [];

    while (offset < totalResumes && jobState.isRunning) {
      // Fetch batch
      const batch = await prisma.baseResume.findMany({
        where: whereConditions.AND.length > 0 ? whereConditions : undefined,
        select: {
          id: true,
          data: true,
          userId: true,
          name: true
        },
        orderBy: {
          id: 'asc'
        },
        skip: offset,
        take: batchSize
      });

      if (batch.length === 0) {
        break;
      }

      logger.info(`Processing batch ${Math.floor(offset / batchSize) + 1}`, {
        batchSize: batch.length,
        offset,
        totalResumes
      });

      // Process batch (with rate limiting via sequential processing)
      for (const resume of batch) {
        if (!jobState.isRunning) {
          logger.warn('Job stopped by external request');
          break;
        }

        const result = await processResumeEmbedding(resume);
        results.push(result);

        jobState.processedResumes++;
        jobState.lastProcessedResumeId = resume.id;

        if (result.success) {
          jobState.successfulResumes++;
        } else {
          jobState.failedResumes++;
          jobState.errors.push({
            resumeId: resume.id,
            error: result.error,
            timestamp: new Date().toISOString()
          });
        }

        // Log progress every 10 resumes
        if (jobState.processedResumes % 10 === 0) {
          const status = getJobStatus();
          logger.info('Job progress update', {
            processed: status.processedResumes,
            total: status.totalResumes,
            successful: status.successfulResumes,
            failed: status.failedResumes,
            progressPercentage: status.progressPercentage,
            estimatedTimeRemaining: status.estimatedTimeRemaining
          });
        }
      }

      offset += batchSize;

      // Delay between batches to avoid overwhelming the API
      if (offset < totalResumes && jobState.isRunning) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const duration = Date.now() - jobState.startTime;

    logger.info('Background embedding generation job completed', {
      jobId,
      totalResumes,
      processedResumes: jobState.processedResumes,
      successfulResumes: jobState.successfulResumes,
      failedResumes: jobState.failedResumes,
      duration,
      averageTimePerResume: Math.round(duration / jobState.processedResumes)
    });

    const finalResults = {
      jobId,
      success: true,
      totalResumes,
      processedResumes: jobState.processedResumes,
      successfulResumes: jobState.successfulResumes,
      failedResumes: jobState.failedResumes,
      duration,
      averageTimePerResume: Math.round(duration / jobState.processedResumes),
      errors: jobState.errors.slice(0, 100), // Limit to first 100 errors
      lastProcessedResumeId: jobState.lastProcessedResumeId
    };

    resetJobState();

    return finalResults;

  } catch (error) {
    logger.error('Background embedding generation job failed', {
      jobId,
      error: error.message,
      stack: error.stack
    });

    const finalResults = {
      jobId,
      success: false,
      error: error.message,
      totalResumes: jobState.totalResumes,
      processedResumes: jobState.processedResumes,
      successfulResumes: jobState.successfulResumes,
      failedResumes: jobState.failedResumes,
      lastProcessedResumeId: jobState.lastProcessedResumeId
    };

    resetJobState();

    throw error;
  }
}

/**
 * Stop the currently running job
 * @returns {boolean} True if job was stopped, false if no job was running
 */
function stopJob() {
  if (!jobState.isRunning) {
    return false;
  }

  logger.warn('Stopping background embedding generation job', {
    jobId: jobState.currentJobId,
    processedSoFar: jobState.processedResumes,
    totalResumes: jobState.totalResumes
  });

  jobState.isRunning = false;

  return true;
}

/**
 * Generate embedding for a specific resume (on-demand)
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} Result
 */
async function generateEmbeddingForResume(resumeId) {
  try {
    logger.info('Generating embedding for specific resume', { resumeId });

    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: {
        id: true,
        data: true,
        name: true
      }
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const result = await processResumeEmbedding(resume);

    if (!result.success) {
      throw new Error(result.error);
    }

    logger.info('Embedding generated for specific resume', {
      resumeId,
      duration: result.duration
    });

    return {
      success: true,
      resumeId,
      duration: result.duration
    };

  } catch (error) {
    logger.error('Failed to generate embedding for specific resume', {
      resumeId,
      error: error.message
    });

    throw error;
  }
}

/**
 * Get embedding coverage statistics
 * @returns {Promise<Object>} Statistics
 */
async function getEmbeddingCoverageStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        total_resumes,
        resumes_with_embeddings,
        resumes_without_embeddings,
        coverage_percentage
      FROM embedding_coverage_stats
    `;

    if (stats.length === 0) {
      return {
        totalResumes: 0,
        resumesWithEmbeddings: 0,
        resumesWithoutEmbeddings: 0,
        coveragePercentage: 0
      };
    }

    const s = stats[0];

    return {
      totalResumes: Number(s.total_resumes || 0),
      resumesWithEmbeddings: Number(s.resumes_with_embeddings || 0),
      resumesWithoutEmbeddings: Number(s.resumes_without_embeddings || 0),
      coveragePercentage: parseFloat(s.coverage_percentage) || 0
    };

  } catch (error) {
    logger.error('Failed to get embedding coverage stats', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  generateEmbeddingsForAllResumes,
  generateEmbeddingForResume,
  getJobStatus,
  stopJob,
  getEmbeddingCoverageStats,
  resetJobState
};

