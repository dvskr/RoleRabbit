/**
 * Version History Component
 * Requirements #5-6: Version timeline and comparison
 */

'use client';

import React, { useState } from 'react';
import { Clock, RotateCcw, Eye, GitCompare, ChevronRight } from 'lucide-react';

export interface PortfolioVersion {
  id: string;
  versionNumber: number;
  timestamp: Date | string;
  author?: string;
  changeDescription: string;
  snapshot: any;
}

interface VersionHistoryProps {
  versions: PortfolioVersion[];
  onRestore: (versionId: string) => Promise<void>;
  onCompare?: (version1: PortfolioVersion, version2: PortfolioVersion) => void;
  onPreview?: (versionId: string) => void;
}

export function VersionHistory({
  versions,
  onRestore,
  onCompare,
  onPreview,
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  const handleRestore = async (versionId: string, versionNumber: number) => {
    const confirmed = window.confirm(
      `Restore Version ${versionNumber}?\n\nYour current version will be saved to history before restoring.`
    );

    if (!confirmed) return;

    setIsRestoring(versionId);
    try {
      await onRestore(versionId);
    } finally {
      setIsRestoring(null);
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompare) {
      const v1 = versions.find((v) => v.id === selectedVersions[0]);
      const v2 = versions.find((v) => v.id === selectedVersions[1]);
      if (v1 && v2) {
        onCompare(v1, v2);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return formatDate(date);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Version History
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
            {selectedVersions.length > 0 && ` · ${selectedVersions.length} selected`}
          </p>
        </div>

        {selectedVersions.length === 2 && onCompare && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <GitCompare size={18} />
            Compare Versions
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Version items */}
        <div className="space-y-4">
          {versions.map((version, index) => {
            const isSelected = selectedVersions.includes(version.id);
            const isLatest = index === 0;

            return (
              <div
                key={version.id}
                className={`relative pl-16 pr-4 py-4 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-4 top-6 w-5 h-5 rounded-full border-4 ${
                    isLatest
                      ? 'bg-green-500 border-white dark:border-gray-900'
                      : isSelected
                      ? 'bg-blue-500 border-white dark:border-gray-900'
                      : 'bg-gray-300 dark:bg-gray-600 border-white dark:border-gray-900'
                  }`}
                />

                {/* Content */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Version number and badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Version {version.versionNumber}
                      </h3>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    {/* Change description */}
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {version.changeDescription}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatTimeAgo(version.timestamp)}</span>
                      </div>
                      {version.author && (
                        <div className="flex items-center gap-1">
                          <span>by {version.author}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatDate(version.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {/* Compare checkbox */}
                    {onCompare && (
                      <button
                        onClick={() => toggleVersionSelection(version.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                        title="Select for comparison"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                      </button>
                    )}

                    {/* Preview */}
                    {onPreview && (
                      <button
                        onClick={() => onPreview(version.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Preview this version"
                      >
                        <Eye size={18} />
                      </button>
                    )}

                    {/* Restore */}
                    {!isLatest && (
                      <button
                        onClick={() => handleRestore(version.id, version.versionNumber)}
                        disabled={isRestoring === version.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRestoring === version.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RotateCcw size={16} />
                            Restore
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {versions.length === 0 && (
        <div className="text-center py-16">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Version History
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Version history will appear here as you make changes to your portfolio.
          </p>
        </div>
      )}
    </div>
  );
}
