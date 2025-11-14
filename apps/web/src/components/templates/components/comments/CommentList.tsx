/**
 * CommentList Component
 * Displays a paginated list of comments with sorting options
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { CommentThread } from './CommentThread';
import type { Comment } from '../../hooks/useTemplateComments';

interface CommentListProps {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  sortBy?: 'newest' | 'oldest' | 'popular';
  onSortChange?: (sortBy: 'newest' | 'oldest' | 'popular') => void;
  onPageChange?: (page: number) => void;
  onReply?: (commentId: string, content: string, mentions: string[]) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onLike?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string, reason: string) => Promise<void>;
  onModerate?: (commentId: string, action: 'APPROVE' | 'HIDE' | 'DELETE') => Promise<void>;
  className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  pagination,
  loading = false,
  currentUserId,
  isAdmin = false,
  sortBy = 'newest',
  onSortChange,
  onPageChange,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onReport,
  onModerate,
  className = '',
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
  ] as const;

  const handlePageClick = (page: number) => {
    if (onPageChange && page >= 1 && page <= pagination.totalPages) {
      onPageChange(page);
    }
  };

  const renderPaginationButtons = () => {
    const { page, totalPages } = pagination;
    const buttons: JSX.Element[] = [];
    const maxButtons = 7;

    if (totalPages <= 1) return null;

    if (totalPages <= maxButtons) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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

  // Loading skeleton
  if (loading && comments.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (comments.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with count and sort */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {pagination.total} {pagination.total === 1 ? 'Comment' : 'Comments'}
        </h3>

        {/* Sort Dropdown */}
        {onSortChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-comments" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select
              id="sort-comments"
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as 'newest' | 'oldest' | 'popular')
              }
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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

      {/* Comments List */}
      <div className="space-y-0 divide-y divide-gray-200">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            depth={0}
            maxDepth={5}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onLike={onLike}
            onReport={onReport}
            onModerate={onModerate}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} comments
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageClick(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">{renderPaginationButtons()}</div>

            {/* Next Button */}
            <button
              onClick={() => handlePageClick(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && comments.length > 0 && (
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
            <p className="mt-2 text-sm text-gray-600">Loading comments...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentList;
