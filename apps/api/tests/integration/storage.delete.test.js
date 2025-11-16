/**
 * TEST-013: Integration test for file delete flow (soft delete and permanent delete)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');
const storageHandler = require('../../utils/storageHandler');

const prisma = new PrismaClient();

describe('File Delete Integration - TEST-013', () => {
  let app;
  let authToken;
  let userId;
  let fileId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-delete@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';

    // Create test file
    const fileContent = Buffer.from('test delete content');
    const uploadResult = await storageHandler.upload(fileContent, userId, 'test-delete.pdf', 'application/pdf');
    
    const file = await prisma.storageFile.create({
      data: {
        userId,
        name: 'Test Delete File',
        fileName: 'test-delete.pdf',
        type: 'document',
        size: BigInt(fileContent.length),
        contentType: 'application/pdf',
        storagePath: uploadResult.path,
      },
    });
    fileId = file.id;
  });

  afterAll(async () => {
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should soft delete file', async () => {
    const response = await request(app)
      .delete(`/api/storage/files/${fileId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify soft delete in database
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });
    expect(file.deletedAt).toBeDefined();
    expect(file.deletedAt).not.toBeNull();
  });

  it('should restore soft deleted file', async () => {
    const restoreResponse = await request(app)
      .post(`/api/storage/files/${fileId}/restore`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(restoreResponse.status).toBe(200);

    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });
    expect(file.deletedAt).toBeNull();
  });

  it('should permanently delete file', async () => {
    const response = await request(app)
      .delete(`/api/storage/files/${fileId}/permanent`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    // Verify file is removed from database
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });
    expect(file).toBeNull();
  });
});

