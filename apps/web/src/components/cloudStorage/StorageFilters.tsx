'use client';

import React from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { FileType, SortBy, ViewMode } from '../../types/cloudStorage';

interface StorageFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: FileType;
  setFilterType: (type: FileType) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedFiles: string[];
  onSelectAll: () => void;
  onDeleteSelected: () => void;
}

export default function StorageFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedFiles,
  onSelectAll,
  onDeleteSelected
}: StorageFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-2">
      {/* Unified compact search/filter bar */}
      <div className="flex items-center gap-2 flex-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
          />
        </div>

        {/* Compact Filter & Sort */}
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FileType)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Files</option>
            <option value="resume">Resumes</option>
            <option value="template">Templates</option>
            <option value="backup">Backups</option>
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="List view"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Grid view"
          >
            <Grid size={14} />
          </button>
        </div>
      </div>

      {/* Bulk Actions - Inline */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-600">
            {selectedFiles.length} selected
          </span>
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear
          </button>
          <button
            onClick={onDeleteSelected}
            className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
