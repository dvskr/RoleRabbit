/**
 * Custom hook for template pagination
 * Includes smooth scroll-to-top on page change
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { TEMPLATES_PER_PAGE } from '../constants';
import type { ResumeTemplate } from '../../../data/templates';

interface UseTemplatePaginationOptions {
  templates: ResumeTemplate[];
  itemsPerPage?: number;
  scrollToTopOnPageChange?: boolean;
  scrollContainerSelector?: string;
}

interface UseTemplatePaginationReturn {
  currentPage: number;
  totalPages: number;
  currentTemplates: ResumeTemplate[];
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export const useTemplatePagination = (
  options: UseTemplatePaginationOptions
): UseTemplatePaginationReturn => {
  const {
    templates,
    itemsPerPage = TEMPLATES_PER_PAGE,
    scrollToTopOnPageChange = true,
    scrollContainerSelector,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const previousPage = useRef(1);

  const totalPages = useMemo(
    () => Math.ceil(templates.length / itemsPerPage),
    [templates.length, itemsPerPage]
  );

  const currentTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return templates.slice(startIndex, endIndex);
  }, [templates, currentPage, itemsPerPage]);

  // Scroll to top when page changes
  useEffect(() => {
    if (scrollToTopOnPageChange && currentPage !== previousPage.current) {
      const scrollToTop = () => {
        if (scrollContainerSelector) {
          // Scroll specific container
          const container = document.querySelector(scrollContainerSelector);
          if (container) {
            container.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }
        } else {
          // Scroll window
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      };

      // Small delay to ensure DOM has updated
      const timer = setTimeout(scrollToTop, 50);
      previousPage.current = currentPage;

      return () => clearTimeout(timer);
    }
  }, [currentPage, scrollToTopOnPageChange, scrollContainerSelector]);

  // Reset to page 1 when templates change significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [templates.length, totalPages, currentPage]);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    totalPages,
    currentTemplates,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  };
};

