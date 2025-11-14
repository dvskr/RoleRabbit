/**
 * Unit Tests for useTemplatePreferences Hook
 * Tests preferences management, debounced auto-save, and localStorage sync
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplatePreferences } from '../useTemplatePreferences';
import { apiService } from '../../services/apiService';

// Mock apiService
jest.mock('../../services/apiService', () => ({
  apiService: {
    getTemplatePreferences: jest.fn(),
    saveTemplatePreferences: jest.fn(),
    syncTemplatePreferences: jest.fn()
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

// Mock timers
jest.useFakeTimers();

describe('useTemplatePreferences Hook', () => {
  const mockPreferences = {
    filterSettings: {
      category: 'ATS',
      difficulty: 'BEGINNER',
      isPremium: false
    },
    sortPreference: 'popular' as const,
    viewMode: 'grid' as const
  };

  const defaultPreferences = {
    filterSettings: {},
    sortPreference: 'popular' as const,
    viewMode: 'grid' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    localStorageMock.clear();

    mockApiService.getTemplatePreferences.mockResolvedValue({
      success: true,
      data: mockPreferences
    });

    mockApiService.saveTemplatePreferences.mockResolvedValue({
      success: true,
      data: mockPreferences
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      expect(result.current.preferences).toEqual(defaultPreferences);
      expect(result.current.loading).toBe(false);
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should auto-fetch preferences when autoFetch is true', async () => {
      renderHook(() => useTemplatePreferences({ autoFetch: true }));

      await waitFor(() => {
        expect(mockApiService.getTemplatePreferences).toHaveBeenCalled();
      });
    });

    it('should not auto-fetch when autoFetch is false', () => {
      renderHook(() => useTemplatePreferences({ autoFetch: false }));

      expect(mockApiService.getTemplatePreferences).not.toHaveBeenCalled();
    });
  });

  describe('Fetching Preferences', () => {
    it('should fetch preferences successfully', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.fetchPreferences();
      });

      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle 404 error and use defaults', async () => {
      const error = new Error('Not found');
      (error as any).statusCode = 404;
      mockApiService.getTemplatePreferences.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.fetchPreferences();
      });

      await waitFor(() => {
        expect(result.current.preferences).toEqual(defaultPreferences);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle fetch errors', async () => {
      mockApiService.getTemplatePreferences.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.fetchPreferences();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Saving Preferences', () => {
    it('should save preferences successfully', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      const newPrefs = {
        sortPreference: 'newest' as const,
        viewMode: 'list' as const
      };

      await act(async () => {
        await result.current.savePreferences(newPrefs);
      });

      expect(mockApiService.saveTemplatePreferences).toHaveBeenCalledWith(newPrefs);

      await waitFor(() => {
        expect(result.current.saving).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should save current preferences if no argument provided', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: true })
      );

      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
      });

      mockApiService.saveTemplatePreferences.mockClear();

      await act(async () => {
        await result.current.savePreferences();
      });

      expect(mockApiService.saveTemplatePreferences).toHaveBeenCalledWith(
        mockPreferences
      );
    });

    it('should handle save errors', async () => {
      mockApiService.saveTemplatePreferences.mockRejectedValue(
        new Error('Save failed')
      );

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.savePreferences({ viewMode: 'list' });
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Save failed');
        expect(result.current.saving).toBe(false);
      });
    });
  });

  describe('Updating Preferences', () => {
    it('should update preferences locally', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false, autoSave: false })
      );

      act(() => {
        result.current.updatePreferences({
          sortPreference: 'newest',
          viewMode: 'list'
        });
      });

      expect(result.current.preferences.sortPreference).toBe('newest');
      expect(result.current.preferences.viewMode).toBe('list');
    });

    it('should merge filter settings', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false, autoSave: false })
      );

      // Set initial filters
      act(() => {
        result.current.updatePreferences({
          filterSettings: { category: 'ATS', difficulty: 'BEGINNER' }
        });
      });

      expect(result.current.preferences.filterSettings.category).toBe('ATS');
      expect(result.current.preferences.filterSettings.difficulty).toBe('BEGINNER');

      // Update with additional filter
      act(() => {
        result.current.updatePreferences({
          filterSettings: { layout: 'SINGLE_COLUMN' }
        });
      });

      // Should merge, not replace
      expect(result.current.preferences.filterSettings.category).toBe('ATS');
      expect(result.current.preferences.filterSettings.difficulty).toBe('BEGINNER');
      expect(result.current.preferences.filterSettings.layout).toBe('SINGLE_COLUMN');
    });

    it('should not trigger save when autoSave is false', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false, autoSave: false })
      );

      act(() => {
        result.current.updatePreferences({ viewMode: 'list' });
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(mockApiService.saveTemplatePreferences).not.toHaveBeenCalled();
    });
  });

  describe('Auto-Save with Debounce', () => {
    it('should auto-save after debounce delay', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({
          autoFetch: false,
          autoSave: true,
          debounceMs: 1000
        })
      );

      act(() => {
        result.current.updatePreferences({ viewMode: 'list' });
      });

      // Should not save immediately
      expect(mockApiService.saveTemplatePreferences).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockApiService.saveTemplatePreferences).toHaveBeenCalledWith({
          viewMode: 'list'
        });
      });
    });

    it('should debounce multiple rapid updates', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({
          autoFetch: false,
          autoSave: true,
          debounceMs: 1000
        })
      );

      // Make multiple rapid updates
      act(() => {
        result.current.updatePreferences({ viewMode: 'list' });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      act(() => {
        result.current.updatePreferences({ sortPreference: 'newest' });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      act(() => {
        result.current.updatePreferences({ sortPreference: 'rating' });
      });

      // Should not have saved yet
      expect(mockApiService.saveTemplatePreferences).not.toHaveBeenCalled();

      // Complete the debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should only save once with the last update
        expect(mockApiService.saveTemplatePreferences).toHaveBeenCalledTimes(1);
        expect(mockApiService.saveTemplatePreferences).toHaveBeenCalledWith({
          sortPreference: 'rating'
        });
      });
    });

    it('should use custom debounce delay', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({
          autoFetch: false,
          autoSave: true,
          debounceMs: 2000
        })
      );

      act(() => {
        result.current.updatePreferences({ viewMode: 'list' });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not save after 1000ms
      expect(mockApiService.saveTemplatePreferences).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should save after 2000ms
      await waitFor(() => {
        expect(mockApiService.saveTemplatePreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Settings', () => {
    it('should update filter settings', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false, autoSave: false })
      );

      act(() => {
        result.current.updateFilterSettings({
          category: 'CREATIVE',
          difficulty: 'INTERMEDIATE'
        });
      });

      expect(result.current.preferences.filterSettings.category).toBe('CREATIVE');
      expect(result.current.preferences.filterSettings.difficulty).toBe('INTERMEDIATE');
    });

    it('should merge filter settings with existing ones', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: true, autoSave: false })
      );

      await waitFor(() => {
        expect(result.current.preferences.filterSettings.category).toBe('ATS');
      });

      act(() => {
        result.current.updateFilterSettings({
          layout: 'TWO_COLUMN',
          isPremium: true
        });
      });

      // Should keep existing category
      expect(result.current.preferences.filterSettings.category).toBe('ATS');
      // Should add new filters
      expect(result.current.preferences.filterSettings.layout).toBe('TWO_COLUMN');
      expect(result.current.preferences.filterSettings.isPremium).toBe(true);
    });
  });

  describe('Sort Preference', () => {
    it('should update sort preference', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false, autoSave: false })
      );

      act(() => {
        result.current.updateSortPreference('rating');
      });

      expect(result.current.preferences.sortPreference).toBe('rating');
    });

    it('should support all sort options', () => {
      const sortOptions = ['popular', 'newest', 'rating', 'downloads', 'name'] as const;

      sortOptions.forEach(sortBy => {
        const { result } = renderHook(() =>
          useTemplatePreferences({ autoFetch: false, autoSave: false })
        );

        act(() => {
          result.current.updateSortPreference(sortBy);
        });

        expect(result.current.preferences.sortPreference).toBe(sortBy);
      });
    });
  });

  describe('View Mode', () => {
    it('should update view mode', () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false, autoSave: false })
      );

      act(() => {
        result.current.updateViewMode('list');
      });

      expect(result.current.preferences.viewMode).toBe('list');

      act(() => {
        result.current.updateViewMode('grid');
      });

      expect(result.current.preferences.viewMode).toBe('grid');
    });
  });

  describe('Reset Preferences', () => {
    it('should reset to defaults without autoSave', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: true, autoSave: false })
      );

      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
      });

      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences).toEqual(defaultPreferences);
      expect(mockApiService.saveTemplatePreferences).not.toHaveBeenCalled();
    });

    it('should reset and save with autoSave', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: true, autoSave: true })
      );

      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
      });

      await act(async () => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences).toEqual(defaultPreferences);

      await waitFor(() => {
        expect(mockApiService.saveTemplatePreferences).toHaveBeenCalledWith(
          defaultPreferences
        );
      });
    });
  });

  describe('LocalStorage Sync', () => {
    it('should sync preferences from localStorage', async () => {
      localStorageMock.setItem('templateCategory', 'CREATIVE');
      localStorageMock.setItem('templateDifficulty', 'INTERMEDIATE');
      localStorageMock.setItem('templateSortBy', 'newest');
      localStorageMock.setItem('templateViewMode', 'list');

      const syncedPrefs = {
        filterSettings: {
          category: 'CREATIVE',
          difficulty: 'INTERMEDIATE'
        },
        sortPreference: 'newest' as const,
        viewMode: 'list' as const
      };

      mockApiService.syncTemplatePreferences.mockResolvedValue({
        success: true,
        data: syncedPrefs
      });

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.syncFromLocalStorage();
      });

      expect(mockApiService.syncTemplatePreferences).toHaveBeenCalledWith({
        category: 'CREATIVE',
        difficulty: 'INTERMEDIATE',
        sortBy: 'newest',
        viewMode: 'list'
      });

      await waitFor(() => {
        expect(result.current.preferences).toEqual(syncedPrefs);
      });

      // LocalStorage should be cleared
      expect(localStorageMock.getItem('templateCategory')).toBeNull();
      expect(localStorageMock.getItem('templateDifficulty')).toBeNull();
      expect(localStorageMock.getItem('templateSortBy')).toBeNull();
      expect(localStorageMock.getItem('templateViewMode')).toBeNull();
    });

    it('should handle empty localStorage', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.syncFromLocalStorage();
      });

      expect(mockApiService.syncTemplatePreferences).not.toHaveBeenCalled();
    });

    it('should handle partial localStorage data', async () => {
      localStorageMock.setItem('templateCategory', 'ATS');
      localStorageMock.setItem('templateViewMode', 'list');
      // Missing other fields

      mockApiService.syncTemplatePreferences.mockResolvedValue({
        success: true,
        data: mockPreferences
      });

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.syncFromLocalStorage();
      });

      expect(mockApiService.syncTemplatePreferences).toHaveBeenCalledWith({
        category: 'ATS',
        viewMode: 'list'
      });
    });

    it('should handle sync errors', async () => {
      localStorageMock.setItem('templateCategory', 'ATS');

      mockApiService.syncTemplatePreferences.mockRejectedValue(
        new Error('Sync failed')
      );

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.syncFromLocalStorage();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Sync failed');
      });

      // LocalStorage should NOT be cleared on error
      expect(localStorageMock.getItem('templateCategory')).toBe('ATS');
    });

    it('should handle API error response', async () => {
      localStorageMock.setItem('templateCategory', 'ATS');

      mockApiService.syncTemplatePreferences.mockResolvedValue({
        success: false,
        message: 'Invalid preferences'
      });

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      await act(async () => {
        await result.current.syncFromLocalStorage();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Invalid preferences');
      });
    });
  });

  describe('Refresh', () => {
    it('should refresh preferences', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      mockApiService.getTemplatePreferences.mockClear();

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockApiService.getTemplatePreferences).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const { unmount } = renderHook(() =>
        useTemplatePreferences({
          autoFetch: false,
          autoSave: true,
          debounceMs: 1000
        })
      );

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should set loading state while fetching', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      let loadingDuringFetch = false;

      act(() => {
        result.current.fetchPreferences().then(() => {});
        loadingDuringFetch = result.current.loading;
      });

      expect(loadingDuringFetch).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set saving state while saving', async () => {
      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      let savingDuringSave = false;

      act(() => {
        result.current.savePreferences({ viewMode: 'list' }).then(() => {});
        savingDuringSave = result.current.saving;
      });

      expect(savingDuringSave).toBe(true);

      await waitFor(() => {
        expect(result.current.saving).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error on new operations', async () => {
      mockApiService.getTemplatePreferences.mockRejectedValue(
        new Error('First error')
      );

      const { result } = renderHook(() =>
        useTemplatePreferences({ autoFetch: false })
      );

      // Cause an error
      await act(async () => {
        await result.current.fetchPreferences();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // New operation should clear error
      mockApiService.saveTemplatePreferences.mockResolvedValue({
        success: true,
        data: mockPreferences
      });

      await act(async () => {
        await result.current.savePreferences({ viewMode: 'list' });
      });

      expect(result.current.error).toBeNull();
    });
  });
});
