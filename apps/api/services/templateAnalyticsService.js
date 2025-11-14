// Template Analytics Service - Track and analyze template usage
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Track template usage action
 * @param {string} userId - User ID
 * @param {string} templateId - Template ID
 * @param {string} action - Action type (PREVIEW, DOWNLOAD, USE, FAVORITE, SHARE)
 * @param {Object} metadata - Additional metadata (jobTitle, company, etc.)
 * @returns {Promise<Object>} Created usage record
 */
async function trackUsage(userId, templateId, action, metadata = {}) {
  try {
    if (!userId || !templateId || !action) {
      throw new Error('User ID, Template ID, and Action are required');
    }

    // Validate action
    const validActions = ['PREVIEW', 'DOWNLOAD', 'USE', 'FAVORITE', 'SHARE'];
    if (!validActions.includes(action.toUpperCase())) {
      throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }

    // Check if template exists
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, name: true }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Create usage record
    const usage = await prisma.templateUsageHistory.create({
      data: {
        userId,
        templateId,
        action: action.toUpperCase(),
        metadata: metadata || {}
      }
    });

    // Increment download count if action is DOWNLOAD or USE
    if (action.toUpperCase() === 'DOWNLOAD' || action.toUpperCase() === 'USE') {
      await prisma.resumeTemplate.update({
        where: { id: templateId },
        data: {
          downloads: {
            increment: 1
          }
        }
      });
    }

    console.log(`📊 Usage tracked: User ${userId} ${action} template ${template.name}`);
    return usage;
  } catch (error) {
    console.error('Error in trackUsage:', error);
    throw new Error(`Failed to track usage: ${error.message}`);
  }
}

/**
 * Get template statistics
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Template statistics
 */
async function getTemplateStats(templateId) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const [template, usageByAction, uniqueUsers, recentUsage, totalUsage] = await Promise.all([
      prisma.resumeTemplate.findUnique({
        where: { id: templateId },
        include: {
          _count: {
            select: {
              favorites: true,
              usageHistory: true
            }
          }
        }
      }),
      prisma.templateUsageHistory.groupBy({
        by: ['action'],
        where: { templateId },
        _count: true
      }),
      prisma.templateUsageHistory.findMany({
        where: { templateId },
        distinct: ['userId'],
        select: { userId: true }
      }),
      prisma.templateUsageHistory.findMany({
        where: { templateId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          action: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.templateUsageHistory.count({
        where: { templateId }
      })
    ]);

    if (!template) {
      throw new Error('Template not found');
    }

    // Calculate usage breakdown
    const usageBreakdown = {};
    usageByAction.forEach(item => {
      usageBreakdown[item.action] = item._count;
    });

    return {
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        rating: template.rating,
        downloads: template.downloads,
        isPremium: template.isPremium
      },
      stats: {
        totalUsage,
        uniqueUsers: uniqueUsers.length,
        favorites: template._count.favorites,
        usageHistory: template._count.usageHistory
      },
      usageBreakdown,
      recentUsage
    };
  } catch (error) {
    console.error('Error in getTemplateStats:', error);
    throw new Error(`Failed to get template stats: ${error.message}`);
  }
}

/**
 * Get popular templates (most used)
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of templates to return (default 10, max 50)
 * @param {string} options.period - Time period (all, day, week, month, year)
 * @param {string} options.category - Filter by category
 * @param {string} options.action - Filter by specific action type
 * @returns {Promise<Array>} Popular templates
 */
async function getPopularTemplates(options = {}) {
  try {
    const {
      limit = 10,
      period = 'all',
      category,
      action
    } = options;

    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

    // Calculate date filter based on period
    let dateFilter = {};
    const now = new Date();
    switch (period) {
      case 'day':
        dateFilter = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case 'week':
        dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateFilter = { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = {};
    }

    // Build where clause for usage history
    const where = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    if (action) {
      where.action = action.toUpperCase();
    }

    // Get usage counts grouped by template
    const usageCounts = await prisma.templateUsageHistory.groupBy({
      by: ['templateId'],
      where,
      _count: true,
      orderBy: {
        _count: {
          templateId: 'desc'
        }
      },
      take: limitNum
    });

    // Get template details
    const templateIds = usageCounts.map(u => u.templateId);
    const templates = await prisma.resumeTemplate.findMany({
      where: {
        id: { in: templateIds },
        isActive: true,
        isApproved: true,
        ...(category && { category: category.toUpperCase() })
      },
      include: {
        _count: {
          select: {
            favorites: true,
            usageHistory: true
          }
        }
      }
    });

    // Merge usage counts with template data
    const templatesMap = new Map(templates.map(t => [t.id, t]));
    const popular = usageCounts
      .map(u => {
        const template = templatesMap.get(u.templateId);
        if (!template) return null;
        return {
          ...template,
          usageCount: u._count
        };
      })
      .filter(t => t !== null);

    return popular;
  } catch (error) {
    console.error('Error in getPopularTemplates:', error);
    throw new Error(`Failed to get popular templates: ${error.message}`);
  }
}

/**
 * Get user's template usage history
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of records to return
 * @param {string} options.action - Filter by action type
 * @param {string} options.templateId - Filter by template ID
 * @returns {Promise<Array>} User's usage history
 */
async function getUserHistory(userId, options = {}) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const {
      limit = 20,
      action,
      templateId
    } = options;

    const where = { userId };
    if (action) {
      where.action = action.toUpperCase();
    }
    if (templateId) {
      where.templateId = templateId;
    }

    const history = await prisma.templateUsageHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(100, parseInt(limit)),
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            preview: true,
            isPremium: true
          }
        }
      }
    });

    return history;
  } catch (error) {
    console.error('Error in getUserHistory:', error);
    throw new Error(`Failed to get user history: ${error.message}`);
  }
}

/**
 * Get recently used templates for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of templates to return (default 5)
 * @returns {Promise<Array>} Recently used templates
 */
async function getRecentlyUsed(userId, limit = 5) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const recent = await prisma.templateUsageHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(20, parseInt(limit)),
      distinct: ['templateId'],
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            preview: true,
            difficulty: true,
            isPremium: true,
            rating: true
          }
        }
      }
    });

    return recent.map(r => ({
      ...r.template,
      lastUsedAt: r.createdAt,
      lastAction: r.action
    }));
  } catch (error) {
    console.error('Error in getRecentlyUsed:', error);
    throw new Error(`Failed to get recently used templates: ${error.message}`);
  }
}

/**
 * Get usage summary for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Usage summary
 */
async function getUserSummary(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const [totalUsage, byAction, uniqueTemplates, recentActivity] = await Promise.all([
      prisma.templateUsageHistory.count({
        where: { userId }
      }),
      prisma.templateUsageHistory.groupBy({
        by: ['action'],
        where: { userId },
        _count: true
      }),
      prisma.templateUsageHistory.findMany({
        where: { userId },
        distinct: ['templateId'],
        select: { templateId: true }
      }),
      prisma.templateUsageHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    const actionBreakdown = {};
    byAction.forEach(item => {
      actionBreakdown[item.action] = item._count;
    });

    return {
      totalUsage,
      uniqueTemplates: uniqueTemplates.length,
      actionBreakdown,
      lastActivity: recentActivity?.createdAt || null
    };
  } catch (error) {
    console.error('Error in getUserSummary:', error);
    throw new Error(`Failed to get user summary: ${error.message}`);
  }
}

/**
 * Get trending templates (popular in recent period)
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of templates to return (default 10)
 * @param {number} options.days - Number of days to look back (default 7)
 * @returns {Promise<Array>} Trending templates
 */
async function getTrendingTemplates(options = {}) {
  try {
    const {
      limit = 10,
      days = 7
    } = options;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trending = await prisma.templateUsageHistory.groupBy({
      by: ['templateId'],
      where: {
        createdAt: {
          gte: cutoffDate
        }
      },
      _count: true,
      orderBy: {
        _count: {
          templateId: 'desc'
        }
      },
      take: Math.min(50, parseInt(limit))
    });

    // Get template details
    const templateIds = trending.map(t => t.templateId);
    const templates = await prisma.resumeTemplate.findMany({
      where: {
        id: { in: templateIds },
        isActive: true,
        isApproved: true
      },
      include: {
        _count: {
          select: {
            favorites: true
          }
        }
      }
    });

    // Merge with usage counts
    const templatesMap = new Map(templates.map(t => [t.id, t]));
    const result = trending
      .map(t => {
        const template = templatesMap.get(t.templateId);
        if (!template) return null;
        return {
          ...template,
          trendingScore: t._count
        };
      })
      .filter(t => t !== null);

    return result;
  } catch (error) {
    console.error('Error in getTrendingTemplates:', error);
    throw new Error(`Failed to get trending templates: ${error.message}`);
  }
}

/**
 * Get global analytics dashboard data
 * @returns {Promise<Object>} Dashboard analytics
 */
async function getDashboardAnalytics() {
  try {
    const [
      totalTemplates,
      totalUsers,
      totalUsage,
      usageByAction,
      usageByCategory,
      topTemplates,
      recentActivity
    ] = await Promise.all([
      prisma.resumeTemplate.count({ where: { isActive: true, isApproved: true } }),
      prisma.templateUsageHistory.findMany({
        distinct: ['userId'],
        select: { userId: true }
      }),
      prisma.templateUsageHistory.count(),
      prisma.templateUsageHistory.groupBy({
        by: ['action'],
        _count: true
      }),
      prisma.templateUsageHistory.groupBy({
        by: ['templateId'],
        _count: true,
        orderBy: {
          _count: {
            templateId: 'desc'
          }
        },
        take: 10
      }),
      getPopularTemplates({ limit: 5, period: 'all' }),
      prisma.templateUsageHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          template: {
            select: { id: true, name: true, category: true }
          },
          user: {
            select: { id: true, name: true }
          }
        }
      })
    ]);

    const actionBreakdown = {};
    usageByAction.forEach(item => {
      actionBreakdown[item.action] = item._count;
    });

    return {
      overview: {
        totalTemplates,
        totalUsers: totalUsers.length,
        totalUsage
      },
      actionBreakdown,
      topTemplates,
      recentActivity
    };
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    throw new Error(`Failed to get dashboard analytics: ${error.message}`);
  }
}

module.exports = {
  trackUsage,
  getTemplateStats,
  getPopularTemplates,
  getUserHistory,
  getRecentlyUsed,
  getUserSummary,
  getTrendingTemplates,
  getDashboardAnalytics
};
