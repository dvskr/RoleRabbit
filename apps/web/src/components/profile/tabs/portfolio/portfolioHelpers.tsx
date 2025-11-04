/**
 * Portfolio Tab - Helper Functions
 * 
 * Pure utility functions for portfolio operations
 */

import React from 'react';
import { FileText, ExternalLink, Github, Award, Trophy, Link2, Globe } from 'lucide-react';

/**
 * Returns the appropriate icon component for a given platform
 */
export const getPlatformIcon = (platform: string): React.ReactNode => {
  const iconClass = "w-5 h-5";
  switch (platform) {
    case 'LinkedIn':
      return <Link2 className={iconClass} />;
    case 'GitHub':
      return <Github className={iconClass} />;
    case 'Twitter':
      return <FileText className={iconClass} />;
    case 'Medium':
      return <FileText className={iconClass} />;
    case 'Portfolio':
    case 'Personal Website':
      return <Globe className={iconClass} />;
    default:
      return <ExternalLink className={iconClass} />;
  }
};

/**
 * Returns the appropriate icon component for a given achievement type
 */
export const getAchievementIcon = (
  type: string,
  colors: {
    badgeWarningText: string;
    primaryBlue: string;
    badgePurpleText: string;
    successGreen: string;
    tertiaryText: string;
  }
): React.ReactNode => {
  switch (type) {
    case 'Award':
      return <Trophy size={20} style={{ color: colors.badgeWarningText }} />;
    case 'Publication':
      return <FileText size={20} style={{ color: colors.primaryBlue }} />;
    case 'Speaking':
      return <FileText size={20} style={{ color: colors.badgePurpleText }} />;
    case 'Certification':
      return <Award size={20} style={{ color: colors.successGreen }} />;
    default:
      return <Trophy size={20} style={{ color: colors.tertiaryText }} />;
  }
};

/**
 * Validates a link form
 */
export const validateLink = (link: { platform: string; url: string }): boolean => {
  return !!(link.url && link.url.trim());
};

/**
 * Validates a project form
 */
export const validateProject = (project: {
  title: string;
  description: string;
  technologies: string[];
  date: string;
}): boolean => {
  return !!(project.title && project.title.trim());
};

/**
 * Validates an achievement form
 */
export const validateAchievement = (achievement: {
  title: string;
  description: string;
  date: string;
}): boolean => {
  return !!(achievement.title && achievement.title.trim());
};
