/**
 * Unit Tests for useTemplateFavorites Hook
 * Tests favorites management, optimistic updates, and localStorage sync
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateFavorites } from '../useTemplateFavorites';
import { apiService } from '../../services/apiService';

// Mock apiService
jest.mock('../../services/apiService', () => ({
  apiService: {
    getTemplateFavorites: jest.fn(),
    addTemplateFavorite: jest.fn(),
    removeTemplateFavorite: jest.fn(),
    isTemplateFavorited: jest.fn(),
    syncTemplateFavorites: jest.fn(),
    trackTemplateUsage: jest.fn()
  }
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useTemplateFavorites Hook', () => {
  const mockFavorites = [
    {
      id: 'tpl_1',
      name: 'Professional Resume',
      category: 'ATS',
      description: 'ATS-friendly template',
      preview: 'preview1.png',
      features: ['Clean layout'],
      difficulty: 'BEGINNER',
      industry: ['Technology'],
      layout: 'SINGLE_COLUMN',
      colorScheme: 'BLUE',
      isPremium: false,
      rating: 4.5,
      downloads: 1000,
      author: 'John Doe',
      tags: ['professional']
    },
    {
      id: 'tpl_2',
      name: 'Creative Portfolio',
      category: 'CREATIVE',
      description: 'Creative template',
      preview: 'preview2.png',
      features: ['Bold design'],
      difficulty: 'INTERMEDIATE',
      industry: ['Design'],
      layout: 'TWO_COLUMN',
      colorScheme: 'GREEN',
      isPremium: true,
      rating: 4.8,
      downloads: 500,
      author: 'Jane Smith',
      tags: ['creative']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockApiService.getTemplateFavorites.mockResolvedValue({
      success: true,
      data: mockFavorites
    });
    mockApiService.trackTemplateUsage.mockResolvedValue({
      success: true,
      message: 'Tracked'
    });
  });

  describe('Initialization', () => {
    it('should initialize with empty favorites', () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      expect(result.current.favorites).toEqual([]);
      expect(result.current.favoriteIds).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.count).toBe(0);
    });

    it('should auto-fetch favorites when autoFetch is true', async () => {
      renderHook(() => useTemplateFavorites({ autoFetch: true }));

      await waitFor(() => {
        expect(mockApiService.getTemplateFavorites).toHaveBeenCalled();
      });
    });

    it('should not auto-fetch favorites when autoFetch is false', () => {
      renderHook(() => useTemplateFavorites({ autoFetch: false }));

      expect(mockApiService.getTemplateFavorites).not.toHaveBeenCalled();
    });
  });

  describe('Fetching Favorites', () => {
    it('should fetch favorites successfully', async () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        expect(result.current.favorites).toEqual(mockFavorites);
        expect(result.current.favoriteIds).toEqual(['tpl_1', 'tpl_2']);
        expect(result.current.count).toBe(2);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle fetch errors', async () => {
      mockApiService.getTemplateFavorites.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should support different sort options', async () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      await act(async () => {
        await result.current.fetchFavorites('oldest');
      });

      expect(mockApiService.getTemplateFavorites).toHaveBeenCalledWith({
        sortBy: 'oldest'
      });

      await act(async () => {
        await result.current.fetchFavorites('name');
      });

      expect(mockApiService.getTemplateFavorites).toHaveBeenCalledWith({
        sortBy: 'name'
      });
    });
  });

  describe('Adding Favorites', () => {
    it('should add favorite with optimistic update', async () => {
      mockApiService.addTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Added to favorites'
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      await act(async () => {
        await result.current.addFavorite('tpl_3');
      });

      // Should have called API
      expect(mockApiService.addTemplateFavorite).toHaveBeenCalledWith('tpl_3');

      // Should track usage
      expect(mockApiService.trackTemplateUsage).toHaveBeenCalledWith(
        'tpl_3',
        'FAVORITE'
      );

      // Should refresh favorites
      await waitFor(() => {
        expect(mockApiService.getTemplateFavorites).toHaveBeenCalled();
      });
    });

    it('should call onFavoriteAdded callback', async () => {
      mockApiService.addTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Added'
      });

      const onFavoriteAdded = jest.fn();

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false, onFavoriteAdded })
      );

      await act(async () => {
        await result.current.addFavorite('tpl_1');
      });

      await waitFor(() => {
        expect(onFavoriteAdded).toHaveBeenCalledWith('tpl_1');
      });
    });

    it('should revert optimistic update on error', async () => {
      mockApiService.addTemplateFavorite.mockRejectedValue(
        new Error('Failed to add favorite')
      );

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      // Initially no favorites
      expect(result.current.favoriteIds).toEqual([]);

      await act(async () => {
        await result.current.addFavorite('tpl_1');
      });

      // Should be reverted after error
      await waitFor(() => {
        expect(result.current.favoriteIds).toEqual([]);
        expect(result.current.error).toBe('Failed to add favorite');
      });
    });

    it('should handle API error response', async () => {
      mockApiService.addTemplateFavorite.mockResolvedValue({
        success: false,
        message: 'Template not found'
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      await act(async () => {
        await result.current.addFavorite('invalid');
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Template not found');
      });
    });
  });

  describe('Removing Favorites', () => {
    beforeEach(() => {
      // Setup with existing favorites
      mockApiService.getTemplateFavorites.mockResolvedValue({
        success: true,
        data: mockFavorites
      });
    });

    it('should remove favorite with optimistic update', async () => {
      mockApiService.removeTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Removed from favorites'
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: true })
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.favoriteIds).toContain('tpl_1');
      });

      await act(async () => {
        await result.current.removeFavorite('tpl_1');
      });

      expect(mockApiService.removeTemplateFavorite).toHaveBeenCalledWith('tpl_1');

      // Favorite should be removed from state
      await waitFor(() => {
        expect(result.current.favoriteIds).not.toContain('tpl_1');
        expect(result.current.favorites.length).toBeLessThan(mockFavorites.length);
      });
    });

    it('should call onFavoriteRemoved callback', async () => {
      mockApiService.removeTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Removed'
      });

      const onFavoriteRemoved = jest.fn();

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: true, onFavoriteRemoved })
      );

      await waitFor(() => {
        expect(result.current.favoriteIds).toContain('tpl_1');
      });

      await act(async () => {
        await result.current.removeFavorite('tpl_1');
      });

      await waitFor(() => {
        expect(onFavoriteRemoved).toHaveBeenCalledWith('tpl_1');
      });
    });

    it('should revert optimistic update on error', async () => {
      mockApiService.removeTemplateFavorite.mockRejectedValue(
        new Error('Failed to remove favorite')
      );

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.favoriteIds).toEqual(['tpl_1', 'tpl_2']);
      });

      const initialCount = result.current.count;

      await act(async () => {
        await result.current.removeFavorite('tpl_1');
      });

      // Should revert after error
      await waitFor(() => {
        expect(result.current.favoriteIds).toContain('tpl_1');
        expect(result.current.error).toBe('Failed to remove favorite');
      });
    });
  });

  describe('Toggle Favorite', () => {
    it('should add favorite when not favorited', async () => {
      mockApiService.addTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Added'
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      expect(result.current.isFavorite('tpl_1')).toBe(false);

      await act(async () => {
        await result.current.toggleFavorite('tpl_1');
      });

      expect(mockApiService.addTemplateFavorite).toHaveBeenCalledWith('tpl_1');
    });

    it('should remove favorite when favorited', async () => {
      mockApiService.removeTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Removed'
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.isFavorite('tpl_1')).toBe(true);
      });

      await act(async () => {
        await result.current.toggleFavorite('tpl_1');
      });

      expect(mockApiService.removeTemplateFavorite).toHaveBeenCalledWith('tpl_1');
    });
  });

  describe('Check Favorite Status', () => {
    it('should correctly identify favorited templates', async () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.isFavorite('tpl_1')).toBe(true);
        expect(result.current.isFavorite('tpl_2')).toBe(true);
        expect(result.current.isFavorite('tpl_3')).toBe(false);
      });
    });
  });

  describe('LocalStorage Sync', () => {
    it('should sync favorites from localStorage', async () => {
      const localFavorites = ['tpl_1', 'tpl_2', 'tpl_3'];
      localStorageMock.setItem(
        'templateFavorites',
        JSON.stringify(localFavorites)
      );

      mockApiService.syncTemplateFavorites.mockResolvedValue({
        success: true,
        data: { added: 3, skipped: 0, errors: 0 }
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncFromLocalStorage();
      });

      expect(mockApiService.syncTemplateFavorites).toHaveBeenCalledWith(
        localFavorites
      );

      expect(syncResult).toEqual({ added: 3, skipped: 0, errors: 0 });

      // LocalStorage should be cleared after successful sync
      expect(localStorageMock.getItem('templateFavorites')).toBeNull();

      // Should refresh favorites from server
      await waitFor(() => {
        expect(mockApiService.getTemplateFavorites).toHaveBeenCalled();
      });
    });

    it('should handle empty localStorage', async () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncFromLocalStorage();
      });

      expect(syncResult).toEqual({ added: 0, skipped: 0, errors: 0 });
      expect(mockApiService.syncTemplateFavorites).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON in localStorage', async () => {
      localStorageMock.setItem('templateFavorites', 'invalid json');

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      await act(async () => {
        await result.current.syncFromLocalStorage();
      });

      // Should handle gracefully
      expect(result.current.syncing).toBe(false);
    });

    it('should handle empty array in localStorage', async () => {
      localStorageMock.setItem('templateFavorites', JSON.stringify([]));

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncFromLocalStorage();
      });

      expect(syncResult).toEqual({ added: 0, skipped: 0, errors: 0 });
      expect(mockApiService.syncTemplateFavorites).not.toHaveBeenCalled();
    });

    it('should handle sync errors', async () => {
      localStorageMock.setItem(
        'templateFavorites',
        JSON.stringify(['tpl_1', 'tpl_2'])
      );

      mockApiService.syncTemplateFavorites.mockRejectedValue(
        new Error('Sync failed')
      );

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncFromLocalStorage();
      });

      expect(syncResult).toEqual({ added: 0, skipped: 0, errors: 1 });
      expect(result.current.error).toBe('Sync failed');

      // LocalStorage should NOT be cleared on error
      expect(localStorageMock.getItem('templateFavorites')).not.toBeNull();
    });

    it('should set syncing state during sync', async () => {
      localStorageMock.setItem(
        'templateFavorites',
        JSON.stringify(['tpl_1'])
      );

      mockApiService.syncTemplateFavorites.mockResolvedValue({
        success: true,
        data: { added: 1, skipped: 0, errors: 0 }
      });

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      let syncingDuringSync = false;

      act(() => {
        result.current.syncFromLocalStorage().then(() => {});
        syncingDuringSync = result.current.syncing;
      });

      expect(syncingDuringSync).toBe(true);

      await waitFor(() => {
        expect(result.current.syncing).toBe(false);
      });
    });
  });

  describe('Refresh', () => {
    it('should refresh favorites', async () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      mockApiService.getTemplateFavorites.mockClear();

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockApiService.getTemplateFavorites).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should clear error when performing new actions', async () => {
      mockApiService.addTemplateFavorite.mockRejectedValue(
        new Error('First error')
      );

      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: false })
      );

      // Cause an error
      await act(async () => {
        await result.current.addFavorite('tpl_1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // New action should clear error
      mockApiService.addTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Added'
      });

      await act(async () => {
        await result.current.addFavorite('tpl_2');
      });

      // Error should be cleared during new action
      expect(result.current.error).toBeNull();
    });
  });

  describe('Count', () => {
    it('should update count correctly', async () => {
      const { result } = renderHook(() =>
        useTemplateFavorites({ autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.count).toBe(2);
      });

      mockApiService.removeTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Removed'
      });

      await act(async () => {
        await result.current.removeFavorite('tpl_1');
      });

      // Count should decrease (optimistic update)
      expect(result.current.count).toBe(1);
    });
  });

  describe('Multiple Callbacks', () => {
    it('should handle both callbacks being called', async () => {
      mockApiService.addTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Added'
      });
      mockApiService.removeTemplateFavorite.mockResolvedValue({
        success: true,
        message: 'Removed'
      });

      const onAdded = jest.fn();
      const onRemoved = jest.fn();

      const { result } = renderHook(() =>
        useTemplateFavorites({
          autoFetch: true,
          onFavoriteAdded: onAdded,
          onFavoriteRemoved: onRemoved
        })
      );

      await waitFor(() => {
        expect(result.current.favoriteIds).toContain('tpl_1');
      });

      // Add a new favorite
      await act(async () => {
        await result.current.addFavorite('tpl_3');
      });

      await waitFor(() => {
        expect(onAdded).toHaveBeenCalledWith('tpl_3');
      });

      // Remove an existing favorite
      await act(async () => {
        await result.current.removeFavorite('tpl_1');
      });

      await waitFor(() => {
        expect(onRemoved).toHaveBeenCalledWith('tpl_1');
      });

      expect(onAdded).toHaveBeenCalledTimes(1);
      expect(onRemoved).toHaveBeenCalledTimes(1);
    });
  });
});
