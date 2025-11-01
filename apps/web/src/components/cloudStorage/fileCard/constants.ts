/**
 * Constants for FileCard component
 */

export const MODAL_OVERLAY_STYLE = 'rgba(0, 0, 0, 0.85)';

export const SHARE_MODAL = {
  TITLE: 'Share File',
  SHARE_WITH_LABEL: 'Share with',
  EMAIL_PLACEHOLDER: 'Enter email address',
  PERMISSION_LABEL: 'Permission',
  ACCESS_SETTINGS_TITLE: 'Access Settings',
  EXPIRATION_LABEL: 'Expiration Date (Optional)',
  EXPIRATION_HELP: 'Link will expire after this date',
  MAX_DOWNLOADS_LABEL: 'Max Downloads (Optional)',
  MAX_DOWNLOADS_PLACEHOLDER: 'Unlimited',
  MAX_DOWNLOADS_HELP: 'Maximum number of downloads allowed',
  REQUIRE_PASSWORD_LABEL: 'Require password to access',
  PASSWORD_LABEL: 'Password',
  PASSWORD_PLACEHOLDER: 'Enter password',
  CURRENTLY_SHARED_LABEL: 'Currently shared with',
  CLOSE_BUTTON: 'Close',
} as const;

export const SHARE_PERMISSIONS = {
  VIEW: 'View only',
  COMMENT: 'Can comment',
  EDIT: 'Can edit',
  ADMIN: 'Admin access',
} as const;

export const COMMENTS = {
  PLACEHOLDER: 'Add a comment...',
  SUBMIT_BUTTON: 'Comment',
  CANCEL_BUTTON: 'Cancel',
  EMPTY_STATE: 'No comments yet. Be the first to comment!',
} as const;

export const DOWNLOAD_FORMATS = {
  PDF: '📄 Download PDF',
  DOC: '📝 Download DOC',
} as const;

export const MORE_MENU_OPTIONS = {
  COPY_ID: 'Copy ID',
  VIEW_HISTORY: 'View History',
  MANAGE_TAGS: 'Manage Tags',
  DELETE_PERMANENTLY: 'Delete Permanently',
} as const;

export const FILE_ACTIONS = {
  MAKE_PUBLIC: 'Make public',
  MAKE_PRIVATE: 'Make private',
  REMOVE_STARRED: 'Remove from starred',
  ADD_STARRED: 'Add to starred',
  ARCHIVE: 'Archive',
  UNARCHIVE: 'Unarchive',
  DOWNLOAD: 'Download',
  SHARE: 'Share',
  EDIT: 'Edit',
  DELETE: 'Delete',
  COMMENTS: 'Comments',
  MORE_OPTIONS: 'More options',
} as const;

