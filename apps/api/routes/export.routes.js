/**
 * Export Routes
 * 
 * Handles resume export in multiple formats:
 * - PDF
 * - DOCX
 * - TXT
 * - JSON
 */

const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { prisma } = require('../utils/db');
const { exportToPDF, exportToDOCX, exportToPlainText } = require('../services/resumeExporter');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

module.exports = async function exportRoutes(fastify) {
  /**
   * Export resume to specified format
   * POST /api/base-resumes/:id/export
   */
  fastify.post('/api/base-resumes/:id/export', { preHandler: authenticate }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const userId = request.user.userId;
      const baseResumeId = request.params.id;
      const { format = 'pdf', templateId } = request.body || {};
      
      logger.info('📤 Export request received', { 
        userId, 
        baseResumeId, 
        format, 
        templateId 
      });
      
      // Validate format
      const validFormats = ['pdf', 'docx', 'txt', 'json'];
      if (!validFormats.includes(format.toLowerCase())) {
        return reply.status(400).send({
          success: false,
          error: `Invalid format. Supported formats: ${validFormats.join(', ')}`
        });
      }
      
      // Verify user owns the resume
      const resume = await prisma.baseResume.findFirst({
        where: {
          id: baseResumeId,
          userId: userId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });
      
      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found or you do not have permission to export it'
        });
      }
      
      // Get template if specified
      let template = null;
      if (templateId) {
        // For now, templates are hardcoded in frontend
        // When templates are in database, fetch from there
        logger.info('Template requested', { templateId });
      }
      
      // Prepare resume data - map to format expected by exporter
      const resumeData = {
        personalInfo: {
          name: resume.data?.contact?.name || resume.name,
          email: resume.data?.contact?.email || '',
          phone: resume.data?.contact?.phone || '',
          location: resume.data?.contact?.location || '',
          linkedin: resume.data?.contact?.links?.find(l => l.type === 'linkedin')?.url || '',
          github: resume.data?.contact?.links?.find(l => l.type === 'github')?.url || '',
          portfolio: resume.data?.contact?.links?.find(l => l.type === 'portfolio')?.url || ''
        },
        summary: resume.data?.summary || '',
        workExperience: (resume.data?.experience || []).map(exp => ({
          position: exp.role || exp.position || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.isCurrent ? 'Present' : (exp.endDate || ''),
          responsibilities: exp.bullets || exp.responsibilities || []
        })),
        education: (resume.data?.education || []).map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          location: edu.location || '',
          graduationDate: edu.endDate || '',
          gpa: edu.gpa || ''
        })),
        skills: resume.data?.skills?.technical || resume.data?.skills || [],
        projects: (resume.data?.projects || []).map(proj => ({
          name: proj.name || proj.title || '',
          description: proj.description || proj.summary || '',
          technologies: proj.technologies || proj.skills || []
        })),
        certifications: resume.data?.certifications || []
      };
      
      // Generate unique filename
      const sanitizedName = resume.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(4).toString('hex');
      
      // Save to temporary storage
      const exportsDir = path.join(process.cwd(), 'temp', 'exports');
      await fs.mkdir(exportsDir, { recursive: true });
      
      // Generate export based on format
      let filePath;
      let fileExtension;
      let mimeType;
      
      switch (format.toLowerCase()) {
        case 'pdf':
          fileExtension = 'pdf';
          mimeType = 'application/pdf';
          const pdfFileName = `${sanitizedName}_${timestamp}_${randomId}.${fileExtension}`;
          filePath = path.join(exportsDir, pdfFileName);
          await exportToPDF(resumeData, filePath);
          break;
          
        case 'docx':
          fileExtension = 'docx';
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const docxFileName = `${sanitizedName}_${timestamp}_${randomId}.${fileExtension}`;
          filePath = path.join(exportsDir, docxFileName);
          await exportToDOCX(resumeData, filePath);
          break;
          
        case 'txt':
          fileExtension = 'txt';
          mimeType = 'text/plain';
          const txtFileName = `${sanitizedName}_${timestamp}_${randomId}.${fileExtension}`;
          filePath = path.join(exportsDir, txtFileName);
          await exportToPlainText(resumeData, filePath);
          break;
          
        case 'json':
          fileExtension = 'json';
          mimeType = 'application/json';
          const jsonFileName = `${sanitizedName}_${timestamp}_${randomId}.${fileExtension}`;
          filePath = path.join(exportsDir, jsonFileName);
          const jsonContent = JSON.stringify(resume.data, null, 2);
          await fs.writeFile(filePath, jsonContent, 'utf8');
          break;
          
        default:
          return reply.status(400).send({
            success: false,
            error: 'Unsupported format'
          });
      }
      
      const fileName = path.basename(filePath);
      
      // Generate download URL (temporary, expires in 1 hour)
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Store export record in database
      await prisma.generatedDocument.create({
        data: {
          id: downloadToken,
          userId: userId,
          baseResumeId: baseResumeId,
          type: format.toUpperCase(),
          templateId: templateId || null,
          data: {
            fileName: fileName,
            filePath: filePath,
            fileSize: (await fs.stat(filePath)).size,
            mimeType: mimeType,
            expiresAt: expiresAt.toISOString()
          },
          storagePath: filePath
        }
      });
      
      // Track analytics
      try {
        await prisma.resumeAnalytics.upsert({
          where: {
            resumeId: baseResumeId
          },
          create: {
            resumeId: baseResumeId,
            viewCount: 0,
            exportCount: 1,
            tailorCount: 0,
            shareCount: 0,
            lastExportedAt: new Date()
          },
          update: {
            exportCount: {
              increment: 1
            },
            lastExportedAt: new Date()
          }
        });
      } catch (analyticsError) {
        // Don't fail export if analytics fails
        logger.warn('Failed to track export analytics', { error: analyticsError.message });
      }
      
      const duration = Date.now() - startTime;
      logger.info('✅ Export completed successfully', { 
        userId, 
        baseResumeId, 
        format, 
        fileName,
        duration: `${duration}ms`
      });
      
      // Return download URL
      const downloadUrl = `/api/exports/download/${downloadToken}`;
      
      return reply.send({
        success: true,
        fileUrl: downloadUrl,
        fileName: fileName,
        format: format,
        expiresAt: expiresAt.toISOString(),
        message: 'Export completed successfully'
      });
      
    } catch (error) {
      logger.error('❌ Export failed', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to export resume',
        message: error.message
      });
    }
  });
  
  /**
   * Download exported file
   * GET /api/exports/download/:token
   */
  fastify.get('/api/exports/download/:token', async (request, reply) => {
    try {
      const { token } = request.params;
      
      // Find export record
      const exportRecord = await prisma.generatedDocument.findUnique({
        where: { id: token }
      });
      
      if (!exportRecord) {
        return reply.status(404).send({
          success: false,
          error: 'Export not found or has expired'
        });
      }
      
      // Check expiration
      const expiresAt = new Date(exportRecord.data.expiresAt);
      if (expiresAt < new Date()) {
        // Delete expired file
        try {
          await fs.unlink(exportRecord.storagePath);
          await prisma.generatedDocument.delete({ where: { id: token } });
        } catch (cleanupError) {
          logger.warn('Failed to cleanup expired export', { error: cleanupError.message });
        }
        
        return reply.status(410).send({
          success: false,
          error: 'Export has expired. Please generate a new export.'
        });
      }
      
      // Read file
      const fileBuffer = await fs.readFile(exportRecord.storagePath);
      
      // Set headers
      reply.header('Content-Type', exportRecord.data.mimeType);
      reply.header('Content-Disposition', `attachment; filename="${exportRecord.data.fileName}"`);
      reply.header('Content-Length', exportRecord.data.fileSize);
      
      return reply.send(fileBuffer);
      
    } catch (error) {
      logger.error('❌ Download failed', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to download file'
      });
    }
  });
  
  /**
   * Cleanup expired exports (cron job endpoint)
   * POST /api/exports/cleanup
   */
  fastify.post('/api/exports/cleanup', { preHandler: authenticate }, async (request, reply) => {
    try {
      // Only allow admin users
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { role: true }
      });
      
      if (user?.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          error: 'Admin access required'
        });
      }
      
      // Find expired exports
      const expiredExports = await prisma.generatedDocument.findMany({
        where: {
          data: {
            path: ['expiresAt'],
            lt: new Date().toISOString()
          }
        }
      });
      
      let deletedCount = 0;
      let errorCount = 0;
      
      for (const exportRecord of expiredExports) {
        try {
          // Delete file
          await fs.unlink(exportRecord.storagePath);
          
          // Delete database record
          await prisma.generatedDocument.delete({
            where: { id: exportRecord.id }
          });
          
          deletedCount++;
        } catch (error) {
          logger.warn('Failed to delete expired export', { 
            exportId: exportRecord.id, 
            error: error.message 
          });
          errorCount++;
        }
      }
      
      logger.info('🧹 Export cleanup completed', { 
        deletedCount, 
        errorCount 
      });
      
      return reply.send({
        success: true,
        deletedCount,
        errorCount,
        message: `Cleaned up ${deletedCount} expired exports`
      });
      
    } catch (error) {
      logger.error('❌ Cleanup failed', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to cleanup exports'
      });
    }
  });
};

