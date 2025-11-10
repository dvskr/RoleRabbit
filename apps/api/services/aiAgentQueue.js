/**
 * AI Agent Task Queue
 * Handles background processing of AI agent tasks using Bull
 */

const Queue = require('bull');
const logger = require('../utils/logger');
const socketIO = require('../utils/socketIOServer');
const aiService = require('./aiService');
const atsCalculator = require('./atsScoreCalculator');
const { prisma } = require('../utils/db');
// Import as namespace to avoid circular dependency issues
const aiAgentService = require('./aiAgentService');

// Initialize Redis-backed queue
const aiAgentQueue = new Queue('ai-agent-tasks', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200 // Keep last 200 failed jobs
  }
});

// ============================================
// TASK PROCESSORS
// ============================================

/**
 * Process RESUME_GENERATION task
 */
async function processResumeGeneration(job) {
  const { taskId, userId, jobDescription, baseResumeId } = job.data;

  try {
    logger.info('Processing resume generation task', { taskId, userId });

    // Notify task started
    socketIO.notifyTaskStarted(userId, taskId, 'RESUME_GENERATION');

    // Get base resume data
    let baseResume = null;
    if (baseResumeId) {
      baseResume = await prisma.baseResume.findFirst({
        where: { id: baseResumeId, userId }
      });
    }

    const resumeData = baseResume?.data || {};

    // Step 1: Analyze job description (25% progress)
    await aiAgentService.updateTaskProgress(taskId, 25, 'Analyzing job description...');
    socketIO.notifyTaskProgress(userId, taskId, 25, 'Analyzing job description...');

    const jdAnalysis = await aiService.analyzeJobDescription(jobDescription);
    logger.debug('Job description analyzed', { keywords: jdAnalysis.keywords });

    // Step 2: Tailor resume (50% progress)
    await aiAgentService.updateTaskProgress(taskId, 50, 'Tailoring resume content...');
    socketIO.notifyTaskProgress(userId, taskId, 50, 'Tailoring resume content...');

    const tailoringResult = await aiService.tailorResume(resumeData, jobDescription, {
      tone: job.data.tone || 'professional',
      length: job.data.length || 'medium'
    });

    const tailoredResume = tailoringResult.resume;
    logger.debug('Resume tailored', { changes: tailoringResult.changes });

    // Step 3: Calculate ATS score (75% progress)
    await aiAgentService.updateTaskProgress(taskId, 75, 'Calculating ATS score...');
    socketIO.notifyTaskProgress(userId, taskId, 75, 'Calculating ATS score...');

    const atsResult = await atsCalculator.calculateScore(tailoredResume, jobDescription);
    const atsScore = atsResult.score;
    const atsBreakdown = atsResult.breakdown;

    logger.debug('ATS score calculated', { score: atsScore });

    // Step 4: Save results (100% progress)
    await aiAgentService.updateTaskProgress(taskId, 100, 'Saving results...');
    socketIO.notifyTaskProgress(userId, taskId, 100, 'Saving results...');

    const results = {
      data: tailoredResume,
      atsScore,
      atsBreakdown,
      jdAnalysis,
      changes: tailoringResult.changes,
      matchedKeywords: atsResult.matchedKeywords,
      missingKeywords: atsResult.missingKeywords,
      suggestions: atsResult.suggestions,
      tokensUsed: (jdAnalysis.tokensUsed || 0) + (tailoringResult.tokensUsed || 0),
      outputFiles: [] // TODO: Generate and save PDF/DOCX files
    };

    await aiAgentService.saveTaskResults(taskId, results);
    await aiAgentService.updateTaskStatus(taskId, 'COMPLETED');

    // Notify completion via WebSocket
    socketIO.notifyTaskCompleted(userId, taskId, results);

    // Update metrics
    await aiAgentService.updateMetrics(userId, 'RESUME_GENERATION', { atsScore });

    logger.info('Resume generation completed', { taskId, atsScore });

    return { success: true, results };
  } catch (error) {
    logger.error('Resume generation failed', { error: error.message, taskId });
    await aiAgentService.updateTaskStatus(taskId, 'FAILED', { errorMessage: error.message });

    // Notify failure via WebSocket
    socketIO.notifyTaskFailed(userId, taskId, error.message);

    throw error;
  }
}

/**
 * Process COVER_LETTER_GENERATION task
 */
async function processCoverLetterGeneration(job) {
  const { taskId, userId, jobDescription, jobTitle, company, baseResumeId } = job.data;

  try {
    logger.info('Processing cover letter generation', { taskId, userId });

    socketIO.notifyTaskStarted(userId, taskId, 'COVER_LETTER_GENERATION');

    // Get base resume data
    let baseResume = null;
    if (baseResumeId) {
      baseResume = await prisma.baseResume.findFirst({
        where: { id: baseResumeId, userId }
      });
    }

    const resumeData = baseResume?.data || {};

    await aiAgentService.updateTaskProgress(taskId, 25, 'Researching company...');
    socketIO.notifyTaskProgress(userId, taskId, 25, 'Researching company...');

    const companyResearch = await aiService.researchCompany(company);

    await aiAgentService.updateTaskProgress(taskId, 50, 'Drafting cover letter...');
    socketIO.notifyTaskProgress(userId, taskId, 50, 'Drafting cover letter...');

    const coverLetterResult = await aiService.generateCoverLetter(
      resumeData,
      jobDescription,
      company,
      jobTitle,
      job.data.tone || 'professional'
    );

    await aiAgentService.updateTaskProgress(taskId, 75, 'Finalizing...');
    socketIO.notifyTaskProgress(userId, taskId, 75, 'Finalizing...');

    const coverLetter = {
      content: coverLetterResult.content,
      company,
      jobTitle
    };

    const results = {
      data: coverLetter,
      companyResearch,
      tokensUsed: (companyResearch.tokensUsed || 0) + (coverLetterResult.tokensUsed || 0),
      outputFiles: []
    };

    await aiAgentService.updateTaskProgress(taskId, 100, 'Finalizing...');
    socketIO.notifyTaskProgress(userId, taskId, 100, 'Finalizing...');
    await aiAgentService.saveTaskResults(taskId, results);
    await aiAgentService.updateTaskStatus(taskId, 'COMPLETED');

    await aiAgentService.updateMetrics(userId, 'COVER_LETTER_GENERATION', {});

    // Notify completion via WebSocket
    socketIO.notifyTaskCompleted(userId, taskId, results);
    logger.info('Cover letter generation completed', { taskId });

    return { success: true, results };
  } catch (error) {
    logger.error('Cover letter generation failed', { error: error.message, taskId });
    await aiAgentService.updateTaskStatus(taskId, 'FAILED', { errorMessage: error.message });

    // Notify failure via WebSocket
    socketIO.notifyTaskFailed(userId, taskId, error.message);
    throw error;
  }
}

/**
 * Process COMPANY_RESEARCH task
 */
async function processCompanyResearch(job) {
  const { taskId, userId, company } = job.data;

  try {
    logger.info('Processing company research', { taskId, userId, company });

    socketIO.notifyTaskStarted(userId, taskId, 'COMPANY_RESEARCH');

    await aiAgentService.updateTaskProgress(taskId, 25, 'Gathering company information...');
    socketIO.notifyTaskProgress(userId, taskId, 25, 'Gathering company information...');

    const research = await aiService.researchCompany(company);

    await aiAgentService.updateTaskProgress(taskId, 75, 'Compiling insights...');
    socketIO.notifyTaskProgress(userId, taskId, 75, 'Compiling insights...');

    const results = {
      data: research,
      tokensUsed: research.tokensUsed || 0,
      outputFiles: []
    };

    await aiAgentService.updateTaskProgress(taskId, 100, 'Completed');
    socketIO.notifyTaskProgress(userId, taskId, 100, 'Completed');
    await aiAgentService.saveTaskResults(taskId, results);
    await aiAgentService.updateTaskStatus(taskId, 'COMPLETED');

    await aiAgentService.updateMetrics(userId, 'COMPANY_RESEARCH', {});

    // Notify completion via WebSocket
    socketIO.notifyTaskCompleted(userId, taskId, results);
    logger.info('Company research completed', { taskId });

    return { success: true, results };
  } catch (error) {
    logger.error('Company research failed', { error: error.message, taskId });
    await aiAgentService.updateTaskStatus(taskId, 'FAILED', { errorMessage: error.message });

    // Notify failure via WebSocket
    socketIO.notifyTaskFailed(userId, taskId, error.message);
    throw error;
  }
}

/**
 * Process INTERVIEW_PREP task
 */
async function processInterviewPrep(job) {
  const { taskId, userId, jobDescription, company, baseResumeId } = job.data;

  try {
    logger.info('Processing interview prep', { taskId, userId });

    socketIO.notifyTaskStarted(userId, taskId, 'INTERVIEW_PREP');

    // Get base resume data
    let baseResume = null;
    if (baseResumeId) {
      baseResume = await prisma.baseResume.findFirst({
        where: { id: baseResumeId, userId }
      });
    }

    const resumeData = baseResume?.data || {};

    await aiAgentService.updateTaskProgress(taskId, 25, 'Analyzing job requirements...');
    socketIO.notifyTaskProgress(userId, taskId, 25, 'Analyzing job requirements...');

    await aiAgentService.updateTaskProgress(taskId, 50, 'Generating interview questions...');
    socketIO.notifyTaskProgress(userId, taskId, 50, 'Generating interview questions...');

    const prepMaterial = await aiService.generateInterviewPrep(jobDescription, resumeData, company);

    await aiAgentService.updateTaskProgress(taskId, 75, 'Finalizing materials...');
    socketIO.notifyTaskProgress(userId, taskId, 75, 'Finalizing materials...');

    const results = {
      data: prepMaterial,
      tokensUsed: prepMaterial.tokensUsed || 0,
      outputFiles: []
    };

    await aiAgentService.updateTaskProgress(taskId, 100, 'Completed');
    socketIO.notifyTaskProgress(userId, taskId, 100, 'Completed');
    await aiAgentService.saveTaskResults(taskId, results);
    await aiAgentService.updateTaskStatus(taskId, 'COMPLETED');

    await aiAgentService.updateMetrics(userId, 'INTERVIEW_PREP', {});

    // Notify completion via WebSocket
    socketIO.notifyTaskCompleted(userId, taskId, results);
    logger.info('Interview prep completed', { taskId });

    return { success: true, results };
  } catch (error) {
    logger.error('Interview prep failed', { error: error.message, taskId });
    await aiAgentService.updateTaskStatus(taskId, 'FAILED', { errorMessage: error.message });

    // Notify failure via WebSocket
    socketIO.notifyTaskFailed(userId, taskId, error.message);
    throw error;
  }
}

// ============================================
// QUEUE HANDLERS
// ============================================

/**
 * Main task processor
 */
aiAgentQueue.process(async (job) => {
  const { task } = job.data;

  logger.info('Processing task', { taskId: task.id, type: task.type });

  try {
    switch (task.type) {
      case 'RESUME_GENERATION':
        return await processResumeGeneration({
          data: {
            taskId: task.id,
            userId: task.userId,
            jobDescription: task.jobDescription,
            jobTitle: task.jobTitle,
            company: task.company,
            baseResumeId: task.baseResumeId,
            tone: task.tone,
            length: task.length
          }
        });

      case 'COVER_LETTER_GENERATION':
        return await processCoverLetterGeneration({
          data: {
            taskId: task.id,
            userId: task.userId,
            jobDescription: task.jobDescription,
            jobTitle: task.jobTitle,
            company: task.company,
            baseResumeId: task.baseResumeId,
            tone: task.tone
          }
        });

      case 'COMPANY_RESEARCH':
        return await processCompanyResearch({
          data: {
            taskId: task.id,
            userId: task.userId,
            company: task.company
          }
        });

      case 'INTERVIEW_PREP':
        return await processInterviewPrep({
          data: {
            taskId: task.id,
            userId: task.userId,
            jobDescription: task.jobDescription,
            company: task.company
          }
        });

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  } catch (error) {
    logger.error('Task processing error', {
      error: error.message,
      taskId: task.id,
      type: task.type
    });
    throw error;
  }
});

/**
 * Queue event handlers
 */
aiAgentQueue.on('completed', (job, result) => {
  logger.info('Task completed', {
    jobId: job.id,
    taskId: job.data.task.id,
    result: result ? 'success' : 'unknown'
  });
});

aiAgentQueue.on('failed', (job, err) => {
  logger.error('Task failed', {
    jobId: job.id,
    taskId: job.data.task.id,
    error: err.message,
    attempts: job.attemptsMade
  });
});

aiAgentQueue.on('stalled', (job) => {
  logger.warn('Task stalled', {
    jobId: job.id,
    taskId: job.data.task.id
  });
});

/**
 * Enqueue a task for processing
 */
async function enqueueTask(task) {
  try {
    const job = await aiAgentQueue.add(
      {
        task,
        enqueuedAt: new Date()
      },
      {
        priority: getPriority(task.type),
        jobId: task.id // Use task ID as job ID for easy tracking
      }
    );

    logger.info('Task enqueued', { taskId: task.id, jobId: job.id });
    return job;
  } catch (error) {
    logger.error('Failed to enqueue task', { error: error.message, taskId: task.id });
    throw error;
  }
}

/**
 * Get priority for task type
 */
function getPriority(taskType) {
  const priorities = {
    RESUME_GENERATION: 5,
    COVER_LETTER_GENERATION: 4,
    JOB_APPLICATION: 10, // Highest priority
    COMPANY_RESEARCH: 3,
    INTERVIEW_PREP: 2,
    BULK_PROCESSING: 1, // Lowest priority
    JOB_TRACKER_UPDATE: 6,
    COLD_EMAIL: 4
  };

  return priorities[taskType] || 5;
}

/**
 * Get queue stats
 */
async function getQueueStats() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      aiAgentQueue.getWaitingCount(),
      aiAgentQueue.getActiveCount(),
      aiAgentQueue.getCompletedCount(),
      aiAgentQueue.getFailedCount(),
      aiAgentQueue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error: error.message });
    throw error;
  }
}

/**
 * Pause queue processing
 */
async function pauseQueue() {
  await aiAgentQueue.pause();
  logger.info('Queue paused');
}

/**
 * Resume queue processing
 */
async function resumeQueue() {
  await aiAgentQueue.resume();
  logger.info('Queue resumed');
}

/**
 * Clean up old jobs
 */
async function cleanQueue() {
  try {
    await aiAgentQueue.clean(24 * 60 * 60 * 1000); // Remove jobs older than 24 hours
    logger.info('Queue cleaned');
  } catch (error) {
    logger.error('Failed to clean queue', { error: error.message });
  }
}

module.exports = {
  aiAgentQueue,
  enqueueTask,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  cleanQueue
};
