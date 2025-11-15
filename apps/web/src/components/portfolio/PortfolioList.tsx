/**
 * Portfolio List Component
 * Lists all portfolios with search, filter, and sort
 * Requirement #1
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, Plus, Grid, List as ListIcon } from 'lucide-react';
import { PortfolioCard, type Portfolio } from './PortfolioCard';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { usePagination } from '../../hooks/usePerformance';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'views-desc';
type FilterOption = 'all' | 'published' | 'draft';
type ViewMode = 'grid' | 'list';

interface PortfolioListProps {
  portfolios: Portfolio[];
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onViewLive?: (id: string) => void;
  onCreateNew?: () => void;
  enablePagination?: boolean;
  itemsPerPage?: number;
}

/**
 * Portfolio List Component
 * Displays all user's portfolios with search, filter, and sort functionality
 */
export function PortfolioList({
  portfolios,
  onEdit,
  onDuplicate,
  onDelete,
  onViewLive,
  onCreateNew,
  enablePagination = true,
  itemsPerPage = 12,
}: PortfolioListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deletePortfolio, setDeletePortfolio] = useState<Portfolio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and sort portfolios
  const filteredAndSortedPortfolios = useMemo(() => {
    let result = [...portfolios];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterBy !== 'all') {
      result = result.filter((p) => p.status === filterBy);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'date-asc':
          return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'views-desc':
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });

    return result;
  }, [portfolios, searchQuery, filterBy, sortBy]);

  // Pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(
    filteredAndSortedPortfolios,
    enablePagination ? itemsPerPage : filteredAndSortedPortfolios.length
  );

  const displayedPortfolios = enablePagination
    ? paginatedItems
    : filteredAndSortedPortfolios;

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletePortfolio) return;

    setIsDeleting(true);
    try {
      await onDelete(deletePortfolio.id);
      setDeletePortfolio(null);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: portfolios.length,
      published: portfolios.filter((p) => p.status === 'published').length,
      draft: portfolios.filter((p) => p.status === 'draft').length,
      totalViews: portfolios.reduce((sum, p) => sum + p.viewCount, 0),
    };
  }, [portfolios]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Portfolios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stats.total} portfolio{stats.total !== 1 ? 's' : ''} · {stats.published} published · {stats.draft} draft
              {stats.totalViews > 0 && ` · ${stats.totalViews.toLocaleString()} total views`}
            </p>
          </div>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Create New
            </button>
          )}
        </div>

        {/* Search, Filter, Sort, View Mode */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portfolios..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <SortAsc
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="views-desc">Most Views</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="List view"
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Grid/List */}
      {displayedPortfolios.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No portfolios found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first portfolio to get started'}
          </p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Portfolio
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {displayedPortfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={(id) => {
                  const p = portfolios.find((item) => item.id === id);
                  if (p) setDeletePortfolio(p);
                }}
                onViewLive={onViewLive}
              />
            ))}
          </div>

          {/* Pagination */}
          {enablePagination && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex}-{endIndex} of {totalItems} portfolios
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={!canGoPrev}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === 2 || page === totalPages - 1) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={nextPage}
                  disabled={!canGoNext}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletePortfolio}
        portfolioName={deletePortfolio?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletePortfolio(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
