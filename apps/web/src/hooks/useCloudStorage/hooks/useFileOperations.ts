import { useState, useCallback, useRef } from 'react';
import { ResumeFile } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';
import { parseNetworkError, isRetryableError } from '../../../utils/networkErrorHandler';
import { deduplicateRequest, generateRequestKey } from '../../../utils/requestDeduplication';
import { getCache, setCache } from '../../../utils/cache';
import { useOfflineQueue } from '../../../hooks/useOfflineQueue';
import { serviceWorkerManager } from '../../../utils/serviceWorker';

// Helper to format file size
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

type UploadPayload = {
  file: File;
  displayName?: string;
  type?: ResumeFile['type'] | string;
  description?: string;
  tags?: string[];
  expiresAt?: string;
  folderId?: string | null;
};

type StorageCallback = (storage: {
  usedBytes: number;
  limitBytes: number;
  percentage: number;
  usedGB?: number;
  limitGB?: number;
}) => void;

interface UseFileOperationsOptions {
  onStorageUpdate?: StorageCallback;
}

export const useFileOperations = ({ onStorageUpdate }: UseFileOperationsOptions = {}) => {
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ usedGB: 0, limitGB: 0, percentage: 0 });
  const [operationErrors, setOperationErrors] = useState<Map<string, { error: string; retryable: boolean }>>(new Map());
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());
  const optimisticUpdatesRef = useRef<Map<string, ResumeFile>>(new Map());
  const fileVersionsRef = useRef<Map<string, number>>(new Map());
  
  // FE-042: Pagination state
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const loadFilesFromAPI = useCallback(async (
    includeDeleted: boolean = false,
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    setIsLoading(true);
    try {
      // FE-042: Cache key includes pagination params
      const cacheKey = `files_${includeDeleted}_${page}_${pageSize}_${sortBy}_${sortOrder}`;
      const cached = getCache<{ files: ResumeFile[]; storage: any; pagination: any; timestamp: number }>(cacheKey);
      if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
        logger.debug('Using cached files');
        setFiles(cached.files);
        if (cached.storage) {
          setStorageInfo(cached.storage);
          onStorageUpdate?.(cached.storage);
        }
        if (cached.pagination) {
          setPagination(cached.pagination);
        }
        setIsLoading(false);
        return;
      }

      logger.info('📥 Loading files from API (includeDeleted:', includeDeleted, ', page:', page, ', search:', searchTerm, ', type:', filterType, ')');
      
      // FE-044: Request deduplication with pagination params
      const requestKey = generateRequestKey('/api/storage/files', { 
        includeDeleted, 
        page, 
        pageSize, 
        sortBy, 
        sortOrder,
        search: searchTerm,
        type: filterType,
        folderId
      });
      const response = await deduplicateRequest(requestKey, () => 
        apiService.getCloudFiles(folderId || undefined, includeDeleted, page, pageSize, sortBy, sortOrder, searchTerm, filterType)
      );
      logger.info('📥 API response:', { 
        filesCount: response?.files?.length || 0,
        success: response?.success
      });
      
      if (response && response.files) {
        const formattedFiles = (response.files as ResumeFile[]).map(file => ({
          ...file,
          sharedWith: file.sharedWith || [],
          comments: file.comments || [],
          downloadCount: file.downloadCount || 0,
          viewCount: file.viewCount || 0,
          isStarred: file.isStarred || false,
          isArchived: file.isArchived || false,
          version: file.version || 1,
          owner: file.owner || file.userId || '',
          lastModified: file.lastModified || file.createdAt || file.updatedAt || new Date().toISOString(),
          size: typeof file.size === 'number' ? formatBytes(file.size) : (file.size || '0 B'),
          sizeBytes: typeof file.size === 'number' ? file.size : (file.sizeBytes || 0),
          folderId: file.folderId || null, // Ensure null instead of undefined
          deletedAt: file.deletedAt || null, // Ensure null instead of undefined
        }));
        setFiles(formattedFiles);
        logger.info(`✅ Loaded ${formattedFiles.length} files from API (page ${page} of ${response?.pagination?.totalPages || 1})`);
        
        // FE-042: Update pagination state
        if (response?.pagination) {
          setPagination(response.pagination);
        }
        
        // FE-043: Cache the result with pagination
        setCache(cacheKey, {
          files: formattedFiles,
          storage: response?.storage,
          pagination: response?.pagination,
          timestamp: Date.now(),
        }, 30000); // 30 second TTL
      } else {
        logger.warn('⚠️ No files in API response');
        setFiles([]);
      }
      
      if (response?.storage) {
        setStorageInfo(response.storage);
        onStorageUpdate?.(response.storage);
      }
    } catch (error: any) {
      logger.error('❌ Failed to load files from API:', error);
      const networkError = parseNetworkError(error);
      setOperationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set('load_files', { error: networkError.message, retryable: networkError.retryable });
        return newMap;
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [onStorageUpdate]);

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
    // FE-038: Track bulk operation results
    const results: Array<{ fileId: string; success: boolean; error?: string }> = [];
    const filesToDelete = selectedFiles.map(id => files.find(f => f.id === id)).filter(Boolean) as ResumeFile[];
    
    // FE-040: Store original state for rollback
    const originalFiles = new Map(filesToDelete.map(f => [f.id, f]));
    
    // FE-040: Optimistic update
    setFiles(prev => prev.map(file => 
      selectedFiles.includes(file.id) 
        ? { ...file, deletedAt: new Date().toISOString() } 
        : file
    ));
    
    try {
      // Use bulk delete endpoint if multiple files, otherwise individual delete
      if (selectedFiles.length > 1) {
        // FE-038: Use bulk delete endpoint for efficiency
        try {
          setLoadingOperations(prev => {
            const newSet = new Set(prev);
            selectedFiles.forEach(id => newSet.add(id));
            return newSet;
          });
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 60000)
          );
          
          const response = await Promise.race([
            apiService.bulkDeleteFiles(selectedFiles),
            timeoutPromise,
          ]);
          
          // Process bulk response
          if (response && response.results) {
            response.results.forEach((result: any) => {
              results.push({
                fileId: result.fileId,
                success: result.success,
                error: result.error
              });
              
              // Rollback failed files
              if (!result.success) {
                const originalFile = originalFiles.get(result.fileId);
                if (originalFile) {
                  setFiles(prev => prev.map(f => 
                    f.id === result.fileId ? originalFile : f
                  ));
                }
              }
            });
          } else {
            // If response format is different, assume all succeeded
            selectedFiles.forEach(fileId => {
              results.push({ fileId, success: true });
            });
          }
        } catch (error: any) {
          const networkError = parseNetworkError(error);
          // All failed
          selectedFiles.forEach(fileId => {
            results.push({ 
              fileId, 
              success: false, 
              error: networkError.message 
            });
            const originalFile = originalFiles.get(fileId);
            if (originalFile) {
              setFiles(prev => prev.map(f => 
                f.id === fileId ? originalFile : f
              ));
            }
          });
        } finally {
          setLoadingOperations(prev => {
            const newSet = new Set(prev);
            selectedFiles.forEach(id => newSet.delete(id));
            return newSet;
          });
        }
      } else {
        // Single file - use individual delete
        const fileId = selectedFiles[0];
        try {
          setLoadingOperations(prev => new Set(prev).add(fileId));
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), 30000)
          );
          
          await Promise.race([
            apiService.deleteCloudFile(fileId),
            timeoutPromise,
          ]);
          
          results.push({ fileId, success: true });
        } catch (error: any) {
          const networkError = parseNetworkError(error);
          results.push({ 
            fileId, 
            success: false, 
            error: networkError.message 
          });
          
          // FE-040: Rollback optimistic update for failed file
          const originalFile = originalFiles.get(fileId);
          if (originalFile) {
            setFiles(prev => prev.map(f => 
              f.id === fileId ? originalFile : f
            ));
          }
        } finally {
          setLoadingOperations(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
          });
        }
      }
      
      setSelectedFiles([]);
      return results;
    } catch (error: any) {
      logger.error('Failed to delete files:', error);
      // FE-040: Rollback all optimistic updates
      setFiles(prev => prev.map(file => {
        const original = originalFiles.get(file.id);
        return original || file;
      }));
      throw error;
    }
  }, [selectedFiles, files]);

  const handleDownloadFile = useCallback(async (file: ResumeFile, format?: 'pdf' | 'doc') => {
    try {
      if (format && file.fileName && !file.fileName.toLowerCase().endsWith(`.${format}`)) {
        logger.debug(`Requested ${format.toUpperCase()} download for ${file.name}, delivering original file format.`);
      }

      // Validate file before download
      if (!file.id) {
        throw new Error('Invalid file: missing file ID');
      }

      const blob = await apiService.downloadCloudFile(file.id);
      
      if (!blob || blob.size === 0) {
        throw new Error('File is empty or corrupted');
      }

      // FE-061: Cache file in service worker for offline access
      try {
        const fileUrl = `/api/storage/files/${file.id}/download`;
        await serviceWorkerManager.cacheFile(fileUrl, blob);
        logger.debug('[Service Worker] File cached for offline access:', file.id);
      } catch (error) {
        logger.warn('[Service Worker] Failed to cache file:', error);
        // Continue with download even if caching fails
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fallbackExtension = file.contentType?.split('/').pop() || 'bin';
      const downloadName = file.fileName || `${file.name}.${fallbackExtension}`;

      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFiles(prev => prev.map(existing =>
        existing.id === file.id
          ? { ...existing, downloadCount: (existing.downloadCount || 0) + 1 }
          : existing
      ));
    } catch (error: any) {
      logger.error('Failed to download file:', error);
      throw error; // Re-throw so parent can show toast
    }
  }, [setFiles]);

  /**
   * Legacy share handler - not used in current implementation
   * Sharing is handled through ShareModal component which calls handleShareWithUser
   * from useSharingOperations hook. This function is kept for backwards compatibility
   * but can be safely removed.
   */
  const handleShareFile = useCallback((file: ResumeFile) => {
    logger.debug('handleShareFile called for:', file.name);
    logger.info('Note: Actual sharing is handled through ShareModal -> handleShareWithUser');
    // No-op: ShareModal handles all sharing functionality
  }, []);

  const handleUploadFile = useCallback(async (payload: UploadPayload, onComplete?: () => void) => {
    try {
      const formData = new FormData();
      formData.append('file', payload.file);

      if (payload.displayName) {
        formData.append('displayName', payload.displayName);
      }
      if (payload.type) {
        formData.append('type', payload.type);
      }
      if (payload.folderId) {
        formData.append('folderId', payload.folderId);
      }
      if (payload.description) {
        formData.append('description', payload.description);
      }
      // FE-017: Add tags to upload
      if (payload.tags && payload.tags.length > 0) {
        formData.append('tags', JSON.stringify(payload.tags));
      }
      // FE-018: Add expiration date to upload
      if (payload.expiresAt) {
        formData.append('expiresAt', payload.expiresAt);
      }

      logger.info('📤 Uploading file to API...');
      const response = await apiService.uploadStorageFile(formData);
      logger.info('📤 Upload response:', { 
        success: response?.success,
        hasFile: !!response?.file,
        fileId: response?.file?.id 
      });
      
      if (response && response.file) {
        // Transform API response to ResumeFile format
        const uploadedFile: ResumeFile = {
          ...response.file,
          // Ensure all required fields have defaults
          sharedWith: response.file.sharedWith || [],
          comments: response.file.comments || [],
          downloadCount: response.file.downloadCount || 0,
          viewCount: response.file.viewCount || 0,
          isStarred: response.file.isStarred || false,
          isArchived: response.file.isArchived || false,
          version: response.file.version || 1,
          owner: response.file.owner || response.file.userId || '',
          lastModified: response.file.createdAt || response.file.updatedAt || new Date().toISOString(),
          size: typeof response.file.size === 'number' 
            ? formatBytes(response.file.size) 
            : (response.file.size || '0 B'),
          sizeBytes: typeof response.file.size === 'number' ? response.file.size : (response.file.sizeBytes || 0),
        };
        logger.info(`✅ File uploaded successfully: ${uploadedFile.id}`);
        
        // Add to local state
        setFiles(prev => {
          // Check if file already exists (prevent duplicates)
          const exists = prev.find(f => f.id === uploadedFile.id);
          if (exists) {
            logger.warn('File already in list, updating instead of adding');
            return prev.map(f => f.id === uploadedFile.id ? uploadedFile : f);
          }
          return [uploadedFile, ...prev];
        });
      } else {
        logger.warn('⚠️ Upload response missing file data');
      }

      if (response?.storage) {
        setStorageInfo(response.storage);
        onStorageUpdate?.(response.storage);
      }

      onComplete?.();
      
      // Reload files from API to ensure we have the latest data from database
      logger.info('🔄 Reloading files from API after upload...');
      try {
        await loadFilesFromAPI(false);
      } catch (err) {
          logger.error('Failed to reload files after upload:', err);
      }
    } catch (error) {
      logger.error('Failed to save file to API:', error);
      if ((error as any)?.storage && onStorageUpdate) {
        onStorageUpdate((error as any).storage);
      }
      throw error;
    }
  }, [onStorageUpdate, loadFilesFromAPI]);

  const handleEditFile = useCallback(async (fileId: string, updates: Partial<Pick<ResumeFile, 'name' | 'type' | 'description' | 'isStarred' | 'isArchived' | 'folderId'>>, showDeleted: boolean = false) => {
    try {
      const updatePayload: Record<string, any> = {};

      if (updates.name !== undefined) {
        updatePayload.name = updates.name;
      }

      if (updates.type !== undefined) {
        updatePayload.type = updates.type;
      }

      if (updates.description !== undefined) {
        updatePayload.description = updates.description;
      }

      if (updates.isStarred !== undefined) {
        updatePayload.isStarred = updates.isStarred;
      }

      if (updates.isArchived !== undefined) {
        updatePayload.isArchived = updates.isArchived;
      }

      if (updates.folderId !== undefined) {
        updatePayload.folderId = updates.folderId;
      }

      await apiService.updateCloudFile(fileId, updatePayload);

      // Update local state with new references to trigger re-render
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            ...updatePayload,
          } as ResumeFile;
        }
        return file;
      }));
      
      logger.info(`✅ File updated locally: ${fileId}`, updatePayload);

      // Refresh from API to ensure consistency with server - respect showDeleted state
      setTimeout(() => {
        loadFilesFromAPI(showDeleted).catch(error => {
          logger.warn('Failed to refresh files after edit:', error);
        });
      }, 100); // Reduced delay for faster feedback
    } catch (error) {
      logger.error('Failed to update file:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            ...updates,
          } as ResumeFile;
        }
        return file;
      }));
    }
  }, [loadFilesFromAPI]);

  const handleRefresh = useCallback(async (
    includeDeleted: boolean = false,
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc',
    searchTerm?: string,
    filterType?: string,
    folderId?: string | null
  ) => {
    logger.debug('Refreshing files...', { includeDeleted, page });
    await loadFilesFromAPI(includeDeleted, page, pageSize, sortBy, sortOrder, searchTerm, filterType, folderId);
  }, [loadFilesFromAPI]);

  const handleStarFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const newStarredState = !file.isStarred;
    
    // FE-040: Store original state for rollback
    optimisticUpdatesRef.current.set(fileId, file);
    
    // FE-040: Optimistic update - update UI immediately
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, isStarred: newStarredState }
        : f
    ));
    
    setLoadingOperations(prev => new Set(prev).add(fileId));
    
    try {
      // FE-037: Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      );
      
      await Promise.race([
        apiService.updateCloudFile(fileId, { isStarred: newStarredState }),
        timeoutPromise,
      ]);
      
      // Success - optimistic update was correct
      optimisticUpdatesRef.current.delete(fileId);
    } catch (error: any) {
      logger.error('Failed to toggle star status:', error);
      const networkError = parseNetworkError(error);
      
      // FE-040: Revert optimistic update on error
      const original = optimisticUpdatesRef.current.get(fileId);
      if (original) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? original : f
        ));
        optimisticUpdatesRef.current.delete(fileId);
      }
      
      // FE-031: Store error for retry
      if (isRetryableError(error)) {
        setOperationErrors(prev => {
          const newMap = new Map(prev);
          newMap.set(`star_${fileId}`, { error: networkError.message, retryable: true });
          return newMap;
        });
      }
    } finally {
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
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

  // Single file delete handler (soft delete - moves to recycle bin)
  const handleDeleteFile = useCallback(async (fileId: string, showDeleted: boolean = false) => {
    // Validate input
    if (!fileId) {
      throw new Error('Invalid file ID');
    }

    try {
      await apiService.deleteCloudFile(fileId);
      logger.info(`✅ File moved to recycle bin: ${fileId}`);
      
      // Update local state optimistically
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: new Date().toISOString() } : file
      ));
      
      // Reload files from API to ensure consistency - respect showDeleted state
      try {
        await loadFilesFromAPI(showDeleted);
      } catch (err) {
          logger.error('Failed to reload files after delete:', err);
      }
    } catch (error: any) {
      logger.error('Failed to delete file:', error);
      // Revert optimistic update
      setFiles(prev => prev.map(file => 
        file.id === fileId && file.deletedAt ? { ...file, deletedAt: null } : file
      ));
      throw error; // Re-throw so UI can show error message
    }
  }, [loadFilesFromAPI]);

  // Restore deleted file from recycle bin
  const handleRestoreFile = useCallback(async (fileId: string) => {
    try {
      await apiService.restoreCloudFile(fileId);
      logger.info(`✅ File restored from recycle bin: ${fileId}`);
      
      // Update local state to remove deletedAt
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, deletedAt: null } : file
      ));
      
      // Reload files from API to ensure consistency
      try {
        await loadFilesFromAPI(false);
      } catch (err) {
          logger.error('Failed to reload files after restore:', err);
      }
    } catch (error) {
      logger.error('Failed to restore file:', error);
      throw error; // Re-throw so UI can show error message
    }
  }, [loadFilesFromAPI]);

  // Permanently delete file
  const handlePermanentlyDeleteFile = useCallback(async (fileId: string) => {
    try {
      const response = await apiService.permanentlyDeleteCloudFile(fileId);
      logger.info(`✅ File permanently deleted: ${fileId}`);
      
      // Remove from local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      // Update storage quota if provided
      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }
      
      // Reload files from API to ensure consistency (use showDeleted from closure or default to true since we're in recycle bin)
      try {
        await loadFilesFromAPI(true);
      } catch (err) {
          logger.error('Failed to reload files after permanent delete:', err);
      }
    } catch (error) {
      logger.error('Failed to permanently delete file:', error);
      // Fallback to local state update
      setFiles(prev => prev.filter(file => file.id !== fileId));
    }
  }, [onStorageUpdate, loadFilesFromAPI]);

  // GAP-008: Handle duplicate file
  const handleDuplicateFile = useCallback(async (fileId: string) => {
    setLoadingOperations(prev => new Set(prev).add(`duplicate_${fileId}`));
    try {
      const response = await apiService.duplicateFile(fileId);
      logger.info(`✅ File duplicated: ${fileId} -> ${response.file?.id}`);
      
      // Add duplicated file to local state
      if (response.file) {
        setFiles(prev => [...prev, response.file as ResumeFile]);
      }
      
      // Update storage quota if provided
      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }
      
      // Reload files to ensure consistency
      await loadFilesFromAPI(false);
      
      return response;
    } catch (error: any) {
      logger.error('Failed to duplicate file:', error);
      const networkError = parseNetworkError(error);
      setOperationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set(`duplicate_${fileId}`, { error: networkError.message, retryable: isRetryableError(error) });
        return newMap;
      });
      throw error;
    } finally {
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`duplicate_${fileId}`);
        return newSet;
      });
    }
  }, [loadFilesFromAPI, onStorageUpdate]);

  // GAP-008: Handle bulk restore files
  const handleBulkRestore = useCallback(async (fileIds: string[]) => {
    if (fileIds.length === 0) return [];
    
    const operationId = `bulk_restore_${fileIds.join('_')}`;
    setLoadingOperations(prev => new Set(prev).add(operationId));
    
    try {
      const response = await apiService.bulkRestoreFiles(fileIds);
      logger.info(`✅ Bulk restore completed: ${fileIds.length} files`);
      
      // Update local state to remove deletedAt
      setFiles(prev => prev.map(file => 
        fileIds.includes(file.id) ? { ...file, deletedAt: null } : file
      ));
      
      // Update storage quota if provided
      if (response?.storage && onStorageUpdate) {
        onStorageUpdate(response.storage);
      }
      
      // Reload files to ensure consistency
      await loadFilesFromAPI(false);
      
      // Return results for bulk operation display
      const results = fileIds.map(fileId => ({
        fileId,
        success: true,
      }));
      
      return results;
    } catch (error: any) {
      logger.error('Failed to bulk restore files:', error);
      const networkError = parseNetworkError(error);
      setOperationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set(operationId, { error: networkError.message, retryable: isRetryableError(error) });
        return newMap;
      });
      
      // Return partial results if some succeeded
      return fileIds.map(fileId => ({
        fileId,
        success: false,
        error: networkError.message,
      }));
    } finally {
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
    }
  }, [loadFilesFromAPI, onStorageUpdate]);

  // GAP-008: Handle restore specific file version
  const handleRestoreVersion = useCallback(async (fileId: string, versionId: string) => {
    setLoadingOperations(prev => new Set(prev).add(`restore_version_${fileId}_${versionId}`));
    try {
      // TODO: This endpoint needs to be implemented in backend (GAP-009)
      // For now, we'll use a placeholder that will fail gracefully
      const response = await apiService.request(`/api/storage/files/${fileId}/versions/${versionId}/restore`, {
        method: 'POST',
        credentials: 'include',
      });
      
      logger.info(`✅ Version restored: ${fileId} version ${versionId}`);
      
      // Reload files to get updated version
      await loadFilesFromAPI(false);
      
      return response;
    } catch (error: any) {
      logger.error('Failed to restore version:', error);
      // Check if endpoint doesn't exist (404) and show helpful message
      if (error?.status === 404 || error?.message?.includes('404')) {
        logger.warn('Version restore endpoint not yet implemented in backend (GAP-009)');
      }
      const networkError = parseNetworkError(error);
      setOperationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set(`restore_version_${fileId}_${versionId}`, { 
          error: networkError.message || 'Version restore endpoint not yet implemented', 
          retryable: false 
        });
        return newMap;
      });
      throw error;
    } finally {
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`restore_version_${fileId}_${versionId}`);
        return newSet;
      });
    }
  }, [loadFilesFromAPI]);

  // GAP-008: Handle download specific file version
  const handleDownloadVersion = useCallback(async (fileId: string, versionId: string) => {
    try {
      // TODO: This endpoint needs to be implemented in backend (GAP-010)
      // Use apiService's request method instead of direct fetch
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/storage/files/${fileId}/versions/${versionId}/download`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Version download endpoint not yet implemented in backend (GAP-010)');
        }
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to download version');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `version_${versionId}.${blob.type.split('/')[1] || 'bin'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      logger.info(`✅ Version downloaded: ${fileId} version ${versionId}`);
    } catch (error: any) {
      logger.error('Failed to download version:', error);
      throw error;
    }
  }, []);

  // GAP-008: Load file statistics
  const loadFileStats = useCallback(async () => {
    try {
      const stats = await apiService.getFileStats();
      logger.debug('📊 File stats loaded:', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to load file stats:', error);
      // Return null on error, don't throw - stats are optional
      return null;
    }
  }, []);

  // GAP-008: Load file access logs
  const loadFileAccessLogs = useCallback(async (fileId: string) => {
    try {
      const logs = await apiService.getFileAccessLogs(fileId);
      logger.debug(`📋 Access logs loaded for file ${fileId}:`, logs);
      return logs;
    } catch (error) {
      logger.error('Failed to load access logs:', error);
      // Return empty array on error, don't throw
      return [];
    }
  }, []);

  // GAP-008: Load file activity timeline
  const loadFileActivity = useCallback(async (fileId: string, limit: number = 50, offset: number = 0) => {
    try {
      const activity = await apiService.getFileActivity(fileId, limit, offset);
      logger.debug(`📈 Activity loaded for file ${fileId}:`, activity);
      return activity;
    } catch (error) {
      logger.error('Failed to load file activity:', error);
      // Return empty array on error, don't throw
      return [];
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
    handleDownloadFile,
    handleShareFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    handleStarFile,
    handleArchiveFile,
    // GAP-008: New handler functions
    handleDuplicateFile,
    handleBulkRestore,
    handleRestoreVersion,
    handleDownloadVersion,
    loadFileStats,
    loadFileAccessLogs,
    loadFileActivity,
    // FE-035: Loading operations state
    loadingOperations,
    // FE-031: Operation errors state
    operationErrors,
    // FE-042: Pagination state
    pagination,
    // Storage info state
    storageInfo,
  };
};

// Move handler helper
export const useCopyMoveOperations = (
  setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>,
  refreshFiles?: (includeDeleted?: boolean) => Promise<void>,
  refreshFolders?: () => Promise<void> | void,
  afterMove?: (fileId: string, folderId: string | null) => void
) => {
  const handleMoveFile = useCallback(async (fileId: string, folderId: string | null) => {
    try {
      logger.info('📦 Moving file:', fileId, 'to folder:', folderId);
      const response = await apiService.moveCloudFile(fileId, folderId);
      
      if (response && response.success) {
        // Update local state (real-time events will also handle this)
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, folderId: folderId || null }
            : file
        ));
        
        logger.info('✅ File moved successfully:', fileId);

        if (refreshFiles) {
          try {
            await refreshFiles(false);
          } catch (refreshError) {
            logger.warn('Failed to refresh files after move:', refreshError);
          }
        }

        if (refreshFolders) {
          try {
            await refreshFolders();
          } catch (folderError) {
            logger.warn('Failed to refresh folders after move:', folderError);
          }
        }

        if (afterMove) {
          try {
            afterMove(fileId, folderId || null);
          } catch (callbackError) {
            logger.warn('Post-move callback threw an error:', callbackError);
          }
        }

        return response;
      } else {
        throw new Error(response?.error || 'Failed to move file');
      }
    } catch (error: any) {
      logger.error('Failed to move file:', error);
      throw error;
    }
  }, [setFiles, refreshFiles]);

  return {
    handleMoveFile
  };
};

