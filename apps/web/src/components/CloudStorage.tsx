'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { CloudStorageProps, ResumeFile } from '../types/cloudStorage';
import { useCloudStorage } from '../hooks/useCloudStorage';
import StorageHeader from './cloudStorage/StorageHeader';
import StorageFilters from './cloudStorage/StorageFilters';
import FileCard from './cloudStorage/FileCard';
import UploadModal from './cloudStorage/UploadModal';
import CredentialManager from './cloudStorage/CredentialManager';
import { logger } from '../utils/logger';
import { useTheme } from '../contexts/ThemeContext';
import { TabType } from './cloudStorage/types';
import { DEFAULT_LOADING_MESSAGE } from './cloudStorage/constants';
import { editFileName } from '../utils/fileOperations';
import { downloadFileAsHTML } from '../utils/fileDownload';
import { useFolderModals } from './cloudStorage/hooks';
import { LoadingState } from './cloudStorage/LoadingState';
import { TabNavigation } from './cloudStorage/TabNavigation';
import { EmptyFilesState } from './cloudStorage/EmptyFilesState';
import { FloatingUploadButton } from './cloudStorage/FloatingUploadButton';
import { FolderSidebar } from './cloudStorage/FolderSidebar';
import { CreateFolderModal } from './cloudStorage/CreateFolderModal';
import { RenameFolderModal } from './cloudStorage/RenameFolderModal';

export default function CloudStorage({ onClose }: CloudStorageProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [activeTab, setActiveTab] = useState<TabType>('files');
  
  const {
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
    
    // Computed
    filteredFiles,
    
    // Setters
    setSearchTerm,
    setFilterType,
    setSortBy,
    setViewMode,
    setShowUploadModal,
    setSelectedFolderId,
    
    // Actions
    handleFileSelect,
    handleSelectAll,
    handleDeleteFiles,
    handleTogglePublic,
    handleDownloadFile,
    handleShareFile,
    handleUploadFile,
    handleEditFile,
    handleRefresh,
    
    // Sharing and Access Management
    handleShareWithUser,
    handleRemoveShare,
    handleUpdatePermission,
    handleCreateShareLink,
    handleAddComment,
    handleStarFile,
    handleArchiveFile,
    
    // Credential Management
    handleAddCredential,
    handleUpdateCredential,
    handleDeleteCredential,
    handleGenerateQRCode,
    
    // Folder Management
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveToFolder
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

  // Memoize wrapper functions to prevent unnecessary re-renders
  const handleEditFileWrapper = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    editFileName(file, handleEditFile);
  }, [files, handleEditFile]);

  const handleDownloadFileWrapper = useCallback((file: ResumeFile, format: 'pdf' | 'doc' = 'pdf') => {
    downloadFileAsHTML(
      file,
      format,
      (fileId: string, count: number) => handleEditFile(fileId, { downloadCount: count })
    );
  }, [handleEditFile]);

  const handleDeleteFile = useCallback((fileId: string) => {
    logger.debug('Deleting file:', fileId);
    handleDeleteFiles();
  }, [handleDeleteFiles]);

  // Memoize folder selection handler
  const handleFolderSelect = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
  }, [setSelectedFolderId]);

  // Memoize folder rename handler
  const handleFolderRename = useCallback((folderId: string, folderName: string) => {
    openRenameFolderModal({ id: folderId, name: folderName });
  }, [openRenameFolderModal]);

  // Show loading state while fetching from API
  if (isLoading) {
    return <LoadingState colors={colors} />;
  }

  return (
    <div 
      className="h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Header Section */}
      <div className="flex-shrink-0">
        <StorageHeader
          storageInfo={storageInfo}
          onUpload={() => setShowUploadModal(true)}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filesCount={files.length}
        credentialsCount={credentials.length}
        expiringCredentialsCount={credentialReminders.length}
        colors={colors}
      />

      {/* Credentials Tab Content */}
      {activeTab === 'credentials' ? (
        <div className="flex-1 overflow-y-auto p-4">
          <CredentialManager
            credentials={credentials}
            reminders={credentialReminders}
            onAddCredential={handleAddCredential}
            onUpdateCredential={handleUpdateCredential}
            onDeleteCredential={handleDeleteCredential}
            onGenerateQRCode={handleGenerateQRCode}
          />
        </div>
      ) : (
        <>
          {/* Fixed Filters Section */}
          <div className="flex-shrink-0 px-3 py-2">
            <StorageFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedFiles={selectedFiles}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteFiles}
            />
          </div>

          {/* Folder Sidebar & Files Grid */}
          <div className="flex-1 overflow-hidden flex">
            {/* Folder Sidebar */}
            <FolderSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleFolderSelect}
              onCreateFolder={openCreateFolderModal}
              onRenameFolder={handleFolderRename}
              onDeleteFolder={handleDeleteFolder}
              colors={colors}
            />

            {/* Files Grid Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 w-full min-w-0">
            {filteredFiles.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' 
                : 'space-y-1.5 w-full max-w-full'
              }>
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    isSelected={selectedFiles.includes(file.id)}
                    viewMode={viewMode}
                    onSelect={handleFileSelect}
                    onDownload={handleDownloadFileWrapper}
                    onShare={handleShareFile}
                    onDelete={handleDeleteFile}
                    onTogglePublic={handleTogglePublic}
                    onEdit={handleEditFileWrapper}
                    onStar={handleStarFile}
                    onArchive={handleArchiveFile}
                    onAddComment={handleAddComment}
                    onShareWithUser={handleShareWithUser}
                  />
                ))}
              </div>
            ) : (
              <EmptyFilesState
                searchTerm={searchTerm}
                filterType={filterType}
                onUpload={() => setShowUploadModal(true)}
                colors={colors}
              />
            )}
            </div>
          </div>
        </>
      )}

      {/* Folder Management Modals */}
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

      {/* Upload Modal */}
      {activeTab === 'files' && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadFile}
        />
      )}

      {/* Floating Action Button */}
      {activeTab === 'files' && (
        <FloatingUploadButton
          onUpload={() => setShowUploadModal(true)}
          colors={colors}
        />
      )}
    </div>
  );
}