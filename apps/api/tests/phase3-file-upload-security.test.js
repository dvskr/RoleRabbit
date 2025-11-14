/**
 * Phase 3: File Upload Security Tests
 * Tests for file validation, sanitization, and security checks
 */

const {
  validateFileUpload,
  sanitizeFilename,
  validateBufferContent,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE
} = require('../middleware/fileUploadSecurity');

describe('Phase 3: File Upload Security', () => {
  describe('3.1 File Validation', () => {
    test('should accept valid PDF file', () => {
      const file = {
        filename: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 500000 // 500KB
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept valid DOCX file', () => {
      const file = {
        filename: 'resume.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 300000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(true);
    });

    test('should accept valid image file', () => {
      const file = {
        filename: 'resume.png',
        mimetype: 'image/png',
        size: 800000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(true);
    });

    test('should reject file that is too large', () => {
      const file = {
        filename: 'huge-resume.pdf',
        mimetype: 'application/pdf',
        size: MAX_FILE_SIZE + 1
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    test('should reject file that is too small', () => {
      const file = {
        filename: 'empty.pdf',
        mimetype: 'application/pdf',
        size: MIN_FILE_SIZE - 1
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too small');
    });

    test('should reject invalid MIME type', () => {
      const file = {
        filename: 'malicious.exe',
        mimetype: 'application/x-msdownload',
        size: 500000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    test('should reject invalid file extension', () => {
      const file = {
        filename: 'resume.exe',
        mimetype: 'application/pdf', // Lying about MIME type
        size: 500000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file extension');
    });

    test('should reject no file', () => {
      const result = validateFileUpload(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No file provided');
    });
  });

  describe('3.2 Filename Sanitization', () => {
    test('should keep clean filename unchanged', () => {
      const filename = 'john_doe_resume.pdf';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toBe(filename);
    });

    test('should remove path traversal attempts', () => {
      const filename = '../../etc/passwd';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
    });

    test('should remove dangerous characters', () => {
      const filename = 'resume<script>alert(1)</script>.pdf';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('(');
      expect(sanitized).not.toContain(')');
      // "script" itself is fine, it's the special chars that are dangerous
      expect(sanitized).toMatch(/^[a-zA-Z0-9._-]+$/);
    });

    test('should handle spaces in filename', () => {
      const filename = 'John Doe Resume 2024.pdf';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toBe('John_Doe_Resume_2024.pdf');
    });

    test('should limit filename length', () => {
      const filename = 'a'.repeat(200) + '.pdf';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized.length).toBeLessThanOrEqual(100);
      expect(sanitized).toMatch(/\.pdf$/);
    });

    test('should handle null filename', () => {
      const sanitized = sanitizeFilename(null);
      expect(sanitized).toMatch(/^upload_\d+\.pdf$/);
    });

    test('should handle empty filename', () => {
      const sanitized = sanitizeFilename('');
      expect(sanitized).toMatch(/^upload_\d+\.pdf$/);
    });

    test('should preserve file extension', () => {
      const filename = 'résumé.pdf';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toMatch(/\.pdf$/);
    });
  });

  describe('3.3 Suspicious Filename Detection', () => {
    test('should reject path traversal', () => {
      const file = {
        filename: '../../../etc/passwd.pdf',
        mimetype: 'application/pdf',
        size: 500000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid filename');
    });

    test('should reject executable extensions', () => {
      const file = {
        filename: 'resume.pdf.exe',
        mimetype: 'application/pdf',
        size: 500000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
    });

    test('should reject null bytes', () => {
      const file = {
        filename: 'resume\0.pdf',
        mimetype: 'application/pdf',
        size: 500000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
    });

    test('should reject extremely long filenames', () => {
      const file = {
        filename: 'a'.repeat(300) + '.pdf',
        mimetype: 'application/pdf',
        size: 500000
      };

      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('3.4 Buffer Content Validation', () => {
    test('should validate PDF magic number', () => {
      // PDF starts with %PDF (0x25 0x50 0x44 0x46)
      const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, ...Array(1000).fill(0)]);
      const result = validateBufferContent(buffer, 'application/pdf');
      expect(result.valid).toBe(true);
    });

    test('should validate PNG magic number', () => {
      // PNG starts with 0x89 0x50 0x4E 0x47
      const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, ...Array(1000).fill(0)]);
      const result = validateBufferContent(buffer, 'image/png');
      expect(result.valid).toBe(true);
    });

    test('should validate JPEG magic number', () => {
      // JPEG starts with 0xFF 0xD8 0xFF
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF, ...Array(1000).fill(0)]);
      const result = validateBufferContent(buffer, 'image/jpeg');
      expect(result.valid).toBe(true);
    });

    test('should reject buffer with wrong magic number', () => {
      // Wrong magic number for PDF
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, ...Array(1000).fill(0)]);
      const result = validateBufferContent(buffer, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match declared type');
    });

    test('should reject buffer that is too small', () => {
      const buffer = Buffer.from([0x25, 0x50]);
      const result = validateBufferContent(buffer, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too small');
    });

    test('should reject buffer that is too large', () => {
      const buffer = Buffer.alloc(MAX_FILE_SIZE + 1);
      const result = validateBufferContent(buffer, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    test('should reject null buffer', () => {
      const result = validateBufferContent(null, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid buffer');
    });

    test('should reject non-buffer', () => {
      const result = validateBufferContent('not a buffer', 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid buffer');
    });
  });

  describe('3.5 Integration Tests', () => {
    test('should validate complete valid upload flow', () => {
      const file = {
        filename: 'John_Doe_Resume.pdf',
        mimetype: 'application/pdf',
        size: 500000
      };

      // Step 1: Validate file
      const fileValidation = validateFileUpload(file);
      expect(fileValidation.valid).toBe(true);

      // Step 2: Sanitize filename
      const sanitizedFilename = sanitizeFilename(file.filename);
      expect(sanitizedFilename).toBe('John_Doe_Resume.pdf');

      // Step 3: Validate buffer
      const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, ...Array(1000).fill(0)]);
      const bufferValidation = validateBufferContent(buffer, file.mimetype);
      expect(bufferValidation.valid).toBe(true);
    });

    test('should reject malicious upload attempt', () => {
      const file = {
        filename: '../../../etc/passwd.exe',
        mimetype: 'application/x-msdownload',
        size: 500000
      };

      // Should fail at file validation
      const fileValidation = validateFileUpload(file);
      expect(fileValidation.valid).toBe(false);
    });

    test('should reject file with mismatched type and content', () => {
      const file = {
        filename: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 500000
      };

      // Step 1: File validation passes
      const fileValidation = validateFileUpload(file);
      expect(fileValidation.valid).toBe(true);

      // Step 2: Buffer validation fails (wrong magic number)
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, ...Array(1000).fill(0)]);
      const bufferValidation = validateBufferContent(buffer, file.mimetype);
      expect(bufferValidation.valid).toBe(false);
    });
  });
});

