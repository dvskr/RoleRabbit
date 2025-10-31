/**
 * EmptyState - Displayed when no templates match filters
 */

import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
  colors?: any;
}

export default function EmptyState({ onClearFilters, colors }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
        <Search size={20} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates found</h3>
      <p className="text-gray-600 mb-3 text-sm">
        Try adjusting your search or filter criteria
      </p>
      <button
        onClick={onClearFilters}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
      >
        Clear Filters
      </button>
    </div>
  );
}

