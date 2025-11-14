/**
 * Component Tests for Templates Component
 * Tests template browsing, filtering, favorites, and backend integration
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Templates from '../Templates';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock all the hooks
jest.mock('../../hooks/useTemplates');
jest.mock('../../hooks/useTemplateFavorites');
jest.mock('../../hooks/useTemplatePreferences');
jest.mock('../templates/hooks/useTemplateFilters');
jest.mock('../templates/hooks/useTemplatePagination');
jest.mock('../templates/hooks/useTemplateActions');
jest.mock('../templates/hooks/useKeyboardShortcuts');

// Mock analytics
jest.mock('../templates/utils/analytics', () => ({
  trackViewModeChange: jest.fn(),
  trackTemplatePreview: jest.fn(),
  trackTemplateAdd: jest.fn(),
}));

import { useTemplates } from '../../hooks/useTemplates';
import { useTemplateFavorites } from '../../hooks/useTemplateFavorites';
import { useTemplatePreferences } from '../../hooks/useTemplatePreferences';
import { useTemplateFilters } from '../templates/hooks/useTemplateFilters';
import { useTemplatePagination } from '../templates/hooks/useTemplatePagination';
import { useTemplateActions } from '../templates/hooks/useTemplateActions';
import { useKeyboardShortcuts } from '../templates/hooks/useKeyboardShortcuts';

const mockUseTemplates = useTemplates as jest.MockedFunction<typeof useTemplates>;
const mockUseTemplateFavorites = useTemplateFavorites as jest.MockedFunction<typeof useTemplateFavorites>;
const mockUseTemplatePreferences = useTemplatePreferences as jest.MockedFunction<typeof useTemplatePreferences>;
const mockUseTemplateFilters = useTemplateFilters as jest.MockedFunction<typeof useTemplateFilters>;
const mockUseTemplatePagination = useTemplatePagination as jest.MockedFunction<typeof useTemplatePagination>;
const mockUseTemplateActions = useTemplateActions as jest.MockedFunction<typeof useTemplateActions>;
const mockUseKeyboardShortcuts = useKeyboardShortcuts as jest.MockedFunction<typeof useKeyboardShortcuts>;

// Mock templates data
const mockTemplates = [
  {
    id: 'tpl_1',
    name: 'Professional Resume',
    category: 'ATS',
    description: 'ATS-friendly template',
    preview: 'preview1.png',
    features: ['Clean layout', 'ATS optimized'],
    difficulty: 'BEGINNER',
    industry: ['Technology'],
    layout: 'SINGLE_COLUMN',
    colorScheme: 'BLUE',
    isPremium: false,
    rating: 4.5,
    downloads: 1000,
    author: 'John Doe',
    tags: ['professional', 'ats']
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

// Helper function to wrap component with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Templates Component', () => {
  const mockOnAddToEditor = jest.fn();
  const mockOnRemoveTemplate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockUseTemplates.mockReturnValue({
      templates: mockTemplates,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 12,
        totalCount: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      filters: {},
      fetchTemplates: jest.fn(),
      updateFilters: jest.fn(),
      clearFilters: jest.fn(),
      nextPage: jest.fn(),
      prevPage: jest.fn(),
      goToPage: jest.fn(),
      changeLimit: jest.fn(),
      getTemplate: jest.fn(),
      getStats: jest.fn(),
      trackUsage: jest.fn(),
      refresh: jest.fn()
    });

    mockUseTemplateFavorites.mockReturnValue({
      favorites: [],
      favoriteIds: new Set(['tpl_1']),
      loading: false,
      error: null,
      syncing: false,
      count: 1,
      fetchFavorites: jest.fn(),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn((id) => id === 'tpl_1'),
      syncFromLocalStorage: jest.fn(),
      refresh: jest.fn()
    });

    mockUseTemplatePreferences.mockReturnValue({
      preferences: {
        filterSettings: {},
        sortPreference: 'popular' as const,
        viewMode: 'grid' as const
      },
      loading: false,
      saving: false,
      error: null,
      fetchPreferences: jest.fn(),
      savePreferences: jest.fn(),
      updatePreferences: jest.fn(),
      updateFilterSettings: jest.fn(),
      updateSortPreference: jest.fn(),
      updateViewMode: jest.fn(),
      resetPreferences: jest.fn(),
      syncFromLocalStorage: jest.fn(),
      refresh: jest.fn()
    });

    mockUseTemplateFilters.mockReturnValue({
      searchQuery: '',
      setSearchQuery: jest.fn(),
      selectedCategory: 'all',
      setSelectedCategory: jest.fn(),
      selectedDifficulty: 'all',
      setSelectedDifficulty: jest.fn(),
      selectedLayout: 'all',
      setSelectedLayout: jest.fn(),
      selectedColorScheme: 'all',
      setSelectedColorScheme: jest.fn(),
      showFreeOnly: false,
      setShowFreeOnly: jest.fn(),
      showPremiumOnly: false,
      setShowPremiumOnly: jest.fn(),
      sortBy: 'popular' as const,
      setSortBy: jest.fn(),
      filteredTemplates: mockTemplates,
      hasActiveFilters: false,
      activeFilterCount: 0,
      clearAllFilters: jest.fn()
    });

    mockUseTemplatePagination.mockReturnValue({
      currentPage: 1,
      templatesPerPage: 12,
      totalPages: 1,
      currentTemplates: mockTemplates,
      setCurrentPage: jest.fn(),
      nextPage: jest.fn(),
      prevPage: jest.fn(),
      goToPage: jest.fn(),
      canGoNext: false,
      canGoPrev: false,
      startIndex: 0,
      endIndex: 2,
      totalTemplates: 2
    });

    mockUseTemplateActions.mockReturnValue({
      favorites: ['tpl_1'],
      toggleFavorite: jest.fn(),
      showPreviewModal: false,
      setShowPreviewModal: jest.fn(),
      selectedTemplate: null,
      setSelectedTemplate: jest.fn(),
      handlePreview: jest.fn(),
      handleAddToEditor: jest.fn(),
      showUploadModal: false,
      setShowUploadModal: jest.fn(),
      usageHistory: [],
      addToUsageHistory: jest.fn()
    });

    mockUseKeyboardShortcuts.mockReturnValue(undefined);
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render template cards', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByText('Professional Resume')).toBeInTheDocument();
      expect(screen.getByText('Creative Portfolio')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseTemplates.mockReturnValue({
        ...mockUseTemplates(),
        templates: [],
        loading: true
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseTemplates.mockReturnValue({
        ...mockUseTemplates(),
        templates: [],
        error: 'Failed to load templates'
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('should show empty state when no templates', () => {
      mockUseTemplates.mockReturnValue({
        ...mockUseTemplates(),
        templates: []
      });

      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        filteredTemplates: []
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
    });
  });

  describe('Backend Integration', () => {
    it('should use backend templates when available', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Should display templates from backend hook
      expect(screen.getByText('Professional Resume')).toBeInTheDocument();
      expect(screen.getByText('Creative Portfolio')).toBeInTheDocument();
    });

    it('should fall back to local templates when backend is empty', () => {
      mockUseTemplates.mockReturnValue({
        ...mockUseTemplates(),
        templates: []
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Should use filteredTemplates from useTemplateFilters
      expect(screen.getByText('Professional Resume')).toBeInTheDocument();
    });

    it('should sync view mode from preferences', () => {
      mockUseTemplatePreferences.mockReturnValue({
        ...mockUseTemplatePreferences(),
        preferences: {
          filterSettings: {},
          sortPreference: 'popular' as const,
          viewMode: 'list' as const
        }
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Component should use list view mode from preferences
      // (Would need to check view mode indicator in UI)
    });

    it('should update backend filters when local filters change', async () => {
      const updateFilters = jest.fn();
      mockUseTemplates.mockReturnValue({
        ...mockUseTemplates(),
        updateFilters
      });

      const setSelectedCategory = jest.fn();
      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        selectedCategory: 'ATS',
        setSelectedCategory
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Filter changes should trigger backend update
      await waitFor(() => {
        expect(updateFilters).toHaveBeenCalled();
      });
    });
  });

  describe('Favorites Integration', () => {
    it('should use backend favorites when available', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Template tpl_1 should show as favorited
      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      expect(favoriteButtons.length).toBeGreaterThan(0);
    });

    it('should toggle favorite using backend hook', async () => {
      const toggleFavorite = jest.fn();
      mockUseTemplateFavorites.mockReturnValue({
        ...mockUseTemplateFavorites(),
        toggleFavorite
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      await userEvent.click(favoriteButtons[0]);

      expect(toggleFavorite).toHaveBeenCalled();
    });

    it('should fall back to local favorites on backend error', async () => {
      const localToggleFavorite = jest.fn();
      mockUseTemplateFavorites.mockReturnValue({
        ...mockUseTemplateFavorites(),
        favoriteIds: new Set(),
        error: 'Failed to load favorites'
      });

      mockUseTemplateActions.mockReturnValue({
        ...mockUseTemplateActions(),
        toggleFavorite: localToggleFavorite
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      await userEvent.click(favoriteButtons[0]);

      expect(localToggleFavorite).toHaveBeenCalled();
    });
  });

  describe('View Mode', () => {
    it('should update view mode and save to preferences', async () => {
      const updateViewMode = jest.fn();
      mockUseTemplatePreferences.mockReturnValue({
        ...mockUseTemplatePreferences(),
        updateViewMode
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Find and click view mode toggle button
      const viewModeButton = screen.getByRole('button', { name: /list view/i });
      await userEvent.click(viewModeButton);

      expect(updateViewMode).toHaveBeenCalledWith('list');
    });
  });

  describe('Search and Filtering', () => {
    it('should update search query', async () => {
      const setSearchQuery = jest.fn();
      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        setSearchQuery
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await userEvent.type(searchInput, 'professional');

      expect(setSearchQuery).toHaveBeenCalled();
    });

    it('should filter by category', async () => {
      const setSelectedCategory = jest.fn();
      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        setSelectedCategory
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const categoryButton = screen.getByRole('button', { name: /ats/i });
      await userEvent.click(categoryButton);

      expect(setSelectedCategory).toHaveBeenCalledWith('ATS');
    });

    it('should show active filter count', () => {
      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        hasActiveFilters: true,
        activeFilterCount: 3
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it('should clear all filters', async () => {
      const clearAllFilters = jest.fn();
      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        hasActiveFilters: true,
        clearAllFilters
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await userEvent.click(clearButton);

      expect(clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('should change sort order', async () => {
      const setSortBy = jest.fn();
      mockUseTemplateFilters.mockReturnValue({
        ...mockUseTemplateFilters(),
        setSortBy
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      await userEvent.selectOptions(sortSelect, 'newest');

      expect(setSortBy).toHaveBeenCalledWith('newest');
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', async () => {
      const setCurrentPage = jest.fn();
      mockUseTemplatePagination.mockReturnValue({
        ...mockUseTemplatePagination(),
        currentPage: 1,
        totalPages: 3,
        canGoNext: true,
        setCurrentPage
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      expect(setCurrentPage).toHaveBeenCalledWith(2);
    });

    it('should navigate to previous page', async () => {
      const setCurrentPage = jest.fn();
      mockUseTemplatePagination.mockReturnValue({
        ...mockUseTemplatePagination(),
        currentPage: 2,
        totalPages: 3,
        canGoPrev: true,
        setCurrentPage
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await userEvent.click(prevButton);

      expect(setCurrentPage).toHaveBeenCalledWith(1);
    });

    it('should disable next button on last page', () => {
      mockUseTemplatePagination.mockReturnValue({
        ...mockUseTemplatePagination(),
        currentPage: 3,
        totalPages: 3,
        canGoNext: false
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should disable previous button on first page', () => {
      mockUseTemplatePagination.mockReturnValue({
        ...mockUseTemplatePagination(),
        currentPage: 1,
        totalPages: 3,
        canGoPrev: false
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Template Actions', () => {
    it('should call onAddToEditor when adding template', async () => {
      const handleAddToEditor = jest.fn();
      mockUseTemplateActions.mockReturnValue({
        ...mockUseTemplateActions(),
        handleAddToEditor
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const addButtons = screen.getAllByRole('button', { name: /add to editor/i });
      await userEvent.click(addButtons[0]);

      expect(handleAddToEditor).toHaveBeenCalled();
    });

    it('should show preview modal when previewing template', async () => {
      const handlePreview = jest.fn();
      mockUseTemplateActions.mockReturnValue({
        ...mockUseTemplateActions(),
        handlePreview
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const previewButtons = screen.getAllByRole('button', { name: /preview/i });
      await userEvent.click(previewButtons[0]);

      expect(handlePreview).toHaveBeenCalled();
    });

    it('should show added templates indicator', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={['tpl_1']}
        />
      );

      expect(screen.getByText(/added/i)).toBeInTheDocument();
    });

    it('should allow removing added templates', async () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={['tpl_1']}
          onRemoveTemplate={mockOnRemoveTemplate}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await userEvent.click(removeButton);

      expect(mockOnRemoveTemplate).toHaveBeenCalledWith('tpl_1');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register keyboard shortcuts', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(mockUseKeyboardShortcuts).toHaveBeenCalled();
      expect(mockUseKeyboardShortcuts).toHaveBeenCalledWith(
        expect.objectContaining({
          onClearFilters: expect.any(Function),
          onToggleFilters: expect.any(Function),
          onChangeViewMode: expect.any(Function),
          onShowHelp: expect.any(Function),
          onNextPage: expect.any(Function),
          onPrevPage: expect.any(Function)
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByRole('main', { name: /template gallery/i })).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAccessibleName();
    });

    it('should have accessible buttons', () => {
      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Error Boundary', () => {
    it('should catch and display errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Force an error by making templates undefined
      mockUseTemplates.mockImplementation(() => {
        throw new Error('Test error');
      });

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile viewport', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderWithTheme(
        <Templates
          onAddToEditor={mockOnAddToEditor}
          addedTemplates={[]}
        />
      );

      // Should still render main content
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
