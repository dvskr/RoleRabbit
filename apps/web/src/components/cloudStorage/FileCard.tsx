'use client';

import React from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Edit, 
  MoreVertical,
  Calendar,
  Tag,
  Copy,
  Star,
  Archive,
  MessageCircle,
  TrendingUp,
  UserPlus,
  X,
  Users
} from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';
import { FileCardProps, SharePermission, DownloadFormat } from './fileCard/types';
import {
  MODAL_OVERLAY_STYLE,
  SHARE_MODAL,
  SHARE_PERMISSIONS,
  COMMENTS,
  DOWNLOAD_FORMATS,
  MORE_MENU_OPTIONS,
  FILE_ACTIONS,
} from './fileCard/constants';
import {
  getFileIcon,
  getTypeColor,
  getPermissionColor,
} from './fileCard/fileCardHelpers';
import {
  useFileSharing,
  useComments,
  useMoreMenu,
  useFileActions,
} from './fileCard/hooks';
import {
  FileActionsMenu,
  DownloadFormatMenu,
  FileTags,
  SharedUsers,
  ShareModal,
  CommentsModal,
} from './fileCard/components';

const FileCard = React.memo(function FileCard({
  file,
  isSelected,
  viewMode,
  onSelect,
  onDownload,
  onShare,
  onDelete,
  onTogglePublic,
  onEdit,
  onStar,
  onArchive,
  onAddComment,
  onShareWithUser
}: FileCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Custom hooks for state management
  const fileSharing = useFileSharing({
    fileId: file.id,
    onShareWithUser,
  });

  const comments = useComments({
    fileId: file.id,
    onAddComment,
  });

  const { showMoreMenu, setShowMoreMenu, moreMenuRef } = useMoreMenu();
  const { showDownloadFormat, setShowDownloadFormat } = useFileActions();

  if (viewMode === 'grid') {
    const typeColorStyle = getTypeColor(file.type, colors);
    return (
      <div 
        className="group rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer"
        style={{
          border: `1px solid ${isSelected ? colors.primaryBlue : colors.border}`,
          background: isSelected ? colors.badgeInfoBg : colors.cardBackground,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = colors.borderFocused;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = colors.border;
          }
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(file.id)}
              aria-label={`Select ${file.name}`}
              title={`Select ${file.name}`}
              className="w-3.5 h-3.5 rounded focus:ring-2 transition-all"
              style={{
                accentColor: colors.primaryBlue,
                borderColor: colors.border,
              }}
            />
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: colors.inputBackground,
              }}
            >
              {getFileIcon(file.type, colors)}
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onStar(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: file.isStarred ? colors.badgeWarningText : colors.tertiaryText,
                background: file.isStarred ? colors.badgeWarningBg : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!file.isStarred) {
                  e.currentTarget.style.color = colors.badgeWarningText;
                  e.currentTarget.style.background = colors.badgeWarningBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!file.isStarred) {
                  e.currentTarget.style.color = colors.tertiaryText;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              <Star size={14} className={file.isStarred ? 'fill-current' : ''} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryText;
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.tertiaryText;
                  e.currentTarget.style.background = 'transparent';
                }}
                title="More options"
              >
                <MoreVertical size={14} />
              </button>
              {showMoreMenu && (
                <FileActionsMenu
                  fileId={file.id}
                  colors={colors}
                  moreMenuRef={moreMenuRef}
                  onClose={() => setShowMoreMenu(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* File Info */}
        <div className="mb-2">
          <h3 
            className="font-semibold text-sm mb-1 truncate transition-colors"
            style={{ color: colors.primaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.primaryText;
            }}
          >
            {file.name}
          </h3>
          {file.description && (
            <p 
              className="text-xs mb-1.5 line-clamp-2"
              style={{ color: colors.secondaryText }}
            >
              {file.description}
            </p>
          )}
          
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: typeColorStyle.bg,
                color: typeColorStyle.text,
              }}
            >
              {file.type}
            </span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              v{file.version}
            </span>
            {file.isArchived && (
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: colors.badgeWarningBg,
                  color: colors.badgeWarningText,
                }}
              >
                Archived
              </span>
            )}
          </div>

          <div 
            className="flex items-center space-x-3 text-[10px] mb-1"
            style={{ color: colors.secondaryText }}
          >
            <div className="flex items-center space-x-0.5">
              <Calendar size={10} />
              <span>{file.lastModified}</span>
            </div>
            <span>{file.size}</span>
          </div>

          {/* Stats */}
          <div 
            className="flex items-center space-x-3 text-[10px]"
            style={{ color: colors.secondaryText }}
          >
            <div className="flex items-center space-x-0.5">
              <TrendingUp size={10} />
              <span>{file.viewCount} views</span>
            </div>
            <div className="flex items-center space-x-0.5">
              <Download size={10} />
              <span>{file.downloadCount} downloads</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <FileTags tags={file.tags} colors={colors} />

        {/* Shared Users */}
        <SharedUsers sharedWith={file.sharedWith} colors={colors} />

        {/* Comments */}
        {file.comments.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center space-x-1.5">
              <MessageCircle size={12} style={{ color: colors.tertiaryText }} />
              <span 
                className="text-xs"
                style={{ color: colors.secondaryText }}
              >
                {file.comments.length} comment{file.comments.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div 
          className="pt-2"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-center flex-wrap gap-1 max-w-full">
            <button
              onClick={() => onTogglePublic(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: file.isPublic ? colors.successGreen : colors.tertiaryText,
                background: file.isPublic ? colors.badgeSuccessBg : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!file.isPublic) {
                  e.currentTarget.style.color = colors.primaryText;
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (!file.isPublic) {
                  e.currentTarget.style.color = colors.tertiaryText;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title={file.isPublic ? 'Make private' : 'Make public'}
            >
              {file.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDownloadFormat(!showDownloadFormat)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.secondaryText;
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Download"
              >
                <Download size={12} />
              </button>
              {showDownloadFormat && (
                <DownloadFormatMenu
                  colors={colors}
                  onDownload={(format) => onDownload(file, format)}
                  onClose={() => setShowDownloadFormat(false)}
                />
              )}
            </div>
            <button
              onClick={() => fileSharing.setShowShareModal(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.successGreen;
                e.currentTarget.style.background = colors.badgeSuccessBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.background = 'transparent';
              }}
              title="Share"
            >
              <Share2 size={12} />
            </button>
            <button
              onClick={() => {
                  logger.debug('Comment button clicked! Current state:', comments.showComments);
                  comments.setShowComments(!comments.showComments);
              }}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: comments.showComments ? colors.badgePurpleText : colors.secondaryText,
                background: comments.showComments ? colors.badgePurpleBg : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!comments.showComments) {
                  e.currentTarget.style.color = colors.badgePurpleText;
                  e.currentTarget.style.background = colors.badgePurpleBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!comments.showComments) {
                  e.currentTarget.style.color = colors.secondaryText;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title="Comments"
            >
              <MessageCircle size={12} />
            </button>
            <button
              onClick={() => onEdit(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.primaryText;
                e.currentTarget.style.background = colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.background = 'transparent';
              }}
              title="Edit"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={() => onArchive(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.badgeWarningText;
                e.currentTarget.style.background = colors.badgeWarningBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.background = 'transparent';
              }}
              title={file.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive size={12} />
            </button>
            <button
              onClick={() => onDelete(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.errorRed;
                e.currentTarget.style.background = colors.badgeErrorBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsModal
          comments={file.comments}
          colors={colors}
          commentsState={comments}
        />
      </div>
    );
  }

  // Compact view - Dense table-like layout
  if (viewMode === 'compact') {
    const typeColorStyleCompact = getTypeColor(file.type, colors);
    return (
      <div 
        className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-opacity-50 transition-all"
        style={{
          background: isSelected ? colors.badgeInfoBg : 'transparent',
          border: `1px solid ${isSelected ? colors.primaryBlue : 'transparent'}`,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = isSelected ? colors.badgeInfoBg : 'transparent';
          }
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          aria-label={`Select ${file.name}`}
          title={`Select ${file.name}`}
          className="w-3.5 h-3.5 rounded flex-shrink-0"
          style={{
            accentColor: colors.primaryBlue,
            borderColor: colors.border,
          }}
        />
        
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          {getFileIcon(file.type, colors)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              className="font-medium truncate text-sm"
              style={{ color: colors.primaryText }}
            >
              {file.name}
            </span>
            <span 
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: typeColorStyleCompact.bg,
                color: typeColorStyleCompact.text,
              }}
            >
              {file.type}
            </span>
            {file.isStarred && (
              <Star size={12} style={{ color: colors.badgeWarningText }} className="fill-current flex-shrink-0" />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs flex-shrink-0" style={{ color: colors.secondaryText }}>
          <span className="truncate">{file.size}</span>
          <span className="truncate">{file.lastModified}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex-wrap">
          <button
            onClick={() => onDownload(file)}
            className="p-1.5 rounded transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryBlue;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            title="Download"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => fileSharing.setShowShareModal(true)}
            className="p-1.5 rounded transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.successGreen;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            title="Share"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  // List view - Enhanced version
    const typeColorStyleList = getTypeColor(file.type, colors);
  return (
    <div 
      className="group flex flex-col p-2 sm:p-3 rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden w-full max-w-full"
      style={{
        border: `1px solid ${isSelected ? colors.primaryBlue : colors.border}`,
        background: isSelected ? colors.badgeInfoBg : colors.cardBackground,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = colors.borderFocused;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full min-w-0 gap-2 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0 w-full sm:w-auto">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          aria-label={`Select ${file.name}`}
          title={`Select ${file.name}`}
          className="w-4 h-4 rounded focus:ring-2 flex-shrink-0 transition-all"
          style={{
            accentColor: colors.primaryBlue,
            borderColor: colors.border,
          }}
        />
        
        <div 
          className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: colors.inputBackground,
          }}
        >
          {getFileIcon(file.type, colors)}
        </div>

        <div className="flex-1 min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:space-x-3 mb-1">
            <h3 
              className="font-semibold truncate transition-colors text-sm sm:text-base"
              style={{ color: colors.primaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.primaryBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.primaryText;
              }}
              title={file.name}
            >
              {file.name}
            </h3>
            <span 
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium"
              style={{
                background: typeColorStyleList.bg,
                color: typeColorStyleList.text,
              }}
            >
              {file.type}
            </span>
            <span 
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              v{file.version}
            </span>
            {file.isStarred && (
              <Star size={12} className="sm:w-4 sm:h-4 fill-current" style={{ color: colors.badgeWarningText }} />
            )}
            {file.isArchived && (
              <span 
                className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                style={{
                  background: colors.badgeWarningBg,
                  color: colors.badgeWarningText,
                }}
              >
                Archived
              </span>
            )}
          </div>
          
          {file.description && (
            <p 
              className="text-xs sm:text-sm mb-2 line-clamp-1 truncate"
              style={{ color: colors.secondaryText }}
              title={file.description}
            >
              {file.description}
            </p>
          )}
          
          <div 
            className="flex flex-wrap items-center gap-2 sm:space-x-4 text-xs sm:text-sm"
            style={{ color: colors.secondaryText }}
          >
            <div className="flex items-center space-x-1">
              <Calendar size={10} className="sm:w-3 sm:h-3" />
              <span className="truncate">{file.lastModified}</span>
            </div>
            <span className="truncate">{file.size}</span>
            <div className="flex items-center space-x-1">
              <TrendingUp size={10} className="sm:w-3 sm:h-3" />
              <span>{file.viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download size={10} className="sm:w-3 sm:h-3" />
              <span>{file.downloadCount}</span>
            </div>
            {file.sharedWith.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users size={10} className="sm:w-3 sm:h-3" />
                <span>{file.sharedWith.length}</span>
              </div>
            )}
            {file.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle size={10} className="sm:w-3 sm:h-3" />
                <span>{file.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0 ml-0 sm:ml-2 flex-wrap gap-1 sm:gap-0">
        <button
          onClick={() => onStar(file.id)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            color: file.isStarred ? colors.badgeWarningText : colors.tertiaryText,
            background: file.isStarred ? colors.badgeWarningBg : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!file.isStarred) {
              e.currentTarget.style.color = colors.badgeWarningText;
              e.currentTarget.style.background = colors.badgeWarningBg;
            }
          }}
          onMouseLeave={(e) => {
            if (!file.isStarred) {
              e.currentTarget.style.color = colors.tertiaryText;
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
        >
          <Star size={16} className={file.isStarred ? 'fill-current' : ''} />
        </button>
        <button
          onClick={() => onTogglePublic(file.id)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            color: file.isPublic ? colors.successGreen : colors.tertiaryText,
            background: file.isPublic ? colors.badgeSuccessBg : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!file.isPublic) {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }
          }}
          onMouseLeave={(e) => {
            if (!file.isPublic) {
              e.currentTarget.style.color = colors.tertiaryText;
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title={file.isPublic ? 'Make private' : 'Make public'}
        >
          {file.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDownloadFormat(!showDownloadFormat)}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryBlue;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            title="Download"
          >
            <Download size={16} />
          </button>
          {showDownloadFormat && (
            <div 
              className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg z-10"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <button
                onClick={() => {
                  onDownload(file, 'pdf');
                  setShowDownloadFormat(false);
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors rounded-t-lg"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.primaryText;
                }}
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => {
                  onDownload(file, 'doc');
                  setShowDownloadFormat(false);
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors rounded-b-lg"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.primaryText;
                }}
              >
                📝 Download DOC
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => fileSharing.setShowShareModal(true)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: colors.secondaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.successGreen;
            e.currentTarget.style.background = colors.badgeSuccessBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.background = 'transparent';
          }}
          title="Share"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={() => {
            logger.debug('Comment button clicked (list view)! Current state:', comments.showComments);
            comments.setShowComments(!comments.showComments);
          }}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            color: comments.showComments ? colors.badgePurpleText : colors.secondaryText,
            background: comments.showComments ? colors.badgePurpleBg : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!comments.showComments) {
              e.currentTarget.style.color = colors.badgePurpleText;
              e.currentTarget.style.background = colors.badgePurpleBg;
            }
          }}
          onMouseLeave={(e) => {
            if (!comments.showComments) {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title="Comments"
        >
          <MessageCircle size={16} />
        </button>
        <button
          onClick={() => onEdit(file.id)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: colors.secondaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primaryText;
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.background = 'transparent';
          }}
          title="Edit"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onArchive(file.id)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: colors.secondaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.badgeWarningText;
            e.currentTarget.style.background = colors.badgeWarningBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.background = 'transparent';
          }}
          title={file.isArchived ? 'Unarchive' : 'Archive'}
        >
          <Archive size={16} />
        </button>
        <button
          onClick={() => onDelete(file.id)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: colors.secondaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.errorRed;
            e.currentTarget.style.background = colors.badgeErrorBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.background = 'transparent';
          }}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            title="More options"
          >
            <MoreVertical size={16} />
          </button>
          {showMoreMenu && (
            <div 
              ref={moreMenuRef} 
              className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg z-20"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(file.id);
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors rounded-t-lg flex items-center space-x-2"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.primaryText;
                }}
              >
                <Copy size={14} />
                <span>Copy ID</span>
              </button>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.primaryText;
                }}
              >
                <Calendar size={14} />
                <span>View History</span>
              </button>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.primaryText;
                }}
              >
                <Tag size={14} />
                <span>Manage Tags</span>
              </button>
              <div style={{ borderTop: `1px solid ${colors.border}` }}></div>
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors rounded-b-lg flex items-center space-x-2"
                style={{
                  color: colors.errorRed,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeErrorBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Trash2 size={14} />
                <span>Delete Permanently</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Comments Section - List View */}
      <CommentsModal
        comments={file.comments}
        colors={colors}
        commentsState={comments}
      />

      {/* Share Modal */}
      <ShareModal
        file={file}
        colors={colors}
        theme={theme}
        fileSharing={fileSharing}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.file.id === nextProps.file.id &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.viewMode === nextProps.viewMode;
});

export default FileCard;