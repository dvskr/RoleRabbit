'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, Tag } from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: Partial<ResumeFile>) => void;
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'resume' | 'template' | 'backup'>('resume');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!fileName.trim()) return;

    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fileData: Partial<ResumeFile> = {
      name: fileName.trim(),
      type: fileType,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPublic,
      size: '1.2 MB' // This would be calculated from actual file
    };

    onUpload(fileData);
    
    // Reset form
    setFileName('');
    setFileType('resume');
    setTags('');
    setIsPublic(false);
    setIsUploading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg my-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload File</h2>
              <p className="text-xs text-gray-600">Add a new file to your storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
            <Upload size={24} className="text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-600 mb-1.5">Drag and drop your file here, or click to browse</p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
            >
              Choose File
            </label>
            <p className="text-[10px] text-gray-500 mt-1.5">Supports PDF, DOC, DOCX, TXT</p>
          </div>

          {/* File Details */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File Name *
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-2 top-2 text-gray-400" />
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'resume' | 'template' | 'backup')}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="resume">Resume</option>
                <option value="template">Template</option>
                <option value="backup">Backup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="relative">
                <Tag size={14} className="absolute left-2 top-2 text-gray-400" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., software, engineer, react"
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Separate tags with commas</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-xs text-gray-700">
                Make this file public (visible to others)
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!fileName.trim() || isUploading}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5"
          >
            {isUploading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
