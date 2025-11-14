/**
 * UploadLimits Component
 * Displays user's upload limits and usage
 */

import React from 'react';
import { Crown, HardDrive, FileCheck, AlertTriangle } from 'lucide-react';
import type { UploadLimits as UploadLimitsType } from '../../hooks/useTemplateUpload';

interface UploadLimitsProps {
  limits: UploadLimitsType;
  className?: string;
}

export const UploadLimits: React.FC<UploadLimitsProps> = ({
  limits,
  className = '',
}) => {
  const usagePercentage = (limits.currentUploads / limits.maxUploads) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = limits.remainingUploads <= 0;

  return (
    <div
      className={`rounded-lg p-4 ${
        isAtLimit
          ? 'bg-red-50 border border-red-200'
          : isNearLimit
          ? 'bg-orange-50 border border-orange-200'
          : 'bg-gray-50 border border-gray-200'
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive
            size={18}
            className={
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-600'
            }
          />
          <span className="text-sm font-medium text-gray-900">Upload Limits</span>
          {limits.isPremium && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              <Crown size={12} />
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        {/* Upload Count */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Templates Uploaded</span>
            <span className="font-medium text-gray-900">
              {limits.currentUploads} / {limits.isPremium ? '∞' : limits.maxUploads}
            </span>
          </div>
          {!limits.isPremium && (
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                  isAtLimit
                    ? 'bg-red-500'
                    : isNearLimit
                    ? 'bg-orange-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Remaining Uploads */}
        {!limits.isPremium && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Remaining</span>
            <span
              className={`font-medium ${
                isAtLimit
                  ? 'text-red-600'
                  : isNearLimit
                  ? 'text-orange-600'
                  : 'text-green-600'
              }`}
            >
              {limits.remainingUploads} uploads
            </span>
          </div>
        )}

        {/* Max File Size */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Max file size</span>
          <span className="font-medium text-gray-900">
            {(limits.maxFileSize / (1024 * 1024)).toFixed(0)} MB
          </span>
        </div>
      </div>

      {/* Warning Messages */}
      {isAtLimit && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="flex items-start gap-2 text-xs text-red-700">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              You've reached your upload limit. Delete existing templates or{' '}
              <button className="font-medium underline hover:no-underline">
                upgrade to Premium
              </button>{' '}
              for unlimited uploads.
            </p>
          </div>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-start gap-2 text-xs text-orange-700">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              You're running low on uploads.{' '}
              <button className="font-medium underline hover:no-underline">
                Upgrade to Premium
              </button>{' '}
              for unlimited uploads.
            </p>
          </div>
        </div>
      )}

      {/* Premium Upgrade CTA */}
      {!limits.isPremium && !isAtLimit && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all font-medium text-sm flex items-center justify-center gap-2">
            <Crown size={16} />
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadLimits;
