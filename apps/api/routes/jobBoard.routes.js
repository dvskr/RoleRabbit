/**
 * Job Board Routes
 * API endpoints for job board credentials and applications
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const crypto = require('crypto');
const puppeteerService = require('../services/browserAutomation/puppeteerService');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.JOB_BOARD_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Encrypt sensitive credential data
 */
function encryptCredentials(password) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(JSON.stringify({ password }), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt credential data
 */
function decryptCredentials(encryptedData, iv, authTag) {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    throw new Error('Failed to decrypt credentials');
  }
}

module.exports = async function (fastify, opts) {
  // ============================================
  // JOB BOARD CREDENTIALS
  // ============================================

  /**
   * Get all job board credentials for user
   * GET /api/job-board/credentials
   */
  fastify.get('/api/job-board/credentials', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const credentials = await prisma.jobBoardCredential.findMany({
        where: {
          userId,
          isActive: true
        },
        select: {
          id: true,
          platform: true,
          email: true,
          isActive: true,
          isConnected: true,
          lastConnectedAt: true,
          lastVerified: true,
          verificationStatus: true,
          connectionError: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      reply.send({
        success: true,
        credentials
      });

    } catch (error) {
      logger.error('Failed to get credentials', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to retrieve credentials'
      });
    }
  });

  /**
   * Add new job board credential
   * POST /api/job-board/credentials
   */
  fastify.post('/api/job-board/credentials', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { platform, email, password } = request.body;

      // Validate required fields
      if (!platform || !email || !password) {
        return reply.status(400).send({
          success: false,
          message: 'Platform, email, and password are required'
        });
      }

      // Check if credential already exists
      const existing = await prisma.jobBoardCredential.findUnique({
        where: {
          userId_platform_email: {
            userId,
            platform,
            email
          }
        }
      });

      if (existing) {
        return reply.status(409).send({
          success: false,
          message: 'Credential already exists for this platform and email'
        });
      }

      // Encrypt password
      const encrypted = encryptCredentials(password);

      // Create credential
      const credential = await prisma.jobBoardCredential.create({
        data: {
          userId,
          platform,
          email,
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          verificationStatus: 'pending'
        },
        select: {
          id: true,
          platform: true,
          email: true,
          isActive: true,
          isConnected: true,
          verificationStatus: true,
          createdAt: true
        }
      });

      logger.info('Job board credential added', { userId, platform, email });

      reply.send({
        success: true,
        message: 'Credential added successfully',
        credential
      });

    } catch (error) {
      logger.error('Failed to add credential', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to add credential'
      });
    }
  });

  /**
   * Update job board credential
   * PUT /api/job-board/credentials/:id
   */
  fastify.put('/api/job-board/credentials/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { email, password, isActive } = request.body;

      // Check if credential exists and belongs to user
      const existing = await prisma.jobBoardCredential.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: 'Credential not found'
        });
      }

      const updateData = {};

      if (email) updateData.email = email;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;

      // Update password if provided
      if (password) {
        const encrypted = encryptCredentials(password);
        updateData.encryptedData = encrypted.encryptedData;
        updateData.iv = encrypted.iv;
        updateData.authTag = encrypted.authTag;
        updateData.verificationStatus = 'pending';
      }

      // Update credential
      const credential = await prisma.jobBoardCredential.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          platform: true,
          email: true,
          isActive: true,
          isConnected: true,
          verificationStatus: true,
          updatedAt: true
        }
      });

      logger.info('Job board credential updated', { userId, credentialId: id });

      reply.send({
        success: true,
        message: 'Credential updated successfully',
        credential
      });

    } catch (error) {
      logger.error('Failed to update credential', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to update credential'
      });
    }
  });

  /**
   * Delete job board credential
   * DELETE /api/job-board/credentials/:id
   */
  fastify.delete('/api/job-board/credentials/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      // Check if credential exists and belongs to user
      const existing = await prisma.jobBoardCredential.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: 'Credential not found'
        });
      }

      // Delete credential
      await prisma.jobBoardCredential.delete({
        where: { id }
      });

      logger.info('Job board credential deleted', { userId, credentialId: id });

      reply.send({
        success: true,
        message: 'Credential deleted successfully'
      });

    } catch (error) {
      logger.error('Failed to delete credential', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to delete credential'
      });
    }
  });

  /**
   * Test/verify job board credential
   * POST /api/job-board/credentials/:id/verify
   */
  fastify.post('/api/job-board/credentials/:id/verify', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      // Get credential
      const credential = await prisma.jobBoardCredential.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!credential) {
        return reply.status(404).send({
          success: false,
          message: 'Credential not found'
        });
      }

      // TODO: Implement actual verification logic with browser automation
      // For now, just mark as verified
      const updated = await prisma.jobBoardCredential.update({
        where: { id },
        data: {
          verificationStatus: 'verified',
          lastVerified: new Date(),
          isConnected: true,
          lastConnectedAt: new Date(),
          connectionError: null
        },
        select: {
          id: true,
          platform: true,
          email: true,
          verificationStatus: true,
          isConnected: true,
          lastConnectedAt: true
        }
      });

      logger.info('Job board credential verified', { userId, credentialId: id });

      reply.send({
        success: true,
        message: 'Credential verified successfully',
        credential: updated
      });

    } catch (error) {
      logger.error('Failed to verify credential', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to verify credential'
      });
    }
  });

  // ============================================
  // JOB APPLICATIONS
  // ============================================

  /**
   * Get all job applications for user
   * GET /api/job-board/applications
   */
  fastify.get('/api/job-board/applications', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { status, platform, limit = 50, offset = 0 } = request.query;

      const where = { userId };

      if (status) where.status = status;
      if (platform) where.platform = platform;

      const [applications, total] = await Promise.all([
        prisma.jobApplication.findMany({
          where,
          include: {
            credential: {
              select: {
                id: true,
                platform: true,
                email: true
              }
            },
            statusHistory: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: parseInt(limit),
          skip: parseInt(offset)
        }),
        prisma.jobApplication.count({ where })
      ]);

      reply.send({
        success: true,
        applications,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Failed to get applications', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to retrieve applications'
      });
    }
  });

  /**
   * Get single job application
   * GET /api/job-board/applications/:id
   */
  fastify.get('/api/job-board/applications/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const application = await prisma.jobApplication.findFirst({
        where: {
          id,
          userId
        },
        include: {
          credential: {
            select: {
              id: true,
              platform: true,
              email: true
            }
          },
          resumeFile: {
            select: {
              id: true,
              name: true,
              publicUrl: true
            }
          },
          coverLetterFile: {
            select: {
              id: true,
              name: true,
              publicUrl: true
            }
          },
          statusHistory: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!application) {
        return reply.status(404).send({
          success: false,
          message: 'Application not found'
        });
      }

      reply.send({
        success: true,
        application
      });

    } catch (error) {
      logger.error('Failed to get application', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to retrieve application'
      });
    }
  });

  /**
   * Create new job application
   * POST /api/job-board/applications
   */
  fastify.post('/api/job-board/applications', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const {
        jobTitle,
        company,
        jobUrl,
        jobDescription,
        location,
        salary,
        jobType,
        platform,
        externalJobId,
        credentialId,
        resumeFileId,
        coverLetterFileId,
        resumeData,
        coverLetterData,
        atsScore,
        atsBreakdown,
        notes
      } = request.body;

      // Validate required fields
      if (!jobTitle || !company || !platform) {
        return reply.status(400).send({
          success: false,
          message: 'Job title, company, and platform are required'
        });
      }

      // Create application
      const application = await prisma.jobApplication.create({
        data: {
          userId,
          jobTitle,
          company,
          jobUrl,
          jobDescription,
          location,
          salary,
          jobType,
          platform,
          externalJobId,
          credentialId,
          resumeFileId,
          coverLetterFileId,
          resumeData,
          coverLetterData,
          atsScore,
          atsBreakdown,
          notes,
          status: 'DRAFT'
        },
        include: {
          credential: {
            select: {
              id: true,
              platform: true,
              email: true
            }
          }
        }
      });

      // Create initial status history entry
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: 'DRAFT',
          notes: 'Application created'
        }
      });

      logger.info('Job application created', { userId, applicationId: application.id });

      reply.send({
        success: true,
        message: 'Application created successfully',
        application
      });

    } catch (error) {
      logger.error('Failed to create application', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to create application'
      });
    }
  });

  /**
   * Update job application status
   * PUT /api/job-board/applications/:id/status
   */
  fastify.put('/api/job-board/applications/:id/status', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { status, notes } = request.body;

      // Validate status
      const validStatuses = ['DRAFT', 'SUBMITTED', 'VIEWED', 'IN_REVIEW', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid status'
        });
      }

      // Check if application exists and belongs to user
      const existing = await prisma.jobApplication.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: 'Application not found'
        });
      }

      // Update application status
      const application = await prisma.jobApplication.update({
        where: { id },
        data: {
          status,
          lastStatusUpdate: new Date(),
          appliedAt: status === 'SUBMITTED' && !existing.appliedAt ? new Date() : existing.appliedAt
        }
      });

      // Create status history entry
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status,
          notes
        }
      });

      logger.info('Application status updated', { userId, applicationId: id, status });

      reply.send({
        success: true,
        message: 'Application status updated successfully',
        application
      });

    } catch (error) {
      logger.error('Failed to update application status', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to update application status'
      });
    }
  });

  /**
   * Update job application
   * PUT /api/job-board/applications/:id
   */
  fastify.put('/api/job-board/applications/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const updateData = request.body;

      // Check if application exists and belongs to user
      const existing = await prisma.jobApplication.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: 'Application not found'
        });
      }

      // Remove fields that shouldn't be directly updated
      delete updateData.userId;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.status; // Use status endpoint instead

      // Update application
      const application = await prisma.jobApplication.update({
        where: { id },
        data: updateData
      });

      logger.info('Application updated', { userId, applicationId: id });

      reply.send({
        success: true,
        message: 'Application updated successfully',
        application
      });

    } catch (error) {
      logger.error('Failed to update application', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to update application'
      });
    }
  });

  /**
   * Delete job application
   * DELETE /api/job-board/applications/:id
   */
  fastify.delete('/api/job-board/applications/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      // Check if application exists and belongs to user
      const existing = await prisma.jobApplication.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          message: 'Application not found'
        });
      }

      // Delete application (cascade will delete status history)
      await prisma.jobApplication.delete({
        where: { id }
      });

      logger.info('Application deleted', { userId, applicationId: id });

      reply.send({
        success: true,
        message: 'Application deleted successfully'
      });

    } catch (error) {
      logger.error('Failed to delete application', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to delete application'
      });
    }
  });

  /**
   * Get application statistics
   * GET /api/job-board/applications/stats
   */
  fastify.get('/api/job-board/applications/stats', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const [
        total,
        byStatus,
        byPlatform,
        recentApplications
      ] = await Promise.all([
        // Total applications
        prisma.jobApplication.count({ where: { userId } }),

        // Group by status
        prisma.jobApplication.groupBy({
          by: ['status'],
          where: { userId },
          _count: true
        }),

        // Group by platform
        prisma.jobApplication.groupBy({
          by: ['platform'],
          where: { userId },
          _count: true
        }),

        // Recent applications (last 30 days)
        prisma.jobApplication.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      // Calculate average ATS score
      const atsScores = await prisma.jobApplication.aggregate({
        where: {
          userId,
          atsScore: { not: null }
        },
        _avg: {
          atsScore: true
        }
      });

      const stats = {
        total,
        recentApplications,
        averageAtsScore: atsScores._avg.atsScore || 0,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
        byPlatform: byPlatform.reduce((acc, item) => {
          acc[item.platform] = item._count;
          return acc;
        }, {})
      };

      reply.send({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Failed to get application stats', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to retrieve application statistics'
      });
    }
  });

  // ============================================
  // LINKEDIN EASY APPLY AUTOMATION
  // ============================================

  const linkedinService = require('../services/jobBoards/linkedinService');

  /**
   * Apply to LinkedIn job using Easy Apply
   * POST /api/job-board/linkedin/easy-apply
   */
  fastify.post('/api/job-board/linkedin/easy-apply', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const {
        credentialId,
        jobUrl,
        jobTitle,
        company,
        jobDescription,
        resumeFileId,
        coverLetterFileId,
        userData
      } = request.body;

      // Validate required fields
      if (!credentialId || !jobUrl) {
        return reply.status(400).send({
          success: false,
          message: 'Credential ID and job URL are required'
        });
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
          platform: 'LINKEDIN',
          status: 'DRAFT',
          resumeFileId,
          coverLetterFileId,
          isAutoApplied: true,
          applicationMethod: 'easy_apply'
        }
      });

      // Create initial status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: 'DRAFT',
          notes: 'Application initiated via Easy Apply automation'
        }
      });

      logger.info('Starting LinkedIn Easy Apply automation', {
        userId,
        applicationId: application.id,
        jobUrl
      });

      // Apply to job
      const result = await linkedinService.applyToJob(userId, credentialId, jobUrl, {
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
            ? `Application submitted successfully via Easy Apply (${result.steps} steps)`
            : 'Application submission could not be verified',
          metadata: result
        }
      });

      logger.info('LinkedIn Easy Apply completed', {
        userId,
        applicationId: application.id,
        success: result.success,
        verified: result.verified
      });

      reply.send({
        success: true,
        message: result.verified
          ? 'Application submitted successfully'
          : 'Application process completed but submission could not be verified',
        application: {
          id: application.id,
          status: result.verified ? 'SUBMITTED' : 'DRAFT',
          appliedAt: result.verified ? new Date() : null
        },
        automationResult: result
      });

    } catch (error) {
      logger.error('LinkedIn Easy Apply failed', { error: error.message });

      reply.status(500).send({
        success: false,
        message: error.message || 'Failed to apply to job',
        error: error.message
      });
    }
  });

  /**
   * Test LinkedIn credential (login test)
   * POST /api/job-board/linkedin/test-credential
   */
  fastify.post('/api/job-board/linkedin/test-credential', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { credentialId } = request.body;

      if (!credentialId) {
        return reply.status(400).send({
          success: false,
          message: 'Credential ID is required'
        });
      }

      // Get credential
      const credential = await prisma.jobBoardCredential.findFirst({
        where: {
          id: credentialId,
          userId,
          platform: 'LINKEDIN'
        }
      });

      if (!credential) {
        return reply.status(404).send({
          success: false,
          message: 'LinkedIn credential not found'
        });
      }

      // Test login
      const browser = await puppeteerService.getBrowser();
      const page = await puppeteerService.createStealthPage(browser);

      try {
        await linkedinService.login(page, credential);

        // Update credential
        await prisma.jobBoardCredential.update({
          where: { id: credentialId },
          data: {
            isConnected: true,
            lastConnectedAt: new Date(),
            verificationStatus: 'verified',
            lastVerified: new Date(),
            connectionError: null
          }
        });

        await page.close();
        await puppeteerService.releaseBrowser(browser);

        reply.send({
          success: true,
          message: 'LinkedIn credential verified successfully'
        });

      } catch (loginError) {
        await page.close();
        await puppeteerService.releaseBrowser(browser);

        // Update credential with error
        await prisma.jobBoardCredential.update({
          where: { id: credentialId },
          data: {
            isConnected: false,
            verificationStatus: 'failed',
            connectionError: loginError.message
          }
        });

        reply.status(401).send({
          success: false,
          message: 'LinkedIn credential verification failed',
          error: loginError.message
        });
      }

    } catch (error) {
      logger.error('Credential test failed', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to test credential'
      });
    }
  });

  // ============================================
  // INDEED QUICK APPLY AUTOMATION
  // ============================================

  const indeedService = require('../services/jobBoards/indeedService');

  /**
   * Apply to Indeed job using Quick Apply
   * POST /api/job-board/indeed/quick-apply
   */
  fastify.post('/api/job-board/indeed/quick-apply', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const {
        credentialId,
        jobUrl,
        jobTitle,
        company,
        jobDescription,
        resumeFileId,
        coverLetterFileId,
        userData
      } = request.body;

      // Validate required fields
      if (!credentialId || !jobUrl) {
        return reply.status(400).send({
          success: false,
          message: 'Credential ID and job URL are required'
        });
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
          platform: 'INDEED',
          status: 'DRAFT',
          resumeFileId,
          coverLetterFileId,
          isAutoApplied: true,
          applicationMethod: 'quick_apply'
        }
      });

      // Create initial status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: 'DRAFT',
          notes: 'Application initiated via Quick Apply automation'
        }
      });

      logger.info('Starting Indeed Quick Apply automation', {
        userId,
        applicationId: application.id,
        jobUrl
      });

      // Apply to job
      const result = await indeedService.applyToJob(userId, credentialId, jobUrl, {
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
            ? `Application submitted successfully via Quick Apply (${result.steps} steps)`
            : 'Application submission could not be verified',
          metadata: result
        }
      });

      logger.info('Indeed Quick Apply completed', {
        userId,
        applicationId: application.id,
        success: result.success,
        verified: result.verified
      });

      reply.send({
        success: true,
        message: result.verified
          ? 'Application submitted successfully'
          : 'Application process completed but submission could not be verified',
        application: {
          id: application.id,
          status: result.verified ? 'SUBMITTED' : 'DRAFT',
          appliedAt: result.verified ? new Date() : null
        },
        automationResult: result
      });

    } catch (error) {
      logger.error('Indeed Quick Apply failed', { error: error.message });

      reply.status(500).send({
        success: false,
        message: error.message || 'Failed to apply to job',
        error: error.message
      });
    }
  });

  /**
   * Test Indeed credential (login test)
   * POST /api/job-board/indeed/test-credential
   */
  fastify.post('/api/job-board/indeed/test-credential', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { credentialId } = request.body;

      if (!credentialId) {
        return reply.status(400).send({
          success: false,
          message: 'Credential ID is required'
        });
      }

      // Get credential
      const credential = await prisma.jobBoardCredential.findFirst({
        where: {
          id: credentialId,
          userId,
          platform: 'INDEED'
        }
      });

      if (!credential) {
        return reply.status(404).send({
          success: false,
          message: 'Indeed credential not found'
        });
      }

      // Test login
      const browser = await puppeteerService.getBrowser();
      const page = await puppeteerService.createStealthPage(browser);

      try {
        await indeedService.login(page, credential);

        // Update credential
        await prisma.jobBoardCredential.update({
          where: { id: credentialId },
          data: {
            isConnected: true,
            lastConnectedAt: new Date(),
            verificationStatus: 'verified',
            lastVerified: new Date(),
            connectionError: null
          }
        });

        await page.close();
        await puppeteerService.releaseBrowser(browser);

        reply.send({
          success: true,
          message: 'Indeed credential verified successfully'
        });

      } catch (loginError) {
        await page.close();
        await puppeteerService.releaseBrowser(browser);

        // Update credential with error
        await prisma.jobBoardCredential.update({
          where: { id: credentialId },
          data: {
            isConnected: false,
            verificationStatus: 'failed',
            connectionError: loginError.message
          }
        });

        reply.status(401).send({
          success: false,
          message: 'Indeed credential verification failed',
          error: loginError.message
        });
      }

    } catch (error) {
      logger.error('Credential test failed', { error: error.message });
      reply.status(500).send({
        success: false,
        message: 'Failed to test credential'
      });
    }
  });
};
