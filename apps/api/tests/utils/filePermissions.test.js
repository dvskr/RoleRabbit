/**
 * TEST-009: Unit tests for file permission checking logic
 */

const { checkFilePermission } = require('../../utils/filePermissions');
const { prisma } = require('../../utils/db');

jest.mock('../../utils/db', () => ({
  prisma: {
    storageFile: {
      findUnique: jest.fn(),
    },
    fileShare: {
      findFirst: jest.fn(),
    },
  },
}));

describe('File Permission Checking - TEST-009', () => {
  const mockUserId = 'user-1';
  const mockFileId = 'file-1';

  const mockFile = {
    id: mockFileId,
    userId: mockUserId,
    isPublic: false,
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkFilePermission', () => {
    it('should allow owner to view their own file', async () => {
      prisma.storageFile.findUnique.mockResolvedValue(mockFile);
      prisma.fileShare.findFirst.mockResolvedValue(null);

      const result = await checkFilePermission(mockUserId, mockFileId, 'view');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny access to non-owner for private file', async () => {
      prisma.storageFile.findUnique.mockResolvedValue(mockFile);
      prisma.fileShare.findFirst.mockResolvedValue(null);

      const result = await checkFilePermission('user-2', mockFileId, 'view');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('permission');
    });

    it('should allow shared user with view permission', async () => {
      prisma.storageFile.findUnique.mockResolvedValue(mockFile);
      prisma.fileShare.findFirst.mockResolvedValue({
        id: 'share-1',
        permission: 'view',
        sharedWith: 'user-2',
      });

      const result = await checkFilePermission('user-2', mockFileId, 'view');

      expect(result.allowed).toBe(true);
    });

    it('should deny edit to user with only view permission', async () => {
      prisma.storageFile.findUnique.mockResolvedValue(mockFile);
      prisma.fileShare.findFirst.mockResolvedValue({
        id: 'share-1',
        permission: 'view',
        sharedWith: 'user-2',
      });

      const result = await checkFilePermission('user-2', mockFileId, 'edit');

      expect(result.allowed).toBe(false);
    });

    it('should allow edit to user with edit permission', async () => {
      prisma.storageFile.findUnique.mockResolvedValue(mockFile);
      prisma.fileShare.findFirst.mockResolvedValue({
        id: 'share-1',
        permission: 'edit',
        sharedWith: 'user-2',
      });

      const result = await checkFilePermission('user-2', mockFileId, 'edit');

      expect(result.allowed).toBe(true);
    });

    it('should handle file not found', async () => {
      prisma.storageFile.findUnique.mockResolvedValue(null);

      const result = await checkFilePermission(mockUserId, 'non-existent', 'view');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not found');
    });
  });
});

