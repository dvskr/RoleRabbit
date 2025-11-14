/**
 * VersionTimeline Component
 * Timeline view of template version history
 */

import React, { useEffect, useState } from 'react';
import { Clock, User, GitBranch, RotateCcw, Trash2, Eye, GitCompare } from 'lucide-react';
import { useTemplateVersions, type TemplateVersion } from '../../hooks/useTemplateVersions';
import { RollbackModal } from './RollbackModal';

interface VersionTimelineProps {
  templateId: string;
  onCompare?: (oldId: string, newId: string) => void;
  onView?: (version: TemplateVersion) => void;
  className?: string;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  templateId,
  onCompare,
  onView,
  className = '',
}) => {
  const { versions, loading, error, fetchVersions, deleteVersion } = useTemplateVersions(templateId);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<string[]>([]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle rollback
  const handleRollback = (version: TemplateVersion) => {
    setSelectedVersion(version);
    setIsRollbackModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;
    const result = await deleteVersion(versionId);
    if (!result.success) {
      alert(result.error || 'Failed to delete version');
    }
  };

  // Toggle compare selection
  const toggleCompareSelection = (versionId: string) => {
    if (compareVersions.includes(versionId)) {
      setCompareVersions(compareVersions.filter((id) => id !== versionId));
    } else if (compareVersions.length < 2) {
      setCompareVersions([...compareVersions, versionId]);
    }
  };

  // Handle compare
  const handleCompare = () => {
    if (compareVersions.length === 2) {
      onCompare?.(compareVersions[0], compareVersions[1]);
      setCompareMode(false);
      setCompareVersions([]);
    }
  };

  // Loading state
  if (loading && versions.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              {i < 2 && <div className="w-0.5 flex-1 bg-gray-200 mt-2" style={{ minHeight: '60px' }} />}
            </div>
            <div className="flex-1 pb-8">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-2">Error loading version history</p>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => fetchVersions()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (versions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <GitBranch className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <p className="text-sm text-gray-600">No version history available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Compare Mode Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
        <div className="flex items-center gap-2">
          {compareMode && compareVersions.length === 2 && (
            <button
              onClick={handleCompare}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <GitCompare size={16} />
              Compare Selected
            </button>
          )}
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareVersions([]);
            }}
            className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              compareMode
                ? 'bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {compareMode ? 'Cancel Compare' : 'Compare Versions'}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {versions.map((version, index) => {
          const isLatest = index === 0;
          const isSelected = compareVersions.includes(version.id);

          return (
            <div key={version.id} className="flex gap-4 relative">
              {/* Timeline Node */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLatest
                      ? 'bg-blue-100 text-blue-600'
                      : isSelected
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {compareMode ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompareSelection(version.id)}
                      disabled={!isSelected && compareVersions.length >= 2}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                  ) : (
                    <GitBranch size={18} />
                  )}
                </div>
                {index < versions.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2" style={{ minHeight: '60px' }} />
                )}
              </div>

              {/* Version Info */}
              <div className="flex-1 pb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          v{version.version} - {version.name}
                        </h4>
                        {isLatest && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-sm text-gray-600">{version.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Changes */}
                  {version.changes && (
                    <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                      {version.changes}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      {version.user?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(version.createdAt)}
                    </div>
                    <div>{formatSize(version.size)}</div>
                  </div>

                  {/* Actions */}
                  {!compareMode && (
                    <div className="flex items-center gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(version)}
                          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      )}
                      {!isLatest && (
                        <button
                          onClick={() => handleRollback(version)}
                          className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <RotateCcw size={14} />
                          Rollback
                        </button>
                      )}
                      {!isLatest && versions.length > 2 && (
                        <button
                          onClick={() => handleDelete(version.id)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rollback Modal */}
      {selectedVersion && (
        <RollbackModal
          isOpen={isRollbackModalOpen}
          version={selectedVersion}
          templateId={templateId}
          onClose={() => {
            setIsRollbackModalOpen(false);
            setSelectedVersion(null);
          }}
          onSuccess={() => {
            fetchVersions();
          }}
        />
      )}
    </div>
  );
};

export default VersionTimeline;
