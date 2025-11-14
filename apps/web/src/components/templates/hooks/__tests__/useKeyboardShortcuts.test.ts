/**
 * Tests for useKeyboardShortcuts hook
 */

import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { RefObject } from 'react';
import * as analytics from '../../utils/analytics';

// Mock analytics module
jest.mock('../../utils/analytics', () => ({
  trackKeyboardShortcut: jest.fn(),
  trackHelpModalOpen: jest.fn(),
}));

describe('useKeyboardShortcuts', () => {
  let mockSearchInput: HTMLInputElement;
  let searchInputRef: RefObject<HTMLInputElement>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchInput = document.createElement('input');
    mockSearchInput.focus = jest.fn();
    mockSearchInput.blur = jest.fn();
    mockSearchInput.value = '';
    mockSearchInput.dispatchEvent = jest.fn();
    searchInputRef = { current: mockSearchInput };
  });

  const createKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
  };

  describe('Focus search shortcuts', () => {
    it('should focus search input on "/" key', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('/');
      document.dispatchEvent(event);

      expect(mockSearchInput.focus).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('/', 'Focus search');
    });

    it('should focus search input on Ctrl+K', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('k', { ctrlKey: true });
      document.dispatchEvent(event);

      expect(mockSearchInput.focus).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('Ctrl+K', 'Focus search');
    });

    it('should focus search input on Cmd+K (Mac)', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('k', { metaKey: true });
      document.dispatchEvent(event);

      expect(mockSearchInput.focus).toHaveBeenCalled();
    });

    it('should not focus search when typing in input', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const input = document.createElement('input');
      const event = createKeyboardEvent('/');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      document.dispatchEvent(event);

      expect(mockSearchInput.focus).not.toHaveBeenCalled();
    });

    it('should not focus search when typing in textarea', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const textarea = document.createElement('textarea');
      const event = createKeyboardEvent('/');
      Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
      document.dispatchEvent(event);

      expect(mockSearchInput.focus).not.toHaveBeenCalled();
    });
  });

  describe('Clear search shortcut', () => {
    it('should clear search on Escape when search is focused', () => {
      mockSearchInput.value = 'test query';
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('Escape');
      Object.defineProperty(event, 'target', { value: mockSearchInput, enumerable: true });
      document.dispatchEvent(event);

      expect(mockSearchInput.value).toBe('');
      expect(mockSearchInput.blur).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('Esc', 'Clear search');
    });

    it('should not clear search on Escape when other element is focused', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('Escape');
      document.dispatchEvent(event);

      expect(mockSearchInput.value).toBe('');
      expect(mockSearchInput.blur).not.toHaveBeenCalled();
    });
  });

  describe('Clear filters shortcut', () => {
    it('should call onClearFilters on Ctrl+Shift+C', () => {
      const onClearFilters = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onClearFilters })
      );

      const event = createKeyboardEvent('C', { ctrlKey: true, shiftKey: true });
      document.dispatchEvent(event);

      expect(onClearFilters).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('Ctrl+Shift+C', 'Clear all filters');
    });

    it('should work with Cmd+Shift+C on Mac', () => {
      const onClearFilters = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onClearFilters })
      );

      const event = createKeyboardEvent('C', { metaKey: true, shiftKey: true });
      document.dispatchEvent(event);

      expect(onClearFilters).toHaveBeenCalled();
    });

    it('should not trigger when typing in input', () => {
      const onClearFilters = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onClearFilters })
      );

      const input = document.createElement('input');
      const event = createKeyboardEvent('C', { ctrlKey: true, shiftKey: true });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      document.dispatchEvent(event);

      expect(onClearFilters).not.toHaveBeenCalled();
    });
  });

  describe('Toggle filters shortcut', () => {
    it('should call onToggleFilters on Ctrl+Shift+F', () => {
      const onToggleFilters = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onToggleFilters })
      );

      const event = createKeyboardEvent('F', { ctrlKey: true, shiftKey: true });
      document.dispatchEvent(event);

      expect(onToggleFilters).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('Ctrl+Shift+F', 'Toggle filters');
    });
  });

  describe('View mode shortcuts', () => {
    it('should switch to grid view on Ctrl+1', () => {
      const onChangeViewMode = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onChangeViewMode })
      );

      const event = createKeyboardEvent('1', { ctrlKey: true });
      document.dispatchEvent(event);

      expect(onChangeViewMode).toHaveBeenCalledWith('grid');
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('Ctrl+1', 'Switch to grid view');
    });

    it('should switch to list view on Ctrl+2', () => {
      const onChangeViewMode = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onChangeViewMode })
      );

      const event = createKeyboardEvent('2', { ctrlKey: true });
      document.dispatchEvent(event);

      expect(onChangeViewMode).toHaveBeenCalledWith('list');
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('Ctrl+2', 'Switch to list view');
    });
  });

  describe('Pagination shortcuts', () => {
    it('should go to next page on ArrowRight', () => {
      const onNextPage = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onNextPage,
          currentPage: 1,
          totalPages: 5,
        })
      );

      const event = createKeyboardEvent('ArrowRight');
      document.dispatchEvent(event);

      expect(onNextPage).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('→', 'Next page');
    });

    it('should go to previous page on ArrowLeft', () => {
      const onPrevPage = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onPrevPage,
          currentPage: 2,
          totalPages: 5,
        })
      );

      const event = createKeyboardEvent('ArrowLeft');
      document.dispatchEvent(event);

      expect(onPrevPage).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('←', 'Previous page');
    });

    it('should not go to previous page when on first page', () => {
      const onPrevPage = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onPrevPage,
          currentPage: 1,
          totalPages: 5,
        })
      );

      const event = createKeyboardEvent('ArrowLeft');
      document.dispatchEvent(event);

      expect(onPrevPage).not.toHaveBeenCalled();
    });

    it('should not go to next page when on last page', () => {
      const onNextPage = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onNextPage,
          currentPage: 5,
          totalPages: 5,
        })
      );

      const event = createKeyboardEvent('ArrowRight');
      document.dispatchEvent(event);

      expect(onNextPage).not.toHaveBeenCalled();
    });

    it('should not trigger pagination when typing in input', () => {
      const onNextPage = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onNextPage,
          currentPage: 1,
          totalPages: 5,
        })
      );

      const input = document.createElement('input');
      const event = createKeyboardEvent('ArrowRight');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      document.dispatchEvent(event);

      expect(onNextPage).not.toHaveBeenCalled();
    });
  });

  describe('Help modal shortcut', () => {
    it('should show help modal on "?" key', () => {
      const onShowHelp = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onShowHelp })
      );

      const event = createKeyboardEvent('?');
      document.dispatchEvent(event);

      expect(onShowHelp).toHaveBeenCalled();
      expect(analytics.trackKeyboardShortcut).toHaveBeenCalledWith('?', 'Show help');
      expect(analytics.trackHelpModalOpen).toHaveBeenCalled();
    });

    it('should not show help when typing in input', () => {
      const onShowHelp = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({ onShowHelp })
      );

      const input = document.createElement('input');
      const event = createKeyboardEvent('?');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      document.dispatchEvent(event);

      expect(onShowHelp).not.toHaveBeenCalled();
    });
  });

  describe('Modal state handling', () => {
    it('should not trigger shortcuts when modal is open (except Escape)', () => {
      const onClearFilters = jest.fn();
      const onNextPage = jest.fn();
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onClearFilters,
          onNextPage,
          isModalOpen: true,
          currentPage: 1,
          totalPages: 5,
        })
      );

      // Try various shortcuts
      document.dispatchEvent(createKeyboardEvent('C', { ctrlKey: true, shiftKey: true }));
      document.dispatchEvent(createKeyboardEvent('ArrowRight'));
      document.dispatchEvent(createKeyboardEvent('/'));

      expect(onClearFilters).not.toHaveBeenCalled();
      expect(onNextPage).not.toHaveBeenCalled();
    });

    it('should still allow Escape when modal is open', () => {
      mockSearchInput.value = 'test';
      const { } = renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef,
          isModalOpen: true,
        })
      );

      const event = createKeyboardEvent('Escape');
      Object.defineProperty(event, 'target', { value: mockSearchInput, enumerable: true });
      document.dispatchEvent(event);

      expect(mockSearchInput.value).toBe('');
      expect(mockSearchInput.blur).toHaveBeenCalled();
    });
  });

  describe('Event cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should not trigger shortcuts after unmount', () => {
      const onClearFilters = jest.fn();
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({ onClearFilters })
      );

      unmount();

      const event = createKeyboardEvent('C', { ctrlKey: true, shiftKey: true });
      document.dispatchEvent(event);

      expect(onClearFilters).not.toHaveBeenCalled();
    });
  });

  describe('Multiple callbacks', () => {
    it('should handle all callbacks being undefined', () => {
      const { } = renderHook(() => useKeyboardShortcuts({}));

      // Should not throw
      expect(() => {
        document.dispatchEvent(createKeyboardEvent('/'));
        document.dispatchEvent(createKeyboardEvent('C', { ctrlKey: true, shiftKey: true }));
        document.dispatchEvent(createKeyboardEvent('?'));
      }).not.toThrow();
    });

    it('should call only the relevant callback for each shortcut', () => {
      const onClearFilters = jest.fn();
      const onToggleFilters = jest.fn();
      const onNextPage = jest.fn();

      const { } = renderHook(() =>
        useKeyboardShortcuts({
          onClearFilters,
          onToggleFilters,
          onNextPage,
          currentPage: 1,
          totalPages: 5,
        })
      );

      // Clear filters
      document.dispatchEvent(createKeyboardEvent('C', { ctrlKey: true, shiftKey: true }));
      expect(onClearFilters).toHaveBeenCalledTimes(1);
      expect(onToggleFilters).not.toHaveBeenCalled();
      expect(onNextPage).not.toHaveBeenCalled();

      jest.clearAllMocks();

      // Toggle filters
      document.dispatchEvent(createKeyboardEvent('F', { ctrlKey: true, shiftKey: true }));
      expect(onToggleFilters).toHaveBeenCalledTimes(1);
      expect(onClearFilters).not.toHaveBeenCalled();
      expect(onNextPage).not.toHaveBeenCalled();
    });
  });

  describe('Shortcut list', () => {
    it('should return shortcuts list', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({}));

      expect(result.current.shortcuts).toBeDefined();
      expect(Array.isArray(result.current.shortcuts)).toBe(true);
      expect(result.current.shortcuts.length).toBeGreaterThan(0);
    });

    it('should include all shortcuts in the list', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({}));

      const shortcuts = result.current.shortcuts;
      const keys = shortcuts.map(s => s.key);

      expect(keys).toContain('/');
      expect(keys).toContain('Ctrl+K');
      expect(keys).toContain('Esc');
      expect(keys).toContain('Ctrl+Shift+C');
      expect(keys).toContain('Ctrl+Shift+F');
      expect(keys).toContain('Ctrl+1');
      expect(keys).toContain('Ctrl+2');
      expect(keys).toContain('←');
      expect(keys).toContain('→');
      expect(keys).toContain('?');
    });
  });

  describe('Event prevention', () => {
    it('should prevent default for handled shortcuts', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('/');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default for Ctrl+K to avoid browser search', () => {
      const { } = renderHook(() =>
        useKeyboardShortcuts({ searchInputRef })
      );

      const event = createKeyboardEvent('k', { ctrlKey: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
