/**
 * Custom hook for managing template ratings and reviews
 */

import { useState, useEffect, useCallback } from 'react';

export interface Rating {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  review?: string;
  title?: string;
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RatingBreakdown {
  averageRating: number;
  totalRatings: number;
  distribution: {
    [key: number]: {
      count: number;
      percentage: number;
    };
  };
  recommendationPercentage: number;
}

export interface RatingFormData {
  rating: number;
  review?: string;
  title?: string;
  pros?: string;
  cons?: string;
  wouldRecommend: boolean;
}

export interface PaginatedRatings {
  ratings: Rating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  breakdown: RatingBreakdown;
}

interface UseTemplateRatingsOptions {
  templateId: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  verifiedOnly?: boolean;
}

export function useTemplateRatings(options: UseTemplateRatingsOptions) {
  const { templateId, page = 1, limit = 10, sortBy = 'helpful', verifiedOnly = false } = options;

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [breakdown, setBreakdown] = useState<RatingBreakdown | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ratings
  const fetchRatings = useCallback(async () => {
    if (!templateId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        ...(verifiedOnly && { verifiedOnly: 'true' }),
      });

      const response = await fetch(`/api/templates/${templateId}/ratings?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data: PaginatedRatings = await response.json();

      if (data.success !== false) {
        setRatings(data.ratings || []);
        setBreakdown(data.breakdown);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  }, [templateId, page, limit, sortBy, verifiedOnly]);

  // Fetch rating breakdown
  const fetchBreakdown = useCallback(async () => {
    if (!templateId) return;

    try {
      const response = await fetch(`/api/templates/${templateId}/ratings/breakdown`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rating breakdown');
      }

      const data = await response.json();

      if (data.success !== false) {
        setBreakdown(data.data);
      }
    } catch (err) {
      console.error('Error fetching rating breakdown:', err);
    }
  }, [templateId]);

  // Submit a rating
  const submitRating = useCallback(
    async (ratingData: RatingFormData) => {
      if (!templateId) return { success: false, error: 'Template ID is required' };

      try {
        const response = await fetch(`/api/templates/${templateId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(ratingData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit rating');
        }

        // Refresh ratings after submission
        await fetchRatings();
        await fetchBreakdown();

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating';
        return { success: false, error: errorMessage };
      }
    },
    [templateId, fetchRatings, fetchBreakdown]
  );

  // Update a rating
  const updateRating = useCallback(
    async (ratingData: RatingFormData) => {
      if (!templateId) return { success: false, error: 'Template ID is required' };

      try {
        const response = await fetch(`/api/templates/${templateId}/rate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(ratingData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update rating');
        }

        // Refresh ratings after update
        await fetchRatings();
        await fetchBreakdown();

        return { success: true, data: data.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update rating';
        return { success: false, error: errorMessage };
      }
    },
    [templateId, fetchRatings, fetchBreakdown]
  );

  // Delete a rating
  const deleteRating = useCallback(async () => {
    if (!templateId) return { success: false, error: 'Template ID is required' };

    try {
      const response = await fetch(`/api/templates/${templateId}/rate`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete rating');
      }

      // Refresh ratings after deletion
      await fetchRatings();
      await fetchBreakdown();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete rating';
      return { success: false, error: errorMessage };
    }
  }, [templateId, fetchRatings, fetchBreakdown]);

  // Mark review as helpful
  const markHelpful = useCallback(
    async (ratingId: string) => {
      try {
        const response = await fetch(`/api/templates/ratings/${ratingId}/helpful`, {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to mark review as helpful');
        }

        // Update the specific rating in the list
        setRatings((prev) =>
          prev.map((r) =>
            r.id === ratingId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
          )
        );

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark as helpful';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Load more ratings (for infinite scroll)
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      // This will trigger a re-fetch with the new page
      // Parent component should handle page state
    }
  }, [pagination]);

  // Initial load
  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Load breakdown separately
  useEffect(() => {
    if (!breakdown) {
      fetchBreakdown();
    }
  }, [breakdown, fetchBreakdown]);

  return {
    ratings,
    breakdown,
    pagination,
    loading,
    error,
    submitRating,
    updateRating,
    deleteRating,
    markHelpful,
    loadMore,
    refresh: fetchRatings,
  };
}

// Hook to check if user has already rated a template
export function useUserRating(templateId: string) {
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!templateId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch all ratings and find the user's rating
        const response = await fetch(`/api/templates/${templateId}/ratings?limit=100`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user rating');
        }

        const data = await response.json();

        if (data.success !== false && data.ratings) {
          // In a real implementation, the backend should return the current user's rating
          // For now, we'll assume the first rating is the user's if it exists
          // You may want to add a separate endpoint: GET /api/templates/:id/ratings/me
          const ratings = data.ratings as Rating[];
          const myRating = ratings.find((r) => r.userId === 'current-user-id'); // Replace with actual user ID check
          setUserRating(myRating || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching user rating:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRating();
  }, [templateId]);

  return { userRating, loading, error, setUserRating };
}
