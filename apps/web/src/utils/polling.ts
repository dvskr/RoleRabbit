/**
 * Polling Utility for Long-Running Operations
 * 
 * For LLM operations >30s, use polling instead of long HTTP request.
 * Backend returns jobId, frontend polls for result.
 */

import { logger } from './logger';

export interface PollingOptions {
  interval?: number; // Polling interval in ms (default: 2000)
  maxAttempts?: number; // Maximum polling attempts (default: 60)
  timeout?: number; // Total timeout in ms (default: 120000 = 2 minutes)
  onProgress?: (attempt: number, elapsed: number) => void;
}

export interface PollingResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  elapsed: number;
}

export interface JobStatus<T> {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: T;
  error?: string;
  progress?: number; // 0-100
  message?: string;
}

const DEFAULT_OPTIONS: Required<Omit<PollingOptions, 'onProgress'>> = {
  interval: 2000, // 2 seconds
  maxAttempts: 60, // 60 attempts = 2 minutes max
  timeout: 120000, // 2 minutes
};

/**
 * Poll for job status until completion or timeout
 */
export async function pollForResult<T>(
  jobId: string,
  fetchStatus: (jobId: string) => Promise<JobStatus<T>>,
  options: PollingOptions = {}
): Promise<PollingResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let attempts = 0;

  logger.info('Starting polling for job', { jobId, interval: opts.interval, maxAttempts: opts.maxAttempts });

  while (attempts < opts.maxAttempts) {
    attempts++;
    const elapsed = Date.now() - startTime;

    // Check timeout
    if (elapsed > opts.timeout) {
      logger.warn('Polling timeout exceeded', { jobId, attempts, elapsed });
      return {
        success: false,
        error: 'Operation timed out. Please try again.',
        attempts,
        elapsed,
      };
    }

    try {
      // Fetch job status
      const status = await fetchStatus(jobId);

      // Call progress callback
      if (options.onProgress) {
        options.onProgress(attempts, elapsed);
      }

      // Check if job is completed
      if (status.status === 'completed') {
        logger.info('Polling completed successfully', { jobId, attempts, elapsed });
        return {
          success: true,
          data: status.result,
          attempts,
          elapsed,
        };
      }

      // Check if job failed
      if (status.status === 'failed') {
        logger.error('Job failed', { jobId, attempts, elapsed, error: status.error });
        return {
          success: false,
          error: status.error || 'Operation failed',
          attempts,
          elapsed,
        };
      }

      // Job is still processing, wait before next poll
      if (status.status === 'processing' || status.status === 'pending') {
        logger.debug('Job still processing', { 
          jobId, 
          attempts, 
          elapsed, 
          progress: status.progress,
          message: status.message 
        });
        await sleep(opts.interval);
        continue;
      }

      // Unknown status
      logger.warn('Unknown job status', { jobId, status: status.status });
      await sleep(opts.interval);
    } catch (error) {
      logger.error('Error polling for job status', { jobId, attempts, error });
      
      // If this is the last attempt, return error
      if (attempts >= opts.maxAttempts) {
        return {
          success: false,
          error: 'Failed to check operation status',
          attempts,
          elapsed: Date.now() - startTime,
        };
      }
      
      // Otherwise, wait and retry
      await sleep(opts.interval);
    }
  }

  // Max attempts exceeded
  logger.warn('Max polling attempts exceeded', { jobId, attempts });
  return {
    success: false,
    error: 'Operation took too long. Please try again.',
    attempts,
    elapsed: Date.now() - startTime,
  };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Start a long-running operation with polling
 * 
 * Usage:
 *   const result = await startPollingOperation(
 *     async () => await api.startJob(params),
 *     (jobId) => api.getJobStatus(jobId),
 *     { interval: 2000, timeout: 120000 }
 *   );
 */
export async function startPollingOperation<T>(
  startOperation: () => Promise<{ jobId: string }>,
  fetchStatus: (jobId: string) => Promise<JobStatus<T>>,
  options: PollingOptions = {}
): Promise<PollingResult<T>> {
  try {
    // Start the operation
    logger.info('Starting long-running operation');
    const { jobId } = await startOperation();
    
    if (!jobId) {
      return {
        success: false,
        error: 'Failed to start operation',
        attempts: 0,
        elapsed: 0,
      };
    }
    
    // Poll for result
    return await pollForResult(jobId, fetchStatus, options);
  } catch (error: any) {
    logger.error('Failed to start polling operation', error);
    return {
      success: false,
      error: error?.message || 'Failed to start operation',
      attempts: 0,
      elapsed: 0,
    };
  }
}

