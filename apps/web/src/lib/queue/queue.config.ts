/**
 * Queue Configuration
 * Section 2.12: Background Jobs & Async Processing
 *
 * Using BullMQ with Upstash Redis (serverless)
 */

import { Queue, QueueOptions, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

/**
 * Redis connection for Upstash (serverless Redis)
 * Alternative: Use local Redis for development
 */
export const createRedisConnection = (): Redis => {
  // Production: Use Upstash Redis (serverless, no infrastructure)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    // Upstash uses REST API, but we need Redis protocol for BullMQ
    // Use the Redis endpoint (not REST endpoint)
    return new Redis(process.env.REDIS_URL || '', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // TLS required for Upstash
      tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    });
  }

  // Development: Use local Redis
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
};

/**
 * Default queue options
 */
export const defaultQueueOptions: QueueOptions = {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3, // Max retries
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
};

/**
 * Queue names
 */
export enum QueueName {
  DEPLOYMENT = 'deployment',
  PDF_GENERATION = 'pdf-generation',
  EXPORT = 'export',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
}

/**
 * Job data interfaces
 */
export interface DeploymentJobData {
  portfolioId: string;
  userId: string;
  deploymentId: string;
  options?: {
    customDomain?: string;
    subdomain?: string;
  };
}

export interface PdfGenerationJobData {
  portfolioId: string;
  userId: string;
  email: string;
  format?: 'A4' | 'Letter';
  includeImages?: boolean;
}

export interface ExportJobData {
  portfolioId: string;
  userId: string;
  format: 'pdf' | 'zip' | 'json';
  email: string;
}

export interface WebhookJobData {
  url: string;
  event: string;
  payload: Record<string, any>;
  retries?: number;
}

/**
 * Job priorities
 */
export enum JobPriority {
  LOW = 10,
  NORMAL = 5,
  HIGH = 1,
  CRITICAL = 0,
}

/**
 * Create a queue instance
 */
export const createQueue = <T = any>(name: QueueName): Queue<T> => {
  return new Queue<T>(name, defaultQueueOptions);
};

/**
 * Queue instances (singleton pattern)
 */
let deploymentQueue: Queue<DeploymentJobData> | null = null;
let pdfGenerationQueue: Queue<PdfGenerationJobData> | null = null;
let exportQueue: Queue<ExportJobData> | null = null;
let webhookQueue: Queue<WebhookJobData> | null = null;

export const getDeploymentQueue = (): Queue<DeploymentJobData> => {
  if (!deploymentQueue) {
    deploymentQueue = createQueue<DeploymentJobData>(QueueName.DEPLOYMENT);
  }
  return deploymentQueue;
};

export const getPdfGenerationQueue = (): Queue<PdfGenerationJobData> => {
  if (!pdfGenerationQueue) {
    pdfGenerationQueue = createQueue<PdfGenerationJobData>(QueueName.PDF_GENERATION);
  }
  return pdfGenerationQueue;
};

export const getExportQueue = (): Queue<ExportJobData> => {
  if (!exportQueue) {
    exportQueue = createQueue<ExportJobData>(QueueName.EXPORT);
  }
  return exportQueue;
};

export const getWebhookQueue = (): Queue<WebhookJobData> => {
  if (!webhookQueue) {
    webhookQueue = createQueue<WebhookJobData>(QueueName.WEBHOOK);
  }
  return webhookQueue;
};

/**
 * Close all queue connections (for graceful shutdown)
 */
export const closeAllQueues = async (): Promise<void> => {
  const queues = [deploymentQueue, pdfGenerationQueue, exportQueue, webhookQueue];

  await Promise.all(
    queues.filter(q => q !== null).map(q => q!.close())
  );

  deploymentQueue = null;
  pdfGenerationQueue = null;
  exportQueue = null;
  webhookQueue = null;
};
