/**
 * RatingBreakdown Component
 * Displays rating distribution and overall statistics
 */

import React from 'react';
import { StarRating } from './StarRating';
import type { RatingBreakdown as RatingBreakdownType } from '../../hooks/useTemplateRatings';

interface RatingBreakdownProps {
  breakdown: RatingBreakdownType;
  onFilterByRating?: (rating: number) => void;
  className?: string;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  breakdown,
  onFilterByRating,
  className = '',
}) => {
  const { averageRating, totalRatings, distribution, recommendationPercentage } = breakdown;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Overall Rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-lg text-gray-500">out of 5</span>
          </div>
          <StarRating rating={averageRating} size="lg" />
          <p className="text-sm text-gray-600 mt-2">
            Based on {totalRatings.toLocaleString()} {totalRatings === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Recommendation Badge */}
        {recommendationPercentage > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
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
            </div>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(recommendationPercentage)}%
            </p>
            <p className="text-xs text-gray-600">recommend</p>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map((rating) => {
          const data = distribution[rating] || { count: 0, percentage: 0 };
          const isClickable = onFilterByRating && data.count > 0;

          return (
            <button
              key={rating}
              onClick={() => isClickable && onFilterByRating?.(rating)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-3 text-left ${
                isClickable
                  ? 'hover:bg-gray-50 cursor-pointer'
                  : 'cursor-default'
              } rounded-lg p-2 -mx-2 transition-colors`}
            >
              {/* Star Label */}
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <div className="flex items-center gap-2 min-w-[80px] justify-end">
                <span className="text-sm text-gray-600">{Math.round(data.percentage)}%</span>
                <span className="text-xs text-gray-500">({data.count})</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Hint */}
      {onFilterByRating && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Click on a rating to filter reviews
        </p>
      )}
    </div>
  );
};

export default RatingBreakdown;
