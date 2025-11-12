/**
 * Job Application Orchestrator
 * Orchestrates automated job applications and integrates with AI Agent system
 */

const linkedinService = require('../jobBoards/linkedinService');
const indeedService = require('../jobBoards/indeedService');
const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');

class JobApplicationOrchestrator {
  constructor() {
    this.services = {
      LINKEDIN: linkedinService,
      INDEED: indeedService
    };
  }

  /**
   * Apply to a single job
   */
  async applyToJob(applicationData) {
    try {
      const {
        userId,
        credentialId,
        jobUrl,
        jobTitle,
        company,
        jobDescription,
        platform,
        resumeFileId,
        coverLetterFileId,
        userData,
        aiAgentTaskId
      } = applicationData;

      logger.info('Starting job application', {
        userId,
        platform,
        jobUrl
      });

      // Get the appropriate service
      const service = this.services[platform];
      if (!service) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Get resume file path if provided
      let resumePath = null;
      if (resumeFileId) {
        const resumeFile = await prisma.storageFile.findFirst({
          where: {
            id: resumeFileId,
            userId
          }
        });

        if (resumeFile) {
          resumePath = resumeFile.storagePath;
        }
      }

      // Create application record
      const application = await prisma.jobApplication.create({
        data: {
          userId,
          credentialId,
          jobTitle: jobTitle || 'Unknown',
          company: company || 'Unknown',
          jobUrl,
          jobDescription,
          platform,
          status: 'DRAFT',
          resumeFileId,
          coverLetterFileId,
          isAutoApplied: true,
          applicationMethod: platform === 'LINKEDIN' ? 'easy_apply' : 'quick_apply',
          aiAgentTaskId
        }
      });

      // Create initial status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: 'DRAFT',
          notes: `Application initiated via ${platform} automation${aiAgentTaskId ? ' (AI Agent)' : ''}`
        }
      });

      // Apply to job
      const result = await service.applyToJob(userId, credentialId, jobUrl, {
        ...userData,
        resumePath
      });

      // Update application status
      await prisma.jobApplication.update({
        where: { id: application.id },
        data: {
          status: result.verified ? 'SUBMITTED' : 'DRAFT',
          appliedAt: result.verified ? new Date() : null,
          lastStatusUpdate: new Date(),
          metadata: {
            automationResult: result,
            steps: result.steps
          }
        }
      });

      // Add status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: result.verified ? 'SUBMITTED' : 'DRAFT',
          notes: result.verified
            ? `Application submitted successfully (${result.steps} steps)`
            : 'Application submission could not be verified',
          metadata: result
        }
      });

      logger.info('Job application completed', {
        userId,
        applicationId: application.id,
        success: result.success,
        verified: result.verified
      });

      return {
        success: true,
        application,
        result
      };

    } catch (error) {
      logger.error('Job application failed', {
        error: error.message,
        applicationData
      });

      throw error;
    }
  }

  /**
   * Apply to multiple jobs (bulk processing)
   */
  async applyToMultipleJobs(applications, options = {}) {
    const {
      userId,
      batchId,
      onProgress,
      maxConcurrent = 1 // Process one at a time by default to avoid rate limiting
    } = options;

    logger.info('Starting bulk job applications', {
      userId,
      count: applications.length,
      batchId
    });

    const results = [];
    const errors = [];
    let completed = 0;

    // Process applications in batches
    for (let i = 0; i < applications.length; i += maxConcurrent) {
      const batch = applications.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (app) => {
        try {
          const result = await this.applyToJob(app);
          completed++;

          if (onProgress) {
            onProgress({
              completed,
              total: applications.length,
              current: app,
              result
            });
          }

          return { success: true, application: app, result };
        } catch (error) {
          completed++;
          errors.push({ application: app, error: error.message });

          if (onProgress) {
            onProgress({
              completed,
              total: applications.length,
              current: app,
              error: error.message
            });
          }

          return { success: false, application: app, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + maxConcurrent < applications.length) {
        const delay = 30000 + Math.random() * 10000; // 30-40 seconds
        logger.info('Waiting before next batch', { delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info('Bulk job applications completed', {
      userId,
      batchId,
      total: applications.length,
      successful,
      failed
    });

    return {
      total: applications.length,
      successful,
      failed,
      results,
      errors
    };
  }

  /**
   * Process AI Agent task for job application
   */
  async processAIAgentTask(taskId) {
    try {
      logger.info('Processing AI Agent task', { taskId });

      // Get task details
      const task = await prisma.aIAgentTask.findUnique({
        where: { id: taskId },
        include: {
          user: {
            include: {
              jobBoardCredentials: true
            }
          }
        }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.type !== 'JOB_APPLICATION') {
        throw new Error('Invalid task type for job application');
      }

      // Update task status
      await prisma.aIAgentTask.update({
        where: { id: taskId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          currentStep: 'Preparing job application'
        }
      });

      // Extract job details from task
      const { jobUrl, jobTitle, company, jobDescription, platform } = task;

      if (!jobUrl || !platform) {
        throw new Error('Job URL and platform are required');
      }

      // Find appropriate credential
      const credential = task.user.jobBoardCredentials.find(
        c => c.platform === platform && c.isActive
      );

      if (!credential) {
        throw new Error(`No active ${platform} credential found`);
      }

      // Get user profile data
      const profile = await prisma.userProfile.findUnique({
        where: { userId: task.userId },
        include: {
          workExperiences: true,
          education: true,
          userSkills: {
            include: { skill: true }
          }
        }
      });

      // Prepare user data for application
      const userData = {
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        email: task.user.email,
        phone: profile?.phone,
        linkedin: profile?.linkedin,
        github: profile?.github,
        portfolio: profile?.portfolio,
        yearsOfExperience: this.calculateYearsOfExperience(profile?.workExperiences || []),
        currentCompany: profile?.workExperiences?.[0]?.company,
        currentTitle: profile?.workExperiences?.[0]?.role
      };

      // Apply to job
      const applicationResult = await this.applyToJob({
        userId: task.userId,
        credentialId: credential.id,
        jobUrl,
        jobTitle,
        company,
        jobDescription,
        platform,
        resumeFileId: task.baseResumeId, // Use base resume if provided
        userData,
        aiAgentTaskId: taskId
      });

      // Update task with results
      await prisma.aIAgentTask.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: 100,
          currentStep: 'Application submitted',
          resultData: {
            application: applicationResult.application,
            automationResult: applicationResult.result
          }
        }
      });

      logger.info('AI Agent task completed', {
        taskId,
        applicationId: applicationResult.application.id
      });

      return {
        success: true,
        task,
        application: applicationResult.application,
        result: applicationResult.result
      };

    } catch (error) {
      logger.error('AI Agent task failed', { taskId, error: error.message });

      // Update task with error
      await prisma.aIAgentTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error.message,
          retryCount: { increment: 1 }
        }
      });

      throw error;
    }
  }

  /**
   * Calculate years of experience from work history
   */
  calculateYearsOfExperience(workExperiences) {
    if (!workExperiences || workExperiences.length === 0) {
      return 0;
    }

    let totalMonths = 0;

    for (const exp of workExperiences) {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate);

      const months = (end.getFullYear() - start.getFullYear()) * 12 +
                     (end.getMonth() - start.getMonth());

      totalMonths += months;
    }

    return Math.floor(totalMonths / 12);
  }

  /**
   * Get platform from job URL
   */
  detectPlatform(jobUrl) {
    if (jobUrl.includes('linkedin.com')) return 'LINKEDIN';
    if (jobUrl.includes('indeed.com')) return 'INDEED';
    if (jobUrl.includes('glassdoor.com')) return 'GLASSDOOR';
    if (jobUrl.includes('ziprecruiter.com')) return 'ZIPRECRUITER';
    return 'OTHER';
  }

  /**
   * Validate application data
   */
  validateApplicationData(data) {
    const required = ['userId', 'credentialId', 'jobUrl', 'platform'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!this.services[data.platform]) {
      throw new Error(`Unsupported platform: ${data.platform}`);
    }

    return true;
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(userId, options = {}) {
    const { startDate, endDate, platform } = options;

    const where = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (platform) {
      where.platform = platform;
    }

    const [
      total,
      submitted,
      successful,
      failed,
      pending,
      byPlatform,
      recentActivity
    ] = await Promise.all([
      prisma.jobApplication.count({ where }),

      prisma.jobApplication.count({
        where: { ...where, status: 'SUBMITTED' }
      }),

      prisma.jobApplication.count({
        where: {
          ...where,
          status: { in: ['SUBMITTED', 'VIEWED', 'IN_REVIEW', 'INTERVIEWING', 'OFFERED', 'ACCEPTED'] }
        }
      }),

      prisma.jobApplication.count({
        where: { ...where, status: { in: ['FAILED', 'REJECTED', 'WITHDRAWN'] } }
      }),

      prisma.jobApplication.count({
        where: { ...where, status: 'DRAFT' }
      }),

      prisma.jobApplication.groupBy({
        by: ['platform'],
        where,
        _count: true
      }),

      prisma.jobApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          jobTitle: true,
          company: true,
          platform: true,
          status: true,
          appliedAt: true,
          createdAt: true
        }
      })
    ]);

    return {
      total,
      submitted,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0,
      byPlatform: byPlatform.reduce((acc, item) => {
        acc[item.platform] = item._count;
        return acc;
      }, {}),
      recentActivity
    };
  }
}

module.exports = new JobApplicationOrchestrator();
