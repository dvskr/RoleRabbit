/**
 * Template Bulk Operations Service
 * Handles batch operations on multiple templates
 *
 * Operations:
 * - Bulk status update (activate/deactivate)
 * - Bulk delete
 * - Bulk category change
 * - Bulk tag management
 * - Bulk export
 * - Bulk approval
 * - Bulk rating management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Perform bulk operation on templates
 */
async function bulkOperation(operation, templateIds, userId, options = {}) {
  try {
    // Validate input
    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      throw new Error('Template IDs array is required');
    }

    if (templateIds.length > 100) {
      throw new Error('Maximum 100 templates can be processed at once');
    }

    // Verify user has permission for templates
    const hasPermission = await verifyBulkPermission(templateIds, userId, operation);
    if (!hasPermission.allowed) {
      throw new Error(hasPermission.reason);
    }

    let result;

    switch (operation) {
      case 'activate':
        result = await bulkActivate(templateIds, userId);
        break;
      case 'deactivate':
        result = await bulkDeactivate(templateIds, userId);
        break;
      case 'delete':
        result = await bulkDelete(templateIds, userId, options.soft || true);
        break;
      case 'updateCategory':
        result = await bulkUpdateCategory(templateIds, userId, options.category);
        break;
      case 'addTags':
        result = await bulkAddTags(templateIds, userId, options.tags);
        break;
      case 'removeTags':
        result = await bulkRemoveTags(templateIds, userId, options.tags);
        break;
      case 'updateDifficulty':
        result = await bulkUpdateDifficulty(templateIds, userId, options.difficulty);
        break;
      case 'setPremium':
        result = await bulkSetPremium(templateIds, userId, options.isPremium);
        break;
      case 'approve':
        result = await bulkApprove(templateIds, userId);
        break;
      case 'reject':
        result = await bulkReject(templateIds, userId, options.reason);
        break;
      case 'export':
        result = await bulkExport(templateIds, userId, options.format);
        break;
      default:
        throw new Error(`Unknown bulk operation: ${operation}`);
    }

    // Log bulk operation
    await logBulkOperation(operation, templateIds, userId, result);

    return {
      success: true,
      operation,
      processedCount: result.processedCount || templateIds.length,
      ...result,
    };
  } catch (error) {
    console.error('Error in bulk operation:', error);
    throw error;
  }
}

/**
 * Bulk activate templates
 */
async function bulkActivate(templateIds, userId) {
  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
      authorId: userId,
    },
    data: {
      isActive: true,
    },
  });

  return {
    processedCount: result.count,
    message: `${result.count} templates activated`,
  };
}

/**
 * Bulk deactivate templates
 */
async function bulkDeactivate(templateIds, userId) {
  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
      authorId: userId,
    },
    data: {
      isActive: false,
    },
  });

  return {
    processedCount: result.count,
    message: `${result.count} templates deactivated`,
  };
}

/**
 * Bulk delete templates
 */
async function bulkDelete(templateIds, userId, soft = true) {
  if (soft) {
    // Soft delete - mark as deleted
    const result = await prisma.resumeTemplate.updateMany({
      where: {
        id: { in: templateIds },
        authorId: userId,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return {
      processedCount: result.count,
      message: `${result.count} templates marked as deleted`,
    };
  } else {
    // Hard delete
    const result = await prisma.resumeTemplate.deleteMany({
      where: {
        id: { in: templateIds },
        authorId: userId,
      },
    });

    return {
      processedCount: result.count,
      message: `${result.count} templates permanently deleted`,
    };
  }
}

/**
 * Bulk update category
 */
async function bulkUpdateCategory(templateIds, userId, newCategory) {
  const validCategories = ['ATS', 'CREATIVE', 'MODERN', 'MINIMAL', 'EXECUTIVE', 'ACADEMIC', 'TECHNICAL'];

  if (!validCategories.includes(newCategory)) {
    throw new Error(`Invalid category: ${newCategory}`);
  }

  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
      authorId: userId,
    },
    data: {
      category: newCategory,
    },
  });

  return {
    processedCount: result.count,
    message: `${result.count} templates updated to category ${newCategory}`,
  };
}

/**
 * Bulk add tags
 */
async function bulkAddTags(templateIds, userId, tagsToAdd) {
  if (!Array.isArray(tagsToAdd) || tagsToAdd.length === 0) {
    throw new Error('Tags array is required');
  }

  let processedCount = 0;

  for (const templateId of templateIds) {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (template && template.authorId === userId) {
      const existingTags = template.tags || [];
      const newTags = [...new Set([...existingTags, ...tagsToAdd])];

      await prisma.resumeTemplate.update({
        where: { id: templateId },
        data: { tags: newTags },
      });

      processedCount++;
    }
  }

  return {
    processedCount,
    message: `Tags added to ${processedCount} templates`,
  };
}

/**
 * Bulk remove tags
 */
async function bulkRemoveTags(templateIds, userId, tagsToRemove) {
  if (!Array.isArray(tagsToRemove) || tagsToRemove.length === 0) {
    throw new Error('Tags array is required');
  }

  let processedCount = 0;

  for (const templateId of templateIds) {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (template && template.authorId === userId) {
      const existingTags = template.tags || [];
      const newTags = existingTags.filter((tag) => !tagsToRemove.includes(tag));

      await prisma.resumeTemplate.update({
        where: { id: templateId },
        data: { tags: newTags },
      });

      processedCount++;
    }
  }

  return {
    processedCount,
    message: `Tags removed from ${processedCount} templates`,
  };
}

/**
 * Bulk update difficulty
 */
async function bulkUpdateDifficulty(templateIds, userId, newDifficulty) {
  const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  if (!validDifficulties.includes(newDifficulty)) {
    throw new Error(`Invalid difficulty: ${newDifficulty}`);
  }

  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
      authorId: userId,
    },
    data: {
      difficulty: newDifficulty,
    },
  });

  return {
    processedCount: result.count,
    message: `${result.count} templates updated to difficulty ${newDifficulty}`,
  };
}

/**
 * Bulk set premium status
 */
async function bulkSetPremium(templateIds, userId, isPremium) {
  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
      authorId: userId,
    },
    data: {
      isPremium: isPremium === true || isPremium === 'true',
    },
  });

  return {
    processedCount: result.count,
    message: `${result.count} templates marked as ${isPremium ? 'premium' : 'free'}`,
  };
}

/**
 * Bulk approve templates (admin only)
 */
async function bulkApprove(templateIds, userId) {
  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
    },
    data: {
      approvalStatus: 'APPROVED',
      isApproved: true,
      isActive: true,
      approvedAt: new Date(),
      approvedBy: userId,
    },
  });

  // Create approval workflow records
  for (const templateId of templateIds) {
    await prisma.templateApprovalWorkflow.create({
      data: {
        templateId,
        status: 'APPROVED',
        reviewerId: userId,
        reviewCompletedAt: new Date(),
        reviewComments: 'Bulk approved',
      },
    });
  }

  return {
    processedCount: result.count,
    message: `${result.count} templates approved`,
  };
}

/**
 * Bulk reject templates (admin only)
 */
async function bulkReject(templateIds, userId, reason) {
  const result = await prisma.resumeTemplate.updateMany({
    where: {
      id: { in: templateIds },
    },
    data: {
      approvalStatus: 'REJECTED',
      isApproved: false,
      isActive: false,
    },
  });

  // Create approval workflow records
  for (const templateId of templateIds) {
    await prisma.templateApprovalWorkflow.create({
      data: {
        templateId,
        status: 'REJECTED',
        reviewerId: userId,
        reviewCompletedAt: new Date(),
        reviewComments: reason || 'Bulk rejected',
      },
    });
  }

  return {
    processedCount: result.count,
    message: `${result.count} templates rejected`,
  };
}

/**
 * Bulk export templates
 */
async function bulkExport(templateIds, userId, format = 'JSON') {
  const templates = await prisma.resumeTemplate.findMany({
    where: {
      id: { in: templateIds },
    },
  });

  const exportData = templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    difficulty: template.difficulty,
    features: template.features,
    tags: template.tags,
    rating: template.rating,
    downloads: template.downloads,
  }));

  const filename = `templates-export-${Date.now()}.${format.toLowerCase()}`;
  const buffer = Buffer.from(JSON.stringify(exportData, null, 2), 'utf8');

  return {
    processedCount: templates.length,
    filename,
    buffer,
    mimeType: 'application/json',
    message: `Exported ${templates.length} templates`,
  };
}

/**
 * Verify user has permission for bulk operation
 */
async function verifyBulkPermission(templateIds, userId, operation) {
  try {
    // Admin operations
    const adminOperations = ['approve', 'reject'];

    if (adminOperations.includes(operation)) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.role !== 'ADMIN') {
        return {
          allowed: false,
          reason: 'Admin permission required for this operation',
        };
      }

      return { allowed: true };
    }

    // Check if user owns all templates
    const templates = await prisma.resumeTemplate.findMany({
      where: {
        id: { in: templateIds },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    const unauthorizedTemplates = templates.filter((t) => t.authorId !== userId);

    if (unauthorizedTemplates.length > 0) {
      return {
        allowed: false,
        reason: `You do not have permission to modify ${unauthorizedTemplates.length} template(s)`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error verifying bulk permission:', error);
    return {
      allowed: false,
      reason: 'Error verifying permissions',
    };
  }
}

/**
 * Log bulk operation
 */
async function logBulkOperation(operation, templateIds, userId, result) {
  try {
    await prisma.bulkOperationLog.create({
      data: {
        operation,
        templateIds,
        userId,
        processedCount: result.processedCount || 0,
        status: 'SUCCESS',
        executedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error logging bulk operation:', error);
  }
}

/**
 * Get bulk operation history
 */
async function getBulkOperationHistory(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const [operations, total] = await Promise.all([
      prisma.bulkOperationLog.findMany({
        where: { userId },
        orderBy: { executedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.bulkOperationLog.count({ where: { userId } }),
    ]);

    return {
      operations,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching bulk operation history:', error);
    throw error;
  }
}

module.exports = {
  bulkOperation,
  getBulkOperationHistory,
};
