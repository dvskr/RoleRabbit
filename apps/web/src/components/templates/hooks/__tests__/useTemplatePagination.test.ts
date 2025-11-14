/**
 * Tests for useTemplatePagination hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplatePagination } from '../useTemplatePagination';
import { resumeTemplates } from '../../../../data/templates';
import * as analytics from '../../utils/analytics';

// Mock analytics module
jest.mock('../../utils/analytics', () => ({
  trackPageChange: jest.fn(),
}));

// Mock window.scrollTo
const scrollToMock = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: scrollToMock,
});

describe('useTemplatePagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scrollToMock.mockClear();
  });

  describe('Initialization', () => {
    it('should initialize with first page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates })
      );

      expect(result.current.currentPage).toBe(1);
    });

    it('should calculate total pages correctly', () => {
      const templates = resumeTemplates.slice(0, 25); // 25 templates with 8 per page = 4 pages
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      expect(result.current.totalPages).toBe(Math.ceil(25 / 8));
    });

    it('should return correct templates for first page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      expect(result.current.currentTemplates.length).toBe(8);
      expect(result.current.currentTemplates[0]).toBe(templates[0]);
    });

    it('should handle empty templates array', () => {
      const { result } = renderHook(() =>
        useTemplatePagination({ templates: [] })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.currentTemplates).toEqual([]);
    });
  });

  describe('Page navigation', () => {
    it('should go to next page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should go to previous page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      // Go to page 2 first
      act(() => {
        result.current.setCurrentPage(2);
      });

      // Go back to page 1
      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should not go beyond last page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      const totalPages = result.current.totalPages;

      act(() => {
        result.current.setCurrentPage(totalPages);
      });

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(totalPages);
    });

    it('should not go below page 1', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should go to first page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      act(() => {
        result.current.setCurrentPage(3);
      });

      act(() => {
        result.current.goToFirstPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should go to last page', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.currentPage).toBe(result.current.totalPages);
    });

    it('should set specific page number', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.currentPage).toBe(2);
    });
  });

  describe('Current templates slice', () => {
    it('should return correct templates for page 2', () => {
      const templates = resumeTemplates.slice(0, 20);
      const itemsPerPage = 8;
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage })
      );

      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.currentTemplates.length).toBe(itemsPerPage);
      expect(result.current.currentTemplates[0]).toBe(templates[itemsPerPage]);
    });

    it('should handle last page with fewer items', () => {
      const templates = resumeTemplates.slice(0, 25);
      const itemsPerPage = 8;
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage })
      );

      const lastPage = result.current.totalPages;

      act(() => {
        result.current.setCurrentPage(lastPage);
      });

      // Last page should have remaining items (25 % 8 = 1)
      expect(result.current.currentTemplates.length).toBe(1);
    });

    it('should update current templates when page changes', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 8 })
      );

      const page1Templates = result.current.currentTemplates;

      act(() => {
        result.current.goToNextPage();
      });

      const page2Templates = result.current.currentTemplates;

      expect(page1Templates).not.toEqual(page2Templates);
    });
  });

  describe('Scroll to top functionality', () => {
    it('should scroll to top when page changes', async () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, scrollToTopOnPageChange: true })
      );

      act(() => {
        result.current.goToNextPage();
      });

      await waitFor(() => {
        expect(scrollToMock).toHaveBeenCalledWith({
          top: 0,
          behavior: 'smooth',
        });
      }, { timeout: 200 });
    });

    it('should not scroll to top on initial mount', async () => {
      const templates = resumeTemplates.slice(0, 20);
      renderHook(() =>
        useTemplatePagination({ templates, scrollToTopOnPageChange: true })
      );

      // Wait a bit to ensure no scroll happens
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(scrollToMock).not.toHaveBeenCalled();
    });

    it('should not scroll when scrollToTopOnPageChange is false', async () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, scrollToTopOnPageChange: false })
      );

      act(() => {
        result.current.goToNextPage();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(scrollToMock).not.toHaveBeenCalled();
    });

    it('should scroll custom container when selector provided', async () => {
      const mockContainer = {
        scrollTo: jest.fn(),
      };

      // Mock querySelector to return our mock container
      const querySelectorMock = jest.fn(() => mockContainer);
      document.querySelector = querySelectorMock;

      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({
          templates,
          scrollToTopOnPageChange: true,
          scrollContainerSelector: '.template-container',
        })
      );

      act(() => {
        result.current.goToNextPage();
      });

      await waitFor(() => {
        expect(mockContainer.scrollTo).toHaveBeenCalledWith({
          top: 0,
          behavior: 'smooth',
        });
      }, { timeout: 200 });
    });
  });

  describe('Analytics tracking', () => {
    it('should track page change analytics', async () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates })
      );

      act(() => {
        result.current.goToNextPage();
      });

      await waitFor(() => {
        expect(analytics.trackPageChange).toHaveBeenCalledWith(
          2,
          result.current.totalPages
        );
      });
    });

    it('should not track analytics on initial mount', async () => {
      const templates = resumeTemplates.slice(0, 20);
      renderHook(() => useTemplatePagination({ templates }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(analytics.trackPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Template list changes', () => {
    it('should reset to page 1 when total pages decreases below current page', () => {
      const { result, rerender } = renderHook(
        ({ templates }) => useTemplatePagination({ templates }),
        {
          initialProps: { templates: resumeTemplates.slice(0, 30) },
        }
      );

      // Go to page 3
      act(() => {
        result.current.setCurrentPage(3);
      });

      expect(result.current.currentPage).toBe(3);

      // Reduce templates to only 10 (which is less than 3 pages)
      rerender({ templates: resumeTemplates.slice(0, 10) });

      expect(result.current.currentPage).toBe(1);
    });

    it('should recalculate total pages when templates change', () => {
      const { result, rerender } = renderHook(
        ({ templates }) => useTemplatePagination({ templates, itemsPerPage: 8 }),
        {
          initialProps: { templates: resumeTemplates.slice(0, 16) },
        }
      );

      expect(result.current.totalPages).toBe(2);

      // Increase templates
      rerender({ templates: resumeTemplates.slice(0, 32) });

      expect(result.current.totalPages).toBe(4);
    });

    it('should update current templates when templates array changes', () => {
      const templates1 = resumeTemplates.slice(0, 10);
      const templates2 = resumeTemplates.slice(10, 20);

      const { result, rerender } = renderHook(
        ({ templates }) => useTemplatePagination({ templates }),
        {
          initialProps: { templates: templates1 },
        }
      );

      const initialTemplates = result.current.currentTemplates;

      rerender({ templates: templates2 });

      expect(result.current.currentTemplates).not.toEqual(initialTemplates);
    });
  });

  describe('Custom items per page', () => {
    it('should respect custom itemsPerPage', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates, itemsPerPage: 5 })
      );

      expect(result.current.currentTemplates.length).toBe(5);
      expect(result.current.totalPages).toBe(4);
    });

    it('should use default itemsPerPage when not provided', () => {
      const templates = resumeTemplates.slice(0, 20);
      const { result } = renderHook(() =>
        useTemplatePagination({ templates })
      );

      // Default TEMPLATES_PER_PAGE is 8
      expect(result.current.currentTemplates.length).toBeLessThanOrEqual(8);
    });
  });
});
