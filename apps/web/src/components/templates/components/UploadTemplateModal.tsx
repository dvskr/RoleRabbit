/**
 * UploadTemplateModal - Modal for uploading resume and applying template
 */

import React, { useState } from 'react';
import type { ThemeColors } from '../types';
import { X, Folder, File, FileText, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { logger } from '../../../utils/logger';
import type { ResumeTemplate } from '../../../data/templates';
import { generateSampleResumePreview } from '../utils/templateHelpers';
import {
  validateResumeFile,
  formatFileSize,
  ALLOWED_RESUME_EXTENSIONS,
  MAX_FILE_SIZE,
} from '../../../utils/fileValidation';

interface UploadTemplateModalProps {
  isOpen: boolean;
  template: ResumeTemplate | null;
  uploadedFile: File | null;
  colors?: ThemeColors;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onDownloadPDF?: () => void;
  onDownloadWord?: () => void;
}

export default function UploadTemplateModal({
  isOpen,
  template,
  uploadedFile,
  colors,
  onClose,
  onFileSelect,
  onFileRemove,
  onDownloadPDF,
  onDownloadWord,
}: UploadTemplateModalProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen || !template) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Clear previous validation messages
    setValidationErrors([]);
    setValidationWarnings([]);

    if (!file) return;

    // Show validation in progress
    setIsValidating(true);

    try {
      // Validate the file
      const validationResult = await validateResumeFile(file, {
        checkContent: true, // Verify file signature/magic bytes
      });

      logger.debug('File validation result:', validationResult);

      if (!validationResult.valid) {
        // File validation failed
        setValidationErrors(validationResult.errors);
        setValidationWarnings(validationResult.warnings);
        logger.warn('File validation failed:', validationResult.errors);

        // Clear the file input
        e.target.value = '';
        return;
      }

      // Show warnings if any (file is still valid but has warnings)
      if (validationResult.warnings.length > 0) {
        setValidationWarnings(validationResult.warnings);
      }

      // File is valid, pass it up
      onFileSelect(file);
    } catch (error) {
      logger.error('Error validating file:', error);
      setValidationErrors(['An error occurred while validating the file. Please try again.']);

      // Clear the file input
      e.target.value = '';
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Upload & Apply Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {!uploadedFile ? (
            /* Upload Area */
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Upload Your Resume</h3>

                {/* File Requirements */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">File Requirements:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Formats: {ALLOWED_RESUME_EXTENSIONS.join(', ')}</li>
                    <li>• Maximum size: {formatFileSize(MAX_FILE_SIZE)}</li>
                    <li>• File will be validated for security</li>
                  </ul>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800 mb-2">File Upload Failed</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Warnings */}
                {validationWarnings.length > 0 && validationErrors.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-800 mb-2">Warning</p>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {validationWarnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
                    isValidating
                      ? 'border-blue-400 bg-blue-50'
                      : validationErrors.length > 0
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={isValidating}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center ${
                      isValidating ? 'cursor-wait' : 'cursor-pointer'
                    }`}
                  >
                    <Folder
                      size={48}
                      className={`mb-4 ${
                        isValidating
                          ? 'text-blue-500 animate-pulse'
                          : validationErrors.length > 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    />
                    {isValidating ? (
                      <p className="text-blue-600 font-medium mb-2">Validating file...</p>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-2">Drop file here or click to browse</p>
                        <span className="text-sm text-gray-500">
                          Supports: PDF, DOC, DOCX, TXT
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            /* Preview Area */
            <>
              <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File size={24} className="text-green-600" />
                  <div>
                    <p className="font-semibold">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={onFileRemove}
                  className="p-1 hover:bg-red-100 rounded"
                  aria-label="Remove file"
                >
                  <XCircle size={20} className="text-red-600" />
                </button>
              </div>

              {/* Preview of Resume with Template */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Preview with Template</h3>
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-lg">
                    {generateSampleResumePreview(template)}
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">Download Format</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      logger.debug('Downloading as PDF with template:', template.id);
                      if (onDownloadPDF) {
                        onDownloadPDF();
                      } else {
                        alert('PDF download will be generated with template applied!');
                      }
                    }}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                  >
                    <FileText size={32} className="text-red-600" />
                    <p className="font-semibold">Download as PDF</p>
                    <p className="text-sm text-gray-600">Portable format</p>
                  </button>
                  <button
                    onClick={() => {
                      logger.debug('Downloading as DOC with template:', template.id);
                      if (onDownloadWord) {
                        onDownloadWord();
                      } else {
                        alert('Word document will be generated with template applied!');
                      }
                    }}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                  >
                    <FileText size={32} className="text-blue-600" />
                    <p className="font-semibold">Download as Word</p>
                    <p className="text-sm text-gray-600">Editable format</p>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

