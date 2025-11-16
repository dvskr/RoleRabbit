import React, { useState } from 'react';
import { X, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  localVersion: any;
  serverVersion: any;
  onKeepLocal: () => void;
  onUseServer: () => void;
  onReviewChanges: () => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  localVersion,
  serverVersion,
  onKeepLocal,
  onUseServer,
  onReviewChanges,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<'local' | 'server' | null>(null);

  if (!isOpen) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleKeepLocal = () => {
    setSelectedVersion('local');
    onKeepLocal();
  };

  const handleUseServer = () => {
    setSelectedVersion('server');
    onUseServer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Conflicting Changes Detected
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This resume was modified elsewhere. Choose which version to keep.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Version (Local) */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVersion === 'local'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedVersion('local')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Your Version
                </h3>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                  Local
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Last edited: {formatDate(localVersion?.updatedAt || new Date())}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Experience entries:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {localVersion?.data?.experience?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Education entries:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {localVersion?.data?.education?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Skills:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {localVersion?.data?.skills?.technical?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Server Version */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVersion === 'server'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedVersion('server')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Server Version
                </h3>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
                  Latest
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Last edited: {formatDate(serverVersion?.updatedAt || new Date())}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Experience entries:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {serverVersion?.data?.experience?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Education entries:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {serverVersion?.data?.education?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Skills:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {serverVersion?.data?.skills?.technical?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Choosing a version will overwrite the other. Make sure to review
              your changes before proceeding.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <Button
            variant="outline"
            onClick={onReviewChanges}
            className="flex items-center gap-2"
          >
            Review Changes
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleUseServer}
              disabled={!selectedVersion}
              className="min-w-[140px]"
            >
              Use Server Version
            </Button>
            <Button
              onClick={handleKeepLocal}
              disabled={!selectedVersion}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              Keep My Version
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
