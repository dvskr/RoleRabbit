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
  Folder,
  MoreVertical,
  FileText
} from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime, formatFileSize } from '../../utils/formatters';
import { getUserFilePermission, canView, canComment, canEdit, canDelete, canManageShares } from '../../utils/filePermissions';
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
import { MoveFileModal } from './MoveFileModal';

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
  onEdit,
  onStar,
  onArchive,
  onAddComment,
  onShareWithUser,
  onRemoveShare,
  onMove,
  folders = []
}: FileCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { user } = useAuth();
  
  // Get current user's permission for this file
  const userPermission = getUserFilePermission(
    { userId: file.owner || file.userId || '', sharedWith: file.sharedWith || [] },
    user?.id || ''
  );
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
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
  
  // Close all other open states to prevent multiple actions at once
  const closeAllStates = (except?: string) => {
    if (except !== 'preview') setShowPreviewModal(false);
    if (except !== 'move') setShowMoveModal(false);
    if (except !== 'download') setShowDownloadFormat(false);
    if (except !== 'share') fileSharing.setShowShareModal(false);
    if (except !== 'comments') comments.setShowComments(false);
    if (except !== 'edit' && isEditing) {
      handleCancelEdit();
    }
  };
  
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
      // Close all other states first, keep edit open
      closeAllStates('edit');
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
      // Exit edit mode immediately - parent will update file prop via API refresh
      setIsEditing(false);
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
    color: colors.colors.secondaryText,
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


  const renderGridView = () => {
    // Use theme colors for consistency
    
    return (
      <div
        className="group rounded-xl p-5 transition-all duration-300 w-full"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${isSelected ? colors.primaryBlue : colors.border}`,
          boxShadow: isSelected ? `0 0 0 2px ${colors.primaryBlue}40` : 'none',
          maxWidth: '340px',
          minWidth: '280px',
        }}
      >
        {/* Top Section - Header */}
        <div className="mb-4">
          <div className="flex items-start gap-4">
            {/* Blue Square Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: colors.primaryBlue,
              }}
            >
              <FileText size={24} color={colors.primaryText} />
            </div>

            {/* File Name and Resume Button Section */}
            <div className="flex-1 min-w-0">
              {/* File Name Row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
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
                      className="font-bold text-lg w-full px-2 py-1 rounded-lg focus:outline-none"
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
                      className="font-bold text-lg break-words"
                      style={{ color: colors.primaryText }}
                      title={file.name}
                >
                  {file.name}
                </h3>
              )}
                </div>

                {/* Top Right Icons - Star and Square */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {showDeleted && file.deletedAt ? (
                    <>
                      <button
                        onClick={() => onRestore?.(file.id)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{
                          color: colors.successGreen,
                          background: colors.inputBackground,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeSuccessBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.inputBackground;
                        }}
                        title="Restore"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => onPermanentlyDelete?.(file.id)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{
                          color: colors.errorRed,
                          background: colors.inputBackground,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.inputBackground;
                        }}
                        title="Permanently Delete"
                      >
                        <Trash size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Star Icon */}
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{
                          color: file.isStarred ? colors.warningYellow : colors.colors.secondaryText,
                          background: colors.inputBackground,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.hoverBackgroundStrong;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.inputBackground;
                        }}
                        onClick={() => {
                          if (onStar) {
                            onStar(file.id);
                          }
                        }}
                        title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
                      >
                        <Star size={14} className={file.isStarred ? 'fill-current' : ''} />
                      </button>
                      {/* Square Icon (Checkbox/Menu) */}
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{
                          color: colors.colors.secondaryText,
                          background: colors.inputBackground,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.hoverBackgroundStrong;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.inputBackground;
                        }}
                        onClick={() => onSelect(file.id)}
                        title="Select file"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            borderColor: isSelected ? colors.primaryBlue : colors.border,
                            background: isSelected ? colors.primaryBlue : 'transparent',
                          }}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Resume Button and Edit Controls - Directly below file name */}
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    className="px-3 py-1 rounded text-sm font-medium transition-colors"
                    style={{
                      background: colors.primaryBlue,
                      color: colors.primaryText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onClick={() => {
                      if (onEdit && file.type === 'resume') {
                        // Navigate to resume editor or handle resume action
                      }
                    }}
                  >
                    Resume
                  </button>
                )}

                {isEditing && (
                  <div className="flex items-center gap-2">
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
            </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Metadata */}
        <div className="mb-4 space-y-1">
          <div 
            className="flex items-center gap-2 text-sm"
            style={{ color: colors.secondaryText }}
          >
            <span>{formattedDateTime}</span>
            <span style={{ color: colors.tertiaryText }}>({relativeUpdated})</span>
          </div>
          <div 
            className="flex items-center gap-2 text-sm"
            style={{ color: colors.secondaryText }}
          >
            <span>{formattedSize}</span>
            {file.comments && file.comments.length > 0 && (
              <>
                <span style={{ color: colors.tertiaryText }}>•</span>
                <div className="flex items-center gap-1">
                  <MessageCircle size={14} style={{ color: colors.secondaryText }} />
                  <span>{file.comments.length} {file.comments.length === 1 ? 'comment' : 'comments'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section - Actions Grid */}
            {!showDeleted && (
          <div 
            className="pt-4 mt-4"
            style={{ borderTop: `1px solid #2D3748` }}
          >
            <div className="flex flex-col gap-3">
              {/* Row 1: View, Download, Share, Comment */}
              <div className="grid grid-cols-4 gap-3">
                {/* View */}
                {canView(userPermission) && (
                  <button
                    onClick={() => {
                      closeAllStates('preview');
                      setShowPreviewModal(true);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                    style={{
                      color: colors.secondaryText,
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="View"
                    aria-label="Preview file"
                  >
                    <Eye size={20} />
                    <span className="text-xs">View</span>
                  </button>
                )}

                {/* Download */}
                {canView(userPermission) && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (showDownloadFormat) {
                          setShowDownloadFormat(false);
                        } else {
                          closeAllStates('download');
                          setShowDownloadFormat(true);
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors w-full"
                      style={{
                        color: colors.secondaryText,
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.inputBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Download"
                      aria-label="Download file"
                    >
                      <Download size={20} />
                      <span className="text-xs">Download</span>
                    </button>
                    {showDownloadFormat && (
                      <DownloadFormatMenu
                        colors={colors}
                        onDownload={(format) => onDownload(file, format)}
                        onClose={() => setShowDownloadFormat(false)}
                      />
                    )}
                  </div>
                )}

                {/* Share */}
                {canManageShares(userPermission) && (
                  <button
                    onClick={() => {
                      closeAllStates('share');
                      fileSharing.setShowShareModal(true);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                    style={{
                      color: colors.secondaryText,
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Share"
                    aria-label="Share file"
                  >
                    <Share2 size={20} />
                    <span className="text-xs">Share</span>
                  </button>
            )}

                {/* Comment */}
                {canComment(userPermission) && (
              <button
                onClick={() => {
                  logger.debug('Comment button clicked! Current state:', comments.showComments);
                  if (comments.showComments) {
                    comments.setShowComments(false);
                  } else {
                    closeAllStates('comments');
                    comments.setShowComments(true);
                  }
                }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                style={{
                      color: comments.showComments ? colors.primaryBlue : colors.secondaryText,
                      background: comments.showComments ? colors.inputBackground : 'transparent',
                }}
                    onMouseEnter={(e) => {
                      if (!comments.showComments) {
                        e.currentTarget.style.background = colors.inputBackground;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!comments.showComments) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    title="Comment"
                aria-label="Toggle comments"
              >
                    <MessageCircle size={20} />
                    <span className="text-xs">Comment</span>
              </button>
            )}
              </div>

              {/* Row 2: Edit, Move, Delete */}
              <div className="grid grid-cols-3 gap-3">
                {/* Edit */}
                {canEdit(userPermission) && (
                <button
                  onClick={handleStartEdit}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                  style={{
                      color: isEditing ? colors.primaryBlue : colors.secondaryText,
                      background: isEditing ? colors.inputBackground : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditing) {
                        e.currentTarget.style.background = colors.inputBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEditing) {
                        e.currentTarget.style.background = 'transparent';
                    }
                  }}
                    title="Edit"
                  disabled={isSaving}
                >
                    <Edit size={20} />
                    <span className="text-xs">Edit</span>
                </button>
                )}

                {/* Move */}
                {canEdit(userPermission) && onMove && (
                  <button
                    onClick={() => {
                      closeAllStates('move');
                      setShowMoveModal(true);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                    style={{
                      color: colors.secondaryText,
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Move"
                    aria-label="Move file"
                  >
                    <Folder size={20} />
                    <span className="text-xs">Move</span>
                  </button>
            )}

                {/* Delete */}
                {canDelete(userPermission) && (
              <button
                onClick={async () => {
                  if (onDelete) {
                    await onDelete(file.id);
                  }
                }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                style={{
                      color: colors.errorRed,
                      background: 'transparent',
                }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgeErrorBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                title="Delete"
                aria-label="Delete file"
              >
                    <Trash2 size={20} />
                    <span className="text-xs">Delete</span>
              </button>
            )}
          </div>
        </div>
          </div>
        )}

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

        {/* Move File Modal */}
        {onMove && (
          <MoveFileModal
            isOpen={showMoveModal}
            onClose={() => setShowMoveModal(false)}
            onConfirm={(folderId) => {
              onMove(file.id, folderId);
              setShowMoveModal(false);
            }}
            folders={folders}
            currentFolderId={file.folderId || null}
            fileName={file.name}
            colors={colors}
          />
        )}
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
  // Check if any relevant properties changed
  return prevProps.file.id === nextProps.file.id &&
         prevProps.file.name === nextProps.file.name &&
         prevProps.file.type === nextProps.file.type &&
         prevProps.file.isStarred === nextProps.file.isStarred &&
         prevProps.file.isArchived === nextProps.file.isArchived &&
         prevProps.file.deletedAt === nextProps.file.deletedAt &&
         prevProps.file.folderId === nextProps.file.folderId &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.showDeleted === nextProps.showDeleted &&
         (prevProps.file.comments?.length || 0) === (nextProps.file.comments?.length || 0) &&
         (prevProps.file.sharedWith?.length || 0) === (nextProps.file.sharedWith?.length || 0) &&
         prevProps.folders.length === nextProps.folders.length; // Check if folders list changed
});

export default FileCard;