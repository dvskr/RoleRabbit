/**
 * Unit Tests for Template Service
 * Tests CRUD operations, search, filtering, and pagination
 */

const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  searchTemplates,
} = require('../services/templateService');

// Mock Prisma
jest.mock('../utils/db', () => ({
  prisma: {
    resumeTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const { prisma } = require('../utils/db');

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTemplates', () => {
    it('should return all templates with default options', async () => {
      const mockTemplates = [
        {
          id: 'tpl_1',
          name: 'Professional Resume',
          category: 'ATS',
          difficulty: 'BEGINNER',
          isPremium: false,
          rating: 4.5,
          downloads: 1000,
          isActive: true,
        },
        {
          id: 'tpl_2',
          name: 'Creative Portfolio',
          category: 'CREATIVE',
          difficulty: 'INTERMEDIATE',
          isPremium: true,
          rating: 4.8,
          downloads: 500,
          isActive: true,
        },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(2);

      const result = await getAllTemplates();

      expect(result.success).toBe(true);
      expect(result.data.templates).toHaveLength(2);
      expect(result.data.pagination.total).toBe(2);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(20);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          skip: 0,
          take: 20,
        })
      );
    });

    it('should filter templates by category', async () => {
      const mockTemplates = [
        {
          id: 'tpl_1',
          name: 'ATS Template',
          category: 'ATS',
          isActive: true,
        },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(1);

      const result = await getAllTemplates({ category: 'ATS' });

      expect(result.success).toBe(true);
      expect(result.data.templates).toHaveLength(1);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'ATS',
          }),
        })
      );
    });

    it('should filter templates by difficulty', async () => {
      const mockTemplates = [
        {
          id: 'tpl_1',
          name: 'Beginner Template',
          difficulty: 'BEGINNER',
          isActive: true,
        },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(1);

      const result = await getAllTemplates({ difficulty: 'BEGINNER' });

      expect(result.success).toBe(true);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            difficulty: 'BEGINNER',
          }),
        })
      );
    });

    it('should filter templates by isPremium', async () => {
      const mockTemplates = [
        {
          id: 'tpl_1',
          name: 'Premium Template',
          isPremium: true,
          isActive: true,
        },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(1);

      const result = await getAllTemplates({ isPremium: true });

      expect(result.success).toBe(true);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPremium: true,
          }),
        })
      );
    });

    it('should filter templates by rating range', async () => {
      const mockTemplates = [
        {
          id: 'tpl_1',
          name: 'High Rated Template',
          rating: 4.5,
          isActive: true,
        },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(1);

      const result = await getAllTemplates({ minRating: 4.0, maxRating: 5.0 });

      expect(result.success).toBe(true);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            rating: {
              gte: 4.0,
              lte: 5.0,
            },
          }),
        })
      );
    });

    it('should sort templates by popularity (downloads)', async () => {
      const mockTemplates = [
        { id: 'tpl_1', name: 'Popular', downloads: 5000, isActive: true },
        { id: 'tpl_2', name: 'Less Popular', downloads: 1000, isActive: true },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(2);

      const result = await getAllTemplates({ sortBy: 'popular' });

      expect(result.success).toBe(true);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { downloads: 'desc' },
        })
      );
    });

    it('should sort templates by rating', async () => {
      prisma.resumeTemplate.findMany.mockResolvedValue([]);
      prisma.resumeTemplate.count.mockResolvedValue(0);

      await getAllTemplates({ sortBy: 'rating' });

      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'desc' },
        })
      );
    });

    it('should sort templates by newest (createdAt)', async () => {
      prisma.resumeTemplate.findMany.mockResolvedValue([]);
      prisma.resumeTemplate.count.mockResolvedValue(0);

      await getAllTemplates({ sortBy: 'newest' });

      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const mockTemplates = Array(10).fill(null).map((_, i) => ({
        id: `tpl_${i}`,
        name: `Template ${i}`,
        isActive: true,
      }));

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);
      prisma.resumeTemplate.count.mockResolvedValue(50);

      const result = await getAllTemplates({ page: 2, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.pagination.page).toBe(2);
      expect(result.data.pagination.limit).toBe(10);
      expect(result.data.pagination.total).toBe(50);
      expect(result.data.pagination.totalPages).toBe(5);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * limit 10
          take: 10,
        })
      );
    });

    it('should handle errors gracefully', async () => {
      prisma.resumeTemplate.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await getAllTemplates();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to fetch templates');
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by ID', async () => {
      const mockTemplate = {
        id: 'tpl_1',
        name: 'Professional Resume',
        category: 'ATS',
        isActive: true,
      };

      prisma.resumeTemplate.findUnique.mockResolvedValue(mockTemplate);

      const result = await getTemplateById('tpl_1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tpl_1');
      expect(prisma.resumeTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 'tpl_1' },
      });
    });

    it('should return error if template not found', async () => {
      prisma.resumeTemplate.findUnique.mockResolvedValue(null);

      const result = await getTemplateById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should handle database errors', async () => {
      prisma.resumeTemplate.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      const result = await getTemplateById('tpl_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('searchTemplates', () => {
    it('should search templates by query', async () => {
      const mockTemplates = [
        {
          id: 'tpl_1',
          name: 'Professional Resume',
          description: 'A professional ATS-friendly template',
          isActive: true,
        },
      ];

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await searchTemplates('professional');

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
              expect.objectContaining({ description: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should return empty array for no matches', async () => {
      prisma.resumeTemplate.findMany.mockResolvedValue([]);

      const result = await searchTemplates('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(0);
    });

    it('should limit search results', async () => {
      const mockTemplates = Array(5).fill(null).map((_, i) => ({
        id: `tpl_${i}`,
        name: `Template ${i}`,
        isActive: true,
      }));

      prisma.resumeTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await searchTemplates('template', { limit: 5 });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(5);
      expect(prisma.resumeTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'New Template',
        category: 'ATS',
        description: 'A new template',
        difficulty: 'BEGINNER',
        layout: 'SINGLE_COLUMN',
        colorScheme: 'BLUE',
        isPremium: false,
        author: 'Test Author',
      };

      const mockCreatedTemplate = {
        id: 'tpl_new',
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.resumeTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const result = await createTemplate(templateData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tpl_new');
      expect(result.data.name).toBe('New Template');
      expect(prisma.resumeTemplate.create).toHaveBeenCalledWith({
        data: expect.objectContaining(templateData),
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        // Missing required fields
        name: 'Invalid Template',
      };

      prisma.resumeTemplate.create.mockRejectedValue(
        new Error('Missing required fields')
      );

      const result = await createTemplate(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields');
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', async () => {
      const updates = {
        name: 'Updated Template Name',
        rating: 4.9,
      };

      const mockUpdatedTemplate = {
        id: 'tpl_1',
        ...updates,
        updatedAt: new Date(),
      };

      prisma.resumeTemplate.update.mockResolvedValue(mockUpdatedTemplate);

      const result = await updateTemplate('tpl_1', updates);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Template Name');
      expect(prisma.resumeTemplate.update).toHaveBeenCalledWith({
        where: { id: 'tpl_1' },
        data: expect.objectContaining(updates),
      });
    });

    it('should handle non-existent template', async () => {
      prisma.resumeTemplate.update.mockRejectedValue(
        new Error('Record not found')
      );

      const result = await updateTemplate('nonexistent', { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Record not found');
    });
  });

  describe('deleteTemplate', () => {
    it('should soft delete a template', async () => {
      const mockDeletedTemplate = {
        id: 'tpl_1',
        isActive: false,
        deletedAt: new Date(),
      };

      prisma.resumeTemplate.update.mockResolvedValue(mockDeletedTemplate);

      const result = await deleteTemplate('tpl_1', { soft: true });

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
      expect(prisma.resumeTemplate.update).toHaveBeenCalledWith({
        where: { id: 'tpl_1' },
        data: expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('should hard delete a template', async () => {
      const mockDeletedTemplate = {
        id: 'tpl_1',
        name: 'Deleted Template',
      };

      prisma.resumeTemplate.delete.mockResolvedValue(mockDeletedTemplate);

      const result = await deleteTemplate('tpl_1', { soft: false });

      expect(result.success).toBe(true);
      expect(prisma.resumeTemplate.delete).toHaveBeenCalledWith({
        where: { id: 'tpl_1' },
      });
    });

    it('should handle deletion errors', async () => {
      prisma.resumeTemplate.update.mockRejectedValue(
        new Error('Cannot delete template')
      );

      const result = await deleteTemplate('tpl_1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete template');
    });
  });
});
