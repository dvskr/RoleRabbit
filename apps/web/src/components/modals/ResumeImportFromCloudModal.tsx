/**
 * Resume Import from Cloud Modal Component
 * Handles importing resumes from cloud storage
 */

import React, { useState } from 'react';
import { Upload, X, Download } from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';

interface ResumeImportFromCloudModalProps {
  files: ResumeFile[];
  onClose: () => void;
  onLoad: (file: ResumeFile) => void;
}

export default function ResumeImportFromCloudModal({ 
  files, 
  onClose,
  onLoad 
}: ResumeImportFromCloudModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Import Resume from Cloud</h3>
              <p className="text-sm text-gray-600">Select a resume to load</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resumes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No resumes found</p>
            </div>
          ) : (
            filteredFiles.map(file => (
              <div
                key={file.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{file.name}</h4>
                    <p className="text-sm text-gray-600">{file.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Modified: {file.lastModified}</span>
                      <span>Size: {file.size}</span>
                      <span>Version: {file.version}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoad(file);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Load resume"
                    aria-label={`Load resume ${file.name}`}
                  >
                    <Download size={18} className="text-purple-600" />
                  </button>
                </div>
                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {file.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

