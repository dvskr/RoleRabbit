'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  Trash2, 
  Trash,
  Eye, 
  Edit,
  MessageCircle,
  X,
  RotateCcw,
  Star,
  Users,
  Calendar
} from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime, formatFileSize } from '../../utils/formatters';
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
  useFileActions,
} from './fileCard/hooks';
import {
  DownloadFormatMenu,
  FileTags,
  SharedUsers,
  ShareModal,
  CommentsModal,
  InlineEdit,
  FilePreviewModal,
} from './fileCard/components';

const FileCard = React.memo(function FileCard({
  file,
  isSelected,
  viewMode,
  showDeleted,
  onSelect,
  onDownload,
  onShare,
  onDelete,
  onRestore,
  onPermanentlyDelete,
  onTogglePublic,
  onEdit,
  onStar,
  onArchive,
  onAddComment,
  onShareWithUser
}: FileCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Custom hooks for state management
  const fileSharing = useFileSharing({
    fileId: file.id,
    onShareWithUser,
  });

  const comments = useComments({
    fileId: file.id,
    onAddComment,
  });

  const { showDownloadFormat, setShowDownloadFormat } = useFileActions();
  const lastUpdatedDate = file.lastModified || file.updatedAt || file.createdAt;
  const parsedLastUpdated = lastUpdatedDate ? new Date(lastUpdatedDate) : new Date();
  const formattedDateTime = parsedLastUpdated.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const relativeUpdated = formatRelativeTime(parsedLastUpdated);
  const formattedSize = typeof file.sizeBytes === 'number'
    ? formatFileSize(file.sizeBytes)
    : (typeof file.size === 'string' ? file.size : '—');
  const compactDateLabel = parsedLastUpdated.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const actionButtonBaseStyle: React.CSSProperties = {
    color: colors.secondaryText,
    background: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    padding: '0.55rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    transition: 'all 0.2s ease',
  };

  const applyHoverStyles = (
    event: React.MouseEvent<HTMLButtonElement>,
    color: string,
    background: string,
    borderColor: string = colors.border
  ) => {
    event.currentTarget.style.color = color;
    event.currentTarget.style.background = background;
    event.currentTarget.style.borderColor = borderColor;
    event.currentTarget.style.transform = 'translateY(-1px)';
  };

  const resetHoverStyles = (
    event: React.MouseEvent<HTMLButtonElement>,
    color: string,
    background: string,
    borderColor: string = colors.border
  ) => {
    event.currentTarget.style.color = color;
    event.currentTarget.style.background = background;
    event.currentTarget.style.borderColor = borderColor;
    event.currentTarget.style.transform = 'translateY(0)';
  };

  const renderHeaderControls = () => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(file.id)}
        aria-label={`Select ${file.name}`}
        title={`Select ${file.name}`}
        className="w-4 h-4 rounded border flex-shrink-0"
        style={{
          accentColor: colors.primaryBlue,
          borderColor: colors.border,
        }}
      />
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showDeleted && file.deletedAt ? (
          <>
            <button
              onClick={() => onRestore?.(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.successGreen }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeSuccessBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Restore"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => onPermanentlyDelete?.(file.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Permanently Delete"
            >
              <Trash size={14} />
            </button>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );

  const renderGridView = () => {
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
        {/* File Info */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: colors.inputBackground,
              }}
            >
              {getFileIcon(file.type, colors)}
            </div>

            <div className="flex-1 min-w-0">
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
              
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: typeColorStyle.bg,
                    color: typeColorStyle.text,
                  }}
                >
                  {file.type}
                </span>
                {/* Version badge removed per design update */}
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
                {file.deletedAt && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    style={{
                      background: colors.badgeErrorBg,
                      color: colors.errorRed,
                    }}
                  >
                    <Trash2 size={10} />
                    Deleted
                  </span>
                )}
              </div>

              <div 
                className="flex items-center flex-wrap gap-2 text-xs mb-2"
                style={{ color: colors.secondaryText }}
              >
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formattedDateTime}</span>
                  <span className="text-[11px]" style={{ color: colors.tertiaryText }}>
                    ({relativeUpdated})
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: colors.tertiaryText }}>•</span>
                <span>{formattedSize}</span>
              </div>

              {/* Tags */}
              <FileTags tags={file.tags || []} colors={colors} />

              {/* Shared Users */}
              <SharedUsers sharedWith={file.sharedWith} colors={colors} />

              {/* Comments */}
              {file.comments && file.comments.length > 0 && (
                <div className="mt-2">
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
            </div>
            </div>
            {renderHeaderControls()}
          </div>
        </div>

        {/* Actions */}
        <div 
          className="pt-3"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-center flex-wrap gap-2 max-w-full">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="shadow-sm"
              style={{
                ...actionButtonBaseStyle,
                color: colors.primaryBlue,
                background: colors.badgeInfoBg,
                borderColor: colors.primaryBlue,
              }}
              onMouseEnter={(e) =>
                applyHoverStyles(e, colors.primaryBlue, colors.hoverBackground, colors.primaryBlue)
              }
              onMouseLeave={(e) =>
                resetHoverStyles(e, colors.primaryBlue, colors.badgeInfoBg, colors.primaryBlue)
              }
              title="Preview file"
              aria-label="Preview file"
            >
              <Eye size={18} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDownloadFormat(!showDownloadFormat)}
                style={{
                  ...actionButtonBaseStyle,
                  color: showDownloadFormat ? colors.primaryBlue : colors.secondaryText,
                  background: showDownloadFormat ? colors.hoverBackground : colors.inputBackground,
                  borderColor: showDownloadFormat ? colors.primaryBlue : colors.border,
                }}
                onMouseEnter={(e) =>
                  applyHoverStyles(e, colors.primaryBlue, colors.hoverBackground, colors.primaryBlue)
                }
                onMouseLeave={(e) =>
                  resetHoverStyles(
                    e,
                    showDownloadFormat ? colors.primaryBlue : colors.secondaryText,
                    showDownloadFormat ? colors.hoverBackground : colors.inputBackground,
                    showDownloadFormat ? colors.primaryBlue : colors.border
                  )
                }
                title="Download"
                aria-label="Download file"
              >
                <Download size={18} />
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
              style={{
                ...actionButtonBaseStyle,
                color: colors.secondaryText,
              }}
              onMouseEnter={(e) =>
                applyHoverStyles(e, colors.successGreen, colors.badgeSuccessBg, colors.successGreen)
              }
              onMouseLeave={(e) =>
                resetHoverStyles(e, colors.secondaryText, colors.inputBackground)
              }
              title="Share"
              aria-label="Share file"
            >
              <Share2 size={18} />
            </button>

            {!showDeleted && (
              <button
                onClick={() => {
                  logger.debug('Comment button clicked! Current state:', comments.showComments);
                  comments.setShowComments(!comments.showComments);
                }}
                style={{
                  ...actionButtonBaseStyle,
                  color: comments.showComments ? colors.badgePurpleText : colors.secondaryText,
                  background: comments.showComments ? colors.badgePurpleBg : colors.inputBackground,
                  borderColor: comments.showComments ? colors.badgePurpleText : colors.border,
                }}
                onMouseEnter={(e) =>
                  applyHoverStyles(e, colors.badgePurpleText, colors.badgePurpleBg, colors.badgePurpleText)
                }
                onMouseLeave={(e) =>
                  resetHoverStyles(
                    e,
                    comments.showComments ? colors.badgePurpleText : colors.secondaryText,
                    comments.showComments ? colors.badgePurpleBg : colors.inputBackground,
                    comments.showComments ? colors.badgePurpleText : colors.border
                  )
                }
                title="Comments"
                aria-label="Toggle comments"
              >
                <MessageCircle size={18} />
              </button>
            )}

            {!showDeleted && (
              <InlineEdit
                fileId={file.id}
                currentName={file.name}
                currentTags={file.tags || []}
                onSave={async (fileId, name, tags) => {
                  await onEdit(fileId, { name, tags });
                }}
                buttonStyle={actionButtonBaseStyle}
                hoverHandlers={{ applyHoverStyles, resetHoverStyles }}
              />
            )}

          {!showDeleted && (
              <button
                onClick={() => onDelete(file.id)}
                style={{
                  ...actionButtonBaseStyle,
                  color: colors.errorRed,
                  background: colors.badgeErrorBg,
                  borderColor: colors.errorRed,
                }}
                onMouseEnter={(e) =>
                  applyHoverStyles(e, '#ffffff', colors.errorRed, colors.errorRed)
                }
                onMouseLeave={(e) =>
                  resetHoverStyles(e, colors.errorRed, colors.badgeErrorBg, colors.errorRed)
                }
                title="Delete"
                aria-label="Delete file"
              >
                <Trash2 size={18} />
              </button>
            )}
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
  };

  const renderCompactView = () => {
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
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.secondaryText }}>
              <span>{compactDateLabel}</span>
              <span className="text-[11px]" style={{ color: colors.tertiaryText }}>•</span>
              <span className="truncate">{formattedSize}</span>
            </div>
          </div>
        </div>

        {renderHeaderControls()}
      </div>
    );
  };

  // List view - Enhanced version (default case)
  const renderListView = () => {
    const typeColorStyleList = getTypeColor(file.type, colors);
    return (
      <div
        className="group flex flex-col p-2 sm:p-3 rounded-lg hover:shadow-md transition-all duration-300 w-full max-w-full"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between w-full min-w-0 gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
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
                {/* Version badge removed per design update */}
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
                {file.deletedAt && (
                  <span 
                    className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                    style={{
                      background: colors.badgeErrorBg,
                      color: colors.errorRed,
                    }}
                  >
                    <Trash2 size={10} />
                    Deleted
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
                className="flex flex-wrap items-center gap-2 text-xs sm:text-sm"
                style={{ color: colors.secondaryText }}
              >
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="sm:w-3 sm:h-3" />
                  <span>{formattedDateTime}</span>
                  <span className="text-[11px]" style={{ color: colors.tertiaryText }}>
                    ({relativeUpdated})
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: colors.tertiaryText }}>•</span>
                <span>{formattedSize}</span>
                {file.sharedWith && file.sharedWith.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users size={12} className="sm:w-3 sm:h-3" />
                    <span>{file.sharedWith.length}</span>
                  </div>
                )}
                {file.comments && file.comments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageCircle size={12} className="sm:w-3 sm:h-3" />
                    <span>{file.comments.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {renderHeaderControls()}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="shadow-sm"
            style={{
              ...actionButtonBaseStyle,
              color: colors.primaryBlue,
              background: colors.badgeInfoBg,
              borderColor: colors.primaryBlue,
            }}
            onMouseEnter={(e) =>
              applyHoverStyles(e, colors.primaryBlue, colors.hoverBackground, colors.primaryBlue)
            }
            onMouseLeave={(e) =>
              resetHoverStyles(e, colors.primaryBlue, colors.badgeInfoBg, colors.primaryBlue)
            }
            title="Preview file"
          >
            <Eye size={18} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDownloadFormat(!showDownloadFormat)}
              style={{
                ...actionButtonBaseStyle,
                color: showDownloadFormat ? colors.primaryBlue : colors.secondaryText,
                background: showDownloadFormat ? colors.hoverBackground : colors.inputBackground,
                borderColor: showDownloadFormat ? colors.primaryBlue : colors.border,
              }}
              onMouseEnter={(e) =>
                applyHoverStyles(e, colors.primaryBlue, colors.hoverBackground, colors.primaryBlue)
              }
              onMouseLeave={(e) =>
                resetHoverStyles(
                  e,
                  showDownloadFormat ? colors.primaryBlue : colors.secondaryText,
                  showDownloadFormat ? colors.hoverBackground : colors.inputBackground,
                  showDownloadFormat ? colors.primaryBlue : colors.border
                )
              }
              title="Download"
            >
              <Download size={18} />
            </button>
            {showDownloadFormat && (
              <div 
                className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg z-50"
                style={{
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
                }}
              >
                <button
                  onClick={() => {
                    onDownload(file, 'pdf');
                    setShowDownloadFormat(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors rounded-t-lg flex items-center gap-2"
                  style={{ color: colors.primaryText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.color = colors.primaryBlue;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.primaryText;
                  }}
                >
                  <span>📄</span>
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    onDownload(file, 'doc');
                    setShowDownloadFormat(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors rounded-b-lg flex items-center gap-2"
                  style={{ color: colors.primaryText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.color = colors.primaryBlue;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.primaryText;
                  }}
                >
                  <span>📝</span>
                  <span>Download DOC</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => fileSharing.setShowShareModal(true)}
            style={{
              ...actionButtonBaseStyle,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) =>
              applyHoverStyles(e, colors.successGreen, colors.badgeSuccessBg, colors.successGreen)
            }
            onMouseLeave={(e) =>
              resetHoverStyles(e, colors.secondaryText, colors.inputBackground)
            }
            title="Share"
          >
            <Share2 size={18} />
          </button>

          {!showDeleted && (
            <button
              onClick={() => {
                logger.debug('Comment button clicked! Current state:', comments.showComments);
                comments.setShowComments(!comments.showComments);
              }}
              style={{
                ...actionButtonBaseStyle,
                color: comments.showComments ? colors.badgePurpleText : colors.secondaryText,
                background: comments.showComments ? colors.badgePurpleBg : colors.inputBackground,
                borderColor: comments.showComments ? colors.badgePurpleText : colors.border,
              }}
              onMouseEnter={(e) =>
                applyHoverStyles(e, colors.badgePurpleText, colors.badgePurpleBg, colors.badgePurpleText)
              }
              onMouseLeave={(e) =>
                resetHoverStyles(
                  e,
                  comments.showComments ? colors.badgePurpleText : colors.secondaryText,
                  comments.showComments ? colors.badgePurpleBg : colors.inputBackground,
                  comments.showComments ? colors.badgePurpleText : colors.border
                )
              }
              title="Comments"
            >
              <MessageCircle size={18} />
            </button>
          )}

          {!showDeleted && (
            <InlineEdit
              fileId={file.id}
              currentName={file.name}
              currentTags={file.tags || []}
              onSave={async (fileId, name, tags) => {
                await onEdit(fileId, { name, tags });
              }}
              buttonStyle={actionButtonBaseStyle}
              hoverHandlers={{ applyHoverStyles, resetHoverStyles }}
            />
          )}

          {!showDeleted && (
            <button
              onClick={() => onDelete(file.id)}
              style={{
                ...actionButtonBaseStyle,
                color: colors.errorRed,
                background: colors.badgeErrorBg,
                borderColor: colors.errorRed,
              }}
              onMouseEnter={(e) =>
                applyHoverStyles(e, '#ffffff', colors.errorRed, colors.errorRed)
              }
              onMouseLeave={(e) =>
                resetHoverStyles(e, colors.errorRed, colors.badgeErrorBg, colors.errorRed)
              }
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}

          {showDeleted && file.deletedAt && (
            <button
              onClick={() => onRestore?.(file.id)}
              style={{
                ...actionButtonBaseStyle,
                color: colors.successGreen,
                background: colors.badgeSuccessBg,
                borderColor: colors.successGreen,
              }}
              onMouseEnter={(e) =>
                applyHoverStyles(e, colors.successGreen, colors.hoverBackground, colors.successGreen)
              }
              onMouseLeave={(e) =>
                resetHoverStyles(e, colors.successGreen, colors.badgeSuccessBg, colors.successGreen)
              }
              title="Restore"
            >
              <RotateCcw size={18} />
            </button>
          )}
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
  };

  let viewContent;
  if (viewMode === 'grid') {
    viewContent = renderGridView();
  } else if (viewMode === 'compact') {
    viewContent = renderCompactView();
  } else {
    viewContent = renderListView();
  }

  return (
    <>
      {viewContent}
      <FilePreviewModal
        isOpen={showPreviewModal}
        file={file}
        onClose={() => setShowPreviewModal(false)}
        onDownload={() => onDownload(file)}
      />
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.file.id === nextProps.file.id &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.viewMode === nextProps.viewMode;
});

export default FileCard;