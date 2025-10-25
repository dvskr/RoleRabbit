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
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FileType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="resume">Resumes</option>
            <option value="template">Templates</option>
            <option value="backup">Backups</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Date Modified</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedFiles.length === 0 ? 'Select All' : 'Clear Selection'}
            </button>
            <button
              onClick={onDeleteSelected}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Grid view"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
