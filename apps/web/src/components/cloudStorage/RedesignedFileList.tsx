'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { Filter, Upload, Trash2, Search } from 'lucide-react';
import { ResumeFile, FileType, SortBy } from '../../types/cloudStorage';
import FileCard from './FileCard';
import { EmptyFilesState } from './EmptyFilesState';
import { useTheme } from '../../contexts/ThemeContext';
import { TabType } from './types';

interface FilesTabsBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  filesCount: number;
  credentialsCount: number;
  onUpload: () => void;
  colors?: any;
  showDeleted?: boolean;
}

export const FilesTabsBar: React.FC<FilesTabsBarProps> = ({
  activeTab,
  onTabChange,
  filesCount,
  credentialsCount,
  onUpload,
  colors,
  showDeleted = false, // Default to false
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  const tabs = [
    { key: 'files' as TabType, label: 'My Files', count: filesCount },
    { key: 'credentials' as TabType, label: 'Credentials', count: credentialsCount },
  ];

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ borderBottom: `1px solid ${palette.border}` }}
    >
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-colors"
            style={{
              borderBottomColor:
                activeTab === tab.key ? palette.primaryBlue : 'transparent',
              color: activeTab === tab.key ? palette.primaryBlue : palette.secondaryText,
            }}
          >
            <span>{tab.label}</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background:
                  activeTab === tab.key ? palette.badgeInfoBg : palette.inputBackground,
                color:
                  activeTab === tab.key ? palette.primaryBlue : palette.secondaryText,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {!showDeleted && (
        <button
          onClick={onUpload}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-transform"
          style={{
            background: palette.primaryBlue,
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(64, 87, 255, 0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Upload size={16} />
          <span>Upload File</span>
        </button>
      )}
    </div>
  );
};

interface RedesignedFileListProps {
  files: ResumeFile[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: FileType;
  setFilterType: (type: FileType) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  selectedFiles: string[];
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onFileSelect: (fileId: string) => void;
  onDownload: (file: ResumeFile, format?: 'pdf' | 'doc') => void;
  onShare: (file: ResumeFile) => void;
  onDelete: (fileId: string) => void;
  onRestore: (fileId: string) => void;
  onPermanentlyDelete: (fileId: string) => void;
  onEdit: (fileId: string) => void;
  onStar: (fileId: string) => void;
  onArchive: (fileId: string) => void;
  onAddComment: (fileId: string, comment: string) => void;
  onShareWithUser: (fileId: string, email: string, permission: string, expiresAt?: string, maxDownloads?: number) => void | Promise<void>;
  onRemoveShare?: (fileId: string, shareId: string) => void | Promise<void>;
  onMove?: (fileId: string, folderId: string | null) => void | Promise<void>;
  folders?: Array<{ id: string; name: string; color?: string }>;
  showDeleted: boolean;
  colors?: any;
  onUpload: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  filesCount: number;
  credentialsCount: number;
}

export const RedesignedFileList: React.FC<RedesignedFileListProps> = ({
  files,
  searchTerm,
  onSearchChange,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
  selectedFiles,
  onSelectAll,
  onDeleteSelected,
  onFileSelect,
  onDownload,
  onShare,
  onDelete,
  onRestore,
  onPermanentlyDelete,
  onEdit,
  onStar,
  onArchive,
  onAddComment,
  onShareWithUser,
  onRemoveShare,
  onMove,
  folders = [],
  showDeleted,
  colors,
  onUpload,
  activeTab,
  onTabChange,
  filesCount,
  credentialsCount,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  const hasSelection = selectedFiles.length > 0;
  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < files.length;
  const checkboxRef = useRef<HTMLInputElement>(null);
  
  // Set indeterminate state when some files are selected
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);
  
  // Removed viewMode - only grid view is used

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const content = useMemo(() => {
    if (files.length === 0) {
      return (
        <EmptyFilesState
          searchTerm={searchTerm}
          filterType={filterType}
          onUpload={showDeleted ? undefined : onUpload}
          colors={palette}
          showDeleted={showDeleted}
        />
      );
    }

    return (
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={selectedFiles.includes(file.id)}
            showDeleted={showDeleted}
            onSelect={onFileSelect}
            onDownload={onDownload}
            onShare={onShare}
            onDelete={onDelete}
            onRestore={onRestore}
            onPermanentlyDelete={onPermanentlyDelete}
            onEdit={onEdit}
            onStar={onStar}
            onArchive={onArchive}
            onAddComment={onAddComment}
            onShareWithUser={onShareWithUser}
            onRemoveShare={onRemoveShare}
            onMove={onMove}
            folders={folders}
          />
        ))}
      </div>
    );
  }, [
    files,
    filterType,
    onAddComment,
    onDelete,
    onDownload,
    onEdit,
    onFileSelect,
    onPermanentlyDelete,
    onRestore,
    onShare,
    onShareWithUser,
    onStar,
    selectedFiles,
    showDeleted,
    palette,
    searchTerm,
    onUpload,
    onArchive,
  ]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <FilesTabsBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        filesCount={filesCount}
        credentialsCount={credentialsCount}
        onUpload={onUpload}
        colors={palette}
        showDeleted={showDeleted}
      />

      <div
        className="px-6 py-4 border-b flex flex-wrap items-center gap-3"
        style={{ borderBottom: `1px solid ${palette.border}`, background: palette.cardBackground }}
      >
        {/* Select All Checkbox */}
        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
              style={{
                accentColor: palette.primaryBlue,
                cursor: 'pointer',
              }}
              title={allSelected ? 'Deselect all' : 'Select all'}
              aria-label={allSelected ? 'Deselect all files' : 'Select all files'}
            />
            <label
              className="text-sm cursor-pointer select-none"
              style={{ color: palette.secondaryText }}
              onClick={onSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </label>
          </div>
        )}

        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: palette.tertiaryText }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search files..."
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              background: palette.inputBackground,
              border: `1px solid ${palette.border}`,
              color: palette.primaryText,
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Filter size={15} style={{ color: palette.secondaryText }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FileType)}
              className="px-3 py-2 rounded-lg bg-transparent text-sm"
              style={{
                background: palette.inputBackground,
                border: `1px solid ${palette.border}`,
                color: palette.primaryText,
              }}
            >
              <option value="all">All Files</option>
              <option value="resume">Resumes</option>
              <option value="template">Templates</option>
              <option value="backup">Backups</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: palette.inputBackground,
              border: `1px solid ${palette.border}`,
              color: palette.primaryText,
            }}
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>

        </div>

        {hasSelection && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{
              background: `${palette.badgeErrorBg}`,
              color: palette.errorRed,
            }}
          >
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: palette.errorRed }}
            >
              <Trash2 size={16} />
              Delete {selectedFiles.length > 1 ? `${selectedFiles.length} files` : 'file'}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background: palette.cardBackground }}>
        {content}
      </div>
    </div>
  );
};

export default RedesignedFileList;
