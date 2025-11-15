/**
 * Background Job Queue Setup (Section 4.4)
 *
 * BullMQ queue configuration for deployment and PDF generation jobs
 * Uses Redis (Upstash) for job persistence
 */

import { Queue, QueueOptions, Worker, WorkerOptions, Job } from 'bullmq';
import { Redis } from 'ioredis';

/**
 * Redis connection configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  tls?: boolean;
  maxRetriesPerRequest: number;
}

/**
 * Queue configuration
 */
export interface JobQueueConfig {
  redis: RedisConfig;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential';
      delay: number;
    };
    removeOnComplete: {
      age: number; // Keep completed jobs for 7 days
      count: number;
    };
    removeOnFail: {
      age: number; // Keep failed jobs for 30 days
    };
  };
}

/**
 * Deployment job data
 */
export interface DeploymentJobData {
  portfolioId: string;
  deploymentId: string;
  userId: string;
  templateId?: string;
  forceRebuild?: boolean;
}

/**
 * PDF generation job data
 */
export interface PDFJobData {
  portfolioId: string;
  userId: string;
  format?: 'A4' | 'Letter';
  includeAnalytics?: boolean;
  watermark?: boolean;
}

/**
 * SSL provisioning job data
 */
export interface SSLJobData {
  domainId: string;
  domain: string;
  userId: string;
  useStagingCA?: boolean;
}

/**
 * Analytics aggregation job data
 */
export interface AnalyticsJobData {
  portfolioId?: string; // If null, aggregate all portfolios
  startDate: string;
  endDate: string;
}

/**
 * Get default queue configuration
 */
function getDefaultConfig(): JobQueueConfig {
  // Check if using Upstash Redis (REST API)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    // Parse Upstash URL
    const url = new URL(upstashUrl);
    return {
      redis: {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: upstashToken,
        tls: true,
        maxRetriesPerRequest: 3,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 7 * 24 * 3600, // 7 days
          count: 1000,
        },
        removeOnFail: {
          age: 30 * 24 * 3600, // 30 days
        },
      },
    };
  }

  // Standard Redis configuration
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true',
      maxRetriesPerRequest: 3,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 7 * 24 * 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 30 * 24 * 3600,
      },
    },
  };
}

/**
 * Create Redis connection
 */
export function createRedisConnection(config?: RedisConfig): Redis {
  const redisConfig = config || getDefaultConfig().redis;

  return new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
    ...(redisConfig.tls && {
      tls: {
        host: redisConfig.host,
      },
    }),
  });
}

/**
 * Queue manager class
 */
export class QueueManager {
  private static instance: QueueManager;
  private config: JobQueueConfig;
  private connection: Redis;

  // Queues
  public deploymentQueue: Queue<DeploymentJobData>;
  public pdfQueue: Queue<PDFJobData>;
  public sslQueue: Queue<SSLJobData>;
  public analyticsQueue: Queue<AnalyticsJobData>;

  private constructor() {
    this.config = getDefaultConfig();
    this.connection = createRedisConnection(this.config.redis);

    // Initialize queues
    this.deploymentQueue = this.createQueue<DeploymentJobData>('deployment', {
      defaultJobOptions: {
        ...this.config.defaultJobOptions,
        // Deployment-specific settings
        timeout: 300000, // 5 minutes timeout
        priority: 1, // Higher priority
      },
    });

    this.pdfQueue = this.createQueue<PDFJobData>('pdf-generation', {
      defaultJobOptions: {
        ...this.config.defaultJobOptions,
        timeout: 60000, // 1 minute timeout
        priority: 2,
      },
    });

    this.sslQueue = this.createQueue<SSLJobData>('ssl-provisioning', {
      defaultJobOptions: {
        ...this.config.defaultJobOptions,
        timeout: 300000, // 5 minutes timeout
        priority: 1,
      },
    });

    this.analyticsQueue = this.createQueue<AnalyticsJobData>('analytics-aggregation', {
      defaultJobOptions: {
        ...this.config.defaultJobOptions,
        timeout: 600000, // 10 minutes timeout
        priority: 3, // Lower priority
      },
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  /**
   * Create a queue
   */
  private createQueue<T>(name: string, options?: Partial<QueueOptions>): Queue<T> {
    return new Queue<T>(name, {
      connection: this.connection,
      ...options,
    });
  }

  /**
   * Add deployment job
   */
  async addDeploymentJob(
    data: DeploymentJobData,
    options?: {
      priority?: number;
      delay?: number;
    }
  ): Promise<Job<DeploymentJobData>> {
    return this.deploymentQueue.add('deploy-portfolio', data, {
      priority: options?.priority,
      delay: options?.delay,
      jobId: `deploy-${data.deploymentId}`, // Prevent duplicate deployments
    });
  }

  /**
   * Add PDF generation job
   */
  async addPDFJob(
    data: PDFJobData,
    options?: {
      priority?: number;
      delay?: number;
    }
  ): Promise<Job<PDFJobData>> {
    return this.pdfQueue.add('generate-pdf', data, {
      priority: options?.priority,
      delay: options?.delay,
      jobId: `pdf-${data.portfolioId}-${Date.now()}`,
    });
  }

  /**
   * Add SSL provisioning job
   */
  async addSSLJob(
    data: SSLJobData,
    options?: {
      priority?: number;
      delay?: number;
    }
  ): Promise<Job<SSLJobData>> {
    return this.sslQueue.add('provision-ssl', data, {
      priority: options?.priority,
      delay: options?.delay,
      jobId: `ssl-${data.domainId}`,
    });
  }

  /**
   * Add analytics aggregation job
   */
  async addAnalyticsJob(
    data: AnalyticsJobData,
    options?: {
      priority?: number;
      delay?: number;
    }
  ): Promise<Job<AnalyticsJobData>> {
    return this.analyticsQueue.add('aggregate-analytics', data, {
      priority: options?.priority,
      delay: options?.delay,
    });
  }

  /**
   * Schedule recurring analytics aggregation
   * Runs daily at 2 AM UTC
   */
  async scheduleAnalyticsAggregation(): Promise<void> {
    await this.analyticsQueue.add(
      'daily-analytics',
      {
        startDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      {
        repeat: {
          pattern: '0 2 * * *', // Cron: 2 AM daily
        },
      }
    );
  }

  /**
   * Get queue stats
   */
  async getQueueStats(queueName: 'deployment' | 'pdf' | 'ssl' | 'analytics') {
    const queue =
      queueName === 'deployment'
        ? this.deploymentQueue
        : queueName === 'pdf'
        ? this.pdfQueue
        : queueName === 'ssl'
        ? this.sslQueue
        : this.analyticsQueue;

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: 'deployment' | 'pdf' | 'ssl' | 'analytics'): Promise<void> {
    const queue =
      queueName === 'deployment'
        ? this.deploymentQueue
        : queueName === 'pdf'
        ? this.pdfQueue
        : queueName === 'ssl'
        ? this.sslQueue
        : this.analyticsQueue;

    await queue.pause();
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: 'deployment' | 'pdf' | 'ssl' | 'analytics'): Promise<void> {
    const queue =
      queueName === 'deployment'
        ? this.deploymentQueue
        : queueName === 'pdf'
        ? this.pdfQueue
        : queueName === 'ssl'
        ? this.sslQueue
        : this.analyticsQueue;

    await queue.resume();
  }

  /**
   * Clean old jobs
   */
  async cleanQueue(
    queueName: 'deployment' | 'pdf' | 'ssl' | 'analytics',
    grace: number = 7 * 24 * 3600 * 1000 // 7 days
  ): Promise<void> {
    const queue =
      queueName === 'deployment'
        ? this.deploymentQueue
        : queueName === 'pdf'
        ? this.pdfQueue
        : queueName === 'ssl'
        ? this.sslQueue
        : this.analyticsQueue;

    await queue.clean(grace, 1000, 'completed');
    await queue.clean(grace * 4, 1000, 'failed'); // Keep failed jobs 4x longer
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await Promise.all([
      this.deploymentQueue.close(),
      this.pdfQueue.close(),
      this.sslQueue.close(),
      this.analyticsQueue.close(),
    ]);
    await this.connection.quit();
  }
}

/**
 * Export singleton instance
 */
export const queueManager = QueueManager.getInstance();

/**
 * Export individual queues for convenience
 */
export const { deploymentQueue, pdfQueue, sslQueue, analyticsQueue } = queueManager;
