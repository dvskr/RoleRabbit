/**
 * UploadProgress Component
 * Displays upload progress with animated bar
 */

import React from 'react';
import { Upload } from 'lucide-react';

interface UploadProgressProps {
  progress: number; // 0-100
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  className = '',
}) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Upload className="text-blue-600 animate-pulse" size={20} />
          <span className="text-sm font-medium text-blue-900">
            Uploading template...
          </span>
        </div>
        <span className="text-sm font-bold text-blue-600">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-3 text-xs text-blue-700">
        {progress < 25 && 'Preparing upload...'}
        {progress >= 25 && progress < 75 && 'Uploading file...'}
        {progress >= 75 && progress < 100 && 'Processing...'}
        {progress === 100 && 'Upload complete!'}
      </div>

      {/* Shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadProgress;
