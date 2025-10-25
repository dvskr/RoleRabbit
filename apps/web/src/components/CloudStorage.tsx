'use client';

import React from 'react';
import { Cloud, Upload } from 'lucide-react';
import { CloudStorageProps } from '../types/cloudStorage';
import { useCloudStorage } from '../hooks/useCloudStorage';
import StorageHeader from './cloudStorage/StorageHeader';
import StorageFilters from './cloudStorage/StorageFilters';
import FileCard from './cloudStorage/FileCard';
import UploadModal from './cloudStorage/UploadModal';

export default function CloudStorage({ onClose }: CloudStorageProps) {
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
    handleArchiveFile
  } = useCloudStorage();

  const handleDeleteFile = (fileId: string) => {
    // For single file deletion, we can implement this directly
    console.log('Deleting file:', fileId);
    // TODO: Implement actual file deletion logic
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
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
                onDownload={handleDownloadFile}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
                onTogglePublic={handleTogglePublic}
                onEdit={handleEditFile}
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

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadFile}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Upload Files"
        >
          <Upload size={20} className="group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}