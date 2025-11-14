/**
 * Advanced Features Components for File Management
 *
 * Components:
 * - FileActivityTimeline: Activity history for a file
 * - AdvancedSearchPanel: Search with filters
 * - BulkOperationsToolbar: Multi-select operations
 * - FilePreviewModal: Preview PDFs, images, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  Trash2,
  FolderOpen,
  Archive,
  Search,
  Filter,
  Calendar,
  FileType,
  Star,
  Eye,
  Share2,
  Upload,
  Edit,
  RotateCcw,
  X,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// ============================================================================
// FILE ACTIVITY TIMELINE
// ============================================================================

interface Activity {
  id: string;
  action: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: any;
  createdAt: string;
}

interface FileActivityTimelineProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FileActivityTimeline({ fileId, isOpen, onClose }: FileActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen && fileId) {
      fetchActivities();
    }
  }, [fileId, isOpen, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/storage/files/${fileId}/activity?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setActivities(data.activities);
        } else {
          setActivities(prev => [...prev, ...data.activities]);
        }
        setHasMore(data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activity Timeline</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && activities.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity yet
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Activity details */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getActionIcon(action: string) {
  const icons: Record<string, JSX.Element> = {
    uploaded: <Upload className="w-5 h-5" />,
    downloaded: <Download className="w-5 h-5" />,
    shared: <Share2 className="w-5 h-5" />,
    deleted: <Trash2 className="w-5 h-5" />,
    restored: <RotateCcw className="w-5 h-5" />,
    renamed: <Edit className="w-5 h-5" />,
    moved: <FolderOpen className="w-5 h-5" />,
    previewed: <Eye className="w-5 h-5" />
  };
  return icons[action] || <FileType className="w-5 h-5" />;
}

function getActionColor(action: string) {
  const colors: Record<string, string> = {
    uploaded: 'bg-green-100 text-green-600',
    downloaded: 'bg-blue-100 text-blue-600',
    shared: 'bg-purple-100 text-purple-600',
    deleted: 'bg-red-100 text-red-600',
    restored: 'bg-green-100 text-green-600',
    renamed: 'bg-yellow-100 text-yellow-600',
    moved: 'bg-indigo-100 text-indigo-600',
    previewed: 'bg-gray-100 text-gray-600'
  };
  return colors[action] || 'bg-gray-100 text-gray-600';
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// BULK OPERATIONS TOOLBAR
// ============================================================================

interface BulkOperationsToolbarProps {
  selectedFiles: string[];
  onDeselectAll: () => void;
  onDelete: () => void;
  onMove: () => void;
  onDownloadZip: () => void;
}

export function BulkOperationsToolbar({
  selectedFiles,
  onDeselectAll,
  onDelete,
  onMove,
  onDownloadZip
}: BulkOperationsToolbarProps) {
  if (selectedFiles.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-blue-600 text-white rounded-lg shadow-xl px-6 py-3 flex items-center gap-4">
        {/* Selected count */}
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="font-medium">
            {selectedFiles.length} selected
          </span>
        </div>

        <div className="w-px h-6 bg-white/30" />

        {/* Actions */}
        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded transition-colors"
          title="Download as ZIP"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Download</span>
        </button>

        <button
          onClick={onMove}
          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded transition-colors"
          title="Move to folder"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm">Move</span>
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-2 hover:bg-red-600 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Delete</span>
        </button>

        <div className="w-px h-6 bg-white/30" />

        {/* Close */}
        <button
          onClick={onDeselectAll}
          className="p-2 hover:bg-blue-700 rounded transition-colors"
          title="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Export helpers for use in parent components
export async function bulkDeleteFiles(fileIds: string[], permanent: boolean = false) {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/storage/files/bulk/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ fileIds, permanent })
  });

  return response.json();
}

export async function downloadFilesAsZip(fileIds: string[], zipName: string = 'files.zip') {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/storage/files/download-zip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ fileIds, zipName })
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
