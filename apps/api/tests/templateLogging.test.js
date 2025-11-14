/**
 * Tests for Template Logging Middleware
 */

const { getEndpointName, logTemplateError, logTemplateInfo } = require('../middleware/templateLogging');
const logger = require('../utils/logger');

jest.mock('../utils/logger');

describe('Template Logging Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEndpointName', () => {
    it('should normalize template ID paths', () => {
      expect(getEndpointName('/api/templates/tpl_abc123')).toBe('/api/templates/:id');
      expect(getEndpointName('/api/templates/tpl_xyz789')).toBe('/api/templates/:id');
    });

    it('should normalize favorite paths', () => {
      expect(getEndpointName('/api/templates/tpl_abc123/favorite')).toBe('/api/templates/:id/favorite');
    });

    it('should normalize track paths', () => {
      expect(getEndpointName('/api/templates/tpl_abc123/track')).toBe('/api/templates/:id/track');
    });

    it('should normalize stats paths', () => {
      expect(getEndpointName('/api/templates/tpl_abc123/stats')).toBe('/api/templates/:id/stats');
    });

    it('should normalize favorites check paths', () => {
      expect(getEndpointName('/api/templates/favorites/check/tpl_abc123')).toBe('/api/templates/favorites/check/:id');
    });

    it('should keep other paths unchanged', () => {
      expect(getEndpointName('/api/templates')).toBe('/api/templates');
      expect(getEndpointName('/api/templates/search')).toBe('/api/templates/search');
      expect(getEndpointName('/api/templates/stats')).toBe('/api/templates/stats');
    });

    it('should remove query parameters', () => {
      expect(getEndpointName('/api/templates?page=1&limit=10')).toBe('/api/templates');
      expect(getEndpointName('/api/templates/tpl_abc123?include=details')).toBe('/api/templates/:id');
    });
  });

  describe('logTemplateError', () => {
    it('should log error with context and additional data', () => {
      const error = new Error('Test error');
      const additionalData = { userId: 'user_123', templateId: 'tpl_456' };

      logTemplateError('Test context', error, additionalData);

      expect(logger.error).toHaveBeenCalledWith(
        '[Template Service Error] Test context',
        expect.objectContaining({
          error: 'Test error',
          stack: expect.any(String),
          userId: 'user_123',
          templateId: 'tpl_456'
        })
      );
    });

    it('should handle errors without additional data', () => {
      const error = new Error('Simple error');

      logTemplateError('Simple context', error);

      expect(logger.error).toHaveBeenCalledWith(
        '[Template Service Error] Simple context',
        expect.objectContaining({
          error: 'Simple error',
          stack: expect.any(String)
        })
      );
    });
  });

  describe('logTemplateInfo', () => {
    it('should log info message with data', () => {
      const data = { userId: 'user_123', action: 'preview' };

      logTemplateInfo('Template action', data);

      expect(logger.info).toHaveBeenCalledWith('[Template Service] Template action', data);
    });

    it('should handle info messages without data', () => {
      logTemplateInfo('Simple message');

      expect(logger.info).toHaveBeenCalledWith('[Template Service] Simple message', {});
    });
  });
});
