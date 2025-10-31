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

  const loadFilesFromAPI = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.listCloudResumes();
      if (response && response.savedResumes) {
        setFiles(response.savedResumes as ResumeFile[]);
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

  const handleDeleteFiles = useCallback(() => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  }, [selectedFiles]);

  const handleTogglePublic = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, isPublic: !file.isPublic } : file
    ));
  }, []);

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

  const handleEditFile = useCallback((fileId: string, updates: Partial<ResumeFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  }, []);

  const handleRefresh = useCallback(() => {
    logger.debug('Refreshing files...');
    // TODO: Implement actual refresh logic
  }, []);

  const handleStarFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isStarred: !file.isStarred }
        : file
    ));
  }, []);

  const handleArchiveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isArchived: !file.isArchived }
        : file
    ));
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

