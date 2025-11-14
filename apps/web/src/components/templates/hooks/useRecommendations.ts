/**
 * useRecommendations Hook
 * AI-powered template recommendations with explanations
 */

import { useState, useCallback, useEffect } from 'react';

// Recommendation type
export interface Recommendation {
  id: string;
  template: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    rating: number;
    downloads: number;
    isPremium: boolean;
  };
  score: number; // 0-100
  reasons: RecommendationReason[];
  matchPercentage: number;
}

// Recommendation reason
export interface RecommendationReason {
  type: 'similarity' | 'trending' | 'personalized' | 'popular' | 'category' | 'collaborative';
  label: string;
  weight: number; // 0-1
  description: string;
}

// Recommendation context
export interface RecommendationContext {
  userId?: string;
  templateId?: string;
  category?: string;
  tags?: string[];
  recentViews?: string[];
  recentDownloads?: string[];
}

// Hook options
export interface UseRecommendationsOptions {
  context?: RecommendationContext;
  limit?: number;
  autoFetch?: boolean;
}

/**
 * Hook for template recommendations
 */
export function useRecommendations(options?: UseRecommendationsOptions) {
  const { context, limit = 10, autoFetch = true } = options || {};

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [similarTemplates, setSimilarTemplates] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch personalized recommendations
   */
  const fetchRecommendations = useCallback(
    async (customContext?: RecommendationContext): Promise<Recommendation[]> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(limit),
        });

        const requestContext = { ...context, ...customContext };

        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestContext),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        const recs = data.recommendations || [];

        setRecommendations(recs);
        return recs;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load recommendations';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [context, limit]
  );

  /**
   * Fetch similar templates based on a specific template
   */
  const fetchSimilarTemplates = useCallback(
    async (templateId: string, similarLimit?: number): Promise<Recommendation[]> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(similarLimit || limit),
        });

        const response = await fetch(`/api/templates/${templateId}/similar?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch similar templates');
        }

        const data = await response.json();
        const similar = data.similar || [];

        setSimilarTemplates(similar);
        return similar;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load similar templates';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  /**
   * Track recommendation interaction
   */
  const trackInteraction = useCallback(
    async (recommendationId: string, action: 'view' | 'click' | 'download' | 'dismiss') => {
      try {
        await fetch('/api/recommendations/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            recommendationId,
            action,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to track interaction:', err);
      }
    },
    []
  );

  /**
   * Dismiss a recommendation
   */
  const dismissRecommendation = useCallback(
    async (recommendationId: string) => {
      try {
        await trackInteraction(recommendationId, 'dismiss');

        // Remove from current recommendations
        setRecommendations((prev) => prev.filter((r) => r.id !== recommendationId));
        setSimilarTemplates((prev) => prev.filter((r) => r.id !== recommendationId));
      } catch (err) {
        console.error('Failed to dismiss recommendation:', err);
      }
    },
    [trackInteraction]
  );

  /**
   * Get trending templates
   */
  const fetchTrending = useCallback(async (trendingLimit?: number): Promise<Recommendation[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(trendingLimit || limit),
      });

      const response = await fetch(`/api/recommendations/trending?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending templates');
      }

      const data = await response.json();
      return data.trending || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trending templates';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [limit]);

  /**
   * Refresh recommendations
   */
  const refresh = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [autoFetch, fetchRecommendations]);

  return {
    // State
    recommendations,
    similarTemplates,
    loading,
    error,

    // Actions
    fetchRecommendations,
    fetchSimilarTemplates,
    fetchTrending,
    trackInteraction,
    dismissRecommendation,
    refresh,
  };
}

export default useRecommendations;
