'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CloudStorageProps, ResumeFile } from '../types/cloudStorage';
import { useCloudStorage } from '../hooks/useCloudStorage';
import UploadModal from './cloudStorage/UploadModal';
import { DuplicateFileModal } from './cloudStorage/fileCard/components/DuplicateFileModal';
import CredentialManager from './cloudStorage/CredentialManager';
import { useTheme } from '../contexts/ThemeContext';
import { TabType } from './cloudStorage/types';
import { editFileName } from '../utils/fileOperations';
import { useFolderModals } from './cloudStorage/hooks';
import { LoadingState } from './cloudStorage/LoadingState';
import { CreateFolderModal } from './cloudStorage/CreateFolderModal';
import { RenameFolderModal } from './cloudStorage/RenameFolderModal';
import { RedesignedStorageHeader } from './cloudStorage/RedesignedStorageHeader';
import { RedesignedFolderSidebar } from './cloudStorage/RedesignedFolderSidebar';
import { RedesignedFileList, FilesTabsBar } from './cloudStorage/RedesignedFileList';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';
import { logger } from '../utils/logger';
import { KeyboardShortcutsModal } from './cloudStorage/KeyboardShortcutsModal';
import { FileConflictResolutionModal } from './cloudStorage/FileConflictResolutionModal';
import { FileVersionHistoryModal } from './cloudStorage/FileVersionHistoryModal';
import { FileVersionHistoryModalWithData } from './cloudStorage/FileVersionHistoryModalWithData';
import { FileActivityTimeline } from './cloudStorage/FileActivityTimeline';
import { CloudStorageErrorBoundary } from './cloudStorage/ErrorBoundary';
import { ErrorRecovery } from './cloudStorage/ErrorRecovery';
import { BulkOperationResults, BulkOperationResult } from './cloudStorage/BulkOperationResults';
import { FileOperationLoader } from './cloudStorage/FileOperationLoader';
import { getUserFriendlyErrorMessage } from '../utils/networkErrorHandler';
import { PaginationControls } from './cloudStorage/PaginationControls';

export default function CloudStorage({ onClose }: CloudStorageProps) {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const { toasts, dismissToast, success, error } = useToast();

  if (!colors) {
    return <LoadingState colors={{}} message="Loading theme" />;
  }

  // FE-038: Bulk operation results state
  const [bulkOperationResults, setBulkOperationResults] = useState<BulkOperationResult[] | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('files');
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [fileConflict, setFileConflict] = useState<{ fileId: string; fileName: string; localVersion: any; serverVersion: any } | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedFileForHistory, setSelectedFileForHistory] = useState<ResumeFile | null>(null);

  const {
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
    quickFilters,
    filteredFiles,
    currentPage,
    pageSize,
    pagination,
    sortOrder,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setSortOrder,
    setShowUploadModal,
    setShowDeleted,
    setSelectedFolderId,
    setQuickFilters,
    setCurrentPage,
    setPageSize,
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
    handleShareWithUser,
    handleRemoveShare,
    handleAddComment,
    handleStarFile,
    handleArchiveFile,
    handleMoveFile,
    handleAddCredential,
    handleUpdateCredential,
    handleDeleteCredential,
    handleGenerateQRCode,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveToFolder,
    // GAP-008: New handler functions
    handleDuplicateFile,
    handleBulkRestore,
    handleRestoreVersion,
    handleDownloadVersion,
    loadFileStats,
    loadFileAccessLogs,
    loadFileActivity,
    loadingOperations,
    operationErrors,
  } = useCloudStorage();

  const {
    showCreateFolderModal,
    showRenameFolderModal,
    folderToRename,
    openCreateFolderModal,
    closeCreateFolderModal,
    openRenameFolderModal,
    closeRenameFolderModal,
  } = useFolderModals();

  const handleEditFileWrapper = useCallback(
    async (fileId: string, updates?: { name?: string; type?: ResumeFile['type']; description?: string }) => {
      try {
        if (updates) {
          // Direct update with provided fields - pass showDeleted state
          await handleEditFile(fileId, updates, showDeleted);
          success('File updated successfully');
        } else {
          // Legacy behavior - open edit dialog (for backward compatibility)
          const file = files.find((f) => f.id === fileId);
          if (!file) return;
          editFileName(file, async (fileId, updates) => {
            await handleEditFile(fileId, updates, showDeleted);
            success('File updated successfully');
          });
        }
      } catch (err: any) {
        error(`Failed to update file: ${err.message || 'Unknown error'}`);
      }
    },
    [files, handleEditFile, showDeleted, success, error]
  );

  const handleDownloadFileWrapper = useCallback(
    async (file: ResumeFile, format: 'pdf' | 'doc' = 'pdf') => {
      try {
        await handleDownloadFile(file, format);
        success(`Downloaded ${file.name}`);
      } catch (err: any) {
        error(`Failed to download ${file.name}: ${err.message || 'Unknown error'}`);
      }
    },
    [handleDownloadFile, success, error]
  );

  const handleSelectAllWrapper = useCallback(() => {
    handleSelectAll(filteredFiles);
  }, [handleSelectAll, filteredFiles]);

  // FE-038: Wrapper for handleDeleteFiles to track bulk operation results
  const handleDeleteFilesWrapper = useCallback(async () => {
    try {
      const results = await handleDeleteFiles();
      if (results && results.length > 0) {
        const fileNames = files.filter(f => results.some(r => r.fileId === f.id)).map(f => f.name);
        const bulkResults: BulkOperationResult[] = results.map((r, idx) => ({
          fileId: r.fileId,
          fileName: fileNames[idx] || 'Unknown',
          success: r.success,
          error: r.error,
        }));
        setBulkOperationResults(bulkResults);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => setBulkOperationResults(null), 10000);
      }
    } catch (err: any) {
      error(`Failed to delete files: ${getUserFriendlyErrorMessage(err)}`);
    }
  }, [handleDeleteFiles, files, error]);

  const handleFolderSelect = useCallback(
    (folderId: string | null) => {
      setSelectedFolderId(folderId);
      if (showDeleted) {
        setShowDeleted(false);
      }
    },
    [setSelectedFolderId, showDeleted, setShowDeleted]
  );

  const handleFolderRename = useCallback(
    (folderId: string, folderName: string) => {
      openRenameFolderModal({ id: folderId, name: folderName });
    },
    [openRenameFolderModal]
  );

  const handleToggleRecycleBin = useCallback(() => {
    setShowDeleted((prev) => !prev);
    setSelectedFolderId(null);
  }, [setShowDeleted, setSelectedFolderId]);

  const activeFiles = useMemo(
    () => files.filter((file) => !file.deletedAt),
    [files]
  );

  const starredFilesCount = useMemo(
    () => activeFiles.filter((file) => file.isStarred).length,
    [activeFiles]
  );

  const deletedFilesCount = useMemo(
    () => files.filter((file) => Boolean(file.deletedAt)).length,
    [files]
  );

  useEffect(() => {
    if (!isLoading) {
      setHasLoadedInitial(true);
    }
  }, [isLoading]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA' ||
          (e.target as HTMLElement).isContentEditable) {
        return;
      }

      // Focus search with '/'
      if (e.key === '/' && !showUploadModal && !showKeyboardShortcuts) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Open upload modal with 'U'
      if ((e.key === 'u' || e.key === 'U') && !showUploadModal && !showDeleted && activeTab === 'files') {
        e.preventDefault();
        setShowUploadModal(true);
      }

      // Delete selected files with 'Delete'
      if (e.key === 'Delete' && selectedFiles.length > 0 && !showDeleted) {
        e.preventDefault();
        handleDeleteFilesWrapper();
      }

      // Download with 'D'
      if ((e.key === 'd' || e.key === 'D') && selectedFiles.length > 0) {
        e.preventDefault();
        const file = files.find(f => f.id === selectedFiles[0]);
        if (file) {
          handleDownloadFileWrapper(file);
        }
      }

      // Star/unstar with 'S'
      if ((e.key === 's' || e.key === 'S') && selectedFiles.length > 0) {
        e.preventDefault();
        const file = files.find(f => f.id === selectedFiles[0]);
        if (file) {
          handleStarFile(file.id);
        }
      }

      // Archive/unarchive with 'A'
      if ((e.key === 'a' || e.key === 'A') && selectedFiles.length > 0 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const file = files.find(f => f.id === selectedFiles[0]);
        if (file) {
          handleArchiveFile(file.id);
        }
      }

      // Select all with Ctrl+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAllWrapper();
      }

      // Deselect all with Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        // Deselect all by toggling each selected file
        selectedFiles.forEach(id => {
          if (selectedFiles.includes(id)) {
            handleFileSelect(id);
          }
        });
      }

      // Show keyboard shortcuts with '?'
      if (e.key === '?' && !e.shiftKey && !showUploadModal) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showUploadModal,
    showKeyboardShortcuts,
    showDeleted,
    activeTab,
    selectedFiles,
    files,
    handleDeleteFiles,
    handleDownloadFileWrapper,
    handleStarFile,
    handleArchiveFile,
    handleSelectAllWrapper,
    handleFileSelect,
    setShowUploadModal,
  ]);

  if (!hasLoadedInitial && isLoading) {
    return <LoadingState colors={colors} />;
  }

  return (
    <CloudStorageErrorBoundary>
      <div
        className="h-full flex flex-col overflow-hidden min-h-0"
      style={{ background: colors.background }}
      data-testid="cloud-storage-root"
    >
      <RedesignedStorageHeader
        storageInfo={storageInfo}
        onRefresh={handleRefresh}
        colors={colors}
      />

      <div className="flex-1 min-h-0 overflow-hidden flex px-6 pt-6 pb-6 gap-6">
        <RedesignedFolderSidebar
          folders={folders || []}
          selectedFolderId={selectedFolderId}
          showDeleted={showDeleted}
          deletedFilesCount={deletedFilesCount}
          storageInfo={storageInfo}
          quickFilters={quickFilters || {}}
          onSelectFolder={handleFolderSelect}
          onToggleRecycleBin={handleToggleRecycleBin}
          onCreateFolder={openCreateFolderModal}
          onRenameFolder={handleFolderRename}
          onDeleteFolder={handleDeleteFolder}
          setQuickFilters={setQuickFilters}
          colors={colors}
          totalFilesCount={activeFiles.length}
        />

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl"
          style={{ background: colors.cardBackground, border: `1px solid ${colors.border}` }}
        >
          {activeTab === 'credentials' ? (
            <>
              <FilesTabsBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                filesCount={activeFiles.length}
                credentialsCount={credentials.length}
                colors={colors}
                onUpload={() => setShowUploadModal(true)}
                showDeleted={showDeleted}
              />
              <div className="flex-1 overflow-y-auto p-6">
                <CredentialManager
                  credentials={credentials}
                  reminders={credentialReminders}
                  onAddCredential={handleAddCredential}
                  onUpdateCredential={handleUpdateCredential}
                  onDeleteCredential={handleDeleteCredential}
                  onGenerateQRCode={handleGenerateQRCode}
                />
              </div>
            </>
          ) : (
            <RedesignedFileList
              files={filteredFiles}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedFiles={selectedFiles}
              onSelectAll={handleSelectAllWrapper}
              onDeleteSelected={handleDeleteFilesWrapper}
              onBulkRestore={showDeleted ? async () => {
                try {
                  const results = await handleBulkRestore(selectedFiles);
                  if (results && results.length > 0) {
                    const fileNames = files.filter(f => results.some(r => r.fileId === f.id)).map(f => f.name);
                    const bulkResults: BulkOperationResult[] = results.map((r, idx) => ({
                      fileId: r.fileId,
                      fileName: fileNames[idx] || 'Unknown',
                      success: r.success,
                      error: r.error,
                    }));
                    setBulkOperationResults(bulkResults);
                    setTimeout(() => setBulkOperationResults(null), 10000);
                    success(`${results.filter(r => r.success).length} file(s) restored successfully`);
                  }
                } catch (err: any) {
                  error(`Failed to restore files: ${getUserFriendlyErrorMessage(err)}`);
                }
              } : undefined}
              onFileSelect={handleFileSelect}
              onDownload={handleDownloadFileWrapper}
              isLoading={isLoading}
              loadingOperations={loadingOperations}
              operationErrors={operationErrors}
              onShare={handleShareFile}
              onDelete={async (fileId) => {
                try {
                  await handleDeleteFile(fileId, showDeleted);
                  success('File moved to recycle bin');
                } catch (err: any) {
                  error(`Failed to delete file: ${err.message || 'Unknown error'}`);
                  logger.error('Failed to delete file:', err);
                }
              }}
              onRestore={handleRestoreFile}
              onPermanentlyDelete={handlePermanentlyDeleteFile}
              onEdit={handleEditFileWrapper}
              onStar={handleStarFile}
              onArchive={handleArchiveFile}
              onAddComment={async (fileId, content) => {
                try {
                  await handleAddComment(fileId, content);
                  success('Comment added successfully');
                } catch (err: any) {
                  error(`Failed to add comment: ${err.message || 'Unknown error'}`);
                }
              }}
              onShareWithUser={async (fileId, email, permission, expiresAt?, maxDownloads?) => {
                try {
                  const response = await handleShareWithUser(fileId, email, permission, expiresAt, maxDownloads);
                  
                  // Check if email was sent successfully
                  if (response?.emailSent) {
                  success(`File shared successfully with ${email}. Email notification sent!`);
                  } else if (response?.warning) {
                    // Email failed but share was created
                    error(`⚠️ ${response.warning}`);
                  } else {
                    // Success but no email status
                    success(`File shared successfully with ${email}.`);
                  }
                  // Clear the email field after successful share so user can add another
                  // The modal will stay open for adding more shares
                } catch (err: any) {
                  const errorMsg = err?.message || err?.error || 'Unknown error';
                  error(`Failed to share file: ${errorMsg}`);
                  logger.error('Failed to share file:', err);
                }
              }}
              onRemoveShare={async (fileId, shareId) => {
                try {
                  await handleRemoveShare(fileId, shareId);
                  success('Share access removed');
                } catch (err: any) {
                  error(`Failed to remove share: ${err.message || 'Unknown error'}`);
                }
              }}
              onMove={async (fileId, folderId) => {
                try {
                  await handleMoveFile(fileId, folderId);
                  success('File moved successfully');
                } catch (err: any) {
                  error(`Failed to move file: ${err.message || 'Unknown error'}`);
                }
              }}
              folders={folders}
              showDeleted={showDeleted}
              colors={colors}
              onUpload={showDeleted ? () => {} : () => setShowUploadModal(true)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              filesCount={activeFiles.length}
              credentialsCount={credentials.length}
              quickFilters={quickFilters || {}}
            />
          )}
          
          {/* FE-042: Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              colors={colors}
            />
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={dismissToast} position="top-right" />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={closeCreateFolderModal}
        onConfirm={(folderName) => {
          handleCreateFolder(folderName);
          closeCreateFolderModal();
        }}
        colors={colors}
      />

      {folderToRename && (
        <RenameFolderModal
          isOpen={showRenameFolderModal}
          onClose={closeRenameFolderModal}
          folder={folderToRename}
          onConfirm={(folderId, newName) => {
            handleRenameFolder(folderId, newName);
            closeRenameFolderModal();
          }}
          colors={colors}
        />
      )}

      {activeTab === 'files' && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadFile}
          activeFolderId={selectedFolderId}
          storageInfo={storageInfo}
          existingFiles={files}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* File Conflict Resolution Modal */}
      {fileConflict && (
        <FileConflictResolutionModal
          isOpen={!!fileConflict}
          conflict={fileConflict}
          onResolve={(action) => {
            // Handle conflict resolution (requires backend support)
            logger.info('Conflict resolution:', action, fileConflict);
            setFileConflict(null);
            // TODO: Implement conflict resolution logic
          }}
          onClose={() => setFileConflict(null)}
        />
      )}

      {/* File Version History Modal */}
      {selectedFileForHistory && (
        <FileVersionHistoryModalWithData
          isOpen={showVersionHistory}
          fileId={selectedFileForHistory.id}
          fileName={selectedFileForHistory.name}
          onClose={() => {
            setShowVersionHistory(false);
            setSelectedFileForHistory(null);
          }}
          onRestoreVersion={async (versionId) => {
            if (!selectedFileForHistory) return;
            try {
              await handleRestoreVersion(selectedFileForHistory.id, versionId);
              success('Version restored successfully');
              setShowVersionHistory(false);
              setSelectedFileForHistory(null);
              handleRefresh(); // Refresh file list
            } catch (err: any) {
              error(`Failed to restore version: ${err.message || 'Unknown error'}`);
            }
          }}
          onDownloadVersion={async (versionId) => {
            if (!selectedFileForHistory) return;
            try {
              await handleDownloadVersion(selectedFileForHistory.id, versionId);
              success('Version downloaded successfully');
            } catch (err: any) {
              error(`Failed to download version: ${err.message || 'Unknown error'}`);
            }
          }}
        />
      )}

      {/* FE-038: Bulk operation results */}
      {bulkOperationResults && bulkOperationResults.length > 0 && (
        <div className="px-6 pb-4">
          <BulkOperationResults
            results={bulkOperationResults}
            operation="Delete"
            onDismiss={() => setBulkOperationResults(null)}
            colors={colors}
          />
        </div>
      )}
    </div>
    </CloudStorageErrorBoundary>
  );
}
