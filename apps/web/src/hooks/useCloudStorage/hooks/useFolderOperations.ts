import { useState, useCallback, useEffect, useRef } from 'react';
import { Folder, ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import { createDefaultFolder, updateFolderFileCounts } from '../utils/folderOperations';
import apiService from '../../../services/apiService';
import { useDebouncedCallback } from '../../../utils/debounce';

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

  // FE-059: Debouncing for folder operations to prevent rapid create/delete
  const createFolderTimeoutRef = useRef<NodeJS.Timeout>();
  const renameFolderTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const deleteFolderTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleCreateFolder = useCallback(async (name: string, color?: string) => {
    // Clear any pending create operation
    if (createFolderTimeoutRef.current) {
      clearTimeout(createFolderTimeoutRef.current);
    }

    // FE-059: Debounce folder creation (300ms)
    createFolderTimeoutRef.current = setTimeout(async () => {
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
    }, 300);
  }, []);

  const handleRenameFolder = useCallback(async (folderId: string, newName: string) => {
    // Clear any pending rename for this folder
    const existingTimeout = renameFolderTimeoutRef.current.get(folderId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // FE-059: Debounce folder rename (500ms)
    const timeout = setTimeout(async () => {
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
      renameFolderTimeoutRef.current.delete(folderId);
    }, 500);
    
    renameFolderTimeoutRef.current.set(folderId, timeout);
  }, []);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    // Clear any pending delete for this folder
    const existingTimeout = deleteFolderTimeoutRef.current.get(folderId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // FE-059: Debounce folder delete (300ms) - prevents accidental double-deletes
    const timeout = setTimeout(async () => {
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
      deleteFolderTimeoutRef.current.delete(folderId);
    }, 300);
    
    deleteFolderTimeoutRef.current.set(folderId, timeout);
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

