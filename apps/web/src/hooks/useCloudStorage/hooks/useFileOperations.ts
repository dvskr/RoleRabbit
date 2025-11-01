import { useState, useCallback } from 'react';
import { ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';
import { createDefaultFile } from '../utils/fileOperations';
import { DEMO_FILES } from '../constants/demoData';

export const useFileOperations = () => {
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFilesFromAPI = useCallback(async (includeDeleted: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await apiService.getCloudFiles(undefined, includeDeleted);
      if (response && response.files) {
        setFiles(response.files as ResumeFile[]);
      }
    } catch (error) {
      logger.error('Failed to load files from API:', error);
      // Fallback to demo data
      setFiles(DEMO_FILES);
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
      // Delete from backend
      await Promise.all(selectedFiles.map(id => apiService.deleteCloudFile(id)));
      // Update local state
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    } catch (error) {
      logger.error('Failed to delete files:', error);
      // Fallback to local state update
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
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

  const handleDownloadFile = useCallback((file: ResumeFile) => {
    logger.debug('Downloading file:', file.name);
    // TODO: Implement actual download logic
  }, []);

  const handleShareFile = useCallback((file: ResumeFile) => {
    logger.debug('Sharing file:', file.name);
    // TODO: Implement actual share logic
  }, []);

  const handleUploadFile = useCallback(async (fileData: Partial<ResumeFile> | { data: any; name?: string }, onComplete?: () => void) => {
    try {
      // Save to API
      const response = await apiService.saveToCloud('data' in fileData ? fileData.data : fileData, fileData.name || 'Untitled');
      if (response && response.savedResume) {
        const newFile: ResumeFile = response.savedResume as ResumeFile;
        setFiles(prev => [newFile, ...prev]);
      }
    } catch (error) {
      logger.error('Failed to save file to API:', error);
      // Fallback to local
      const newFile = createDefaultFile(fileData);
      setFiles(prev => [newFile, ...prev]);
    } finally {
      onComplete?.();
    }
  }, []);

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

  // Single file delete handler
  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      await apiService.deleteCloudFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      logger.error('Failed to delete file:', error);
      // Fallback to local state update
      setFiles(prev => prev.filter(file => file.id !== fileId));
    }
  }, []);

  // Restore deleted file from recycle bin
  const handleRestoreFile = useCallback(async (fileId: string) => {
    try {
      const response = await apiService.restoreCloudFile(fileId);
      if (response && response.file) {
        setFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, deletedAt: undefined } : file
        ));
      } else {
        setFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, deletedAt: undefined } : file
        ));
      }
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
      await apiService.permanentlyDeleteCloudFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      logger.error('Failed to permanently delete file:', error);
      // Fallback to local state update
      setFiles(prev => prev.filter(file => file.id !== fileId));
    }
  }, []);

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

