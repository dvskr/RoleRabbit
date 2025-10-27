'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, Loader } from 'lucide-react';

interface ResumeUploadModalProps {
  onUpload: (file: File) => void;
  onClose: () => void;
  isUploading: boolean;
}

export default function ResumeUploadModal({ onUpload, onClose, isUploading }: ResumeUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Resume</h2>
            <p className="text-blue-100 text-sm">Extract your portfolio data automatically</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />

              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              
              {!selectedFile ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your resume here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: PDF, Word, DOCX, TXT
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <FileText size={48} className="mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Choose Different File
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What we extract:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Personal information (name, email, contact)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Work experience & roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Education & certifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Skills & technologies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Projects & achievements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={18} />
                Extract & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

