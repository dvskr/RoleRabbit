/**
 * Input Sanitization Service - Section 6.2
 *
 * Sanitizes user inputs to prevent XSS and other injection attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize HTML for rich text editor
 * More permissive for editing
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    ALLOWED_ATTR: [
      'href',
      'class',
      'id',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'style',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Strip all HTML tags
 * Returns plain text only
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text input
 * Escapes HTML entities
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize JSON data
 * Recursively sanitizes all string values
 */
export function sanitizeJson(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeJson);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        sanitized[key] = sanitizeJson(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitize user input for display
 * Used for portfolio titles, descriptions, etc.
 */
export function sanitizeUserInput(input: string, allowHtml: boolean = false): string {
  if (allowHtml) {
    return sanitizeHtml(input);
  }
  return sanitizeText(input);
}

/**
 * Sanitize markdown content
 * Converts markdown to HTML and sanitizes
 */
export function sanitizeMarkdown(markdown: string): string {
  // Note: In production, use a markdown library like 'marked' or 'remark'
  // For now, we'll just sanitize as HTML
  return sanitizeHtml(markdown);
}

/**
 * Validate and sanitize file path
 * Prevents path traversal attacks
 */
export function sanitizeFilePath(filePath: string): string {
  // Remove any path traversal attempts
  return filePath
    .replace(/\.\./g, '')
    .replace(/\/\//g, '/')
    .replace(/\\/g, '/')
    .trim();
}

/**
 * Sanitize SQL-like strings (defense in depth)
 * Note: Always use parameterized queries, this is just additional protection
 */
export function sanitizeSqlString(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys(obj: any): any {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectKeys);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !dangerousKeys.includes(key)) {
        sanitized[key] = sanitizeObjectKeys(obj[key]);
      }
    }

    return sanitized;
  }

  return obj;
}
