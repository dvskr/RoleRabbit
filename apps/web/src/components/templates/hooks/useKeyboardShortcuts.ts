/**
 * Custom hook for keyboard shortcuts in Templates tab
 * Provides keyboard navigation and quick actions
 */

import { useEffect, useCallback, RefObject } from 'react';
import { TemplateViewMode } from '../types';

interface UseKeyboardShortcutsOptions {
  searchInputRef?: RefObject<HTMLInputElement>;
  onClearFilters?: () => void;
  onToggleFilters?: () => void;
  onChangeViewMode?: (mode: TemplateViewMode) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
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
        searchInputRef?.current?.focus();
        return;
      }

      // Shortcut: Escape - Clear search when search is focused
      if (event.key === 'Escape' && isTyping && searchInputRef?.current) {
        event.preventDefault();
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
        onToggleFilters?.();
        return;
      }

      // Shortcut: Ctrl+1 - Switch to grid view
      if (event.key === '1' && (event.ctrlKey || event.metaKey) && !isTyping) {
        event.preventDefault();
        onChangeViewMode?.('grid');
        return;
      }

      // Shortcut: Ctrl+2 - Switch to list view
      if (event.key === '2' && (event.ctrlKey || event.metaKey) && !isTyping) {
        event.preventDefault();
        onChangeViewMode?.('list');
        return;
      }

      // Shortcut: Arrow Left - Previous page
      if (event.key === 'ArrowLeft' && !isTyping && currentPage > 1) {
        event.preventDefault();
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
        onNextPage?.();
        return;
      }

      // Shortcut: ? - Show keyboard shortcuts help (can be implemented later)
      if (event.key === '?' && !isTyping) {
        event.preventDefault();
        // TODO: Show keyboard shortcuts modal/tooltip
        console.log('Keyboard shortcuts:', getShortcutsList());
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
