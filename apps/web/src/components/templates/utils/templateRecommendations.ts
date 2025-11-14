/**
 * Template Recommendations Utility
 * Provides similarity-based template recommendations
 */

import type { ResumeTemplate } from '../../../data/templates';

export interface RecommendationScore {
  template: ResumeTemplate;
  score: number;
  reasons: string[];
}

/**
 * Calculate similarity score between two templates
 * Returns a score from 0-100, where 100 is most similar
 */
export function calculateSimilarity(
  baseTemplate: ResumeTemplate,
  candidateTemplate: ResumeTemplate
): { score: number; reasons: string[] } {
  // Don't recommend the same template
  if (baseTemplate.id === candidateTemplate.id) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];

  // Category match (highest weight - 35 points)
  if (baseTemplate.category === candidateTemplate.category) {
    score += 35;
    reasons.push('Same category');
  }

  // Difficulty match (20 points)
  if (baseTemplate.difficulty === candidateTemplate.difficulty) {
    score += 20;
    reasons.push('Same difficulty level');
  }

  // Layout match (15 points)
  if (baseTemplate.layout === candidateTemplate.layout) {
    score += 15;
    reasons.push('Same layout style');
  }

  // Color scheme match (10 points)
  if (baseTemplate.colorScheme === candidateTemplate.colorScheme) {
    score += 10;
    reasons.push('Similar colors');
  }

  // Premium status match (5 points)
  if (baseTemplate.isPremium === candidateTemplate.isPremium) {
    score += 5;
    if (baseTemplate.isPremium) {
      reasons.push('Premium template');
    }
  }

  // Industry overlap (up to 10 points)
  const baseIndustries = new Set(baseTemplate.industry);
  const candidateIndustries = new Set(candidateTemplate.industry);
  const commonIndustries = [...baseIndustries].filter(industry =>
    candidateIndustries.has(industry)
  );

  if (commonIndustries.length > 0) {
    const industryScore = Math.min(10, commonIndustries.length * 2);
    score += industryScore;
    if (commonIndustries.length === 1) {
      reasons.push(`Suited for ${commonIndustries[0]}`);
    } else {
      reasons.push(`${commonIndustries.length} shared industries`);
    }
  }

  // Tag overlap (up to 5 points)
  const baseTags = new Set(baseTemplate.tags);
  const candidateTags = new Set(candidateTemplate.tags);
  const commonTags = [...baseTags].filter(tag => candidateTags.has(tag));

  if (commonTags.length > 0) {
    const tagScore = Math.min(5, commonTags.length);
    score += tagScore;
  }

  return { score, reasons };
}

/**
 * Get recommended templates based on similarity to a base template
 * @param baseTemplate - The template to find recommendations for
 * @param allTemplates - All available templates
 * @param limit - Maximum number of recommendations (default: 4)
 * @param minScore - Minimum similarity score to include (default: 20)
 */
export function getRecommendedTemplates(
  baseTemplate: ResumeTemplate,
  allTemplates: ResumeTemplate[],
  limit: number = 4,
  minScore: number = 20
): RecommendationScore[] {
  // Calculate similarity scores for all templates
  const scores = allTemplates
    .map(template => {
      const { score, reasons } = calculateSimilarity(baseTemplate, template);
      return {
        template,
        score,
        reasons,
      };
    })
    .filter(item => item.score >= minScore) // Filter by minimum score
    .sort((a, b) => {
      // Sort by score (descending)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // If scores are equal, prefer higher rated templates
      if (b.template.rating !== a.template.rating) {
        return b.template.rating - a.template.rating;
      }
      // If ratings are equal, prefer more popular templates
      return b.template.downloads - a.template.downloads;
    })
    .slice(0, limit); // Limit results

  return scores;
}

/**
 * Get personalized template recommendations based on user's added templates
 * @param addedTemplateIds - IDs of templates the user has added
 * @param allTemplates - All available templates
 * @param limit - Maximum number of recommendations (default: 6)
 */
export function getPersonalizedRecommendations(
  addedTemplateIds: string[],
  allTemplates: ResumeTemplate[],
  limit: number = 6
): RecommendationScore[] {
  if (addedTemplateIds.length === 0) {
    // If no templates added, return popular templates
    return allTemplates
      .filter(t => !addedTemplateIds.includes(t.id))
      .sort((a, b) => {
        // Sort by rating first
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // Then by downloads
        return b.downloads - a.downloads;
      })
      .slice(0, limit)
      .map(template => ({
        template,
        score: 90, // High score for popular templates
        reasons: ['Highly rated', 'Popular choice'],
      }));
  }

  // Get user's added templates
  const addedTemplates = allTemplates.filter(t =>
    addedTemplateIds.includes(t.id)
  );

  // Calculate aggregate scores across all added templates
  const scoreMap = new Map<string, { total: number; count: number; reasons: Set<string> }>();

  addedTemplates.forEach(addedTemplate => {
    const recommendations = getRecommendedTemplates(
      addedTemplate,
      allTemplates,
      20, // Get more candidates
      15  // Lower minimum score
    );

    recommendations.forEach(({ template, score, reasons }) => {
      // Skip templates user has already added
      if (addedTemplateIds.includes(template.id)) {
        return;
      }

      const existing = scoreMap.get(template.id);
      if (existing) {
        existing.total += score;
        existing.count += 1;
        reasons.forEach(reason => existing.reasons.add(reason));
      } else {
        scoreMap.set(template.id, {
          total: score,
          count: 1,
          reasons: new Set(reasons),
        });
      }
    });
  });

  // Calculate average scores and create final recommendations
  const personalizedScores: RecommendationScore[] = [];

  scoreMap.forEach((data, templateId) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      const averageScore = Math.round(data.total / data.count);
      personalizedScores.push({
        template,
        score: averageScore,
        reasons: Array.from(data.reasons).slice(0, 2), // Limit to 2 reasons
      });
    }
  });

  // Sort by score and limit
  return personalizedScores
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.template.rating - a.template.rating;
    })
    .slice(0, limit);
}
