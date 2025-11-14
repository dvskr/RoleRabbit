/**
 * ShareModal Component
 * Modal for creating and managing template share links
 */

import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Users, Calendar, Hash, Lock } from 'lucide-react';
import { useTemplateSharing, type SharePermission, type ShareLinkFormData } from '../../hooks/useTemplateSharing';
import { ShareLinkDisplay } from './ShareLinkDisplay';

interface ShareModalProps {
  isOpen: boolean;
  templateId: string;
  templateName: string;
  onClose: () => void;
  className?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  templateId,
  templateName,
  onClose,
  className = '',
}) => {
  const [permission, setPermission] = useState<SharePermission>('VIEW');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const {
    shareLinks,
    loading,
    error,
    createShareLink,
    fetchShareLinks,
    revokeShareLink,
  } = useTemplateSharing({ templateId });

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
      // Fetch existing share links
      fetchShareLinks();
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchShareLinks]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form
  const resetForm = () => {
    setPermission('VIEW');
    setExpiresAt('');
    setMaxUses('');
    setSelectedUsers([]);
    setSearchQuery('');
  };

  // Handle create share link
  const handleCreateLink = async () => {
    const shareData: ShareLinkFormData = {
      permission,
      expiresAt: expiresAt || null,
      maxUses: maxUses ? parseInt(maxUses, 10) : null,
      sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined,
    };

    const result = await createShareLink(shareData);

    if (result.success) {
      resetForm();
      // Scroll to the new link
      setTimeout(() => {
        const linkList = document.getElementById('share-links-list');
        if (linkList) {
          linkList.scrollTop = 0;
        }
      }, 100);
    } else {
      alert(result.error || 'Failed to create share link');
    }
  };

  // Handle revoke link
  const handleRevoke = async (shareId: string) => {
    if (!confirm('Are you sure you want to revoke this share link?')) return;

    const result = await revokeShareLink(shareId);
    if (!result.success) {
      alert(result.error || 'Failed to revoke share link');
    }
  };

  // Get minimum date for expiration (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Permission descriptions
  const permissionDescriptions: Record<SharePermission, string> = {
    VIEW: 'Can view the template only',
    DOWNLOAD: 'Can view and download the template',
    EDIT: 'Can view, download, and suggest edits',
    FULL: 'Full access including sharing with others',
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-black bg-opacity-0'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className={`bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="share-modal-title" className="text-xl font-bold text-gray-900">
              Share Template
            </h2>
            <p className="text-sm text-gray-600 mt-1">"{templateName}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Create New Share Link Form */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <LinkIcon size={18} />
              Create New Share Link
            </h3>

            {/* Permission Selector */}
            <div>
              <label htmlFor="permission" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} />
                Permission Level
              </label>
              <select
                id="permission"
                value={permission}
                onChange={(e) => setPermission(e.target.value as SharePermission)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="VIEW">View Only</option>
                <option value="DOWNLOAD">View & Download</option>
                <option value="EDIT">View, Download & Edit</option>
                <option value="FULL">Full Access</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{permissionDescriptions[permission]}</p>
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expiresAt" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} />
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                id="expiresAt"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiration
              </p>
            </div>

            {/* Max Uses */}
            <div>
              <label htmlFor="maxUses" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Hash size={16} />
                Maximum Uses (Optional)
              </label>
              <input
                type="number"
                id="maxUses"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
                placeholder="Unlimited"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unlimited uses
              </p>
            </div>

            {/* User Selector (Multi-select) */}
            <div>
              <label htmlFor="sharedWith" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users size={16} />
                Share with Specific Users (Optional)
              </label>
              <input
                type="text"
                id="sharedWith"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to share publicly via link
              </p>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUsers.map((userId) => (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {userId}
                      <button
                        onClick={() => setSelectedUsers(selectedUsers.filter((id) => id !== userId))}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <LinkIcon size={18} />
                  Generate Share Link
                </>
              )}
            </button>
          </div>

          {/* Existing Share Links */}
          {shareLinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Active Share Links</h3>
              <div id="share-links-list" className="space-y-3 max-h-96 overflow-y-auto">
                {shareLinks.map((link) => (
                  <ShareLinkDisplay
                    key={link.id}
                    shareLink={link}
                    onRevoke={handleRevoke}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && shareLinks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <LinkIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm">No active share links yet</p>
              <p className="text-xs">Create your first share link above</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
