/**
 * Custom hook for keyboard shortcuts in Templates tab
 * Provides keyboard navigation and quick actions
 */

import { useEffect, useCallback, RefObject } from 'react';
import { TemplateViewMode } from '../types';
import { trackKeyboardShortcut, trackHelpModalOpen } from '../utils/analytics';

interface UseKeyboardShortcutsOptions {
  searchInputRef?: RefObject<HTMLInputElement>;
  onClearFilters?: () => void;
  onToggleFilters?: () => void;
  onChangeViewMode?: (mode: TemplateViewMode) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onShowHelp?: () => void;
  currentPage?: number;
  totalPages?: number;
  isModalOpen?: boolean;
}

/**
 * Hook that manages keyboard shortcuts for the Templates tab
 */
export function useKeyboardShortcuts({
  searchInputRef,
  onClearFilters,
  onToggleFilters,
  onChangeViewMode,
  onNextPage,
  onPrevPage,
  onShowHelp,
  currentPage = 1,
  totalPages = 1,
  isModalOpen = false,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const isTyping =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;

      // Don't trigger shortcuts if modal is open (except Escape which is handled by modal)
      if (isModalOpen && event.key !== 'Escape') {
        return;
      }

      // Shortcut: / or Ctrl+K - Focus search input
      if (
        (event.key === '/' && !isTyping) ||
        (event.key === 'k' && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault();
        const shortcut = event.key === '/' ? '/' : 'Ctrl+K';
        trackKeyboardShortcut(shortcut, 'Focus search');
        searchInputRef?.current?.focus();
        return;
      }

      // Shortcut: Escape - Clear search when search is focused
      if (event.key === 'Escape' && isTyping && searchInputRef?.current) {
        event.preventDefault();
        trackKeyboardShortcut('Esc', 'Clear search');
        searchInputRef.current.value = '';
        searchInputRef.current.blur();
        // Trigger change event to update parent state
        const changeEvent = new Event('input', { bubbles: true });
        searchInputRef.current.dispatchEvent(changeEvent);
        return;
      }

      // Shortcut: Ctrl+Shift+C - Clear all filters
      if (
        event.key === 'C' &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        !isTyping
      ) {
        event.preventDefault();
        trackKeyboardShortcut('Ctrl+Shift+C', 'Clear all filters');
        onClearFilters?.();
        return;
      }

      // Shortcut: Ctrl+Shift+F - Toggle filters panel
      if (
        event.key === 'F' &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        !isTyping
      ) {
        event.preventDefault();
        trackKeyboardShortcut('Ctrl+Shift+F', 'Toggle filters');
        onToggleFilters?.();
        return;
      }

      // Shortcut: Ctrl+1 - Switch to grid view
      if (event.key === '1' && (event.ctrlKey || event.metaKey) && !isTyping) {
        event.preventDefault();
        trackKeyboardShortcut('Ctrl+1', 'Switch to grid view');
        onChangeViewMode?.('grid');
        return;
      }

      // Shortcut: Ctrl+2 - Switch to list view
      if (event.key === '2' && (event.ctrlKey || event.metaKey) && !isTyping) {
        event.preventDefault();
        trackKeyboardShortcut('Ctrl+2', 'Switch to list view');
        onChangeViewMode?.('list');
        return;
      }

      // Shortcut: Arrow Left - Previous page
      if (event.key === 'ArrowLeft' && !isTyping && currentPage > 1) {
        event.preventDefault();
        trackKeyboardShortcut('←', 'Previous page');
        onPrevPage?.();
        return;
      }

      // Shortcut: Arrow Right - Next page
      if (
        event.key === 'ArrowRight' &&
        !isTyping &&
        currentPage < totalPages
      ) {
        event.preventDefault();
        trackKeyboardShortcut('→', 'Next page');
        onNextPage?.();
        return;
      }

      // Shortcut: ? - Show keyboard shortcuts help
      if (event.key === '?' && !isTyping) {
        event.preventDefault();
        trackKeyboardShortcut('?', 'Show help');
        trackHelpModalOpen();
        onShowHelp?.();
        return;
      }
    },
    [
      searchInputRef,
      onClearFilters,
      onToggleFilters,
      onChangeViewMode,
      onNextPage,
      onPrevPage,
      onShowHelp,
      currentPage,
      totalPages,
      isModalOpen,
    ]
  );

  // Register keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: getShortcutsList(),
  };
}

/**
 * Get list of available keyboard shortcuts
 */
function getShortcutsList() {
  return [
    {
      key: '/',
      description: 'Focus search input',
    },
    {
      key: 'Ctrl+K',
      description: 'Focus search input',
    },
    {
      key: 'Esc',
      description: 'Clear search (when focused)',
    },
    {
      key: 'Ctrl+Shift+C',
      description: 'Clear all filters',
    },
    {
      key: 'Ctrl+Shift+F',
      description: 'Toggle filters panel',
    },
    {
      key: 'Ctrl+1',
      description: 'Switch to grid view',
    },
    {
      key: 'Ctrl+2',
      description: 'Switch to list view',
    },
    {
      key: '←',
      description: 'Previous page',
    },
    {
      key: '→',
      description: 'Next page',
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
    },
  ];
}
