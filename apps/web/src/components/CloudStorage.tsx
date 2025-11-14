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

export default function CloudStorage({ onClose }: CloudStorageProps) {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const { toasts, dismissToast, success, error } = useToast();

  if (!colors) {
    return <LoadingState colors={{}} message="Loading theme" />;
  }

  const [activeTab, setActiveTab] = useState<TabType>('files');
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

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
    setSearchTerm,
    setFilterType,
    setSortBy,
    setShowUploadModal,
    setShowDeleted,
    setSelectedFolderId,
    setQuickFilters,
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

  if (!hasLoadedInitial && isLoading) {
    return <LoadingState colors={colors} />;
  }

  return (
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
              onDeleteSelected={handleDeleteFiles}
              onFileSelect={handleFileSelect}
              onDownload={handleDownloadFileWrapper}
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
        />
      )}
    </div>
  );
}
