import { useState, useCallback } from 'react';
import { ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';

// Helper to format file size
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

type UploadPayload = {
  file: File;
  displayName?: string;
  type?: ResumeFile['type'] | string;
  description?: string;
  folderId?: string | null;
};

type StorageCallback = (storage: {
  usedBytes: number;
  limitBytes: number;
  percentage: number;
  usedGB?: number;
  limitGB?: number;
}) => void;

interface UseFileOperationsOptions {
  onStorageUpdate?: StorageCallback;
}

export const useFileOperations = ({ onStorageUpdate }: UseFileOperationsOptions = {}) => {
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ usedGB: 0, limitGB: 0, percentage: 0 });

  const loadFilesFromAPI = useCallback(async (includeDeleted: boolean = false) => {
    setIsLoading(true);
    try {
      logger.info('📥 Loading files from API (includeDeleted:', includeDeleted, ')');
      const response = await apiService.getCloudFiles(undefined, includeDeleted);
      logger.info('📥 API response:', { 
        filesCount: response?.files?.length || 0,
        success: response?.success
      });
      
      if (response && response.files) {
        const formattedFiles = (response.files as ResumeFile[]).map(file => ({
          ...file,
          sharedWith: file.sharedWith || [],
          comments: file.comments || [],
          downloadCount: file.downloadCount || 0,
          viewCount: file.viewCount || 0,
          isStarred: file.isStarred || false,
          isArchived: file.isArchived || false,
          version: file.version || 1,
          owner: file.owner || file.userId || '',
          lastModified: file.lastModified || file.createdAt || file.updatedAt || new Date().toISOString(),
          size: typeof file.size === 'number' ? formatBytes(file.size) : (file.size || '0 B'),
          sizeBytes: typeof file.size === 'number' ? file.size : (file.sizeBytes || 0),
          folderId: file.folderId || null, // Ensure null instead of undefined
          deletedAt: file.deletedAt || null, // Ensure null instead of undefined
        }));
        setFiles(formattedFiles);
        logger.info(`✅ Loaded ${formattedFiles.length} files from API`);
      } else {
        logger.warn('⚠️ No files in API response');
        setFiles([]);
      }
      
      if (response?.storage) {
        setStorageInfo(response.storage);
        onStorageUpdate?.(response.storage);
      }
    } catch (error: any) {
      logger.error('❌ Failed to load files from API:', error);
      logger.error('Error details:', error.message);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [onStorageUpdate]);

  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const handleSelectAll = useCallback((filteredFiles: ResumeFile[]) => {
    setSelectedFiles(prev => {
      const allSelected = prev.length === filteredFiles.length && filteredFiles.length > 0;
      return allSelected ? [] : filteredFiles.map(file => file.id);
    });
  }, []);

  const handleDeleteFiles = useCallback(async () => {
    try {
      // Delete from backend (soft delete)
      await Promise.all(selectedFiles.map(id => apiService.deleteCloudFile(id)));
      // Update local state - set deletedAt instead of removing
      setFiles(prev => prev.map(file => 
        selectedFiles.includes(file.id) 
          ? { ...file, deletedAt: new Date().toISOString() } 
          : file
      ));
      setSelectedFiles([]);
    } catch (error) {
      logger.error('Failed to delete files:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        selectedFiles.includes(file.id) 
          ? { ...file, deletedAt: new Date().toISOString() } 
          : file
      ));
      setSelectedFiles([]);
    }
  }, [selectedFiles]);

  const handleDownloadFile = useCallback(async (file: ResumeFile, format?: 'pdf' | 'doc') => {
    try {
      if (format && file.fileName && !file.fileName.toLowerCase().endsWith(`.${format}`)) {
        logger.debug(`Requested ${format.toUpperCase()} download for ${file.name}, delivering original file format.`);
      }

      // Validate file before download
      if (!file.id) {
        throw new Error('Invalid file: missing file ID');
      }

      const blob = await apiService.downloadCloudFile(file.id);
      
      if (!blob || blob.size === 0) {
        throw new Error('File is empty or corrupted');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fallbackExtension = file.contentType?.split('/').pop() || 'bin';
      const downloadName = file.fileName || `${file.name}.${fallbackExtension}`;

      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFiles(prev => prev.map(existing =>
        existing.id === file.id
          ? { ...existing, downloadCount: (existing.downloadCount || 0) + 1 }
          : existing
      ));
    } catch (error: any) {
      logger.error('Failed to download file:', error);
      throw error; // Re-throw so parent can show toast
    }
  }, [setFiles]);

  /**
   * Legacy share handler - not used in current implementation
   * Sharing is handled through ShareModal component which calls handleShareWithUser
   * from useSharingOperations hook. This function is kept for backwards compatibility
   * but can be safely removed.
   */
  const handleShareFile = useCallback((file: ResumeFile) => {
    logger.debug('handleShareFile called for:', file.name);
    logger.info('Note: Actual sharing is handled through ShareModal -> handleShareWithUser');
    // No-op: ShareModal handles all sharing functionality
  }, []);

  const handleUploadFile = useCallback(async (payload: UploadPayload, onComplete?: () => void) => {
    try {
      const formData = new FormData();
      formData.append('file', payload.file);

      if (payload.displayName) {
        formData.append('displayName', payload.displayName);
      }
      if (payload.type) {
        formData.append('type', payload.type);
      }
      if (payload.folderId) {
        formData.append('folderId', payload.folderId);
      }
      if (payload.description) {
        formData.append('description', payload.description);
      }

      logger.info('📤 Uploading file to API...');
      const response = await apiService.uploadStorageFile(formData);
      logger.info('📤 Upload response:', { 
        success: response?.success,
        hasFile: !!response?.file,
        fileId: response?.file?.id 
      });
      
      if (response && response.file) {
        // Transform API response to ResumeFile format
        const uploadedFile: ResumeFile = {
          ...response.file,
          // Ensure all required fields have defaults
          sharedWith: response.file.sharedWith || [],
          comments: response.file.comments || [],
          downloadCount: response.file.downloadCount || 0,
          viewCount: response.file.viewCount || 0,
          isStarred: response.file.isStarred || false,
          isArchived: response.file.isArchived || false,
          version: response.file.version || 1,
          owner: response.file.owner || response.file.userId || '',
          lastModified: response.file.createdAt || response.file.updatedAt || new Date().toISOString(),
          size: typeof response.file.size === 'number' 
            ? formatBytes(response.file.size) 
            : (response.file.size || '0 B'),
          sizeBytes: typeof response.file.size === 'number' ? response.file.size : (response.file.sizeBytes || 0),
        };
        logger.info(`✅ File uploaded successfully: ${uploadedFile.id}`);
        
        // Add to local state
        setFiles(prev => {
          // Check if file already exists (prevent duplicates)
          const exists = prev.find(f => f.id === uploadedFile.id);
          if (exists) {
            logger.warn('File already in list, updating instead of adding');
            return prev.map(f => f.id === uploadedFile.id ? uploadedFile : f);
          }
          return [uploadedFile, ...prev];
        });
      } else {
        logger.warn('⚠️ Upload response missing file data');
      }

      if (response?.storage) {
        setStorageInfo(response.storage);
        onStorageUpdate?.(response.storage);
      }

      onComplete?.();
      
      // Reload files from API to ensure we have the latest data from database
      logger.info('🔄 Reloading files from API after upload...');
      try {
        await loadFilesFromAPI(false);
      } catch (err) {
          logger.error('Failed to reload files after upload:', err);
      }
    } catch (error) {
      logger.error('Failed to save file to API:', error);
      if ((error as any)?.storage && onStorageUpdate) {
        onStorageUpdate((error as any).storage);
      }
      throw error;
    }
  }, [onStorageUpdate, loadFilesFromAPI]);

  const handleEditFile = useCallback(async (fileId: string, updates: Partial<Pick<ResumeFile, 'name' | 'type' | 'description' | 'isStarred' | 'isArchived' | 'folderId'>>, showDeleted: boolean = false) => {
    const updatePayload: Record<string, any> = {};

    if (updates.name !== undefined) {
      updatePayload.name = updates.name;
    }

    if (updates.type !== undefined) {
      updatePayload.type = updates.type;
    }

    if (updates.description !== undefined) {
      updatePayload.description = updates.description;
    }

    if (updates.isStarred !== undefined) {
      updatePayload.isStarred = updates.isStarred;
    }

    if (updates.isArchived !== undefined) {
      updatePayload.isArchived = updates.isArchived;
    }

    if (updates.folderId !== undefined) {
      updatePayload.folderId = updates.folderId;
    }

    // Store previous state for rollback
    let previousFile: ResumeFile | undefined;

    // Optimistic update - update UI immediately
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        previousFile = file;
        return {
          ...file,
          ...updatePayload,
        } as ResumeFile;
      }
      return file;
    }));

    try {
      await apiService.updateCloudFile(fileId, updatePayload);
      logger.info(`✅ File updated: ${fileId}`, updatePayload);

      // Refresh from API to ensure consistency with server
      setTimeout(() => {
        loadFilesFromAPI(showDeleted).catch(error => {
          logger.warn('Failed to refresh files after edit:', error);
        });
      }, 100);
    } catch (error) {
      logger.error('Failed to update file:', error);

      // Rollback optimistic update on error
      if (previousFile) {
        setFiles(prev => prev.map(file =>
          file.id === fileId ? previousFile! : file
        ));
      }

      throw error; // Re-throw so UI can show error message
    }
  }, [loadFilesFromAPI]);

  const handleRefresh = useCallback(async (includeDeleted: boolean = false) => {
    logger.debug('Refreshing files...', { includeDeleted });
    await loadFilesFromAPI(includeDeleted);
  }, [loadFilesFromAPI]);

  const handleStarFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const newStarredState = !file.isStarred;
    
    // Optimistic update - update UI immediately
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, isStarred: newStarredState }
        : f
    ));
    
    try {
      await apiService.updateCloudFile(fileId, { isStarred: newStarredState });
      // Success - optimistic update was correct
    } catch (error) {
      logger.error('Failed to toggle star status:', error);
      // Revert optimistic update on error
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, isStarred: !newStarredState }
          : f
      ));
    }
  }, [files, setFiles]);

  const handleArchiveFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const newArchivedState = !file.isArchived;

    // Optimistic update - update UI immediately
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, isArchived: newArchivedState }
        : f
    ));

    try {
      await apiService.updateCloudFile(fileId, { isArchived: newArchivedState });
      logger.info(`✅ File archive status toggled: ${fileId}`);
    } catch (error) {
      logger.error('Failed to toggle archive status:', error);

      // Revert optimistic update on error
      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? { ...f, isArchived: !newArchivedState }
          : f
      ));

      throw error; // Re-throw so UI can show error message
    }
  }, [files]);

  // Single file delete handler (soft delete - moves to recycle bin)
  const handleDeleteFile = useCallback(async (fileId: string, showDeleted: boolean = false) => {
    // Validate input
    if (!fileId) {
      throw new Error('Invalid file ID');
    }

    try {
      await apiService.deleteCloudFile(fileId);
      logger.info(`✅ File moved to recycle bin: ${fileId}`);
      
      // Update local state optimistically
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: new Date().toISOString() } : file
      ));
      
      // Reload files from API to ensure consistency - respect showDeleted state
      try {
        await loadFilesFromAPI(showDeleted);
      } catch (err) {
          logger.error('Failed to reload files after delete:', err);
      }
    } catch (error: any) {
      logger.error('Failed to delete file:', error);
      // Revert optimistic update
      setFiles(prev => prev.map(file => 
        file.id === fileId && file.deletedAt ? { ...file, deletedAt: null } : file
      ));
      throw error; // Re-throw so UI can show error message
    }
  }, [loadFilesFromAPI]);

  // Restore deleted file from recycle bin
  const handleRestoreFile = useCallback(async (fileId: string) => {
    // Store previous state for rollback
    let previousDeletedAt: string | null | undefined;

    // Optimistic update - remove deletedAt immediately
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        previousDeletedAt = file.deletedAt;
        return { ...file, deletedAt: null };
      }
      return file;
    }));

    try {
      await apiService.restoreCloudFile(fileId);
      logger.info(`✅ File restored from recycle bin: ${fileId}`);

      // Reload files from API to ensure consistency
      try {
        await loadFilesFromAPI(false);
      } catch (err) {
        logger.error('Failed to reload files after restore:', err);
      }
    } catch (error) {
      logger.error('Failed to restore file:', error);

      // Rollback optimistic update on error
      if (previousDeletedAt !== undefined) {
        setFiles(prev => prev.map(file =>
          file.id === fileId ? { ...file, deletedAt: previousDeletedAt! } : file
        ));
      }

      throw error; // Re-throw so UI can show error message
    }
  }, [loadFilesFromAPI]);

  // Permanently delete file
  const handlePermanentlyDeleteFile = useCallback(async (fileId: string) => {
    // Store file for rollback
    let deletedFile: ResumeFile | undefined;

    // Optimistic update - remove from UI immediately
    setFiles(prev => {
      deletedFile = prev.find(file => file.id === fileId);
      return prev.filter(file => file.id !== fileId);
    });

    try {
      const response = await apiService.permanentlyDeleteCloudFile(fileId);
      logger.info(`✅ File permanently deleted: ${fileId}`);

      // Update storage quota if provided
      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }

      // Reload files from API to ensure consistency
      try {
        await loadFilesFromAPI(true);
      } catch (err) {
        logger.error('Failed to reload files after permanent delete:', err);
      }
    } catch (error) {
      logger.error('Failed to permanently delete file:', error);

      // Rollback optimistic update on error
      if (deletedFile) {
        setFiles(prev => [...prev, deletedFile!]);
      }

      throw error; // Re-throw so UI can show error message
    }
  }, [onStorageUpdate, loadFilesFromAPI]);

  return {
    files,
    setFiles,
    isLoading,
    setIsLoading,
    selectedFiles,
    setSelectedFiles,
    loadFilesFromAPI,
    handleFileSelect,
    handleSelectAll,
    handleDeleteFiles,
    handleDeleteFile,
    handleRestoreFile,
    handlePermanentlyDeleteFile,
    handleDownloadFile,
    handleShareFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    handleStarFile,
    handleArchiveFile
  };
};

// Move handler helper
export const useCopyMoveOperations = (
  setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>,
  refreshFiles?: (includeDeleted?: boolean) => Promise<void>,
  refreshFolders?: () => Promise<void> | void,
  afterMove?: (fileId: string, folderId: string | null) => void
) => {
  const handleMoveFile = useCallback(async (fileId: string, folderId: string | null) => {
    try {
      logger.info('📦 Moving file:', fileId, 'to folder:', folderId);
      const response = await apiService.moveCloudFile(fileId, folderId);
      
      if (response && response.success) {
        // Update local state (real-time events will also handle this)
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, folderId: folderId || null }
            : file
        ));
        
        logger.info('✅ File moved successfully:', fileId);

        if (refreshFiles) {
          try {
            await refreshFiles(false);
          } catch (refreshError) {
            logger.warn('Failed to refresh files after move:', refreshError);
          }
        }

        if (refreshFolders) {
          try {
            await refreshFolders();
          } catch (folderError) {
            logger.warn('Failed to refresh folders after move:', folderError);
          }
        }

        if (afterMove) {
          try {
            afterMove(fileId, folderId || null);
          } catch (callbackError) {
            logger.warn('Post-move callback threw an error:', callbackError);
          }
        }

        return response;
      } else {
        throw new Error(response?.error || 'Failed to move file');
      }
    } catch (error: any) {
      logger.error('Failed to move file:', error);
      throw error;
    }
  }, [setFiles, refreshFiles]);

  return {
    handleMoveFile
  };
};

