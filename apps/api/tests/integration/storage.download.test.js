/**
 * TEST-012: Integration test for file download flow (API + DB + Storage)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');
const storageHandler = require('../../utils/storageHandler');

const prisma = new PrismaClient();

describe('File Download Integration - TEST-012', () => {
  let app;
  let authToken;
  let userId;
  let fileId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-download@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';

    // Upload a test file
    const fileContent = Buffer.from('test download content');
    const uploadResult = await storageHandler.upload(fileContent, userId, 'test-download.pdf', 'application/pdf');
    
    const file = await prisma.storageFile.create({
      data: {
        userId,
        name: 'Test Download File',
        fileName: 'test-download.pdf',
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

  it('should download file successfully', async () => {
    const response = await request(app)
      .get(`/api/storage/files/${fileId}/download`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.body).toBeInstanceOf(Buffer);
  });

  it('should update lastAccessedAt on download', async () => {
    const beforeDownload = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });

    await request(app)
      .get(`/api/storage/files/${fileId}/download`)
      .set('Authorization', `Bearer ${authToken}`);

    const afterDownload = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });

    expect(afterDownload.lastAccessedAt).toBeDefined();
    expect(new Date(afterDownload.lastAccessedAt).getTime()).toBeGreaterThan(
      beforeDownload.lastAccessedAt ? new Date(beforeDownload.lastAccessedAt).getTime() : 0
    );
  });

  it('should deny access to unauthorized user', async () => {
    const response = await request(app)
      .get(`/api/storage/files/${fileId}/download`)
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});

