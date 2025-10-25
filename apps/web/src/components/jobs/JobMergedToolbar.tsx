import React from 'react';
import { Search, Filter as FilterIcon, List, Grid, Columns, BarChart3, Trash2, Download, Upload, Settings } from 'lucide-react';
import { JobFilters as JobFiltersType, ViewMode } from '../../types/job';

interface JobMergedToolbarProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedJobsCount: number;
  onBulkUpdateStatus: (status: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowSettings: () => void;
}

export default function JobMergedToolbar({
  filters,
  onFiltersChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  viewMode,
  onViewModeChange,
  selectedJobsCount,
  onBulkUpdateStatus,
  onBulkDelete,
  onClearSelection,
  onExport,
  onImport,
  onShowSettings
}: JobMergedToolbarProps) {
  const handleFilterChange = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      {/* Main Toolbar Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side - Search and Filters */}
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative w-56">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
            className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="company">Sort by Company</option>
            <option value="priority">Sort by Priority</option>
          </select>
          
          {/* Advanced Filters Toggle */}
          <button
            onClick={onToggleAdvancedFilters}
            className={`px-2 py-1.5 rounded-md border transition-colors text-sm ${
              showAdvancedFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FilterIcon size={14} className="inline mr-1" />
            Filters
          </button>
        </div>

        {/* Center - Bulk Actions */}
        {selectedJobsCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 font-medium">
              {selectedJobsCount} selected
            </span>
            
            <select
              onChange={(e) => onBulkUpdateStatus(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Update Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button
              onClick={onBulkDelete}
              className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} />
              Delete
            </button>
            
            <button
              onClick={onClearSelection}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Right Side - View Controls and Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md p-0.5">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Kanban View"
            >
              <Columns size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Table View"
            >
              <BarChart3 size={14} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              title="Export Jobs"
            >
              <Download size={14} />
            </button>
            <button
              onClick={onImport}
              className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
              title="Import Jobs"
            >
              <Upload size={14} />
            </button>
            <button
              onClick={onShowSettings}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
              title="Settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Group By */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-700">Group by:</label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
              >
                <option value="status">Status</option>
                <option value="company">Company</option>
                <option value="priority">Priority</option>
                <option value="date">Date</option>
              </select>
            </div>

            {/* Show Archived */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="showArchived"
                checked={filters.showArchived}
                onChange={(e) => handleFilterChange('showArchived', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showArchived" className="text-xs text-gray-700">
                Show Archived
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
