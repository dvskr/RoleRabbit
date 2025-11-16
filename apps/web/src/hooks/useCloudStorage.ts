'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FileType, SortBy, StorageInfo, CredentialInfo, CredentialReminder, CloudIntegration } from '../types/cloudStorage';
import { filterAndSortFiles } from './useCloudStorage/utils/fileFiltering';
import { useFileOperations, useCopyMoveOperations } from './useCloudStorage/hooks/useFileOperations';
import { useSharingOperations } from './useCloudStorage/hooks/useSharingOperations';
import { useCredentialOperations } from './useCloudStorage/hooks/useCredentialOperations';
import { useFolderOperations } from './useCloudStorage/hooks/useFolderOperations';
import { useCloudIntegration } from './useCloudStorage/hooks/useCloudIntegration';
import { useAccessTracking } from './useCloudStorage/hooks/useAccessTracking';
import { logger } from '../utils/logger';
import apiService from '../services/apiService';
import { webSocketService } from '../services/webSocketService';
import { useAuth } from '../contexts/AuthContext';
import { useDebouncedCallback } from '../utils/debounce';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { clearCache } from '../utils/cache';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FileType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // FE-042: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // FE-032: Offline queue
  const offlineQueue = useOfflineQueue();
  
  // FE-041: Debounce search input (300ms)
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearchTerm(value);
  }, 300);

  // Update debounced search when searchTerm changes
  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // FE-039: Track file versions/timestamps for race condition handling
  const fileVersionsRef = useRef<Map<string, { version: number; timestamp: number }>>(new Map());
  
  // FE-046: State synchronization check (every 5 minutes)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      logger.debug('Performing state synchronization check');
      fileOps.loadFilesFromAPI(
        showDeleted,
        currentPage,
        pageSize,
        sortBy,
        sortOrder,
        debouncedSearchTerm,
        filterType,
        selectedFolderId
      ).catch(err => {
        logger.error('State sync check failed:', err);
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(syncInterval);
  }, [showDeleted, currentPage, pageSize, sortBy, sortOrder, debouncedSearchTerm, filterType, selectedFolderId, fileOps]);

  // FE-042: Load files from API with pagination
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [showDeleted, filterType, selectedFolderId, debouncedSearchTerm]);
  
  useEffect(() => {
    // FE-042: Pass search term and filters to server (debounced)
    fileOps.loadFilesFromAPI(
      showDeleted, 
      currentPage, 
      pageSize, 
      sortBy, 
      sortOrder,
      debouncedSearchTerm,
      filterType,
      selectedFolderId
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted, currentPage, pageSize, sortBy, sortOrder, debouncedSearchTerm, filterType, selectedFolderId]);

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
        // FE-042: With pagination, check if file should be on current page
        // If file matches current filters, add it; otherwise refresh current page
        setFiles((prevFiles) => {
          // Check if file already exists to avoid duplicates
          if (prevFiles.some(f => f.id === data.file.id)) {
            logger.debug('WebSocket: File already exists, skipping duplicate', data.file.id);
            return prevFiles;
          }
          
          // FE-039: Store version/timestamp for race condition handling
          const timestamp = data.file.updatedAt ? new Date(data.file.updatedAt).getTime() : Date.now();
          fileVersionsRef.current.set(data.file.id, {
            version: data.file.version || 1,
            timestamp,
          });
          
          // FE-042: If we're on page 1 and have space, add the file
          // Otherwise, refresh the current page to get updated data
          if (currentPage === 1 && prevFiles.length < pageSize) {
            return [...prevFiles, { ...data.file, sharedWith: [], comments: [] }];
          } else {
            // Refresh current page to get updated list
            fileOps.loadFilesFromAPI(
              showDeleted,
              currentPage,
              pageSize,
              sortBy,
              sortOrder,
              debouncedSearchTerm,
              filterType,
              selectedFolderId
            ).catch(err => logger.error('Failed to refresh after file created:', err));
            return prevFiles;
          }
        });
        logger.info('Real-time: File created', data.file.id);
      }
    });

    const unsubscribeFileUpdated = webSocketService.on('file_updated', (data) => {
      if (data.fileId && data.file) {
        // FE-039: Use version/timestamp to determine latest update
        const existingVersion = fileVersionsRef.current.get(data.fileId);
        const newTimestamp = data.file.updatedAt ? new Date(data.file.updatedAt).getTime() : Date.now();
        const newVersion = data.file.version || 1;
        
        // Only update if this is a newer version
        if (existingVersion && 
            (existingVersion.version > newVersion || 
             (existingVersion.version === newVersion && existingVersion.timestamp >= newTimestamp))) {
          logger.debug('WebSocket: Ignoring stale update', data.fileId);
          return;
        }
        
        setFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (file.id === data.fileId) {
              // FE-039: Update version tracking
              fileVersionsRef.current.set(data.fileId, {
                version: newVersion,
                timestamp: newTimestamp,
              });
              return { ...file, ...data.file, updatedAt: new Date().toISOString() };
            }
            return file;
          })
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
          // FE-042: Remove from active files list, then refresh if needed to maintain page size
          setFiles((prevFiles) => {
            const filtered = prevFiles.filter((file) => file.id !== data.fileId);
            // If we removed a file and now have fewer than pageSize, refresh to get next file
            if (filtered.length < pageSize && currentPage === 1) {
              fileOps.loadFilesFromAPI(
                showDeleted,
                currentPage,
                pageSize,
                sortBy,
                sortOrder,
                debouncedSearchTerm,
                filterType,
                selectedFolderId
              ).catch(err => logger.error('Failed to refresh after file deleted:', err));
            }
            return filtered;
          });
        }
        logger.info('Real-time: File deleted', data.fileId);
      }
    });

    const unsubscribeFileRestored = webSocketService.on('file_restored', (data) => {
      if (data.file && !showDeleted) {
        // FE-042: With pagination, refresh current page to get updated list
        // The restored file may not belong on current page based on filters/sorting
        fileOps.loadFilesFromAPI(
          showDeleted,
          currentPage,
          pageSize,
          sortBy,
          sortOrder,
          debouncedSearchTerm,
          filterType,
          selectedFolderId
        ).catch(err => logger.error('Failed to refresh after file restored:', err));
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
  }, [user?.id, showDeleted, setFiles, currentPage, pageSize, sortBy, sortOrder, debouncedSearchTerm, filterType, selectedFolderId, fileOps]);

  // Quick filters state (searchTerm, filterType, sortBy, showUploadModal already declared above)
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
  // FE-042: With pagination, server handles search, type filter, folder filter, and sorting
  // Client only needs to handle quick filters (starred, archived, shared, recent)
  const filteredFiles = useMemo(() => {
    logger.debug('Filtering cloud storage files', {
      totalFiles: files.length,
      quickFilters
    });
    
    // FE-042: Server handles search, type filter, folder filter, and sorting
    // Client only needs to handle quick filters (starred, archived, shared, recent)
    const result = filterAndSortFiles(files, {
      searchTerm: '', // Server handles search
      filterType: 'all', // Server handles type filter
      sortBy: 'date', // Server handles sorting
      selectedFolderId: null, // Server handles folder filter
      showDeleted,
      quickFilters // Only client-side quick filters remain
    });
    
    logger.debug('Filtered cloud storage files result', {
      filteredCount: result.length,
      totalFiles: files.length
    });
    
    return result;
  }, [files, showDeleted, quickFilters]);

  useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  const storageInfo: StorageInfo = useMemo(() => storageInfoState, [storageInfoState]);

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
    sortOrder, // FE-042: Expose sort order
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
    currentPage, // FE-042: Expose current page
    pageSize, // FE-042: Expose page size
    pagination: fileOps.pagination || null, // FE-042: Expose pagination info
    
    // Computed
    filteredFiles,
    
    // Setters
    setFiles,
    setSelectedFiles,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setSortOrder, // FE-042: Expose sort order setter
    setShowUploadModal,
    setShowDeleted,
    setSelectedFolderId,
    setQuickFilters,
    setCurrentPage, // FE-042: Expose page setter
    setPageSize, // FE-042: Expose page size setter
    
    // File Actions
    handleFileSelect: fileOps.handleFileSelect,
    handleSelectAll,
    handleDeleteFiles: fileOps.handleDeleteFiles,
    handleDeleteFile: (fileId: string) => fileOps.handleDeleteFile(fileId, showDeleted),
    handleRestoreFile: fileOps.handleRestoreFile,
    handlePermanentlyDeleteFile: fileOps.handlePermanentlyDeleteFile,
    handleDownloadFile: fileOps.handleDownloadFile,
    handleShareFile: fileOps.handleShareFile,
    handleUploadFile,
    handleEditFile: (fileId: string, updates: any) => fileOps.handleEditFile(fileId, updates, showDeleted),
    handleRefresh: async () => {
      try {
        // FE-042: Refresh files with current pagination params
        await fileOps.loadFilesFromAPI(
          showDeleted,
          currentPage,
          pageSize,
          sortBy,
          sortOrder,
          debouncedSearchTerm,
          filterType,
          selectedFolderId
        );
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
    },
    handleStarFile: fileOps.handleStarFile,
    handleArchiveFile: fileOps.handleArchiveFile,
    handleMoveFile,
    
    // GAP-008: New handler functions
    handleDuplicateFile: fileOps.handleDuplicateFile,
    handleBulkRestore: fileOps.handleBulkRestore,
    handleRestoreVersion: fileOps.handleRestoreVersion,
    handleDownloadVersion: fileOps.handleDownloadVersion,
    loadFileStats: fileOps.loadFileStats,
    loadFileAccessLogs: fileOps.loadFileAccessLogs,
    loadFileActivity: fileOps.loadFileActivity,
    
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
    handleMoveToFolder: folderOps.handleMoveToFolder,
    
    // FE-035: Loading operations state for individual file operations
    loadingOperations: fileOps.loadingOperations,
    // FE-031: Operation errors state
    operationErrors: fileOps.operationErrors,
  };
};
