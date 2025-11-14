/**
 * ReviewForm Component
 * Form for submitting template reviews and ratings
 */

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import type { RatingFormData } from '../../hooks/useTemplateRatings';

interface ReviewFormProps {
  onSubmit: (data: RatingFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  initialData?: Partial<RatingFormData>;
  isEdit?: boolean;
  loading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
  loading = false,
}) => {
  const [formData, setFormData] = useState<RatingFormData>({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    review: initialData?.review || '',
    pros: initialData?.pros || '',
    cons: initialData?.cons || '',
    wouldRecommend: initialData?.wouldRecommend ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RatingFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RatingFormData, string>> = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (formData.title && formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (formData.title && formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.review && formData.review.length < 10) {
      newErrors.review = 'Review must be at least 10 characters';
    }

    if (formData.review && formData.review.length > 2000) {
      newErrors.review = 'Review must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await onSubmit(formData);

      if (result.success) {
        // Reset form on success (if not editing)
        if (!isEdit) {
          setFormData({
            rating: 0,
            title: '',
            review: '',
            pros: '',
            cons: '',
            wouldRecommend: true,
          });
        }
      } else if (result.error) {
        // Show error message
        setErrors({ review: result.error });
      }
    } catch (error) {
      setErrors({ review: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.rating > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={formData.rating}
          size="xl"
          interactive
          onChange={(rating) => setFormData({ ...formData, rating })}
          className="mb-1"
        />
        {errors.rating && (
          <p className="text-sm text-red-600 mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Review Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={100}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formData.title?.length || 0}/100 characters
        </p>
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="review-text"
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          placeholder="Share your thoughts about this template..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          maxLength={2000}
        />
        {errors.review && (
          <p className="text-sm text-red-600 mt-1">{errors.review}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formData.review?.length || 0}/2000 characters
        </p>
      </div>

      {/* Pros */}
      <div>
        <label htmlFor="review-pros" className="block text-sm font-medium text-gray-700 mb-2">
          What did you like? (Optional)
        </label>
        <textarea
          id="review-pros"
          value={formData.pros}
          onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
          placeholder="e.g., Clean design, easy to customize, professional look"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.pros?.length || 0}/500 characters
        </p>
      </div>

      {/* Cons */}
      <div>
        <label htmlFor="review-cons" className="block text-sm font-medium text-gray-700 mb-2">
          What could be improved? (Optional)
        </label>
        <textarea
          id="review-cons"
          value={formData.cons}
          onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
          placeholder="e.g., Limited color options, complex layout"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.cons?.length || 0}/500 characters
        </p>
      </div>

      {/* Would Recommend */}
      <div className="flex items-center">
        <input
          id="would-recommend"
          type="checkbox"
          checked={formData.wouldRecommend}
          onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="would-recommend" className="ml-2 text-sm text-gray-700">
          I would recommend this template to others
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isFormValid || submitting || loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting || loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {isEdit ? 'Updating...' : 'Submitting...'}
            </span>
          ) : (
            <span>{isEdit ? 'Update Review' : 'Submit Review'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
