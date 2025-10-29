/**
 * Security Tests
 * Testing security utilities
 */

const { sanitizeInput, getRateLimitConfig } = require('../../utils/security');

describe('Security Utilities Tests', () => {
  describe('Input Sanitization', () => {
    test('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    test('should sanitize SQL injection attempts', () => {
      const input = "test'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain("DROP TABLE");
    });

    test('should handle null/undefined gracefully', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    test('should sanitize object inputs', () => {
      const input = {
        name: '<b>Test</b>',
        email: 'test@example.com'
      };

      const sanitized = sanitizeInput(input);
      expect(sanitized.name).not.toContain('<b>');
      expect(sanitized.email).toBe('test@example.com');
    });
  });

  describe('Rate Limit Configuration', () => {
    test('should return rate limit config', () => {
      const config = getRateLimitConfig();

      expect(config).toBeDefined();
      expect(config.maxRequests).toBeDefined();
      expect(config.windowMs).toBeDefined();
    });

    test('should have reasonable defaults', () => {
      const config = getRateLimitConfig();

      expect(config.maxRequests).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
    });

    test('should handle different endpoints', () => {
      const authConfig = getRateLimitConfig('auth');
      const apiConfig = getRateLimitConfig('api');

      expect(authConfig).toBeDefined();
      expect(apiConfig).toBeDefined();
    });
  });

  describe('XSS Protection', () => {
    test('should escape JavaScript', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('<script>');
    });

    test('should escape event handlers', () => {
      const input = 'onclick="alert(\'xss\')"';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('onclick=');
    });
  });

  describe('SQL Injection Protection', () => {
    test('should escape SQL special characters', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    test('should handle union-based attacks', () => {
      const input = "' UNION SELECT * FROM users --";
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('UNION');
      expect(sanitized).not.toContain('SELECT');
    });
  });
});

