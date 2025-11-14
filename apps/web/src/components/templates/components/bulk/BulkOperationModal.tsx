/**
 * BulkOperationModal Component
 * Modal for confirming and executing bulk template operations
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Tag,
  FolderOpen,
} from 'lucide-react';
import {
  useTemplateBulkOps,
  type BulkOperation,
  type BulkOperationResult,
} from '../../hooks/useTemplateBulkOps';

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: BulkOperation | null;
  selectedTemplateIds: string[];
  onSuccess?: (result: BulkOperationResult) => void;
}

export const BulkOperationModal: React.FC<BulkOperationModalProps> = ({
  isOpen,
  onClose,
  operation,
  selectedTemplateIds,
  onSuccess,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Form fields based on operation
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');

  const {
    loading,
    progress,
    result,
    executeBulkOperation,
    bulkApprove,
    bulkReject,
    bulkDelete,
    bulkMakePublic,
    bulkMakePrivate,
    bulkAddTags,
    bulkRemoveTags,
    bulkChangeCategory,
    bulkFeature,
    bulkUnfeature,
    reset,
  } = useTemplateBulkOps();

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
        setShowResults(false);
        reset();
        // Reset form fields
        setRejectionReason('');
        setFeedback('');
        setTags('');
        setCategory('');
      }, 300);
    }
  }, [isOpen, reset]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, loading, onClose]);

  // Operation metadata
  const getOperationMeta = () => {
    switch (operation) {
      case 'approve':
        return {
          title: 'Approve Templates',
          description: `Approve ${selectedTemplateIds.length} selected template(s)`,
          color: 'green',
          warning: false,
        };
      case 'reject':
        return {
          title: 'Reject Templates',
          description: `Reject ${selectedTemplateIds.length} selected template(s)`,
          color: 'red',
          warning: true,
        };
      case 'delete':
        return {
          title: 'Delete Templates',
          description: `Permanently delete ${selectedTemplateIds.length} selected template(s)`,
          color: 'red',
          warning: true,
        };
      case 'make_public':
        return {
          title: 'Make Public',
          description: `Make ${selectedTemplateIds.length} template(s) publicly visible`,
          color: 'blue',
          warning: false,
        };
      case 'make_private':
        return {
          title: 'Make Private',
          description: `Make ${selectedTemplateIds.length} template(s) private`,
          color: 'gray',
          warning: false,
        };
      case 'add_tags':
        return {
          title: 'Add Tags',
          description: `Add tags to ${selectedTemplateIds.length} template(s)`,
          color: 'purple',
          warning: false,
        };
      case 'remove_tags':
        return {
          title: 'Remove Tags',
          description: `Remove tags from ${selectedTemplateIds.length} template(s)`,
          color: 'gray',
          warning: false,
        };
      case 'change_category':
        return {
          title: 'Change Category',
          description: `Change category of ${selectedTemplateIds.length} template(s)`,
          color: 'orange',
          warning: false,
        };
      case 'feature':
        return {
          title: 'Feature Templates',
          description: `Feature ${selectedTemplateIds.length} template(s)`,
          color: 'yellow',
          warning: false,
        };
      case 'unfeature':
        return {
          title: 'Unfeature Templates',
          description: `Remove featured status from ${selectedTemplateIds.length} template(s)`,
          color: 'gray',
          warning: false,
        };
      default:
        return {
          title: 'Bulk Operation',
          description: '',
          color: 'blue',
          warning: false,
        };
    }
  };

  // Execute operation
  const handleExecute = async () => {
    if (!operation) return;

    let operationResult: BulkOperationResult;

    try {
      switch (operation) {
        case 'approve':
          operationResult = await bulkApprove(selectedTemplateIds, feedback);
          break;
        case 'reject':
          if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
          }
          operationResult = await bulkReject(selectedTemplateIds, rejectionReason);
          break;
        case 'delete':
          operationResult = await bulkDelete(selectedTemplateIds);
          break;
        case 'make_public':
          operationResult = await bulkMakePublic(selectedTemplateIds);
          break;
        case 'make_private':
          operationResult = await bulkMakePrivate(selectedTemplateIds);
          break;
        case 'add_tags':
          if (!tags.trim()) {
            alert('Please enter tags to add');
            return;
          }
          operationResult = await bulkAddTags(
            selectedTemplateIds,
            tags.split(',').map((t) => t.trim())
          );
          break;
        case 'remove_tags':
          if (!tags.trim()) {
            alert('Please enter tags to remove');
            return;
          }
          operationResult = await bulkRemoveTags(
            selectedTemplateIds,
            tags.split(',').map((t) => t.trim())
          );
          break;
        case 'change_category':
          if (!category.trim()) {
            alert('Please select a category');
            return;
          }
          operationResult = await bulkChangeCategory(selectedTemplateIds, category);
          break;
        case 'feature':
          operationResult = await bulkFeature(selectedTemplateIds);
          break;
        case 'unfeature':
          operationResult = await bulkUnfeature(selectedTemplateIds);
          break;
        default:
          return;
      }

      setShowResults(true);
      if (operationResult.success) {
        onSuccess?.(operationResult);
      }
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  if (!shouldRender || !operation) return null;

  const meta = getOperationMeta();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={!loading ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {meta.warning && <AlertTriangle className="text-red-600" size={24} />}
            <h2 className="text-xl font-semibold text-gray-900">{meta.title}</h2>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!showResults ? (
            <>
              <p className="text-gray-700 mb-6">{meta.description}</p>

              {meta.warning && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-red-800">
                    <strong>Warning:</strong> This action cannot be undone. Please confirm you want
                    to proceed.
                  </div>
                </div>
              )}

              {/* Operation-specific fields */}
              {operation === 'reject' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    placeholder="Explain why these templates are being rejected..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    disabled={loading}
                  />
                </div>
              )}

              {operation === 'approve' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="Provide positive feedback for approved templates..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                    disabled={loading}
                  />
                </div>
              )}

              {(operation === 'add_tags' || operation === 'remove_tags') && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline mr-1" size={14} />
                    Tags (comma-separated) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="professional, modern, creative"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter tags separated by commas
                  </p>
                </div>
              )}

              {operation === 'change_category' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FolderOpen className="inline mr-1" size={14} />
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                  >
                    <option value="">Select a category</option>
                    <option value="professional">Professional</option>
                    <option value="creative">Creative</option>
                    <option value="academic">Academic</option>
                    <option value="technical">Technical</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
              )}

              {/* Progress */}
              {loading && progress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processing...</span>
                    <span className="text-sm text-gray-600">
                      {progress.completed} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(progress.completed / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div>
              {result && result.success ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Operation Completed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Successfully processed {result.successCount} out of {selectedTemplateIds.length}{' '}
                    template(s)
                  </p>

                  {result.failureCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-red-900 mb-2">
                        {result.failureCount} Failed
                      </h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((error, i) => (
                          <p key={i} className="text-sm text-red-700">
                            • Template {error.templateId}: {error.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="mx-auto text-red-600 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Operation Failed</h3>
                  <p className="text-gray-600">The bulk operation could not be completed.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {!showResults ? (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  meta.color === 'green'
                    ? 'bg-green-600 hover:bg-green-700'
                    : meta.color === 'red'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOperationModal;
