import { useState, useCallback, useEffect } from 'react';
import { Folder, ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import { createDefaultFolder, updateFolderFileCounts } from '../utils/folderOperations';
import apiService from '../../../services/apiService';

export const useFolderOperations = (
  files: ResumeFile[],
  setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>
) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    try {
      const response = await apiService.getFolders();
      if (response && response.folders) {
        setFolders(response.folders);
      } else {
        setFolders([]);
      }
    } catch (error) {
      logger.error('Failed to load folders from API:', error);
      setFolders([]);
    }
  }, []);

  // Load folders from API on mount
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleCreateFolder = useCallback(async (name: string, color?: string) => {
    try {
      const response = await apiService.createFolder({ name, color });
      if (response && response.folder) {
        setFolders(prev => [...prev, response.folder]);
      }
    } catch (error) {
      logger.error('Failed to create folder:', error);
      // Fallback to local
      const newFolder = createDefaultFolder(name, color);
      setFolders(prev => [...prev, newFolder]);
    }
  }, []);

  const handleRenameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      await apiService.updateFolder(folderId, { name: newName });
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName, updatedAt: new Date().toISOString() }
          : folder
      ));
    } catch (error) {
      logger.error('Failed to rename folder:', error);
      // Fallback to local
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName, updatedAt: new Date().toISOString() }
          : folder
      ));
    }
  }, []);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    try {
      await apiService.deleteFolder(folderId);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      // Move files from deleted folder back to root
      setFiles(prev => prev.map(file => 
        file.folderId === folderId ? { ...file, folderId: undefined } : file
      ));
    } catch (error) {
      logger.error('Failed to delete folder:', error);
      // Fallback to local
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      setFiles(prev => prev.map(file => 
        file.folderId === folderId ? { ...file, folderId: undefined } : file
      ));
    }
  }, [setFiles]);

  const handleMoveToFolder = useCallback(async (fileId: string, folderId: string | null) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;
      
      await apiService.updateCloudFile(fileId, { folderId });
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, folderId: folderId ?? undefined } : file
      ));
      
      // Update folder file counts
      if (folderId && file.folderId !== folderId) {
        setFolders(prev => updateFolderFileCounts(prev, fileId, file.folderId, folderId));
      }
    } catch (error) {
      logger.error('Failed to move file to folder:', error);
      // Fallback to local
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, folderId: folderId ?? undefined } : file
      ));
    }
  }, [files, setFiles]);

  return {
    folders,
    setFolders,
    selectedFolderId,
    setSelectedFolderId,
    loadFolders,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveToFolder
  };
};

