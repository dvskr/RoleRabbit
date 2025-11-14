// Template Service - CRUD operations, search, filtering, and pagination
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all templates with advanced filtering, search, pagination, and sorting
 * @param {Object} options - Query options
 * @param {string} options.search - Search query for name, description, tags, features
 * @param {string} options.category - Filter by category (ATS, CREATIVE, etc.)
 * @param {string} options.difficulty - Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED)
 * @param {string} options.layout - Filter by layout (SINGLE_COLUMN, TWO_COLUMN, HYBRID)
 * @param {string} options.colorScheme - Filter by color scheme
 * @param {boolean} options.isPremium - Filter by premium status
 * @param {string[]} options.industry - Filter by industry (supports multiple)
 * @param {number} options.minRating - Minimum rating filter
 * @param {number} options.maxRating - Maximum rating filter
 * @param {string} options.sortBy - Sort field (popular, newest, rating, downloads, name)
 * @param {string} options.sortOrder - Sort order (asc, desc)
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page (default 12, max 100)
 * @param {boolean} options.activeOnly - Only return active templates (default true)
 * @returns {Promise<{templates: Array, pagination: Object, filters: Object}>}
 */
async function getAllTemplates(options = {}) {
  try {
    const {
      search = '',
      category,
      difficulty,
      layout,
      colorScheme,
      isPremium,
      industry,
      minRating,
      maxRating,
      sortBy = 'popular',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      activeOnly = true
    } = options;

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    // Active templates only (unless explicitly disabled)
    if (activeOnly) {
      where.isActive = true;
      where.isApproved = true;
    }

    // Category filter
    if (category) {
      where.category = category.toUpperCase();
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    // Layout filter
    if (layout) {
      where.layout = layout.toUpperCase().replace(/-/g, '_');
    }

    // Color scheme filter
    if (colorScheme) {
      where.colorScheme = colorScheme.toUpperCase();
    }

    // Premium filter
    if (typeof isPremium !== 'undefined') {
      where.isPremium = isPremium === 'true' || isPremium === true;
    }

    // Rating range filter
    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating.gte = parseFloat(minRating);
      if (maxRating) where.rating.lte = parseFloat(maxRating);
    }

    // Industry filter (supports multiple industries)
    if (industry) {
      const industries = Array.isArray(industry) ? industry : [industry];
      where.industry = {
        hasSome: industries
      };
    }

    // Full-text search across multiple fields
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm.toLowerCase()] } },
        { features: { hasSome: [searchTerm] } },
        { industry: { hasSome: [searchTerm] } },
        { author: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    let orderBy = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { downloads: sortOrder === 'asc' ? 'asc' : 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' };
        break;
      case 'rating':
        orderBy = { rating: sortOrder === 'asc' ? 'asc' : 'desc' };
        break;
      case 'downloads':
        orderBy = { downloads: sortOrder === 'asc' ? 'asc' : 'desc' };
        break;
      case 'name':
        orderBy = { name: sortOrder === 'asc' ? 'asc' : 'desc' };
        break;
      default:
        orderBy = { downloads: 'desc' };
    }

    // Execute queries in parallel for performance
    const [templates, totalCount] = await Promise.all([
      prisma.resumeTemplate.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          preview: true,
          features: true,
          difficulty: true,
          industry: true,
          layout: true,
          colorScheme: true,
          isPremium: true,
          rating: true,
          downloads: true,
          author: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              favorites: true,
              usageHistory: true
            }
          }
        }
      }),
      prisma.resumeTemplate.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      templates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      },
      filters: {
        search,
        category,
        difficulty,
        layout,
        colorScheme,
        isPremium,
        industry,
        minRating,
        maxRating,
        sortBy,
        sortOrder
      }
    };
  } catch (error) {
    console.error('Error in getAllTemplates:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }
}

/**
 * Get a single template by ID
 * @param {string} templateId - Template ID
 * @param {boolean} includeRelations - Include favorites and usage history counts
 * @returns {Promise<Object|null>} Template object or null if not found
 */
async function getTemplateById(templateId, includeRelations = true) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: includeRelations ? {
          select: {
            favorites: true,
            usageHistory: true
          }
        } : false
      }
    });

    if (!template) {
      return null;
    }

    // Check if template is active and approved
    if (!template.isActive || !template.isApproved) {
      return null;
    }

    return template;
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    throw new Error(`Failed to fetch template: ${error.message}`);
  }
}

/**
 * Create a new template (admin only)
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} Created template
 */
async function createTemplate(templateData) {
  try {
    // Validate required fields
    const requiredFields = ['name', 'category', 'description', 'preview', 'difficulty', 'layout', 'colorScheme'];
    for (const field of requiredFields) {
      if (!templateData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Set defaults
    const data = {
      ...templateData,
      features: templateData.features || [],
      industry: templateData.industry || [],
      tags: templateData.tags || [],
      isPremium: templateData.isPremium ?? false,
      rating: templateData.rating ?? 0,
      downloads: templateData.downloads ?? 0,
      author: templateData.author || 'RoleReady Team',
      isActive: templateData.isActive ?? true,
      isApproved: templateData.isApproved ?? true
    };

    const template = await prisma.resumeTemplate.create({
      data
    });

    console.log(`✅ Template created: ${template.name} (${template.id})`);
    return template;
  } catch (error) {
    console.error('Error in createTemplate:', error);
    throw new Error(`Failed to create template: ${error.message}`);
  }
}

/**
 * Update an existing template (admin only)
 * @param {string} templateId - Template ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated template
 */
async function updateTemplate(templateId, updateData) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    // Check if template exists
    const existing = await prisma.resumeTemplate.findUnique({
      where: { id: templateId }
    });

    if (!existing) {
      throw new Error('Template not found');
    }

    // Remove fields that shouldn't be updated directly
    const { id, createdAt, _count, favorites, usageHistory, generatedDocs, ...safeData } = updateData;

    const template = await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        ...safeData,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Template updated: ${template.name} (${template.id})`);
    return template;
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    throw new Error(`Failed to update template: ${error.message}`);
  }
}

/**
 * Delete a template (admin only) - supports soft delete
 * @param {string} templateId - Template ID
 * @param {boolean} softDelete - If true, deactivates instead of deleting (default: true)
 * @returns {Promise<Object>} Deleted/deactivated template
 */
async function deleteTemplate(templateId, softDelete = true) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    // Check if template exists
    const existing = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            favorites: true,
            usageHistory: true,
            generatedDocs: true
          }
        }
      }
    });

    if (!existing) {
      throw new Error('Template not found');
    }

    // Warn if template has usage
    if (existing._count.favorites > 0 || existing._count.usageHistory > 0) {
      console.warn(`⚠️  Template ${templateId} has ${existing._count.favorites} favorites and ${existing._count.usageHistory} usage records`);
    }

    let template;
    if (softDelete) {
      // Soft delete: deactivate template
      template = await prisma.resumeTemplate.update({
        where: { id: templateId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
      console.log(`✅ Template deactivated (soft delete): ${template.name} (${template.id})`);
    } else {
      // Hard delete: permanently remove template
      template = await prisma.resumeTemplate.delete({
        where: { id: templateId }
      });
      console.log(`✅ Template permanently deleted: ${existing.name} (${templateId})`);
    }

    return template;
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    throw new Error(`Failed to delete template: ${error.message}`);
  }
}

/**
 * Get template statistics
 * @returns {Promise<Object>} Template statistics
 */
async function getTemplateStats() {
  try {
    const [
      totalCount,
      activeCount,
      premiumCount,
      freeCount,
      byCategory,
      byDifficulty,
      topRated,
      mostDownloaded
    ] = await Promise.all([
      prisma.resumeTemplate.count(),
      prisma.resumeTemplate.count({ where: { isActive: true, isApproved: true } }),
      prisma.resumeTemplate.count({ where: { isPremium: true } }),
      prisma.resumeTemplate.count({ where: { isPremium: false } }),
      prisma.resumeTemplate.groupBy({
        by: ['category'],
        _count: true,
        where: { isActive: true, isApproved: true }
      }),
      prisma.resumeTemplate.groupBy({
        by: ['difficulty'],
        _count: true,
        where: { isActive: true, isApproved: true }
      }),
      prisma.resumeTemplate.findMany({
        where: { isActive: true, isApproved: true },
        orderBy: { rating: 'desc' },
        take: 5,
        select: { id: true, name: true, rating: true, category: true }
      }),
      prisma.resumeTemplate.findMany({
        where: { isActive: true, isApproved: true },
        orderBy: { downloads: 'desc' },
        take: 5,
        select: { id: true, name: true, downloads: true, category: true }
      })
    ]);

    return {
      total: totalCount,
      active: activeCount,
      premium: premiumCount,
      free: freeCount,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {}),
      byDifficulty: byDifficulty.reduce((acc, item) => {
        acc[item.difficulty] = item._count;
        return acc;
      }, {}),
      topRated,
      mostDownloaded
    };
  } catch (error) {
    console.error('Error in getTemplateStats:', error);
    throw new Error(`Failed to fetch template stats: ${error.message}`);
  }
}

/**
 * Increment template download count
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Updated template
 */
async function incrementDownloadCount(templateId) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const template = await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    return template;
  } catch (error) {
    console.error('Error in incrementDownloadCount:', error);
    throw new Error(`Failed to increment download count: ${error.message}`);
  }
}

/**
 * Search templates with advanced full-text search
 * @param {string} query - Search query
 * @param {Object} options - Additional options (limit, filters)
 * @returns {Promise<Array>} Matching templates
 */
async function searchTemplates(query, options = {}) {
  try {
    if (!query || !query.trim()) {
      return [];
    }

    const searchTerm = query.trim();
    const limit = Math.min(50, parseInt(options.limit) || 20);

    const templates = await prisma.resumeTemplate.findMany({
      where: {
        isActive: true,
        isApproved: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [searchTerm.toLowerCase()] } },
          { features: { hasSome: [searchTerm] } },
          { industry: { hasSome: [searchTerm] } },
          { category: { equals: searchTerm.toUpperCase() } },
          { author: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: [
        { downloads: 'desc' },
        { rating: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        preview: true,
        difficulty: true,
        isPremium: true,
        rating: true,
        tags: true
      }
    });

    return templates;
  } catch (error) {
    console.error('Error in searchTemplates:', error);
    throw new Error(`Failed to search templates: ${error.message}`);
  }
}

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateStats,
  incrementDownloadCount,
  searchTemplates
};
