/**
 * ImagePreview Component
 * Displays preview of uploaded template image
 */

import React from 'react';
import { X, FileImage } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  fileName,
  fileSize,
  onRemove,
  className = '',
}) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Preview Image */}
      <div className="relative bg-gray-100 p-4">
        <img
          src={imageUrl}
          alt={fileName}
          className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg"
        />
        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-6 right-6 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          title="Remove image"
        >
          <X size={18} />
        </button>
      </div>

      {/* File Info */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3">
          <FileImage className="text-blue-600 flex-shrink-0" size={24} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
