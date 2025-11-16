/**
 * Backend Unit Tests: PortfolioService (Section 5.2)
 *
 * Tests for portfolio CRUD operations with mocked database
 */

import { PortfolioService } from '../portfolio.service';
import { createMockPortfolio } from '@/../test/utils/test-helpers';

// Mock database client
jest.mock('@/database/client', () => ({
  createSupabaseServiceClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

describe('PortfolioService', () => {
  let service: PortfolioService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    };

    service = new PortfolioService();
    (service as any).db = {
      from: jest.fn(() => mockDb),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create portfolio successfully', async () => {
      const portfolioData = {
        title: 'Test Portfolio',
        templateId: 'template-1',
        userId: 'user-1',
      };

      const mockCreated = createMockPortfolio(portfolioData);

      mockDb.single.mockResolvedValueOnce({
        data: mockCreated,
        error: null,
      });

      const result = await service.create(portfolioData);

      expect(result).toEqual(mockCreated);
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Portfolio',
          template_id: 'template-1',
          user_id: 'user-1',
        })
      );
    });

    it('should handle database errors during creation', async () => {
      const portfolioData = {
        title: 'Test',
        templateId: 'template-1',
        userId: 'user-1',
      };

      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', code: '23505' },
      });

      await expect(service.create(portfolioData)).rejects.toThrow('Database error');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        templateId: 'template-1',
        userId: 'user-1',
      };

      await expect(service.create(invalidData)).rejects.toThrow('Title is required');
    });

    it('should set default values', async () => {
      const portfolioData = {
        title: 'Test',
        templateId: 'template-1',
        userId: 'user-1',
      };

      const mockCreated = createMockPortfolio(portfolioData);

      mockDb.single.mockResolvedValueOnce({
        data: mockCreated,
        error: null,
      });

      const result = await service.create(portfolioData);

      expect(result.isPublished).toBe(true);
      expect(result.settings).toBeDefined();
    });

    it('should generate subdomain if not provided', async () => {
      const portfolioData = {
        title: 'My Portfolio',
        templateId: 'template-1',
        userId: 'user-1',
      };

      const mockCreated = createMockPortfolio({
        ...portfolioData,
        subdomain: 'my-portfolio',
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockCreated,
        error: null,
      });

      const result = await service.create(portfolioData);

      expect(result.subdomain).toBeTruthy();
      expect(result.subdomain).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe('update', () => {
    it('should update portfolio successfully', async () => {
      const updates = {
        title: 'Updated Title',
        subtitle: 'Updated Subtitle',
      };

      const mockUpdated = createMockPortfolio({
        id: 'portfolio-1',
        ...updates,
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockUpdated,
        error: null,
      });

      const result = await service.update('portfolio-1', 'user-1', updates);

      expect(result).toEqual(mockUpdated);
      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
          subtitle: 'Updated Subtitle',
        })
      );
      expect(mockDb.eq).toHaveBeenCalledWith('id', 'portfolio-1');
      expect(mockDb.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should handle not found errors', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      });

      await expect(
        service.update('nonexistent', 'user-1', { title: 'Test' })
      ).rejects.toThrow('Portfolio not found');
    });

    it('should validate user ownership', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No rows found' },
      });

      await expect(
        service.update('portfolio-1', 'wrong-user', { title: 'Test' })
      ).rejects.toThrow();
    });

    it('should not allow updating userId', async () => {
      const updates = {
        userId: 'new-user',
      };

      await expect(
        service.update('portfolio-1', 'user-1', updates)
      ).rejects.toThrow('Cannot update userId');
    });

    it('should update updatedAt timestamp', async () => {
      const updates = { title: 'Updated' };

      const mockUpdated = createMockPortfolio({
        id: 'portfolio-1',
        ...updates,
      });

      mockDb.single.mockResolvedValueOnce({
        data: mockUpdated,
        error: null,
      });

      await service.update('portfolio-1', 'user-1', updates);

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });

  describe('delete', () => {
    it('should soft delete portfolio successfully', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: { id: 'portfolio-1', deleted_at: new Date().toISOString() },
        error: null,
      });

      await service.delete('portfolio-1', 'user-1');

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        })
      );
      expect(mockDb.eq).toHaveBeenCalledWith('id', 'portfolio-1');
      expect(mockDb.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should handle not found errors during deletion', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow();
    });

    it('should validate user ownership before deletion', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No rows found' },
      });

      await expect(service.delete('portfolio-1', 'wrong-user')).rejects.toThrow();
    });
  });

  describe('duplicate', () => {
    it('should duplicate portfolio with new title', async () => {
      const original = createMockPortfolio({
        id: 'original-id',
        title: 'Original Portfolio',
        userId: 'user-1',
      });

      mockDb.single
        .mockResolvedValueOnce({
          data: original,
          error: null,
        })
        .mockResolvedValueOnce({
          data: createMockPortfolio({
            id: 'new-id',
            title: 'Original Portfolio (Copy)',
            userId: 'user-1',
          }),
          error: null,
        });

      const result = await service.duplicate('original-id', 'user-1');

      expect(result.id).not.toBe(original.id);
      expect(result.title).toContain('Copy');
      expect(result.userId).toBe('user-1');
    });

    it('should copy all sections', async () => {
      const original = createMockPortfolio({
        id: 'original-id',
        sections: [
          { type: 'hero', content: { title: 'Hero' } },
          { type: 'about', content: { text: 'About' } },
        ],
      });

      mockDb.single
        .mockResolvedValueOnce({
          data: original,
          error: null,
        })
        .mockResolvedValueOnce({
          data: createMockPortfolio({
            id: 'new-id',
            sections: original.sections,
          }),
          error: null,
        });

      const result = await service.duplicate('original-id', 'user-1');

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].type).toBe('hero');
    });

    it('should generate new subdomain for duplicate', async () => {
      const original = createMockPortfolio({
        id: 'original-id',
        subdomain: 'original-subdomain',
      });

      mockDb.single
        .mockResolvedValueOnce({
          data: original,
          error: null,
        })
        .mockResolvedValueOnce({
          data: createMockPortfolio({
            id: 'new-id',
            subdomain: 'original-subdomain-copy',
          }),
          error: null,
        });

      const result = await service.duplicate('original-id', 'user-1');

      expect(result.subdomain).not.toBe(original.subdomain);
    });

    it('should not duplicate custom domain', async () => {
      const original = createMockPortfolio({
        id: 'original-id',
        customDomain: 'custom.example.com',
      });

      mockDb.single
        .mockResolvedValueOnce({
          data: original,
          error: null,
        })
        .mockResolvedValueOnce({
          data: createMockPortfolio({
            id: 'new-id',
            customDomain: null,
          }),
          error: null,
        });

      const result = await service.duplicate('original-id', 'user-1');

      expect(result.customDomain).toBeNull();
    });
  });

  describe('getById', () => {
    it('should retrieve portfolio by ID', async () => {
      const mockPortfolio = createMockPortfolio({ id: 'portfolio-1' });

      mockDb.single.mockResolvedValueOnce({
        data: mockPortfolio,
        error: null,
      });

      const result = await service.getById('portfolio-1', 'user-1');

      expect(result).toEqual(mockPortfolio);
      expect(mockDb.eq).toHaveBeenCalledWith('id', 'portfolio-1');
      expect(mockDb.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should exclude soft-deleted portfolios', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await service.getById('deleted-id', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all user portfolios', async () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', title: 'Portfolio 1' }),
        createMockPortfolio({ id: '2', title: 'Portfolio 2' }),
      ];

      mockDb.single.mockResolvedValueOnce({
        data: mockPortfolios,
        error: null,
      });

      const result = await service.getAll('user-1');

      expect(result).toHaveLength(2);
      expect(mockDb.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should order by creation date descending', async () => {
      mockDb.single.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      await service.getAll('user-1');

      expect(mockDb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});
