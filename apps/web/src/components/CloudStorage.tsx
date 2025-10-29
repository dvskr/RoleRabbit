'use client';

import React, { useState } from 'react';
import { Cloud, Upload, Folder, GraduationCap, FolderPlus, Pencil, Trash2, X } from 'lucide-react';
import { CloudStorageProps, ResumeFile } from '../types/cloudStorage';
import { useCloudStorage } from '../hooks/useCloudStorage';
import StorageHeader from './cloudStorage/StorageHeader';
import StorageFilters from './cloudStorage/StorageFilters';
import FileCard from './cloudStorage/FileCard';
import UploadModal from './cloudStorage/UploadModal';
import CredentialManager from './cloudStorage/CredentialManager';
import { logger } from '../utils/logger';
import { useTheme } from '../contexts/ThemeContext';

export default function CloudStorage({ onClose }: CloudStorageProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [activeTab, setActiveTab] = useState<'files' | 'credentials'>('files');
  
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

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Show loading state while fetching from API
  if (isLoading) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ background: colors.background }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.primaryBlue,
              borderTopColor: 'transparent',
            }}
          />
          <p style={{ color: colors.secondaryText }}>Loading files...</p>
        </div>
      </div>
    );
  }

  const handleEditFileWrapper = (fileId: string) => {
    logger.debug('Editing file:', fileId);
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const newName = prompt('Enter new file name:', file.name);
    if (newName && newName.trim() !== file.name) {
      handleEditFile(fileId, { name: newName.trim() });
      logger.debug('File renamed:', fileId, newName);
    }
  };

  const handleDownloadFileWrapper = (file: ResumeFile, format: 'pdf' | 'doc' = 'pdf') => {
    logger.debug('Downloading file:', file.name);
    
    // Create HTML content for the document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${file.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #4CAF50; margin: 0; }
    .meta { color: #666; font-size: 0.9em; }
    .section { margin-bottom: 25px; }
    .section h2 { color: #2196F3; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .tag { background: #e3f2fd; color: #1976D2; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
    .description { line-height: 1.6; color: #555; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.85em; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${file.name}</h1>
    <div class="meta">
      <p><strong>Type:</strong> ${file.type} | <strong>Size:</strong> ${file.size} | <strong>Modified:</strong> ${file.lastModified}</p>
    </div>
  </div>
  
  <div class="section">
    <h2>Description</h2>
    <p class="description">${file.description || 'No description provided'}</p>
  </div>
  
  ${file.tags.length > 0 ? `
  <div class="section">
    <h2>Tags</h2>
    <div class="tags">
      ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  </div>
  ` : ''}
  
  ${file.comments && file.comments.length > 0 ? `
  <div class="section">
    <h2>Comments (${file.comments.length})</h2>
    ${file.comments.map(comment => `
      <div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-left: 3px solid #4CAF50;">
        <strong>${comment.userName}</strong> - <em>${new Date(comment.timestamp).toLocaleDateString()}</em>
        <p style="margin-top: 5px;">${comment.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Downloaded from RoleReady Cloud Storage</p>
    <p>Status: ${file.isPublic ? 'Public' : 'Private'} | Version: ${file.version}</p>
  </div>
</body>
</html>
    `.trim();
    
    // Create blob
    const blob = new Blob([htmlContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Determine file extension based on format parameter
    const extension = format === 'pdf' ? '.pdf' : '.doc';
    
    link.download = `${file.name}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Update download count
    handleEditFile(file.id, { downloadCount: (file.downloadCount || 0) + 1 });
    logger.debug('File downloaded:', file.name);
  };

  const handleDeleteFile = (fileId: string) => {
    // For single file deletion, we can implement this directly
    logger.debug('Deleting file:', fileId);
    // TODO: Implement actual file deletion logic
  };

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
      <div 
        className="flex-shrink-0 border-b px-4 py-2.5"
        style={{ 
          borderBottom: `1px solid ${colors.border}`,
          background: colors.headerBackground,
        }}
      >
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('files')}
            className="flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === 'files' ? colors.primaryBlue : 'transparent',
              color: activeTab === 'files' ? colors.primaryBlue : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'files') {
                e.currentTarget.style.color = colors.primaryText;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'files') {
                e.currentTarget.style.color = colors.secondaryText;
              }
            }}
          >
            <Folder size={14} />
            <span className="font-medium text-sm">My Files</span>
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: activeTab === 'files' ? colors.badgeInfoBg : colors.inputBackground,
                color: activeTab === 'files' ? colors.badgeInfoText : colors.secondaryText,
              }}
            >
              {files.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className="flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === 'credentials' ? colors.primaryBlue : 'transparent',
              color: activeTab === 'credentials' ? colors.primaryBlue : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'credentials') {
                e.currentTarget.style.color = colors.primaryText;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'credentials') {
                e.currentTarget.style.color = colors.secondaryText;
              }
            }}
          >
            <GraduationCap size={14} />
            <span className="font-medium text-sm">Credentials</span>
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: activeTab === 'credentials' ? colors.badgeInfoBg : colors.inputBackground,
                color: activeTab === 'credentials' ? colors.badgeInfoText : colors.secondaryText,
              }}
            >
              {credentials.length}
            </span>
            {credentialReminders.length > 0 && (
              <span 
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  background: colors.badgeWarningBg,
                  color: colors.badgeWarningText,
                }}
              >
                {credentialReminders.length} expiring
              </span>
            )}
          </button>
        </div>
      </div>

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
            <div 
              className="w-64 border-r flex flex-col"
              style={{ 
                borderRight: `1px solid ${colors.border}`,
                background: colors.sidebarBackground,
              }}
            >
              <div 
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Folders
                </h3>
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: colors.secondaryText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Create Folder"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {/* All Files */}
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: selectedFolderId === null ? colors.badgeInfoBg : 'transparent',
                      color: selectedFolderId === null ? colors.badgeInfoText : colors.primaryText,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFolderId !== null) {
                        e.currentTarget.style.background = colors.hoverBackground;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFolderId !== null) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Cloud size={16} />
                    <span>All Files</span>
                  </button>

                  {/* Folders */}
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: selectedFolderId === folder.id ? colors.badgeInfoBg : 'transparent',
                        color: selectedFolderId === folder.id ? colors.badgeInfoText : colors.primaryText,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFolderId !== folder.id) {
                          e.currentTarget.style.background = colors.hoverBackground;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFolderId !== folder.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <Folder size={16} style={{ color: folder.color }} />
                        <span className="truncate">{folder.name}</span>
                        <span 
                          className="text-xs ml-auto"
                          style={{ color: colors.secondaryText }}
                        >
                          {folder.fileCount || 0}
                        </span>
                      </button>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToRename({ id: folder.id, name: folder.name });
                            setNewFolderName(folder.name);
                            setShowRenameFolderModal(true);
                          }}
                          className="p-1 rounded transition-colors"
                          style={{ color: colors.primaryBlue }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackground;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                          aria-label="Rename folder"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete folder "${folder.name}"? Files will be moved to All Files.`)) {
                              handleDeleteFolder(folder.id);
                            }
                          }}
                          className="p-1 rounded transition-colors"
                          style={{ color: colors.errorRed }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.badgeErrorBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                          aria-label="Delete folder"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: colors.inputBackground,
                  }}
                >
                  <Cloud size={24} style={{ color: colors.tertiaryText }} />
                </div>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.primaryText }}
                >
                  No Files Found
                </h3>
                <p 
                  className="mb-4"
                  style={{ color: colors.secondaryText }}
                >
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first file to get started'
                  }
                </p>
                {(!searchTerm && filterType === 'all') && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    aria-label="Upload files"
                  >
                    Upload Your First File
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        </>
      )}

      {/* Folder Management Modals */}
      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: colors.badgeInfoBg,
                  }}
                >
                  <FolderPlus size={24} style={{ color: colors.primaryBlue }} />
                </div>
                <div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    Create Folder
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.secondaryText }}
                  >
                    Organize your files
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close create folder modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Folder Name <span style={{ color: colors.errorRed }}>*</span>
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My Folder"
                  className="w-full px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    handleCreateFolder(newFolderName.trim());
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                  }
                }}
                disabled={!newFolderName.trim()}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !newFolderName.trim() ? colors.inputBackground : colors.primaryBlue,
                  color: !newFolderName.trim() ? colors.tertiaryText : 'white',
                  opacity: !newFolderName.trim() ? 0.5 : 1,
                  cursor: !newFolderName.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (newFolderName.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newFolderName.trim()) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && folderToRename && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: colors.badgeInfoBg,
                  }}
                >
                  <Pencil size={24} style={{ color: colors.primaryBlue }} />
                </div>
                <div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    Rename Folder
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.secondaryText }}
                  >
                    Update folder name
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRenameFolderModal(false);
                  setFolderToRename(null);
                  setNewFolderName('');
                }}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close rename folder modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Folder Name <span style={{ color: colors.errorRed }}>*</span>
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRenameFolderModal(false);
                  setFolderToRename(null);
                  setNewFolderName('');
                }}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim() && folderToRename) {
                    handleRenameFolder(folderToRename.id, newFolderName.trim());
                    setShowRenameFolderModal(false);
                    setFolderToRename(null);
                    setNewFolderName('');
                  }
                }}
                disabled={!newFolderName.trim()}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !newFolderName.trim() ? colors.inputBackground : colors.primaryBlue,
                  color: !newFolderName.trim() ? colors.tertiaryText : 'white',
                  opacity: !newFolderName.trim() ? 0.5 : 1,
                  cursor: !newFolderName.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (newFolderName.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newFolderName.trim()) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
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
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            title="Upload Files"
          >
            <Upload size={20} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      )}
    </div>
  );
}