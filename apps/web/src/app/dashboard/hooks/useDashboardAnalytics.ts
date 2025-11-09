/**
 * Custom hook for managing dashboard analytics features visibility
 */

import { useState } from 'react';

export interface UseDashboardAnalyticsReturn {
  showCoverLetterAnalytics: boolean;
  setShowCoverLetterAnalytics: (show: boolean) => void;
  showEmailAnalytics: boolean;
  setShowEmailAnalytics: (show: boolean) => void;
  showApplicationAnalytics: boolean;
  setShowApplicationAnalytics: (show: boolean) => void;
}

/**
 * Hook for managing analytics features visibility
 */
export function useDashboardAnalytics(): UseDashboardAnalyticsReturn {
  const [showCoverLetterAnalytics, setShowCoverLetterAnalytics] = useState(false);
  const [showEmailAnalytics, setShowEmailAnalytics] = useState(false);
  const [showApplicationAnalytics, setShowApplicationAnalytics] = useState(false);

  return {
    showCoverLetterAnalytics,
    setShowCoverLetterAnalytics,
    showEmailAnalytics,
    setShowEmailAnalytics,
    showApplicationAnalytics,
    setShowApplicationAnalytics,
  };
}

