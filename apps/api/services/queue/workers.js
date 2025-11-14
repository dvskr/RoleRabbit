/**
 * Queue Workers
 * 
 * Process jobs from queues
 */

const { Worker } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../../utils/logger');
const { parseResume } = require('../resumeParser');
const { analyzeATSScore } = require('../embeddings/embeddingATSService');
const { tailorResume } = require('../ai/tailorService');
const { prisma } = require('../../utils/db');
const socketIOServer = require('../../utils/socketIOServer');

// Redis connection for workers
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const workers = {};

/**
 * Resume Parsing Worker
 */
function createResumeParsingWorker() {
  const worker = new Worker(
    'resume-parsing',
    async (job) => {
      const { userId, fileBuffer, fileName, mimeType } = job.data;

      logger.info('Processing resume parsing job', {
        jobId: job.id,
        userId,
        fileName
      });

      try {
        // Update progress
        await job.updateProgress(10);

        // Parse resume
        const result = await parseResume({
          fileBuffer,
          fileName,
          mimeType
        });

        await job.updateProgress(90);

        // Save to database
        const baseResume = await prisma.baseResume.create({
          data: {
            userId,
            fileName,
            resumeData: result.resumeData,
            isActive: false
          }
        });

        await job.updateProgress(100);

        // Notify user via Socket.IO
        if (socketIOServer.isInitialized()) {
          socketIOServer.notifyUser(userId, 'resume_parsed', {
            resumeId: baseResume.id,
            fileName
          });
        }

        logger.info('Resume parsing job completed', {
          jobId: job.id,
          userId,
          resumeId: baseResume.id
        });

        return {
          success: true,
          resumeId: baseResume.id,
          fileName
        };
      } catch (error) {
        logger.error('Resume parsing job failed', {
          jobId: job.id,
          userId,
          error: error.message
        });

        // Notify user of failure
        if (socketIOServer.isInitialized()) {
          socketIOServer.notifyUser(userId, 'resume_parse_failed', {
            error: error.message
          });
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5, // Process 5 jobs concurrently
      limiter: {
        max: 10, // Max 10 jobs
        duration: 60000 // per minute
      }
    }
  );

  // Event handlers
  worker.on('completed', (job, result) => {
    logger.info('Resume parsing job completed', {
      jobId: job.id,
      result
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('Resume parsing job failed', {
      jobId: job?.id,
      error: error.message
    });
  });

  worker.on('error', (error) => {
    logger.error('Resume parsing worker error', {
      error: error.message
    });
  });

  return worker;
}

/**
 * ATS Analysis Worker
 */
function createATSAnalysisWorker() {
  const worker = new Worker(
    'ats-analysis',
    async (job) => {
      const { userId, resumeId, jobDescription } = job.data;

      logger.info('Processing ATS analysis job', {
        jobId: job.id,
        userId,
        resumeId
      });

      try {
        await job.updateProgress(10);

        // Get resume
        const resume = await prisma.baseResume.findUnique({
          where: { id: resumeId }
        });

        if (!resume) {
          throw new Error('Resume not found');
        }

        await job.updateProgress(30);

        // Analyze ATS score
        const result = await analyzeATSScore({
          resumeData: resume.resumeData,
          jobDescription
        });

        await job.updateProgress(100);

        // Notify user via Socket.IO
        if (socketIOServer.isInitialized()) {
          socketIOServer.notifyUser(userId, 'ats_analysis_complete', {
            resumeId,
            score: result.overall
          });
        }

        logger.info('ATS analysis job completed', {
          jobId: job.id,
          userId,
          resumeId,
          score: result.overall
        });

        return {
          success: true,
          resumeId,
          score: result.overall,
          result
        };
      } catch (error) {
        logger.error('ATS analysis job failed', {
          jobId: job.id,
          userId,
          resumeId,
          error: error.message
        });

        // Notify user of failure
        if (socketIOServer.isInitialized()) {
          socketIOServer.notifyUser(userId, 'ats_analysis_failed', {
            resumeId,
            error: error.message
          });
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
      limiter: {
        max: 5,
        duration: 60000
      }
    }
  );

  worker.on('completed', (job, result) => {
    logger.info('ATS analysis job completed', {
      jobId: job.id,
      result
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('ATS analysis job failed', {
      jobId: job?.id,
      error: error.message
    });
  });

  return worker;
}

/**
 * Tailoring Worker
 */
function createTailoringWorker() {
  const worker = new Worker(
    'tailoring',
    async (job) => {
      const { userId, resumeId, jobDescription, mode, tone, length } = job.data;

      logger.info('Processing tailoring job', {
        jobId: job.id,
        userId,
        resumeId,
        mode
      });

      try {
        await job.updateProgress(10);

        // Get user and resume
        const [user, resume] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, subscriptionTier: true }
          }),
          prisma.baseResume.findUnique({
            where: { id: resumeId }
          })
        ]);

        if (!user || !resume) {
          throw new Error('User or resume not found');
        }

        await job.updateProgress(30);

        // Progress callback
        const onProgress = (progressData) => {
          job.updateProgress(30 + (progressData.progress * 0.7)); // 30% to 100%
          
          if (socketIOServer.isInitialized()) {
            socketIOServer.notifyTailoringProgress(
              userId,
              `tailor_${job.id}`,
              progressData
            );
          }
        };

        // Tailor resume
        const result = await tailorResume({
          user,
          resumeId,
          jobDescription,
          mode,
          tone,
          length,
          onProgress
        });

        await job.updateProgress(100);

        // Notify user via Socket.IO
        if (socketIOServer.isInitialized()) {
          socketIOServer.notifyUser(userId, 'tailoring_complete', {
            resumeId,
            mode,
            scoreImprovement: result.estimatedScoreImprovement
          });
        }

        logger.info('Tailoring job completed', {
          jobId: job.id,
          userId,
          resumeId,
          mode,
          scoreImprovement: result.estimatedScoreImprovement
        });

        return {
          success: true,
          resumeId,
          mode,
          result
        };
      } catch (error) {
        logger.error('Tailoring job failed', {
          jobId: job.id,
          userId,
          resumeId,
          error: error.message
        });

        // Notify user of failure
        if (socketIOServer.isInitialized()) {
          socketIOServer.notifyUser(userId, 'tailoring_failed', {
            resumeId,
            error: error.message
          });
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // Lower concurrency for resource-intensive tailoring
      limiter: {
        max: 3,
        duration: 60000
      }
    }
  );

  worker.on('completed', (job, result) => {
    logger.info('Tailoring job completed', {
      jobId: job.id,
      result
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('Tailoring job failed', {
      jobId: job?.id,
      error: error.message
    });
  });

  return worker;
}

/**
 * Initialize all workers
 */
function initializeWorkers() {
  try {
    workers.RESUME_PARSING = createResumeParsingWorker();
    workers.ATS_ANALYSIS = createATSAnalysisWorker();
    workers.TAILORING = createTailoringWorker();

    logger.info('All workers initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize workers', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Close all workers
 */
async function closeAllWorkers() {
  try {
    for (const [name, worker] of Object.entries(workers)) {
      await worker.close();
      logger.info(`Worker closed: ${name}`);
    }
    
    await redisConnection.quit();
    logger.info('All workers closed successfully');
  } catch (error) {
    logger.error('Failed to close workers', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  initializeWorkers,
  closeAllWorkers,
  workers
};

