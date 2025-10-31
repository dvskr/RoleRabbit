'use client';

import React, { useMemo, useCallback } from 'react';
import { Cloud, Folder, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { FolderSidebarProps } from './types';

export const FolderSidebar: React.FC<FolderSidebarProps> = React.memo(({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  colors,
}) => {
  return (
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
          onClick={onCreateFolder}
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
            onClick={() => onSelectFolder(null)}
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
                onClick={() => onSelectFolder(folder.id)}
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
                    onRenameFolder(folder.id, folder.name);
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
                      onDeleteFolder(folder.id);
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
  );
});

FolderSidebar.displayName = 'FolderSidebar';

