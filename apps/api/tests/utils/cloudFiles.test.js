/**
 * Cloud Files API Tests
 * Testing cloud file CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Cloud File API Tests', () => {
  let testUserId;
  let testCloudFile;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        provider: 'local'
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.cloudFile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up cloud files before each test
    await prisma.cloudFile.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Cloud File', () => {
    test('should create a new cloud file', async () => {
      const fileData = {
        name: 'test-resume.pdf',
        fileName: 'resume.pdf',
        type: 'resume',
        size: 1024,
        contentType: 'application/pdf',
        data: 'base64encodeddatahere'
      };

      const file = await prisma.cloudFile.create({
        data: {
          userId: testUserId,
          ...fileData
        }
      });

      expect(file).toBeDefined();
      expect(file.name).toBe(fileData.name);
      expect(file.type).toBe(fileData.type);
      expect(file.userId).toBe(testUserId);
    });

    test('should create file with default folder', async () => {
      const file = await prisma.cloudFile.create({
        data: {
          userId: testUserId,
          name: 'test.txt',
          fileName: 'test.txt',
          type: 'document',
          size: 512,
          contentType: 'text/plain',
          data: 'test data'
        }
      });

      expect(file).toBeDefined();
      expect(file.folder).toBeNull();
    });
  });

  describe('Get Cloud File', () => {
    beforeEach(async () => {
      testCloudFile = await prisma.cloudFile.create({
        data: {
          userId: testUserId,
          name: 'test-document.pdf',
          fileName: 'document.pdf',
          type: 'document',
          size: 2048,
          contentType: 'application/pdf',
          data: 'test data'
        }
      });
    });

    test('should get cloud file by ID', async () => {
      const file = await prisma.cloudFile.findUnique({
        where: { id: testCloudFile.id }
      });

      expect(file).toBeDefined();
      expect(file.id).toBe(testCloudFile.id);
    });

    test('should return files by folder', async () => {
      const files = await prisma.cloudFile.findMany({
        where: { userId: testUserId, folder: null }
      });

      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('Update Cloud File', () => {
    beforeEach(async () => {
      testCloudFile = await prisma.cloudFile.create({
        data: {
          userId: testUserId,
          name: 'original.pdf',
          fileName: 'original.pdf',
          type: 'document',
          size: 1024,
          contentType: 'application/pdf',
          data: 'test'
        }
      });
    });

    test('should update file name', async () => {
      const updated = await prisma.cloudFile.update({
        where: { id: testCloudFile.id },
        data: { name: 'updated.pdf' }
      });

      expect(updated.name).toBe('updated.pdf');
    });

    test('should update file folder', async () => {
      const updated = await prisma.cloudFile.update({
        where: { id: testCloudFile.id },
        data: { folder: 'resumes' }
      });

      expect(updated.folder).toBe('resumes');
    });
  });

  describe('Delete Cloud File', () => {
    beforeEach(async () => {
      testCloudFile = await prisma.cloudFile.create({
        data: {
          userId: testUserId,
          name: 'delete-me.pdf',
          fileName: 'delete.pdf',
          type: 'document',
          size: 512,
          contentType: 'application/pdf',
          data: 'test'
        }
      });
    });

    test('should delete a cloud file', async () => {
      await prisma.cloudFile.delete({ where: { id: testCloudFile.id } });

      const deleted = await prisma.cloudFile.findUnique({
        where: { id: testCloudFile.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

