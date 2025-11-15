/**
 * Job Processors Index
 * Section 2.12: Background Jobs & Async Processing
 *
 * Export all job processors for worker initialization
 */

export {
  processDeploymentJob,
  DeploymentStatus,
  getDeploymentStatus,
  retryDeployment,
  type PortfolioDeployment,
} from './deployment.processor';

export {
  processPdfGenerationJob,
  PdfGenerationStatus,
  getPdfGenerationRecord,
  shouldGeneratePdfAsync,
  type PdfGenerationRecord,
} from './pdf-generation.processor';

/**
 * Worker initialization example:
 *
 * import { Worker } from 'bullmq';
 * import { QueueName, defaultQueueOptions } from '../queue.config';
 * import { processDeploymentJob, processPdfGenerationJob } from './processors';
 *
 * // Deployment worker
 * const deploymentWorker = new Worker(
 *   QueueName.DEPLOYMENT,
 *   processDeploymentJob,
 *   {
 *     connection: defaultQueueOptions.connection,
 *     concurrency: 3, // Process 3 deployments concurrently
 *   }
 * );
 *
 * // PDF generation worker
 * const pdfWorker = new Worker(
 *   QueueName.PDF_GENERATION,
 *   processPdfGenerationJob,
 *   {
 *     connection: defaultQueueOptions.connection,
 *     concurrency: 5, // Process 5 PDFs concurrently
 *   }
 * );
 *
 * // Event handlers
 * deploymentWorker.on('completed', (job) => {
 *   console.log(`Deployment ${job.id} completed`);
 * });
 *
 * deploymentWorker.on('failed', (job, error) => {
 *   console.error(`Deployment ${job.id} failed:`, error);
 * });
 */
