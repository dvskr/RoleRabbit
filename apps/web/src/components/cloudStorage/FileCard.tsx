'use client';

import React, { useState } from 'react';
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
  Lock,
  Clock,
  TrendingUp,
  UserPlus,
  Settings,
  X
} from 'lucide-react';
import { ResumeFile } from '../../types/cloudStorage';

interface FileCardProps {
  file: ResumeFile;
  isSelected: boolean;
  viewMode: 'grid' | 'list';
  onSelect: (fileId: string) => void;
  onDownload: (file: ResumeFile) => void;
  onShare: (file: ResumeFile) => void;
  onDelete: (fileId: string) => void;
  onTogglePublic: (fileId: string) => void;
  onEdit: (fileId: string) => void;
  onStar: (fileId: string) => void;
  onArchive: (fileId: string) => void;
  onAddComment: (fileId: string, content: string) => void;
  onShareWithUser: (fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin') => void;
}

export default function FileCard({
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'comment' | 'edit' | 'admin'>('view');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText size={20} className="text-blue-600" />;
      case 'template':
        return <FileText size={20} className="text-green-600" />;
      case 'backup':
        return <FileText size={20} className="text-orange-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resume':
        return 'bg-blue-100 text-blue-800';
      case 'template':
        return 'bg-green-100 text-green-800';
      case 'backup':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'comment':
        return 'bg-blue-100 text-blue-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleShareSubmit = () => {
    if (shareEmail.trim()) {
      onShareWithUser(file.id, shareEmail.trim(), sharePermission);
      setShareEmail('');
      setShareModal(false);
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment(file.id, newComment.trim());
      setNewComment('');
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className={`group border rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(file.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              {getFileIcon(file.type)}
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onStar(file.id)}
              className={`p-2 rounded-lg transition-colors ${
                file.isStarred 
                  ? 'text-yellow-500 bg-yellow-100' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-100'
              }`}
              title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              <Star size={16} className={file.isStarred ? 'fill-current' : ''} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
            {file.name}
          </h3>
          {file.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{file.description}</p>
          )}
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
              {file.type}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              v{file.version}
            </span>
            {file.isArchived && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Archived
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{file.lastModified}</span>
            </div>
            <span>{file.size}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <TrendingUp size={12} />
              <span>{file.viewCount} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download size={12} />
              <span>{file.downloadCount} downloads</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {file.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {file.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
              {file.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{file.tags.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Shared Users */}
        {file.sharedWith.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Users size={14} className="text-gray-400" />
              <div className="flex -space-x-2">
                {file.sharedWith.slice(0, 3).map((share) => (
                  <div key={share.id} className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {share.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {file.sharedWith.length > 3 && (
                  <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">+{file.sharedWith.length - 3}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">{file.sharedWith.length} shared</span>
            </div>
          </div>
        )}

        {/* Comments */}
        {file.comments.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{file.comments.length} comment{file.comments.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTogglePublic(file.id)}
              className={`p-2 rounded-lg transition-colors ${
                file.isPublic 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={file.isPublic ? 'Make private' : 'Make public'}
            >
              {file.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              onClick={() => onDownload(file)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 size={14} />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title="Comments"
            >
              <MessageCircle size={14} />
            </button>
            <button
              onClick={() => onEdit(file.id)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onArchive(file.id)}
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
              title={file.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive size={14} />
            </button>
            <button
              onClick={() => onDelete(file.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {file.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Add Comment */}
              <div className="flex space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">U</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Comment
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

  // List view - Enhanced version
  return (
    <div className={`group flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all duration-300 ${
      isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <div className="flex items-center space-x-4 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          {getFileIcon(file.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {file.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
              {file.type}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              v{file.version}
            </span>
            {file.isStarred && (
              <Star size={14} className="text-yellow-500 fill-current" />
            )}
            {file.isArchived && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Archived
              </span>
            )}
          </div>
          
          {file.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{file.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
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

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onStar(file.id)}
          className={`p-2 rounded-lg transition-colors ${
            file.isStarred 
              ? 'text-yellow-500 bg-yellow-100' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-100'
          }`}
          title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
        >
          <Star size={16} className={file.isStarred ? 'fill-current' : ''} />
        </button>
        <button
          onClick={() => onTogglePublic(file.id)}
          className={`p-2 rounded-lg transition-colors ${
            file.isPublic 
              ? 'text-green-600 bg-green-100' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={file.isPublic ? 'Make private' : 'Make public'}
        >
          {file.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          onClick={() => onDownload(file)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          title="Download"
        >
          <Download size={16} />
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
          title="Comments"
        >
          <MessageCircle size={16} />
        </button>
        <button
          onClick={() => onEdit(file.id)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onArchive(file.id)}
          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
          title={file.isArchived ? 'Unarchive' : 'Archive'}
        >
          <Archive size={16} />
        </button>
        <button
          onClick={() => onDelete(file.id)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Share2 size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Share File</h2>
                  <p className="text-sm text-gray-600">{file.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share with
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleShareSubmit}
                    disabled={!shareEmail.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="view">View only</option>
                  <option value="comment">Can comment</option>
                  <option value="edit">Can edit</option>
                  <option value="admin">Admin access</option>
                </select>
              </div>

              {/* Current Shares */}
              {file.sharedWith.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currently shared with
                  </label>
                  <div className="space-y-2">
                    {file.sharedWith.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {share.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{share.userName}</p>
                            <p className="text-xs text-gray-500">{share.userEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(share.permission)}`}>
                            {share.permission}
                          </span>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}