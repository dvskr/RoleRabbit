/**
 * Resume Routes Module
 * 
 * Handles all resume-related routes including:
 * - Get all resumes for a user
 * - Get a single resume by ID
 * - Create a new resume
 * - Update an existing resume
 * - Delete a resume
 * - Auto-save resume (with conflict detection)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

/**
 * Ensure value is a proper array (convert object with numeric keys to array)
 * Fixes issue where JSON serialization converts arrays to objects
 */
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  // Convert object with numeric keys to array
  if (typeof value === 'object') {
    const values = Object.values(value);
    // Only convert if all values are strings/objects (not methods)
    if (values.every(v => typeof v === 'string' || (typeof v === 'object' && v !== null))) {
      return values;
    }
  }
  return [];
};

/**
 * Register all resume routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function resumeRoutes(fastify, options) {
  // Get all resumes for the authenticated user
  fastify.get('/api/resumes', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const resumes = await prisma.resume.findMany({
        where: {
          userId,
          isArchived: false
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          id: true,
          fileName: true,
          templateId: true,
          data: true, // Include full resume data
          isStarred: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return reply.send({
        success: true,
        resumes: resumes.map(resume => ({
          id: resume.id,
          name: resume.fileName,
          fileName: resume.fileName,
          templateId: resume.templateId,
          data: resume.data, // Include full resume data
          isStarred: resume.isStarred,
          lastUpdated: resume.updatedAt.toISOString(),
          createdAt: resume.createdAt.toISOString()
        }))
      });
    } catch (error) {
      logger.error('Error fetching resumes:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch resumes',
        message: error.message
      });
    }
  });

  // Get a single resume by ID
  fastify.get('/api/resumes/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const resume = await prisma.resume.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found'
        });
      }

      return reply.send({
        success: true,
        resume: {
          id: resume.id,
          name: resume.fileName,
          fileName: resume.fileName,
          templateId: resume.templateId,
          data: resume.data,
          lastUpdated: resume.updatedAt.toISOString(),
          createdAt: resume.createdAt.toISOString()
        }
      });
    } catch (error) {
      logger.error('Error fetching resume:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch resume',
        message: error.message
      });
    }
  });

  // Create a new resume
  fastify.post('/api/resumes', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      // Ensure user is authenticated and userId exists
      if (!request.user || !request.user.userId) {
        logger.error('No user in request:', { hasUser: !!request.user, userKeys: request.user ? Object.keys(request.user) : [] });
        return reply.status(401).send({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const userId = request.user.userId;
      const { fileName, templateId, data } = request.body;

      // Debug logging
      logger.info('Creating resume:', { 
        userId, 
        userIdType: typeof userId,
        fileName, 
        hasData: !!data, 
        dataKeys: data ? Object.keys(data) : [],
        userObject: request.user
      });

      // Validate required fields
      if (!fileName || !data) {
        logger.warn('Missing required fields:', { hasFileName: !!fileName, hasData: !!data });
        return reply.status(400).send({
          success: false,
          error: 'fileName and data are required'
        });
      }

      // Validate data structure
      if (typeof data !== 'object') {
        return reply.status(400).send({
          success: false,
          error: 'data must be an object'
        });
      }

      // Extract sectionOrder separately (it's String[], not JSON)
      const sectionOrder = Array.isArray(data.sectionOrder) 
        ? data.sectionOrder 
        : ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'];

      // Ensure resumeData is a proper object
      const resumeDataContent = data.resumeData && typeof data.resumeData === 'object' 
        ? data.resumeData 
        : (data && typeof data === 'object' ? data : {});

      // Create resume data structure (JSON fields only - sectionOrder is separate)
      // CRITICAL: Ensure all nested objects are plain objects, not undefined
      const resumeData = {
        resumeData: resumeDataContent || {},
        // Don't include sectionOrder in JSON - it's a separate String[] field
        sectionVisibility: (data.sectionVisibility && typeof data.sectionVisibility === 'object' && !Array.isArray(data.sectionVisibility)) 
          ? data.sectionVisibility 
          : {},
        customSections: Array.isArray(data.customSections) ? data.customSections : [],
        customFields: Array.isArray(data.customFields) ? data.customFields : [],
        formatting: (data.formatting && typeof data.formatting === 'object' && !Array.isArray(data.formatting))
          ? data.formatting
          : {
              fontFamily: 'arial',
              fontSize: 'ats11pt',
              lineSpacing: 'normal',
              sectionSpacing: 'medium',
              margins: 'normal',
              headingStyle: 'bold',
              bulletStyle: 'disc'
            }
      };

      // Ensure all JSON fields are properly formatted
      // Prisma JSON fields need to be plain objects/arrays, not Prisma.JsonValue wrappers
      // CRITICAL: All fields must be defined, not undefined
      const createData = {
        userId: String(userId), // Ensure it's a string
        fileName: String(fileName.trim()),
        templateId: templateId ? String(templateId) : null,
        data: resumeData || {},
        sectionOrder: Array.isArray(sectionOrder) ? sectionOrder : [],
        sectionVisibility: (resumeData.sectionVisibility && typeof resumeData.sectionVisibility === 'object' && !Array.isArray(resumeData.sectionVisibility)) ? resumeData.sectionVisibility : {},
        customSections: Array.isArray(resumeData.customSections) ? resumeData.customSections : [],
        customFields: Array.isArray(resumeData.customFields) ? resumeData.customFields : [],
        formatting: (resumeData.formatting && typeof resumeData.formatting === 'object' && !Array.isArray(resumeData.formatting)) ? resumeData.formatting : {}
      };

      // Validate all fields are defined (not undefined)
      const undefinedFields = Object.entries(createData)
        .filter(([key, value]) => value === undefined)
        .map(([key]) => key);
      
      if (undefinedFields.length > 0) {
        logger.error('Undefined fields detected:', undefinedFields);
        return reply.status(400).send({
          success: false,
          error: 'Invalid data: some fields are undefined',
          undefinedFields
        });
      }

      // Validate data structure before saving
      try {
        JSON.stringify(createData.data);
        JSON.stringify(createData.sectionVisibility);
        JSON.stringify(createData.customSections);
        JSON.stringify(createData.customFields);
        JSON.stringify(createData.formatting);
      } catch (jsonError) {
        logger.error('Invalid JSON structure:', jsonError);
        return reply.status(400).send({
          success: false,
          error: 'Invalid data structure',
          message: jsonError.message
        });
      }

      logger.info('Creating resume with data:', { 
        userId, 
        fileName: createData.fileName,
        hasData: !!createData.data,
        sectionOrderLength: createData.sectionOrder.length,
        hasSectionVisibility: !!createData.sectionVisibility,
        hasFormatting: !!createData.formatting,
        dataKeys: createData.data ? Object.keys(createData.data) : [],
        resumeDataKeys: createData.data?.resumeData ? Object.keys(createData.data.resumeData) : []
      });

      // Log the actual structure being sent to Prisma (first level only to avoid huge logs)
      console.log('[DEBUG] Prisma create data structure:', {
        userId: typeof createData.userId,
        fileName: typeof createData.fileName,
        templateId: createData.templateId,
        data: typeof createData.data,
        sectionOrder: Array.isArray(createData.sectionOrder),
        sectionOrderValue: createData.sectionOrder,
        sectionVisibility: typeof createData.sectionVisibility,
        customSections: Array.isArray(createData.customSections),
        customFields: Array.isArray(createData.customFields),
        formatting: typeof createData.formatting
      });

      // Try to create with detailed error handling
      let resume;
      try {
        resume = await prisma.resume.create({
          data: createData
        });
      } catch (prismaError) {
        const errorDetails = {
          message: prismaError.message,
          code: prismaError.code,
          meta: prismaError.meta,
          name: prismaError.name,
          stack: prismaError.stack,
          cause: prismaError.cause,
          createData: createData
        };
        
        console.error('[PRISMA ERROR] Full error:', errorDetails);
        console.error('[PRISMA ERROR] CreateData that failed:', JSON.stringify(createData, null, 2));
        
        // Write to file for debugging
        try {
          const fs = require('fs');
          fs.writeFileSync('prisma-error.json', JSON.stringify(errorDetails, null, 2));
          console.error('[PRISMA ERROR] Error details written to prisma-error.json');
        } catch (fileError) {
          // Ignore file write errors
        }
        
        throw prismaError;
      }

      logger.info('Resume created successfully:', { id: resume.id, fileName: resume.fileName, userId });

      return reply.status(201).send({
        success: true,
        resume: {
          id: resume.id,
          name: resume.fileName,
          fileName: resume.fileName,
          templateId: resume.templateId,
          data: resume.data,
          lastUpdated: resume.updatedAt.toISOString(),
          createdAt: resume.createdAt.toISOString()
        }
      });
    } catch (error) {
      logger.error('Error creating resume:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta,
        name: error.name
      });
      console.error('Full error object:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create resume',
        message: error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      });
    }
  });

  // Update an existing resume
  fastify.put('/api/resumes/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      // Frontend may send 'name' or 'fileName' - accept both
      const { fileName, name, templateId, data, lastKnownServerUpdatedAt } = request.body;
      const resumeFileName = fileName || name; // Use fileName if provided, otherwise name

      // Debug logging
      logger.info('Updating resume:', { 
        userId, 
        resumeId: id, 
        fileName: resumeFileName,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        requestBodyKeys: Object.keys(request.body)
      });

      // Find the resume
      const existingResume = await prisma.resume.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingResume) {
        logger.warn('Resume not found for update:', { id, userId });
        return reply.status(404).send({
          success: false,
          error: 'Resume not found'
        });
      }

      // Conflict detection: Check if resume was updated elsewhere
      if (lastKnownServerUpdatedAt) {
        const lastUpdated = new Date(existingResume.updatedAt);
        const clientLastUpdated = new Date(lastKnownServerUpdatedAt);
        
        // Allow 1 second tolerance for clock skew
        if (lastUpdated.getTime() > clientLastUpdated.getTime() + 1000) {
          return reply.status(409).send({
            success: false,
            error: 'Resume was updated elsewhere. Please reload to sync changes.',
            conflict: true,
            serverLastUpdated: existingResume.updatedAt.toISOString()
          });
        }
      }

      // Extract sectionOrder separately (it's String[], not JSON)
      const sectionOrder = data?.sectionOrder !== undefined 
        ? (Array.isArray(data.sectionOrder) ? data.sectionOrder : [])
        : existingResume.sectionOrder;

      // Prepare update data
      const updateData = {
        updatedAt: new Date()
      };

      // Update fileName if provided
      if (resumeFileName !== undefined && resumeFileName !== null) {
        updateData.fileName = String(resumeFileName).trim();
      }

      // Update templateId if provided
      if (templateId !== undefined) {
        updateData.templateId = templateId ? String(templateId) : null;
      }

      // Update data if provided
      if (data !== undefined && data !== null) {
        const existingData = existingResume.data || {};
        
        // Extract resumeData - frontend sends it as data.resumeData
        let resumeDataContent;
        if (data.resumeData !== undefined) {
          // Use the provided resumeData (even if empty object)
          resumeDataContent = (typeof data.resumeData === 'object' && !Array.isArray(data.resumeData)) 
            ? data.resumeData 
            : {};
        } else {
          // Fallback to existing if not provided
          resumeDataContent = existingData.resumeData || {};
        }

        // Build new data object - use provided values or fallback to existing
        const newData = {
          resumeData: resumeDataContent,
          // Don't include sectionOrder in JSON - it's a separate String[] field
          sectionVisibility: (data.sectionVisibility !== undefined && typeof data.sectionVisibility === 'object' && !Array.isArray(data.sectionVisibility))
            ? data.sectionVisibility
            : (existingData.sectionVisibility || {}),
          customSections: (data.customSections !== undefined && Array.isArray(data.customSections))
            ? data.customSections
            : (existingData.customSections || []),
          customFields: (data.customFields !== undefined && Array.isArray(data.customFields))
            ? data.customFields
            : (existingData.customFields || []),
          formatting: (data.formatting !== undefined && typeof data.formatting === 'object' && !Array.isArray(data.formatting))
            ? data.formatting
            : (existingData.formatting || {})
        };

        updateData.data = newData;
        
        // Update individual JSON fields if provided (replace, don't merge)
        if (data.sectionVisibility !== undefined && typeof data.sectionVisibility === 'object' && !Array.isArray(data.sectionVisibility)) {
          updateData.sectionVisibility = data.sectionVisibility;
        }
        if (data.customSections !== undefined) {
          updateData.customSections = Array.isArray(data.customSections) ? data.customSections : [];
        }
        if (data.customFields !== undefined) {
          updateData.customFields = Array.isArray(data.customFields) ? data.customFields : [];
        }
        if (data.formatting !== undefined && typeof data.formatting === 'object' && !Array.isArray(data.formatting)) {
          updateData.formatting = data.formatting;
        }
      }

      // Always update sectionOrder if it was provided in data
      if (data?.sectionOrder !== undefined) {
        updateData.sectionOrder = Array.isArray(data.sectionOrder) ? data.sectionOrder : [];
      }

      // Validate all fields before saving
      const undefinedFields = Object.entries(updateData)
        .filter(([key, value]) => value === undefined && key !== 'templateId') // templateId can be null
        .map(([key]) => key);
      
      if (undefinedFields.length > 0) {
        logger.error('Undefined fields in update:', undefinedFields);
        return reply.status(400).send({
          success: false,
          error: 'Invalid data: some fields are undefined',
          undefinedFields
        });
      }

      logger.info('Updating resume with data:', {
        resumeId: id,
        updateKeys: Object.keys(updateData),
        hasData: !!updateData.data,
        hasResumeData: !!updateData.data?.resumeData,
        resumeDataKeys: updateData.data?.resumeData ? Object.keys(updateData.data.resumeData) : [],
        sectionOrderLength: updateData.sectionOrder?.length || 0,
        hasFormatting: !!updateData.formatting,
        formattingKeys: updateData.formatting ? Object.keys(updateData.formatting) : []
      });
      
      // Log the actual resumeData content (first level only)
      if (updateData.data?.resumeData) {
        const resumeData = updateData.data.resumeData;
        logger.info('Resume data being saved:', {
          hasName: !!resumeData.name,
          hasTitle: !!resumeData.title,
          hasEmail: !!resumeData.email,
          hasPhone: !!resumeData.phone,
          hasSummary: !!resumeData.summary,
          skillsCount: Array.isArray(resumeData.skills) ? resumeData.skills.length : 0,
          experienceCount: Array.isArray(resumeData.experience) ? resumeData.experience.length : 0,
          educationCount: Array.isArray(resumeData.education) ? resumeData.education.length : 0,
          projectsCount: Array.isArray(resumeData.projects) ? resumeData.projects.length : 0,
          certificationsCount: Array.isArray(resumeData.certifications) ? resumeData.certifications.length : 0
        });
      }

      const updatedResume = await prisma.resume.update({
        where: { id },
        data: updateData
      });

      logger.info('Resume updated successfully:', { id: updatedResume.id, fileName: updatedResume.fileName, userId });

      return reply.send({
        success: true,
        resume: {
          id: updatedResume.id,
          name: updatedResume.fileName,
          fileName: updatedResume.fileName,
          templateId: updatedResume.templateId,
          data: updatedResume.data,
          lastUpdated: updatedResume.updatedAt.toISOString(),
          createdAt: updatedResume.createdAt.toISOString()
        }
      });
    } catch (error) {
      logger.error('Error updating resume:', error);
      
      // Handle Prisma unique constraint errors
      if (error.code === 'P2002') {
        return reply.status(409).send({
          success: false,
          error: 'A resume with this name already exists'
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Failed to update resume',
        message: error.message
      });
    }
  });

  // Auto-save resume (optimistic update with conflict detection)
  fastify.post('/api/resumes/:id/autosave', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { data, lastKnownServerUpdatedAt } = request.body;

      // Debug logging
      logger.info('Auto-saving resume:', { userId, resumeId: id, hasData: !!data, dataKeys: data ? Object.keys(data) : [] });

      if (!data) {
        logger.warn('Auto-save missing data field');
        return reply.status(400).send({
          success: false,
          error: 'data is required'
        });
      }

      // Find the resume
      const existingResume = await prisma.resume.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingResume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found'
        });
      }

      // Conflict detection
      if (lastKnownServerUpdatedAt) {
        const lastUpdated = new Date(existingResume.updatedAt);
        const clientLastUpdated = new Date(lastKnownServerUpdatedAt);
        
        // Allow 1 second tolerance for clock skew
        if (lastUpdated.getTime() > clientLastUpdated.getTime() + 1000) {
          return reply.status(409).send({
            success: false,
            error: 'Resume was updated elsewhere. Please reload to sync changes.',
            conflict: true,
            serverLastUpdated: existingResume.updatedAt.toISOString()
          });
        }
      }

      // Prepare update data
      const existingData = existingResume.data || {};
      
      // DEBUG: Log what we're receiving
      console.log('[AUTOSAVE] Received data:', {
        hasResumeData: !!data.resumeData,
        resumeDataKeys: data.resumeData ? Object.keys(data.resumeData) : [],
        phone: data.resumeData?.phone,
        oldPhone: existingData.resumeData?.phone
      });
      
      const mergedData = {
        resumeData: data.resumeData || existingData.resumeData || data,
        sectionOrder: data.sectionOrder !== undefined ? data.sectionOrder : existingData.sectionOrder,
        sectionVisibility: data.sectionVisibility !== undefined ? data.sectionVisibility : existingData.sectionVisibility,
        customSections: data.customSections !== undefined ? data.customSections : existingData.customSections,
        customFields: data.customFields !== undefined ? data.customFields : existingData.customFields,
        formatting: data.formatting !== undefined ? data.formatting : existingData.formatting
      };

      // DEBUG: Log what we're about to save
      console.log('[AUTOSAVE] Merged data to save:', {
        hasResumeData: !!mergedData.resumeData,
        phone: mergedData.resumeData?.phone,
        skills: mergedData.resumeData?.skills
      });

      // Ensure arrays are proper arrays (not objects with numeric keys)
      const sectionOrderToSave = ensureArray(data.sectionOrder !== undefined ? data.sectionOrder : existingResume.sectionOrder);
      const customSectionsToSave = ensureArray(data.customSections !== undefined ? data.customSections : existingResume.customSections);
      const customFieldsToSave = ensureArray(data.customFields !== undefined ? data.customFields : existingResume.customFields);

      const updatedResume = await prisma.resume.update({
        where: { id },
        data: {
          data: mergedData,
          sectionOrder: sectionOrderToSave,
          sectionVisibility: data.sectionVisibility !== undefined ? data.sectionVisibility : existingResume.sectionVisibility,
          customSections: customSectionsToSave,
          customFields: customFieldsToSave,
          formatting: data.formatting !== undefined ? data.formatting : existingResume.formatting,
          updatedAt: new Date()
        }
      });
      
      // DEBUG: Log what was actually saved
      console.log('[AUTOSAVE] Saved to database:', {
        id: updatedResume.id,
        phone: updatedResume.data?.resumeData?.phone
      });

      logger.info('Resume auto-saved successfully:', { id: updatedResume.id, fileName: updatedResume.fileName, userId });

      return reply.send({
        success: true,
        resume: {
          id: updatedResume.id,
          name: updatedResume.fileName,
          fileName: updatedResume.fileName,
          templateId: updatedResume.templateId,
          data: updatedResume.data,
          lastUpdated: updatedResume.updatedAt.toISOString(),
          createdAt: updatedResume.createdAt.toISOString()
        }
      });
    } catch (error) {
      logger.error('Error auto-saving resume:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to auto-save resume',
        message: error.message
      });
    }
  });

  // Delete a resume
  fastify.delete('/api/resumes/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      const resume = await prisma.resume.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found'
        });
      }

      await prisma.resume.delete({
        where: { id }
      });

      return reply.send({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting resume:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete resume',
        message: error.message
      });
    }
  });

  // Duplicate/Copy a resume
  fastify.post('/api/resumes/:id/duplicate', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { fileName } = request.body;

      const originalResume = await prisma.resume.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!originalResume) {
        return reply.status(404).send({
          success: false,
          error: 'Resume not found'
        });
      }

      const newFileName = fileName || `${originalResume.fileName} (Copy)`;

      const duplicatedResume = await prisma.resume.create({
        data: {
          userId,
          fileName: newFileName,
          templateId: originalResume.templateId,
          data: originalResume.data,
          sectionOrder: originalResume.sectionOrder,
          sectionVisibility: originalResume.sectionVisibility,
          customSections: originalResume.customSections,
          customFields: originalResume.customFields,
          formatting: originalResume.formatting
        }
      });

      return reply.status(201).send({
        success: true,
        resume: {
          id: duplicatedResume.id,
          name: duplicatedResume.fileName,
          fileName: duplicatedResume.fileName,
          templateId: duplicatedResume.templateId,
          data: duplicatedResume.data,
          lastUpdated: duplicatedResume.updatedAt.toISOString(),
          createdAt: duplicatedResume.createdAt.toISOString()
        }
      });
    } catch (error) {
      logger.error('Error duplicating resume:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to duplicate resume',
        message: error.message
      });
    }
  });
}

module.exports = resumeRoutes;

