'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { FileType, SortBy, StorageInfo, CredentialInfo, CredentialReminder, CloudIntegration } from '../types/cloudStorage';
import { filterAndSortFiles } from './useCloudStorage/utils/fileFiltering';
import { useFileOperations, useCopyMoveOperations } from './useCloudStorage/hooks/useFileOperations';
import { useSharingOperations } from './useCloudStorage/hooks/useSharingOperations';
import { useCredentialOperations } from './useCloudStorage/hooks/useCredentialOperations';
import { useFolderOperations } from './useCloudStorage/hooks/useFolderOperations';
import { useCloudIntegration } from './useCloudStorage/hooks/useCloudIntegration';
import { useAccessTracking } from './useCloudStorage/hooks/useAccessTracking';
import { useDebounce } from './useDebounce';
import { logger } from '../utils/logger';
import apiService from '../services/apiService';
import { webSocketService } from '../services/webSocketService';
import { useAuth } from '../contexts/AuthContext';

export const BYTES_IN_GB = 1024 ** 3;

export const EMPTY_STORAGE_INFO: StorageInfo = {
  used: 0,
  limit: 0,
  percentage: 0,
  usedBytes: 0,
  limitBytes: 0,
};

export const normalizeStorageInfo = (storage?: any): StorageInfo => {
  if (!storage) {
    return EMPTY_STORAGE_INFO;
  }

  const usedBytes = typeof storage.usedBytes === 'number'
    ? storage.usedBytes
    : Math.max(0, Math.round((storage.usedGB || 0) * BYTES_IN_GB));

  const limitBytes = typeof storage.limitBytes === 'number'
    ? storage.limitBytes
    : Math.max(0, Math.round((storage.limitGB || 0) * BYTES_IN_GB));

  const usedGB = typeof storage.usedGB === 'number'
    ? storage.usedGB
    : usedBytes / BYTES_IN_GB;

  const limitGB = typeof storage.limitGB === 'number'
    ? storage.limitGB
    : limitBytes / BYTES_IN_GB;

  const percentage = typeof storage.percentage === 'number'
    ? storage.percentage
    : limitGB > 0
      ? (usedGB / limitGB) * 100
      : 0;

  return {
    used: Number.isFinite(usedGB) ? Number.parseFloat(usedGB.toFixed(2)) : 0,
    limit: Number.isFinite(limitGB) ? Number.parseFloat(limitGB.toFixed(2)) : 0,
    percentage: Number.isFinite(percentage) ? Number.parseFloat(percentage.toFixed(2)) : 0,
    usedBytes,
    limitBytes,
  };
};

export const useCloudStorage = () => {
  // Get current user for WebSocket authentication
  const { user } = useAuth();

  // File operations hook
  const [storageInfoState, setStorageInfoState] = useState<StorageInfo>(EMPTY_STORAGE_INFO);

  const handleStorageUpdate = useCallback((storage: any) => {
    setStorageInfoState(normalizeStorageInfo(storage));
  }, []);

  const fileOps = useFileOperations({ onStorageUpdate: handleStorageUpdate });
  const { files, setFiles, isLoading, selectedFiles, setSelectedFiles } = fileOps;

  // Folder management (needs to be defined before copy/move operations)
  const folderOps = useFolderOperations(files, setFiles);
  const { folders, selectedFolderId, setSelectedFolderId, loadFolders } = folderOps;

  // Copy and Move operations
  const copyMoveOps = useCopyMoveOperations(
    setFiles,
    fileOps.loadFilesFromAPI,
    loadFolders
  );
  const { handleMoveFile } = copyMoveOps;

  // UI state
  const [showDeleted, setShowDeleted] = useState(false); // Recycle bin toggle

  // Load files from API on mount
  useEffect(() => {
    fileOps.loadFilesFromAPI(showDeleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted]);

  // Real-time WebSocket listeners for file updates
  useEffect(() => {
    if (!user?.id) return;

    // Authenticate WebSocket connection
    if (webSocketService.isConnected()) {
      webSocketService.emit('authenticate', { userId: user.id });
    }

    // Set up real-time event listeners
    const unsubscribeFileCreated = webSocketService.on('file_created', (data) => {
      if (!showDeleted && data.file) {
        // Add new file to the list
        setFiles((prevFiles) => {
          // Check if file already exists to avoid duplicates
          if (prevFiles.some(f => f.id === data.file.id)) {
            return prevFiles;
          }
          return [...prevFiles, { ...data.file, sharedWith: [], comments: [] }];
        });
        logger.info('Real-time: File created', data.file.id);
      }
    });

    const unsubscribeFileUpdated = webSocketService.on('file_updated', (data) => {
      if (data.fileId && data.file) {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === data.fileId
              ? { ...file, ...data.file, updatedAt: new Date().toISOString() }
              : file
          )
        );
        logger.info('Real-time: File updated', data.fileId);
      }
    });

    const unsubscribeFileDeleted = webSocketService.on('file_deleted', (data) => {
      if (data.fileId) {
        if (showDeleted) {
          // If viewing recycle bin, update deletedAt timestamp
          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.id === data.fileId
                ? { ...file, deletedAt: new Date().toISOString() }
                : file
            )
          );
        } else {
          // Remove from active files list
          setFiles((prevFiles) => prevFiles.filter((file) => file.id !== data.fileId));
        }
        logger.info('Real-time: File deleted', data.fileId);
      }
    });

    const unsubscribeFileRestored = webSocketService.on('file_restored', (data) => {
      if (data.file && !showDeleted) {
        // Add restored file back to active list
        setFiles((prevFiles) => {
          const exists = prevFiles.some(f => f.id === data.file.id);
          if (exists) {
            // Update existing file
            return prevFiles.map((file) =>
              file.id === data.file.id
                ? { ...file, ...data.file, deletedAt: null }
                : file
            );
          }
          return [...prevFiles, { ...data.file, deletedAt: null, sharedWith: [], comments: [] }];
        });
        logger.info('Real-time: File restored', data.file.id);
      }
    });

    const unsubscribeFileShared = webSocketService.on('file_shared', (data) => {
      if (data.fileId && data.share) {
        setFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (file.id === data.fileId) {
              const updatedShares = file.sharedWith || [];
              const shareExists = updatedShares.some((s: any) => s.id === data.share.id);
              return {
                ...file,
                sharedWith: shareExists
                  ? updatedShares.map((s: any) => s.id === data.share.id ? {
                      ...s,
                      permission: data.share.permission,
                      userId: data.share.sharedWith,
                      userEmail: data.share.sharedWithEmail || s.userEmail,
                      userName: data.share.sharedWithName || s.userName
                    } : s)
                  : [...updatedShares, {
                      id: data.share.id,
                      userId: data.share.sharedWith,
                      userEmail: data.share.sharedWithEmail || '',
                      userName: data.share.sharedWithName || 'Unknown User',
                      permission: data.share.permission,
                      grantedBy: data.share.userId,
                      grantedAt: data.share.createdAt,
                      expiresAt: data.share.expiresAt
                    }]
              };
            }
            return file;
          })
        );
        logger.info('Real-time: File shared/permission updated', data.fileId);
      }
    });

    const unsubscribeShareRemoved = webSocketService.on('share_removed', (data) => {
      if (data.fileId && data.shareId) {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === data.fileId
              ? {
                  ...file,
                  sharedWith: (file.sharedWith || []).filter((s: any) => s.id !== data.shareId)
                }
              : file
          )
        );
        logger.info('Real-time: Share removed', data.fileId, data.shareId);
      }
    });

    const unsubscribeCommentAdded = webSocketService.on('comment_added', (data) => {
      if (data.fileId && data.comment) {
        setFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (file.id === data.fileId) {
              const updatedComments = file.comments || [];
              const commentExists = updatedComments.some((c: any) => c.id === data.comment.id);
              
              // If comment exists, update it; otherwise add it to the beginning
              const newComments = commentExists
                ? updatedComments.map((c: any) => c.id === data.comment.id ? data.comment : c)
                : [data.comment, ...updatedComments]; // Add new comment at the beginning
              
              logger.info('Real-time: Comment added', data.fileId, data.comment.id, 'Total comments:', newComments.length);
              
              return {
                ...file,
                comments: newComments
              };
            }
            return file;
          })
        );
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeFileCreated();
      unsubscribeFileUpdated();
      unsubscribeFileDeleted();
      unsubscribeFileRestored();
      unsubscribeFileShared();
      unsubscribeShareRemoved();
      unsubscribeCommentAdded();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, showDeleted]); // setFiles is stable and not needed in deps (all updates use functional form)

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search for better performance
  const [filterType, setFilterType] = useState<FileType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [quickFilters, setQuickFilters] = useState<{
    starred?: boolean;
    archived?: boolean;
    shared?: boolean;
    recent?: boolean;
    public?: boolean;
  }>({});

  // Storage info state

  const refreshStorageInfo = useCallback(async () => {
    try {
      const response = await apiService.getStorageQuota();
      if (response && response.storage) {
        setStorageInfoState(normalizeStorageInfo(response.storage));
      } else {
        // Set empty storage info if response is invalid
        setStorageInfoState(EMPTY_STORAGE_INFO);
      }
    } catch (error) {
      logger.error('Failed to fetch storage quota:', error);
      // Set empty storage info on error
      setStorageInfoState(EMPTY_STORAGE_INFO);
    }
  }, []);

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
        
        if (remindersRes && remindersRes.reminders) {
          // Transform expiring credentials to reminders
          const reminders: CredentialReminder[] = remindersRes.reminders.map((cred: any) => ({
            id: cred.id,
            credentialId: cred.credentialId,
            credentialName: cred.name,
            expirationDate: cred.expirationDate,
            reminderDate: new Date().toISOString(),
            isSent: false,
            priority: cred.priority || (cred.expirationDate ? 
              (new Date(cred.expirationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'high' : 'medium') 
              : 'low') as 'high' | 'medium' | 'low'
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
    logger.debug('Filtering cloud storage files', {
      totalFiles: files.length,
      searchTerm: debouncedSearchTerm,
      filterType,
      sortBy,
      selectedFolderId,
      showDeleted,
      quickFilters
    });

    const result = filterAndSortFiles(files, {
      searchTerm: debouncedSearchTerm,
      filterType,
      sortBy,
      selectedFolderId,
      showDeleted,
      quickFilters
    });

    logger.debug('Filtered cloud storage files result', {
      filteredCount: result.length,
      totalFiles: files.length
    });

    return result;
  }, [files, debouncedSearchTerm, filterType, sortBy, selectedFolderId, showDeleted, quickFilters]);

  useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  const storageInfo: StorageInfo = useMemo(() => storageInfoState, [storageInfoState]);

  // Wrapper for handleSelectAll to use filteredFiles
  const handleSelectAll = useCallback(() => {
    fileOps.handleSelectAll(filteredFiles);
  }, [fileOps, filteredFiles]);

  // Wrapper for handleUploadFile to close modal
  const handleUploadFile = useCallback(async (fileData: Parameters<typeof fileOps.handleUploadFile>[0]) => {
    await fileOps.handleUploadFile(fileData, () => {
      setShowUploadModal(false);
    });
  }, [fileOps, setShowUploadModal]);

  // Wrapper for handleDeleteFile with showDeleted
  const handleDeleteFile = useCallback((fileId: string) => {
    return fileOps.handleDeleteFile(fileId, showDeleted);
  }, [fileOps, showDeleted]);

  // Wrapper for handleEditFile with showDeleted
  const handleEditFile = useCallback((fileId: string, updates: any) => {
    return fileOps.handleEditFile(fileId, updates, showDeleted);
  }, [fileOps, showDeleted]);

  // Comprehensive refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      // Refresh files (respect current showDeleted state)
      await fileOps.handleRefresh(showDeleted);
      // Refresh folders
      await loadFolders();
      // Refresh storage info
      await refreshStorageInfo();
      // Refresh credentials
      try {
        const [credentialsRes, remindersRes] = await Promise.all([
          apiService.getCredentials(),
          apiService.getExpiringCredentials(90)
        ]);

        if (credentialsRes && credentialsRes.credentials) {
          setCredentials(credentialsRes.credentials);
        }

        if (remindersRes && remindersRes.reminders) {
          const reminders: CredentialReminder[] = remindersRes.reminders.map((cred: any) => ({
            id: cred.id,
            credentialId: cred.credentialId,
            credentialName: cred.name,
            expirationDate: cred.expirationDate,
            reminderDate: new Date().toISOString(),
            isSent: false,
            priority: cred.priority || 'medium' as 'high' | 'medium' | 'low'
          }));
          setCredentialReminders(reminders);
        }
      } catch (credError) {
        logger.warn('Failed to refresh credentials:', credError);
      }
    } catch (error) {
      logger.error('Failed to refresh storage data:', error);
    }
  }, [fileOps, showDeleted, loadFolders, refreshStorageInfo, setCredentials, setCredentialReminders]);

  return {
    // State
    files,
    isLoading,
    selectedFiles,
    searchTerm,
    filterType,
    sortBy,
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
    setShowUploadModal,
    setShowDeleted,
    setSelectedFolderId,
    setQuickFilters,
    
    // File Actions
    handleFileSelect: fileOps.handleFileSelect,
    handleSelectAll,
    handleDeleteFiles: fileOps.handleDeleteFiles,
    handleDeleteFile,
    handleRestoreFile: fileOps.handleRestoreFile,
    handlePermanentlyDeleteFile: fileOps.handlePermanentlyDeleteFile,
    handleDownloadFile: fileOps.handleDownloadFile,
    handleShareFile: fileOps.handleShareFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    handleStarFile: fileOps.handleStarFile,
    handleArchiveFile: fileOps.handleArchiveFile,
    handleMoveFile,
    
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
