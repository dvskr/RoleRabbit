/**
 * RollbackModal Component
 * Confirmation modal for rolling back to a previous version
 */

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react';
import { useTemplateVersions, type TemplateVersion } from '../../hooks/useTemplateVersions';

interface RollbackModalProps {
  isOpen: boolean;
  version: TemplateVersion;
  templateId: string;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

export const RollbackModal: React.FC<RollbackModalProps> = ({
  isOpen,
  version,
  templateId,
  onClose,
  onSuccess,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [rollbackSuccess, setRollbackSuccess] = useState(false);

  const { loading, error, rollbackToVersion } = useTemplateVersions(templateId);

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setRollbackSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle rollback
  const handleRollback = async () => {
    const result = await rollbackToVersion(version.id);

    if (result.success) {
      setRollbackSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-black bg-opacity-0'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-xl w-full max-w-md shadow-2xl transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <RotateCcw className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Rollback Version</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {rollbackSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rollback Successful!
              </h3>
              <p className="text-sm text-gray-600">
                Template has been restored to version {version.version}
              </p>
            </div>
          ) : (
            <>
              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-medium text-orange-900 mb-1">
                      Warning: This action cannot be undone
                    </h4>
                    <p className="text-sm text-orange-700">
                      Rolling back will create a new version with the state from the selected
                      version. Your current work will be preserved in the version history.
                    </p>
                  </div>
                </div>
              </div>

              {/* Version Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Rollback to:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium text-gray-900">v{version.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{version.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created by:</span>
                    <span className="font-medium text-gray-900">
                      {version.user?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
                {version.description && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                    {version.description}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Confirmation Text */}
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to rollback to this version? This will create a new version
                based on the selected state.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!rollbackSuccess && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleRollback}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                  Rolling Back...
                </>
              ) : (
                <>
                  <RotateCcw size={18} />
                  Confirm Rollback
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RollbackModal;
