import { useState, useCallback } from 'react';
import { ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';

type UploadPayload = {
  file: File;
  displayName?: string;
  type?: ResumeFile['type'] | string;
  tags?: string[];
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

  const loadFilesFromAPI = useCallback(async (includeDeleted: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await apiService.getCloudFiles(undefined, includeDeleted);
      if (response && response.files) {
        setFiles(response.files as ResumeFile[]);
      } else {
        setFiles([]);
      }
    } catch (error) {
      logger.error('Failed to load files from API:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

      const blob = await apiService.downloadCloudFile(file.id);
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
    } catch (error) {
      logger.error('Failed to download file:', error);
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
      if (payload.tags && payload.tags.length > 0) {
        formData.append('tags', JSON.stringify(payload.tags));
      }
      if (payload.description) {
        formData.append('description', payload.description);
      }
      if (typeof payload.isPublic === 'boolean') {
        formData.append('isPublic', String(payload.isPublic));
      }

      const response = await apiService.uploadStorageFile(formData);
      if (response && response.file) {
        setFiles(prev => [response.file as ResumeFile, ...prev]);
      }

      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }

      onComplete?.();
    } catch (error) {
      logger.error('Failed to save file to API:', error);
      if ((error as any)?.storage && onStorageUpdate) {
        onStorageUpdate((error as any).storage);
      }
      throw error;
    }
  }, [onStorageUpdate]);

  const handleEditFile = useCallback(async (fileId: string, updates: Partial<ResumeFile>) => {
    try {
      await apiService.updateCloudFile(fileId, updates);
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      ));
    } catch (error) {
      logger.error('Failed to update file:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      ));
    }
  }, []);

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
  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      await apiService.deleteCloudFile(fileId);
      // Update local state to set deletedAt
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: new Date().toISOString() } : file
      ));
    } catch (error) {
      logger.error('Failed to delete file:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: new Date().toISOString() } : file
      ));
    }
  }, []);

  // Restore deleted file from recycle bin
  const handleRestoreFile = useCallback(async (fileId: string) => {
    try {
      await apiService.restoreCloudFile(fileId);
      // Update local state to remove deletedAt
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: undefined } : file
      ));
    } catch (error) {
      logger.error('Failed to restore file:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: undefined } : file
      ));
    }
  }, []);

  // Permanently delete file
  const handlePermanentlyDeleteFile = useCallback(async (fileId: string) => {
    try {
      const response = await apiService.permanentlyDeleteCloudFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }
    } catch (error) {
      logger.error('Failed to permanently delete file:', error);
      // Fallback to local state update
      setFiles(prev => prev.filter(file => file.id !== fileId));
    }
  }, [onStorageUpdate]);

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

