/**
 * TemplateUploadModal Component
 * Complete upload interface with drag & drop, metadata form, and progress tracking
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, FileImage, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import { useTemplateUpload, type TemplateUploadData } from '../../hooks/useTemplateUpload';
import { ImagePreview } from './ImagePreview';
import { UploadProgress } from './UploadProgress';
import { UploadLimits } from './UploadLimits';

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
  className?: string;
}

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const {
    limits,
    loading,
    error,
    uploadProgress,
    fetchLimits,
    uploadTemplate,
  } = useTemplateUpload({
    onUploadComplete: () => {
      setUploadSuccess(true);
      setTimeout(() => {
        handleClose();
        onUploadComplete?.();
      }, 2000);
    },
  });

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      fetchLimits();
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        resetForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchLimits]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading]);

  // Reset form
  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    setName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsPublic(true);
    setUploadSuccess(false);
  };

  // Handle close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!limits) return 'Upload limits not loaded';

      // Check file type
      if (!limits.allowedFileTypes.includes(file.type)) {
        return `Invalid file type. Allowed: ${limits.allowedFileTypes.join(', ')}`;
      }

      // Check file size
      if (file.size > limits.maxFileSize) {
        const maxSizeMB = (limits.maxFileSize / (1024 * 1024)).toFixed(2);
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }

      // Check upload limit
      if (limits.remainingUploads <= 0) {
        return 'Upload limit reached. Delete existing templates or upgrade to Premium.';
      }

      return null;
    },
    [limits]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      const error = validateFile(selectedFile);
      if (error) {
        alert(error);
        return;
      }

      setFile(selectedFile);

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Auto-fill name from filename
      if (!name) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setName(fileName);
      }
    },
    [validateFile, name]
  );

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Add tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const uploadData: TemplateUploadData = {
      file,
      name: name.trim(),
      description: description.trim(),
      tags,
      isPublic,
    };

    await uploadTemplate(uploadData);
  };

  if (!shouldRender) return null;

  const canUpload = file && name.trim() && !loading;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-black bg-opacity-0'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div
        className={`bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 id="upload-modal-title" className="text-xl font-bold text-gray-900">
                Upload Template
              </h2>
              {limits && !limits.isPremium && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Crown size={12} className="text-yellow-500" />
                  Premium users get unlimited uploads
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Upload Limits */}
          {limits && <UploadLimits limits={limits} className="mb-6" />}

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 text-sm text-green-700">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              Template uploaded successfully! Redirecting...
            </div>
          )}

          {/* File Upload Area */}
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FileImage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop file here' : 'Upload Template Image'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop an image file, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {limits && (
                <p className="text-xs text-gray-500 mt-4">
                  Max size: {(limits.maxFileSize / (1024 * 1024)).toFixed(0)}MB • Formats:{' '}
                  {limits.allowedFileTypes.map((type) => type.split('/')[1]).join(', ')}
                </p>
              )}
            </div>
          ) : (
            /* Image Preview and Metadata Form */
            <div className="space-y-6">
              {/* Image Preview */}
              <ImagePreview
                imageUrl={previewUrl}
                fileName={file.name}
                fileSize={file.size}
                onRemove={() => {
                  setFile(null);
                  setPreviewUrl('');
                }}
              />

              {/* Upload Progress */}
              {loading && <UploadProgress progress={uploadProgress} />}

              {/* Metadata Form */}
              {!loading && !uploadSuccess && (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      id="template-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      placeholder="e.g., Modern Resume Template"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{name.length}/100 characters</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="template-desc" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="template-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Describe your template..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="template-tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (up to 10)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        id="template-tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        placeholder="Add tag..."
                        disabled={tags.length >= 10}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || tags.length >= 10}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={isPublic}
                          onChange={() => setIsPublic(true)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Public (visible to everyone)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!isPublic}
                          onChange={() => setIsPublic(false)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Private (only you)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {file && (
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Template
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateUploadModal;
