'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Archive,
  Users,
  MessageCircle,
  Copy,
  TrendingUp,
  UserPlus,
  X
} from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';

interface FileCardProps {
  file: ResumeFile;
  isSelected: boolean;
  viewMode: 'grid' | 'list' | 'compact';
  onSelect: (fileId: string) => void;
  onDownload: (file: ResumeFile, format?: 'pdf' | 'doc') => void;
  onShare: (file: ResumeFile) => void;
  onDelete: (fileId: string) => void;
  onTogglePublic: (fileId: string) => void;
  onEdit: (fileId: string) => void;
  onStar: (fileId: string) => void;
  onArchive: (fileId: string) => void;
  onAddComment: (fileId: string, content: string) => void;
  onShareWithUser: (fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin') => void;
}

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
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'comment' | 'edit' | 'admin'>('view');
  const [shareExpiresAt, setShareExpiresAt] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [showDownloadFormat, setShowDownloadFormat] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText size={20} style={{ color: colors.primaryBlue }} />;
      case 'template':
        return <FileText size={20} style={{ color: colors.successGreen }} />;
      case 'backup':
        return <FileText size={20} style={{ color: colors.badgeWarningText }} />;
      default:
        return <FileText size={20} style={{ color: colors.tertiaryText }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resume':
        return { bg: colors.badgeInfoBg, text: colors.badgeInfoText };
      case 'template':
        return { bg: colors.badgeSuccessBg, text: colors.badgeSuccessText };
      case 'backup':
        return { bg: colors.badgeWarningBg, text: colors.badgeWarningText };
      default:
        return { bg: colors.inputBackground, text: colors.secondaryText };
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin':
        return { bg: colors.badgeErrorBg, text: colors.errorRed };
      case 'edit':
        return { bg: colors.badgeWarningBg, text: colors.badgeWarningText };
      case 'comment':
        return { bg: colors.badgeInfoBg, text: colors.badgeInfoText };
      case 'view':
        return { bg: colors.inputBackground, text: colors.secondaryText };
      default:
        return { bg: colors.inputBackground, text: colors.secondaryText };
    }
  };

  const handleShareSubmit = () => {
    if (shareEmail.trim()) {
      // Create share link with time limits
      const shareOptions: any = {
        email: shareEmail.trim(),
        permission: sharePermission,
        expiresAt: shareExpiresAt || undefined,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : undefined,
        password: requirePassword && sharePassword ? sharePassword : undefined
      };
      
      // Store the share link data
      logger.debug('Sharing with options:', shareOptions);
      onShareWithUser(file.id, shareEmail.trim(), sharePermission);
      
      // Reset form
      setShareEmail('');
      setSharePassword('');
      setShareExpiresAt('');
      setMaxDownloads('');
      setRequirePassword(false);
      setShowShareModal(false);
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment(file.id, newComment.trim());
      setNewComment('');
      logger.debug('Comment submitted for file:', file.id);
    }
  };

  if (viewMode === 'grid') {
    const typeColorStyle = getTypeColor(file.type);
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
              {getFileIcon(file.type)}
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
        {file.tags.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-0.5">
              {file.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 text-xs rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    color: colors.primaryText,
                  }}
                >
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
              {file.tags.length > 3 && (
                <span 
                  className="text-xs px-2 py-1"
                  style={{ color: colors.secondaryText }}
                >
                  +{file.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Shared Users */}
        {file.sharedWith.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center space-x-1.5">
              <Users size={12} style={{ color: colors.tertiaryText }} />
              <div className="flex -space-x-2">
                {file.sharedWith.slice(0, 3).map((share) => (
                  <div 
                    key={share.id} 
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                      borderColor: colors.cardBackground,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {share.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {file.sharedWith.length > 3 && (
                  <div 
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{
                      background: colors.inputBackground,
                      borderColor: colors.cardBackground,
                    }}
                  >
                    <span 
                      className="text-xs font-medium"
                      style={{ color: colors.secondaryText }}
                    >
                      +{file.sharedWith.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <span 
                className="text-xs"
                style={{ color: colors.secondaryText }}
              >
                {file.sharedWith.length} shared
              </span>
            </div>
          </div>
        )}

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
              onClick={() => setShowShareModal(true)}
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
                logger.debug('Comment button clicked! Current state:', showComments);
                setShowComments(!showComments);
              }}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: showComments ? colors.badgePurpleText : colors.secondaryText,
                background: showComments ? colors.badgePurpleBg : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!showComments) {
                  e.currentTarget.style.color = colors.badgePurpleText;
                  e.currentTarget.style.background = colors.badgePurpleBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!showComments) {
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
        {showComments && (
          <div 
            className="mt-4 pt-4 w-full max-w-full overflow-hidden"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <div className="space-y-3 max-w-full">
              {/* Existing Comments */}
              {file.comments && file.comments.length > 0 ? (
                file.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 max-w-full">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {comment.userName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span 
                          className="text-sm font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {comment.userName || 'User'}
                        </span>
                        <span 
                          className="text-xs"
                          style={{ color: colors.secondaryText }}
                        >
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p 
                        className="text-sm break-words"
                        style={{ color: colors.primaryText }}
                      >
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  className="text-center py-4 text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  No comments yet. Be the first to comment!
                </div>
              )}
              
              {/* Add Comment */}
              <div className="flex space-x-3 max-w-full">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: colors.inputBackground,
                  }}
                >
                  <span 
                    className="text-xs font-medium"
                    style={{ color: colors.secondaryText }}
                  >
                    U
                  </span>
                </div>
                <div className="flex-1 min-w-0 max-w-full">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full max-w-full px-3 py-2 rounded-lg focus:outline-none resize-none text-sm box-border transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                    rows={2}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="px-3 py-1 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                      style={{
                        background: !newComment.trim() ? colors.inputBackground : colors.primaryBlue,
                        color: !newComment.trim() ? colors.tertiaryText : 'white',
                        opacity: !newComment.trim() ? 0.5 : 1,
                        cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (newComment.trim()) {
                          e.currentTarget.style.opacity = '0.9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (newComment.trim()) {
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      Comment
                    </button>
                    <button
                      onClick={() => {
                        setNewComment('');
                        setShowComments(false);
                      }}
                      className="px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap"
                      style={{
                        background: colors.inputBackground,
                        color: colors.secondaryText,
                        border: `1px solid ${colors.border}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackgroundStrong;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.inputBackground;
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact view - Dense table-like layout
  if (viewMode === 'compact') {
    const typeColorStyleCompact = getTypeColor(file.type);
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
          className="w-3.5 h-3.5 rounded flex-shrink-0"
          style={{
            accentColor: colors.primaryBlue,
            borderColor: colors.border,
          }}
        />
        
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          {getFileIcon(file.type)}
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

        <div className="flex items-center gap-4 text-xs flex-shrink-0" style={{ color: colors.secondaryText }}>
          <span>{file.size}</span>
          <span>{file.lastModified}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
            onClick={() => setShowShareModal(true)}
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
  const typeColorStyleList = getTypeColor(file.type);
  return (
    <div 
      className="group flex flex-col p-3 rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden w-full max-w-full"
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
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          className="w-4 h-4 rounded focus:ring-2 flex-shrink-0 transition-all"
          style={{
            accentColor: colors.primaryBlue,
            borderColor: colors.border,
          }}
        />
        
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: colors.inputBackground,
          }}
        >
          {getFileIcon(file.type)}
        </div>

        <div className="flex-1 min-w-0 max-w-full">
          <div className="flex items-center space-x-3 mb-1">
            <h3 
              className="font-semibold truncate transition-colors"
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
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: typeColorStyleList.bg,
                color: typeColorStyleList.text,
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
            {file.isStarred && (
              <Star size={14} style={{ color: colors.badgeWarningText }} className="fill-current" />
            )}
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
          
          {file.description && (
            <p 
              className="text-sm mb-2 line-clamp-1"
              style={{ color: colors.secondaryText }}
            >
              {file.description}
            </p>
          )}
          
          <div 
            className="flex items-center space-x-4 text-sm"
            style={{ color: colors.secondaryText }}
          >
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{file.lastModified}</span>
            </div>
            <span>{file.size}</span>
            <div className="flex items-center space-x-1">
              <TrendingUp size={12} />
              <span>{file.viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download size={12} />
              <span>{file.downloadCount}</span>
            </div>
            {file.sharedWith.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users size={12} />
                <span>{file.sharedWith.length}</span>
              </div>
            )}
            {file.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle size={12} />
                <span>{file.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
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
          onClick={() => setShowShareModal(true)}
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
            logger.debug('Comment button clicked (list view)! Current state:', showComments);
            setShowComments(!showComments);
          }}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            color: showComments ? colors.badgePurpleText : colors.secondaryText,
            background: showComments ? colors.badgePurpleBg : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!showComments) {
              e.currentTarget.style.color = colors.badgePurpleText;
              e.currentTarget.style.background = colors.badgePurpleBg;
            }
          }}
          onMouseLeave={(e) => {
            if (!showComments) {
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
      {showComments && (
        <div 
          className="mt-4 pt-4 w-full max-w-full overflow-hidden"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="space-y-3 max-w-full">
            {/* Existing Comments */}
            {file.comments && file.comments.length > 0 ? (
              file.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 max-w-full">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {comment.userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {comment.userName || 'User'}
                      </span>
                      <span 
                        className="text-xs"
                        style={{ color: colors.secondaryText }}
                      >
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p 
                      className="text-sm break-words"
                      style={{ color: colors.primaryText }}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div 
                className="text-center py-4 text-sm"
                style={{ color: colors.secondaryText }}
              >
                No comments yet. Be the first to comment!
              </div>
            )}
            
            {/* Add Comment */}
            <div className="flex space-x-3 max-w-full">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: colors.inputBackground,
                }}
              >
                <span 
                  className="text-xs font-medium"
                  style={{ color: colors.secondaryText }}
                >
                  U
                </span>
              </div>
              <div className="flex-1 min-w-0 max-w-full">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full max-w-full px-3 py-2 rounded-lg focus:outline-none resize-none text-sm box-border transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  rows={2}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="px-3 py-1 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                    style={{
                      background: !newComment.trim() ? colors.inputBackground : colors.primaryBlue,
                      color: !newComment.trim() ? colors.tertiaryText : 'white',
                      opacity: !newComment.trim() ? 0.5 : 1,
                      cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (newComment.trim()) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newComment.trim()) {
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    Comment
                  </button>
                  <button
                    onClick={() => {
                      setNewComment('');
                      setShowComments(false);
                    }}
                    className="px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap"
                    style={{
                      background: colors.inputBackground,
                      color: colors.secondaryText,
                      border: `1px solid ${colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackgroundStrong;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.inputBackground;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-xl p-6 w-full max-w-md"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: colors.badgeSuccessBg,
                  }}
                >
                  <Share2 size={20} style={{ color: colors.successGreen }} />
                </div>
                <div>
                  <h2 
                    className="text-xl font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    Share File
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: colors.secondaryText }}
                  >
                    {file.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryText;
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.secondaryText;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Share with
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 rounded-lg focus:outline-none transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  />
                  <button
                    onClick={handleShareSubmit}
                    disabled={!shareEmail.trim()}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      background: !shareEmail.trim() ? colors.inputBackground : colors.primaryBlue,
                      color: !shareEmail.trim() ? colors.tertiaryText : 'white',
                      opacity: !shareEmail.trim() ? 0.5 : 1,
                      cursor: !shareEmail.trim() ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (shareEmail.trim()) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (shareEmail.trim()) {
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Permission
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <option value="view" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>View only</option>
                  <option value="comment" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Can comment</option>
                  <option value="edit" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Can edit</option>
                  <option value="admin" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>Admin access</option>
                </select>
              </div>

              {/* SharePoint-style Access Controls */}
              <div 
                className="pt-4 space-y-4"
                style={{ borderTop: `1px solid ${colors.border}` }}
              >
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Access Settings
                </h3>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={shareExpiresAt}
                    onChange={(e) => setShareExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  />
                  <p 
                    className="text-xs mt-1"
                    style={{ color: colors.tertiaryText }}
                  >
                    Link will expire after this date
                  </p>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Max Downloads (Optional)
                  </label>
                  <input
                    type="number"
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  />
                  <p 
                    className="text-xs mt-1"
                    style={{ color: colors.tertiaryText }}
                  >
                    Maximum number of downloads allowed
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requirePassword"
                    checked={requirePassword}
                    onChange={(e) => setRequirePassword(e.target.checked)}
                    className="w-4 h-4 rounded focus:ring-2 transition-all"
                    style={{
                      accentColor: colors.primaryBlue,
                      borderColor: colors.border,
                    }}
                  />
                  <label 
                    htmlFor="requirePassword" 
                    className="text-sm font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    Require password to access
                  </label>
                </div>

                {requirePassword && (
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.primaryText }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
                      style={{
                        background: colors.inputBackground,
                        border: `1px solid ${colors.border}`,
                        color: colors.primaryText,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = colors.borderFocused;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Current Shares */}
              {file.sharedWith.length > 0 && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Currently shared with
                  </label>
                  <div className="space-y-2">
                    {file.sharedWith.map((share) => {
                      const permissionColorStyle = getPermissionColor(share.permission);
                      return (
                        <div 
                          key={share.id} 
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            background: colors.inputBackground,
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                              }}
                            >
                              <span className="text-xs text-white font-medium">
                                {share.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p 
                                className="text-sm font-medium"
                                style={{ color: colors.primaryText }}
                              >
                                {share.userName}
                              </p>
                              <p 
                                className="text-xs"
                                style={{ color: colors.secondaryText }}
                              >
                                {share.userEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: permissionColorStyle.bg,
                                color: permissionColorStyle.text,
                              }}
                            >
                              {share.permission}
                            </span>
                            <button 
                              className="p-1 transition-colors"
                              style={{ color: colors.tertiaryText }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = colors.errorRed;
                                e.currentTarget.style.background = colors.badgeErrorBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = colors.tertiaryText;
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.file.id === nextProps.file.id &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.viewMode === nextProps.viewMode;
});

export default FileCard;