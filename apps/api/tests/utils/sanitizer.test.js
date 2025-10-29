const { 
  sanitizeString, 
  sanitizeObject, 
  sanitizeURL,
  sanitizeEmail 
} = require('../../utils/sanitizer');

describe('Sanitizer', () => {
  test('should sanitize strings', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<script>');
  });

  test('should sanitize URLs', () => {
    const dangerous = 'javascript:alert("xss")';
    const sanitized = sanitizeURL(dangerous);
    expect(sanitized).not.toContain('javascript:');
  });

  test('should sanitize emails', () => {
    const email = '<script>test@example.com';
    const sanitized = sanitizeEmail(email);
    expect(sanitized).not.toContain('<');
    expect(sanitized).toContain('@');
  });

  test('should recursively sanitize objects', () => {
    const malicious = {
      name: '<script>alert("xss")</script>',
      nested: {
        value: 'javascript:alert("xss")'
      }
    };
    const sanitized = sanitizeObject(malicious);
    expect(sanitized.name).not.toContain('<script>');
    expect(sanitized.nested.value).not.toContain('javascript:');
  });
});

