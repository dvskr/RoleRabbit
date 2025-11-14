/**
 * Optimized Template Service with Caching and Performance Improvements
 * Includes:
 * - Redis query result caching
 * - Cursor-based pagination
 * - Optimized database queries
 * - Query result compression
 */

const { PrismaClient } = require('@prisma/client');
const redisCache = require('../utils/redisCache');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Cache TTLs
const CACHE_TTL = {
  TEMPLATES_LIST: 600,      // 10 minutes for template lists
  TEMPLATE_DETAIL: 1800,    // 30 minutes for individual templates
  TEMPLATE_STATS: 300,      // 5 minutes for stats
  TRENDING: 600,            // 10 minutes for trending
  SEARCH_RESULTS: 300,      // 5 minutes for search results
};

/**
 * Generate cache key for query
 */
function generateQueryCacheKey(prefix, params) {
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(params))
    .digest('hex');

  return `query:${prefix}:${hash}`;
}

/**
 * Get all templates with caching and optimization
 */
async function getAllTemplatesOptimized(options = {}) {
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
    activeOnly = true,
    useCache = true,
  } = options;

  // Generate cache key
  const cacheKey = generateQueryCacheKey('templates:list', options);

  // Try cache first
  if (useCache) {
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  // Build optimized where clause
  const where = buildWhereClause({
    activeOnly,
    category,
    difficulty,
    layout,
    colorScheme,
    isPremium,
    industry,
    minRating,
    maxRating,
    search,
  });

  // Build orderBy with secondary sort for stability
  const orderBy = buildOrderByClause(sortBy, sortOrder);

  // Optimized select - only fetch needed fields
  const select = {
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
  };

  try {
    // Execute queries in parallel
    const [templates, totalCount] = await Promise.all([
      prisma.resumeTemplate.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select,
      }),
      // Use count with same where clause
      prisma.resumeTemplate.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const result = {
      templates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        category,
        difficulty,
        layout,
        colorScheme,
        isPremium,
        industry,
        minRating,
        maxRating,
        search,
      },
    };

    // Cache the result
    if (useCache) {
      await redisCache.set(cacheKey, result, CACHE_TTL.TEMPLATES_LIST);
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }
}

/**
 * Get templates with cursor-based pagination
 * More efficient for large datasets and infinite scroll
 */
async function getTemplatesCursor(options = {}) {
  const {
    cursor = null,
    limit = 12,
    sortBy = 'popular',
    sortOrder = 'desc',
    ...filters
  } = options;

  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));

  // Build where clause
  const where = buildWhereClause(filters);

  // Build orderBy
  const orderBy = buildOrderByClause(sortBy, sortOrder);

  // Add cursor condition
  const queryOptions = {
    where,
    orderBy: [...(Array.isArray(orderBy) ? orderBy : [orderBy]), { id: 'asc' }], // Add id for stable sort
    take: limitNum + 1, // Fetch one extra to determine if there are more
  };

  if (cursor) {
    queryOptions.cursor = { id: cursor };
    queryOptions.skip = 1; // Skip the cursor itself
  }

  try {
    const templates = await prisma.resumeTemplate.findMany(queryOptions);

    // Check if there are more results
    const hasMore = templates.length > limitNum;
    const items = hasMore ? templates.slice(0, limitNum) : templates;

    // Get next cursor
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  } catch (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }
}

/**
 * Get template by ID with caching
 */
async function getTemplateByIdOptimized(id, useCache = true) {
  const cacheKey = `query:template:${id}`;

  // Try cache first
  if (useCache) {
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Cache the result
    if (useCache) {
      await redisCache.set(cacheKey, template, CACHE_TTL.TEMPLATE_DETAIL);
    }

    return template;
  } catch (error) {
    throw error;
  }
}

/**
 * Search templates with caching and optimization
 */
async function searchTemplatesOptimized(query, options = {}) {
  const { limit = 12, useCache = true } = options;

  const cacheKey = generateQueryCacheKey('templates:search', { query, limit });

  // Try cache
  if (useCache) {
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const searchTerm = query.trim();

  if (!searchTerm) {
    return { results: [], query, total: 0 };
  }

  try {
    // Optimized full-text search
    const results = await prisma.resumeTemplate.findMany({
      where: {
        AND: [
          { isActive: true },
          { isApproved: true },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { tags: { hasSome: [searchTerm.toLowerCase()] } },
              { features: { hasSome: [searchTerm] } },
            ],
          },
        ],
      },
      take: limitNum,
      orderBy: [
        // Prioritize exact matches
        { downloads: 'desc' },
        { rating: 'desc' },
      ],
    });

    const response = {
      results,
      query: searchTerm,
      total: results.length,
    };

    // Cache search results
    if (useCache) {
      await redisCache.set(cacheKey, response, CACHE_TTL.SEARCH_RESULTS);
    }

    return response;
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Get template stats with caching
 */
async function getTemplateStatsOptimized(useCache = true) {
  const cacheKey = 'query:templates:stats';

  // Try cache
  if (useCache) {
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    // Optimized aggregation queries
    const [totalTemplates, categoryCounts, avgRating, totalDownloads] = await Promise.all([
      prisma.resumeTemplate.count({
        where: { isActive: true, isApproved: true },
      }),

      // Group by category
      prisma.resumeTemplate.groupBy({
        by: ['category'],
        where: { isActive: true, isApproved: true },
        _count: { category: true },
      }),

      // Average rating
      prisma.resumeTemplate.aggregate({
        _avg: { rating: true },
        where: { isActive: true, isApproved: true },
      }),

      // Total downloads
      prisma.resumeTemplate.aggregate({
        _sum: { downloads: true },
        where: { isActive: true, isApproved: true },
      }),
    ]);

    const stats = {
      totalTemplates,
      categoryCounts: categoryCounts.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {}),
      averageRating: avgRating._avg.rating || 0,
      totalDownloads: totalDownloads._sum.downloads || 0,
    };

    // Cache stats
    if (useCache) {
      await redisCache.set(cacheKey, stats, CACHE_TTL.TEMPLATE_STATS);
    }

    return stats;
  } catch (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }
}

/**
 * Get trending templates with caching
 */
async function getTrendingTemplatesOptimized(limit = 10, useCache = true) {
  const cacheKey = `query:templates:trending:${limit}`;

  // Try cache
  if (useCache) {
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

  try {
    // Get templates with high recent downloads
    // This is simplified - you'd want to track downloads over time
    const trending = await prisma.resumeTemplate.findMany({
      where: {
        isActive: true,
        isApproved: true,
      },
      orderBy: [
        { downloads: 'desc' },
        { rating: 'desc' },
      ],
      take: limitNum,
    });

    // Cache trending
    if (useCache) {
      await redisCache.set(cacheKey, trending, CACHE_TTL.TRENDING);
    }

    return trending;
  } catch (error) {
    throw new Error(`Failed to get trending templates: ${error.message}`);
  }
}

/**
 * Invalidate template caches
 */
async function invalidateTemplateCache(templateId = null) {
  if (templateId) {
    // Invalidate specific template
    await redisCache.del(`query:template:${templateId}`);
  }

  // Invalidate list caches
  await redisCache.delPattern('query:templates:list:*');
  await redisCache.delPattern('query:templates:search:*');
  await redisCache.del('query:templates:stats');
  await redisCache.delPattern('query:templates:trending:*');
}

/**
 * Build optimized where clause
 */
function buildWhereClause(options) {
  const {
    activeOnly,
    category,
    difficulty,
    layout,
    colorScheme,
    isPremium,
    industry,
    minRating,
    maxRating,
    search,
  } = options;

  const where = {};

  if (activeOnly) {
    where.isActive = true;
    where.isApproved = true;
  }

  if (category) {
    where.category = category.toUpperCase();
  }

  if (difficulty) {
    where.difficulty = difficulty.toUpperCase();
  }

  if (layout) {
    where.layout = layout.toUpperCase().replace(/-/g, '_');
  }

  if (colorScheme) {
    where.colorScheme = colorScheme.toUpperCase();
  }

  if (typeof isPremium !== 'undefined') {
    where.isPremium = isPremium === 'true' || isPremium === true;
  }

  if (minRating || maxRating) {
    where.rating = {};
    if (minRating) where.rating.gte = parseFloat(minRating);
    if (maxRating) where.rating.lte = parseFloat(maxRating);
  }

  if (industry) {
    const industries = Array.isArray(industry) ? industry : [industry];
    where.industry = { hasSome: industries };
  }

  if (search && search.trim()) {
    const searchTerm = search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { hasSome: [searchTerm.toLowerCase()] } },
      { features: { hasSome: [searchTerm] } },
    ];
  }

  return where;
}

/**
 * Build orderBy clause with stable secondary sort
 */
function buildOrderByClause(sortBy, sortOrder = 'desc') {
  const order = sortOrder === 'asc' ? 'asc' : 'desc';

  const sortMap = {
    popular: [{ downloads: order }, { rating: 'desc' }],
    newest: [{ createdAt: order }, { id: 'desc' }],
    rating: [{ rating: order }, { downloads: 'desc' }],
    downloads: [{ downloads: order }, { rating: 'desc' }],
    name: [{ name: order }, { id: 'asc' }],
  };

  return sortMap[sortBy] || sortMap.popular;
}

module.exports = {
  getAllTemplatesOptimized,
  getTemplatesCursor,
  getTemplateByIdOptimized,
  searchTemplatesOptimized,
  getTemplateStatsOptimized,
  getTrendingTemplatesOptimized,
  invalidateTemplateCache,
};
