import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { DiscussionFilters } from '../../types/discussion';

interface DiscussionHeaderProps {
  filters: DiscussionFilters;
  onUpdateFilters: (filters: Partial<DiscussionFilters>) => void;
  onShowFilters: () => void;
  onRefresh: () => void;
}

export default function DiscussionHeader({
  filters,
  onUpdateFilters,
  onShowFilters,
  onRefresh
}: DiscussionHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Connect, learn, and get AI-powered career advice</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={onShowFilters}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter size={16} />
          <span className="text-sm">Filters</span>
        </button>
      </div>
    </div>
  );
}
