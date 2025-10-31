import { useState } from 'react';
import { FolderToRename } from '../types';

/**
 * Custom hook to manage folder modal state
 * Handles create and rename folder modals with their associated state
 */
export const useFolderModals = () => {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState<FolderToRename | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const openCreateFolderModal = () => {
    setNewFolderName('');
    setShowCreateFolderModal(true);
  };

  const closeCreateFolderModal = () => {
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };

  const openRenameFolderModal = (folder: FolderToRename) => {
    setFolderToRename(folder);
    setNewFolderName(folder.name);
    setShowRenameFolderModal(true);
  };

  const closeRenameFolderModal = () => {
    setShowRenameFolderModal(false);
    setFolderToRename(null);
    setNewFolderName('');
  };

  return {
    // State
    showCreateFolderModal,
    showRenameFolderModal,
    folderToRename,
    newFolderName,
    
    // Setters
    setNewFolderName,
    
    // Actions
    openCreateFolderModal,
    closeCreateFolderModal,
    openRenameFolderModal,
    closeRenameFolderModal,
  };
};

