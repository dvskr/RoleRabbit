/**
 * Spacing constants for consistent UI across Templates components
 * Based on Tailwind spacing scale for maintainability
 */

export const SPACING = {
  // Component padding
  cardPadding: 'p-4', // Consistent padding for cards
  modalPadding: 'p-4 sm:p-6', // Modal padding (mobile-responsive)
  sectionPadding: 'p-3 sm:p-4', // Section padding

  // Margins
  sectionMargin: 'mb-3 sm:mb-4', // Space between major sections
  componentMargin: 'mb-2 sm:mb-3', // Space between components
  elementMargin: 'mb-2', // Space between small elements

  // Gaps (for flex/grid)
  gridGap: 'gap-3 sm:gap-4', // Template grid gap
  flexGapSmall: 'gap-2', // Small flex gap
  flexGapMedium: 'gap-3 sm:gap-4', // Medium flex gap
  flexGapLarge: 'gap-4 sm:gap-6', // Large flex gap

  // Button padding
  buttonPaddingSmall: 'px-3 py-2', // Small buttons (e.g., icon buttons with text)
  buttonPaddingMedium: 'px-4 py-2', // Medium buttons (primary actions)
  buttonPaddingLarge: 'px-6 py-3', // Large buttons (CTAs)
  buttonPaddingMobile: 'py-3 sm:py-2', // Touch-friendly on mobile

  // Icon button padding
  iconButtonPadding: 'p-2', // Icon-only buttons
  iconButtonPaddingMobile: 'p-3 sm:p-2', // Touch-friendly icon buttons

  // Touch targets (minimum 44px on mobile per accessibility guidelines)
  touchTarget: 'min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0',

  // Border radius (for consistency with rounded elements)
  radiusSmall: 'rounded-md', // Small radius (chips, badges)
  radiusMedium: 'rounded-lg', // Medium radius (cards, buttons)
  radiusLarge: 'rounded-xl', // Large radius (modals, hero elements)
  radiusFull: 'rounded-full', // Full radius (avatars, pills)
} as const;

/**
 * Raw spacing values (in pixels or rem units)
 * Use when you need numeric values for calculations or inline styles
 */
export const SPACING_VALUES = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

/**
 * Common layout patterns
 */
export const LAYOUT_PATTERNS = {
  // Header layout
  header: 'px-4 py-4 sm:py-5',

  // Content container
  contentContainer: 'p-2 sm:p-4',

  // Grid layouts (responsive template grids)
  gridSingle: 'grid grid-cols-1',
  gridResponsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridTwoCol: 'grid grid-cols-1 sm:grid-cols-2',
  gridThreeCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',

  // Flex patterns
  flexRow: 'flex items-center gap-2',
  flexCol: 'flex flex-col gap-2',
  flexBetween: 'flex items-center justify-between',
  flexCenter: 'flex items-center justify-center',
} as const;
