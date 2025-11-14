import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export interface TemplatePreferences {
  filterSettings: {
    category?: string;
    difficulty?: string;
    layout?: string;
    colorScheme?: string;
    isPremium?: boolean;
    industry?: string[];
    minRating?: number;
    maxRating?: number;
  };
  sortPreference: 'popular' | 'newest' | 'rating' | 'downloads' | 'name';
  viewMode: 'grid' | 'list';
}

const DEFAULT_PREFERENCES: TemplatePreferences = {
  filterSettings: {},
  sortPreference: 'popular',
  viewMode: 'grid'
};

interface UseTemplatePreferencesOptions {
  autoFetch?: boolean;
  autoSave?: boolean;
  debounceMs?: number;
}

export function useTemplatePreferences(options: UseTemplatePreferencesOptions = {}) {
  const {
    autoFetch = true,
    autoSave = false,
    debounceMs = 1000
  } = options;

  // State
  const [preferences, setPreferences] = useState<TemplatePreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch preferences from API
  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTemplatePreferences();

      if (response.success) {
        setPreferences(response.data || DEFAULT_PREFERENCES);
      } else {
        throw new Error(response.message || 'Failed to fetch preferences');
      }
    } catch (err: any) {
      // If preferences don't exist yet, use defaults
      if (err.statusCode === 404) {
        setPreferences(DEFAULT_PREFERENCES);
      } else {
        setError(err.message || 'Failed to fetch preferences');
        console.error('Error fetching preferences:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Save preferences to API
  const savePreferences = useCallback(async (prefs: Partial<TemplatePreferences> = {}) => {
    setSaving(true);
    setError(null);

    try {
      const prefsToSave = Object.keys(prefs).length > 0 ? prefs : preferences;

      const response = await apiService.saveTemplatePreferences(prefsToSave);

      if (response.success) {
        setPreferences(response.data);
      } else {
        throw new Error(response.message || 'Failed to save preferences');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  // Update preferences with debounce
  const updatePreferences = useCallback((updates: Partial<TemplatePreferences>) => {
    // Update local state immediately
    setPreferences(prev => ({
      ...prev,
      ...updates,
      filterSettings: {
        ...prev.filterSettings,
        ...(updates.filterSettings || {})
      }
    }));

    // If auto-save is enabled, debounce the save
    if (autoSave) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        savePreferences(updates);
      }, debounceMs);

      setSaveTimeout(timeout);
    }
  }, [autoSave, debounceMs, saveTimeout, savePreferences]);

  // Update filter settings
  const updateFilterSettings = useCallback((filters: Partial<TemplatePreferences['filterSettings']>) => {
    updatePreferences({
      filterSettings: {
        ...preferences.filterSettings,
        ...filters
      }
    });
  }, [preferences.filterSettings, updatePreferences]);

  // Update sort preference
  const updateSortPreference = useCallback((sortBy: TemplatePreferences['sortPreference']) => {
    updatePreferences({ sortPreference: sortBy });
  }, [updatePreferences]);

  // Update view mode
  const updateViewMode = useCallback((mode: TemplatePreferences['viewMode']) => {
    updatePreferences({ viewMode: mode });
  }, [updatePreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    if (autoSave) {
      savePreferences(DEFAULT_PREFERENCES);
    }
  }, [autoSave, savePreferences]);

  // Sync from localStorage
  const syncFromLocalStorage = useCallback(async () => {
    setError(null);

    try {
      // Get various preference keys from localStorage
      const localPrefs: any = {};

      const storedCategory = localStorage.getItem('templateCategory');
      const storedDifficulty = localStorage.getItem('templateDifficulty');
      const storedLayout = localStorage.getItem('templateLayout');
      const storedColorScheme = localStorage.getItem('templateColorScheme');
      const storedSortBy = localStorage.getItem('templateSortBy');
      const storedViewMode = localStorage.getItem('templateViewMode');

      if (storedCategory) localPrefs.category = storedCategory;
      if (storedDifficulty) localPrefs.difficulty = storedDifficulty;
      if (storedLayout) localPrefs.layout = storedLayout;
      if (storedColorScheme) localPrefs.colorScheme = storedColorScheme;
      if (storedSortBy) localPrefs.sortBy = storedSortBy;
      if (storedViewMode) localPrefs.viewMode = storedViewMode;

      // Only sync if we have local preferences
      if (Object.keys(localPrefs).length === 0) {
        console.log('No local preferences to sync');
        return;
      }

      const response = await apiService.syncTemplatePreferences(localPrefs);

      if (response.success) {
        setPreferences(response.data);

        // Clear localStorage after successful sync
        localStorage.removeItem('templateCategory');
        localStorage.removeItem('templateDifficulty');
        localStorage.removeItem('templateLayout');
        localStorage.removeItem('templateColorScheme');
        localStorage.removeItem('templateSortBy');
        localStorage.removeItem('templateViewMode');
      } else {
        throw new Error(response.message || 'Failed to sync preferences');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync preferences');
      console.error('Error syncing preferences:', err);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPreferences();
    }
  }, []); // Only run on mount

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    // Data
    preferences,
    loading,
    saving,
    error,

    // Actions
    fetchPreferences,
    savePreferences,
    updatePreferences,
    updateFilterSettings,
    updateSortPreference,
    updateViewMode,
    resetPreferences,
    syncFromLocalStorage,
    refresh: fetchPreferences
  };
}
