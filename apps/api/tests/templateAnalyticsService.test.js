/**
 * Unit Tests for Template Analytics Service
 * Tests usage tracking, stats, popular templates, and history
 */

const {
  trackUsage,
  getTemplateStats,
  getPopularTemplates,
  getTrendingTemplates,
  getUserHistory,
} = require('../services/templateAnalyticsService');

// Mock Prisma
jest.mock('../utils/db', () => ({
  prisma: {
    templateUsageHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    resumeTemplate: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require('../utils/db');

describe('TemplateAnalyticsService', () => {
  const mockUserId = 'user_123';
  const mockTemplateId = 'tpl_456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackUsage', () => {
    it('should track PREVIEW action', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        name: 'Test Template',
        isActive: true,
      };

      const mockUsageRecord = {
        userId: mockUserId,
        templateId: mockTemplateId,
        action: 'PREVIEW',
        createdAt: new Date(),
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.create.mockResolvedValue(mockUsageRecord);

      const result = await trackUsage(mockUserId, mockTemplateId, 'PREVIEW');

      expect(result.success).toBe(true);
      expect(result.message).toContain('tracked successfully');
      expect(prisma.templateUsageHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          templateId: mockTemplateId,
          action: 'PREVIEW',
          metadata: {},
        },
      });
    });

    it('should track DOWNLOAD action and increment download count', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        name: 'Test Template',
        downloads: 100,
        isActive: true,
      };

      const mockUsageRecord = {
        userId: mockUserId,
        templateId: mockTemplateId,
        action: 'DOWNLOAD',
        createdAt: new Date(),
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.create.mockResolvedValue(mockUsageRecord);
      prisma.resumeTemplate.update.mockResolvedValue({
        ...mockTemplate,
        downloads: 101,
      });

      const result = await trackUsage(mockUserId, mockTemplateId, 'DOWNLOAD');

      expect(result.success).toBe(true);
      expect(prisma.resumeTemplate.update).toHaveBeenCalledWith({
        where: { id: mockTemplateId },
        data: { downloads: { increment: 1 } },
      });
    });

    it('should track USE action', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        isActive: true,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.create.mockResolvedValue({
        userId: mockUserId,
        templateId: mockTemplateId,
        action: 'USE',
      });

      const result = await trackUsage(mockUserId, mockTemplateId, 'USE');

      expect(result.success).toBe(true);
    });

    it('should store metadata with tracking', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        isActive: true,
      };

      const metadata = {
        source: 'search',
        query: 'professional resume',
        position: 3,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.create.mockResolvedValue({
        userId: mockUserId,
        templateId: mockTemplateId,
        action: 'PREVIEW',
        metadata,
      });

      const result = await trackUsage(mockUserId, mockTemplateId, 'PREVIEW', metadata);

      expect(result.success).toBe(true);
      expect(prisma.templateUsageHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata,
        }),
      });
    });

    it('should return error if template does not exist', async () => {
      prisma.resumeTemplate.findUnique.mockResolvedValue(null);

      const result = await trackUsage(mockUserId, 'nonexistent', 'PREVIEW');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(prisma.templateUsageHistory.create).not.toHaveBeenCalled();
    });

    it('should handle all action types', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        isActive: true,
        downloads: 100,
      };

      const actions = ['PREVIEW', 'DOWNLOAD', 'USE', 'FAVORITE', 'SHARE'];

      for (const action of actions) {
        prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
        prisma.templateUsageHistory.create.mockResolvedValue({
          userId: mockUserId,
          templateId: mockTemplateId,
          action,
        });
        prisma.resumeTemplate.update.mockResolvedValue(mockTemplate);

        const result = await trackUsage(mockUserId, mockTemplateId, action);
        expect(result.success).toBe(true);
      }
    });

    it('should handle database errors', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        isActive: true,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.create.mockRejectedValue(
        new Error('Database error')
      );

      const result = await trackUsage(mockUserId, mockTemplateId, 'PREVIEW');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getTemplateStats', () => {
    it('should return template usage statistics', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        name: 'Test Template',
        downloads: 500,
        rating: 4.5,
      };

      const mockUsageData = [
        { action: 'PREVIEW', _count: { action: 1500 } },
        { action: 'DOWNLOAD', _count: { action: 500 } },
        { action: 'USE', _count: { action: 300 } },
        { action: 'FAVORITE', _count: { action: 150 } },
      ];

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.groupBy.mockResolvedValue(mockUsageData);

      const result = await getTemplateStats(mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.data.template.name).toBe('Test Template');
      expect(result.data.stats.previews).toBe(1500);
      expect(result.data.stats.downloads).toBe(500);
      expect(result.data.stats.uses).toBe(300);
      expect(result.data.stats.favorites).toBe(150);
    });

    it('should handle templates with no usage history', async () => {
      const mockTemplate = {
        id: mockTemplateId,
        name: 'New Template',
        downloads: 0,
        rating: 0,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.templateUsageHistory.groupBy.mockResolvedValue([]);

      const result = await getTemplateStats(mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.data.stats.previews).toBe(0);
      expect(result.data.stats.downloads).toBe(0);
      expect(result.data.stats.uses).toBe(0);
    });

    it('should return error for non-existent template', async () => {
      prisma.resumeTemplate.findUnique.mockResolvedValue(null);

      const result = await getTemplateStats('nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('getPopularTemplates', () => {
    it('should return popular templates by downloads', async () => {
      const mockPopularTemplates = [
        { templateId: 'tpl_1', _count: { templateId: 1000 } },
        { templateId: 'tpl_2', _count: { templateId: 500 } },
        { templateId: 'tpl_3', _count: { templateId: 250 } },
      ];

      const mockTemplates = [
        { id: 'tpl_1', name: 'Most Popular', downloads: 1000 },
        { id: 'tpl_2', name: 'Second Popular', downloads: 500 },
        { id: 'tpl_3', name: 'Third Popular', downloads: 250 },
      ];

      prisma.templateUsageHistory.groupBy.mockResolvedValue(mockPopularTemplates);
      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getPopularTemplates({ limit: 3 });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(3);
      expect(result.data[0].name).toBe('Most Popular');
      expect(result.data[0].usageCount).toBe(1000);
    });

    it('should filter by time period', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      prisma.templateUsageHistory.groupBy.mockResolvedValue([]);
      prisma.resumeTemplate.findMany.mockResolvedValue([]);

      await getPopularTemplates({ period: 'month' });

      expect(prisma.templateUsageHistory.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should filter by category', async () => {
      prisma.templateUsageHistory.groupBy.mockResolvedValue([]);
      prisma.resumeTemplate.findMany.mockResolvedValue([]);

      await getPopularTemplates({ category: 'ATS' });

      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'ATS',
          }),
        })
      );
    });

    it('should limit results', async () => {
      const mockPopularTemplates = Array(10).fill(null).map((_, i) => ({
        templateId: `tpl_${i}`,
        _count: { templateId: 100 - i },
      }));

      prisma.templateUsageHistory.groupBy.mockResolvedValue(mockPopularTemplates);
      prisma.resumeTemplate.findMany.mockResolvedValue([]);

      const result = await getPopularTemplates({ limit: 5 });

      expect(result.success).toBe(true);
      expect(prisma.templateUsageHistory.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe('getTrendingTemplates', () => {
    it('should return trending templates based on recent growth', async () => {
      const mockRecentUsage = [
        { templateId: 'tpl_1', _count: { templateId: 500 } },
        { templateId: 'tpl_2', _count: { templateId: 300 } },
      ];

      const mockTemplates = [
        { id: 'tpl_1', name: 'Trending Template 1', downloads: 1000 },
        { id: 'tpl_2', name: 'Trending Template 2', downloads: 600 },
      ];

      prisma.templateUsageHistory.groupBy.mockResolvedValue(mockRecentUsage);
      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getTrendingTemplates({ days: 7 });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toBe('Trending Template 1');
    });

    it('should default to 7 days lookback', async () => {
      prisma.templateUsageHistory.groupBy.mockResolvedValue([]);
      prisma.resumeTemplate.findMany.mockResolvedValue([]);

      await getTrendingTemplates();

      expect(prisma.templateUsageHistory.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('getUserHistory', () => {
    it('should return user template usage history', async () => {
      const mockHistory = [
        {
          templateId: 'tpl_1',
          action: 'PREVIEW',
          createdAt: new Date('2024-01-03'),
          template: { id: 'tpl_1', name: 'Template 1' },
        },
        {
          templateId: 'tpl_2',
          action: 'USE',
          createdAt: new Date('2024-01-02'),
          template: { id: 'tpl_2', name: 'Template 2' },
        },
        {
          templateId: 'tpl_1',
          action: 'DOWNLOAD',
          createdAt: new Date('2024-01-01'),
          template: { id: 'tpl_1', name: 'Template 1' },
        },
      ];

      prisma.templateUsageHistory.findMany.mockResolvedValue(mockHistory);

      const result = await getUserHistory(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(3);
      expect(result.data[0].action).toBe('PREVIEW');
      expect(prisma.templateUsageHistory.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: { template: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter history by action type', async () => {
      prisma.templateUsageHistory.findMany.mockResolvedValue([]);

      await getUserHistory(mockUserId, { action: 'DOWNLOAD' });

      expect(prisma.templateUsageHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: 'DOWNLOAD',
          }),
        })
      );
    });

    it('should filter history by template ID', async () => {
      prisma.templateUsageHistory.findMany.mockResolvedValue([]);

      await getUserHistory(mockUserId, { templateId: mockTemplateId });

      expect(prisma.templateUsageHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            templateId: mockTemplateId,
          }),
        })
      );
    });

    it('should limit history results', async () => {
      const mockHistory = Array(50).fill(null).map((_, i) => ({
        templateId: `tpl_${i}`,
        action: 'PREVIEW',
        createdAt: new Date(),
        template: { id: `tpl_${i}`, name: `Template ${i}` },
      }));

      prisma.templateUsageHistory.findMany.mockResolvedValue(
        mockHistory.slice(0, 10)
      );

      const result = await getUserHistory(mockUserId, { limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(10);
      expect(prisma.templateUsageHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should return empty array for user with no history', async () => {
      prisma.templateUsageHistory.findMany.mockResolvedValue([]);

      const result = await getUserHistory(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(0);
    });

    it('should handle database errors', async () => {
      prisma.templateUsageHistory.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const result = await getUserHistory(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
