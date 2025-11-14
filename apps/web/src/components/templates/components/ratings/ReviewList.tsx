/**
 * ReviewList Component
 * Displays a list of reviews with pagination and sorting
 */

import React, { useState } from 'react';
import { ReviewItem } from './ReviewItem';
import type { Rating } from '../../hooks/useTemplateRatings';

interface ReviewListProps {
  reviews: Rating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  currentUserId?: string;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  onSortChange?: (sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful') => void;
  onPageChange?: (page: number) => void;
  onMarkHelpful: (reviewId: string) => Promise<void>;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  className?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  pagination,
  loading = false,
  currentUserId,
  sortBy = 'helpful',
  onSortChange,
  onPageChange,
  onMarkHelpful,
  onEditReview,
  onDeleteReview,
  className = '',
}) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const sortOptions = [
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
  ] as const;

  // Filter reviews by rating if filter is active
  const filteredReviews = filterRating
    ? reviews.filter((review) => review.rating === filterRating)
    : reviews;

  const handlePageClick = (page: number) => {
    if (onPageChange && page >= 1 && page <= pagination.totalPages) {
      onPageChange(page);
    }
  };

  const renderPaginationButtons = () => {
    const { page, totalPages } = pagination;
    const buttons: JSX.Element[] = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              i === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Show condensed pagination with ellipsis
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            1 === page
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          1
        </button>
      );

      if (page > 3) {
        buttons.push(
          <span key="ellipsis-1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              i === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }

      if (page < totalPages - 2) {
        buttons.push(
          <span key="ellipsis-2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            totalPages === page
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-gray-200 py-6 animate-pulse">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to review this template!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with sort and filter */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-900">
            {pagination.total} {pagination.total === 1 ? 'Review' : 'Reviews'}
          </h3>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm hover:bg-blue-200 transition-colors"
            >
              <span>{filterRating} stars</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        {onSortChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-reviews" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select
              id="sort-reviews"
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
                )
              }
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-0">
        {filteredReviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            isOwnReview={currentUserId === review.userId}
            onMarkHelpful={onMarkHelpful}
            onEdit={onEditReview}
            onDelete={onDeleteReview}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} reviews
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageClick(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">{renderPaginationButtons()}</div>

            {/* Next Button */}
            <button
              onClick={() => handlePageClick(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Loading reviews...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
