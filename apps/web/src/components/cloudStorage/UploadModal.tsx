'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertTriangle, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../utils/logger';
import { ResumeFile, StorageInfo } from '../../types/cloudStorage';
import { formatFileSize } from '../../utils/formatters';
import apiService from '../../services/apiService';
import {
  validateFileSize,
  validateMimeType,
  validateFilename,
  validateFileTypeRestriction,
  validateDescription,
  checkStorageQuota as validateQuota,
  sanitizeFilename,
  MAX_FILENAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '../../utils/validation';

type UploadModalPayload = {
  file: File;
  displayName: string;
  type: ResumeFile['type'];
  description?: string;
  folderId?: string | null;
  tags?: string[];
  expiresAt?: string;
};

interface UploadQueueItem {
  id: string;
  file: File;
  displayName: string;
  type: ResumeFile['type'];
  description?: string;
  tags?: string[];
  expiresAt?: string;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  progress: number;
  speed: number; // bytes per second
  error?: string;
  abortController?: AbortController;
  startTime?: number;
  uploadedBytes?: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payload: UploadModalPayload) => Promise<void> | void;
  activeFolderId?: string | null;
  storageInfo?: StorageInfo;
  existingFiles?: ResumeFile[];
}

const MAX_CONCURRENT_UPLOADS = 3;
const QUOTA_WARNING_THRESHOLD = 80; // 80% of quota

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  activeFolderId,
  storageInfo,
  existingFiles = []
}: UploadModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Single file upload state (legacy support)
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<ResumeFile['type']>('resume');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{ name: string; action: 'rename' | 'replace' | null } | null>(null);
  
  // Multiple file upload queue
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Upload progress tracking
  const uploadProgressRef = useRef<Map<string, { loaded: number; startTime: number; lastUpdate: number }>>(new Map());

  const fileTypeOptions: ResumeFile['type'][] = [
    'resume',
    'template',
    'backup',
    'cover_letter',
    'transcript',
    'certification',
    'reference',
    'portfolio',
    'work_sample',
    'document',
  ];

  // Check for duplicate files
  const checkDuplicate = useCallback((name: string): ResumeFile | null => {
    return existingFiles.find(f => 
      f.name.toLowerCase() === name.toLowerCase() && 
      !f.deletedAt
    ) || null;
  }, [existingFiles]);

  // Check storage quota using validation utility
  const checkStorageQuota = useCallback((fileSize: number) => {
    if (!storageInfo) return { allowed: true };
    
    const usedBytes = storageInfo.usedBytes || 0;
    const limitBytes = storageInfo.limitBytes || 0;
    
    return validateQuota(fileSize, usedBytes, limitBytes);
  }, [storageInfo]);

  // Format upload speed
  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  // Handle file selection (single or multiple) with comprehensive validation
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newQueueItems: UploadQueueItem[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      // FE-021: Validate file size
      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        errors.push(`${file.name}: ${sizeValidation.error}`);
        continue;
      }

      // FE-030: Check storage quota
      const quotaCheck = checkStorageQuota(file.size);
      if (!quotaCheck.allowed) {
        errors.push(`${file.name}: ${quotaCheck.error}`);
        continue;
      }

      // FE-023 & FE-024: Validate filename
      const filenameValidation = validateFilename(file.name);
      if (!filenameValidation.valid) {
        if (filenameValidation.sanitized) {
          // Auto-sanitize and continue
          file.name = filenameValidation.sanitized;
        } else {
          errors.push(`${file.name}: ${filenameValidation.error}`);
          continue;
        }
      }

      // FE-022: Validate MIME type
      const mimeValidation = await validateMimeType(file);
      if (!mimeValidation.valid && mimeValidation.error) {
        errors.push(`${file.name}: ${mimeValidation.error}`);
        continue;
      }

      // Get display name (sanitized)
      const displayName = file.name.replace(/\.[^/.]+$/, '');
      
      // FE-025: Validate file type restriction (will be checked again when type is selected)
      // For now, determine file type from extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      let detectedType: ResumeFile['type'] = 'document';
      if (extension === 'pdf') {
        detectedType = 'resume';
      } else if (extension === 'doc' || extension === 'docx') {
        detectedType = 'template';
      }

      // Check for duplicates
      const duplicate = checkDuplicate(displayName);
      if (duplicate && newQueueItems.length === 0) {
        setDuplicateWarning({ name: displayName, action: null });
      }

      const queueItem: UploadQueueItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        displayName,
        type: detectedType,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        expiresAt: expiresAt || undefined,
        status: 'pending',
        progress: 0,
        speed: 0,
      };

      newQueueItems.push(queueItem);
    }

    // Show errors if any
    if (errors.length > 0) {
      setErrorMessage(errors.join('; '));
    }

    if (newQueueItems.length > 0) {
      setUploadQueue(prev => [...prev, ...newQueueItems]);
      
      // If single file, also set legacy state
      if (newQueueItems.length === 1) {
        setSelectedFile(newQueueItems[0].file);
        setFileName(newQueueItems[0].displayName);
        setFileType(newQueueItems[0].type);
      }
    }
  }, [checkDuplicate, checkStorageQuota]);

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Upload single file with progress tracking
  const uploadFileWithProgress = useCallback(async (
    queueItem: UploadQueueItem,
    abortController: AbortController,
    onProgress: (progress: number, speed: number) => void
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', queueItem.file);
    formData.append('displayName', queueItem.displayName);
    formData.append('type', queueItem.type);
    
    if (queueItem.description) {
      formData.append('description', queueItem.description);
    }
    // FE-017: Add tags to upload
    if (queueItem.tags && queueItem.tags.length > 0) {
      formData.append('tags', JSON.stringify(queueItem.tags));
    }
    // FE-018: Add expiration date to upload
    if (queueItem.expiresAt) {
      formData.append('expiresAt', queueItem.expiresAt);
    }
    if (activeFolderId) {
      formData.append('folderId', activeFolderId);
    }

    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    // Connect abort controller to XHR
    abortController.signal.addEventListener('abort', () => {
      xhr.abort();
    });

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          const currentTime = Date.now();
          const timeDelta = (currentTime - lastTime) / 1000; // seconds
          const bytesDelta = e.loaded - lastLoaded;
          const speed = timeDelta > 0 ? bytesDelta / timeDelta : 0;
          
          onProgress(progress, speed);
          
          lastLoaded = e.loaded;
          lastTime = currentTime;
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve();
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || error.message || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/storage/files/upload`);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }, [activeFolderId]);

  // Process upload queue
  useEffect(() => {
    const processQueue = async () => {
      const pendingItems = uploadQueue.filter(item => item.status === 'pending');
      const uploadingItems = uploadQueue.filter(item => item.status === 'uploading');
      
      if (pendingItems.length === 0 || uploadingItems.length >= MAX_CONCURRENT_UPLOADS) {
        return;
      }

      const slotsAvailable = MAX_CONCURRENT_UPLOADS - uploadingItems.length;
      const itemsToUpload = pendingItems.slice(0, slotsAvailable);

      for (const item of itemsToUpload) {
        const abortController = new AbortController();
        
        setUploadQueue(prev => prev.map(q => 
          q.id === item.id 
            ? { ...q, status: 'uploading', abortController, startTime: Date.now() }
            : q
        ));

        try {
          await uploadFileWithProgress(item, abortController, (progress, speed) => {
            setUploadQueue(prev => prev.map(q => 
              q.id === item.id 
                ? { ...q, progress, speed }
                : q
            ));
          });

          // Upload successful
          setUploadQueue(prev => prev.map(q => 
            q.id === item.id 
              ? { ...q, status: 'success', progress: 100 }
              : q
          ));

          // Call onUpload callback for legacy support
          if (uploadQueue.length === 1) {
            await onUpload({
              file: item.file,
              displayName: item.displayName,
              type: item.type,
              description: item.description,
              tags: item.tags,
              expiresAt: item.expiresAt,
              folderId: activeFolderId ?? null,
            });
          }
        } catch (error: any) {
          setUploadQueue(prev => prev.map(q => 
            q.id === item.id 
              ? { ...q, status: 'error', error: error.message || 'Upload failed' }
              : q
          ));
        }
      }
    };

    if (isOpen && uploadQueue.length > 0) {
      processQueue();
    }
  }, [uploadQueue, isOpen, uploadFileWithProgress, onUpload, activeFolderId]);

  // Cancel upload
  const handleCancelUpload = useCallback((queueItemId: string) => {
    setUploadQueue(prev => prev.map(q => {
      if (q.id === queueItemId && q.abortController) {
        q.abortController.abort();
        return { ...q, status: 'cancelled' };
      }
      return q;
    }));
  }, []);

  // Retry failed upload
  const handleRetryUpload = useCallback((queueItemId: string) => {
    setUploadQueue(prev => prev.map(q => 
      q.id === queueItemId 
        ? { ...q, status: 'pending', progress: 0, speed: 0, error: undefined }
        : q
    ));
  }, []);

  // Remove from queue
  const handleRemoveFromQueue = useCallback((queueItemId: string) => {
    setUploadQueue(prev => {
      const item = prev.find(q => q.id === queueItemId);
      if (item?.abortController) {
        item.abortController.abort();
      }
      return prev.filter(q => q.id !== queueItemId);
    });
  }, []);

  // Clear completed uploads
  const handleClearCompleted = useCallback(() => {
    setUploadQueue(prev => prev.filter(q => q.status !== 'success' && q.status !== 'cancelled'));
  }, []);

  // Handle duplicate action
  const handleDuplicateAction = useCallback((action: 'rename' | 'replace') => {
    if (!duplicateWarning) return;
    
    if (action === 'rename') {
      setFileName(`${duplicateWarning.name} (copy)`);
    }
    // For replace, we'll proceed with upload (backend should handle)
    
    setDuplicateWarning(null);
  }, [duplicateWarning]);

  // Add tag
  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  // Remove tag
  const handleRemoveTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFileName('');
    setFileType('resume');
    setDescription('');
    setTags([]);
    setTagInput('');
    setExpiresAt('');
    setSelectedFile(null);
    setErrorMessage(null);
    setDuplicateWarning(null);
    setUploadQueue([]);
    setIsDragging(false);
  }, []);

  // Handle upload (legacy single file mode) with comprehensive validation
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose a file to upload.');
      return;
    }

    // FE-023 & FE-024: Validate filename
    const trimmedName = fileName.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
    if (!trimmedName) {
      setErrorMessage('Please provide a name for the file.');
      return;
    }

    const filenameValidation = validateFilename(trimmedName);
    if (!filenameValidation.valid) {
      if (filenameValidation.sanitized) {
        setFileName(filenameValidation.sanitized);
        setErrorMessage(`Filename was sanitized: ${filenameValidation.error}`);
        return;
      }
      setErrorMessage(`Invalid filename: ${filenameValidation.error}`);
      return;
    }

    // FE-021: Validate file size
    const sizeValidation = validateFileSize(selectedFile);
    if (!sizeValidation.valid) {
      setErrorMessage(sizeValidation.error || 'File size validation failed');
      return;
    }

    // FE-030: Check quota
    const quotaCheck = checkStorageQuota(selectedFile.size);
    if (!quotaCheck.allowed) {
      setErrorMessage(quotaCheck.error || 'Storage quota exceeded');
      return;
    }

    // FE-025: Validate file type restriction
    const typeValidation = validateFileTypeRestriction(selectedFile, fileType);
    if (!typeValidation.valid) {
      setErrorMessage(typeValidation.error || 'File type not allowed for this category');
      return;
    }

    // FE-029: Validate description length
    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      setErrorMessage(descValidation.error || 'Description is too long');
      return;
    }

    // Check duplicate
    const duplicate = checkDuplicate(trimmedName);
    if (duplicate && !duplicateWarning) {
      setDuplicateWarning({ name: trimmedName, action: null });
      return;
    }

    setErrorMessage(null);

    const payload: UploadModalPayload = {
      file: selectedFile,
      displayName: trimmedName,
      type: fileType,
      description: description.trim() || undefined,
      folderId: activeFolderId ?? null,
      tags: tags.length > 0 ? tags : undefined,
      expiresAt: expiresAt || undefined,
    };

    try {
      await onUpload(payload);
      resetForm();
      onClose();
    } catch (error) {
      logger.error('Failed to upload file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file');
    }
  }, [selectedFile, fileName, fileType, description, tags, expiresAt, activeFolderId, onUpload, checkStorageQuota, checkDuplicate, duplicateWarning, resetForm, onClose]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Close modal when all uploads complete
  useEffect(() => {
    const allComplete = uploadQueue.length > 0 && 
      uploadQueue.every(q => q.status === 'success' || q.status === 'error' || q.status === 'cancelled');
    const hasSuccess = uploadQueue.some(q => q.status === 'success');
    
    if (allComplete && hasSuccess && uploadQueue.length > 1) {
      // Auto-close after 2 seconds if multiple files uploaded
      const timer = setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadQueue, resetForm, onClose]);

  if (!isOpen) return null;

  const hasUploads = uploadQueue.length > 0;
  const hasActiveUploads = uploadQueue.some(q => q.status === 'uploading' || q.status === 'pending');
  const completedCount = uploadQueue.filter(q => q.status === 'success').length;
  const errorCount = uploadQueue.filter(q => q.status === 'error').length;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      data-testid="storage-upload-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget && !hasActiveUploads) {
          resetForm();
          onClose();
        }
      }}
    >
      <div 
        className="rounded-lg p-6 w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgeInfoBg }}
            >
              <Upload size={20} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h2 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                {hasUploads ? `Upload Files (${uploadQueue.length})` : 'Upload File'}
              </h2>
              <p 
                className="text-xs mt-0.5"
                style={{ color: colors.secondaryText }}
              >
                {hasUploads 
                  ? `${completedCount} completed, ${errorCount} failed, ${uploadQueue.length - completedCount - errorCount} pending`
                  : 'Add files to your storage'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!hasActiveUploads) {
              resetForm();
              onClose();
              }
            }}
            disabled={hasActiveUploads}
            className="p-2 transition-colors disabled:opacity-50"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              if (!hasActiveUploads) {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close upload modal"
            title={hasActiveUploads ? 'Please wait for uploads to complete' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Upload Queue */}
        {hasUploads && (
          <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border"
                style={{
                  background: colors.inputBackground,
                  borderColor: item.status === 'error' ? colors.errorRed : 
                               item.status === 'success' ? colors.badgeSuccessText :
                               colors.border,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={16} style={{ color: colors.primaryText }} />
                      <p className="text-sm font-medium truncate" style={{ color: colors.primaryText }}>
                        {item.displayName}
                      </p>
                      {item.status === 'success' && (
                        <CheckCircle size={16} style={{ color: colors.badgeSuccessText }} />
                      )}
                      {item.status === 'error' && (
                        <XCircle size={16} style={{ color: colors.errorRed }} />
                      )}
                      {item.status === 'uploading' && (
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" 
                          style={{ borderColor: colors.primaryBlue }} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: colors.secondaryText }}>
                      <span>{formatFileSize(item.file.size)}</span>
                      {item.status === 'uploading' && item.speed > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatSpeed(item.speed)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'error' && (
                      <button
                        onClick={() => handleRetryUpload(item.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: colors.primaryBlue }}
                        title="Retry upload"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    {(item.status === 'pending' || item.status === 'uploading') && (
                      <button
                        onClick={() => handleCancelUpload(item.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: colors.errorRed }}
                        title="Cancel upload"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {(item.status === 'success' || item.status === 'error' || item.status === 'cancelled') && (
                      <button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: colors.secondaryText }}
                        title="Remove from queue"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {(item.status === 'uploading' || item.status === 'success') && (
                  <div className="mt-3">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: colors.inputBackground }}>
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${item.progress}%`,
                          background: item.status === 'success' ? colors.badgeSuccessText : colors.primaryBlue,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs" style={{ color: colors.secondaryText }}>
                      <span>{item.progress.toFixed(0)}%</span>
                      {item.status === 'uploading' && item.speed > 0 && (
                        <span>{formatSpeed(item.speed)}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Error Message */}
                {item.status === 'error' && item.error && (
                  <p className="mt-2 text-xs" style={{ color: colors.errorRed }}>
                    {item.error}
                  </p>
                )}
              </div>
            ))}
            
            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="text-xs px-3 py-1.5 rounded transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Clear completed ({completedCount})
              </button>
            )}
          </div>
        )}

        {/* Drag and Drop Zone */}
        {!hasUploads && (
          <div 
            ref={dropZoneRef}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging ? 'scale-105' : ''
            }`}
            style={{ 
              borderColor: isDragging ? colors.primaryBlue : colors.border,
              background: isDragging ? `${colors.primaryBlue}10` : 'transparent',
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload 
              size={32} 
              style={{ color: isDragging ? colors.primaryBlue : colors.tertiaryText }} 
              className="mx-auto mb-3" 
            />
            <p 
              className="text-sm mb-2 font-medium"
              style={{ color: isDragging ? colors.primaryBlue : colors.primaryText }}
            >
              {isDragging ? 'Drop files here' : 'Drag and drop your files here, or click to browse'}
            </p>
            <p 
              className="text-xs mb-4"
              style={{ color: colors.secondaryText }}
            >
              Supports PDF, DOC, DOCX, TXT, and more
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files)}
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              className="hidden"
              id="file-upload"
              data-testid="storage-file-input"
            />
            <label
              htmlFor="file-upload"
              className="inline-block text-white px-4 py-2 rounded-lg transition-all cursor-pointer text-sm font-medium"
              style={{ background: colors.primaryBlue }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Choose Files
            </label>
          </div>
        )}

        {/* File Details Form (shown when single file selected or queue empty) */}
        {(!hasUploads || uploadQueue.length === 1) && (
          <div className="space-y-4 mt-6">
            {/* File Info Display */}
            {selectedFile && (
              <div className="p-3 rounded-lg" style={{ background: colors.inputBackground }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText size={16} style={{ color: colors.primaryText }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: colors.primaryText }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-xs" style={{ color: colors.secondaryText }}>
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFileName('');
                    }}
                    className="p-1 rounded transition-colors"
                style={{ color: colors.secondaryText }}
              >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Storage Quota Warning */}
            {selectedFile && storageInfo && (() => {
              const quotaCheck = checkStorageQuota(selectedFile.size);
              return quotaCheck.warning ? (
                <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: colors.badgeWarningBg }}>
                  <AlertTriangle size={16} style={{ color: colors.badgeWarningText }} className="mt-0.5" />
                  <p className="text-xs flex-1" style={{ color: colors.badgeWarningText }}>
                    {quotaCheck.warning}
                  </p>
                </div>
              ) : null;
            })()}

            {/* Duplicate File Warning */}
            {duplicateWarning && (
              <div className="p-4 rounded-lg border" style={{ background: colors.badgeWarningBg, borderColor: colors.badgeWarningText }}>
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle size={18} style={{ color: colors.badgeWarningText }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: colors.badgeWarningText }}>
                      File with this name already exists
                    </p>
                    <p className="text-xs" style={{ color: colors.secondaryText }}>
                      Choose an action to proceed
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDuplicateAction('rename')}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDuplicateAction('replace')}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => setDuplicateWarning(null)}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.secondaryText,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* File Name */}
            <div>
              <label 
                className="block text-xs font-medium mb-1.5"
                style={{ color: colors.primaryText }}
              >
                File Name *
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-2.5 top-2.5" style={{ color: colors.tertiaryText }} />
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => {
                    const value = e.target.value;
                    // FE-023: Enforce max length
                    if (value.length <= MAX_FILENAME_LENGTH) {
                      setFileName(value);
                    }
                  }}
                  placeholder="Enter file name"
                  maxLength={MAX_FILENAME_LENGTH}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
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
                    // FE-024: Sanitize on blur
                    const validation = validateFilename(e.target.value);
                    if (!validation.valid && validation.sanitized) {
                      setFileName(validation.sanitized);
                    }
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
                {fileName.length} / {MAX_FILENAME_LENGTH} characters
              </p>
            </div>

            {/* File Type */}
            <div>
              <label 
                className="block text-xs font-medium mb-1.5"
                style={{ color: colors.primaryText }}
              >
                File Type
              </label>
              <select
                value={fileType}
                onChange={(e) => {
                  const newType = e.target.value as ResumeFile['type'];
                  setFileType(newType);
                  
                  // FE-025: Validate file type restriction when type changes
                  if (selectedFile) {
                    const typeValidation = validateFileTypeRestriction(selectedFile, newType);
                    if (!typeValidation.valid) {
                      setErrorMessage(typeValidation.error || 'File type not allowed for this category');
                    } else {
                      setErrorMessage(null);
                    }
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
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
                {fileTypeOptions.map((option) => (
                  <option
                    key={option}
                    value={option}
                    style={{
                      background: theme.mode === 'dark' ? '#1a1625' : '#ffffff',
                      color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b',
                    }}
                  >
                    {option.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label 
                className="block text-xs font-medium mb-1.5"
                style={{ color: colors.primaryText }}
              >
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  // FE-029: Enforce max length
                  if (value.length <= MAX_DESCRIPTION_LENGTH) {
                    setDescription(value);
                  }
                }}
                placeholder="Add a description for this file..."
                rows={3}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all resize-none"
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
              <p className="text-xs mt-1" style={{ 
                color: description.length > MAX_DESCRIPTION_LENGTH * 0.9 
                  ? colors.errorRed 
                  : colors.tertiaryText 
              }}>
                {description.length} / {MAX_DESCRIPTION_LENGTH} characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label 
                className="block text-xs font-medium mb-1.5"
                style={{ color: colors.primaryText }}
              >
                Tags (Optional)
                <span className="text-xs ml-1" style={{ color: colors.tertiaryText }}>
                  (Requires backend support)
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded text-xs flex items-center gap-1"
                    style={{
                      background: colors.badgeInfoBg,
                      color: colors.badgeInfoText,
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: colors.primaryBlue,
                    color: 'white',
                  }}
                >
                  Add
                </button>
          </div>
        </div>

            {/* Expiration Date */}
            <div>
              <label 
                className="block text-xs font-medium mb-1.5"
                style={{ color: colors.primaryText }}
              >
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
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
        )}

        {/* Action Buttons */}
        <div 
          className="flex justify-end space-x-2 mt-6 pt-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={() => {
              if (!hasActiveUploads) {
              resetForm();
              onClose();
              }
            }}
            disabled={hasActiveUploads}
            className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
          >
            {hasActiveUploads ? 'Uploading...' : 'Cancel'}
          </button>
          {!hasUploads && (
          <button
            onClick={handleUpload}
              disabled={!selectedFile}
              className="px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            style={{
                background: !selectedFile ? colors.inputBackground : colors.primaryBlue,
                color: !selectedFile ? colors.tertiaryText : 'white',
            }}
            data-testid="storage-upload-submit"
          >
              <Upload size={16} />
                <span>Upload File</span>
            </button>
            )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: colors.badgeErrorBg }}>
            <AlertTriangle size={16} style={{ color: colors.errorRed }} className="mt-0.5" />
            <p className="text-xs flex-1" style={{ color: colors.errorRed }} data-testid="storage-upload-error">
            {errorMessage}
          </p>
          </div>
        )}
      </div>
    </div>
  );
}
