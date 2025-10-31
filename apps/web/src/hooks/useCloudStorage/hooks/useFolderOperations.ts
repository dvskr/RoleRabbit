import { useState, useCallback } from 'react';
import { Folder, ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import { createDefaultFolder, updateFolderFileCounts } from '../utils/folderOperations';
import { DEMO_FOLDERS } from '../constants/demoData';

export const useFolderOperations = (
  files: ResumeFile[],
  setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>
) => {
  const [folders, setFolders] = useState<Folder[]>(DEMO_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleCreateFolder = useCallback((name: string, color?: string) => {
    const newFolder = createDefaultFolder(name, color);
    setFolders(prev => [...prev, newFolder]);
    logger.debug('Folder created:', newFolder);
  }, []);

  const handleRenameFolder = useCallback((folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, name: newName, updatedAt: new Date().toISOString() }
        : folder
    ));
    logger.debug('Folder renamed:', folderId, newName);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    // Move files from deleted folder back to root
    setFiles(prev => prev.map(file => 
      file.folderId === folderId ? { ...file, folderId: undefined } : file
    ));
    logger.debug('Folder deleted:', folderId);
  }, [setFiles]);

  const handleMoveToFolder = useCallback((fileId: string, folderId: string | null) => {
    const file = files.find(f => f.id === fileId);
    const oldFolderId = file?.folderId;
    
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, folderId: folderId ?? undefined } : file
    ));
    
    // Update folder file counts
    if (folderId && oldFolderId !== folderId) {
      setFolders(prev => updateFolderFileCounts(prev, fileId, oldFolderId, folderId));
    }
    
    logger.debug('File moved to folder:', fileId, folderId);
  }, [files, setFiles]);

  return {
    folders,
    setFolders,
    selectedFolderId,
    setSelectedFolderId,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveToFolder
  };
};

