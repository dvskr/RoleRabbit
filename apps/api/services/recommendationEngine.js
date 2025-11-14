/**
 * Template Recommendation Engine
 * Provides personalized template recommendations using multiple strategies
 *
 * Strategies:
 * - Collaborative filtering (user-based and item-based)
 * - Content-based filtering
 * - Hybrid approach
 * - Popularity-based
 * - Context-aware recommendations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Recommendation weights
const WEIGHTS = {
  COLLABORATIVE: 0.35,
  CONTENT_BASED: 0.30,
  POPULARITY: 0.15,
  RATINGS: 0.10,
  RECENCY: 0.10,
};

// Similarity thresholds
const SIMILARITY_THRESHOLD = 0.3;
const MAX_RECOMMENDATIONS = 20;

/**
 * Get personalized recommendations for a user
 */
async function getRecommendations(userId, options = {}) {
  try {
    const {
      limit = 12,
      excludeTemplateIds = [],
      context = {},
    } = options;

    // Get user profile and preferences
    const userProfile = await getUserProfile(userId);

    // Run different recommendation strategies in parallel
    const [
      collaborativeRecs,
      contentBasedRecs,
      popularityRecs,
      contextualRecs,
    ] = await Promise.all([
      getCollaborativeRecommendations(userId, userProfile),
      getContentBasedRecommendations(userId, userProfile),
      getPopularityBasedRecommendations(userProfile),
      getContextualRecommendations(context, userProfile),
    ]);

    // Combine and score recommendations
    const combinedScores = combineRecommendations([
      { recommendations: collaborativeRecs, weight: WEIGHTS.COLLABORATIVE },
      { recommendations: contentBasedRecs, weight: WEIGHTS.CONTENT_BASED },
      { recommendations: popularityRecs, weight: WEIGHTS.POPULARITY },
      { recommendations: contextualRecs, weight: WEIGHTS.RECENCY },
    ]);

    // Filter out excluded templates
    const filtered = combinedScores.filter(
      (rec) => !excludeTemplateIds.includes(rec.templateId)
    );

    // Sort by score and limit
    const topRecommendations = filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Fetch template details
    const templateIds = topRecommendations.map((rec) => rec.templateId);
    const templates = await prisma.resumeTemplate.findMany({
      where: {
        id: { in: templateIds },
        isActive: true,
        isApproved: true,
      },
    });

    // Add recommendation metadata
    const recommendations = templates.map((template) => {
      const rec = topRecommendations.find((r) => r.templateId === template.id);
      return {
        ...template,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons,
      };
    });

    // Track recommendations shown
    await trackRecommendations(userId, recommendations);

    return {
      recommendations,
      total: recommendations.length,
      algorithm: 'hybrid',
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

/**
 * Get user profile and preferences
 */
async function getUserProfile(userId) {
  try {
    const [favorites, downloads, ratings, views] = await Promise.all([
      // User's favorite templates
      prisma.favorite.findMany({
        where: { userId },
        include: { template: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      // User's downloaded templates
      prisma.templateDownload.findMany({
        where: { userId },
        include: { template: true },
        orderBy: { downloadedAt: 'desc' },
        take: 50,
      }),

      // User's ratings
      prisma.templateRating.findMany({
        where: { userId },
        include: { template: true },
        orderBy: { createdAt: 'desc' },
      }),

      // User's viewed templates
      prisma.templateView.findMany({
        where: { userId },
        include: { template: true },
        orderBy: { viewedAt: 'desc' },
        take: 100,
      }),
    ]);

    // Extract preferences
    const preferredCategories = extractPreferredCategories([
      ...favorites,
      ...downloads,
      ...ratings.filter((r) => r.rating >= 4),
    ]);

    const preferredDifficulties = extractPreferredDifficulties([
      ...favorites,
      ...downloads,
    ]);

    const preferredIndustries = extractPreferredIndustries([
      ...favorites,
      ...downloads,
    ]);

    const interactedTemplateIds = new Set([
      ...favorites.map((f) => f.templateId),
      ...downloads.map((d) => d.templateId),
      ...ratings.map((r) => r.templateId),
    ]);

    return {
      userId,
      favorites: favorites.map((f) => f.template),
      downloads: downloads.map((d) => d.template),
      ratings,
      views: views.map((v) => v.template),
      preferredCategories,
      preferredDifficulties,
      preferredIndustries,
      interactedTemplateIds: Array.from(interactedTemplateIds),
    };
  } catch (error) {
    console.error('Error building user profile:', error);
    return {
      userId,
      favorites: [],
      downloads: [],
      ratings: [],
      views: [],
      preferredCategories: [],
      preferredDifficulties: [],
      preferredIndustries: [],
      interactedTemplateIds: [],
    };
  }
}

/**
 * Collaborative filtering recommendations
 */
async function getCollaborativeRecommendations(userId, userProfile) {
  try {
    // Find similar users based on favorites and downloads
    const similarUsers = await findSimilarUsers(userId, userProfile);

    if (similarUsers.length === 0) {
      return [];
    }

    const similarUserIds = similarUsers.map((u) => u.userId);

    // Get templates liked by similar users
    const templatesLikedBySimilarUsers = await prisma.favorite.findMany({
      where: {
        userId: { in: similarUserIds },
        templateId: { notIn: userProfile.interactedTemplateIds },
      },
      include: {
        template: {
          where: {
            isActive: true,
            isApproved: true,
          },
        },
      },
    });

    // Score templates based on similar users' preferences
    const templateScores = {};

    templatesLikedBySimilarUsers.forEach((favorite) => {
      if (!favorite.template) return;

      const templateId = favorite.templateId;
      const similarUser = similarUsers.find((u) => u.userId === favorite.userId);

      if (!templateScores[templateId]) {
        templateScores[templateId] = {
          templateId,
          score: 0,
          reasons: [],
        };
      }

      // Weight by user similarity
      templateScores[templateId].score += similarUser.similarity;
      templateScores[templateId].reasons.push(
        `Liked by users with similar preferences`
      );
    });

    return Object.values(templateScores);
  } catch (error) {
    console.error('Error in collaborative filtering:', error);
    return [];
  }
}

/**
 * Content-based filtering recommendations
 */
async function getContentBasedRecommendations(userId, userProfile) {
  try {
    // Get templates with similar characteristics to user's favorites
    const userFavoriteTemplates = userProfile.favorites;

    if (userFavoriteTemplates.length === 0) {
      return [];
    }

    // Find templates with similar attributes
    const candidates = await prisma.resumeTemplate.findMany({
      where: {
        id: { notIn: userProfile.interactedTemplateIds },
        isActive: true,
        isApproved: true,
        OR: [
          { category: { in: userProfile.preferredCategories } },
          { difficulty: { in: userProfile.preferredDifficulties } },
        ],
      },
      take: 100,
    });

    // Calculate similarity scores
    const recommendations = candidates.map((candidate) => {
      let score = 0;
      const reasons = [];

      // Calculate content similarity with each favorite
      userFavoriteTemplates.forEach((favorite) => {
        const similarity = calculateContentSimilarity(candidate, favorite);
        score += similarity;

        if (similarity > SIMILARITY_THRESHOLD) {
          if (candidate.category === favorite.category) {
            reasons.push(`Similar to ${favorite.name} (same category)`);
          }
          if (candidate.difficulty === favorite.difficulty) {
            reasons.push(`Same difficulty level as your favorites`);
          }
        }
      });

      // Normalize score
      score = score / userFavoriteTemplates.length;

      return {
        templateId: candidate.id,
        score,
        reasons: [...new Set(reasons)],
      };
    });

    return recommendations.filter((rec) => rec.score > SIMILARITY_THRESHOLD);
  } catch (error) {
    console.error('Error in content-based filtering:', error);
    return [];
  }
}

/**
 * Popularity-based recommendations
 */
async function getPopularityBasedRecommendations(userProfile) {
  try {
    const popularTemplates = await prisma.resumeTemplate.findMany({
      where: {
        id: { notIn: userProfile.interactedTemplateIds },
        isActive: true,
        isApproved: true,
        category: userProfile.preferredCategories.length > 0
          ? { in: userProfile.preferredCategories }
          : undefined,
      },
      orderBy: [
        { rating: 'desc' },
        { downloads: 'desc' },
      ],
      take: 50,
    });

    return popularTemplates.map((template) => ({
      templateId: template.id,
      score: calculatePopularityScore(template),
      reasons: ['Popular among users', `${template.downloads} downloads`],
    }));
  } catch (error) {
    console.error('Error in popularity-based recommendations:', error);
    return [];
  }
}

/**
 * Contextual recommendations
 */
async function getContextualRecommendations(context, userProfile) {
  try {
    const { industry, jobTitle, experience, urgency } = context;

    const where = {
      id: { notIn: userProfile.interactedTemplateIds },
      isActive: true,
      isApproved: true,
    };

    // Filter by context
    if (industry) {
      where.industry = { has: industry };
    }

    // Adjust difficulty based on experience
    if (experience === 'entry') {
      where.difficulty = { in: ['BEGINNER', 'INTERMEDIATE'] };
    } else if (experience === 'senior') {
      where.difficulty = { in: ['ADVANCED', 'EXPERT'] };
    }

    const contextualTemplates = await prisma.resumeTemplate.findMany({
      where,
      orderBy: urgency === 'high'
        ? { downloads: 'desc' }
        : { rating: 'desc' },
      take: 30,
    });

    return contextualTemplates.map((template) => ({
      templateId: template.id,
      score: 0.5,
      reasons: industry
        ? [`Recommended for ${industry} industry`]
        : ['Contextually relevant'],
    }));
  } catch (error) {
    console.error('Error in contextual recommendations:', error);
    return [];
  }
}

/**
 * Find similar users
 */
async function findSimilarUsers(userId, userProfile) {
  try {
    // Get other users who interacted with same templates
    const usersWithSimilarTaste = await prisma.favorite.findMany({
      where: {
        templateId: { in: userProfile.interactedTemplateIds },
        userId: { not: userId },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    const similarUserIds = usersWithSimilarTaste.map((u) => u.userId);

    // Calculate similarity scores
    const similarities = await Promise.all(
      similarUserIds.map(async (otherUserId) => {
        const otherUserFavorites = await prisma.favorite.findMany({
          where: { userId: otherUserId },
          select: { templateId: true },
        });

        const otherUserTemplateIds = otherUserFavorites.map((f) => f.templateId);

        // Jaccard similarity
        const intersection = userProfile.interactedTemplateIds.filter((id) =>
          otherUserTemplateIds.includes(id)
        ).length;

        const union = new Set([
          ...userProfile.interactedTemplateIds,
          ...otherUserTemplateIds,
        ]).size;

        const similarity = union > 0 ? intersection / union : 0;

        return {
          userId: otherUserId,
          similarity,
        };
      })
    );

    // Filter and sort by similarity
    return similarities
      .filter((s) => s.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  } catch (error) {
    console.error('Error finding similar users:', error);
    return [];
  }
}

/**
 * Calculate content similarity between two templates
 */
function calculateContentSimilarity(template1, template2) {
  let score = 0;

  // Category match (high weight)
  if (template1.category === template2.category) {
    score += 0.4;
  }

  // Difficulty match
  if (template1.difficulty === template2.difficulty) {
    score += 0.2;
  }

  // Layout match
  if (template1.layout === template2.layout) {
    score += 0.15;
  }

  // Color scheme match
  if (template1.colorScheme === template2.colorScheme) {
    score += 0.1;
  }

  // Industry overlap
  if (template1.industry && template2.industry) {
    const intersection = template1.industry.filter((ind) =>
      template2.industry.includes(ind)
    );
    score += (intersection.length / template1.industry.length) * 0.15;
  }

  return score;
}

/**
 * Calculate popularity score
 */
function calculatePopularityScore(template) {
  // Normalize downloads and rating
  const normalizedDownloads = Math.min(template.downloads / 1000, 1);
  const normalizedRating = template.rating / 5;

  return normalizedDownloads * 0.6 + normalizedRating * 0.4;
}

/**
 * Combine recommendations from different strategies
 */
function combineRecommendations(strategies) {
  const combinedScores = {};

  strategies.forEach(({ recommendations, weight }) => {
    recommendations.forEach((rec) => {
      if (!combinedScores[rec.templateId]) {
        combinedScores[rec.templateId] = {
          templateId: rec.templateId,
          score: 0,
          reasons: [],
        };
      }

      combinedScores[rec.templateId].score += rec.score * weight;
      combinedScores[rec.templateId].reasons.push(...rec.reasons);
    });
  });

  // Deduplicate reasons
  Object.values(combinedScores).forEach((rec) => {
    rec.reasons = [...new Set(rec.reasons)];
  });

  return Object.values(combinedScores);
}

/**
 * Track recommendations shown to user
 */
async function trackRecommendations(userId, recommendations) {
  try {
    const records = recommendations.map((rec) => ({
      userId,
      templateId: rec.id,
      score: rec.recommendationScore,
      algorithm: 'hybrid',
      shownAt: new Date(),
    }));

    await prisma.recommendationHistory.createMany({
      data: records,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('Error tracking recommendations:', error);
  }
}

/**
 * Get similar templates (item-to-item recommendations)
 */
async function getSimilarTemplates(templateId, limit = 6) {
  try {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Find similar templates
    const candidates = await prisma.resumeTemplate.findMany({
      where: {
        id: { not: templateId },
        isActive: true,
        isApproved: true,
        OR: [
          { category: template.category },
          { difficulty: template.difficulty },
        ],
      },
      take: 50,
    });

    // Calculate similarity and sort
    const similar = candidates
      .map((candidate) => ({
        ...candidate,
        similarity: calculateContentSimilarity(template, candidate),
      }))
      .filter((t) => t.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similar;
  } catch (error) {
    console.error('Error finding similar templates:', error);
    throw error;
  }
}

/**
 * Helper: Extract preferred categories
 */
function extractPreferredCategories(interactions) {
  const categories = {};
  interactions.forEach((interaction) => {
    const category = interaction.template?.category;
    if (category) {
      categories[category] = (categories[category] || 0) + 1;
    }
  });

  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
}

/**
 * Helper: Extract preferred difficulties
 */
function extractPreferredDifficulties(interactions) {
  const difficulties = {};
  interactions.forEach((interaction) => {
    const difficulty = interaction.template?.difficulty;
    if (difficulty) {
      difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
    }
  });

  return Object.entries(difficulties)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([difficulty]) => difficulty);
}

/**
 * Helper: Extract preferred industries
 */
function extractPreferredIndustries(interactions) {
  const industries = {};
  interactions.forEach((interaction) => {
    const templateIndustries = interaction.template?.industry || [];
    templateIndustries.forEach((industry) => {
      industries[industry] = (industries[industry] || 0) + 1;
    });
  });

  return Object.entries(industries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([industry]) => industry);
}

module.exports = {
  getRecommendations,
  getSimilarTemplates,
  getUserProfile,
};
