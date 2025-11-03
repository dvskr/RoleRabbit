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

export default function CloudStorage({ onClose }: CloudStorageProps) {
  const { theme } = useTheme();
  const colors = theme?.colors;

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
    handleTogglePublic,
    handleDownloadFile,
    handleShareFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    handleShareWithUser,
    handleAddComment,
    handleStarFile,
    handleArchiveFile,
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
    async (fileId: string, updates?: { name?: string; tags?: string[] }) => {
      if (updates) {
        // Direct update with name and/or tags
        await handleEditFile(fileId, updates);
      } else {
        // Legacy behavior - open edit dialog (for backward compatibility)
        const file = files.find((f) => f.id === fileId);
        if (!file) return;
        editFileName(file, handleEditFile);
      }
    },
    [files, handleEditFile]
  );

  const handleDownloadFileWrapper = useCallback(
    (file: ResumeFile, format: 'pdf' | 'doc' = 'pdf') => {
      handleDownloadFile(file, format);
    },
    [handleDownloadFile]
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

  const publicFilesCount = useMemo(
    () => activeFiles.filter((file) => file.isPublic).length,
    [activeFiles]
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
              onDelete={handleDeleteFile}
              onRestore={handleRestoreFile}
              onPermanentlyDelete={handlePermanentlyDeleteFile}
              onTogglePublic={handleTogglePublic}
              onEdit={handleEditFileWrapper}
              onStar={handleStarFile}
              onArchive={handleArchiveFile}
              onAddComment={handleAddComment}
              onShareWithUser={handleShareWithUser}
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
