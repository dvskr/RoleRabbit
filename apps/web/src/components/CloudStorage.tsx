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

export default function CloudStorage({ onClose }: CloudStorageProps) {
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
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
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
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors ${
              activeTab === 'files'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Folder size={14} />
            <span className="font-medium text-sm">My Files</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
              {files.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GraduationCap size={14} />
            <span className="font-medium text-sm">Credentials</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
              {credentials.length}
            </span>
            {credentialReminders.length > 0 && (
              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">
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
          {/* Fixed Header Section */}
          <div className="flex-shrink-0 p-3 pb-1">
            <StorageHeader
              storageInfo={storageInfo}
              onUpload={() => setShowUploadModal(true)}
              onRefresh={handleRefresh}
            />
          </div>

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
            <div className="w-64 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Folders</h3>
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Create Folder"
                >
                  <FolderPlus size={16} className="text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {/* All Files */}
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFolderId === null
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Cloud size={16} />
                    <span>All Files</span>
                  </button>

                  {/* Folders */}
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFolderId === folder.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <Folder size={16} style={{ color: folder.color }} />
                        <span className="truncate">{folder.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
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
                          className="p-1 hover:bg-gray-200 rounded"
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
                          className="p-1 hover:bg-red-100 rounded"
                          aria-label="Delete folder"
                        >
                          <Trash2 size={12} className="text-red-600" />
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
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Cloud size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first file to get started'
                  }
                </p>
                {(!searchTerm && filterType === 'all') && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FolderPlus size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Create Folder</h3>
                  <p className="text-sm text-gray-600">Organize your files</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close create folder modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My Folder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  !newFolderName.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && folderToRename && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Pencil size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Rename Folder</h3>
                  <p className="text-sm text-gray-600">Update folder name</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRenameFolderModal(false);
                  setFolderToRename(null);
                  setNewFolderName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close rename folder modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  !newFolderName.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
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
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            title="Upload Files"
          >
            <Upload size={20} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      )}
    </div>
  );
}