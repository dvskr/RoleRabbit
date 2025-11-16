/**
 * TEST-008: Unit tests for filename sanitization logic
 */

import { sanitizeFilename, validateFilename } from '../validation';

describe('Filename Sanitization - TEST-008', () => {
  describe('sanitizeFilename', () => {
    it('should sanitize dangerous characters', () => {
      const result = sanitizeFilename('test<file>.pdf');
      expect(result).toBe('test_file_.pdf');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove leading/trailing spaces and dots', () => {
      const result = sanitizeFilename('  test.pdf  ');
      expect(result).toBe('test.pdf');
    });

    it('should handle empty filename', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('file');
    });

    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result).toContain('.pdf');
    });

    it('should preserve valid characters', () => {
      const result = sanitizeFilename('my-resume-2024.pdf');
      expect(result).toBe('my-resume-2024.pdf');
    });
  });

  describe('validateFilename', () => {
    it('should validate clean filename', () => {
      const result = validateFilename('test-file.pdf');
      expect(result.valid).toBe(true);
    });

    it('should provide sanitized version for invalid filename', () => {
      const result = validateFilename('test<file>.pdf');
      expect(result.valid).toBe(false);
      expect(result.sanitized).toBeDefined();
    });

    it('should reject reserved Windows names', () => {
      const result = validateFilename('CON.pdf');
      expect(result.valid).toBe(false);
    });
  });
});

