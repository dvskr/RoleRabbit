/**
 * ActiveFiltersDisplay Component
 * Shows currently active filters with remove options
 */

import React from 'react';
import { X, Star, DollarSign } from 'lucide-react';
import { useAdvancedFilters } from '../../hooks/useAdvancedFilters';

interface ActiveFiltersDisplayProps {
  onFilterRemove?: () => void;
  className?: string;
}

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  onFilterRemove,
  className = '',
}) => {
  const {
    filters,
    toggleCategory,
    toggleIndustry,
    setDifficulty,
    setRating,
    setPremium,
    resetFilters,
    getActiveFilterCount,
  } = useAdvancedFilters();

  const activeCount = getActiveFilterCount();

  if (activeCount === 0) {
    return null;
  }

  const handleRemoveCategory = (category: string) => {
    toggleCategory(category);
    onFilterRemove?.();
  };

  const handleRemoveIndustry = (industry: string) => {
    toggleIndustry(industry);
    onFilterRemove?.();
  };

  const handleRemoveDifficulty = () => {
    setDifficulty([1, 5]);
    onFilterRemove?.();
  };

  const handleRemoveRating = () => {
    setRating([0, 5]);
    onFilterRemove?.();
  };

  const handleRemovePremium = () => {
    setPremium(null);
    onFilterRemove?.();
  };

  const handleClearAll = () => {
    resetFilters();
    onFilterRemove?.();
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Active Count */}
      <span className="text-sm font-medium text-gray-600">
        {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active:
      </span>

      {/* Categories */}
      {filters.categories.map((category) => (
        <button
          key={category}
          onClick={() => handleRemoveCategory(category)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors group"
        >
          <span>Category: {category}</span>
          <X size={14} className="group-hover:text-blue-900" />
        </button>
      ))}

      {/* Industries */}
      {filters.industries.map((industry) => (
        <button
          key={industry}
          onClick={() => handleRemoveIndustry(industry)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors group"
        >
          <span>Industry: {industry}</span>
          <X size={14} className="group-hover:text-purple-900" />
        </button>
      ))}

      {/* Difficulty */}
      {(filters.difficulty[0] !== 1 || filters.difficulty[1] !== 5) && (
        <button
          onClick={handleRemoveDifficulty}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors group"
        >
          <span>
            Difficulty: {filters.difficulty[0]} - {filters.difficulty[1]}
          </span>
          <X size={14} className="group-hover:text-orange-900" />
        </button>
      )}

      {/* Rating */}
      {(filters.rating[0] !== 0 || filters.rating[1] !== 5) && (
        <button
          onClick={handleRemoveRating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors group"
        >
          <Star size={14} className="fill-yellow-700" />
          <span>
            Rating: {filters.rating[0].toFixed(1)} - {filters.rating[1].toFixed(1)}
          </span>
          <X size={14} className="group-hover:text-yellow-900" />
        </button>
      )}

      {/* Premium */}
      {filters.premium !== null && (
        <button
          onClick={handleRemovePremium}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors group"
        >
          <DollarSign size={14} />
          <span>{filters.premium ? 'Premium Only' : 'Free Only'}</span>
          <X size={14} className="group-hover:text-green-900" />
        </button>
      )}

      {/* Tags */}
      {filters.tags && filters.tags.map((tag) => (
        <button
          key={tag}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors group"
        >
          <span>Tag: {tag}</span>
          <X size={14} className="group-hover:text-gray-900" />
        </button>
      ))}

      {/* Clear All */}
      <button
        onClick={handleClearAll}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFiltersDisplay;
