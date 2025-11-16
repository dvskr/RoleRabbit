/**
 * Log Sanitizer - Section 6.5
 *
 * Ensure logs never contain sensitive data
 * Mask passwords, tokens, API keys, credit cards before logging
 */

/**
 * Sensitive data patterns
 */
const SENSITIVE_PATTERNS: Record<string, RegExp> = {
  password: /("password"\s*:\s*")([^"]+)"/gi,
  token: /("token"\s*:\s*")([^"]+)"/gi,
  apiKey: /("api[_-]?key"\s*:\s*")([^"]+)"/gi,
  jwt: /(eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  authHeader: /(Bearer\s+)([^\s]+)/gi,
  secretKey: /("secret[_-]?key"\s*:\s*")([^"]+)"/gi,
  encryptionKey: /("encryption[_-]?key"\s*:\s*")([^"]+)"/gi,
};

/**
 * Sensitive field names to always mask
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apiKey',
  'api-key',
  'private_key',
  'privateKey',
  'encryption_key',
  'encryptionKey',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'session_token',
  'sessionToken',
  'credit_card',
  'creditCard',
  'card_number',
  'cardNumber',
  'cvv',
  'ssn',
  'social_security',
];

/**
 * Sanitize log message
 * Removes/masks sensitive data
 */
export function sanitizeLogMessage(message: string): string {
  let sanitized = message;

  // Apply all sensitive patterns
  for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    sanitized = sanitized.replace(pattern, (match, prefix, value) => {
      if (prefix) {
        // JSON field: "password": "value" -> "password": "***"
        return `${prefix}***"`;
      } else {
        // Standalone value
        return '***';
      }
    });
  }

  return sanitized;
}

/**
 * Sanitize object for logging
 * Recursively masks sensitive fields
 */
export function sanitizeLogObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeLogMessage(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeLogObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();

      // Check if field name is sensitive
      if (SENSITIVE_FIELDS.some(field => keyLower.includes(field))) {
        sanitized[key] = '***';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeLogObject(value);
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeLogMessage(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return obj;
}

/**
 * Mask credit card number
 * Shows only last 4 digits
 */
export function maskCreditCard(cardNumber: string): string {
  if (cardNumber.length < 4) {
    return '***';
  }

  const last4 = cardNumber.slice(-4);
  return `****-****-****-${last4}`;
}

/**
 * Mask email address
 * Shows first character and domain
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');

  if (!domain) {
    return '***';
  }

  return `${local[0]}***@${domain}`;
}

/**
 * Mask phone number
 * Shows only last 4 digits
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 4) {
    return '***';
  }

  const last4 = digits.slice(-4);
  return `***-***-${last4}`;
}

/**
 * Mask JWT token
 * Shows only header
 */
export function maskJWT(token: string): string {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return '***';
  }

  return `${parts[0]}.***.***`;
}

/**
 * Mask IP address (last octet)
 * For privacy while keeping geolocation
 */
export function maskIPAddress(ip: string): string {
  const parts = ip.split('.');

  if (parts.length !== 4) {
    return '***';
  }

  return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
}

/**
 * Create safe log entry
 * Combines message and metadata, sanitizes both
 */
export function createSafeLogEntry(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  metadata?: Record<string, any>
): {
  level: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
} {
  return {
    level,
    message: sanitizeLogMessage(message),
    metadata: metadata ? sanitizeLogObject(metadata) : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Safe logger wrapper
 * Automatically sanitizes all log output
 */
export class SafeLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, metadata?: Record<string, any>): void {
    const entry = createSafeLogEntry('info', message, metadata);
    console.log(JSON.stringify({ ...entry, context: this.context }));
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const entry = createSafeLogEntry('warn', message, metadata);
    console.warn(JSON.stringify({ ...entry, context: this.context }));
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = createSafeLogEntry('error', message, {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    });
    console.error(JSON.stringify({ ...entry, context: this.context }));
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = createSafeLogEntry('debug', message, metadata);
      console.debug(JSON.stringify({ ...entry, context: this.context }));
    }
  }
}

/**
 * Sanitize HTTP headers
 * Remove sensitive headers before logging
 */
export function sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
  const sanitized = { ...headers };

  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token',
  ];

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '***';
    }
    if (sanitized[header.toLowerCase()]) {
      sanitized[header.toLowerCase()] = '***';
    }
  }

  return sanitized;
}

/**
 * Sanitize URL
 * Remove query parameters that may contain sensitive data
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove sensitive query parameters
    const sensitiveParams = [
      'token',
      'api_key',
      'apiKey',
      'access_token',
      'password',
      'secret',
    ];

    for (const param of sensitiveParams) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '***');
      }
    }

    return parsed.toString();
  } catch (error) {
    // Invalid URL, return as-is
    return url;
  }
}

/**
 * Sanitize error for logging
 * Remove sensitive data from error messages
 */
export function sanitizeError(error: Error): {
  message: string;
  name: string;
  stack?: string;
} {
  return {
    message: sanitizeLogMessage(error.message),
    name: error.name,
    stack: error.stack ? sanitizeLogMessage(error.stack) : undefined,
  };
}

/**
 * Check if string contains sensitive data
 */
export function containsSensitiveData(text: string): boolean {
  for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}
