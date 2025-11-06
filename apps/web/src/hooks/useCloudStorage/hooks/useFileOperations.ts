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
  isPublic?: boolean;
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

  const handleTogglePublic = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    try {
      await apiService.updateCloudFile(fileId, { isPublic: !file.isPublic });
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, isPublic: !file.isPublic } : file
      ));
    } catch (error) {
      logger.error('Failed to toggle public status:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, isPublic: !file.isPublic } : file
      ));
    }
  }, [files]);

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

  const handleShareFile = useCallback((file: ResumeFile) => {
    logger.debug('Sharing file:', file.name);
    // TODO: Implement actual share logic
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
      if (typeof payload.isPublic === 'boolean') {
        formData.append('isPublic', String(payload.isPublic));
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
      setTimeout(() => {
        loadFilesFromAPI(false).catch(err => {
          logger.error('Failed to reload files after upload:', err);
        });
      }, 500);
    } catch (error) {
      logger.error('Failed to save file to API:', error);
      if ((error as any)?.storage && onStorageUpdate) {
        onStorageUpdate((error as any).storage);
      }
      throw error;
    }
  }, [onStorageUpdate, loadFilesFromAPI]);

  const handleEditFile = useCallback(async (fileId: string, updates: Partial<Pick<ResumeFile, 'name' | 'type' | 'description' | 'isPublic' | 'isStarred' | 'isArchived' | 'folderId'>>, showDeleted: boolean = false) => {
    try {
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

      if (updates.isPublic !== undefined) {
        updatePayload.isPublic = updates.isPublic;
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

      await apiService.updateCloudFile(fileId, updatePayload);

      // Update local state with new references to trigger re-render
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            ...updatePayload,
          } as ResumeFile;
        }
        return file;
      }));
      
      logger.info(`✅ File updated locally: ${fileId}`, updatePayload);

      // Refresh from API to ensure consistency with server - respect showDeleted state
      setTimeout(() => {
        loadFilesFromAPI(showDeleted).catch(error => {
          logger.warn('Failed to refresh files after edit:', error);
        });
      }, 100); // Reduced delay for faster feedback
    } catch (error) {
      logger.error('Failed to update file:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            ...updates,
          } as ResumeFile;
        }
        return file;
      }));
    }
  }, [loadFilesFromAPI]);

  const handleRefresh = useCallback(async () => {
    logger.debug('Refreshing files...');
    await loadFilesFromAPI();
  }, [loadFilesFromAPI]);

  const handleStarFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    try {
      await apiService.updateCloudFile(fileId, { isStarred: !file.isStarred });
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, isStarred: !file.isStarred }
          : file
      ));
    } catch (error) {
      logger.error('Failed to toggle star status:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, isStarred: !file.isStarred }
          : file
      ));
    }
  }, [files]);

  const handleArchiveFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    try {
      await apiService.updateCloudFile(fileId, { isArchived: !file.isArchived });
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, isArchived: !file.isArchived }
          : file
      ));
    } catch (error) {
      logger.error('Failed to toggle archive status:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, isArchived: !file.isArchived }
          : file
      ));
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
      setTimeout(() => {
        loadFilesFromAPI(showDeleted).catch(err => {
          logger.error('Failed to reload files after delete:', err);
        });
      }, 500);
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
    try {
      await apiService.restoreCloudFile(fileId);
      logger.info(`✅ File restored from recycle bin: ${fileId}`);
      
      // Update local state to remove deletedAt
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: null } : file
      ));
      
      // Reload files from API to ensure consistency
      setTimeout(() => {
        loadFilesFromAPI(false).catch(err => {
          logger.error('Failed to reload files after restore:', err);
        });
      }, 500);
    } catch (error) {
      logger.error('Failed to restore file:', error);
      throw error; // Re-throw so UI can show error message
    }
  }, [loadFilesFromAPI]);

  // Permanently delete file
  const handlePermanentlyDeleteFile = useCallback(async (fileId: string) => {
    try {
      const response = await apiService.permanentlyDeleteCloudFile(fileId);
      logger.info(`✅ File permanently deleted: ${fileId}`);
      
      // Remove from local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      // Update storage quota if provided
      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }
      
      // Reload files from API to ensure consistency (use showDeleted from closure or default to true since we're in recycle bin)
      setTimeout(() => {
        loadFilesFromAPI(true).catch(err => {
          logger.error('Failed to reload files after permanent delete:', err);
        });
      }, 500);
    } catch (error) {
      logger.error('Failed to permanently delete file:', error);
      // Fallback to local state update
      setFiles(prev => prev.filter(file => file.id !== fileId));
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
    handleTogglePublic,
    handleDownloadFile,
    handleShareFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    handleStarFile,
    handleArchiveFile
  };
};

// Copy and Move handlers
export const useCopyMoveOperations = (setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>) => {
  const handleCopyFile = useCallback(async (fileId: string, newName?: string, folderId?: string | null) => {
    try {
      logger.info('📋 Copying file:', fileId);
      const response = await apiService.copyCloudFile(fileId, newName, folderId);
      
      if (response && response.success && response.file) {
        const copiedFile: ResumeFile = {
          ...response.file,
          sharedWith: [],
          comments: [],
          downloadCount: 0,
          viewCount: 0,
          isStarred: false,
          isArchived: false,
          version: 1,
          owner: response.file.userId || '',
          lastModified: response.file.createdAt || new Date().toISOString(),
          size: typeof response.file.size === 'number' 
            ? formatBytes(response.file.size) 
            : (response.file.size || '0 B'),
          sizeBytes: typeof response.file.size === 'number' ? response.file.size : 0,
        };
        
        // Add to local state (real-time events will also handle this)
        setFiles(prev => {
          const exists = prev.find(f => f.id === copiedFile.id);
          if (exists) {
            return prev.map(f => f.id === copiedFile.id ? copiedFile : f);
          }
          return [copiedFile, ...prev];
        });
        
        logger.info('✅ File copied successfully:', copiedFile.id);
        return copiedFile;
      } else {
        throw new Error(response?.error || 'Failed to copy file');
      }
    } catch (error: any) {
      logger.error('Failed to copy file:', error);
      throw error;
    }
  }, [setFiles]);

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
        return response;
      } else {
        throw new Error(response?.error || 'Failed to move file');
      }
    } catch (error: any) {
      logger.error('Failed to move file:', error);
      throw error;
    }
  }, [setFiles]);

  return {
    handleCopyFile,
    handleMoveFile
  };
};

