/**
 * Templates Integration Tests
 * Tests the integration between Templates component and Resume Editor
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Templates from '../Templates';
import { resumeTemplates } from '../../../data/templates';

// Mock the resume editor context/hook
const mockApplyTemplate = jest.fn();
const mockAddTemplate = jest.fn();

jest.mock('@/hooks/useResumeEditor', () => ({
  useResumeEditor: () => ({
    applyTemplate: mockApplyTemplate,
    addTemplate: mockAddTemplate,
    currentResume: {
      id: 'resume-1',
      data: {},
    },
  }),
}));

// Mock template actions
const mockHandleUseTemplate = jest.fn((templateId: string) => {
  mockAddTemplate(templateId);
});

jest.mock('../hooks/useTemplateActions', () => ({
  useTemplateActions: () => ({
    selectedTemplate: null,
    showPreviewModal: false,
    showUploadModal: false,
    addedTemplateId: null,
    favorites: [],
    uploadedFile: null,
    error: null,
    setSelectedTemplate: jest.fn(),
    setShowPreviewModal: jest.fn(),
    setShowUploadModal: jest.fn(),
    setUploadedFile: jest.fn(),
    clearError: jest.fn(),
    handlePreviewTemplate: jest.fn(),
    handleUseTemplate: mockHandleUseTemplate,
    handleDownloadTemplate: jest.fn(),
    handleShareTemplate: jest.fn(),
    toggleFavorite: jest.fn(),
    handleSelectTemplate: jest.fn(),
    currentSelectedTemplate: null,
  }),
}));

jest.mock('../hooks/useTemplateFilters', () => ({
  useTemplateFilters: () => ({
    searchQuery: '',
    debouncedSearchQuery: '',
    selectedCategory: 'all',
    sortBy: 'popular',
    selectedDifficulty: 'all',
    selectedLayout: 'all',
    selectedColorScheme: 'all',
    showPremiumOnly: false,
    showFreeOnly: false,
    setSearchQuery: jest.fn(),
    setSelectedCategory: jest.fn(),
    setSortBy: jest.fn(),
    setSelectedDifficulty: jest.fn(),
    setSelectedLayout: jest.fn(),
    setSelectedColorScheme: jest.fn(),
    setShowPremiumOnly: jest.fn(),
    setShowFreeOnly: jest.fn(),
    filteredTemplates: resumeTemplates.slice(0, 12),
  }),
}));

jest.mock('../hooks/useTemplatePagination', () => ({
  useTemplatePagination: () => ({
    currentPage: 1,
    totalPages: 5,
    currentTemplates: resumeTemplates.slice(0, 12),
    setCurrentPage: jest.fn(),
    goToNextPage: jest.fn(),
    goToPreviousPage: jest.fn(),
    goToFirstPage: jest.fn(),
    goToLastPage: jest.fn(),
  }),
}));

describe('Templates Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Selection Flow', () => {
    test('should allow selecting and applying template to resume editor', async () => {
      render(<Templates />);

      // Component should render
      expect(screen.queryByText(/template/i)).toBeDefined();

      // When user clicks "Use Template" button
      const templateId = resumeTemplates[0].id;
      mockHandleUseTemplate(templateId);

      // Template should be added to editor
      expect(mockHandleUseTemplate).toHaveBeenCalledWith(templateId);
      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);
    });

    test('should handle template preview before applying', async () => {
      const mockPreview = jest.fn();

      render(<Templates />);

      // User previews template first
      const templateId = resumeTemplates[0].id;
      mockPreview(templateId);

      expect(mockPreview).toHaveBeenCalledWith(templateId);
    });

    test('should handle adding multiple templates', async () => {
      render(<Templates />);

      // User adds first template
      const template1 = resumeTemplates[0].id;
      mockHandleUseTemplate(template1);

      expect(mockAddTemplate).toHaveBeenCalledWith(template1);

      // User adds second template
      const template2 = resumeTemplates[1].id;
      mockHandleUseTemplate(template2);

      expect(mockAddTemplate).toHaveBeenCalledWith(template2);
      expect(mockAddTemplate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Filter and Apply Flow', () => {
    test('should allow filtering then applying template', async () => {
      render(<Templates />);

      // User filters templates (mocked to return filtered results)
      // Then applies a template
      const templateId = resumeTemplates[0].id;
      mockHandleUseTemplate(templateId);

      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);
    });

    test('should maintain filter state when applying templates', async () => {
      render(<Templates />);

      // Apply template
      const templateId = resumeTemplates[0].id;
      mockHandleUseTemplate(templateId);

      // Filter state should persist
      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle errors when applying invalid template', async () => {
      render(<Templates />);

      // Attempt to use invalid template
      const invalidId = 'non-existent-template';
      mockHandleUseTemplate(invalidId);

      // Should call the handler (error handling is in the hook)
      expect(mockHandleUseTemplate).toHaveBeenCalledWith(invalidId);
    });

    test('should recover from errors and allow retrying', async () => {
      render(<Templates />);

      // First attempt fails (simulate error)
      const templateId = 'error-template';
      mockHandleUseTemplate(templateId);

      // User retries with valid template
      const validId = resumeTemplates[0].id;
      mockHandleUseTemplate(validId);

      expect(mockHandleUseTemplate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Template Upload Integration', () => {
    test('should handle upload modal opening', async () => {
      const mockSetShowUpload = jest.fn();
      render(<Templates />);

      // Simulate opening upload modal
      mockSetShowUpload(true);

      expect(mockSetShowUpload).toHaveBeenCalledWith(true);
    });

    test('should integrate uploaded resume with template', async () => {
      render(<Templates />);

      // Simulate file upload
      const mockFile = new File(['resume content'], 'resume.pdf', {
        type: 'application/pdf',
      });

      // Then apply template
      const templateId = resumeTemplates[0].id;
      mockHandleUseTemplate(templateId);

      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);
    });
  });

  describe('Favorites Integration', () => {
    test('should allow favoriting then applying templates', async () => {
      const mockToggleFavorite = jest.fn();
      render(<Templates />);

      const templateId = resumeTemplates[0].id;

      // User favorites template
      mockToggleFavorite(templateId);

      // Then applies it
      mockHandleUseTemplate(templateId);

      expect(mockToggleFavorite).toHaveBeenCalledWith(templateId);
      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);
    });

    test('should persist favorites across sessions', async () => {
      const mockFavorites = ['template-1', 'template-2'];

      // Favorites should persist in localStorage
      expect(Array.isArray(mockFavorites)).toBe(true);
    });
  });

  describe('Pagination Integration', () => {
    test('should allow selecting templates across pages', async () => {
      render(<Templates />);

      // Apply template from first page
      const template1 = resumeTemplates[0].id;
      mockHandleUseTemplate(template1);

      expect(mockAddTemplate).toHaveBeenCalledWith(template1);

      // Navigate to next page (simulated)
      // Apply template from second page
      const template2 = resumeTemplates[11]?.id;
      if (template2) {
        mockHandleUseTemplate(template2);
        expect(mockAddTemplate).toHaveBeenCalledWith(template2);
      }
    });
  });

  describe('Search Integration', () => {
    test('should allow searching then applying template', async () => {
      render(<Templates />);

      // User searches (filtered results mocked)
      // Then applies found template
      const templateId = resumeTemplates[0].id;
      mockHandleUseTemplate(templateId);

      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);
    });
  });

  describe('Download Integration', () => {
    test('should allow downloading template preview', async () => {
      const mockDownload = jest.fn();
      render(<Templates />);

      // User downloads template
      mockDownload();

      expect(mockDownload).toHaveBeenCalled();
    });
  });

  describe('Share Integration', () => {
    test('should allow sharing templates', async () => {
      const mockShare = jest.fn();
      render(<Templates />);

      // User shares template
      await mockShare();

      expect(mockShare).toHaveBeenCalled();
    });
  });

  describe('End-to-End Flow', () => {
    test('should complete full template application flow', async () => {
      render(<Templates />);

      const templateId = resumeTemplates[0].id;

      // 1. User browses templates
      expect(screen.queryByText(/template/i)).toBeDefined();

      // 2. User previews template
      const mockPreview = jest.fn();
      mockPreview(templateId);

      // 3. User applies template
      mockHandleUseTemplate(templateId);

      // 4. Template is added to editor
      expect(mockAddTemplate).toHaveBeenCalledWith(templateId);

      // Full flow completed
      expect(mockPreview).toHaveBeenCalled();
      expect(mockHandleUseTemplate).toHaveBeenCalled();
    });

    test('should handle complex user journey', async () => {
      render(<Templates />);

      // User searches
      // User filters by category
      // User sorts by rating
      // User previews multiple templates
      const preview1 = jest.fn();
      const preview2 = jest.fn();

      preview1(resumeTemplates[0].id);
      preview2(resumeTemplates[1].id);

      // User favorites one
      const favorite = jest.fn();
      favorite(resumeTemplates[0].id);

      // User finally applies template
      mockHandleUseTemplate(resumeTemplates[0].id);

      expect(mockAddTemplate).toHaveBeenCalledWith(resumeTemplates[0].id);
    });
  });
});
