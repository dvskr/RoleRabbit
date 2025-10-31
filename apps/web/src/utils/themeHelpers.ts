import { ThemeColors } from '../contexts/ThemeContext';

/**
 * Get badge styles for job status
 */
export function getStatusBadgeStyles(status: string, colors: ThemeColors) {
  switch (status) {
    case 'applied':
      return {
        background: colors.badgeInfoBg,
        color: colors.badgeInfoText,
        border: colors.badgeInfoBorder,
      };
    case 'interview':
      return {
        background: colors.badgeWarningBg,
        color: colors.badgeWarningText,
        border: colors.badgeWarningBorder,
      };
    case 'offer':
      return {
        background: colors.badgeSuccessBg,
        color: colors.badgeSuccessText,
        border: colors.badgeSuccessBorder,
      };
    case 'rejected':
      return {
        background: colors.badgeErrorBg,
        color: colors.badgeErrorText,
        border: colors.badgeErrorBorder,
      };
    default:
      return {
        background: colors.badgeNeutralBg,
        color: colors.badgeNeutralText,
        border: colors.badgeNeutralBorder,
      };
  }
}

/**
 * Get badge styles for job priority
 */
export function getPriorityBadgeStyles(priority: string, colors: ThemeColors) {
  switch (priority) {
    case 'high':
      return {
        background: colors.badgeErrorBg,
        color: colors.errorRed,
        border: colors.badgeErrorBorder,
      };
    case 'medium':
      return {
        background: colors.badgeWarningBg,
        color: colors.warningYellow,
        border: colors.badgeWarningBorder,
      };
    case 'low':
      return {
        background: colors.badgeSuccessBg,
        color: colors.successGreen,
        border: colors.badgeSuccessBorder,
      };
    default:
      return {
        background: colors.badgeNeutralBg,
        color: colors.badgeNeutralText,
        border: colors.badgeNeutralBorder,
      };
  }
}

