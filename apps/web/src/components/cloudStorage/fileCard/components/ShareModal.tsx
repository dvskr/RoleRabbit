/**
 * ShareModal - Modal for sharing files with users
 */

import React from 'react';
import { Share2, X, UserPlus, Trash2 } from 'lucide-react';
import { ResumeFile } from '../../../types/cloudStorage';
import { SharePermission } from '../types';
import { MODAL_OVERLAY_STYLE, SHARE_MODAL, SHARE_PERMISSIONS } from '../constants';
import { getPermissionColor } from '../fileCardHelpers';

interface ShareModalProps {
  file: ResumeFile;
  colors: any;
  theme: any;
  fileSharing: {
    showShareModal: boolean;
    setShowShareModal: (show: boolean) => void;
    shareEmail: string;
    setShareEmail: (email: string) => void;
    sharePermission: SharePermission;
    setSharePermission: (permission: SharePermission) => void;
    shareExpiresAt: string;
    setShareExpiresAt: (date: string) => void;
    maxDownloads: string;
    setMaxDownloads: (count: string) => void;
    requirePassword: boolean;
    setRequirePassword: (require: boolean) => void;
    sharePassword: string;
    setSharePassword: (password: string) => void;
    handleShareSubmit: () => void;
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({
  file,
  colors,
  theme,
  fileSharing,
}) => {
  if (!fileSharing.showShareModal) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: MODAL_OVERLAY_STYLE }}
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
                {SHARE_MODAL.TITLE}
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
                onClick={() => fileSharing.setShowShareModal(false)}
                className="p-2 transition-colors"
                title="Close share modal"
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
              {SHARE_MODAL.SHARE_WITH_LABEL}
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={fileSharing.shareEmail}
                onChange={(e) => fileSharing.setShareEmail(e.target.value)}
                placeholder={SHARE_MODAL.EMAIL_PLACEHOLDER}
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
                onClick={fileSharing.handleShareSubmit}
                disabled={!fileSharing.shareEmail.trim()}
                aria-label="Add user to share"
                title="Add user to share"
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !fileSharing.shareEmail.trim() ? colors.inputBackground : colors.primaryBlue,
                  color: !fileSharing.shareEmail.trim() ? colors.tertiaryText : 'white',
                  opacity: !fileSharing.shareEmail.trim() ? 0.5 : 1,
                  cursor: !fileSharing.shareEmail.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (fileSharing.shareEmail.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (fileSharing.shareEmail.trim()) {
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
              {SHARE_MODAL.PERMISSION_LABEL}
            </label>
            <select
              value={fileSharing.sharePermission}
              onChange={(e) => fileSharing.setSharePermission(e.target.value as SharePermission)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
              title="Select permission level"
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
              <option value="view" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>{SHARE_PERMISSIONS.VIEW}</option>
              <option value="comment" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>{SHARE_PERMISSIONS.COMMENT}</option>
              <option value="edit" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>{SHARE_PERMISSIONS.EDIT}</option>
              <option value="admin" style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}>{SHARE_PERMISSIONS.ADMIN}</option>
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
              {SHARE_MODAL.ACCESS_SETTINGS_TITLE}
            </h3>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                {SHARE_MODAL.EXPIRATION_LABEL}
              </label>
                  <input
                    type="datetime-local"
                    value={fileSharing.shareExpiresAt}
                    onChange={(e) => fileSharing.setShareExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
                    title="Expiration date"
                    placeholder="Select expiration date"
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
                {SHARE_MODAL.EXPIRATION_HELP}
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                {SHARE_MODAL.MAX_DOWNLOADS_LABEL}
              </label>
              <input
                type="number"
                value={fileSharing.maxDownloads}
                onChange={(e) => fileSharing.setMaxDownloads(e.target.value)}
                placeholder={SHARE_MODAL.MAX_DOWNLOADS_PLACEHOLDER}
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
                {SHARE_MODAL.MAX_DOWNLOADS_HELP}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePassword"
                checked={fileSharing.requirePassword}
                onChange={(e) => fileSharing.setRequirePassword(e.target.checked)}
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
                {SHARE_MODAL.REQUIRE_PASSWORD_LABEL}
              </label>
            </div>

            {fileSharing.requirePassword && (
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  {SHARE_MODAL.PASSWORD_LABEL}
                </label>
                <input
                  type="password"
                  value={fileSharing.sharePassword}
                  onChange={(e) => fileSharing.setSharePassword(e.target.value)}
                  placeholder={SHARE_MODAL.PASSWORD_PLACEHOLDER}
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
                {SHARE_MODAL.CURRENTLY_SHARED_LABEL}
              </label>
              <div className="space-y-2">
                {file.sharedWith.map((share) => {
                  const permissionColorStyle = getPermissionColor(share.permission, colors);
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
                          title="Remove share access"
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
            onClick={() => fileSharing.setShowShareModal(false)}
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
            {SHARE_MODAL.CLOSE_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
};

