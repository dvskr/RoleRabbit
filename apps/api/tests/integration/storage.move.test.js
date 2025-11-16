/**
 * TEST-016: Integration test for file move flow
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('File Move Integration - TEST-016', () => {
  let app;
  let authToken;
  let userId;
  let fileId;
  let folderId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-move@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';

    // Create folder
    const folder = await prisma.storageFolder.create({
      data: {
        userId,
        name: 'Test Folder',
        color: '#4F46E5',
      },
    });
    folderId = folder.id;

    // Create file
    const file = await prisma.storageFile.create({
      data: {
        userId,
        name: 'Test File',
        fileName: 'test.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: `${userId}/test.pdf`,
        folderId: null,
      },
    });
    fileId = file.id;
  });

  afterAll(async () => {
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.storageFolder.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should move file to folder', async () => {
    const response = await request(app)
      .put(`/api/storage/files/${fileId}/move`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ folderId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify file is in folder
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });
    expect(file.folderId).toBe(folderId);
  });

  it('should move file out of folder', async () => {
    const response = await request(app)
      .put(`/api/storage/files/${fileId}/move`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ folderId: null });

    expect(response.status).toBe(200);

    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });
    expect(file.folderId).toBeNull();
  });
});

