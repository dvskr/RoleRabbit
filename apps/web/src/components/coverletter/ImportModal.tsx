'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Cloud, FileText, Download } from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';

interface ImportModalProps {
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  files: ResumeFile[];
  onLoad: (file: ResumeFile) => void;
  onFileSelected?: (file: File) => void;
}

export default function ImportModal({
  showImportModal,
  setShowImportModal,
  files,
  onLoad,
  onFileSelected
}: ImportModalProps) {
  const [importMethod, setImportMethod] = useState<string>('cloud');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showImportModal) return null;

  const handleMethodClick = (method: string) => {
    if (method === 'draft' && onFileSelected) {
      fileInputRef.current?.click();
    } else {
      setImportMethod(method);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file);
      setShowImportModal(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div className="absolute top-20 right-4 bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ 
        position: 'absolute', 
        top: '5rem', 
        right: '1rem',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <Upload className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Import Cover Letter</h2>
          </div>
          <button
            onClick={() => setShowImportModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl  duration-200 group"
          >
            <X size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Import Method
            </label>
            <div className="grid grid-cols-1 gap-3">
              {/* From Cloud Storage */}
              <button
                onClick={() => handleMethodClick('cloud')}
                className={`p-4 rounded-xl border-2  duration-200 text-left ${
                  importMethod === 'cloud'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    importMethod === 'cloud' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Cloud 
                      size={18} 
                      className={importMethod === 'cloud' ? 'text-white' : 'text-gray-600'} 
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">From Cloud Storage</div>
                    <div className="text-sm text-gray-600">Import cover letter from cloud storage</div>
                  </div>
                </div>
              </button>

              {/* Draft Document */}
              <button
                onClick={() => handleMethodClick('draft')}
                className={`p-4 rounded-xl border-2  duration-200 text-left ${
                  importMethod === 'draft'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    importMethod === 'draft' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <FileText 
                      size={18} 
                      className={importMethod === 'draft' ? 'text-white' : 'text-gray-600'} 
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Draft Document</div>
                    <div className="text-sm text-gray-600">Import saved draft or document</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Show cloud storage files if method is 'cloud' */}
          {importMethod === 'cloud' && (
            <>
              {files.length > 0 && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search cover letters..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              )}

              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Cloud size={20} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No cover letters found in cloud storage</p>
                  </div>
                ) : (
                  filteredFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => {
                        onLoad(file);
                        setShowImportModal(false);
                      }}
                      className="group p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{file.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{file.lastModified}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                          </div>
                        </div>
                        <div className="p-1.5 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                          <Download className="text-blue-600" size={14} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Import Button - Only show for cloud storage method */}
          {importMethod === 'cloud' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (filteredFiles.length > 0 && filteredFiles[0]) {
                    onLoad(filteredFiles[0]);
                    setShowImportModal(false);
                  }
                }}
                disabled={filteredFiles.length === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30 duration-200 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                Import Cover Letter
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 bg-gray-100/80 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200/80 hover:shadow-md duration-200 font-semibold border border-gray-200"
              >
                Cancel
              </button>
            </div>
          )}

          {/* For Draft Document method, only show cancel button since file selection is automatic */}
          {importMethod === 'draft' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full bg-gray-100/80 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200/80 hover:shadow-md duration-200 font-semibold border border-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.txt,.doc,.docx"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

