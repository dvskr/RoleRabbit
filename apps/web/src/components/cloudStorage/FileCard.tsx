'use client';

import React, { useState, useEffect } from 'react';
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
  Calendar,
  Check,
  Copy,
  FolderMove
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
  SharedUsers,
  ShareModal,
  CommentsModal,
  FilePreviewModal,
} from './fileCard/components';

const FILE_TYPE_OPTIONS: ResumeFile['type'][] = [
  'resume',
  'template',
  'backup',
  'cover_letter',
  'transcript',
  'certification',
  'reference',
  'portfolio',
  'work_sample',
  'document',
];

const formatTypeLabel = (type: ResumeFile['type']) =>
  type
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const FileCard = React.memo(function FileCard({
  file,
  isSelected,
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
  onShareWithUser,
  onRemoveShare,
  onCopy,
  onMove
}: FileCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(file.name);
  const [editingType, setEditingType] = useState<ResumeFile['type']>(file.type as ResumeFile['type']);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom hooks for state management
  const fileSharing = useFileSharing({
    fileId: file.id,
    onShareWithUser,
  });

  // Use file.comments directly - they're already loaded from API
  const comments = useComments({
    fileId: file.id,
    onAddComment,
    initialComments: file.comments || [], // Comments are already in file data from API
    onCommentsLoaded: (loadedComments) => {
      // Only called if we had to load comments (no initial comments)
      logger.debug('Comments loaded for file:', file.id, 'count:', loadedComments.length);
    },
  });

  const { showDownloadFormat, setShowDownloadFormat } = useFileActions();
  
  // Sync editing state with file changes (only when not editing)
  useEffect(() => {
    if (!isEditing) {
      setEditingName(file.name);
      setEditingType(file.type as ResumeFile['type']);
    }
  }, [file.name, file.type, isEditing]);
  
  // Edit handlers
  const handleStartEdit = () => {
    if (isEditing) {
      // Toggle off edit mode if already editing
      handleCancelEdit();
    } else {
      // Start edit mode
      setEditingName(file.name);
      setEditingType(file.type as ResumeFile['type']);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingName(file.name);
    setEditingType(file.type as ResumeFile['type']);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      return;
    }

    setIsSaving(true);
    try {
      await onEdit(file.id, { name: trimmedName, type: editingType });
      // After successful save, the file prop will be updated by the parent
      // Wait a bit for the update to propagate, then exit edit mode
      setTimeout(() => {
        setIsEditing(false);
      }, 100);
    } catch (error) {
      logger.error('Failed to save edit:', error);
      // Keep editing mode on error so user can retry
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="flex items-center gap-2 flex-shrink-0">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(file.id)}
        aria-label={`Select ${file.name}`}
        title={`Select ${file.name}`}
        className="w-4 h-4 rounded border flex-shrink-0 cursor-pointer"
        style={{
          accentColor: colors.primaryBlue,
          borderColor: colors.border,
          marginTop: '2px', // Align with content
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
        className="group rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
        style={{
          border: `1.5px solid ${isSelected ? colors.primaryBlue : colors.border}`,
          background: isSelected ? colors.badgeInfoBg : colors.cardBackground,
          boxShadow: isSelected ? `0 4px 12px ${colors.primaryBlue}20` : 'none',
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
        <div className="mb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${colors.inputBackground} 0%, ${colors.hoverBackground} 100%)`,
              }}
            >
              {getFileIcon(file.type, colors)}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  className="font-semibold text-base w-full px-2 py-1 rounded-lg focus:outline-none"
                  style={{
                    color: colors.primaryText,
                    background: colors.inputBackground,
                    border: `2px solid ${colors.primaryBlue}`,
                  }}
                  autoFocus
                  disabled={isSaving}
                />
              ) : (
                <h3 
                  className="font-semibold text-base truncate transition-colors leading-tight"
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
              )}
              {file.description && (
                <p 
                  className="text-xs line-clamp-2 leading-relaxed"
                  style={{ color: colors.secondaryText }}
                >
                  {file.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {isEditing ? (
                  <select
                    value={editingType}
                    onChange={(e) => setEditingType(e.target.value as ResumeFile['type'])}
                    className="text-xs px-2 py-1 rounded focus:outline-none"
                    style={{
                      background: colors.inputBackground,
                      color: colors.primaryText,
                      border: `1px solid ${colors.primaryBlue}`,
                    }}
                  >
                    {FILE_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatTypeLabel(option)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: typeColorStyle.bg,
                      color: typeColorStyle.text,
                    }}
                  >
                    {formatTypeLabel(file.type as ResumeFile['type'])}
                  </span>
                )}
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
                className="flex items-center flex-wrap gap-2 text-xs pt-0.5"
                style={{ color: colors.secondaryText }}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span className="font-medium">{formattedDateTime}</span>
                  <span className="text-[10px]" style={{ color: colors.tertiaryText }}>
                    ({relativeUpdated})
                  </span>
                </div>
                <span className="text-[10px]" style={{ color: colors.tertiaryText }}>•</span>
                <span className="font-medium">{formattedSize}</span>
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving || !editingName.trim()}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      color: isSaving || !editingName.trim() ? colors.tertiaryText : colors.successGreen,
                      background: isSaving || !editingName.trim() ? 'transparent' : colors.badgeSuccessBg,
                    }}
                    title="Save (Ctrl/Cmd + Enter)"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      color: colors.secondaryText,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.color = colors.errorRed;
                        e.currentTarget.style.background = colors.badgeErrorBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.color = colors.secondaryText;
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    title="Cancel (Esc)"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

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
          className="pt-3 mt-3"
          style={{ borderTop: `1.5px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-center flex-wrap gap-2.5 max-w-full">
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
              <>
                <button
                  onClick={handleStartEdit}
                  style={{
                    ...actionButtonBaseStyle,
                    color: isEditing ? colors.primaryBlue : colors.secondaryText,
                    background: isEditing ? colors.hoverBackground : colors.inputBackground,
                    borderColor: isEditing ? colors.primaryBlue : colors.border,
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditing) {
                      applyHoverStyles(e, colors.primaryBlue, colors.hoverBackground, colors.primaryBlue);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEditing) {
                      resetHoverStyles(e, colors.secondaryText, colors.inputBackground, colors.border);
                    } else {
                      // Keep the active state when editing
                      e.currentTarget.style.color = colors.primaryBlue;
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.primaryBlue;
                    }
                  }}
                  title={isEditing ? "Click again to cancel editing" : "Edit file details"}
                  disabled={isSaving}
                >
                  <Edit size={18} />
                </button>

                {onCopy && (
                  <button
                    onClick={() => onCopy(file.id)}
                    style={{
                      ...actionButtonBaseStyle,
                      color: colors.secondaryText,
                    }}
                    onMouseEnter={(e) =>
                      applyHoverStyles(e, colors.badgePurpleText, colors.badgePurpleBg, colors.badgePurpleText)
                    }
                    onMouseLeave={(e) =>
                      resetHoverStyles(e, colors.secondaryText, colors.inputBackground)
                    }
                    title="Copy file"
                    aria-label="Copy file"
                  >
                    <Copy size={18} />
                  </button>
                )}

                {onMove && (
                  <button
                    onClick={() => onMove(file.id, file.folderId || null)}
                    style={{
                      ...actionButtonBaseStyle,
                      color: colors.secondaryText,
                    }}
                    onMouseEnter={(e) =>
                      applyHoverStyles(e, colors.badgeWarningText, colors.badgeWarningBg, colors.badgeWarningText)
                    }
                    onMouseLeave={(e) =>
                      resetHoverStyles(e, colors.secondaryText, colors.inputBackground)
                    }
                    title="Move file"
                    aria-label="Move file"
                  >
                    <FolderMove size={18} />
                  </button>
                )}
              </>
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

        {/* Share Modal */}
        <ShareModal
          file={file}
          colors={colors}
          theme={theme}
          fileSharing={fileSharing}
          onRemoveShare={onRemoveShare}
        />
      </div>
    );
  };

  // Removed renderCompactView and renderListView - only grid view is used

  return (
    <>
      {renderGridView()}
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
         prevProps.isSelected === nextProps.isSelected;
});

export default FileCard;