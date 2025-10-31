import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { CredentialInfo } from '../../../../types/cloudStorage';
import { CredentialStatus, ReminderPriority } from '../types';

export interface StatusColorStyle {
  text: string;
  bg: string;
}

export interface ReminderPriorityColorStyle {
  border: string;
  bg: string;
}

/**
 * Gets the color styling for a credential verification status
 */
export function getStatusColor(
  status: CredentialStatus,
  colors: {
    successGreen: string;
    errorRed: string;
    badgeWarningText: string;
    badgeWarningBg: string;
    badgeSuccessBg: string;
    badgeErrorBg: string;
    secondaryText: string;
    inputBackground: string;
  }
): StatusColorStyle {
  switch (status) {
    case 'verified':
      return { text: colors.successGreen, bg: colors.badgeSuccessBg };
    case 'expired':
      return { text: colors.errorRed, bg: colors.badgeErrorBg };
    case 'pending':
      return { text: colors.badgeWarningText, bg: colors.badgeWarningBg };
    case 'revoked':
      return { text: colors.secondaryText, bg: colors.inputBackground };
    default:
      return { text: colors.secondaryText, bg: colors.inputBackground };
  }
}

/**
 * Gets the icon component for a credential verification status
 */
export function getStatusIcon(
  status: CredentialStatus,
  colors: {
    successGreen: string;
    errorRed: string;
    badgeWarningText: string;
    secondaryText: string;
  }
): React.ReactNode {
  switch (status) {
    case 'verified':
      return <CheckCircle size={16} style={{ color: colors.successGreen }} />;
    case 'expired':
      return <XCircle size={16} style={{ color: colors.errorRed }} />;
    case 'pending':
      return <Clock size={16} style={{ color: colors.badgeWarningText }} />;
    case 'revoked':
      return <XCircle size={16} style={{ color: colors.secondaryText }} />;
    default:
      return <Clock size={16} style={{ color: colors.secondaryText }} />;
  }
}

/**
 * Gets the color styling for a reminder priority level
 */
export function getReminderPriorityColor(
  priority: ReminderPriority,
  colors: {
    errorRed: string;
    badgeWarningText: string;
    badgeWarningBg: string;
    primaryBlue: string;
    badgeInfoBg: string;
    badgeErrorBg: string;
    border: string;
    inputBackground: string;
  }
): ReminderPriorityColorStyle {
  switch (priority) {
    case 'high':
      return { border: colors.errorRed, bg: colors.badgeErrorBg };
    case 'medium':
      return { border: colors.badgeWarningText, bg: colors.badgeWarningBg };
    case 'low':
      return { border: colors.primaryBlue, bg: colors.badgeInfoBg };
    default:
      return { border: colors.border, bg: colors.inputBackground };
  }
}

/**
 * Formats credential type for display
 */
export function formatCredentialType(credentialType: CredentialInfo['credentialType']): string {
  return credentialType.replace('_', ' ').toUpperCase();
}

