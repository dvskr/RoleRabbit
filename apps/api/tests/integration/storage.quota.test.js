/**
 * TEST-019: Integration test for storage quota enforcement
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('Storage Quota Enforcement Integration - TEST-019', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-quota@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';

    // Set quota to 1MB
    await prisma.storageQuota.upsert({
      where: { userId },
      update: {
        usedBytes: BigInt(0),
        limitBytes: BigInt(1024 * 1024), // 1MB
      },
      create: {
        userId,
        usedBytes: BigInt(0),
        limitBytes: BigInt(1024 * 1024),
      },
    });
  });

  afterAll(async () => {
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.storageQuota.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should allow upload within quota', async () => {
    const fileContent = Buffer.from('a'.repeat(512 * 1024)); // 512KB
    
    const response = await request(app)
      .post('/api/storage/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', fileContent, 'small.pdf')
      .field('displayName', 'Small File');

    expect(response.status).toBe(200);
  });

  it('should reject upload exceeding quota', async () => {
    const fileContent = Buffer.from('a'.repeat(2 * 1024 * 1024)); // 2MB
    
    const response = await request(app)
      .post('/api/storage/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', fileContent, 'large.pdf')
      .field('displayName', 'Large File');

    expect(response.status).toBe(413);
    expect(response.body.error).toContain('quota');
  });
});

