/**
 * Tests for useTemplateActions hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateActions } from '../useTemplateActions';
import * as analytics from '../../utils/analytics';

// Mock analytics module
jest.mock('../../utils/analytics', () => ({
  trackTemplatePreview: jest.fn(),
  trackTemplateAdd: jest.fn(),
  trackTemplateRemove: jest.fn(),
  trackTemplateFavorite: jest.fn(),
  trackTemplateDownload: jest.fn(),
  trackError: jest.fn(),
}));

// Mock useTemplateHistory hook
jest.mock('../useTemplateHistory', () => ({
  useTemplateHistory: () => ({
    addToHistory: jest.fn(),
    recentlyUsed: [],
    getTemplateUsageCount: jest.fn(),
    getLastUsed: jest.fn(),
    clearHistory: jest.fn(),
  }),
}));

// Mock template helpers
jest.mock('../../utils/templateHelpers', () => ({
  getTemplateDownloadHTML: jest.fn(() => '<html>Mock HTML</html>'),
  downloadTemplateAsHTML: jest.fn(),
  shareTemplate: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger
jest.mock('../../../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

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

describe('useTemplateActions', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTemplateActions());

      expect(result.current.selectedTemplate).toBeNull();
      expect(result.current.showPreviewModal).toBe(false);
      expect(result.current.showUploadModal).toBe(false);
      expect(result.current.addedTemplateId).toBeNull();
      expect(result.current.favorites).toEqual([]);
      expect(result.current.uploadedFile).toBeNull();
      expect(result.current.uploadSource).toBe('cloud');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should load favorites from localStorage', () => {
      const favorites = ['template-1', 'template-2'];
      localStorage.setItem('template_favorites', JSON.stringify(favorites));

      const { result } = renderHook(() => useTemplateActions());

      expect(result.current.favorites).toEqual(favorites);
    });

    it('should filter out invalid favorites from localStorage', () => {
      const favorites = ['modern-professional', 'invalid-id', 'creative-designer'];
      localStorage.setItem('template_favorites', JSON.stringify(favorites));

      const { result } = renderHook(() => useTemplateActions());

      // Should only include valid template IDs
      expect(result.current.favorites).toContain('modern-professional');
      expect(result.current.favorites).not.toContain('invalid-id');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('template_favorites', 'invalid json {');

      const { result } = renderHook(() => useTemplateActions());

      expect(result.current.favorites).toEqual([]);
    });
  });

  describe('Preview template', () => {
    it('should open preview modal for a template', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.handlePreviewTemplate('modern-professional');
      });

      expect(result.current.selectedTemplate).toBe('modern-professional');
      expect(result.current.showPreviewModal).toBe(true);
    });

    it('should track preview analytics', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.handlePreviewTemplate('modern-professional');
      });

      expect(analytics.trackTemplatePreview).toHaveBeenCalled();
    });

    it('should set currentSelectedTemplate correctly', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.handlePreviewTemplate('modern-professional');
      });

      expect(result.current.currentSelectedTemplate).not.toBeNull();
      expect(result.current.currentSelectedTemplate?.id).toBe('modern-professional');
    });
  });

  describe('Add template to editor', () => {
    it('should call onAddToEditor callback', () => {
      const onAddToEditor = jest.fn();
      const { result } = renderHook(() => useTemplateActions({ onAddToEditor }));

      act(() => {
        result.current.handleUseTemplate('modern-professional');
      });

      expect(onAddToEditor).toHaveBeenCalledWith('modern-professional');
    });

    it('should track template add analytics', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.handleUseTemplate('modern-professional');
      });

      expect(analytics.trackTemplateAdd).toHaveBeenCalled();
    });

    it('should set addedTemplateId for animation', async () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.handleUseTemplate('modern-professional');
      });

      expect(result.current.addedTemplateId).toBe('modern-professional');

      // Should clear after animation duration
      await waitFor(() => {
        expect(result.current.addedTemplateId).toBeNull();
      }, { timeout: 3000 });
    });

    it('should handle template not found error', () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useTemplateActions({ onError }));

      act(() => {
        result.current.handleUseTemplate('non-existent-template');
      });

      expect(result.current.error).toContain('not found');
      expect(onError).toHaveBeenCalled();
      expect(analytics.trackError).toHaveBeenCalled();
    });

    it('should clear previous errors on successful add', () => {
      const { result } = renderHook(() => useTemplateActions());

      // Trigger an error first
      act(() => {
        result.current.handleUseTemplate('invalid-template');
      });

      expect(result.current.error).not.toBeNull();

      // Add a valid template
      act(() => {
        result.current.handleUseTemplate('modern-professional');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Download template', () => {
    it('should download selected template', () => {
      const { downloadTemplateAsHTML } = require('../../utils/templateHelpers');
      const { result } = renderHook(() => useTemplateActions());

      // Select a template first
      act(() => {
        result.current.setSelectedTemplate('modern-professional');
      });

      // Download it
      act(() => {
        result.current.handleDownloadTemplate();
      });

      expect(downloadTemplateAsHTML).toHaveBeenCalled();
      expect(analytics.trackTemplateDownload).toHaveBeenCalled();
    });

    it('should handle no template selected error', () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useTemplateActions({ onError }));

      act(() => {
        result.current.handleDownloadTemplate();
      });

      expect(result.current.error).toContain('No template selected');
      expect(onError).toHaveBeenCalled();
      expect(analytics.trackError).toHaveBeenCalled();
    });

    it('should set loading state during download', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.setSelectedTemplate('modern-professional');
      });

      act(() => {
        result.current.handleDownloadTemplate();
      });

      // Loading should be false after download completes
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Share template', () => {
    it('should share selected template', async () => {
      const { shareTemplate } = require('../../utils/templateHelpers');
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.setSelectedTemplate('modern-professional');
      });

      await act(async () => {
        await result.current.handleShareTemplate();
      });

      expect(shareTemplate).toHaveBeenCalled();
    });

    it('should handle share error', async () => {
      const { shareTemplate } = require('../../utils/templateHelpers');
      shareTemplate.mockRejectedValueOnce(new Error('Share failed'));

      const onError = jest.fn();
      const { result } = renderHook(() => useTemplateActions({ onError }));

      act(() => {
        result.current.setSelectedTemplate('modern-professional');
      });

      await act(async () => {
        await result.current.handleShareTemplate();
      });

      expect(result.current.error).toContain('Failed to share template');
      expect(onError).toHaveBeenCalled();
      expect(analytics.trackError).toHaveBeenCalled();
    });

    it('should handle no template selected error for share', async () => {
      const { result } = renderHook(() => useTemplateActions());

      await act(async () => {
        await result.current.handleShareTemplate();
      });

      expect(result.current.error).toContain('No template selected');
    });
  });

  describe('Favorites', () => {
    it('should add template to favorites', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.toggleFavorite('modern-professional');
      });

      expect(result.current.favorites).toContain('modern-professional');
      expect(analytics.trackTemplateFavorite).toHaveBeenCalledWith(
        'modern-professional',
        expect.any(String),
        true
      );
    });

    it('should remove template from favorites', () => {
      const { result } = renderHook(() => useTemplateActions());

      // Add to favorites
      act(() => {
        result.current.toggleFavorite('modern-professional');
      });

      expect(result.current.favorites).toContain('modern-professional');

      // Remove from favorites
      act(() => {
        result.current.toggleFavorite('modern-professional');
      });

      expect(result.current.favorites).not.toContain('modern-professional');
      expect(analytics.trackTemplateFavorite).toHaveBeenCalledWith(
        'modern-professional',
        expect.any(String),
        false
      );
    });

    it('should persist favorites to localStorage', async () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.toggleFavorite('modern-professional');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('template_favorites');
        expect(JSON.parse(stored!)).toContain('modern-professional');
      });
    });

    it('should handle invalid template ID for favorites', () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useTemplateActions({ onError }));

      act(() => {
        result.current.toggleFavorite('invalid-template-id');
      });

      expect(result.current.error).toContain('not found');
      expect(onError).toHaveBeenCalled();
      expect(analytics.trackError).toHaveBeenCalled();
    });
  });

  describe('Modal state management', () => {
    it('should toggle preview modal', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.setShowPreviewModal(true);
      });

      expect(result.current.showPreviewModal).toBe(true);

      act(() => {
        result.current.setShowPreviewModal(false);
      });

      expect(result.current.showPreviewModal).toBe(false);
    });

    it('should toggle upload modal', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.setShowUploadModal(true);
      });

      expect(result.current.showUploadModal).toBe(true);

      act(() => {
        result.current.setShowUploadModal(false);
      });

      expect(result.current.showUploadModal).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useTemplateActions());

      // Trigger an error
      act(() => {
        result.current.handleUseTemplate('invalid-template');
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should call onError callback when errors occur', () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useTemplateActions({ onError }));

      act(() => {
        result.current.handleUseTemplate('invalid-template');
      });

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        'useTemplate'
      );
    });
  });

  describe('Upload state', () => {
    it('should set uploaded file', () => {
      const { result } = renderHook(() => useTemplateActions());
      const mockFile = new File(['content'], 'template.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.setUploadedFile(mockFile);
      });

      expect(result.current.uploadedFile).toBe(mockFile);
    });

    it('should set upload source', () => {
      const { result } = renderHook(() => useTemplateActions());

      act(() => {
        result.current.setUploadSource('system');
      });

      expect(result.current.uploadSource).toBe('system');

      act(() => {
        result.current.setUploadSource('cloud');
      });

      expect(result.current.uploadSource).toBe('cloud');
    });
  });
});
