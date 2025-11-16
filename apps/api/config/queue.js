/**
 * Queue System Configuration
 * INFRA-013: Queue system for email notifications and background jobs
 * Uses BullMQ (Redis-based queue)
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../utils/logger');
const { getEnv } = require('../utils/envValidation');

// Redis connection (with graceful fallback)
let redisConnection = null;
try {
  const redisUrl = getEnv('REDIS_URL', 'redis://localhost:6379');
  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries, queues will be disabled');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    }
  });

  redisConnection.on('error', (error) => {
    logger.warn('Redis connection error (queues may be disabled):', error.message);
  });

  redisConnection.on('connect', () => {
    logger.info('✅ Redis connected for queue system');
  });
} catch (error) {
  logger.warn('Failed to initialize Redis connection (queues will be disabled):', error.message);
}

// Queue names
const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  QUOTA_SYNC: 'quota-sync-queue',
  CLEANUP: 'cleanup-queue',
  THUMBNAIL: 'thumbnail-queue',
  VIRUS_SCAN: 'virus-scan-queue',
  SENSITIVE_DATA_SCAN: 'sensitive-data-scan-queue',
  QUOTA_WARNING: 'quota-warning-queue'
};

// Create queues (only if Redis is available)
const queues = {};
if (redisConnection) {
  queues.email = new Queue(QUEUE_NAMES.EMAIL, { connection: redisConnection });
  queues.quotaSync = new Queue(QUEUE_NAMES.QUOTA_SYNC, { connection: redisConnection });
  queues.cleanup = new Queue(QUEUE_NAMES.CLEANUP, { connection: redisConnection });
  queues.thumbnail = new Queue(QUEUE_NAMES.THUMBNAIL, { connection: redisConnection });
  queues.virusScan = new Queue(QUEUE_NAMES.VIRUS_SCAN, { connection: redisConnection });
  queues.sensitiveDataScan = new Queue(QUEUE_NAMES.SENSITIVE_DATA_SCAN, { connection: redisConnection });
  queues.quotaWarning = new Queue(QUEUE_NAMES.QUOTA_WARNING, { connection: redisConnection });
} else {
  logger.warn('⚠️ Redis not available - queues will be disabled');
}

// Queue event handlers (only if Redis is available)
if (redisConnection) {
  Object.values(queues).forEach(queue => {
    try {
      const queueEvents = new QueueEvents(queue.name, { connection: redisConnection });
      
      queueEvents.on('completed', ({ jobId }) => {
        logger.debug(`Job ${jobId} completed in queue ${queue.name}`);
      });
      
      queueEvents.on('failed', ({ jobId, failedReason }) => {
        logger.error(`Job ${jobId} failed in queue ${queue.name}: ${failedReason}`);
      });
    } catch (error) {
      logger.warn(`Failed to set up event handlers for queue ${queue.name}:`, error.message);
    }
  });
}

/**
 * INFRA-014: Retry logic for failed background jobs (exponential backoff)
 */
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000 // Start with 2 seconds, then 4s, 8s, etc.
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000 // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600 // Keep failed jobs for 7 days
  }
};

/**
 * Add job to queue with retry logic
 */
async function addJob(queueName, jobData, options = {}) {
  if (!redisConnection) {
    logger.warn(`Cannot add job to ${queueName} - Redis not available`);
    return null;
  }
  
  const queue = queues[queueName];
  if (!queue) {
    logger.warn(`Queue ${queueName} not found`);
    return null;
  }

  const jobOptions = {
    ...defaultJobOptions,
    ...options
  };

  try {
    const job = await queue.add(queueName, jobData, jobOptions);
    logger.debug(`Added job ${job.id} to queue ${queueName}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add job to queue ${queueName}:`, error);
    return null;
  }
}

/**
 * Get queue status
 */
async function getQueueStatus(queueName) {
  const queue = queues[queueName];
  if (!queue) {
    return null;
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
}

/**
 * Get all queue statuses
 */
async function getAllQueueStatuses() {
  const statuses = {};
  for (const queueName of Object.keys(queues)) {
    statuses[queueName] = await getQueueStatus(queueName);
  }
  return statuses;
}

/**
 * Clean up old jobs
 */
async function cleanQueue(queueName, grace = 5000) {
  const queue = queues[queueName];
  if (!queue) {
    return;
  }

  await queue.clean(grace, 1000, 'completed');
  await queue.clean(grace, 1000, 'failed');
}

module.exports = {
  queues,
  QUEUE_NAMES,
  redisConnection,
  addJob,
  getQueueStatus,
  getAllQueueStatuses,
  cleanQueue,
  defaultJobOptions
};

