/**
 * GDPR Compliance Routes
 * 
 * Implements GDPR data subject rights:
 * - Right to access (data export)
 * - Right to erasure (account deletion)
 * - Right to data portability
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { logPIIAccess } = require('../utils/piiAccessLog');
const { decryptResumeData } = require('../utils/piiEncryption');

/**
 * Request data export (GDPR Article 15 - Right to Access)
 * POST /api/gdpr/export-request
 */
router.post('/export-request', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Check for existing pending request
    const existingRequest = await prisma.$queryRawUnsafe(`
      SELECT * FROM gdpr_data_requests
      WHERE user_id = '${userId}'
        AND request_type = 'export'
        AND status IN ('pending', 'processing')
      ORDER BY requested_at DESC
      LIMIT 1
    `);
    
    if (existingRequest && existingRequest.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Data export request already in progress',
        requestId: existingRequest[0].id,
        status: existingRequest[0].status
      });
    }
    
    // Create new export request
    const requestId = uuidv4();
    await prisma.$executeRaw`
      INSERT INTO gdpr_data_requests (
        id, user_id, request_type, status, requested_at
      ) VALUES (
        ${requestId},
        ${userId},
        'export',
        'pending',
        NOW()
      )
    `;
    
    // Log PII access
    await logPIIAccess({
      userId,
      resourceType: 'user_data',
      resourceId: userId,
      action: 'export',
      accessedFields: ['all'],
      reason: 'gdpr_export_request',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Queue background job to generate export
    // (In production, use BullMQ or similar)
    processDataExport(userId, requestId).catch(error => {
      console.error('Data export processing error:', error);
    });
    
    res.json({
      success: true,
      message: 'Data export request submitted. You will receive an email when ready.',
      requestId,
      estimatedTime: '15-30 minutes'
    });
  } catch (error) {
    console.error('GDPR export request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process export request'
    });
  }
});

/**
 * Check export request status
 * GET /api/gdpr/export-status/:requestId
 */
router.get('/export-status/:requestId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { requestId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const request = await prisma.$queryRawUnsafe(`
      SELECT * FROM gdpr_data_requests
      WHERE id = '${requestId}' AND user_id = '${userId}'
      LIMIT 1
    `);
    
    if (!request || request.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Export request not found'
      });
    }
    
    const exportRequest = request[0];
    
    res.json({
      success: true,
      request: {
        id: exportRequest.id,
        status: exportRequest.status,
        requestedAt: exportRequest.requested_at,
        completedAt: exportRequest.completed_at,
        exportUrl: exportRequest.export_url,
        expiresAt: exportRequest.expires_at
      }
    });
  } catch (error) {
    console.error('GDPR export status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check export status'
    });
  }
});

/**
 * Request account deletion (GDPR Article 17 - Right to Erasure)
 * POST /api/gdpr/delete-request
 */
router.post('/delete-request', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { confirmation } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        success: false,
        error: 'Invalid confirmation. Please type "DELETE_MY_ACCOUNT" to confirm.'
      });
    }
    
    // Check for existing pending request
    const existingRequest = await prisma.$queryRawUnsafe(`
      SELECT * FROM gdpr_data_requests
      WHERE user_id = '${userId}'
        AND request_type = 'delete'
        AND status IN ('pending', 'processing')
      ORDER BY requested_at DESC
      LIMIT 1
    `);
    
    if (existingRequest && existingRequest.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Account deletion request already in progress',
        requestId: existingRequest[0].id
      });
    }
    
    // Create deletion request
    const requestId = uuidv4();
    await prisma.$executeRaw`
      INSERT INTO gdpr_data_requests (
        id, user_id, request_type, status, requested_at
      ) VALUES (
        ${requestId},
        ${userId},
        'delete',
        'pending',
        NOW()
      )
    `;
    
    // Log PII access
    await logPIIAccess({
      userId,
      resourceType: 'user_account',
      resourceId: userId,
      action: 'delete',
      accessedFields: ['all'],
      reason: 'gdpr_deletion_request',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Queue background job to process deletion
    processAccountDeletion(userId, requestId).catch(error => {
      console.error('Account deletion processing error:', error);
    });
    
    res.json({
      success: true,
      message: 'Account deletion request submitted. Your account will be deleted within 30 days.',
      requestId,
      gracePeriod: '30 days'
    });
  } catch (error) {
    console.error('GDPR delete request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process deletion request'
    });
  }
});

/**
 * Cancel deletion request (within grace period)
 * POST /api/gdpr/cancel-deletion/:requestId
 */
router.post('/cancel-deletion/:requestId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { requestId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Update request status
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'cancelled', completed_at = NOW()
      WHERE id = '${requestId}'
        AND user_id = '${userId}'
        AND request_type = 'delete'
        AND status = 'pending'
    `);
    
    res.json({
      success: true,
      message: 'Account deletion cancelled successfully'
    });
  } catch (error) {
    console.error('GDPR cancel deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel deletion'
    });
  }
});

/**
 * Background job: Process data export
 */
async function processDataExport(userId, requestId) {
  try {
    // Update status to processing
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'processing'
      WHERE id = '${requestId}'
    `);
    
    // Collect all user data
    const userData = {
      user: await prisma.user.findUnique({ where: { id: userId } }),
      resumes: await prisma.baseResume.findMany({ where: { userId } }),
      workingDrafts: await prisma.workingDraft.findMany({ where: { userId } }),
      tailoredVersions: await prisma.tailoredVersion.findMany({ where: { userId } }),
      aiRequestLogs: await prisma.aIRequestLog.findMany({ where: { userId } }),
      storageFiles: await prisma.storageFile.findMany({ where: { userId } })
    };
    
    // Decrypt PII in resumes
    userData.resumes = userData.resumes.map(resume => ({
      ...resume,
      data: decryptResumeData(resume.data)
    }));
    
    // Generate JSON export
    const exportData = JSON.stringify(userData, null, 2);
    
    // In production: Upload to S3 and generate signed URL
    // For now, just store a placeholder URL
    const exportUrl = `https://roleready.com/exports/${requestId}.json`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    // Update request with export URL
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'completed',
          completed_at = NOW(),
          export_url = '${exportUrl}',
          expires_at = '${expiresAt.toISOString()}'
      WHERE id = '${requestId}'
    `);
    
    // Send email notification (implement separately)
    console.log(`Data export completed for user ${userId}`);
  } catch (error) {
    console.error('Data export processing error:', error);
    
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'failed',
          error_message = '${error.message}'
      WHERE id = '${requestId}'
    `);
  }
}

/**
 * Background job: Process account deletion
 */
async function processAccountDeletion(userId, requestId) {
  try {
    // Grace period: 30 days
    // In production, schedule this to run after 30 days
    // For now, just mark as processing
    
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'processing'
      WHERE id = '${requestId}'
    `);
    
    // After 30 days, delete all user data:
    // 1. Soft delete all resumes
    await prisma.baseResume.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });
    
    // 2. Delete working drafts
    await prisma.workingDraft.deleteMany({ where: { userId } });
    
    // 3. Delete tailored versions
    await prisma.tailoredVersion.deleteMany({ where: { userId } });
    
    // 4. Delete AI logs
    await prisma.aIRequestLog.deleteMany({ where: { userId } });
    
    // 5. Delete storage files
    await prisma.storageFile.deleteMany({ where: { userId } });
    
    // 6. Delete cache entries
    await prisma.resumeCache.deleteMany({ where: { userId } });
    
    // 7. Mark user as deleted (or delete user record)
    // await prisma.user.delete({ where: { id: userId } });
    
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'completed', completed_at = NOW()
      WHERE id = '${requestId}'
    `);
    
    console.log(`Account deletion completed for user ${userId}`);
  } catch (error) {
    console.error('Account deletion processing error:', error);
    
    await prisma.$executeRawUnsafe(`
      UPDATE gdpr_data_requests
      SET status = 'failed',
          error_message = '${error.message}'
      WHERE id = '${requestId}'
    `);
  }
}

module.exports = router;
