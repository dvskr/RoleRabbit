/**
 * URL Validation and Sanitization - Section 6.2
 *
 * Validates and sanitizes URLs to prevent XSS and other attacks
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const BLOCKED_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
];

const LOCALHOST_PATTERNS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.',
  '10.',
  '172.16.',
  '192.168.',
];

/**
 * Validate URL and check if it's safe
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Trim and lowercase for checking
  const trimmedUrl = url.trim().toLowerCase();

  // Check for blocked protocols
  for (const protocol of BLOCKED_PROTOCOLS) {
    if (trimmedUrl.startsWith(protocol)) {
      return false;
    }
  }

  try {
    const parsedUrl = new URL(url);

    // Check if protocol is allowed
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      return false;
    }

    // Check for localhost/internal IPs (prevent SSRF)
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      const hostname = parsedUrl.hostname.toLowerCase();

      for (const pattern of LOCALHOST_PATTERNS) {
        if (hostname.includes(pattern) || hostname.startsWith(pattern)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

/**
 * Sanitize URL - returns empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) {
    return '';
  }

  const trimmedUrl = url.trim();

  if (!isValidUrl(trimmedUrl)) {
    return '';
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    // Enforce HTTPS for http URLs (upgrade)
    if (parsedUrl.protocol === 'http:') {
      parsedUrl.protocol = 'https:';
    }

    return parsedUrl.toString();
  } catch (error) {
    return '';
  }
}

/**
 * Validate URL for external links
 * Allows http/https only
 */
export function isValidExternalUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email for mailto links
 */
export function sanitizeEmailUrl(email: string): string {
  if (!isValidEmail(email)) {
    return '';
  }

  return `mailto:${email}`;
}

/**
 * Validate and sanitize social media URL
 */
export function sanitizeSocialUrl(url: string, platform: string): string {
  const socialDomains: Record<string, string[]> = {
    twitter: ['twitter.com', 'x.com'],
    linkedin: ['linkedin.com'],
    github: ['github.com'],
    instagram: ['instagram.com'],
    facebook: ['facebook.com'],
    youtube: ['youtube.com'],
  };

  if (!isValidExternalUrl(url)) {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    const allowedDomains = socialDomains[platform.toLowerCase()] || [];

    const isAllowed = allowedDomains.some((domain) =>
      parsedUrl.hostname.endsWith(domain)
    );

    if (!isAllowed) {
      return '';
    }

    // Enforce HTTPS
    parsedUrl.protocol = 'https:';

    return parsedUrl.toString();
  } catch (error) {
    return '';
  }
}

/**
 * Add rel attributes for external links
 */
export function getSecureRelAttribute(): string {
  return 'noopener noreferrer';
}

/**
 * Validate subdomain for portfolio
 */
export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain || typeof subdomain !== 'string') {
    return false;
  }

  // Subdomain validation rules:
  // - 3-63 characters
  // - lowercase letters, numbers, hyphens only
  // - must start with letter
  // - cannot end with hyphen
  const subdomainRegex = /^[a-z][a-z0-9-]{1,61}[a-z0-9]$/;

  return subdomainRegex.test(subdomain);
}

/**
 * Sanitize subdomain
 */
export function sanitizeSubdomain(subdomain: string): string {
  if (!subdomain) {
    return '';
  }

  return subdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .substring(0, 63);
}

/**
 * Check if URL is safe for iframe embedding
 */
export function isSafeForIframe(url: string): boolean {
  if (!isValidExternalUrl(url)) {
    return false;
  }

  // Allow only specific trusted domains for iframe embedding
  const trustedDomains = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'codepen.io',
    'codesandbox.io',
  ];

  try {
    const parsedUrl = new URL(url);

    return trustedDomains.some((domain) =>
      parsedUrl.hostname.endsWith(domain)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!isValidExternalUrl(url)) {
    return false;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  const urlLower = url.toLowerCase();
  return imageExtensions.some((ext) => urlLower.includes(ext));
}

/**
 * Validate custom domain
 */
export function isValidCustomDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Domain validation:
  // - Must be valid hostname
  // - Cannot be localhost or internal
  // - Must have TLD
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  if (!domainRegex.test(domain)) {
    return false;
  }

  // Check not localhost/internal
  const domainLower = domain.toLowerCase();
  for (const pattern of LOCALHOST_PATTERNS) {
    if (domainLower.includes(pattern) || domainLower.startsWith(pattern)) {
      return false;
    }
  }

  return true;
}
