'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  colors?: any;
}

/**
 * FE-042: Pagination controls component
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-t"
      style={{ borderColor: palette.border }}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: palette.secondaryText }}>
          Showing {startItem}-{endItem} of {total} files
        </span>
        
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: palette.secondaryText }}>
              Per page:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded text-sm border"
              style={{
                background: palette.inputBackground,
                borderColor: palette.border,
                color: palette.primaryText,
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: currentPage === 1 ? palette.inputBackground : 'transparent',
            color: palette.secondaryText,
          }}
          aria-label="First page"
        >
          <ChevronsLeft size={18} />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: currentPage === 1 ? palette.inputBackground : 'transparent',
            color: palette.secondaryText,
          }}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-sm"
                  style={{ color: palette.tertiaryText }}
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                style={{
                  background: isActive ? palette.primaryBlue : 'transparent',
                  color: isActive ? 'white' : palette.primaryText,
                }}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: currentPage === totalPages ? palette.inputBackground : 'transparent',
            color: palette.secondaryText,
          }}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: currentPage === totalPages ? palette.inputBackground : 'transparent',
            color: palette.secondaryText,
          }}
          aria-label="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

