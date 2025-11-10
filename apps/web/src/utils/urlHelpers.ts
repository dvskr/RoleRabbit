/**
 * URL helper utilities
 * @module utils/urlHelpers
 */

/**
 * Normalize a URL by ensuring it has a proper protocol (https)
 * @param url - The URL to normalize
 * @returns Normalized URL with https:// prefix, or null if URL is empty
 */
export const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  // If it already has a protocol, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If it starts with //, assume https
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  // Otherwise, prepend https://
  return `https://${trimmed}`;
};

/**
 * Validate if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || !url.trim()) return false;

  const normalized = normalizeUrl(url);
  if (!normalized) return false;

  try {
    const urlObj = new URL(normalized);
    // Check that it has a valid protocol and host
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
           urlObj.host.length > 0;
  } catch {
    return false;
  }
};

/**
 * Validation result for URL validation
 */
export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validate a URL and return detailed validation result
 * @param url - The URL to validate
 * @param fieldName - Optional field name for error messages
 * @returns Validation result with isValid, error message, and normalized URL
 */
export const validateUrl = (
  url: string | null | undefined,
  fieldName: string = 'URL'
): UrlValidationResult => {
  if (!url || !url.trim()) {
    return { isValid: true }; // Empty URLs are valid (optional fields)
  }

  const normalized = normalizeUrl(url);
  if (!normalized) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
    };
  }

  try {
    const urlObj = new URL(normalized);

    // Check protocol
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        isValid: false,
        error: `${fieldName} must use http:// or https:// protocol`,
      };
    }

    // Check host
    if (!urlObj.host || urlObj.host.length === 0) {
      return {
        isValid: false,
        error: `${fieldName} must have a valid domain`,
      };
    }

    // Valid URL
    return {
      isValid: true,
      normalized,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `${fieldName} is not a valid URL format`,
    };
  }
};
