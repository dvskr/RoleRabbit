/**
 * Tests for Template Monitoring Utilities
 */

const {
  trackTemplateUsage,
  trackFavoriteAdd,
  trackFavoriteRemove,
  updateFavoritesGauge,
  trackTemplateOperation,
  trackPreferencesUpdate,
  getRequestContext
} = require('../utils/templateMonitoring');

const { logAuditEvent, AuditActions } = require('../utils/auditLogger');
const { templateUsageCounter, templateFavoritesGauge } = require('../observability/metrics');

jest.mock('../utils/auditLogger');
jest.mock('../observability/metrics');
jest.mock('../middleware/templateLogging');

describe('Template Monitoring Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackTemplateUsage', () => {
    it('should track usage event with metrics and audit log', async () => {
      const params = {
        userId: 'user_123',
        templateId: 'tpl_456',
        action: 'PREVIEW',
        category: 'ATS',
        metadata: { source: 'search' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      };

      await trackTemplateUsage(params);

      expect(templateUsageCounter.inc).toHaveBeenCalledWith({
        action: 'PREVIEW',
        templateId: 'tpl_456',
        category: 'ATS'
      });

      expect(logAuditEvent).toHaveBeenCalledWith({
        userId: 'user_123',
        action: AuditActions.TEMPLATE_PREVIEW,
        resource: 'TEMPLATE',
        resourceId: 'tpl_456',
        details: expect.objectContaining({
          action: 'PREVIEW',
          category: 'ATS',
          source: 'search'
        }),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should handle missing optional fields', async () => {
      const params = {
        userId: 'user_123',
        action: 'DOWNLOAD'
      };

      await trackTemplateUsage(params);

      expect(templateUsageCounter.inc).toHaveBeenCalledWith({
        action: 'DOWNLOAD',
        templateId: 'unknown',
        category: 'unknown'
      });
    });

    it('should not throw on errors', async () => {
      logAuditEvent.mockRejectedValue(new Error('Audit error'));

      await expect(
        trackTemplateUsage({
          userId: 'user_123',
          templateId: 'tpl_456',
          action: 'USE'
        })
      ).resolves.not.toThrow();
    });
  });

  describe('trackFavoriteAdd', () => {
    it('should log favorite addition', async () => {
      const params = {
        userId: 'user_123',
        templateId: 'tpl_456',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      };

      await trackFavoriteAdd(params);

      expect(logAuditEvent).toHaveBeenCalledWith({
        userId: 'user_123',
        action: AuditActions.TEMPLATE_FAVORITE_ADD,
        resource: 'TEMPLATE_FAVORITE',
        resourceId: 'tpl_456',
        details: { action: 'add' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should not throw on errors', async () => {
      logAuditEvent.mockRejectedValue(new Error('Audit error'));

      await expect(
        trackFavoriteAdd({
          userId: 'user_123',
          templateId: 'tpl_456'
        })
      ).resolves.not.toThrow();
    });
  });

  describe('trackFavoriteRemove', () => {
    it('should log favorite removal', async () => {
      const params = {
        userId: 'user_123',
        templateId: 'tpl_456',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      };

      await trackFavoriteRemove(params);

      expect(logAuditEvent).toHaveBeenCalledWith({
        userId: 'user_123',
        action: AuditActions.TEMPLATE_FAVORITE_REMOVE,
        resource: 'TEMPLATE_FAVORITE',
        resourceId: 'tpl_456',
        details: { action: 'remove' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    });
  });

  describe('updateFavoritesGauge', () => {
    it('should update Prometheus gauge metric', () => {
      updateFavoritesGauge('tpl_123', 42);

      expect(templateFavoritesGauge.set).toHaveBeenCalledWith({ templateId: 'tpl_123' }, 42);
    });

    it('should not throw on errors', () => {
      templateFavoritesGauge.set.mockImplementation(() => {
        throw new Error('Metrics error');
      });

      expect(() => updateFavoritesGauge('tpl_123', 42)).not.toThrow();
    });
  });

  describe('trackTemplateOperation', () => {
    it('should track create operation', async () => {
      const params = {
        operation: 'create',
        userId: 'user_123',
        templateId: 'tpl_456',
        changes: { name: 'New Template' },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      };

      await trackTemplateOperation(params);

      expect(logAuditEvent).toHaveBeenCalledWith({
        userId: 'user_123',
        action: AuditActions.TEMPLATE_CREATE,
        resource: 'TEMPLATE',
        resourceId: 'tpl_456',
        details: expect.objectContaining({
          operation: 'create',
          changes: { name: 'New Template' }
        }),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should track update operation', async () => {
      const params = {
        operation: 'update',
        userId: 'user_123',
        templateId: 'tpl_456',
        changes: { difficulty: 'ADVANCED' }
      };

      await trackTemplateOperation(params);

      expect(logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditActions.TEMPLATE_UPDATE
        })
      );
    });

    it('should track delete operation', async () => {
      const params = {
        operation: 'delete',
        userId: 'user_123',
        templateId: 'tpl_456'
      };

      await trackTemplateOperation(params);

      expect(logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditActions.TEMPLATE_DELETE
        })
      );
    });

    it('should not throw on errors', async () => {
      logAuditEvent.mockRejectedValue(new Error('Audit error'));

      await expect(
        trackTemplateOperation({
          operation: 'create',
          userId: 'user_123',
          templateId: 'tpl_456'
        })
      ).resolves.not.toThrow();
    });
  });

  describe('trackPreferencesUpdate', () => {
    it('should track preferences update', async () => {
      const params = {
        userId: 'user_123',
        preferences: {
          sortPreference: 'newest',
          viewMode: 'grid'
        },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      };

      await trackPreferencesUpdate(params);

      expect(logAuditEvent).toHaveBeenCalledWith({
        userId: 'user_123',
        action: AuditActions.TEMPLATE_PREFERENCES_UPDATE,
        resource: 'TEMPLATE_PREFERENCES',
        resourceId: 'user_123',
        details: expect.objectContaining({
          preferences: {
            sortPreference: 'newest',
            viewMode: 'grid'
          }
        }),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should not throw on errors', async () => {
      logAuditEvent.mockRejectedValue(new Error('Audit error'));

      await expect(
        trackPreferencesUpdate({
          userId: 'user_123',
          preferences: {}
        })
      ).resolves.not.toThrow();
    });
  });

  describe('getRequestContext', () => {
    it('should extract user ID, IP, and user agent from request', () => {
      const request = {
        user: { id: 'user_123' },
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'Mozilla/5.0'
        }
      };

      const context = getRequestContext(request);

      expect(context).toEqual({
        userId: 'user_123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });
    });

    it('should handle missing user', () => {
      const request = {
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'Mozilla/5.0'
        }
      };

      const context = getRequestContext(request);

      expect(context.userId).toBeNull();
    });

    it('should fallback to x-forwarded-for header for IP', () => {
      const request = {
        headers: {
          'x-forwarded-for': '10.0.0.1',
          'user-agent': 'Mozilla/5.0'
        }
      };

      const context = getRequestContext(request);

      expect(context.ip).toBe('10.0.0.1');
    });

    it('should fallback to socket address for IP', () => {
      const request = {
        socket: {
          remoteAddress: '172.16.0.1'
        },
        headers: {
          'user-agent': 'Mozilla/5.0'
        }
      };

      const context = getRequestContext(request);

      expect(context.ip).toBe('172.16.0.1');
    });

    it('should handle missing user agent', () => {
      const request = {
        ip: '192.168.1.1',
        headers: {}
      };

      const context = getRequestContext(request);

      expect(context.userAgent).toBe('unknown');
    });
  });
});
