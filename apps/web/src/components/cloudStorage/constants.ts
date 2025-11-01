// Modal constants
export const MODAL_BACKDROP_STYLE = 'rgba(0, 0, 0, 0.85)';
export const MODAL_MAX_WIDTH = 'max-w-md';

// Download format options
export const DOWNLOAD_FORMATS = {
  PDF: 'pdf',
  DOC: 'doc',
} as const;

export type DownloadFormat = typeof DOWNLOAD_FORMATS[keyof typeof DOWNLOAD_FORMATS];

// File operation constants
export const FILE_EDIT_PROMPT_MESSAGE = 'Enter new file name:';

// Default loading message
export const DEFAULT_LOADING_MESSAGE = 'Loading files...';

