/**
 * INTEGRATION EXAMPLE
 * 
 * Complete example showing how to integrate all validation,
 * error handling, retry logic, circuit breakers, and DLQ.
 */

const express = require('express');
const router = express.Router();

// Import schemas
const {
  CreateResumePayloadSchema,
  UpdateResumePayloadSchema,
  ExportResumePayloadSchema,
  validateCustomSectionNames,
  validateTemplateId
} = require('./schemas/resumeData.schema');

// Import error handling
const {
  asyncHandler,
  validateRequest,
  sendErrorResponse,
  handleDatabaseError,
  handleAIServiceError,
  handleCacheError,
  ErrorCodes
} = require('./utils/errorHandler');

// Import retry logic
const {
  retryDatabaseOperation,
  retryLLMOperation
} = require('./utils/retryHandler');

// Import circuit breaker
const {
  executeWithOpenAIBreaker,
  executeWithDatabaseBreaker,
  executeWithRedisBreaker
} = require('./utils/circuitBreaker');

// Import DLQ
const {
  DeadLetterQueue,
  PartialSuccessHandler,
  DLQOperationType
} = require('./utils/deadLetterQueue');

// Example: Prisma client (adjust to your setup)
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// Initialize DLQ
// const dlq = new DeadLetterQueue(prisma);

/**
 * ============================================================================
 * EXAMPLE 1: Create Resume with Full Validation
 * ============================================================================
 */
router.post('/resumes',
  validateRequest(CreateResumePayloadSchema), // ✅ Validates payload
  asyncHandler(async (req, res) => {           // ✅ Handles errors automatically
    const { name, data, formatting, metadata } = req.validatedBody;
    
    // ✅ Validate template ID if provided
    if (metadata?.templateId) {
      const templateValidation = validateTemplateId(metadata.templateId);
      if (!templateValidation.valid) {
        return sendErrorResponse(
          res,
          ErrorCodes.INVALID_TEMPLATE_ID,
          templateValidation.error
        );
      }
    }
    
    // ✅ Validate custom sections
    if (data?.customSections) {
      const sectionValidation = validateCustomSectionNames(data.customSections);
      if (!sectionValidation.valid) {
        return sendErrorResponse(
          res,
          ErrorCodes.DUPLICATE_SECTION_NAMES,
          sectionValidation.error
        );
      }
    }
    
    // ✅ Check resume limit
    const existingResumes = await retryDatabaseOperation(
      async () => await prisma.baseResume.count({
        where: { userId: req.user.id }
      })
    );
    
    const maxResumes = req.user.plan === 'free' ? 3 : 10;
    if (existingResumes >= maxResumes) {
      return sendErrorResponse(
        res,
        ErrorCodes.SLOT_LIMIT_REACHED,
        `You have reached your maximum of ${maxResumes} resumes. Please upgrade your plan.`
      );
    }
    
    // ✅ Create resume with retry logic
    const resume = await retryDatabaseOperation(
      async () => await prisma.baseResume.create({
        data: {
          userId: req.user.id,
          name: name || 'Untitled Resume',
          data,
          formatting,
          metadata
        }
      })
    );
    
    res.json({
      success: true,
      resume
    });
  })
);

/**
 * ============================================================================
 * EXAMPLE 2: Update Resume with Validation
 * ============================================================================
 */
router.put('/resumes/:id',
  validateRequest(UpdateResumePayloadSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.validatedBody;
    
    // ✅ Verify ownership with retry
    const resume = await retryDatabaseOperation(
      async () => await prisma.baseResume.findFirst({
        where: { id, userId: req.user.id }
      })
    );
    
    if (!resume) {
      return sendErrorResponse(res, ErrorCodes.RESUME_NOT_FOUND);
    }
    
    // ✅ Validate template ID if being updated
    if (updates.metadata?.templateId) {
      const templateValidation = validateTemplateId(updates.metadata.templateId);
      if (!templateValidation.valid) {
        return sendErrorResponse(
          res,
          ErrorCodes.INVALID_TEMPLATE_ID,
          templateValidation.error
        );
      }
    }
    
    // ✅ Update with retry
    const updatedResume = await retryDatabaseOperation(
      async () => await prisma.baseResume.update({
        where: { id },
        data: updates
      })
    );
    
    // ✅ Invalidate cache gracefully
    try {
      await executeWithRedisBreaker(
        async () => await redis.del(`resume:${id}`)
      );
    } catch (error) {
      handleCacheError(error, 'invalidate resume cache');
      // Continue without caching
    }
    
    res.json({
      success: true,
      resume: updatedResume
    });
  })
);

/**
 * ============================================================================
 * EXAMPLE 3: AI Operation with Circuit Breaker, Retry, and DLQ
 * ============================================================================
 */
router.post('/resumes/:id/tailor',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { jobDescription } = req.body;
    
    // Get resume
    const resume = await retryDatabaseOperation(
      async () => await prisma.baseResume.findFirst({
        where: { id, userId: req.user.id }
      })
    );
    
    if (!resume) {
      return sendErrorResponse(res, ErrorCodes.RESUME_NOT_FOUND);
    }
    
    try {
      // ✅ Execute with circuit breaker and retry
      const result = await executeWithOpenAIBreaker(
        async () => await retryLLMOperation(
          async () => {
            // Call OpenAI API
            const tailoredData = await tailorResumeWithAI(
              resume.data,
              jobDescription
            );
            return tailoredData;
          }
        ),
        // ✅ Fallback: return cached result
        async () => {
          console.log('Using cached tailoring result');
          const cached = await getCachedTailoredResume(id, jobDescription);
          if (cached) return cached;
          throw new Error('No cached result available');
        }
      );
      
      // Save tailored version
      const tailoredVersion = await retryDatabaseOperation(
        async () => await prisma.tailoredVersion.create({
          data: {
            baseResumeId: id,
            data: result,
            jobTitle: extractJobTitle(jobDescription),
            atsScore: result.atsScore
          }
        })
      );
      
      res.json({
        success: true,
        version: tailoredVersion
      });
      
    } catch (error) {
      console.error('Tailoring failed:', error);
      
      // ✅ Add to Dead Letter Queue for manual retry
      await dlq.add({
        userId: req.user.id,
        resumeId: id,
        operationType: DLQOperationType.RESUME_TAILORING,
        payload: {
          resumeData: resume.data,
          jobDescription
        },
        error,
        attemptCount: 3,
        metadata: {
          jobTitle: extractJobTitle(jobDescription)
        }
      });
      
      // Return user-friendly error
      return handleAIServiceError(res, error);
    }
  })
);

/**
 * ============================================================================
 * EXAMPLE 4: Partial Success Handling
 * ============================================================================
 */
router.post('/resumes/:id/tailor-sections',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { jobDescription, sections } = req.body;
    
    const resume = await retryDatabaseOperation(
      async () => await prisma.baseResume.findFirst({
        where: { id, userId: req.user.id }
      })
    );
    
    if (!resume) {
      return sendErrorResponse(res, ErrorCodes.RESUME_NOT_FOUND);
    }
    
    const completedSections = [];
    const failedSections = [];
    
    // Tailor each section
    for (const sectionName of sections) {
      try {
        const tailored = await executeWithOpenAIBreaker(
          async () => await retryLLMOperation(
            async () => await tailorSection(
              resume.data[sectionName],
              jobDescription
            )
          )
        );
        
        completedSections.push({
          name: sectionName,
          data: tailored
        });
        
      } catch (error) {
        console.error(`Failed to tailor section ${sectionName}:`, error);
        failedSections.push({
          name: sectionName,
          error: error.message
        });
      }
    }
    
    // ✅ Handle partial success
    if (completedSections.length > 0 && failedSections.length > 0) {
      const partialResult = await PartialSuccessHandler.handlePartialTailoring(
        resume.data,
        completedSections,
        failedSections
      );
      
      // Save partial result
      await retryDatabaseOperation(
        async () => await prisma.tailoredVersion.create({
          data: {
            baseResumeId: id,
            data: partialResult.data,
            jobTitle: extractJobTitle(jobDescription),
            metadata: {
              partial: true,
              completedSections: partialResult.completedSections,
              failedSections: partialResult.failedSections
            }
          }
        })
      );
      
      return res.json(partialResult);
    }
    
    // All failed
    if (completedSections.length === 0) {
      return sendErrorResponse(
        res,
        ErrorCodes.AI_SERVICE_ERROR,
        'Failed to tailor any sections'
      );
    }
    
    // All succeeded
    res.json({
      success: true,
      data: completedSections
    });
  })
);

/**
 * ============================================================================
 * EXAMPLE 5: Export with Validation
 * ============================================================================
 */
router.post('/resumes/:id/export',
  validateRequest(ExportResumePayloadSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format, templateId } = req.validatedBody;
    
    const resume = await retryDatabaseOperation(
      async () => await prisma.baseResume.findFirst({
        where: { id, userId: req.user.id }
      })
    );
    
    if (!resume) {
      return sendErrorResponse(res, ErrorCodes.RESUME_NOT_FOUND);
    }
    
    // ✅ Validate template ID if provided
    if (templateId) {
      const templateValidation = validateTemplateId(templateId);
      if (!templateValidation.valid) {
        return sendErrorResponse(
          res,
          ErrorCodes.INVALID_TEMPLATE_ID,
          templateValidation.error
        );
      }
    }
    
    try {
      // Export resume
      const exportResult = await exportResume({
        resume: resume.data,
        format,
        templateId: templateId || resume.metadata?.templateId,
        formatting: resume.formatting
      });
      
      res.json({
        success: true,
        fileUrl: exportResult.fileUrl,
        fileName: exportResult.fileName
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      return sendErrorResponse(
        res,
        ErrorCodes.EXPORT_FAILED,
        'Failed to export resume. Please try again.'
      );
    }
  })
);

/**
 * ============================================================================
 * EXAMPLE 6: Admin Endpoint - DLQ Management
 * ============================================================================
 */
router.get('/admin/dlq/stats',
  asyncHandler(async (req, res) => {
    const stats = await dlq.getStats();
    res.json({
      success: true,
      stats
    });
  })
);

router.get('/admin/dlq/pending',
  asyncHandler(async (req, res) => {
    const pending = await dlq.getPending(100);
    res.json({
      success: true,
      entries: pending
    });
  })
);

router.post('/admin/dlq/:entryId/retry',
  asyncHandler(async (req, res) => {
    const { entryId } = req.params;
    
    const result = await dlq.retry(entryId, async (payload) => {
      // Retry the operation based on type
      if (payload.operationType === DLQOperationType.RESUME_TAILORING) {
        return await tailorResumeWithAI(
          payload.resumeData,
          payload.jobDescription
        );
      }
      throw new Error('Unknown operation type');
    });
    
    res.json(result);
  })
);

/**
 * ============================================================================
 * EXAMPLE 7: Health Check with Circuit Breaker Status
 * ============================================================================
 */
router.get('/health',
  asyncHandler(async (req, res) => {
    const { circuitBreakerManager } = require('./utils/circuitBreaker');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      circuitBreakers: circuitBreakerManager.getAllStates()
    };
    
    // Check if any circuit is open
    const hasOpenCircuit = Object.values(health.circuitBreakers)
      .some(breaker => breaker.isOpen);
    
    if (hasOpenCircuit) {
      health.status = 'degraded';
    }
    
    res.json(health);
  })
);

module.exports = router;

/**
 * ============================================================================
 * HELPER FUNCTIONS (implement these based on your actual services)
 * ============================================================================
 */

async function tailorResumeWithAI(resumeData, jobDescription) {
  // Your OpenAI implementation
  throw new Error('Not implemented');
}

async function tailorSection(sectionData, jobDescription) {
  // Your OpenAI implementation
  throw new Error('Not implemented');
}

async function getCachedTailoredResume(resumeId, jobDescription) {
  // Your cache implementation
  return null;
}

async function exportResume(options) {
  // Your export implementation
  throw new Error('Not implemented');
}

function extractJobTitle(jobDescription) {
  // Extract job title from description
  return 'Job Title';
}

