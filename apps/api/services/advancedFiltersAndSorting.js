/**
 * Advanced Filters and Sorting Service
 * Provides sophisticated filtering and sorting capabilities
 *
 * Features:
 * - Multi-criteria filtering
 * - Range filters
 * - Composite filters
 * - Custom sort orders
 * - Filter presets
 * - Filter analytics
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Available filter types
const FILTER_TYPES = {
  CATEGORY: 'category',
  DIFFICULTY: 'difficulty',
  LAYOUT: 'layout',
  COLOR_SCHEME: 'colorScheme',
  PREMIUM: 'isPremium',
  RATING: 'rating',
  DOWNLOADS: 'downloads',
  INDUSTRY: 'industry',
  TAGS: 'tags',
  AUTHOR: 'authorId',
  DATE_CREATED: 'createdAt',
  DATE_UPDATED: 'updatedAt',
};

// Available sort options
const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  POPULAR: 'popular',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  RATING_HIGH: 'rating-high',
  RATING_LOW: 'rating-low',
  DOWNLOADS_HIGH: 'downloads-high',
  DOWNLOADS_LOW: 'downloads-low',
  NAME_AZ: 'name-az',
  NAME_ZA: 'name-za',
  RECENTLY_UPDATED: 'recently-updated',
  TRENDING: 'trending',
};

/**
 * Apply advanced filters and sorting
 */
async function applyFiltersAndSort(filters = {}, sortOptions = {}, paginationOptions = {}) {
  try {
    const {
      limit = 12,
      offset = 0,
      includeCounts = true,
    } = paginationOptions;

    // Build where clause from filters
    const whereClause = buildAdvancedWhereClause(filters);

    // Build order by clause
    const orderByClause = buildAdvancedOrderByClause(sortOptions);

    // Execute query
    const [templates, total, facets] = await Promise.all([
      prisma.resumeTemplate.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: limit,
        skip: offset,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              favorites: true,
              comments: true,
            },
          },
        },
      }),
      prisma.resumeTemplate.count({ where: whereClause }),
      includeCounts ? getFacetCounts(filters) : null,
    ]);

    return {
      templates,
      total,
      facets,
      filters,
      sort: sortOptions,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  } catch (error) {
    console.error('Error applying filters and sort:', error);
    throw error;
  }
}

/**
 * Build advanced where clause
 */
function buildAdvancedWhereClause(filters) {
  const conditions = [];

  // Base conditions
  conditions.push({
    isActive: true,
    isApproved: true,
  });

  // Category filter
  if (filters.category) {
    if (Array.isArray(filters.category)) {
      conditions.push({ category: { in: filters.category } });
    } else {
      conditions.push({ category: filters.category });
    }
  }

  // Difficulty filter
  if (filters.difficulty) {
    if (Array.isArray(filters.difficulty)) {
      conditions.push({ difficulty: { in: filters.difficulty } });
    } else {
      conditions.push({ difficulty: filters.difficulty });
    }
  }

  // Layout filter
  if (filters.layout) {
    if (Array.isArray(filters.layout)) {
      conditions.push({ layout: { in: filters.layout } });
    } else {
      conditions.push({ layout: filters.layout });
    }
  }

  // Color scheme filter
  if (filters.colorScheme) {
    if (Array.isArray(filters.colorScheme)) {
      conditions.push({ colorScheme: { in: filters.colorScheme } });
    } else {
      conditions.push({ colorScheme: filters.colorScheme });
    }
  }

  // Premium filter
  if (filters.isPremium !== undefined) {
    conditions.push({
      isPremium: filters.isPremium === true || filters.isPremium === 'true',
    });
  }

  // Rating range filter
  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    const ratingCondition = {};

    if (filters.minRating !== undefined) {
      ratingCondition.gte = parseFloat(filters.minRating);
    }

    if (filters.maxRating !== undefined) {
      ratingCondition.lte = parseFloat(filters.maxRating);
    }

    conditions.push({ rating: ratingCondition });
  }

  // Downloads range filter
  if (filters.minDownloads !== undefined || filters.maxDownloads !== undefined) {
    const downloadsCondition = {};

    if (filters.minDownloads !== undefined) {
      downloadsCondition.gte = parseInt(filters.minDownloads);
    }

    if (filters.maxDownloads !== undefined) {
      downloadsCondition.lte = parseInt(filters.maxDownloads);
    }

    conditions.push({ downloads: downloadsCondition });
  }

  // Industry filter
  if (filters.industry) {
    const industries = Array.isArray(filters.industry)
      ? filters.industry
      : [filters.industry];

    conditions.push({
      industry: { hasSome: industries },
    });
  }

  // Tags filter
  if (filters.tags) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];

    conditions.push({
      tags: { hasSome: tags },
    });
  }

  // Author filter
  if (filters.authorId) {
    conditions.push({ authorId: filters.authorId });
  }

  // Date range filters
  if (filters.createdAfter || filters.createdBefore) {
    const dateCondition = {};

    if (filters.createdAfter) {
      dateCondition.gte = new Date(filters.createdAfter);
    }

    if (filters.createdBefore) {
      dateCondition.lte = new Date(filters.createdBefore);
    }

    conditions.push({ createdAt: dateCondition });
  }

  // Updated date range
  if (filters.updatedAfter || filters.updatedBefore) {
    const dateCondition = {};

    if (filters.updatedAfter) {
      dateCondition.gte = new Date(filters.updatedAfter);
    }

    if (filters.updatedBefore) {
      dateCondition.lte = new Date(filters.updatedBefore);
    }

    conditions.push({ updatedAt: dateCondition });
  }

  // Composite filter: Featured (high rating + many downloads)
  if (filters.featured === true || filters.featured === 'true') {
    conditions.push({
      AND: [
        { rating: { gte: 4.5 } },
        { downloads: { gte: 100 } },
      ],
    });
  }

  // Composite filter: Trending (recently popular)
  if (filters.trending === true || filters.trending === 'true') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    conditions.push({
      AND: [
        { createdAt: { gte: thirtyDaysAgo } },
        { downloads: { gte: 50 } },
      ],
    });
  }

  return { AND: conditions };
}

/**
 * Build advanced order by clause
 */
function buildAdvancedOrderByClause(sortOptions) {
  const { sortBy = 'popular', sortOrder = 'desc' } = sortOptions;

  const order = sortOrder === 'asc' ? 'asc' : 'desc';

  switch (sortBy) {
    case SORT_OPTIONS.POPULAR:
      return [
        { downloads: 'desc' },
        { rating: 'desc' },
        { id: 'desc' },
      ];

    case SORT_OPTIONS.NEWEST:
      return [
        { createdAt: 'desc' },
        { id: 'desc' },
      ];

    case SORT_OPTIONS.OLDEST:
      return [
        { createdAt: 'asc' },
        { id: 'asc' },
      ];

    case SORT_OPTIONS.RATING_HIGH:
      return [
        { rating: 'desc' },
        { downloads: 'desc' },
        { id: 'desc' },
      ];

    case SORT_OPTIONS.RATING_LOW:
      return [
        { rating: 'asc' },
        { downloads: 'desc' },
        { id: 'asc' },
      ];

    case SORT_OPTIONS.DOWNLOADS_HIGH:
      return [
        { downloads: 'desc' },
        { id: 'desc' },
      ];

    case SORT_OPTIONS.DOWNLOADS_LOW:
      return [
        { downloads: 'asc' },
        { id: 'asc' },
      ];

    case SORT_OPTIONS.NAME_AZ:
      return [
        { name: 'asc' },
        { id: 'asc' },
      ];

    case SORT_OPTIONS.NAME_ZA:
      return [
        { name: 'desc' },
        { id: 'desc' },
      ];

    case SORT_OPTIONS.RECENTLY_UPDATED:
      return [
        { updatedAt: 'desc' },
        { id: 'desc' },
      ];

    case SORT_OPTIONS.TRENDING:
      // Composite score: recent downloads weighted by time
      return [
        { downloads: 'desc' },
        { createdAt: 'desc' },
        { rating: 'desc' },
      ];

    default:
      return [
        { downloads: 'desc' },
        { rating: 'desc' },
      ];
  }
}

/**
 * Get facet counts for filters
 */
async function getFacetCounts(currentFilters = {}) {
  try {
    // Base where clause without the facet we're counting
    const baseWhere = {
      isActive: true,
      isApproved: true,
    };

    const [
      categoryFacets,
      difficultyFacets,
      layoutFacets,
      colorSchemeFacets,
      premiumFacets,
      ratingFacets,
    ] = await Promise.all([
      // Category facets
      prisma.resumeTemplate.groupBy({
        by: ['category'],
        where: baseWhere,
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),

      // Difficulty facets
      prisma.resumeTemplate.groupBy({
        by: ['difficulty'],
        where: baseWhere,
        _count: { difficulty: true },
        orderBy: { _count: { difficulty: 'desc' } },
      }),

      // Layout facets
      prisma.resumeTemplate.groupBy({
        by: ['layout'],
        where: baseWhere,
        _count: { layout: true },
        orderBy: { _count: { layout: 'desc' } },
      }),

      // Color scheme facets
      prisma.resumeTemplate.groupBy({
        by: ['colorScheme'],
        where: baseWhere,
        _count: { colorScheme: true },
        orderBy: { _count: { colorScheme: 'desc' } },
      }),

      // Premium facets
      prisma.resumeTemplate.groupBy({
        by: ['isPremium'],
        where: baseWhere,
        _count: { isPremium: true },
      }),

      // Rating distribution
      prisma.resumeTemplate.groupBy({
        by: ['rating'],
        where: { ...baseWhere, rating: { gte: 1 } },
        _count: { rating: true },
        orderBy: { rating: 'desc' },
      }),
    ]);

    return {
      category: categoryFacets.map((f) => ({
        value: f.category,
        count: f._count.category,
      })),
      difficulty: difficultyFacets.map((f) => ({
        value: f.difficulty,
        count: f._count.difficulty,
      })),
      layout: layoutFacets.map((f) => ({
        value: f.layout,
        count: f._count.layout,
      })),
      colorScheme: colorSchemeFacets.map((f) => ({
        value: f.colorScheme,
        count: f._count.colorScheme,
      })),
      isPremium: premiumFacets.map((f) => ({
        value: f.isPremium,
        count: f._count.isPremium,
      })),
      ratingDistribution: ratingFacets.map((f) => ({
        rating: f.rating,
        count: f._count.rating,
      })),
    };
  } catch (error) {
    console.error('Error getting facet counts:', error);
    return null;
  }
}

/**
 * Save filter preset
 */
async function saveFilterPreset(userId, presetData) {
  try {
    const { name, filters, sortOptions, isPublic = false } = presetData;

    const preset = await prisma.filterPreset.create({
      data: {
        userId,
        name,
        filters,
        sortOptions,
        isPublic,
      },
    });

    return {
      success: true,
      preset,
      message: 'Filter preset saved successfully',
    };
  } catch (error) {
    console.error('Error saving filter preset:', error);
    throw error;
  }
}

/**
 * Get user's filter presets
 */
async function getUserFilterPresets(userId) {
  try {
    const presets = await prisma.filterPreset.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return presets;
  } catch (error) {
    console.error('Error getting filter presets:', error);
    throw error;
  }
}

/**
 * Delete filter preset
 */
async function deleteFilterPreset(presetId, userId) {
  try {
    const preset = await prisma.filterPreset.findUnique({
      where: { id: presetId },
    });

    if (!preset) {
      throw new Error('Preset not found');
    }

    if (preset.userId !== userId) {
      throw new Error('You do not have permission to delete this preset');
    }

    await prisma.filterPreset.delete({
      where: { id: presetId },
    });

    return {
      success: true,
      message: 'Filter preset deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting filter preset:', error);
    throw error;
  }
}

/**
 * Get popular filter combinations
 */
async function getPopularFilterCombinations(limit = 10) {
  try {
    // This would track filter usage in a separate table
    // For now, return common combinations

    return [
      {
        name: 'Popular ATS Templates',
        filters: { category: 'ATS', minRating: 4.0 },
        sortOptions: { sortBy: 'popular' },
        usageCount: 1250,
      },
      {
        name: 'Free Templates',
        filters: { isPremium: false },
        sortOptions: { sortBy: 'popular' },
        usageCount: 980,
      },
      {
        name: 'Highly Rated',
        filters: { minRating: 4.5 },
        sortOptions: { sortBy: 'rating-high' },
        usageCount: 850,
      },
      {
        name: 'Newest Arrivals',
        filters: {},
        sortOptions: { sortBy: 'newest' },
        usageCount: 720,
      },
    ];
  } catch (error) {
    console.error('Error getting popular filter combinations:', error);
    return [];
  }
}

module.exports = {
  applyFiltersAndSort,
  getFacetCounts,
  saveFilterPreset,
  getUserFilterPresets,
  deleteFilterPreset,
  getPopularFilterCombinations,
  FILTER_TYPES,
  SORT_OPTIONS,
};
