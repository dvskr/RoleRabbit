/**
 * Advanced Template Search Service
 * Provides sophisticated search capabilities with multiple strategies
 *
 * Features:
 * - Full-text search with relevance scoring
 * - Fuzzy matching
 * - Multi-field search
 * - Search suggestions/autocomplete
 * - Search history
 * - Trending searches
 * - Filters integration
 * - Search analytics
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Advanced search with multiple strategies
 */
async function advancedSearch(query, options = {}) {
  try {
    const {
      limit = 20,
      offset = 0,
      filters = {},
      sortBy = 'relevance',
      userId = null,
      fuzzy = true,
      autocomplete = false,
    } = options;

    if (!query || query.trim().length === 0) {
      return {
        results: [],
        total: 0,
        query,
        suggestions: [],
      };
    }

    const searchTerm = query.trim();

    // Track search
    if (userId) {
      await trackSearch(userId, searchTerm);
    }

    // Build search conditions
    const searchConditions = buildSearchConditions(searchTerm, fuzzy);

    // Apply filters
    const whereClause = {
      AND: [
        {
          isActive: true,
          isApproved: true,
        },
        {
          OR: searchConditions,
        },
        ...buildFilterConditions(filters),
      ],
    };

    // Execute search
    const [results, total] = await Promise.all([
      prisma.resumeTemplate.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: limit,
        skip: offset,
      }),
      prisma.resumeTemplate.count({ where: whereClause }),
    ]);

    // Score and sort results by relevance
    const scoredResults = results.map((template) => ({
      ...template,
      relevanceScore: calculateRelevanceScore(template, searchTerm),
    }));

    // Sort based on option
    const sortedResults = sortResults(scoredResults, sortBy);

    // Get search suggestions
    const suggestions = autocomplete
      ? await getSearchSuggestions(searchTerm, filters)
      : [];

    return {
      results: sortedResults,
      total,
      query: searchTerm,
      suggestions,
      filters: filters,
    };
  } catch (error) {
    console.error('Error in advanced search:', error);
    throw error;
  }
}

/**
 * Build search conditions for full-text search
 */
function buildSearchConditions(searchTerm, fuzzy = true) {
  const conditions = [];
  const words = searchTerm.toLowerCase().split(/\s+/);

  // Exact match in name (highest priority)
  conditions.push({
    name: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  });

  // Exact match in description
  conditions.push({
    description: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  });

  // Tags match
  conditions.push({
    tags: {
      hasSome: words,
    },
  });

  // Features match
  conditions.push({
    features: {
      hasSome: [searchTerm],
    },
  });

  // Industry match
  conditions.push({
    industry: {
      hasSome: words,
    },
  });

  // Category fuzzy match
  if (fuzzy) {
    const categoryMatches = getCategoryFuzzyMatches(searchTerm);
    if (categoryMatches.length > 0) {
      conditions.push({
        category: {
          in: categoryMatches,
        },
      });
    }
  }

  return conditions;
}

/**
 * Build filter conditions
 */
function buildFilterConditions(filters) {
  const conditions = [];

  if (filters.category) {
    conditions.push({
      category: Array.isArray(filters.category)
        ? { in: filters.category }
        : filters.category,
    });
  }

  if (filters.difficulty) {
    conditions.push({
      difficulty: Array.isArray(filters.difficulty)
        ? { in: filters.difficulty }
        : filters.difficulty,
    });
  }

  if (filters.layout) {
    conditions.push({
      layout: Array.isArray(filters.layout) ? { in: filters.layout } : filters.layout,
    });
  }

  if (filters.colorScheme) {
    conditions.push({
      colorScheme: Array.isArray(filters.colorScheme)
        ? { in: filters.colorScheme }
        : filters.colorScheme,
    });
  }

  if (filters.isPremium !== undefined) {
    conditions.push({
      isPremium: filters.isPremium === 'true' || filters.isPremium === true,
    });
  }

  if (filters.minRating) {
    conditions.push({
      rating: {
        gte: parseFloat(filters.minRating),
      },
    });
  }

  if (filters.maxRating) {
    conditions.push({
      rating: {
        lte: parseFloat(filters.maxRating),
      },
    });
  }

  if (filters.industry) {
    const industries = Array.isArray(filters.industry)
      ? filters.industry
      : [filters.industry];
    conditions.push({
      industry: {
        hasSome: industries,
      },
    });
  }

  if (filters.tags) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    conditions.push({
      tags: {
        hasSome: tags,
      },
    });
  }

  if (filters.minDownloads) {
    conditions.push({
      downloads: {
        gte: parseInt(filters.minDownloads),
      },
    });
  }

  return conditions;
}

/**
 * Calculate relevance score for search result
 */
function calculateRelevanceScore(template, searchTerm) {
  let score = 0;
  const lowerQuery = searchTerm.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  // Exact name match (highest weight)
  if (template.name.toLowerCase() === lowerQuery) {
    score += 100;
  } else if (template.name.toLowerCase().includes(lowerQuery)) {
    score += 50;
  }

  // Name word matches
  words.forEach((word) => {
    if (template.name.toLowerCase().includes(word)) {
      score += 10;
    }
  });

  // Description matches
  if (template.description && template.description.toLowerCase().includes(lowerQuery)) {
    score += 20;
  }

  // Tag matches
  if (template.tags) {
    const matchingTags = template.tags.filter((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );
    score += matchingTags.length * 15;
  }

  // Feature matches
  if (template.features) {
    const matchingFeatures = template.features.filter((feature) =>
      feature.toLowerCase().includes(lowerQuery)
    );
    score += matchingFeatures.length * 10;
  }

  // Category match
  if (template.category.toLowerCase().includes(lowerQuery)) {
    score += 25;
  }

  // Boost by popularity
  score += Math.min(template.rating * 2, 10);
  score += Math.min(Math.log10(template.downloads + 1) * 3, 15);

  return score;
}

/**
 * Sort results based on criteria
 */
function sortResults(results, sortBy) {
  switch (sortBy) {
    case 'relevance':
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    case 'rating':
      return results.sort((a, b) => b.rating - a.rating);
    case 'downloads':
      return results.sort((a, b) => b.downloads - a.downloads);
    case 'newest':
      return results.sort((a, b) => b.createdAt - a.createdAt);
    case 'name':
      return results.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

/**
 * Get search suggestions (autocomplete)
 */
async function getSearchSuggestions(query, filters = {}) {
  try {
    const lowerQuery = query.toLowerCase();

    // Get template name suggestions
    const nameMatches = await prisma.resumeTemplate.findMany({
      where: {
        isActive: true,
        isApproved: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        name: true,
      },
      take: 5,
    });

    // Get tag suggestions
    const tagMatches = await prisma.resumeTemplate.findMany({
      where: {
        isActive: true,
        isApproved: true,
        tags: {
          hasSome: [lowerQuery],
        },
      },
      select: {
        tags: true,
      },
      take: 10,
    });

    // Extract unique matching tags
    const allTags = tagMatches.flatMap((t) => t.tags);
    const matchingTags = [...new Set(allTags.filter((tag) => tag.includes(lowerQuery)))];

    // Get trending searches
    const trendingSearches = await getTrendingSearches(5);

    // Combine suggestions
    const suggestions = [
      ...nameMatches.map((t) => ({
        type: 'template',
        value: t.name,
      })),
      ...matchingTags.slice(0, 5).map((tag) => ({
        type: 'tag',
        value: tag,
      })),
      ...trendingSearches.map((search) => ({
        type: 'trending',
        value: search.query,
      })),
    ];

    return suggestions.slice(0, 10);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}

/**
 * Get fuzzy category matches
 */
function getCategoryFuzzyMatches(query) {
  const categories = ['ATS', 'CREATIVE', 'MODERN', 'MINIMAL', 'EXECUTIVE', 'ACADEMIC', 'TECHNICAL'];
  const lowerQuery = query.toLowerCase();

  return categories.filter((cat) => {
    const lowerCat = cat.toLowerCase();
    return (
      lowerCat.includes(lowerQuery) ||
      levenshteinDistance(lowerCat, lowerQuery) <= 2
    );
  });
}

/**
 * Track search query
 */
async function trackSearch(userId, query) {
  try {
    await prisma.searchHistory.create({
      data: {
        userId,
        query,
        searchedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}

/**
 * Get user's search history
 */
async function getSearchHistory(userId, limit = 20) {
  try {
    const history = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: limit,
      distinct: ['query'],
    });

    return history;
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
}

/**
 * Get trending searches
 */
async function getTrendingSearches(limit = 10) {
  try {
    // Get searches from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const searches = await prisma.searchHistory.groupBy({
      by: ['query'],
      where: {
        searchedAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: limit,
    });

    return searches.map((s) => ({
      query: s.query,
      count: s._count.query,
    }));
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    return [];
  }
}

/**
 * Get search analytics
 */
async function getSearchAnalytics(options = {}) {
  try {
    const { days = 30 } = options;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalSearches, uniqueQueries, topSearches, zeroResultSearches] =
      await Promise.all([
        prisma.searchHistory.count({
          where: {
            searchedAt: { gte: since },
          },
        }),

        prisma.searchHistory.groupBy({
          by: ['query'],
          where: {
            searchedAt: { gte: since },
          },
        }),

        prisma.searchHistory.groupBy({
          by: ['query'],
          where: {
            searchedAt: { gte: since },
          },
          _count: {
            query: true,
          },
          orderBy: {
            _count: {
              query: 'desc',
            },
          },
          take: 20,
        }),

        // This would require additional tracking
        prisma.searchHistory.count({
          where: {
            searchedAt: { gte: since },
            resultCount: 0,
          },
        }),
      ]);

    return {
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      topSearches: topSearches.map((s) => ({
        query: s.query,
        count: s._count.query,
      })),
      zeroResultSearches,
    };
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    throw error;
  }
}

/**
 * Clear search history for user
 */
async function clearSearchHistory(userId) {
  try {
    await prisma.searchHistory.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: 'Search history cleared',
    };
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
}

/**
 * Helper: Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

module.exports = {
  advancedSearch,
  getSearchSuggestions,
  getSearchHistory,
  getTrendingSearches,
  getSearchAnalytics,
  clearSearchHistory,
};
