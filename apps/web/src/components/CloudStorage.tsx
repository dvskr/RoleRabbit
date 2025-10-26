'use client';

import React, { useState } from 'react';
import { Cloud, Upload, Folder, GraduationCap } from 'lucide-react';
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
    selectedFiles,
    searchTerm,
    filterType,
    sortBy,
    viewMode,
    showUploadModal,
    storageInfo,
    credentials,
    credentialReminders,
    
    // Computed
    filteredFiles,
    
    // Setters
    setSearchTerm,
    setFilterType,
    setSortBy,
    setViewMode,
    setShowUploadModal,
    
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
    handleGenerateQRCode
  } = useCloudStorage();

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
      <div className="flex-shrink-0 border-b border-gray-200 px-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'files'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Folder size={18} />
            <span className="font-medium">My Files</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
              {files.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GraduationCap size={18} />
            <span className="font-medium">Credentials</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
              {credentials.length}
            </span>
            {credentialReminders.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
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
          <div className="flex-shrink-0 p-4 pb-0">
            <StorageHeader
              storageInfo={storageInfo}
              onUpload={() => setShowUploadModal(true)}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Fixed Filters Section */}
          <div className="flex-shrink-0 px-4 py-3">
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

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredFiles.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                : 'space-y-2'
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
                  >
                    Upload Your First File
                  </button>
                )}
              </div>
            )}
          </div>
        </>
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