/**
 * Resume Parse Worker
 * 
 * Processes uploaded resume file parsing
 */

const { createWorker } = require('../index');
const { parseResumeFile } = require('../../services/resumeParser');
const { prisma } = require('../../config/database-advanced');

/**
 * Parse job processor
 */
async function processParseJob(job) {
  const { fileId, userId, slotNumber } = job.data;

  console.log(`📝 Processing parse job: ${job.id}`, {
    fileId,
    userId
  });

  try {
    await job.updateProgress(10);

    // Fetch file
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    // Verify ownership
    if (file.userId !== userId) {
      throw new Error('Unauthorized: File does not belong to user');
    }

    await job.updateProgress(30);

    // Parse the file
    const parsedData = await parseResumeFile(file.path, file.mimeType);

    await job.updateProgress(70);

    // Create resume from parsed data
    const resume = await prisma.baseResume.create({
      data: {
        userId,
        slotNumber,
        name: parsedData.name || 'Imported Resume',
        data: parsedData,
        formatting: {},
        metadata: {
          importedFrom: file.originalName,
          importedAt: new Date().toISOString()
        },
        fileHash: file.hash
      }
    });

    await job.updateProgress(90);

    // Create working draft
    await prisma.workingDraft.create({
      data: {
        baseResumeId: resume.id,
        userId,
        data: parsedData,
        formatting: {},
        hasChanges: false
      }
    });

    await job.updateProgress(100);

    console.log(`✅ Parse completed: ${job.id}`);

    return {
      success: true,
      resumeId: resume.id,
      parsedData
    };

  } catch (error) {
    console.error(`❌ Parse failed: ${job.id}`, error);
    throw error;
  }
}

/**
 * Create and start the worker
 */
function startParseWorker() {
  const worker = createWorker('resume-parse', processParseJob);
  console.log('✅ Parse worker started');
  return worker;
}

module.exports = {
  processParseJob,
  startParseWorker
};

