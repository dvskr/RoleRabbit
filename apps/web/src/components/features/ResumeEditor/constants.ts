/**
 * Constants for ResumeEditor component
 */

export const FONT_FAMILY_OPTIONS = [
  { value: 'arial', label: 'Arial (ATS Recommended)' },
  { value: 'calibri', label: 'Calibri' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'helvetica', label: 'Helvetica' },
] as const;

export const FONT_SIZE_OPTIONS = [
  { value: 'ats10pt', label: '10pt', badge: 'ATS' },
  { value: 'ats11pt', label: '11pt', badge: 'ATS' },
  { value: 'ats12pt', label: '12pt', badge: 'ATS' },
] as const;

export const LINE_SPACING_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'loose', label: 'Loose' },
] as const;

export const SECTION_SPACING_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'medium', label: 'Medium' },
  { value: 'loose', label: 'Loose' },
] as const;

export const MARGIN_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
] as const;

export const HEADING_STYLE_OPTIONS = [
  { value: 'bold', label: 'Bold' },
  { value: 'semibold', label: 'Semi Bold' },
  { value: 'extrabold', label: 'Extra Bold' },
] as const;

export const BULLET_STYLE_OPTIONS = [
  { value: 'disc', symbol: '•' },
  { value: 'circle', symbol: '◦' },
  { value: 'square', symbol: '▪' },
  { value: 'arrow', symbol: '→' },
  { value: 'check', symbol: '✓' },
  { value: 'dash', symbol: '–' },
] as const;

export const STANDARD_CONTACT_FIELDS = [
  'email',
  'phone',
  'location',
  'linkedin',
  'github',
  'website',
] as const;

export const SIDEBAR_DIMENSIONS = {
  EXPANDED_WIDTH: '288px',
  COLLAPSED_WIDTH: '48px',
  EXPANDED_PADDING: '24px',
  COLLAPSED_PADDING: '8px',
} as const;

