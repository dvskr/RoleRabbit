/**
 * ShareLinkDisplay Component
 * Displays a share link with copy functionality and usage info
 */

import React, { useState } from 'react';
import { Copy, Check, Trash2, Calendar, Hash, Eye, Lock, AlertCircle } from 'lucide-react';
import type { ShareLink } from '../../hooks/useTemplateSharing';

interface ShareLinkDisplayProps {
  shareLink: ShareLink;
  onRevoke?: (shareId: string) => void;
  showAnalytics?: boolean;
  onViewAnalytics?: (shareId: string) => void;
  className?: string;
}

export const ShareLinkDisplay: React.FC<ShareLinkDisplayProps> = ({
  shareLink,
  onRevoke,
  showAnalytics = false,
  onViewAnalytics,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Generate full share URL
  const shareUrl = `${window.location.origin}/templates/shared/${shareLink.token}`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if link is expired
  const isExpired = shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date();

  // Check if link has reached max uses
  const isMaxedOut =
    shareLink.maxUses !== null && shareLink.currentUses >= shareLink.maxUses;

  // Link status
  const isActive = shareLink.isActive && !isExpired && !isMaxedOut;

  // Permission colors
  const permissionColors: Record<string, { bg: string; text: string; border: string }> = {
    VIEW: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    DOWNLOAD: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    EDIT: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    FULL: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  };

  const permissionStyle = permissionColors[shareLink.permission] || permissionColors.VIEW;

  return (
    <div
      className={`border rounded-lg p-4 ${
        isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
      } ${className}`}
    >
      {/* Status Badge */}
      {!isActive && (
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-orange-600" />
          <span className="text-sm font-medium text-orange-600">
            {isExpired ? 'Expired' : isMaxedOut ? 'Maximum uses reached' : 'Inactive'}
          </span>
        </div>
      )}

      {/* Link URL with Copy Button */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm text-gray-700 overflow-x-auto whitespace-nowrap">
          {shareUrl}
        </div>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-all ${
            copied
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title={copied ? 'Copied!' : 'Copy link'}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      {/* Link Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Permission */}
        <div className="flex items-center gap-2 text-sm">
          <Lock size={14} className="text-gray-400" />
          <span className="text-gray-600">Permission:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${permissionStyle.bg} ${permissionStyle.text}`}
          >
            {shareLink.permission}
          </span>
        </div>

        {/* Uses */}
        <div className="flex items-center gap-2 text-sm">
          <Hash size={14} className="text-gray-400" />
          <span className="text-gray-600">Uses:</span>
          <span className="font-medium text-gray-900">
            {shareLink.currentUses}
            {shareLink.maxUses !== null ? ` / ${shareLink.maxUses}` : ' (unlimited)'}
          </span>
        </div>

        {/* Expiration */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-gray-600">Expires:</span>
          <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {shareLink.expiresAt ? formatDate(shareLink.expiresAt) : 'Never'}
          </span>
        </div>

        {/* Created */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-gray-600">Created:</span>
          <span className="font-medium text-gray-900">
            {formatDate(shareLink.createdAt)}
          </span>
        </div>
      </div>

      {/* Shared With Users */}
      {shareLink.sharedWith && shareLink.sharedWith.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <Eye size={14} />
            <span className="font-medium">Shared with {shareLink.sharedWith.length} users</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {showAnalytics && onViewAnalytics && (
            <button
              onClick={() => onViewAnalytics(shareLink.id)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Eye size={14} />
              View Analytics
            </button>
          )}
        </div>

        {onRevoke && (
          <button
            onClick={() => onRevoke(shareLink.id)}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <Trash2 size={14} />
            Revoke
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareLinkDisplay;
