'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, Tag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../utils/logger';

type UploadModalPayload = {
  file: File;
  displayName: string;
  type: 'resume' | 'template' | 'backup' | 'document';
  tags: string[];
  isPublic: boolean;
  folderId?: string | null;
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payload: UploadModalPayload) => Promise<void> | void;
  activeFolderId?: string | null;
}

export default function UploadModal({ isOpen, onClose, onUpload, activeFolderId }: UploadModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'resume' | 'template' | 'backup' | 'document'>('resume');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFileName('');
    setFileType('resume');
    setTags('');
    setIsPublic(false);
    setSelectedFile(null);
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose a file to upload.');
      return;
    }

    const trimmedName = fileName.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
    if (!trimmedName) {
      setErrorMessage('Please provide a name for the file.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const tagsList = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const payload: UploadModalPayload = {
      file: selectedFile,
      displayName: trimmedName,
      type: fileType,
      tags: tagsList,
      isPublic,
      folderId: activeFolderId ?? null,
    };

    try {
      await onUpload(payload);
      resetForm();
    } catch (error) {
      logger.error('Failed to upload file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    setErrorMessage(null);

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      setFileType('resume');
    } else if (extension === 'doc' || extension === 'docx') {
      setFileType('template');
    } else {
      setFileType('document');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      data-testid="storage-upload-modal"
    >
      <div
        className="rounded-lg p-4 w-full max-w-lg my-auto"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgeInfoBg }}
            >
              <Upload size={16} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                Upload File
              </h2>
              <p
                className="text-xs"
                style={{ color: colors.secondaryText }}
              >
                Add a new file to your storage
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close upload modal"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center transition-colors"
            style={{ borderColor: colors.border }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <Upload size={24} style={{ color: colors.tertiaryText }} className="mx-auto mb-1.5" />
            <p
              className="text-xs mb-1.5"
              style={{ color: colors.secondaryText }}
            >
              Drag and drop your file here, or click to browse
            </p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="file-upload"
              data-testid="storage-file-input"
            />
            <label
              htmlFor="file-upload"
              className="inline-block text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-sm"
              style={{ background: colors.primaryBlue }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Choose File
            </label>
            <p
              className="text-[10px] mt-1.5"
              style={{ color: colors.tertiaryText }}
            >
              Supports PDF, DOC, DOCX, TXT
            </p>
            {selectedFile && (
              <p
                className="text-[10px] mt-1"
                style={{ color: colors.secondaryText }}
              >
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: colors.primaryText }}
              >
                File Name *
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-2 top-2" style={{ color: colors.tertiaryText }} />
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                  className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg focus:outline-none transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: colors.primaryText }}
              >
                File Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'resume' | 'template' | 'backup' | 'document')}
                className="w-full px-2 py-1.5 text-sm rounded-lg focus:outline-none transition-all"
                aria-label="File type"
                title="File type"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <option value="resume" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Resume</option>
                <option value="template" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Template</option>
                <option value="backup" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Backup</option>
                <option value="document" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Document</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: colors.primaryText }}
              >
                Tags
              </label>
              <div className="relative">
                <Tag size={14} className="absolute left-2 top-2" style={{ color: colors.tertiaryText }} />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., software, engineer, react"
                  className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg focus:outline-none transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: colors.tertiaryText }}
              >
                Separate tags with commas
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-3.5 h-3.5 rounded focus:ring-2 transition-all"
                style={{ accentColor: colors.primaryBlue, borderColor: colors.border }}
              />
              <label
                htmlFor="isPublic"
                className="text-xs"
                style={{ color: colors.primaryText }}
              >
                Make this file public (visible to others)
              </label>
            </div>
          </div>
        </div>

        <div
          className="flex justify-end space-x-2 mt-4 pt-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isUploading}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            style={{
              background: (!selectedFile || isUploading) ? colors.inputBackground : colors.primaryBlue,
              color: (!selectedFile || isUploading) ? colors.tertiaryText : 'white',
              opacity: (!selectedFile || isUploading) ? 0.5 : 1,
              cursor: (!selectedFile || isUploading) ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (selectedFile && !isUploading) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFile && !isUploading) {
                e.currentTarget.style.opacity = '1';
              }
            }}
            data-testid="storage-upload-submit"
          >
            {isUploading ? (
              <>
                <div
                  className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'white' }}
                />
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

        {errorMessage && (
          <p className="mt-3 text-xs" style={{ color: colors.errorRed }} data-testid="storage-upload-error">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
