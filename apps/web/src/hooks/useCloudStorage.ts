'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileType, SortBy, ViewMode, StorageInfo, CredentialInfo, CredentialReminder, CloudIntegration } from '../types/cloudStorage';
import { DEMO_CREDENTIALS, DEMO_CREDENTIAL_REMINDERS, DEMO_CLOUD_INTEGRATIONS } from './useCloudStorage/constants/demoData';
import { DEFAULT_STORAGE_USED, DEFAULT_STORAGE_LIMIT } from './useCloudStorage/constants/defaults';
import { filterAndSortFiles } from './useCloudStorage/utils/fileFiltering';
import { useFileOperations } from './useCloudStorage/hooks/useFileOperations';
import { useSharingOperations } from './useCloudStorage/hooks/useSharingOperations';
import { useCredentialOperations } from './useCloudStorage/hooks/useCredentialOperations';
import { useFolderOperations } from './useCloudStorage/hooks/useFolderOperations';
import { useCloudIntegration } from './useCloudStorage/hooks/useCloudIntegration';
import { useAccessTracking } from './useCloudStorage/hooks/useAccessTracking';

export const useCloudStorage = () => {
  // File operations hook
  const fileOps = useFileOperations();
  const { files, setFiles, isLoading, selectedFiles, setSelectedFiles } = fileOps;

  // Load files from API on mount
  useEffect(() => {
    fileOps.loadFilesFromAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FileType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Storage info
  const [storageUsed, setStorageUsed] = useState(DEFAULT_STORAGE_USED);
  const [storageLimit, setStorageLimit] = useState(DEFAULT_STORAGE_LIMIT);

  // Folder management
  const folderOps = useFolderOperations(files, setFiles);
  const { folders, selectedFolderId, setSelectedFolderId } = folderOps;

  // Credential management
  const [credentials] = useState<CredentialInfo[]>(DEMO_CREDENTIALS);
  const [credentialReminders] = useState<CredentialReminder[]>(DEMO_CREDENTIAL_REMINDERS);

  // Access tracking
  const accessTracking = useAccessTracking();

  // Cloud integrations
  const [cloudIntegrations] = useState<CloudIntegration[]>(DEMO_CLOUD_INTEGRATIONS);

  // Sharing operations
  const sharingOps = useSharingOperations(files, setFiles);

  // Credential operations
  const credentialOps = useCredentialOperations();

  // Cloud integration operations
  const cloudOps = useCloudIntegration();

  // Computed values
  const filteredFiles = useMemo(() => {
    return filterAndSortFiles(files, {
      searchTerm,
      filterType,
      sortBy,
      selectedFolderId
    });
  }, [files, searchTerm, filterType, sortBy, selectedFolderId]);

  const storageInfo: StorageInfo = useMemo(() => ({
    used: storageUsed,
    limit: storageLimit,
    percentage: (storageUsed / storageLimit) * 100
  }), [storageUsed, storageLimit]);

  // Wrapper for handleSelectAll to use filteredFiles
  const handleSelectAll = () => {
    fileOps.handleSelectAll(filteredFiles);
  };

  // Wrapper for handleUploadFile to close modal
  const handleUploadFile = async (fileData: Parameters<typeof fileOps.handleUploadFile>[0]) => {
    await fileOps.handleUploadFile(fileData, () => {
      setShowUploadModal(false);
    });
  };

  return {
    // State
    files,
    isLoading,
    selectedFiles,
    searchTerm,
    filterType,
    sortBy,
    viewMode,
    showUploadModal,
    storageInfo,
    credentials,
    credentialReminders,
    folders,
    selectedFolderId,
    accessLogs: accessTracking.accessLogs,
    cloudIntegrations,
    
    // Computed
    filteredFiles,
    
    // Setters
    setFiles,
    setSelectedFiles,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setViewMode,
    setShowUploadModal,
    setStorageUsed,
    setStorageLimit,
    setSelectedFolderId,
    
    // File Actions
    handleFileSelect: fileOps.handleFileSelect,
    handleSelectAll,
    handleDeleteFiles: fileOps.handleDeleteFiles,
    handleTogglePublic: fileOps.handleTogglePublic,
    handleDownloadFile: fileOps.handleDownloadFile,
    handleShareFile: fileOps.handleShareFile,
    handleUploadFile,
    handleEditFile: fileOps.handleEditFile,
    handleRefresh: fileOps.handleRefresh,
    handleStarFile: fileOps.handleStarFile,
    handleArchiveFile: fileOps.handleArchiveFile,
    
    // Sharing and Access Management
    handleShareWithUser: sharingOps.handleShareWithUser,
    handleRemoveShare: sharingOps.handleRemoveShare,
    handleUpdatePermission: sharingOps.handleUpdatePermission,
    handleCreateShareLink: sharingOps.handleCreateShareLink,
    handleAddComment: sharingOps.handleAddComment,
    
    // Credential Management
    handleAddCredential: credentialOps.handleAddCredential,
    handleUpdateCredential: credentialOps.handleUpdateCredential,
    handleDeleteCredential: credentialOps.handleDeleteCredential,
    handleGenerateQRCode: credentialOps.handleGenerateQRCode,
    
    // Access Tracking
    handleLogAccess: accessTracking.handleLogAccess,
    handleGetAccessLogs: accessTracking.handleGetAccessLogs,
    
    // Cloud Integration
    handleConnectCloud: cloudOps.handleConnectCloud,
    handleSyncCloud: cloudOps.handleSyncCloud,
    handleDisconnectCloud: cloudOps.handleDisconnectCloud,
    
    // Folder Management
    handleCreateFolder: folderOps.handleCreateFolder,
    handleRenameFolder: folderOps.handleRenameFolder,
    handleDeleteFolder: folderOps.handleDeleteFolder,
    handleMoveToFolder: folderOps.handleMoveToFolder
  };
};
