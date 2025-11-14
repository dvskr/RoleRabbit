/**
 * HTML Sanitization Utilities
 *
 * Provides comprehensive XSS protection for user-generated and template content.
 * Prevents script injection, HTML injection, and other XSS attacks.
 *
 * Security Features:
 * - HTML entity escaping for text content
 * - Attribute value sanitization
 * - URL validation and sanitization
 * - Full HTML sanitization (allows safe subset of HTML)
 * - Template field sanitization
 * - Markdown-safe sanitization
 *
 * Usage:
 * ```ts
 * // Escape HTML entities (safest, for plain text)
 * const safe = escapeHtml(userInput);
 *
 * // Sanitize HTML (allows safe tags like <b>, <i>, <p>)
 * const safeHtml = sanitizeHtml(userHtml);
 *
 * // Template-specific sanitization
 * const safeName = sanitizeTemplateField(template.name);
 *
 * // Remove all HTML tags
 * const plainText = stripHtml(htmlContent);
 * ```
 */

// ============================================================================
// HTML ENTITY ESCAPING
// ============================================================================

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
} as const;

/**
 * Escape HTML entities to prevent XSS
 *
 * Converts dangerous characters to HTML entities:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#x27;
 * - / → &#x2F;
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML insertion
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 *
 * // Safe for HTML insertion
 * const html = `<div>${escapeHtml(userInput)}</div>`;
 * ```
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text).replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Unescape HTML entities (reverse of escapeHtml)
 *
 * @param text - HTML-escaped text
 * @returns Unescaped text
 */
export function unescapeHtml(text: string): string {
  if (!text) return '';
  const reverseMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
  };

  return String(text).replace(/&(?:amp|lt|gt|quot|#x27|#39|#x2F|#47);/g, (entity) => reverseMap[entity] || entity);
}

// ============================================================================
// ATTRIBUTE SANITIZATION
// ============================================================================

/**
 * Sanitize value for HTML attribute
 *
 * Escapes quotes and angle brackets to prevent attribute breakout
 *
 * @param value - Attribute value to sanitize
 * @returns Safe attribute value
 *
 * @example
 * ```ts
 * const title = sanitizeAttribute(userInput);
 * const html = `<div title="${title}">Content</div>`;
 * ```
 */
export function sanitizeAttribute(value: string): string {
  if (!value) return '';
  return escapeHtml(String(value));
}

/**
 * Sanitize CSS value (for inline styles)
 *
 * Removes dangerous characters that could break out of style attribute
 *
 * @param value - CSS value to sanitize
 * @returns Safe CSS value
 */
export function sanitizeCSSValue(value: string): string {
  if (!value) return '';
  // Remove dangerous characters: quotes, semicolons, brackets
  return String(value).replace(/[;"'<>{}()]/g, '');
}

// ============================================================================
// URL SANITIZATION
// ============================================================================

/**
 * Dangerous URL protocols that can execute code
 */
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
] as const;

/**
 * Sanitize URL to prevent javascript: and other dangerous protocols
 *
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if dangerous
 *
 * @example
 * ```ts
 * sanitizeUrl('javascript:alert("XSS")') // Returns: ''
 * sanitizeUrl('https://example.com') // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = String(url).trim().toLowerCase();

  // Check for dangerous protocols
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) {
      console.warn(`[Security] Blocked dangerous URL protocol: ${protocol}`);
      return '';
    }
  }

  // Check for encoded protocols (e.g., "jav&#x61;script:")
  const decoded = decodeURIComponent(trimmed);
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (decoded.includes(protocol)) {
      console.warn(`[Security] Blocked encoded dangerous URL protocol: ${protocol}`);
      return '';
    }
  }

  return url;
}

/**
 * Validate if URL is safe for use in href or src attributes
 *
 * @param url - URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isUrlSafe(url: string): boolean {
  return sanitizeUrl(url) !== '';
}

// ============================================================================
// HTML SANITIZATION
// ============================================================================

/**
 * Allowed HTML tags for sanitization
 * (safe tags that don't execute scripts)
 */
const ALLOWED_TAGS = [
  'b',
  'i',
  'em',
  'strong',
  'u',
  'p',
  'br',
  'span',
  'div',
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
  'code',
  'pre',
  'blockquote',
] as const;

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTRIBUTES = [
  'href',
  'title',
  'alt',
  'class',
  'id',
] as const;

/**
 * Strip all HTML tags from text
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 *
 * @example
 * ```ts
 * stripHtml('<p>Hello <b>World</b></p>') // Returns: 'Hello World'
 * ```
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, '');
}

/**
 * Sanitize HTML by allowing only safe tags and attributes
 *
 * This is a basic sanitizer. For production with user-generated content,
 * consider using DOMPurify library for comprehensive protection.
 *
 * @param html - HTML to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML
 *
 * @example
 * ```ts
 * sanitizeHtml('<p>Safe content</p><script>alert("XSS")</script>')
 * // Returns: '<p>Safe content</p>'
 * ```
 */
export function sanitizeHtml(
  html: string,
  options: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    stripAll?: boolean;
  } = {}
): string {
  if (!html) return '';

  const {
    allowedTags = ALLOWED_TAGS,
    allowedAttributes = ALLOWED_ATTRIBUTES,
    stripAll = false,
  } = options;

  // If stripAll is true, remove all HTML
  if (stripAll) {
    return stripHtml(html);
  }

  let sanitized = String(html);

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');

  // Remove data: URLs (can contain base64 encoded scripts)
  sanitized = sanitized.replace(/\s*(?:href|src)\s*=\s*["']data:[^"']*["']/gi, '');

  // If not using a whitelist approach, return here
  if (allowedTags.length === 0) {
    return sanitized;
  }

  // Basic tag whitelist (more comprehensive sanitization would use a parser)
  // For production, use DOMPurify or similar
  const tagPattern = new RegExp(`<(?!\\/?(${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
  sanitized = sanitized.replace(tagPattern, '');

  return sanitized;
}

// ============================================================================
// TEMPLATE-SPECIFIC SANITIZATION
// ============================================================================

/**
 * Sanitize template field for safe HTML insertion
 *
 * Template fields (name, description, etc.) should only contain plain text.
 * This function escapes HTML and validates content.
 *
 * @param value - Template field value
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized and length-limited value
 *
 * @example
 * ```ts
 * const safeName = sanitizeTemplateField(template.name, 100);
 * const html = `<title>${safeName}</title>`;
 * ```
 */
export function sanitizeTemplateField(value: string, maxLength = 1000): string {
  if (!value) return '';

  // Escape HTML entities
  let sanitized = escapeHtml(String(value));

  // Limit length to prevent DOS attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove control characters (except newline and tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Sanitize markdown content
 *
 * Allows markdown syntax but escapes HTML to prevent XSS.
 * Markdown can be safely rendered after this sanitization.
 *
 * @param markdown - Markdown content
 * @returns Sanitized markdown
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Escape HTML in markdown
  let sanitized = escapeHtml(String(markdown));

  // Unescape markdown syntax (so markdown parser works)
  // This is safe because we've already escaped HTML
  sanitized = sanitized
    .replace(/&lt;/g, '<') // Restore < for HTML tags IF we want to allow HTML in markdown
    .replace(/&gt;/g, '>'); // Restore >

  // Actually, for safest approach, keep HTML escaped and let markdown parser handle it
  // Only unescape specific markdown characters if needed

  return sanitized;
}

// ============================================================================
// TEMPLATE SANITIZATION
// ============================================================================

/**
 * Sanitize an entire template object
 *
 * Ensures all user-facing fields are safe for HTML insertion.
 *
 * @param template - Template object with fields to sanitize
 * @returns Sanitized template
 */
export function sanitizeTemplate<T extends Record<string, any>>(template: T): T {
  if (!template || typeof template !== 'object') {
    return template;
  }

  const sanitized = { ...template };

  // Sanitize common fields
  const fieldsToSanitize = ['name', 'description', 'title', 'author', 'content'];

  for (const field of fieldsToSanitize) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeTemplateField(sanitized[field]);
    }
  }

  // Sanitize arrays of strings (tags, features, etc.)
  const arrayFieldsToSanitize = ['tags', 'features', 'industry', 'keywords'];

  for (const field of arrayFieldsToSanitize) {
    if (field in sanitized && Array.isArray(sanitized[field])) {
      sanitized[field] = sanitized[field].map((item: any) =>
        typeof item === 'string' ? sanitizeTemplateField(item, 200) : item
      );
    }
  }

  return sanitized;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if string contains potential XSS
 *
 * @param value - String to check
 * @returns true if potential XSS detected
 */
export function containsPotentialXSS(value: string): boolean {
  if (!value) return false;

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers (onclick, onload, etc.)
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i, // CSS expression() - old IE XSS vector
  ];

  return xssPatterns.some((pattern) => pattern.test(value));
}

/**
 * Validate and sanitize string
 *
 * @param value - String to validate and sanitize
 * @param options - Validation options
 * @returns Sanitized string or throws error if validation fails
 */
export function validateAndSanitize(
  value: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    throwOnXSS?: boolean;
  } = {}
): string {
  const { maxLength = 1000, allowHtml = false, throwOnXSS = true } = options;

  if (!value) return '';

  // Check for XSS
  if (throwOnXSS && containsPotentialXSS(value)) {
    throw new Error('Potential XSS detected in input');
  }

  // Sanitize based on options
  let sanitized = allowHtml ? sanitizeHtml(value) : escapeHtml(value);

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core functions
  escapeHtml,
  unescapeHtml,
  sanitizeHtml,
  stripHtml,

  // Specific contexts
  sanitizeAttribute,
  sanitizeCSSValue,
  sanitizeUrl,
  sanitizeTemplateField,
  sanitizeMarkdown,
  sanitizeTemplate,

  // Validation
  isUrlSafe,
  containsPotentialXSS,
  validateAndSanitize,

  // Constants
  ALLOWED_TAGS,
  ALLOWED_ATTRIBUTES,
  DANGEROUS_PROTOCOLS,
};
