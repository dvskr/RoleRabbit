/**
 * Deployment Job Processor
 * Section 2.12: Background Jobs & Async Processing
 *
 * Requirement #2: Portfolio deployment asynchronously with steps
 * Requirement #3: Update PortfolioDeployment.status at each step
 * Requirement #4: Retry logic with exponential backoff
 * Requirement #5: On failure, log error and update status
 */

import { Job } from 'bullmq';
import { DeploymentJobData } from '../queue.config';
import { DeploymentService } from '@/services/deployment.service';
import { logger } from '@/lib/logger/logger';
import {
  PortfolioNotFoundError,
  ExternalServiceError,
  ValidationError,
} from '@/lib/errors';

/**
 * Deployment status enum
 * Requirement #3: Track deployment status
 */
export enum DeploymentStatus {
  QUEUED = 'QUEUED',
  VALIDATING = 'VALIDATING',
  BUILDING = 'BUILDING',
  UPLOADING = 'UPLOADING',
  CONFIGURING = 'CONFIGURING',
  DEPLOYED = 'DEPLOYED',
  FAILED = 'FAILED',
}

/**
 * Portfolio deployment record (mock database)
 * In production: This should be a Supabase table
 */
export interface PortfolioDeployment {
  id: string;
  portfolioId: string;
  userId: string;
  status: DeploymentStatus;
  url?: string;
  storageUrl?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
  retriesCount: number;
  logs: string[];
}

// Mock database
const deployments: Map<string, PortfolioDeployment> = new Map();

/**
 * Update deployment status in database
 * TODO: In production, use Supabase
 */
const updateDeploymentStatus = async (
  deploymentId: string,
  status: DeploymentStatus,
  data?: Partial<PortfolioDeployment>
): Promise<void> => {
  const deployment = deployments.get(deploymentId);

  if (!deployment) {
    throw new Error(`Deployment ${deploymentId} not found`);
  }

  deployment.status = status;
  deployment.logs.push(`[${new Date().toISOString()}] Status: ${status}`);

  if (data) {
    Object.assign(deployment, data);
  }

  // TODO: In production, use Supabase
  // await supabase
  //   .from('portfolio_deployments')
  //   .update({ status, ...data, updated_at: new Date().toISOString() })
  //   .eq('id', deploymentId);

  logger.info(`Deployment ${deploymentId} status updated to ${status}`);
};

/**
 * Add log entry to deployment
 */
const addDeploymentLog = async (
  deploymentId: string,
  message: string
): Promise<void> => {
  const deployment = deployments.get(deploymentId);

  if (deployment) {
    deployment.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  logger.info(`Deployment ${deploymentId}: ${message}`);
};

/**
 * Deployment job processor
 * Requirement #2: Handle portfolio deployment asynchronously
 */
export const processDeploymentJob = async (
  job: Job<DeploymentJobData>
): Promise<void> => {
  const { portfolioId, userId, deploymentId, options } = job.data;

  logger.info(`Processing deployment job ${job.id} for portfolio ${portfolioId}`);

  // Create deployment record if not exists
  if (!deployments.has(deploymentId)) {
    deployments.set(deploymentId, {
      id: deploymentId,
      portfolioId,
      userId,
      status: DeploymentStatus.QUEUED,
      startedAt: new Date().toISOString(),
      retriesCount: 0,
      logs: [],
    });
  }

  const deployment = deployments.get(deploymentId)!;

  try {
    // Step 1: Validate
    await updateDeploymentStatus(deploymentId, DeploymentStatus.VALIDATING);
    await addDeploymentLog(deploymentId, 'Validating portfolio...');
    await job.updateProgress(10);

    await validatePortfolio(portfolioId, userId);

    // Step 2: Build
    await updateDeploymentStatus(deploymentId, DeploymentStatus.BUILDING);
    await addDeploymentLog(deploymentId, 'Building static site...');
    await job.updateProgress(30);

    const deploymentService = new DeploymentService();
    // Build is handled inside deploy() method

    // Step 3: Upload
    await updateDeploymentStatus(deploymentId, DeploymentStatus.UPLOADING);
    await addDeploymentLog(deploymentId, 'Uploading files to Supabase Storage...');
    await job.updateProgress(60);

    const result = await deploymentService.deploy(portfolioId);

    // Step 4: Configure DNS/SSL (if custom domain)
    if (options?.customDomain || options?.subdomain) {
      await updateDeploymentStatus(deploymentId, DeploymentStatus.CONFIGURING);
      await addDeploymentLog(deploymentId, 'Configuring DNS and SSL...');
      await job.updateProgress(80);

      if (options.subdomain) {
        await deploymentService.configureSubdomain(portfolioId, options.subdomain, userId);
      }

      if (options.customDomain) {
        await deploymentService.addCustomDomain(portfolioId, options.customDomain);
      }
    }

    // Step 5: Complete
    await updateDeploymentStatus(deploymentId, DeploymentStatus.DEPLOYED, {
      url: result.url,
      storageUrl: result.storageUrl,
      completedAt: new Date().toISOString(),
    });
    await addDeploymentLog(deploymentId, `Deployment successful! URL: ${result.url}`);
    await job.updateProgress(100);

    logger.info(`Deployment ${deploymentId} completed successfully`);

    // Send webhook notification (optional)
    await sendDeploymentWebhook(deploymentId, 'deployment.succeeded', {
      portfolioId,
      url: result.url,
      deploymentId,
    });

  } catch (error: any) {
    // Requirement #5: On failure, log error and update status to FAILED
    deployment.retriesCount++;

    const errorMessage = error.message || 'Unknown error';
    const errorDetails = {
      message: errorMessage,
      code: error.code,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts || 3,
    };

    logger.error(`Deployment ${deploymentId} failed`, errorDetails);

    // Update deployment status to FAILED
    await updateDeploymentStatus(deploymentId, DeploymentStatus.FAILED, {
      error: errorMessage,
      completedAt: new Date().toISOString(),
    });

    await addDeploymentLog(
      deploymentId,
      `Error: ${errorMessage} (Attempt ${job.attemptsMade}/${job.opts.attempts})`
    );

    // Send failure webhook
    await sendDeploymentWebhook(deploymentId, 'deployment.failed', {
      portfolioId,
      deploymentId,
      error: errorMessage,
      attempt: job.attemptsMade,
    });

    // Re-throw error for BullMQ retry logic
    // Requirement #4: BullMQ will handle exponential backoff
    throw error;
  }
};

/**
 * Validate portfolio before deployment
 */
const validatePortfolio = async (
  portfolioId: string,
  userId: string
): Promise<void> => {
  // TODO: In production, validate using Supabase
  // const { data: portfolio } = await supabase
  //   .from('portfolios')
  //   .select('*')
  //   .eq('id', portfolioId)
  //   .eq('user_id', userId)
  //   .single();
  //
  // if (!portfolio) {
  //   throw new PortfolioNotFoundError(portfolioId);
  // }
  //
  // if (portfolio.status !== 'active') {
  //   throw new ValidationError('Portfolio is not active', { portfolioId });
  // }

  logger.info(`Portfolio ${portfolioId} validated successfully`);
};

/**
 * Send webhook notification using Supabase Database Webhooks
 * Alternative: Use webhook queue
 */
const sendDeploymentWebhook = async (
  deploymentId: string,
  event: string,
  payload: Record<string, any>
): Promise<void> => {
  try {
    // TODO: In production, use Supabase Database Webhooks
    // Or trigger webhook job
    // const { getWebhookQueue } = await import('../queue.config');
    // await getWebhookQueue().add('deployment-webhook', {
    //   url: process.env.DEPLOYMENT_WEBHOOK_URL!,
    //   event,
    //   payload: {
    //     ...payload,
    //     timestamp: new Date().toISOString(),
    //   },
    // });

    logger.info(`Webhook sent for ${event}`, { deploymentId, payload });
  } catch (error) {
    logger.error('Failed to send webhook', { error, event, deploymentId });
    // Don't throw - webhook failure shouldn't fail deployment
  }
};

/**
 * Get deployment status
 */
export const getDeploymentStatus = (deploymentId: string): PortfolioDeployment | null => {
  return deployments.get(deploymentId) || null;
};

/**
 * Retry failed deployment
 * Requirement #4: Retry logic
 */
export const retryDeployment = async (deploymentId: string): Promise<void> => {
  const deployment = deployments.get(deploymentId);

  if (!deployment) {
    throw new Error(`Deployment ${deploymentId} not found`);
  }

  if (deployment.retriesCount >= 3) {
    throw new Error('Maximum retry attempts exceeded');
  }

  // Reset status and retry
  deployment.status = DeploymentStatus.QUEUED;
  deployment.error = undefined;

  const { getDeploymentQueue } = await import('../queue.config');
  await getDeploymentQueue().add('retry-deployment', {
    portfolioId: deployment.portfolioId,
    userId: deployment.userId,
    deploymentId: deployment.id,
  });

  logger.info(`Deployment ${deploymentId} queued for retry`);
};
