/**
 * Resume Export Worker
 * 
 * Processes PDF/DOCX export jobs
 */

const { createWorker } = require('../index');
const resumeExporter = require('../../services/resumeExporter');
const { prisma } = require('../../config/database-advanced');

/**
 * Export job processor
 */
async function processExportJob(job) {
  const { resumeId, format, templateId, userId } = job.data;

  console.log(`📄 Processing export job: ${job.id}`, {
    resumeId,
    format,
    templateId
  });

  try {
    // Update progress
    await job.updateProgress(10);

    // Fetch resume data
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      include: {
        workingDraft: true
      }
    });

    if (!resume) {
      throw new Error(`Resume not found: ${resumeId}`);
    }

    // Verify ownership
    if (resume.userId !== userId) {
      throw new Error('Unauthorized: Resume does not belong to user');
    }

    await job.updateProgress(30);

    // Get resume data (prefer draft if available)
    const resumeData = resume.workingDraft?.data || resume.data;

    await job.updateProgress(50);

    // Generate export based on format
    let result;
    switch (format) {
      case 'pdf':
        result = await resumeExporter.exportToPDF(resumeData, {
          templateId,
          formatting: resume.formatting
        });
        break;

      case 'docx':
        result = await resumeExporter.exportToDocx(resumeData, {
          templateId,
          formatting: resume.formatting
        });
        break;

      case 'txt':
        result = await resumeExporter.exportToTxt(resumeData);
        break;

      case 'json':
        result = await resumeExporter.exportToJson(resumeData);
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    await job.updateProgress(90);

    // Track analytics
    await prisma.resumeAnalytics.upsert({
      where: { baseResumeId: resumeId },
      create: {
        baseResumeId: resumeId,
        exportCount: 1,
        lastExportedAt: new Date()
      },
      update: {
        exportCount: { increment: 1 },
        lastExportedAt: new Date()
      }
    });

    await job.updateProgress(100);

    console.log(`✅ Export completed: ${job.id}`);

    return {
      success: true,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      format
    };

  } catch (error) {
    console.error(`❌ Export failed: ${job.id}`, error);
    throw error;
  }
}

/**
 * Create and start the worker
 */
function startExportWorker() {
  const worker = createWorker('resume-export', processExportJob);
  console.log('✅ Export worker started');
  return worker;
}

module.exports = {
  processExportJob,
  startExportWorker
};

