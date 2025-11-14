/**
 * PaginationControls - Pagination component for templates
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Tooltip from './Tooltip';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  colors?: any;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  colors,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-6 mb-4 gap-1 sm:gap-2">
      <Tooltip content="Go to previous page" position="top">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 sm:p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
        </button>
      </Tooltip>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg font-semibold transition-colors text-sm min-w-[44px] sm:min-w-0 touch-manipulation ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <Tooltip content="Go to next page" position="top">
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 sm:p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          aria-label="Next page"
        >
          <ChevronRight size={20} className="sm:w-4 sm:h-4" />
        </button>
      </Tooltip>
    </div>
  );
}

