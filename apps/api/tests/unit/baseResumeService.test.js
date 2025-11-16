const { prisma } = require('../../utils/db');
const {
  createBaseResume,
  updateBaseResume,
  deleteBaseResume,
  activateBaseResume,
  countBaseResumes,
  getPlanLimits,
} = require('../../services/baseResumeService');

// Mock Prisma
jest.mock('../../utils/db', () => ({
  prisma: {
    baseResume: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    workingDraft: {
      deleteMany: jest.fn(),
    },
    tailoredVersion: {
      deleteMany: jest.fn(),
    },
  },
}));

describe('baseResumeService', () => {
  const mockUserId = 'user-123';
  const mockResumeId = 'resume-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBaseResume', () => {
    it('should create a base resume successfully', async () => {
      const mockResumeData = {
        userId: mockUserId,
        slotNumber: 1,
        name: 'Software Engineer Resume',
        isActive: true,
        data: {
          contact: { name: 'John Doe', email: 'john@example.com' },
          summary: 'Experienced developer',
        },
      };

      const mockCreatedResume = {
        id: mockResumeId,
        ...mockResumeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.baseResume.create.mockResolvedValue(mockCreatedResume);

      const result = await createBaseResume(mockResumeData);

      expect(prisma.baseResume.create).toHaveBeenCalledWith({
        data: mockResumeData,
      });
      expect(result).toEqual(mockCreatedResume);
    });

    it('should throw error when exceeding slot limit', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        subscriptionTier: 'FREE',
      });

      prisma.baseResume.count.mockResolvedValue(1); // Already at free tier limit

      const mockResumeData = {
        userId: mockUserId,
        slotNumber: 2,
        name: 'Second Resume',
        isActive: false,
        data: {},
      };

      await expect(createBaseResume(mockResumeData)).rejects.toThrow();
    });
  });

  describe('updateBaseResume', () => {
    it('should update resume successfully', async () => {
      const mockExistingResume = {
        id: mockResumeId,
        userId: mockUserId,
        version: 1,
        data: { contact: { name: 'John Doe' } },
      };

      const mockUpdatedData = {
        data: { contact: { name: 'Jane Doe' } },
      };

      const mockUpdatedResume = {
        ...mockExistingResume,
        ...mockUpdatedData,
        version: 2,
        updatedAt: new Date(),
      };

      prisma.baseResume.findUnique.mockResolvedValue(mockExistingResume);
      prisma.baseResume.update.mockResolvedValue(mockUpdatedResume);

      const result = await updateBaseResume(mockResumeId, mockUpdatedData);

      expect(prisma.baseResume.update).toHaveBeenCalledWith({
        where: { id: mockResumeId },
        data: expect.objectContaining({
          ...mockUpdatedData,
          version: { increment: 1 },
        }),
      });
      expect(result.version).toBe(2);
    });

    it('should detect version conflict', async () => {
      const mockExistingResume = {
        id: mockResumeId,
        userId: mockUserId,
        version: 2,
        updatedAt: new Date(),
      };

      prisma.baseResume.findUnique.mockResolvedValue(mockExistingResume);

      const updateData = {
        data: { contact: { name: 'Jane Doe' } },
        expectedVersion: 1, // Client has stale version
      };

      await expect(updateBaseResume(mockResumeId, updateData)).rejects.toThrow('conflict');
    });
  });

  describe('deleteBaseResume', () => {
    it('should soft delete resume', async () => {
      const mockResume = {
        id: mockResumeId,
        userId: mockUserId,
        deletedAt: null,
      };

      prisma.baseResume.findUnique.mockResolvedValue(mockResume);
      prisma.baseResume.update.mockResolvedValue({
        ...mockResume,
        deletedAt: new Date(),
      });

      await deleteBaseResume(mockResumeId, { soft: true });

      expect(prisma.baseResume.update).toHaveBeenCalledWith({
        where: { id: mockResumeId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should hard delete resume and cascade', async () => {
      const mockResume = {
        id: mockResumeId,
        userId: mockUserId,
      };

      prisma.baseResume.findUnique.mockResolvedValue(mockResume);
      prisma.workingDraft.deleteMany.mockResolvedValue({ count: 1 });
      prisma.tailoredVersion.deleteMany.mockResolvedValue({ count: 2 });
      prisma.baseResume.delete.mockResolvedValue(mockResume);

      await deleteBaseResume(mockResumeId, { soft: false });

      expect(prisma.workingDraft.deleteMany).toHaveBeenCalledWith({
        where: { baseResumeId: mockResumeId },
      });
      expect(prisma.tailoredVersion.deleteMany).toHaveBeenCalledWith({
        where: { baseResumeId: mockResumeId },
      });
      expect(prisma.baseResume.delete).toHaveBeenCalledWith({
        where: { id: mockResumeId },
      });
    });
  });

  describe('activateBaseResume', () => {
    it('should activate resume and deactivate others', async () => {
      const mockResume = {
        id: mockResumeId,
        userId: mockUserId,
        isActive: false,
      };

      prisma.baseResume.findUnique.mockResolvedValue(mockResume);
      prisma.baseResume.updateMany.mockResolvedValue({ count: 2 });
      prisma.baseResume.update.mockResolvedValue({
        ...mockResume,
        isActive: true,
      });

      await activateBaseResume(mockResumeId);

      // Verify all user's resumes were deactivated
      expect(prisma.baseResume.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: { isActive: false },
      });

      // Verify target resume was activated
      expect(prisma.baseResume.update).toHaveBeenCalledWith({
        where: { id: mockResumeId },
        data: { isActive: true },
      });
    });
  });

  describe('countBaseResumes', () => {
    it('should count non-deleted resumes', async () => {
      prisma.baseResume.count.mockResolvedValue(3);

      const count = await countBaseResumes(mockUserId);

      expect(prisma.baseResume.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          deletedAt: null,
        },
      });
      expect(count).toBe(3);
    });
  });

  describe('getPlanLimits', () => {
    it('should return correct limits for FREE tier', () => {
      const user = { subscriptionTier: 'FREE' };
      const limits = getPlanLimits(user);

      expect(limits).toEqual({
        maxSlots: 1,
        maxAIUsage: 10,
        features: expect.arrayContaining(['basic_templates']),
      });
    });

    it('should return correct limits for PRO tier', () => {
      const user = { subscriptionTier: 'PRO' };
      const limits = getPlanLimits(user);

      expect(limits).toEqual({
        maxSlots: 5,
        maxAIUsage: 100,
        features: expect.arrayContaining(['premium_templates', 'ai_tailoring']),
      });
    });

    it('should return correct limits for PREMIUM tier', () => {
      const user = { subscriptionTier: 'PREMIUM' };
      const limits = getPlanLimits(user);

      expect(limits).toEqual({
        maxSlots: 5,
        maxAIUsage: -1, // Unlimited
        features: expect.arrayContaining(['premium_templates', 'ai_tailoring', 'priority_support']),
      });
    });
  });
});


