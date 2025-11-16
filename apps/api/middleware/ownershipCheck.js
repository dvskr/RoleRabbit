/**
 * Ownership Check Middleware
 * 
 * Ensures users can only access their own resources.
 * Critical security middleware for all resume endpoints.
 */

const { sendErrorResponse, ErrorCodes } = require('../utils/errorHandler');

/**
 * Check resume ownership
 * Verifies that the resume belongs to the authenticated user
 */
async function checkResumeOwnership(prisma, resumeId, userId) {
  const resume = await prisma.baseResume.findUnique({
    where: { id: resumeId },
    select: { id: true, userId: true }
  });

  if (!resume) {
    return { authorized: false, notFound: true };
  }

  if (resume.userId !== userId) {
    return { authorized: false, notFound: false };
  }

  return { authorized: true, resume };
}

/**
 * Check tailored version ownership
 */
async function checkTailoredVersionOwnership(prisma, versionId, userId) {
  const version = await prisma.tailoredVersion.findUnique({
    where: { id: versionId },
    include: {
      baseResume: {
        select: { userId: true }
      }
    }
  });

  if (!version) {
    return { authorized: false, notFound: true };
  }

  if (version.baseResume.userId !== userId) {
    return { authorized: false, notFound: false };
  }

  return { authorized: true, version };
}

/**
 * Middleware: Verify resume ownership from route params
 * 
 * Usage:
 *   router.get('/resumes/:id', verifyResumeOwnership, async (req, res) => {
 *     // req.resume is guaranteed to belong to req.user
 *   });
 */
function verifyResumeOwnership(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const resumeId = req.params[paramName];
      const userId = req.user?.id;

      if (!userId) {
        return sendErrorResponse(res, ErrorCodes.UNAUTHORIZED);
      }

      const { authorized, notFound, resume } = await checkResumeOwnership(
        req.prisma || global.prisma,
        resumeId,
        userId
      );

      if (notFound) {
        return sendErrorResponse(res, ErrorCodes.RESUME_NOT_FOUND);
      }

      if (!authorized) {
        return sendErrorResponse(
          res,
          ErrorCodes.FORBIDDEN,
          'You do not have permission to access this resume'
        );
      }

      // Attach resume to request for use in route handler
      req.resume = resume;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR);
    }
  };
}

/**
 * Middleware: Verify tailored version ownership
 */
function verifyTailoredVersionOwnership(paramName = 'versionId') {
  return async (req, res, next) => {
    try {
      const versionId = req.params[paramName];
      const userId = req.user?.id;

      if (!userId) {
        return sendErrorResponse(res, ErrorCodes.UNAUTHORIZED);
      }

      const { authorized, notFound, version } = await checkTailoredVersionOwnership(
        req.prisma || global.prisma,
        versionId,
        userId
      );

      if (notFound) {
        return sendErrorResponse(
          res,
          ErrorCodes.NOT_FOUND,
          'Version not found'
        );
      }

      if (!authorized) {
        return sendErrorResponse(
          res,
          ErrorCodes.FORBIDDEN,
          'You do not have permission to access this version'
        );
      }

      req.tailoredVersion = version;
      next();
    } catch (error) {
      console.error('Version ownership check error:', error);
      return sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR);
    }
  };
}

/**
 * Middleware: Verify user can create more resumes (slot limit)
 */
function verifyResumeSlotAvailable(maxFreeSlots = 3, maxPremiumSlots = 10) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userPlan = req.user?.plan || 'free';

      if (!userId) {
        return sendErrorResponse(res, ErrorCodes.UNAUTHORIZED);
      }

      const resumeCount = await (req.prisma || global.prisma).baseResume.count({
        where: { userId }
      });

      const maxSlots = userPlan === 'free' ? maxFreeSlots : maxPremiumSlots;

      if (resumeCount >= maxSlots) {
        return sendErrorResponse(
          res,
          ErrorCodes.SLOT_LIMIT_REACHED,
          `You have reached your maximum of ${maxSlots} resumes. Please ${userPlan === 'free' ? 'upgrade your plan' : 'delete an existing resume'} to create more.`,
          { currentCount: resumeCount, maxSlots, plan: userPlan }
        );
      }

      next();
    } catch (error) {
      console.error('Slot check error:', error);
      return sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR);
    }
  };
}

/**
 * Helper: Bulk ownership check
 * Useful for operations on multiple resumes
 */
async function checkBulkResumeOwnership(prisma, resumeIds, userId) {
  const resumes = await prisma.baseResume.findMany({
    where: {
      id: { in: resumeIds },
      userId
    },
    select: { id: true }
  });

  const authorizedIds = resumes.map(r => r.id);
  const unauthorizedIds = resumeIds.filter(id => !authorizedIds.includes(id));

  return {
    authorized: unauthorizedIds.length === 0,
    authorizedIds,
    unauthorizedIds
  };
}

/**
 * Helper: Check if user owns any resume
 */
async function userHasResumes(prisma, userId) {
  const count = await prisma.baseResume.count({
    where: { userId }
  });
  return count > 0;
}

module.exports = {
  checkResumeOwnership,
  checkTailoredVersionOwnership,
  verifyResumeOwnership,
  verifyTailoredVersionOwnership,
  verifyResumeSlotAvailable,
  checkBulkResumeOwnership,
  userHasResumes
};

