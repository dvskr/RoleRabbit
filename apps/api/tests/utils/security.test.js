/**
 * Security Tests
 * Testing security utilities
 */

const { sanitizeInput, getRateLimitConfig } = require('../../utils/security');

describe('Security Utilities Tests', () => {
  describe('Input Sanitization', () => {
    test('should remove script tags but keep remaining text', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('Hello');
    });

    test('should leave non-script strings untouched', () => {
      const input = "test'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);

      expect(sanitized).toBe(input);
    });

    test('should handle null/undefined gracefully', () => {
      expect(sanitizeInput(null)).toBeNull();
      expect(sanitizeInput(undefined)).toBeUndefined();
    });

    test('should sanitize objects recursively', () => {
      const input = {
        name: '<script>alert(1)</script>Pat',
        email: 'test@example.com'
      };

      const sanitized = sanitizeInput(input);
      expect(sanitized.name).toBe('Pat');
      expect(sanitized.email).toBe('test@example.com');
    });
  });

  describe('Rate Limit Configuration', () => {
    test('should return rate limit config with defaults', () => {
      const config = getRateLimitConfig();

      expect(config).toBeDefined();
      expect(config.max).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
      expect(config.standardHeaders).toBe(true);
    });
  });

  describe('XSS Protection', () => {
    test('should strip script tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);

      expect(sanitized).toBe('');
    });

    test('should strip inline event handlers', () => {
      const input = '<button onclick="doBadStuff()">Click</button>';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('onclick');
    });
  });
});

