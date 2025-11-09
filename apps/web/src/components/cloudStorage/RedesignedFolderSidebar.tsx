'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Folder,
  FolderPlus,
  FolderTree,
  Trash2,
  Star,
  Clock,
  Share2,
  Archive,
  Pencil,
  Trash,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { StorageInfo } from '../../types/cloudStorage';

interface SidebarFolder {
  id: string;
  name: string;
  color?: string;
  fileCount?: number;
}

interface QuickFilters {
  starred?: boolean;
  archived?: boolean;
  shared?: boolean;
  recent?: boolean;
}

interface RedesignedFolderSidebarProps {
  folders: SidebarFolder[];
  selectedFolderId: string | null;
  showDeleted: boolean;
  deletedFilesCount: number;
  storageInfo: StorageInfo;
  quickFilters: QuickFilters;
  onSelectFolder: (folderId: string | null) => void;
  onToggleRecycleBin: () => void;
  onCreateFolder: () => void;
  onRenameFolder: (folderId: string, folderName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  setQuickFilters: (filters: QuickFilters) => void;
  colors?: any;
  totalFilesCount?: number; // Total count of active files
}

const QUICK_FILTERS = [
  { key: 'starred' as const, label: 'Starred', icon: Star },
  { key: 'recent' as const, label: 'Recent', icon: Clock },
  { key: 'shared' as const, label: 'Shared', icon: Share2 },
  { key: 'archived' as const, label: 'Archived', icon: Archive },
];

const STORAGE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

const formatBytes = (bytes?: number): string => {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const base = 1024;
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), STORAGE_UNITS.length - 1);
  const value = bytes / Math.pow(base, index);
  const hasFraction = value % 1 !== 0;
  const precision = hasFraction ? (value >= 10 ? 1 : 2) : 0;

  return `${value.toFixed(precision)} ${STORAGE_UNITS[index]}`;
};

export const RedesignedFolderSidebar: React.FC<RedesignedFolderSidebarProps> = ({
  folders,
  selectedFolderId,
  showDeleted,
  deletedFilesCount,
  storageInfo,
  quickFilters,
  onSelectFolder,
  onToggleRecycleBin,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  setQuickFilters,
  colors,
  totalFilesCount: passedFilesCount,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  // Use passed totalFilesCount if available, otherwise calculate from folders
  const totalFilesCount = passedFilesCount !== undefined 
    ? passedFilesCount 
    : folders.reduce((sum, folder) => sum + (folder.fileCount || 0), 0);

  const toggleFilter = useCallback(
    (key: keyof QuickFilters) => {
      // If clicking the same filter that's already active, turn it off
      if (quickFilters[key]) {
        setQuickFilters({});
      } else {
        // Otherwise, clear all filters and activate only this one
        setQuickFilters({ [key]: true });
      }
    },
    [quickFilters, setQuickFilters]
  );

  const safeStorageInfo = storageInfo || {
    used: 0,
    limit: 0,
    percentage: 0,
    usedBytes: 0,
    limitBytes: 0,
  };

  const storagePercentage = Number.isFinite(safeStorageInfo.percentage)
    ? Math.min(Math.max(safeStorageInfo.percentage, 0), 100)
    : 0;

  const storagePercentageDisplay = useMemo(() => {
    if (storagePercentage >= 1) {
      return storagePercentage.toFixed(0);
    }
    if (storagePercentage > 0) {
      return storagePercentage.toFixed(2);
    }
    return '0';
  }, [storagePercentage]);

  const progressWidth = storagePercentage > 0 && storagePercentage < 1 ? 1 : storagePercentage;

  const usedStorageLabel = useMemo(() => {
    if (safeStorageInfo.usedBytes && safeStorageInfo.usedBytes > 0) {
      return formatBytes(safeStorageInfo.usedBytes);
    }
    if (Number.isFinite(safeStorageInfo.used) && safeStorageInfo.used > 0) {
      return `${safeStorageInfo.used.toFixed(safeStorageInfo.used >= 10 ? 1 : 2)} GB`;
    }
    return '0 B';
  }, [safeStorageInfo]);

  const limitStorageLabel = useMemo(() => {
    if (safeStorageInfo.limitBytes && safeStorageInfo.limitBytes > 0) {
      return formatBytes(safeStorageInfo.limitBytes);
    }
    if (Number.isFinite(safeStorageInfo.limit) && safeStorageInfo.limit > 0) {
      return `${safeStorageInfo.limit.toFixed(safeStorageInfo.limit >= 10 ? 1 : 2)} GB`;
    }
    return 'Unlimited';
  }, [safeStorageInfo]);

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col rounded-2xl p-4 gap-4 overflow-hidden min-h-0"
      style={{
        background: palette.cardBackground,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: palette.badgeInfoBg,
              color: palette.primaryBlue,
            }}
          >
            <FolderTree size={16} />
          </div>
          <span className="text-sm font-semibold" style={{ color: palette.primaryText }}>
            Folders
          </span>
        </div>
        <button
          onClick={onCreateFolder}
          className="p-2 rounded-lg transition-all"
          style={{
            color: palette.primaryBlue,
            background: `${palette.primaryBlue}15`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          aria-label="Create folder"
        >
          <FolderPlus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="space-y-1">
          <button
            onClick={() => onSelectFolder(null)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                selectedFolderId === null && !showDeleted
                  ? `${palette.primaryBlue}22`
                  : 'transparent',
              color:
                selectedFolderId === null && !showDeleted
                  ? palette.primaryBlue
                  : palette.primaryText,
            }}
          >
            <Folder size={16} />
            <span className="flex-1 text-left">All Files</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: palette.inputBackground,
                color: palette.secondaryText,
              }}
            >
              {totalFilesCount}
            </span>
          </button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className="group relative"
            >
              <button
                onClick={() => onSelectFolder(folder.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background:
                  selectedFolderId === folder.id
                    ? `${palette.primaryBlue}22`
                    : 'transparent',
                color:
                  selectedFolderId === folder.id
                    ? palette.primaryBlue
                    : palette.primaryText,
              }}
              >
                <Folder size={16} style={{ color: folder.color || palette.primaryBlue }} />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onRenameFolder(folder.id, folder.name);
                  }}
                    className="p-1 rounded-md transition-opacity"
                  style={{ color: palette.primaryBlue, background: `${palette.primaryBlue}10` }}
                  aria-label="Rename folder"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${palette.primaryBlue}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${palette.primaryBlue}10`;
                    }}
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    if (confirm(`Delete folder "${folder.name}"? Files will remain in All Files.`)) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                    className="p-1 rounded-md transition-opacity"
                  style={{ color: palette.errorRed, background: `${palette.errorRed}10` }}
                  aria-label="Delete folder"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${palette.errorRed}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${palette.errorRed}10`;
                    }}
                >
                  <Trash size={12} />
                </button>
              </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: palette.inputBackground,
                    color: palette.secondaryText,
                  }}
                >
                  {folder.fileCount || 0}
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="pt-1">
          <button
            onClick={onToggleRecycleBin}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: showDeleted ? `${palette.errorRed}15` : 'transparent',
              color: showDeleted ? palette.errorRed : palette.primaryText,
            }}
          >
            <Trash2 size={16} />
            <span className="flex-1 text-left">Recycle Bin</span>
            {deletedFilesCount > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${palette.errorRed}20`,
                  color: palette.errorRed,
                }}
              >
                {deletedFilesCount}
              </span>
            )}
          </button>
        </div>

        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: palette.inputBackground,
            border: `1px solid ${palette.border}`,
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span style={{ color: palette.secondaryText }}>Storage</span>
            <span style={{ color: palette.successGreen }}>{storagePercentageDisplay}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: palette.cardBackground }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressWidth}%`,
                background: palette.successGreen,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs"
            style={{ color: palette.secondaryText }}
          >
            <span>{usedStorageLabel}</span>
            <span> / {limitStorageLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pb-1">
          <span className="text-xs font-semibold uppercase" style={{ color: palette.secondaryText }}>
            Quick Filters
          </span>
          <div className="space-y-2">
            {QUICK_FILTERS.map(({ key, label, icon: Icon }) => {
              const isActive = Boolean(quickFilters[key]);
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: isActive ? `${palette.primaryBlue}22` : palette.cardBackground,
                    color: isActive ? palette.primaryBlue : palette.primaryText,
                    border: `1px solid ${isActive ? palette.primaryBlue : palette.border}`,
                  }}
                >
                  <Icon size={14} />
                  <span className="flex-1 text-left">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RedesignedFolderSidebar;
