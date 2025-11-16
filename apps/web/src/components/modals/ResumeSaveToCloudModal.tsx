/**
 * Resume Save to Cloud Modal Component
 * Handles saving resume to cloud storage with metadata
 */

import React, { useState, useMemo } from 'react';
import { Cloud, X, AlertTriangle } from 'lucide-react';

interface ResumeSaveToCloudModalProps {
  onClose: () => void;
  onConfirm: (fileName: string, description: string) => void;
  defaultFileName: string;
  existingResumeNames?: string[]; // List of existing resume names
}

export default function ResumeSaveToCloudModal({ 
  onClose, 
  onConfirm,
  defaultFileName,
  existingResumeNames = []
}: ResumeSaveToCloudModalProps) {
  const [fileName, setFileName] = useState(defaultFileName);
  const [description, setDescription] = useState('');

  // Check for duplicate names (case-insensitive)
  const isDuplicate = useMemo(() => {
    const trimmedName = fileName.trim().toLowerCase();
    return existingResumeNames.some(name => name.toLowerCase() === trimmedName);
  }, [fileName, existingResumeNames]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Cloud size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Save Resume to Cloud</h3>
              <p className="text-sm text-gray-600">Store your resume securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="cloud-resume-name" className="block text-sm font-medium text-gray-700 mb-2">
              Resume Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cloud-resume-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Resume name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isDuplicate ? 'border-yellow-500' : 'border-gray-300'
              }`}
            />
            {isDuplicate && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Duplicate Name Warning
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You already have a resume with this name. You can still proceed, but it may cause confusion.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="cloud-resume-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="cloud-resume-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your resume"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(fileName, description)}
            disabled={!fileName.trim()}
            className={`flex-1 px-4 py-2 text-white rounded-lg ${
              !fileName.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Save to Cloud
          </button>
        </div>
      </div>
    </div>
  );
}

