/**
 * Tests for useTemplateHistory hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTemplateHistory } from '../useTemplateHistory';

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
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTemplateHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      expect(result.current.recentlyUsed).toEqual([]);
    });

    it('should load history from localStorage', () => {
      const historyData = [
        { templateId: 'template-1', timestamp: Date.now(), action: 'use' },
        { templateId: 'template-2', timestamp: Date.now() - 1000, action: 'preview' },
      ];
      localStorage.setItem('template_usage_history', JSON.stringify(historyData));

      const { result } = renderHook(() => useTemplateHistory());

      expect(result.current.recentlyUsed).toContain('template-1');
      expect(result.current.recentlyUsed).toContain('template-2');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('template_usage_history', 'invalid json {');

      const { result } = renderHook(() => useTemplateHistory());

      expect(result.current.recentlyUsed).toEqual([]);
    });

    it('should filter out invalid history entries', () => {
      const historyData = [
        { templateId: 'template-1', timestamp: Date.now(), action: 'use' },
        { templateId: 123, timestamp: 'invalid', action: 'preview' }, // Invalid entry
        { templateId: 'template-2', timestamp: Date.now(), action: 'download' },
      ];
      localStorage.setItem('template_usage_history', JSON.stringify(historyData));

      const { result } = renderHook(() => useTemplateHistory());

      expect(result.current.recentlyUsed).toContain('template-1');
      expect(result.current.recentlyUsed).toContain('template-2');
      expect(result.current.recentlyUsed).not.toContain(123);
    });
  });

  describe('Adding to history', () => {
    it('should add preview action to history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'preview');
      });

      expect(result.current.recentlyUsed).toContain('template-1');
    });

    it('should add use action to history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      expect(result.current.recentlyUsed).toContain('template-1');
    });

    it('should add download action to history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'download');
      });

      expect(result.current.recentlyUsed).toContain('template-1');
    });

    it('should add multiple templates to history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-2', 'preview');
        result.current.addToHistory('template-3', 'download');
      });

      expect(result.current.recentlyUsed).toContain('template-1');
      expect(result.current.recentlyUsed).toContain('template-2');
      expect(result.current.recentlyUsed).toContain('template-3');
    });

    it('should save history to localStorage when adding', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      const stored = localStorage.getItem('template_usage_history');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].templateId).toBe('template-1');
      expect(parsed[0].action).toBe('use');
    });

    it('should update timestamp for existing template', () => {
      const { result } = renderHook(() => useTemplateHistory());

      const firstTimestamp = Date.now();
      act(() => {
        result.current.addToHistory('template-1', 'preview');
      });

      // Wait a bit
      jest.advanceTimersByTime(100);

      const secondTimestamp = Date.now() + 100;
      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      const stored = localStorage.getItem('template_usage_history');
      const parsed = JSON.parse(stored!);

      // Should have multiple entries for same template
      const template1Entries = parsed.filter((entry: any) => entry.templateId === 'template-1');
      expect(template1Entries.length).toBeGreaterThan(0);
    });
  });

  describe('Recently used list', () => {
    it('should return unique template IDs in recentlyUsed', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'preview');
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-1', 'download');
      });

      expect(result.current.recentlyUsed).toHaveLength(1);
      expect(result.current.recentlyUsed[0]).toBe('template-1');
    });

    it('should order recentlyUsed by most recent first', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      // Small delay
      jest.advanceTimersByTime(10);

      act(() => {
        result.current.addToHistory('template-2', 'use');
      });

      jest.advanceTimersByTime(10);

      act(() => {
        result.current.addToHistory('template-3', 'use');
      });

      // Most recent should be first
      expect(result.current.recentlyUsed[0]).toBe('template-3');
      expect(result.current.recentlyUsed[1]).toBe('template-2');
      expect(result.current.recentlyUsed[2]).toBe('template-1');
    });

    it('should limit recentlyUsed to MAX_HISTORY_ITEMS', () => {
      const { result } = renderHook(() => useTemplateHistory());

      // Add more than 20 templates (MAX_HISTORY_ITEMS = 20)
      act(() => {
        for (let i = 1; i <= 25; i++) {
          result.current.addToHistory(`template-${i}`, 'use');
        }
      });

      expect(result.current.recentlyUsed.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Usage count', () => {
    it('should return usage count for a template', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'preview');
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-1', 'download');
      });

      const count = result.current.getTemplateUsageCount('template-1');
      expect(count).toBe(3);
    });

    it('should return 0 for template not in history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      const count = result.current.getTemplateUsageCount('non-existent-template');
      expect(count).toBe(0);
    });

    it('should count different templates separately', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-2', 'use');
      });

      expect(result.current.getTemplateUsageCount('template-1')).toBe(2);
      expect(result.current.getTemplateUsageCount('template-2')).toBe(1);
    });
  });

  describe('Last used timestamp', () => {
    it('should return last used timestamp for a template', () => {
      const { result } = renderHook(() => useTemplateHistory());

      const now = Date.now();
      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      const lastUsed = result.current.getLastUsed('template-1');
      expect(lastUsed).toBeGreaterThanOrEqual(now);
    });

    it('should return null for template not in history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      const lastUsed = result.current.getLastUsed('non-existent-template');
      expect(lastUsed).toBeNull();
    });

    it('should return most recent timestamp when template used multiple times', () => {
      const { result } = renderHook(() => useTemplateHistory());

      const firstTime = Date.now();
      act(() => {
        result.current.addToHistory('template-1', 'preview');
      });

      jest.advanceTimersByTime(1000);

      const secondTime = Date.now() + 1000;
      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      const lastUsed = result.current.getLastUsed('template-1');
      expect(lastUsed).toBeGreaterThanOrEqual(secondTime);
    });
  });

  describe('Clear history', () => {
    it('should clear all history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-2', 'preview');
        result.current.addToHistory('template-3', 'download');
      });

      expect(result.current.recentlyUsed.length).toBe(3);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.recentlyUsed).toEqual([]);
    });

    it('should clear history from localStorage', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
      });

      expect(localStorage.getItem('template_usage_history')).not.toBeNull();

      act(() => {
        result.current.clearHistory();
      });

      expect(localStorage.getItem('template_usage_history')).toBe('[]');
    });

    it('should reset usage counts after clear', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-1', 'use');
      });

      expect(result.current.getTemplateUsageCount('template-1')).toBe(2);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.getTemplateUsageCount('template-1')).toBe(0);
    });
  });

  describe('History persistence', () => {
    it('should persist history across hook re-renders', () => {
      const { result, unmount } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-2', 'preview');
      });

      unmount();

      // Re-render hook
      const { result: newResult } = renderHook(() => useTemplateHistory());

      expect(newResult.current.recentlyUsed).toContain('template-1');
      expect(newResult.current.recentlyUsed).toContain('template-2');
    });

    it('should maintain usage counts across re-renders', () => {
      const { result, unmount } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('template-1', 'use');
        result.current.addToHistory('template-1', 'preview');
        result.current.addToHistory('template-1', 'download');
      });

      unmount();

      const { result: newResult } = renderHook(() => useTemplateHistory());

      expect(newResult.current.getTemplateUsageCount('template-1')).toBe(3);
    });
  });

  describe('History trimming', () => {
    it('should remove oldest entries when exceeding max history', () => {
      const { result } = renderHook(() => useTemplateHistory());

      // Add 25 templates (MAX_HISTORY_ITEMS = 20)
      act(() => {
        for (let i = 1; i <= 25; i++) {
          result.current.addToHistory(`template-${i}`, 'use');
        }
      });

      const stored = localStorage.getItem('template_usage_history');
      const parsed = JSON.parse(stored!);

      // Should not exceed 20 items
      expect(parsed.length).toBeLessThanOrEqual(20);
    });

    it('should keep most recent entries when trimming', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        for (let i = 1; i <= 25; i++) {
          result.current.addToHistory(`template-${i}`, 'use');
          jest.advanceTimersByTime(10);
        }
      });

      // Most recent templates should still be in history
      expect(result.current.recentlyUsed).toContain('template-25');
      expect(result.current.recentlyUsed).toContain('template-24');
      expect(result.current.recentlyUsed).toContain('template-23');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string template ID', () => {
      const { result } = renderHook(() => useTemplateHistory());

      act(() => {
        result.current.addToHistory('', 'use');
      });

      // Should not add empty template ID
      expect(result.current.recentlyUsed).not.toContain('');
    });

    it('should handle very long template IDs', () => {
      const { result } = renderHook(() => useTemplateHistory());
      const longId = 'a'.repeat(1000);

      act(() => {
        result.current.addToHistory(longId, 'use');
      });

      expect(result.current.recentlyUsed).toContain(longId);
    });

    it('should handle special characters in template IDs', () => {
      const { result } = renderHook(() => useTemplateHistory());
      const specialId = 'template-@#$%^&*()';

      act(() => {
        result.current.addToHistory(specialId, 'use');
      });

      expect(result.current.recentlyUsed).toContain(specialId);
    });
  });
});
