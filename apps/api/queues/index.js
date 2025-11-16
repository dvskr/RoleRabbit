/**
 * BullMQ Queue Setup
 * 
 * Manages all background job queues:
 * - resume-export-queue: PDF/DOCX generation
 * - resume-parse-queue: File parsing
 * - ai-generation-queue: LLM operations
 * - embedding-generation-queue: Vector embeddings
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');

/**
 * Redis connection configuration
 */
const redisConnection = new Redis(process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

/**
 * Queue configurations
 */
const QUEUE_CONFIGS = {
  'resume-export': {
    name: 'resume-export-queue',
    concurrency: parseInt(process.env.EXPORT_QUEUE_CONCURRENCY || '5'),
    timeout: parseInt(process.env.EXPORT_JOB_TIMEOUT || '300000'), // 5 minutes
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000 // Start with 1 minute
    }
  },
  'resume-parse': {
    name: 'resume-parse-queue',
    concurrency: parseInt(process.env.PARSE_QUEUE_CONCURRENCY || '5'),
    timeout: parseInt(process.env.PARSE_JOB_TIMEOUT || '60000'), // 1 minute
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000 // Start with 10 seconds
    }
  },
  'ai-generation': {
    name: 'ai-generation-queue',
    concurrency: parseInt(process.env.AI_QUEUE_CONCURRENCY || '3'),
    timeout: parseInt(process.env.AI_JOB_TIMEOUT || '120000'), // 2 minutes
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30000 // Start with 30 seconds
    }
  },
  'embedding-generation': {
    name: 'embedding-generation-queue',
    concurrency: parseInt(process.env.EMBEDDING_QUEUE_CONCURRENCY || '2'),
    timeout: parseInt(process.env.EMBEDDING_JOB_TIMEOUT || '60000'), // 1 minute
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 20000 // Start with 20 seconds
    }
  }
};

/**
 * Create queues
 */
const queues = {};
const workers = {};
const queueEvents = {};

Object.entries(QUEUE_CONFIGS).forEach(([key, config]) => {
  // Create queue
  queues[key] = new Queue(config.name, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: config.attempts,
      backoff: config.backoff,
      removeOnComplete: {
        age: 7 * 24 * 60 * 60, // Keep for 7 days
        count: 1000 // Keep last 1000 jobs
      },
      removeOnFail: {
        age: 30 * 24 * 60 * 60 // Keep failed jobs for 30 days
      }
    }
  });

  // Create queue events listener
  queueEvents[key] = new QueueEvents(config.name, {
    connection: redisConnection
  });

  // Listen to events
  queueEvents[key].on('completed', ({ jobId }) => {
    console.log(`✅ Job completed: ${config.name}/${jobId}`);
  });

  queueEvents[key].on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Job failed: ${config.name}/${jobId}`, failedReason);
  });

  queueEvents[key].on('stalled', ({ jobId }) => {
    console.warn(`⚠️  Job stalled: ${config.name}/${jobId}`);
  });
});

/**
 * Create workers (imported from separate files)
 */
function createWorker(queueKey, processor) {
  const config = QUEUE_CONFIGS[queueKey];
  
  workers[queueKey] = new Worker(config.name, processor, {
    connection: redisConnection,
    concurrency: config.concurrency,
    lockDuration: config.timeout,
    maxStalledCount: 3
  });

  // Worker event listeners
  workers[queueKey].on('completed', (job) => {
    console.log(`✅ Worker completed job: ${job.id}`);
  });

  workers[queueKey].on('failed', (job, err) => {
    console.error(`❌ Worker failed job: ${job.id}`, err.message);
  });

  workers[queueKey].on('error', (err) => {
    console.error(`💥 Worker error in ${config.name}:`, err);
  });

  return workers[queueKey];
}

/**
 * Add job to queue
 */
async function addJob(queueKey, jobName, data, options = {}) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  try {
    const job = await queue.add(jobName, data, options);
    console.log(`📥 Job added to ${queueKey}: ${job.id}`);
    return job;
  } catch (error) {
    console.error(`Failed to add job to ${queueKey}:`, error);
    throw error;
  }
}

/**
 * Get job status
 */
async function getJobStatus(queueKey, jobId) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  try {
    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress,
      returnValue,
      failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };
  } catch (error) {
    console.error(`Failed to get job status: ${jobId}`, error);
    throw error;
  }
}

/**
 * Remove job
 */
async function removeJob(queueKey, jobId) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  try {
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`🗑️  Job removed: ${jobId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to remove job: ${jobId}`, error);
    throw error;
  }
}

/**
 * Get queue stats
 */
async function getQueueStats(queueKey) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  try {
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
    console.error(`Failed to get queue stats: ${queueKey}`, error);
    throw error;
  }
}

/**
 * Get all queue stats
 */
async function getAllQueueStats() {
  const stats = {};
  
  for (const key of Object.keys(queues)) {
    stats[key] = await getQueueStats(key);
  }

  return stats;
}

/**
 * Clean old jobs
 */
async function cleanQueue(queueKey, grace = 7 * 24 * 60 * 60 * 1000) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  try {
    // Clean completed jobs older than grace period
    await queue.clean(grace, 1000, 'completed');
    
    // Clean failed jobs older than 30 days
    await queue.clean(30 * 24 * 60 * 60 * 1000, 1000, 'failed');

    console.log(`🧹 Cleaned queue: ${queueKey}`);
  } catch (error) {
    console.error(`Failed to clean queue: ${queueKey}`, error);
    throw error;
  }
}

/**
 * Clean all queues
 */
async function cleanAllQueues() {
  for (const key of Object.keys(queues)) {
    await cleanQueue(key);
  }
  console.log('🧹 All queues cleaned');
}

/**
 * Pause queue
 */
async function pauseQueue(queueKey) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  await queue.pause();
  console.log(`⏸️  Queue paused: ${queueKey}`);
}

/**
 * Resume queue
 */
async function resumeQueue(queueKey) {
  const queue = queues[queueKey];
  if (!queue) {
    throw new Error(`Queue not found: ${queueKey}`);
  }

  await queue.resume();
  console.log(`▶️  Queue resumed: ${queueKey}`);
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('🛑 Shutting down queues...');

  // Close all workers
  for (const [key, worker] of Object.entries(workers)) {
    await worker.close();
    console.log(`Worker closed: ${key}`);
  }

  // Close all queues
  for (const [key, queue] of Object.entries(queues)) {
    await queue.close();
    console.log(`Queue closed: ${key}`);
  }

  // Close queue events
  for (const [key, events] of Object.entries(queueEvents)) {
    await events.close();
    console.log(`Queue events closed: ${key}`);
  }

  // Close Redis connection
  await redisConnection.quit();
  console.log('Redis connection closed');

  console.log('✅ Queues shut down successfully');
}

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  queues,
  workers,
  queueEvents,
  createWorker,
  addJob,
  getJobStatus,
  removeJob,
  getQueueStats,
  getAllQueueStats,
  cleanQueue,
  cleanAllQueues,
  pauseQueue,
  resumeQueue,
  shutdown,
  QUEUE_CONFIGS
};

