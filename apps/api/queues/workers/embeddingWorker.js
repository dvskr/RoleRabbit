/**
 * Embedding Generation Worker
 * 
 * Processes vector embedding generation for resumes
 */

const { createWorker } = require('../index');
const { generateEmbedding, extractResumeText } = require('../../scripts/backfill-embeddings');
const { prisma } = require('../../config/database-advanced');

/**
 * Embedding job processor
 */
async function processEmbeddingJob(job) {
  const { resumeId } = job.data;

  console.log(`🔢 Processing embedding job: ${job.id}`, {
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

    await job.updateProgress(30);

    // Extract text from resume
    const resumeText = extractResumeText(resume.data);

    if (!resumeText) {
      console.log(`⏭️  Skipping resume ${resumeId} - no text content`);
      return {
        success: true,
        skipped: true,
        reason: 'No text content'
      };
    }

    await job.updateProgress(50);

    // Generate embedding
    const embedding = await generateEmbedding(resumeText);

    await job.updateProgress(80);

    // Update resume with embedding
    await prisma.baseResume.update({
      where: { id: resumeId },
      data: {
        embedding,
        embeddingUpdatedAt: new Date()
      }
    });

    await job.updateProgress(100);

    console.log(`✅ Embedding generated: ${job.id}`);

    return {
      success: true,
      resumeId,
      embeddingLength: embedding.length
    };

  } catch (error) {
    console.error(`❌ Embedding generation failed: ${job.id}`, error);
    throw error;
  }
}

/**
 * Create and start the worker
 */
function startEmbeddingWorker() {
  const worker = createWorker('embedding-generation', processEmbeddingJob);
  console.log('✅ Embedding worker started');
  return worker;
}

module.exports = {
  processEmbeddingJob,
  startEmbeddingWorker
};

