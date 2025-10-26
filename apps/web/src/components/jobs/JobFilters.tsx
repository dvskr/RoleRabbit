import React from 'react';
import { Search, Filter as FilterIcon } from 'lucide-react';
import { JobFilters as JobFiltersType } from '../../types/job';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

export default function JobFilters({
  filters,
  onFiltersChange,
  showAdvancedFilters,
  onToggleAdvancedFilters
}: JobFiltersProps) {
  const handleFilterChange = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Applications</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            
            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="company">Sort by Company</option>
              <option value="priority">Sort by Priority</option>
            </select>
            
            {/* Advanced Filters Toggle */}
            <button
              onClick={onToggleAdvancedFilters}
              className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
                showAdvancedFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FilterIcon size={16} className="inline mr-1" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Group By */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Group by:</label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="status">Status</option>
                <option value="company">Company</option>
                <option value="priority">Priority</option>
                <option value="date">Date</option>
              </select>
            </div>

            {/* Show Archived */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showArchived"
                checked={filters.showArchived}
                onChange={(e) => handleFilterChange('showArchived', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showArchived" className="text-sm text-gray-700">
                Show Archived
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
