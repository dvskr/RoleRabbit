'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileType, SortBy, ViewMode, StorageInfo, CredentialInfo, CredentialReminder, CloudIntegration } from '../types/cloudStorage';
import { DEFAULT_STORAGE_USED, DEFAULT_STORAGE_LIMIT } from './useCloudStorage/constants/defaults';
import { filterAndSortFiles } from './useCloudStorage/utils/fileFiltering';
import { useFileOperations } from './useCloudStorage/hooks/useFileOperations';
import { useSharingOperations } from './useCloudStorage/hooks/useSharingOperations';
import { useCredentialOperations } from './useCloudStorage/hooks/useCredentialOperations';
import { useFolderOperations } from './useCloudStorage/hooks/useFolderOperations';
import { useCloudIntegration } from './useCloudStorage/hooks/useCloudIntegration';
import { useAccessTracking } from './useCloudStorage/hooks/useAccessTracking';
import { logger } from '../utils/logger';
import apiService from '../services/apiService';

export const useCloudStorage = () => {
  // File operations hook
  const fileOps = useFileOperations();
  const { files, setFiles, isLoading, selectedFiles, setSelectedFiles } = fileOps;

  // UI state
  const [showDeleted, setShowDeleted] = useState(false); // Recycle bin toggle

  // Load files from API on mount
  useEffect(() => {
    fileOps.loadFilesFromAPI(showDeleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FileType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [quickFilters, setQuickFilters] = useState<{
    starred?: boolean;
    archived?: boolean;
    shared?: boolean;
    recent?: boolean;
    public?: boolean;
  }>({});

  // Storage info
  const [storageUsed, setStorageUsed] = useState(DEFAULT_STORAGE_USED);
  const [storageLimit, setStorageLimit] = useState(DEFAULT_STORAGE_LIMIT);

  // Folder management
  const folderOps = useFolderOperations(files, setFiles);
  const { folders, selectedFolderId, setSelectedFolderId } = folderOps;

  // Credential management
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [credentialReminders, setCredentialReminders] = useState<CredentialReminder[]>([]);

  // Load credentials from API on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const [credentialsRes, remindersRes] = await Promise.all([
          apiService.getCredentials(),
          apiService.getExpiringCredentials(90)
        ]);
        
        if (credentialsRes && credentialsRes.credentials) {
          setCredentials(credentialsRes.credentials);
        } else {
          setCredentials([]);
        }
        
        if (remindersRes && remindersRes.credentials) {
          // Transform expiring credentials to reminders
          const reminders: CredentialReminder[] = remindersRes.credentials.map((cred: any) => ({
            id: cred.id,
            credentialId: cred.id,
            credentialName: cred.name,
            expirationDate: cred.expirationDate,
            reminderDate: new Date().toISOString(),
            isSent: false,
            priority: cred.expirationDate ? 
              (new Date(cred.expirationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'high' : 'medium') 
              : 'low' as 'high' | 'medium' | 'low'
          }));
          setCredentialReminders(reminders);
        } else {
          setCredentialReminders([]);
        }
      } catch (error) {
        logger.error('Failed to load credentials from API:', error);
        setCredentials([]);
        setCredentialReminders([]);
      }
    };
    loadCredentials();
  }, []);

  // Access tracking
  const accessTracking = useAccessTracking();

  // Cloud integrations
  const [cloudIntegrations] = useState<CloudIntegration[]>([]);

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
      selectedFolderId,
      showDeleted,
      quickFilters
    });
  }, [files, searchTerm, filterType, sortBy, selectedFolderId, showDeleted, quickFilters]);

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
    showDeleted,
    storageInfo,
    credentials,
    credentialReminders,
    folders,
    selectedFolderId,
    accessLogs: accessTracking.accessLogs,
    cloudIntegrations,
    quickFilters,
    
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
    setShowDeleted,
    setStorageUsed,
    setStorageLimit,
    setSelectedFolderId,
    setQuickFilters,
    
    // File Actions
    handleFileSelect: fileOps.handleFileSelect,
    handleSelectAll,
    handleDeleteFiles: fileOps.handleDeleteFiles,
    handleDeleteFile: fileOps.handleDeleteFile,
    handleRestoreFile: fileOps.handleRestoreFile,
    handlePermanentlyDeleteFile: fileOps.handlePermanentlyDeleteFile,
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
    setCredentials,
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
