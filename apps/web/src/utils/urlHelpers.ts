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
