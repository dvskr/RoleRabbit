/**
 * TEST-007: Unit tests for file validation logic
 */

import {
  validateFileSize,
  validateMimeType,
  validateFilename,
  validateFileTypeRestriction,
} from '../validation';

describe('File Validation - TEST-007', () => {
  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateFileSize(file, 10 * 1024 * 1024); // 10MB limit
      expect(result.valid).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      const result = validateFileSize(file, 10 * 1024 * 1024); // 10MB limit
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });
  });

  describe('validateMimeType', () => {
    it('should validate MIME type', async () => {
      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await validateMimeType(file);
      expect(result.valid).toBe(true);
    });

    it('should validate against allowed types', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await validateMimeType(file, ['.pdf', '.docx']);
      expect(result.valid).toBe(true);
    });

    it('should reject disallowed types', async () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const result = await validateMimeType(file, ['.pdf', '.docx']);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFilename', () => {
    it('should validate valid filename', () => {
      const result = validateFilename('test-file.pdf');
      expect(result.valid).toBe(true);
    });

    it('should reject filename with dangerous characters', () => {
      const result = validateFilename('test<file>.pdf');
      expect(result.valid).toBe(false);
      expect(result.sanitized).toBeDefined();
    });

    it('should reject filename exceeding max length', () => {
      const longName = 'a'.repeat(300);
      const result = validateFilename(longName);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileTypeRestriction', () => {
    it('should validate file type for category', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      const result = validateFileTypeRestriction(file, 'resume');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid file type for category', () => {
      const file = new File(['content'], 'resume.exe', { type: 'application/x-msdownload' });
      const result = validateFileTypeRestriction(file, 'resume');
      expect(result.valid).toBe(false);
    });
  });
});

