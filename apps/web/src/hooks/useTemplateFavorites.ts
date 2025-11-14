import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import type { Template } from './useTemplates';

interface UseTemplateFavoritesOptions {
  autoFetch?: boolean;
  onFavoriteAdded?: (templateId: string) => void;
  onFavoriteRemoved?: (templateId: string) => void;
}

export function useTemplateFavorites(options: UseTemplateFavoritesOptions = {}) {
  const {
    autoFetch = true,
    onFavoriteAdded,
    onFavoriteRemoved
  } = options;

  // State
  const [favorites, setFavorites] = useState<Template[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Fetch favorites from API
  const fetchFavorites = useCallback(async (sortBy: 'newest' | 'oldest' | 'name' = 'newest') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTemplateFavorites({ sortBy });

      if (response.success) {
        setFavorites(response.data);
        setFavoriteIds(new Set(response.data.map((t: Template) => t.id)));
      } else {
        throw new Error(response.message || 'Failed to fetch favorites');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add template to favorites
  const addFavorite = useCallback(async (templateId: string) => {
    setError(null);

    // Optimistic update
    setFavoriteIds(prev => new Set(prev).add(templateId));

    try {
      const response = await apiService.addTemplateFavorite(templateId);

      if (response.success) {
        // Track the favorite action
        await apiService.trackTemplateUsage(templateId, 'FAVORITE');

        // Refresh favorites list to get full template data
        await fetchFavorites();

        onFavoriteAdded?.(templateId);
      } else {
        throw new Error(response.message || 'Failed to add favorite');
      }
    } catch (err: any) {
      // Revert optimistic update on error
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });

      setError(err.message || 'Failed to add favorite');
      console.error('Error adding favorite:', err);
    }
  }, [fetchFavorites, onFavoriteAdded]);

  // Remove template from favorites
  const removeFavorite = useCallback(async (templateId: string) => {
    setError(null);

    // Optimistic update
    const previousFavoriteIds = new Set(favoriteIds);
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(templateId);
      return newSet;
    });
    setFavorites(prev => prev.filter(t => t.id !== templateId));

    try {
      const response = await apiService.removeTemplateFavorite(templateId);

      if (response.success) {
        onFavoriteRemoved?.(templateId);
      } else {
        throw new Error(response.message || 'Failed to remove favorite');
      }
    } catch (err: any) {
      // Revert optimistic update on error
      setFavoriteIds(previousFavoriteIds);
      await fetchFavorites(); // Refresh to get correct state

      setError(err.message || 'Failed to remove favorite');
      console.error('Error removing favorite:', err);
    }
  }, [favoriteIds, fetchFavorites, onFavoriteRemoved]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (templateId: string) => {
    if (favoriteIds.has(templateId)) {
      await removeFavorite(templateId);
    } else {
      await addFavorite(templateId);
    }
  }, [favoriteIds, addFavorite, removeFavorite]);

  // Check if template is favorited
  const isFavorite = useCallback((templateId: string) => {
    return favoriteIds.has(templateId);
  }, [favoriteIds]);

  // Sync favorites from localStorage to database
  const syncFromLocalStorage = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      // Get favorites from localStorage
      const localFavorites = localStorage.getItem('templateFavorites');
      if (!localFavorites) {
        console.log('No local favorites to sync');
        return { added: 0, skipped: 0, errors: 0 };
      }

      const favoriteIds = JSON.parse(localFavorites);
      if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
        console.log('No valid local favorites to sync');
        return { added: 0, skipped: 0, errors: 0 };
      }

      // Sync to backend
      const response = await apiService.syncTemplateFavorites(favoriteIds);

      if (response.success) {
        // Clear localStorage after successful sync
        localStorage.removeItem('templateFavorites');

        // Refresh favorites from server
        await fetchFavorites();

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to sync favorites');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync favorites');
      console.error('Error syncing favorites:', err);
      return { added: 0, skipped: 0, errors: 1 };
    } finally {
      setSyncing(false);
    }
  }, [fetchFavorites]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchFavorites();
    }
  }, []); // Only run on mount

  return {
    // Data
    favorites,
    favoriteIds: Array.from(favoriteIds),
    loading,
    error,
    syncing,
    count: favorites.length,

    // Actions
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    syncFromLocalStorage,
    refresh: fetchFavorites
  };
}
