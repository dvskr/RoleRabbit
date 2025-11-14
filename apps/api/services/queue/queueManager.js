/**
 * Job Queue Manager
 * 
 * Manages job queues for long-running AI operations using BullMQ
 */

const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../../utils/logger');

// Redis connection for BullMQ
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false
});

// Queue configurations
const QUEUE_CONFIGS = {
  RESUME_PARSING: {
    name: 'resume-parsing',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000
      },
      removeOnFail: {
        age: 7 * 24 * 3600 // Keep failed jobs for 7 days
      }
    }
  },
  ATS_ANALYSIS: {
    name: 'ats-analysis',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        age: 24 * 3600,
        count: 1000
      },
      removeOnFail: {
        age: 7 * 24 * 3600
      }
    }
  },
  TAILORING: {
    name: 'tailoring',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        age: 24 * 3600,
        count: 1000
      },
      removeOnFail: {
        age: 7 * 24 * 3600
      },
      priority: 1 // Higher priority for tailoring
    }
  }
};

// Initialize queues
const queues = {};
const workers = {};

/**
 * Initialize all queues
 */
function initializeQueues() {
  try {
    for (const [key, config] of Object.entries(QUEUE_CONFIGS)) {
      // Create queue (BullMQ v3+ handles scheduling internally, no need for QueueScheduler)
      queues[key] = new Queue(config.name, {
        connection: redisConnection,
        defaultJobOptions: config.defaultJobOptions
      });

      logger.info(`Queue initialized: ${config.name}`);
    }

    logger.info('All queues initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize queues', { error: error.message });
    throw error;
  }
}

/**
 * Add a job to the queue
 */
async function addJob(queueType, jobData, options = {}) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const job = await queue.add(
      jobData.name || queueType.toLowerCase(),
      jobData,
      {
        ...options,
        jobId: jobData.jobId || `${queueType}_${Date.now()}_${Math.random().toString(36).substring(7)}`
      }
    );

    logger.info('Job added to queue', {
      queueType,
      jobId: job.id,
      name: job.name
    });

    return {
      jobId: job.id,
      queueName: queue.name,
      position: await getJobPosition(queueType, job.id)
    };
  } catch (error) {
    logger.error('Failed to add job to queue', {
      queueType,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get job status
 */
async function getJobStatus(queueType, jobId) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return {
        status: 'not_found',
        jobId
      };
    }

    const state = await job.getState();
    const progress = job.progress;
    const position = state === 'waiting' ? await getJobPosition(queueType, jobId) : null;

    return {
      jobId: job.id,
      status: state,
      progress,
      position,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };
  } catch (error) {
    logger.error('Failed to get job status', {
      queueType,
      jobId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get job position in queue
 */
async function getJobPosition(queueType, jobId) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      return null;
    }

    const waitingJobs = await queue.getWaiting();
    const position = waitingJobs.findIndex(job => job.id === jobId);
    
    return position >= 0 ? position + 1 : null;
  } catch (error) {
    logger.error('Failed to get job position', {
      queueType,
      jobId,
      error: error.message
    });
    return null;
  }
}

/**
 * Cancel a job
 */
async function cancelJob(queueType, jobId) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    await job.remove();

    logger.info('Job cancelled', {
      queueType,
      jobId
    });

    return { success: true, jobId };
  } catch (error) {
    logger.error('Failed to cancel job', {
      queueType,
      jobId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats(queueType) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      queueName: queue.name,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  } catch (error) {
    logger.error('Failed to get queue stats', {
      queueType,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get all queue statistics
 */
async function getAllQueueStats() {
  try {
    const stats = {};
    
    for (const queueType of Object.keys(queues)) {
      stats[queueType] = await getQueueStats(queueType);
    }

    return stats;
  } catch (error) {
    logger.error('Failed to get all queue stats', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Clean old jobs from queue
 */
async function cleanQueue(queueType, grace = 24 * 3600 * 1000) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const [completedCleaned, failedCleaned] = await Promise.all([
      queue.clean(grace, 1000, 'completed'),
      queue.clean(grace * 7, 1000, 'failed') // Keep failed jobs longer
    ]);

    logger.info('Queue cleaned', {
      queueType,
      completedCleaned,
      failedCleaned
    });

    return {
      completedCleaned,
      failedCleaned
    };
  } catch (error) {
    logger.error('Failed to clean queue', {
      queueType,
      error: error.message
    });
    throw error;
  }
}

/**
 * Pause queue
 */
async function pauseQueue(queueType) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    await queue.pause();
    logger.info('Queue paused', { queueType });

    return { success: true, queueType, status: 'paused' };
  } catch (error) {
    logger.error('Failed to pause queue', {
      queueType,
      error: error.message
    });
    throw error;
  }
}

/**
 * Resume queue
 */
async function resumeQueue(queueType) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    await queue.resume();
    logger.info('Queue resumed', { queueType });

    return { success: true, queueType, status: 'active' };
  } catch (error) {
    logger.error('Failed to resume queue', {
      queueType,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get failed jobs
 */
async function getFailedJobs(queueType, limit = 50) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const failedJobs = await queue.getFailed(0, limit - 1);

    return failedJobs.map(job => ({
      jobId: job.id,
      name: job.name,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn
    }));
  } catch (error) {
    logger.error('Failed to get failed jobs', {
      queueType,
      error: error.message
    });
    throw error;
  }
}

/**
 * Retry failed job
 */
async function retryFailedJob(queueType, jobId) {
  try {
    const queue = queues[queueType];
    if (!queue) {
      throw new Error(`Queue not found: ${queueType}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    await job.retry();
    logger.info('Job retried', { queueType, jobId });

    return { success: true, jobId };
  } catch (error) {
    logger.error('Failed to retry job', {
      queueType,
      jobId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Close all queues and workers
 */
async function closeAll() {
  try {
    logger.info('Closing all queues and workers...');

    // Close workers
    for (const worker of Object.values(workers)) {
      await worker.close();
    }

    // Close queues
    for (const queue of Object.values(queues)) {
      await queue.close();
    }

    // Close Redis connection
    await redisConnection.quit();

    logger.info('All queues and workers closed successfully');
  } catch (error) {
    logger.error('Failed to close queues', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  initializeQueues,
  addJob,
  getJobStatus,
  getJobPosition,
  cancelJob,
  getQueueStats,
  getAllQueueStats,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  getFailedJobs,
  retryFailedJob,
  closeAll,
  queues,
  workers,
  QUEUE_CONFIGS
};

