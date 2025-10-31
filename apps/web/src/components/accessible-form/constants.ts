// Accessible Form Component Constants

export const BUTTON_VARIANT_CLASSES = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
} as const;

export const BUTTON_SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
} as const;

export const BASE_INPUT_CLASSES = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500';

export const ERROR_INPUT_CLASSES = 'border-red-300 focus:ring-red-500 focus:border-red-500';

export const BASE_LABEL_CLASSES = 'block text-sm font-medium text-gray-700';

export const BASE_ERROR_CLASSES = 'text-sm text-red-600';

export const BASE_HELPER_CLASSES = 'text-sm text-gray-500';

export const REQUIRED_MARKER_CLASSES = 'text-red-500 ml-1';

