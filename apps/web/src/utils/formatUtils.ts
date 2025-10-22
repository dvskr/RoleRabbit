// Format utility functions
import { ResumeData } from '../types/resume';

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Format date for display
 */
export const formatDate = (date: string): string => {
  if (!date) return '';
  
  // Handle common date formats
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return date; // Return original if not a valid date
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

/**
 * Format URL for display
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration (e.g., "2 years 3 months")
 */
export const formatDuration = (startDate: string, endDate: string): string => {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  const end = endDate === 'Present' || !endDate ? new Date() : new Date(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) result += `${years > 0 ? ' ' : ''}${months} month${months > 1 ? 's' : ''}`;
  
  return result || 'Less than 1 month';
};

/**
 * Format skills list for display
 */
export const formatSkillsList = (skills: string[], maxDisplay: number = 10): string => {
  if (!skills || skills.length === 0) return '';
  
  if (skills.length <= maxDisplay) {
    return skills.join(', ');
  }
  
  const displayedSkills = skills.slice(0, maxDisplay);
  const remainingCount = skills.length - maxDisplay;
  
  return `${displayedSkills.join(', ')} (+${remainingCount} more)`;
};

/**
 * Format resume data for preview
 */
export const formatResumeForPreview = (resumeData: ResumeData) => {
  return {
    ...resumeData,
    phone: formatPhoneNumber(resumeData.phone),
    linkedin: formatUrl(resumeData.linkedin || ''),
    github: formatUrl(resumeData.github || ''),
    website: formatUrl(resumeData.website || ''),
    experience: resumeData.experience.map(exp => ({
      ...exp,
      period: formatDate(exp.period),
      endPeriod: exp.endPeriod === 'Present' ? 'Present' : formatDate(exp.endPeriod)
    })),
    education: resumeData.education.map(edu => ({
      ...edu,
      startDate: formatDate(edu.startDate),
      endDate: edu.endDate === 'Present' ? 'Present' : formatDate(edu.endDate)
    }))
  };
};
