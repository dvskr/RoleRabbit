/**
 * VersionComparison Component
 * Side-by-side comparison of two template versions with diff display
 */

import React, { useEffect } from 'react';
import { ArrowRight, Plus, Minus, RefreshCw, X } from 'lucide-react';
import { useTemplateVersions } from '../../hooks/useTemplateVersions';

interface VersionComparisonProps {
  templateId: string;
  oldVersionId: string;
  newVersionId: string;
  onClose?: () => void;
  className?: string;
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({
  templateId,
  oldVersionId,
  newVersionId,
  onClose,
  className = '',
}) => {
  const { comparison, loading, error, compareVersions } = useTemplateVersions(templateId);

  useEffect(() => {
    compareVersions(oldVersionId, newVersionId);
  }, [oldVersionId, newVersionId, compareVersions]);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-gray-600">Comparing versions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to compare versions</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!comparison) return null;

  const { oldVersion, newVersion, diff } = comparison;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <RefreshCw size={20} className="text-blue-600" />
          Version Comparison
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Version Headers */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        {/* Old Version */}
        <div>
          <div className="text-xs text-gray-500 mb-1">OLD VERSION</div>
          <div className="font-semibold text-gray-900">
            v{oldVersion.version} - {oldVersion.name}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(oldVersion.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <ArrowRight className="text-gray-400 mx-auto" size={24} />
        </div>

        {/* New Version */}
        <div>
          <div className="text-xs text-gray-500 mb-1">NEW VERSION</div>
          <div className="font-semibold text-gray-900">
            v{newVersion.version} - {newVersion.name}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(newVersion.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Diff Summary */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Changes Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
              <Plus size={16} />
              <span className="text-2xl font-bold">{diff.added.length}</span>
            </div>
            <div className="text-xs text-green-800">Added</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
              <RefreshCw size={16} />
              <span className="text-2xl font-bold">{diff.modified.length}</span>
            </div>
            <div className="text-xs text-orange-800">Modified</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
              <Minus size={16} />
              <span className="text-2xl font-bold">{diff.removed.length}</span>
            </div>
            <div className="text-xs text-red-800">Removed</div>
          </div>
        </div>
      </div>

      {/* Detailed Diff */}
      <div className="p-6 space-y-6">
        {/* Added Items */}
        {diff.added.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
              <Plus size={16} className="text-green-600" />
              Added ({diff.added.length})
            </h5>
            <div className="space-y-2">
              {diff.added.map((item, index) => (
                <div
                  key={index}
                  className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-sm text-green-900"
                >
                  <code className="font-mono">{item}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modified Items */}
        {diff.modified.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-orange-900 mb-3 flex items-center gap-2">
              <RefreshCw size={16} className="text-orange-600" />
              Modified ({diff.modified.length})
            </h5>
            <div className="space-y-2">
              {diff.modified.map((item, index) => (
                <div
                  key={index}
                  className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded text-sm text-orange-900"
                >
                  <code className="font-mono">{item}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Items */}
        {diff.removed.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-red-900 mb-3 flex items-center gap-2">
              <Minus size={16} className="text-red-600" />
              Removed ({diff.removed.length})
            </h5>
            <div className="space-y-2">
              {diff.removed.map((item, index) => (
                <div
                  key={index}
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-900"
                >
                  <code className="font-mono">{item}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Changes */}
        {diff.added.length === 0 && diff.modified.length === 0 && diff.removed.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No differences found between these versions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionComparison;
