/**
 * Hook for managing file action states (download format menu, etc.)
 */

import { useState } from 'react';

export const useFileActions = () => {
  const [showDownloadFormat, setShowDownloadFormat] = useState(false);

  return {
    showDownloadFormat,
    setShowDownloadFormat,
  };
};

