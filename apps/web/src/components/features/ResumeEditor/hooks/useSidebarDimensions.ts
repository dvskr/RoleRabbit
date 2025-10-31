import { useMemo } from 'react';
import { SIDEBAR_DIMENSIONS } from '../constants';

/**
 * Hook to calculate sidebar dimensions based on collapse state
 * @param isCollapsed - Whether the sidebar is collapsed
 * @returns Object with width and padding values
 */
export const useSidebarDimensions = (isCollapsed: boolean) => {
  return useMemo(() => ({
    width: isCollapsed ? SIDEBAR_DIMENSIONS.COLLAPSED_WIDTH : SIDEBAR_DIMENSIONS.EXPANDED_WIDTH,
    padding: isCollapsed ? SIDEBAR_DIMENSIONS.COLLAPSED_PADDING : SIDEBAR_DIMENSIONS.EXPANDED_PADDING,
  }), [isCollapsed]);
};

