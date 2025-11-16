/**
 * BE-048: Input sanitization for XSS prevention
 * Sanitizes HTML in comments and descriptions
 */

const logger = require('./logger');

// Basic HTML tag whitelist (for comments/descriptions)
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'];
const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title']
};

/**
 * Sanitize HTML string to prevent XSS
 * Removes dangerous tags and attributes
 */
function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers (onclick, onerror, etc.)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol (can be used for XSS)
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocol

  // For a more robust solution, consider using DOMPurify or similar
  // For now, we'll do basic sanitization
  
  return sanitized.trim();
}

/**
 * Sanitize plain text (remove HTML entirely)
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove all HTML tags
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[#\w]+;/g, '') // Remove HTML entities (basic)
    .trim();
}

/**
 * Sanitize file name to prevent path traversal and XSS
 */
function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }

  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove dangerous characters
    .replace(/\.\./g, '') // Remove path traversal attempts
    .trim();
}

/**
 * Sanitize folder name
 */
function sanitizeFolderName(folderName) {
  if (!folderName || typeof folderName !== 'string') {
    return '';
  }

  return folderName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove dangerous characters
    .replace(/\.\./g, '') // Remove path traversal attempts
    .trim();
}

/**
 * Sanitize comment content
 * BE-048: Input sanitization for XSS in comments
 */
function sanitizeComment(comment) {
  if (!comment || typeof comment !== 'string') {
    return '';
  }

  // For comments, we allow basic HTML formatting but sanitize it
  return sanitizeHTML(comment);
}

/**
 * Sanitize file description
 * BE-048: Input sanitization for XSS in descriptions
 */
function sanitizeDescription(description) {
  if (!description || typeof description !== 'string') {
    return '';
  }

  // For descriptions, we allow basic HTML formatting but sanitize it
  return sanitizeHTML(description);
}

/**
 * Sanitize email address (basic validation)
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, ''); // Remove < and > which could be used for XSS
}

module.exports = {
  sanitizeHTML,
  sanitizeText,
  sanitizeFileName,
  sanitizeFolderName,
  sanitizeComment,
  sanitizeDescription,
  sanitizeEmail
};

