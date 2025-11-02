const {
  UploadValidationError,
  sanitizeFilename,
  parseUploadFields,
  deriveDisplayNameFromFilename,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  MAX_DISPLAY_NAME_LENGTH
} = require('../../utils/uploadUtils');

describe('uploadUtils', () => {
  describe('sanitizeFilename', () => {
    it('replaces invalid characters and trims length', () => {
      const input = ' Résumé<>2025?.pdf ';
      const sanitized = sanitizeFilename(input);
      expect(sanitized).toBe('Résumé__2025_.pdf');
    });

    it('falls back to untitled when result is empty', () => {
      const sanitized = sanitizeFilename('@@@');
      expect(sanitized).toBe('untitled');
    });
  });

  describe('parseUploadFields', () => {
    const defaultOptions = {
      defaultDisplayName: 'resume',
      defaultType: 'document'
    };

    it('parses valid metadata from fields', () => {
      const fields = {
        displayName: { value: ' Senior Engineer Resume ' },
        type: { value: 'resume' },
        tags: { value: JSON.stringify(['react', 'node.js']) },
        description: { value: 'Updated resume for 2025 opportunities.' },
        folderId: { value: 'folder-123' },
        isPublic: { value: 'true' }
      };

      const metadata = parseUploadFields(fields, defaultOptions);

      expect(metadata).toEqual({
        displayName: 'Senior Engineer Resume',
        type: 'resume',
        tags: ['react', 'node.js'],
        description: 'Updated resume for 2025 opportunities.',
        folderId: 'folder-123',
        isPublic: true
      });
    });

    it('accepts comma separated tags and removes duplicates', () => {
      const fields = {
        tags: { value: 'react,  react ,node , ' }
      };

      const metadata = parseUploadFields(fields, defaultOptions);
      expect(metadata.tags).toEqual(['react', 'node']);
    });

    it('truncates overly long tags and enforces maximum tag count', () => {
      const longTag = 'x'.repeat(MAX_TAG_LENGTH + 10);
      const tags = Array.from({ length: MAX_TAGS }, (_, index) => `tag${index}`);
      const fields = {
        tags: { value: JSON.stringify([...tags, longTag]) }
      };

      expect(() => parseUploadFields(fields, defaultOptions)).toThrow(UploadValidationError);
    });

    it('throws when display name missing or empty', () => {
      const fields = {
        displayName: { value: '   ' }
      };

      expect(() => parseUploadFields(fields, defaultOptions)).toThrow('A display name is required');
    });

    it('throws when display name exceeds maximum length', () => {
      const fields = {
        displayName: { value: 'x'.repeat(MAX_DISPLAY_NAME_LENGTH + 1) }
      };

      expect(() => parseUploadFields(fields, defaultOptions)).toThrow('Display name is too long');
    });

    it('falls back to default type when provided type is invalid', () => {
      const fields = {
        displayName: { value: 'My File' },
        type: { value: 'invalid-type' }
      };

      const metadata = parseUploadFields(fields, defaultOptions);
      expect(metadata.type).toBe('document');
    });
  });

  describe('deriveDisplayNameFromFilename', () => {
    it('derives name without extension and sanitizes', () => {
      const derived = deriveDisplayNameFromFilename('resume v2!!.pdf');
      expect(derived).toBe('resume v2__');
    });
  });
});


