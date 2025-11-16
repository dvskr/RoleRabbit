/**
 * TEST-014: Integration test for file restore flow
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('File Restore Integration - TEST-014', () => {
  let app;
  let authToken;
  let userId;
  let fileId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-restore@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';

    // Create and soft delete a file
    const file = await prisma.storageFile.create({
      data: {
        userId,
        name: 'Deleted File',
        fileName: 'deleted.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: `${userId}/deleted.pdf`,
        deletedAt: new Date(),
      },
    });
    fileId = file.id;
  });

  afterAll(async () => {
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should restore soft deleted file', async () => {
    const response = await request(app)
      .post(`/api/storage/files/${fileId}/restore`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify file is restored
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId },
    });
    expect(file.deletedAt).toBeNull();
  });

  it('should update file list after restore', async () => {
    const response = await request(app)
      .get('/api/storage/files')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ includeDeleted: false });

    expect(response.status).toBe(200);
    expect(response.body.files).toContainEqual(
      expect.objectContaining({ id: fileId })
    );
  });
});

