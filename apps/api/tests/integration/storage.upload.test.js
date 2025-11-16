/**
 * TEST-011: Integration test for file upload flow (API + DB + Storage)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('File Upload Integration - TEST-011', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(async () => {
    app = await createServer();
    
    // Create test user and get auth token
    const user = await prisma.user.create({
      data: {
        email: 'test-upload@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    // Get auth token (implementation depends on your auth system)
    authToken = 'mock-token';
  });

  afterAll(async () => {
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should upload file and save to database and storage', async () => {
    const fileContent = Buffer.from('test file content');
    
    const response = await request(app)
      .post('/api/storage/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', fileContent, 'test.pdf')
      .field('displayName', 'Test File')
      .field('type', 'document');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.file).toBeDefined();
    expect(response.body.file.id).toBeDefined();
    expect(response.body.file.name).toBe('Test File');

    // Verify in database
    const fileInDb = await prisma.storageFile.findUnique({
      where: { id: response.body.file.id },
    });
    expect(fileInDb).toBeDefined();
    expect(fileInDb.userId).toBe(userId);
    expect(fileInDb.name).toBe('Test File');
  });

  it('should enforce storage quota', async () => {
    // Set user quota to 1MB
    await prisma.storageQuota.upsert({
      where: { userId },
      update: { usedBytes: BigInt(1024 * 1024), limitBytes: BigInt(1024 * 1024) },
      create: { userId, usedBytes: BigInt(1024 * 1024), limitBytes: BigInt(1024 * 1024) },
    });

    const fileContent = Buffer.from('a'.repeat(1024 * 1024)); // 1MB file
    
    const response = await request(app)
      .post('/api/storage/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', fileContent, 'large.pdf')
      .field('displayName', 'Large File');

    expect(response.status).toBe(413);
    expect(response.body.error).toContain('quota');
  });
});

