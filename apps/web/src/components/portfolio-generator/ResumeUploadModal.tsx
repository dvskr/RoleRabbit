'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, Loader, AlertCircle } from 'lucide-react';
import { validateResumeFile, formatFileSize, VALIDATION_LIMITS, ALLOWED_FILE_TYPES } from '../../utils/formValidation';
import { ValidationMessage } from '../validation/ValidationMessage';

interface ResumeUploadModalProps {
  onUpload: (file: File) => void;
  onClose: () => void;
  isUploading: boolean;
}

export default function ResumeUploadModal({ onUpload, onClose, isUploading }: ResumeUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setValidationError('');
      return;
    }

    // Validate file
    const validation = validateResumeFile(file);

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setValidationError('');
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && !validationError) {
      onUpload(selectedFile);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            disabled={isUploading}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
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
                  : validationError
                  ? 'border-red-300 bg-red-50'
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
                accept={ALLOWED_FILE_TYPES.RESUME.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />

              <Upload size={48} className="mx-auto mb-4 text-gray-400" />

              {!selectedFile ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your resume here</h3>
                  <p className="text-gray-600 mb-4">or click to browse</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: {ALLOWED_FILE_TYPES.RESUME.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum size: {VALIDATION_LIMITS.FILE.RESUME_MAX_SIZE / (1024 * 1024)}MB
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <FileText size={48} className="mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedFile.type || 'Unknown file type'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    disabled={isUploading}
                    className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    Choose Different File
                  </button>
                </div>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-red-900">File Validation Error</h4>
                    <p className="text-sm text-red-800 mt-1">{validationError}</p>
                  </div>
                </div>
              </div>
            )}

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
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || !!validationError || isUploading}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title={
              !selectedFile
                ? 'Please select a file'
                : validationError
                ? 'Please fix file validation errors'
                : ''
            }
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
