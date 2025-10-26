import React from 'react';
import { X, Filter } from 'lucide-react';
import { DiscussionFilters as DiscussionFiltersType } from '../../types/discussion';

interface DiscussionFiltersProps {
  filters: DiscussionFiltersType;
  onUpdateFilters: (filters: Partial<DiscussionFiltersType>) => void;
  onResetFilters: () => void;
  onClose: () => void;
  communities: Array<{ id: string; name: string }>;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'resume', label: 'Resume' },
  { value: 'career', label: 'Career' },
  { value: 'interview', label: 'Interview' },
  { value: 'job-search', label: 'Job Search' },
  { value: 'networking', label: 'Networking' },
  { value: 'ai-help', label: 'AI Help' },
  { value: 'feedback', label: 'Feedback' }
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'time', label: 'Newest First' },
  { value: 'votes', label: 'Most Voted' },
  { value: 'comments', label: 'Most Comments' }
];

export default function DiscussionFilters({
  filters,
  onUpdateFilters,
  onResetFilters,
  onClose,
  communities
}: DiscussionFiltersProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filter Discussions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.selectedCategory}
              onChange={(e) => onUpdateFilters({ selectedCategory: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Community Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Community
            </label>
            <select
              value={filters.selectedCommunity || 'all'}
              onChange={(e) => onUpdateFilters({ 
                selectedCommunity: e.target.value === 'all' ? null : e.target.value 
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Communities</option>
              {communities.map(community => (
                <option key={community.id} value={community.name}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value as any })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Filters */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Additional Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showPinned}
                  onChange={(e) => onUpdateFilters({ showPinned: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only pinned posts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showTrending}
                  onChange={(e) => onUpdateFilters({ showTrending: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only trending posts</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onResetFilters}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Reset Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
