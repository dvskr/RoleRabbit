import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { logger } from '../utils/logger';

export interface TailoringPreferences {
  mode: string;
  tone: string;
  length: string;
}

export function useTailoringPreferences() {
  const [preferences, setPreferences] = useState<TailoringPreferences>({
    mode: 'partial',
    tone: 'professional',
    length: 'thorough',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await apiService.getTailoringPreferences();
      setPreferences(prefs);
      logger.info('Tailoring preferences loaded', prefs);
    } catch (err: any) {
      logger.error('Failed to load tailoring preferences', err);
      setError(err.message || 'Failed to load preferences');
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<TailoringPreferences>) => {
    try {
      setSaving(true);
      setError(null);
      const newPrefs = await apiService.updateTailoringPreferences(updates);
      setPreferences(newPrefs);
      logger.info('Tailoring preferences updated', newPrefs);
      return newPrefs;
    } catch (err: any) {
      logger.error('Failed to update tailoring preferences', err);
      setError(err.message || 'Failed to update preferences');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const resetPreferences = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const defaultPrefs = await apiService.resetTailoringPreferences();
      setPreferences(defaultPrefs);
      logger.info('Tailoring preferences reset to defaults', defaultPrefs);
      return defaultPrefs;
    } catch (err: any) {
      logger.error('Failed to reset tailoring preferences', err);
      setError(err.message || 'Failed to reset preferences');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    preferences,
    loading,
    error,
    saving,
    updatePreferences,
    resetPreferences,
    reload: loadPreferences,
  };
}

