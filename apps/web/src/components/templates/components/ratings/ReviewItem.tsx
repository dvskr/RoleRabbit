/**
 * ReviewItem Component
 * Displays a single review with all its details
 */

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import type { Rating } from '../../hooks/useTemplateRatings';

interface ReviewItemProps {
  review: Rating;
  onMarkHelpful: (reviewId: string) => Promise<void>;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  isOwnReview?: boolean;
  className?: string;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onMarkHelpful,
  onEdit,
  onDelete,
  isOwnReview = false,
  className = '',
}) => {
  const [isMarkedHelpful, setIsMarkedHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [showFullReview, setShowFullReview] = useState(false);

  const handleMarkHelpful = async () => {
    if (isMarkedHelpful) return;

    try {
      await onMarkHelpful(review.id);
      setIsMarkedHelpful(true);
      setHelpfulCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const reviewText = review.review || '';
  const shouldTruncate = reviewText.length > 300;
  const displayText = shouldTruncate && !showFullReview
    ? reviewText.substring(0, 300) + '...'
    : reviewText;

  return (
    <div className={`border-b border-gray-200 py-6 last:border-0 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {review.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.user?.name || 'Anonymous User'}
              </span>
              {review.isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwnReview && (onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review.id)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Review Text */}
      {reviewText && (
        <div className="text-gray-700 mb-3 whitespace-pre-wrap">
          {displayText}
          {shouldTruncate && (
            <button
              onClick={() => setShowFullReview(!showFullReview)}
              className="text-blue-600 hover:text-blue-700 font-medium ml-2"
            >
              {showFullReview ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Pros and Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {review.pros && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-900">Pros</span>
              </div>
              <p className="text-sm text-green-800">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-orange-900">Cons</span>
              </div>
              <p className="text-sm text-orange-800">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Would Recommend Badge */}
      {review.wouldRecommend && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Recommends this template</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-4 pt-3">
        <button
          onClick={handleMarkHelpful}
          disabled={isMarkedHelpful || isOwnReview}
          className={`flex items-center gap-2 text-sm ${
            isMarkedHelpful
              ? 'text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg
            className="w-4 h-4"
            fill={isMarkedHelpful ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;
