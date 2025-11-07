/**
 * Helper functions for FileCard component
 */

import React from 'react';
import { FileText, Archive, Award, UserCheck, Briefcase, FileCode } from 'lucide-react';

export const formatFilesize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (type: string, colors: any): React.ReactElement => {
  const size = 28;
  switch (type) {
    case 'resume':
      return React.createElement(FileText, { size, style: { color: colors.primaryBlue } });
    case 'template':
      return React.createElement(FileText, { size, style: { color: colors.badgePurpleText } });
    case 'backup':
      return React.createElement(Archive, { size, style: { color: colors.secondaryText } });
    case 'cover_letter':
      return React.createElement(FileText, { size, style: { color: colors.successGreen } });
    case 'transcript':
      return React.createElement(FileText, { size, style: { color: colors.badgeInfoText } });
    case 'certification':
      return React.createElement(Award, { size, style: { color: colors.badgeWarningText } });
    case 'reference':
      return React.createElement(UserCheck, { size, style: { color: colors.badgePurpleText } });
    case 'portfolio':
      return React.createElement(Briefcase, { size, style: { color: colors.primaryBlue } });
    case 'work_sample':
      return React.createElement(FileCode, { size, style: { color: colors.successGreen } });
    case 'document':
    default:
      return React.createElement(FileText, { size, style: { color: colors.secondaryText } });
  }
};

export const getTypeColor = (type: string, colors: any) => {
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

export const getPermissionColor = (permission: string, colors: any) => {
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

export const formatLastModified = (date: string): string => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return dateObj.toLocaleDateString();
};

