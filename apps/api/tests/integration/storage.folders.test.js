/**
 * TEST-017: Integration test for folder operations (create, rename, delete)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('Folder Operations Integration - TEST-017', () => {
  let app;
  let authToken;
  let userId;
  let folderId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-folders@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';
  });

  afterAll(async () => {
    await prisma.storageFolder.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should create folder', async () => {
    const response = await request(app)
      .post('/api/storage/folders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New Folder',
        color: '#4F46E5',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.folder).toBeDefined();
    folderId = response.body.folder.id;

    // Verify in database
    const folder = await prisma.storageFolder.findUnique({
      where: { id: folderId },
    });
    expect(folder).toBeDefined();
    expect(folder.name).toBe('New Folder');
  });

  it('should rename folder', async () => {
    const response = await request(app)
      .put(`/api/storage/folders/${folderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Renamed Folder',
      });

    expect(response.status).toBe(200);

    const folder = await prisma.storageFolder.findUnique({
      where: { id: folderId },
    });
    expect(folder.name).toBe('Renamed Folder');
  });

  it('should delete folder', async () => {
    const response = await request(app)
      .delete(`/api/storage/folders/${folderId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    const folder = await prisma.storageFolder.findUnique({
      where: { id: folderId },
    });
    expect(folder.deletedAt).toBeDefined();
  });
});

