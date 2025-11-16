/**
 * AI Generation Worker
 * 
 * Processes LLM operations (tailoring, generation, etc.)
 */

const { createWorker } = require('../index');
const { generateContent, tailorResume } = require('../../utils/llmOperations');
const { prisma } = require('../../config/database-advanced');

/**
 * AI job processor
 */
async function processAIJob(job) {
  const { operation, resumeId, userId, ...params } = job.data;

  console.log(`🤖 Processing AI job: ${job.id}`, {
    operation,
    resumeId
  });

  try {
    await job.updateProgress(10);

    // Fetch resume
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId }
    });

    if (!resume) {
      throw new Error(`Resume not found: ${resumeId}`);
    }

    // Verify ownership
    if (resume.userId !== userId) {
      throw new Error('Unauthorized: Resume does not belong to user');
    }

    await job.updateProgress(30);

    let result;
    const startTime = Date.now();

    // Process based on operation type
    switch (operation) {
      case 'tailor':
        result = await tailorResume({
          resumeData: resume.data,
          jobDescription: params.jobDescription,
          jobTitle: params.jobTitle,
          onProgress: async (progress) => {
            await job.updateProgress(30 + progress * 0.6); // 30-90%
          }
        });
        break;

      case 'generate':
        result = await generateContent({
          type: params.type,
          context: params.context,
          resumeData: resume.data,
          onProgress: async (progress) => {
            await job.updateProgress(30 + progress * 0.6);
          }
        });
        break;

      default:
        throw new Error(`Unsupported AI operation: ${operation}`);
    }

    const duration = Date.now() - startTime;

    await job.updateProgress(95);

    // Log AI request
    await prisma.aIRequestLog.create({
      data: {
        userId,
        baseResumeId: resumeId,
        operation,
        model: result.model || 'gpt-4',
        tokensUsed: result.tokensUsed || 0,
        costUsd: result.costUsd || 0,
        durationMs: duration,
        success: true
      }
    });

    await job.updateProgress(100);

    console.log(`✅ AI job completed: ${job.id}`);

    return {
      success: true,
      operation,
      result: result.data,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd
    };

  } catch (error) {
    console.error(`❌ AI job failed: ${job.id}`, error);

    // Log failed request
    await prisma.aIRequestLog.create({
      data: {
        userId,
        baseResumeId: resumeId,
        operation,
        model: 'gpt-4',
        tokensUsed: 0,
        costUsd: 0,
        durationMs: 0,
        success: false,
        errorMessage: error.message
      }
    });

    throw error;
  }
}

/**
 * Create and start the worker
 */
function startAIWorker() {
  const worker = createWorker('ai-generation', processAIJob);
  console.log('✅ AI worker started');
  return worker;
}

module.exports = {
  processAIJob,
  startAIWorker
};

