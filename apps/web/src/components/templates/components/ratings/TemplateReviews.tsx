/**
 * TemplateReviews Component
 * Main container for template ratings and reviews
 * Combines RatingBreakdown, ReviewForm, and ReviewList
 */

import React, { useState } from 'react';
import { RatingBreakdown } from './RatingBreakdown';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { useTemplateRatings, useUserRating } from '../../hooks/useTemplateRatings';

interface TemplateReviewsProps {
  templateId: string;
  currentUserId?: string;
  className?: string;
}

export const TemplateReviews: React.FC<TemplateReviewsProps> = ({
  templateId,
  currentUserId,
  className = '',
}) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('helpful');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  // Fetch ratings data
  const {
    ratings,
    breakdown,
    pagination,
    loading,
    error,
    submitRating,
    updateRating,
    deleteRating,
    markHelpful,
    refresh,
  } = useTemplateRatings({
    templateId,
    page,
    limit: 10,
    sortBy,
  });

  // Check if user has already rated
  const { userRating, setUserRating } = useUserRating(templateId);

  const hasUserRated = !!userRating;

  const handleSubmitReview = async (formData: any) => {
    const result = editingReview
      ? await updateRating(formData)
      : await submitRating(formData);

    if (result.success) {
      setShowReviewForm(false);
      setEditingReview(false);
      setUserRating(result.data);
      // Refresh the list
      refresh();
    }

    return result;
  };

  const handleEditReview = (reviewId: string) => {
    setEditingReview(true);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      const result = await deleteRating();
      if (result.success) {
        setUserRating(null);
        refresh();
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of reviews
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading reviews</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div id="reviews-section" className={`space-y-8 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ratings & Reviews</h2>
        <p className="text-gray-600">
          See what others think about this template and share your own experience
        </p>
      </div>

      {/* Rating Breakdown and Write Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Rating Breakdown */}
        <div className="lg:col-span-1">
          {breakdown ? (
            <RatingBreakdown
              breakdown={breakdown}
              onFilterByRating={(rating) => {
                // Could implement filtering by rating
                console.log('Filter by rating:', rating);
              }}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded mb-4" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Write Review or User's Review */}
        <div className="lg:col-span-2">
          {!currentUserId ? (
            /* Not logged in */
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to leave a review</h3>
              <p className="text-gray-600 mb-4">
                Share your experience with this template to help others make informed decisions
              </p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Sign In
              </button>
            </div>
          ) : hasUserRated && !showReviewForm ? (
            /* User has already rated - show their review */
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Your Review</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(userRating.id)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userRating.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-gray-700">
                {/* Display user's review summary */}
                <p>You rated this template {userRating.rating} out of 5 stars.</p>
                {userRating.title && (
                  <p className="mt-2 font-medium">{userRating.title}</p>
                )}
                {userRating.review && (
                  <p className="mt-2 text-sm">{userRating.review}</p>
                )}
              </div>
            </div>
          ) : showReviewForm || (hasUserRated && editingReview) ? (
            /* Show review form */
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingReview ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <ReviewForm
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(false);
                }}
                initialData={editingReview ? userRating : undefined}
                isEdit={editingReview}
                loading={loading}
              />
            </div>
          ) : (
            /* Show button to write review */
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-blue-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Share Your Experience</h3>
              <p className="text-gray-600 mb-4">
                Help others by sharing your thoughts about this template
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <ReviewList
          reviews={ratings}
          pagination={pagination}
          loading={loading}
          currentUserId={currentUserId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onPageChange={handlePageChange}
          onMarkHelpful={markHelpful}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
        />
      </div>
    </div>
  );
};

export default TemplateReviews;
