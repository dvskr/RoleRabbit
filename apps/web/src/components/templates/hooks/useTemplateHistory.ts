/**
 * Custom hook for tracking template usage history
 * Persists download/usage history in localStorage
 */

import { useState, useEffect, useCallback } from 'react';

// localStorage key for history persistence
const HISTORY_STORAGE_KEY = 'template_usage_history';
const MAX_HISTORY_ITEMS = 20; // Keep last 20 used templates

export interface TemplateHistoryItem {
  templateId: string;
  timestamp: number;
  action: 'download' | 'use' | 'preview';
}

/**
 * Load history from localStorage
 */
function loadHistoryFromStorage(): TemplateHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid history format in localStorage, expected array');
      return [];
    }

    // Validate each item
    const validHistory = parsed.filter(item => {
      return (
        item &&
        typeof item.templateId === 'string' &&
        typeof item.timestamp === 'number' &&
        ['download', 'use', 'preview'].includes(item.action)
      );
    });

    return validHistory;
  } catch (error) {
    console.warn('Failed to load history from localStorage:', error);
    return [];
  }
}

/**
 * Save history to localStorage
 */
function saveHistoryToStorage(history: TemplateHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep only the most recent items
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.warn('Failed to save history to localStorage:', error);
  }
}

/**
 * Clear all history from localStorage
 */
function clearHistoryFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear history from localStorage:', error);
  }
}

interface UseTemplateHistoryReturn {
  history: TemplateHistoryItem[];
  recentlyUsed: string[]; // Template IDs sorted by most recent first
  addToHistory: (templateId: string, action: TemplateHistoryItem['action']) => void;
  clearHistory: () => void;
  getTemplateUsageCount: (templateId: string) => number;
  getLastUsed: (templateId: string) => number | null; // timestamp or null
}

/**
 * Hook for template usage history tracking
 */
export function useTemplateHistory(): UseTemplateHistoryReturn {
  const [history, setHistory] = useState<TemplateHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const loaded = loadHistoryFromStorage();
    setHistory(loaded);
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (history.length > 0) {
      saveHistoryToStorage(history);
    }
  }, [history]);

  // Add item to history
  const addToHistory = useCallback((templateId: string, action: TemplateHistoryItem['action']) => {
    const newItem: TemplateHistoryItem = {
      templateId,
      timestamp: Date.now(),
      action,
    };

    setHistory(prev => [newItem, ...prev]);
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryFromStorage();
  }, []);

  // Get usage count for a specific template
  const getTemplateUsageCount = useCallback(
    (templateId: string): number => {
      return history.filter(item => item.templateId === templateId).length;
    },
    [history]
  );

  // Get last used timestamp for a specific template
  const getLastUsed = useCallback(
    (templateId: string): number | null => {
      const templateHistory = history.filter(item => item.templateId === templateId);
      if (templateHistory.length === 0) return null;

      // Return the most recent timestamp
      return Math.max(...templateHistory.map(item => item.timestamp));
    },
    [history]
  );

  // Get recently used template IDs (unique, sorted by most recent)
  const recentlyUsed = history
    .filter(item => item.action === 'use' || item.action === 'download')
    .reduce<string[]>((acc, item) => {
      if (!acc.includes(item.templateId)) {
        acc.push(item.templateId);
      }
      return acc;
    }, []);

  return {
    history,
    recentlyUsed,
    addToHistory,
    clearHistory,
    getTemplateUsageCount,
    getLastUsed,
  };
}
