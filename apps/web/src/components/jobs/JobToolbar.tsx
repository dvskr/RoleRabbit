import React from 'react';
import { Plus, List, Grid, Columns, BarChart3, Trash2, Download, Upload, Settings } from 'lucide-react';
import { ViewMode } from '../../types/job';

interface JobToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedJobsCount: number;
  onAddJob: () => void;
  onBulkUpdateStatus: (status: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowSettings: () => void;
}

export default function JobToolbar({
  viewMode,
  onViewModeChange,
  selectedJobsCount,
  onAddJob,
  onBulkUpdateStatus,
  onBulkDelete,
  onClearSelection,
  onExport,
  onImport,
  onShowSettings
}: JobToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Add Job Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAddJob}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Job
          </button>
        </div>

        {/* Center - Bulk Actions */}
        {selectedJobsCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">
              {selectedJobsCount} selected
            </span>
            
            <select
              onChange={(e) => onBulkUpdateStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Update Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button
              onClick={onBulkDelete}
              className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
            
            <button
              onClick={onClearSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Right Side - View Controls and Actions */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Kanban View"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Table View"
            >
              <BarChart3 size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              title="Export Jobs"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onImport}
              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              title="Import Jobs"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={onShowSettings}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
