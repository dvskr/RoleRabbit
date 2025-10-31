/**
 * Custom hook for template pagination
 */

import { useState, useMemo, useEffect } from 'react';
import { TEMPLATES_PER_PAGE } from '../constants';
import type { ResumeTemplate } from '../../../data/templates';

interface UseTemplatePaginationOptions {
  templates: ResumeTemplate[];
  itemsPerPage?: number;
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
  const { templates, itemsPerPage = TEMPLATES_PER_PAGE } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(templates.length / itemsPerPage),
    [templates.length, itemsPerPage]
  );

  const currentTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return templates.slice(startIndex, endIndex);
  }, [templates, currentPage, itemsPerPage]);

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

