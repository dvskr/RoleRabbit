const { prisma } = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Working Draft Service
 * 
 * Manages temporary working drafts for resume editing.
 * Drafts are auto-saved but NOT committed to the base resume until user explicitly saves.
 * 
 * Key Features:
 * - Auto-save to draft (doesn't overwrite base)
 * - Transparent to ATS/Tailoring (they use draft if exists)
 * - Commit to base (user explicitly saves)
 * - Discard draft (revert to base)
 */

/**
 * Get the current resume data (draft OR base)
 * This is used by ATS/Tailoring to transparently use draft if it exists.
 * 
 * @param {string} baseResumeId - Base resume ID
 * @returns {Promise<{data: object, formatting: object, metadata: object, isDraft: boolean}>}
 */
async function getCurrentResumeData(baseResumeId) {
  try {
    const baseResume = await prisma.baseResume.findUnique({
      where: { id: baseResumeId },
      include: {
        workingDraft: true
      }
    });

    if (!baseResume) {
      throw new Error('Base resume not found');
    }

    // If draft exists, return draft data
    if (baseResume.workingDraft) {
      logger.debug('Using working draft for resume data', {
        baseResumeId,
        draftId: baseResume.workingDraft.id,
        draftUpdatedAt: baseResume.workingDraft.updatedAt
      });

      return {
        data: baseResume.workingDraft.data,
        formatting: baseResume.workingDraft.formatting || {},
        metadata: baseResume.workingDraft.metadata || {},
        isDraft: true,
        draftUpdatedAt: baseResume.workingDraft.updatedAt,
        baseUpdatedAt: baseResume.updatedAt
      };
    }

    // No draft, return base data
    logger.debug('Using base resume data (no draft)', {
      baseResumeId,
      baseUpdatedAt: baseResume.updatedAt
    });

    return {
      data: baseResume.data,
      formatting: baseResume.formatting || {},
      metadata: baseResume.metadata || {},
      isDraft: false,
      baseUpdatedAt: baseResume.updatedAt
    };
  } catch (error) {
    logger.error('Failed to get current resume data', {
      baseResumeId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Save or update working draft (auto-save)
 * This is called by the frontend auto-save mechanism.
 * 
 * @param {object} params - Parameters object
 * @param {string} params.userId - User ID (optional, for logging)
 * @param {string} params.baseResumeId - Base resume ID
 * @param {object} params.data - Resume data
 * @param {object} params.formatting - Formatting options
 * @param {object} params.metadata - Metadata
 * @returns {Promise<object>} Updated or created draft
 */
async function saveWorkingDraft({ userId, baseResumeId, data, formatting, metadata }) {
  try {
    // Support both old signature (baseResumeId, { data, ... }) and new signature ({ baseResumeId, data, ... })
    // If userId is a string that starts with 'cm' (CUID) and baseResumeId is undefined, it's the old signature
    if (typeof userId === 'string' && userId.startsWith('cm') && !baseResumeId && typeof data === 'object') {
      // Old signature: saveWorkingDraft(baseResumeId, { data, formatting, metadata })
      baseResumeId = userId;
      userId = undefined;
    }
    
    if (!baseResumeId) {
      // Silently ignore auto-save attempts without baseResumeId (stale frontend state)
      logger.debug('saveWorkingDraft called without baseResumeId (ignoring)', { userId });
      return null;
    }
    
    // Verify base resume exists
    let baseResume;
    try {
      baseResume = await prisma.baseResume.findUnique({
        where: { id: baseResumeId }
      });
    } catch (prismaError) {
      // Silently handle Prisma errors (e.g., invalid ID format)
      logger.debug('Prisma error when checking base resume', { baseResumeId, error: prismaError.message });
      return null;
    }

    if (!baseResume) {
      // Silently fail if resume doesn't exist (likely deleted or stale frontend state)
      logger.debug('Cannot save draft - base resume not found (likely deleted)', { baseResumeId, userId });
      return null;
    }

    // Upsert draft (create or update)
    const draft = await prisma.workingDraft.upsert({
      where: { baseResumeId },
      create: {
        baseResumeId,
        data,
        formatting: formatting || {},
        metadata: metadata || {}
      },
      update: {
        data,
        formatting: formatting || {},
        metadata: metadata || {},
        updatedAt: new Date()
      }
    });

    if (!draft) {
      logger.debug('Draft upsert returned null', { baseResumeId });
      return null;
    }

    logger.info('Working draft saved', {
      baseResumeId,
      draftId: draft.id,
      isNew: !draft.updatedAt || draft.createdAt === draft.updatedAt
    });

    return draft;
  } catch (error) {
    // Silently handle errors for deleted/stale resumes (auto-save will retry)
    // Changed to debug level to avoid log spam - v2 10:25
    logger.debug('Failed to save working draft (likely deleted resume)', {
      baseResumeId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    // Don't throw - just log and return null
    return null;
  }
}

/**
 * Commit draft to base resume (explicit user save)
 * This overwrites the base resume with the draft data.
 * 
 * @param {string} baseResumeId - Base resume ID
 * @returns {Promise<object>} Updated base resume
 */
async function commitDraftToBase(baseResumeId) {
  try {
    const baseResume = await prisma.baseResume.findUnique({
      where: { id: baseResumeId },
      include: {
        workingDraft: true
      }
    });

    if (!baseResume) {
      throw new Error('Base resume not found');
    }

    if (!baseResume.workingDraft) {
      logger.warn('No draft to commit', { baseResumeId });
      return baseResume;
    }

    // Copy draft data to base
    const updatedBase = await prisma.baseResume.update({
      where: { id: baseResumeId },
      data: {
        data: baseResume.workingDraft.data,
        formatting: baseResume.workingDraft.formatting,
        metadata: baseResume.workingDraft.metadata,
        updatedAt: new Date()
      }
    });

    // Delete draft after commit
    await prisma.workingDraft.delete({
      where: { baseResumeId }
    });

    logger.info('Draft committed to base resume', {
      baseResumeId,
      draftId: baseResume.workingDraft.id
    });

    return updatedBase;
  } catch (error) {
    logger.error('Failed to commit draft to base', {
      baseResumeId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Discard working draft (revert to base)
 * This deletes the draft without affecting the base resume.
 * 
 * @param {string} baseResumeId - Base resume ID
 * @returns {Promise<object>} Base resume
 */
async function discardWorkingDraft(baseResumeId) {
  try {
    const baseResume = await prisma.baseResume.findUnique({
      where: { id: baseResumeId },
      include: {
        workingDraft: true
      }
    });

    if (!baseResume) {
      throw new Error('Base resume not found');
    }

    if (!baseResume.workingDraft) {
      logger.warn('No draft to discard', { baseResumeId });
      return baseResume;
    }

    // Delete draft
    await prisma.workingDraft.delete({
      where: { baseResumeId }
    });

    logger.info('Working draft discarded', {
      baseResumeId,
      draftId: baseResume.workingDraft.id
    });

    return baseResume;
  } catch (error) {
    logger.error('Failed to discard working draft', {
      baseResumeId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Check if a draft exists for a base resume
 * 
 * @param {string} baseResumeId - Base resume ID
 * @returns {Promise<boolean>}
 */
async function hasDraft(baseResumeId) {
  try {
    const draft = await prisma.workingDraft.findUnique({
      where: { baseResumeId }
    });

    return !!draft;
  } catch (error) {
    logger.error('Failed to check draft existence', {
      baseResumeId,
      error: error.message
    });
    return false;
  }
}

/**
 * Get draft status for a base resume
 * 
 * @param {string} baseResumeId - Base resume ID
 * @returns {Promise<{hasDraft: boolean, draftUpdatedAt: Date|null, baseUpdatedAt: Date|null}>}
 */
async function getDraftStatus(baseResumeId) {
  try {
    const baseResume = await prisma.baseResume.findUnique({
      where: { id: baseResumeId },
      include: {
        workingDraft: true
      }
    });

    // If resume doesn't exist, return default status instead of throwing
    if (!baseResume) {
      logger.debug('Resume not found for draft status check', { baseResumeId });
      return {
        hasDraft: false,
        draftUpdatedAt: null,
        baseUpdatedAt: null
      };
    }

    return {
      hasDraft: !!baseResume.workingDraft,
      draftUpdatedAt: baseResume.workingDraft?.updatedAt || null,
      baseUpdatedAt: baseResume.updatedAt
    };
  } catch (error) {
    logger.error('Failed to get draft status', {
      baseResumeId,
      error: error.message
    });
    // Return default status instead of throwing
    return {
      hasDraft: false,
      draftUpdatedAt: null,
      baseUpdatedAt: null
    };
  }
}

module.exports = {
  getCurrentResumeData,
  saveWorkingDraft,
  commitDraftToBase,
  discardWorkingDraft,
  hasDraft,
  getDraftStatus
};

