/**
 * Template Approval Workflow Service
 * Manages the approval process for user-submitted templates
 *
 * Features:
 * - Multi-stage approval workflow
 * - Automated quality checks
 * - Reviewer assignment
 * - Approval/rejection with feedback
 * - Appeal process
 * - Notification system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Approval statuses
const APPROVAL_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  APPEALED: 'APPEALED',
  ARCHIVED: 'ARCHIVED',
};

// Review stages
const REVIEW_STAGES = {
  AUTOMATED_CHECK: 'AUTOMATED_CHECK',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  CONTENT_REVIEW: 'CONTENT_REVIEW',
  FINAL_APPROVAL: 'FINAL_APPROVAL',
};

// Quality check criteria
const QUALITY_CRITERIA = {
  MIN_DIMENSIONS: { width: 800, height: 1132 },
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  REQUIRED_FIELDS: ['name', 'description', 'category', 'difficulty', 'preview'],
  MIN_DESCRIPTION_LENGTH: 50,
  ALLOWED_FORMATS: ['PNG', 'JPG', 'JPEG', 'PDF'],
  PROHIBITED_CONTENT: ['viagra', 'casino', 'gambling', 'xxx'],
};

/**
 * Submit template for approval
 */
async function submitTemplateForApproval(templateId, userId) {
  try {
    // Verify ownership
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      include: { author: true },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.authorId !== userId) {
      throw new Error('You do not have permission to submit this template');
    }

    if (template.approvalStatus === APPROVAL_STATUS.APPROVED) {
      throw new Error('Template is already approved');
    }

    // Run automated quality checks
    const qualityCheck = await runAutomatedQualityCheck(template);

    if (!qualityCheck.passed) {
      return {
        success: false,
        status: APPROVAL_STATUS.DRAFT,
        errors: qualityCheck.errors,
        message: 'Template failed automated quality checks. Please fix the issues and resubmit.',
      };
    }

    // Create approval workflow record
    const workflow = await prisma.templateApprovalWorkflow.create({
      data: {
        templateId,
        status: APPROVAL_STATUS.SUBMITTED,
        currentStage: REVIEW_STAGES.AUTOMATED_CHECK,
        submittedAt: new Date(),
        submittedBy: userId,
        automatedCheckResults: qualityCheck,
      },
    });

    // Update template status
    await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        approvalStatus: APPROVAL_STATUS.SUBMITTED,
        isActive: false,
      },
    });

    // Assign to reviewer
    await assignReviewer(workflow.id);

    // Create notification for admins
    await createApprovalNotification(templateId, 'SUBMISSION', userId);

    return {
      success: true,
      status: APPROVAL_STATUS.SUBMITTED,
      workflowId: workflow.id,
      message: 'Template submitted for approval successfully',
    };
  } catch (error) {
    console.error('Error submitting template for approval:', error);
    throw error;
  }
}

/**
 * Run automated quality checks
 */
async function runAutomatedQualityCheck(template) {
  const errors = [];
  const warnings = [];

  // Check required fields
  QUALITY_CRITERIA.REQUIRED_FIELDS.forEach((field) => {
    if (!template[field] || template[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check description length
  if (template.description && template.description.length < QUALITY_CRITERIA.MIN_DESCRIPTION_LENGTH) {
    errors.push(
      `Description too short (${template.description.length} chars). Minimum ${QUALITY_CRITERIA.MIN_DESCRIPTION_LENGTH} chars required.`
    );
  }

  // Check for prohibited content
  const contentToCheck = `${template.name} ${template.description} ${template.tags?.join(' ')}`.toLowerCase();
  QUALITY_CRITERIA.PROHIBITED_CONTENT.forEach((term) => {
    if (contentToCheck.includes(term)) {
      errors.push(`Prohibited content detected: ${term}`);
    }
  });

  // Check category validity
  const validCategories = ['ATS', 'CREATIVE', 'MODERN', 'MINIMAL', 'EXECUTIVE', 'ACADEMIC', 'TECHNICAL'];
  if (template.category && !validCategories.includes(template.category)) {
    errors.push(`Invalid category: ${template.category}`);
  }

  // Check features array
  if (!template.features || template.features.length === 0) {
    warnings.push('No features specified. Add features to improve discoverability.');
  }

  // Check tags array
  if (!template.tags || template.tags.length === 0) {
    warnings.push('No tags specified. Add tags to improve searchability.');
  }

  // Check preview URL
  if (template.preview && !isValidURL(template.preview)) {
    errors.push('Invalid preview URL format');
  }

  const passed = errors.length === 0;

  return {
    passed,
    errors,
    warnings,
    checkedAt: new Date(),
    criteria: QUALITY_CRITERIA,
  };
}

/**
 * Assign reviewer to workflow
 */
async function assignReviewer(workflowId) {
  try {
    // Find available reviewers (admins with least active reviews)
    const reviewers = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true,
      },
      include: {
        _count: {
          select: {
            assignedReviews: {
              where: {
                status: {
                  in: [APPROVAL_STATUS.IN_REVIEW, APPROVAL_STATUS.SUBMITTED],
                },
              },
            },
          },
        },
      },
      orderBy: {
        assignedReviews: {
          _count: 'asc',
        },
      },
      take: 1,
    });

    if (reviewers.length === 0) {
      console.warn('No reviewers available');
      return null;
    }

    const reviewer = reviewers[0];

    // Assign reviewer
    await prisma.templateApprovalWorkflow.update({
      where: { id: workflowId },
      data: {
        reviewerId: reviewer.id,
        status: APPROVAL_STATUS.IN_REVIEW,
        currentStage: REVIEW_STAGES.QUALITY_REVIEW,
        reviewStartedAt: new Date(),
      },
    });

    // Notify reviewer
    await createApprovalNotification(workflowId, 'ASSIGNED', reviewer.id);

    return reviewer;
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    return null;
  }
}

/**
 * Review template - approve, reject, or request changes
 */
async function reviewTemplate(workflowId, reviewerId, decision, feedback = {}) {
  try {
    const workflow = await prisma.templateApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        template: true,
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.reviewerId !== reviewerId) {
      throw new Error('You are not assigned to review this template');
    }

    const { action, comments, rating, suggestions } = feedback;

    // Validate action
    if (!['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(action)) {
      throw new Error('Invalid review action');
    }

    let newStatus;
    let templateUpdate = {};

    if (action === 'APPROVE') {
      newStatus = APPROVAL_STATUS.APPROVED;
      templateUpdate = {
        approvalStatus: APPROVAL_STATUS.APPROVED,
        isActive: true,
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: reviewerId,
      };
    } else if (action === 'REJECT') {
      newStatus = APPROVAL_STATUS.REJECTED;
      templateUpdate = {
        approvalStatus: APPROVAL_STATUS.REJECTED,
        isActive: false,
        isApproved: false,
      };
    } else if (action === 'REQUEST_CHANGES') {
      newStatus = APPROVAL_STATUS.CHANGES_REQUESTED;
      templateUpdate = {
        approvalStatus: APPROVAL_STATUS.CHANGES_REQUESTED,
        isActive: false,
      };
    }

    // Update workflow
    await prisma.templateApprovalWorkflow.update({
      where: { id: workflowId },
      data: {
        status: newStatus,
        reviewCompletedAt: new Date(),
        reviewComments: comments,
        reviewRating: rating,
        reviewSuggestions: suggestions,
      },
    });

    // Update template
    await prisma.resumeTemplate.update({
      where: { id: workflow.templateId },
      data: templateUpdate,
    });

    // Create review history record
    await prisma.templateReviewHistory.create({
      data: {
        templateId: workflow.templateId,
        workflowId,
        reviewerId,
        action,
        comments,
        rating,
        suggestions,
        reviewedAt: new Date(),
      },
    });

    // Notify template author
    await createApprovalNotification(
      workflow.templateId,
      action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'CHANGES_REQUESTED',
      workflow.template.authorId,
      { comments, suggestions }
    );

    return {
      success: true,
      status: newStatus,
      message: `Template ${action.toLowerCase().replace('_', ' ')} successfully`,
    };
  } catch (error) {
    console.error('Error reviewing template:', error);
    throw error;
  }
}

/**
 * Request changes to template
 */
async function requestChanges(workflowId, reviewerId, changes) {
  return reviewTemplate(workflowId, reviewerId, 'decision', {
    action: 'REQUEST_CHANGES',
    comments: changes.comments,
    suggestions: changes.suggestions,
  });
}

/**
 * Appeal rejection
 */
async function appealRejection(templateId, userId, appealReason) {
  try {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      include: {
        approvalWorkflows: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.authorId !== userId) {
      throw new Error('You do not have permission to appeal this template');
    }

    if (template.approvalStatus !== APPROVAL_STATUS.REJECTED) {
      throw new Error('Only rejected templates can be appealed');
    }

    const lastWorkflow = template.approvalWorkflows[0];

    // Create appeal record
    await prisma.templateAppeal.create({
      data: {
        templateId,
        workflowId: lastWorkflow.id,
        userId,
        reason: appealReason,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    // Update workflow status
    await prisma.templateApprovalWorkflow.update({
      where: { id: lastWorkflow.id },
      data: {
        status: APPROVAL_STATUS.APPEALED,
      },
    });

    // Update template
    await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        approvalStatus: APPROVAL_STATUS.APPEALED,
      },
    });

    // Notify admins
    await createApprovalNotification(templateId, 'APPEAL', null);

    return {
      success: true,
      message: 'Appeal submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting appeal:', error);
    throw error;
  }
}

/**
 * Get workflow status
 */
async function getWorkflowStatus(templateId) {
  try {
    const workflows = await prisma.templateApprovalWorkflow.findMany({
      where: { templateId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewHistory: {
          orderBy: { reviewedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workflows;
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    throw error;
  }
}

/**
 * Get pending reviews for reviewer
 */
async function getPendingReviews(reviewerId) {
  try {
    const reviews = await prisma.templateApprovalWorkflow.findMany({
      where: {
        reviewerId,
        status: {
          in: [APPROVAL_STATUS.IN_REVIEW, APPROVAL_STATUS.SUBMITTED],
        },
      },
      include: {
        template: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    throw error;
  }
}

/**
 * Get approval statistics
 */
async function getApprovalStatistics() {
  try {
    const [total, approved, rejected, pending, changesRequested] = await Promise.all([
      prisma.templateApprovalWorkflow.count(),
      prisma.templateApprovalWorkflow.count({
        where: { status: APPROVAL_STATUS.APPROVED },
      }),
      prisma.templateApprovalWorkflow.count({
        where: { status: APPROVAL_STATUS.REJECTED },
      }),
      prisma.templateApprovalWorkflow.count({
        where: { status: { in: [APPROVAL_STATUS.SUBMITTED, APPROVAL_STATUS.IN_REVIEW] } },
      }),
      prisma.templateApprovalWorkflow.count({
        where: { status: APPROVAL_STATUS.CHANGES_REQUESTED },
      }),
    ]);

    // Average review time
    const completedReviews = await prisma.templateApprovalWorkflow.findMany({
      where: {
        status: { in: [APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED] },
        reviewCompletedAt: { not: null },
        submittedAt: { not: null },
      },
      select: {
        submittedAt: true,
        reviewCompletedAt: true,
      },
    });

    let avgReviewTime = 0;
    if (completedReviews.length > 0) {
      const totalTime = completedReviews.reduce((sum, review) => {
        const diff = review.reviewCompletedAt - review.submittedAt;
        return sum + diff;
      }, 0);
      avgReviewTime = totalTime / completedReviews.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      total,
      approved,
      rejected,
      pending,
      changesRequested,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
      averageReviewTimeHours: avgReviewTime.toFixed(2),
    };
  } catch (error) {
    console.error('Error fetching approval statistics:', error);
    throw error;
  }
}

/**
 * Create notification for approval workflow
 */
async function createApprovalNotification(targetId, type, userId, metadata = {}) {
  try {
    // This would integrate with your notification system
    console.log(`Creating notification: ${type} for user ${userId}`);

    // Example notification creation
    await prisma.notification.create({
      data: {
        userId,
        type: `TEMPLATE_${type}`,
        title: getNotificationTitle(type),
        message: getNotificationMessage(type, metadata),
        relatedId: targetId,
        relatedType: 'TEMPLATE',
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Helper: Get notification title
 */
function getNotificationTitle(type) {
  const titles = {
    SUBMISSION: 'New Template Submitted',
    ASSIGNED: 'Template Review Assigned',
    APPROVED: 'Template Approved',
    REJECTED: 'Template Rejected',
    CHANGES_REQUESTED: 'Changes Requested',
    APPEAL: 'Template Appeal Submitted',
  };
  return titles[type] || 'Template Notification';
}

/**
 * Helper: Get notification message
 */
function getNotificationMessage(type, metadata) {
  const messages = {
    SUBMISSION: 'A new template has been submitted for review',
    ASSIGNED: 'You have been assigned a template to review',
    APPROVED: 'Congratulations! Your template has been approved',
    REJECTED: `Your template was rejected. ${metadata.comments || ''}`,
    CHANGES_REQUESTED: `Changes requested for your template. ${metadata.suggestions || ''}`,
    APPEAL: 'A template rejection has been appealed',
  };
  return messages[type] || 'Template status updated';
}

/**
 * Helper: Validate URL
 */
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  APPROVAL_STATUS,
  REVIEW_STAGES,
  QUALITY_CRITERIA,
  submitTemplateForApproval,
  runAutomatedQualityCheck,
  assignReviewer,
  reviewTemplate,
  requestChanges,
  appealRejection,
  getWorkflowStatus,
  getPendingReviews,
  getApprovalStatistics,
};
