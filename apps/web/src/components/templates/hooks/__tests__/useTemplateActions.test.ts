/**
 * useTemplateActions Hook Tests
 * Tests the template actions functionality (preview, use, download, share, favorites)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateActions } from '../useTemplateActions';
import { resumeTemplates } from '../../../../data/templates';

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

// Mock logger
jest.mock('../../../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock template helpers
jest.mock('../../utils/templateHelpers', () => ({
  getTemplateDownloadHTML: jest.fn(() => '<html>Mock HTML</html>'),
  downloadTemplateAsHTML: jest.fn(),
  shareTemplate: jest.fn().mockResolvedValue(undefined),
}));

// Mock template validator
jest.mock('../../../../utils/templateValidator', () => ({
  isValidResumeTemplate: jest.fn(() => true),
}));

// Mock accessibility utils
jest.mock('../../../../utils/accessibility', () => ({
  getSuccessAnimationDuration: jest.fn(() => 1000),
}));

describe('useTemplateActions Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useTemplateActions());

    expect(result.current.selectedTemplate).toBe(null);
    expect(result.current.showPreviewModal).toBe(false);
    expect(result.current.showUploadModal).toBe(false);
    expect(result.current.addedTemplateId).toBe(null);
    expect(result.current.favorites).toEqual([]);
    expect(result.current.uploadedFile).toBe(null);
    expect(result.current.error).toBe(null);
  });

  test('should load favorites from localStorage on init', () => {
    const savedFavorites = ['template-1', 'template-2'];
    localStorageMock.setItem('template_favorites', JSON.stringify(savedFavorites));

    const { result } = renderHook(() => useTemplateActions());

    expect(result.current.favorites).toEqual(savedFavorites);
  });

  test('should handle preview template', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.handlePreviewTemplate(templateId);
    });

    expect(result.current.selectedTemplate).toBe(templateId);
    expect(result.current.showPreviewModal).toBe(true);
    expect(result.current.error).toBe(null);
  });

  test('should handle preview with invalid template ID', () => {
    const { result } = renderHook(() => useTemplateActions());

    act(() => {
      result.current.handlePreviewTemplate('invalid-id');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.showPreviewModal).toBe(false);
  });

  test('should handle use template', () => {
    const mockOnAddToEditor = jest.fn();
    const { result } = renderHook(() =>
      useTemplateActions({ onAddToEditor: mockOnAddToEditor })
    );
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.handleUseTemplate(templateId);
    });

    expect(mockOnAddToEditor).toHaveBeenCalledWith(templateId);
    expect(result.current.addedTemplateId).toBe(templateId);
  });

  test('should clear added template animation after duration', async () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.handleUseTemplate(templateId);
    });

    expect(result.current.addedTemplateId).toBe(templateId);

    await waitFor(
      () => {
        expect(result.current.addedTemplateId).toBe(null);
      },
      { timeout: 1500 }
    );
  });

  test('should toggle favorite on', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.toggleFavorite(templateId);
    });

    expect(result.current.favorites).toContain(templateId);
  });

  test('should toggle favorite off', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.toggleFavorite(templateId);
    });
    expect(result.current.favorites).toContain(templateId);

    act(() => {
      result.current.toggleFavorite(templateId);
    });
    expect(result.current.favorites).not.toContain(templateId);
  });

  test('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.toggleFavorite(templateId);
    });

    const stored = localStorageMock.getItem('template_favorites');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toContain(templateId);
  });

  test('should set selected template', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.setSelectedTemplate(templateId);
    });

    expect(result.current.selectedTemplate).toBe(templateId);
  });

  test('should set show preview modal', () => {
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

  test('should set show upload modal', () => {
    const { result } = renderHook(() => useTemplateActions());

    act(() => {
      result.current.setShowUploadModal(true);
    });

    expect(result.current.showUploadModal).toBe(true);
  });

  test('should set uploaded file', () => {
    const { result } = renderHook(() => useTemplateActions());
    const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' });

    act(() => {
      result.current.setUploadedFile(mockFile);
    });

    expect(result.current.uploadedFile).toBe(mockFile);
  });

  test('should clear error', () => {
    const { result } = renderHook(() => useTemplateActions());

    // First, trigger an error
    act(() => {
      result.current.handlePreviewTemplate('invalid-id');
    });
    expect(result.current.error).toBeTruthy();

    // Then clear it
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBe(null);
  });

  test('should get current selected template', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.setSelectedTemplate(templateId);
    });

    expect(result.current.currentSelectedTemplate).toBeTruthy();
    expect(result.current.currentSelectedTemplate?.id).toBe(templateId);
  });

  test('should return null for invalid selected template', () => {
    const { result } = renderHook(() => useTemplateActions());

    act(() => {
      result.current.setSelectedTemplate('invalid-id');
    });

    expect(result.current.currentSelectedTemplate).toBe(null);
  });

  test('should handle download template', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.setSelectedTemplate(templateId);
    });

    act(() => {
      result.current.handleDownloadTemplate();
    });

    expect(result.current.error).toBe(null);
  });

  test('should handle share template', async () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.setSelectedTemplate(templateId);
    });

    await act(async () => {
      await result.current.handleShareTemplate();
    });

    expect(result.current.error).toBe(null);
  });

  test('should handle select template callback', () => {
    const { result } = renderHook(() => useTemplateActions());
    const templateId = resumeTemplates[0].id;

    act(() => {
      result.current.handleSelectTemplate(templateId);
    });

    // Should not throw error
    expect(result.current.error).toBe(null);
  });
});
