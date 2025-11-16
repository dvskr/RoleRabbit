/**
 * TEST-021: Integration test for share link access (public endpoint)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

describe('Share Link Access Integration - TEST-021', () => {
  let app;
  let userId;
  let fileId;
  let shareLinkToken;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-sharelink@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;

    // Create file
    const file = await prisma.storageFile.create({
      data: {
        userId,
        name: 'Shared File',
        fileName: 'shared.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: `${userId}/shared.pdf`,
      },
    });
    fileId = file.id;

    // Create share link
    const token = 'test-share-token';
    const passwordHash = await bcrypt.hash('test-password', 10);
    const shareLink = await prisma.shareLink.create({
      data: {
        fileId,
        userId,
        token,
        passwordHash,
        permission: 'view',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    shareLinkToken = token;
  });

  afterAll(async () => {
    await prisma.shareLink.deleteMany({ where: { fileId } });
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should access file via share link without password', async () => {
    // Create share link without password
    const noPasswordToken = 'no-password-token';
    await prisma.shareLink.create({
      data: {
        fileId,
        userId,
        token: noPasswordToken,
        permission: 'view',
      },
    });

    const response = await request(app)
      .get(`/api/storage/share/${noPasswordToken}`);

    expect(response.status).toBe(200);
    expect(response.body.file).toBeDefined();
  });

  it('should require password for protected share link', async () => {
    const response = await request(app)
      .get(`/api/storage/share/${shareLinkToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('password');
  });

  it('should access file with correct password', async () => {
    const response = await request(app)
      .get(`/api/storage/share/${shareLinkToken}`)
      .query({ password: 'test-password' });

    expect(response.status).toBe(200);
    expect(response.body.file).toBeDefined();
  });

  it('should deny access with incorrect password', async () => {
    const response = await request(app)
      .get(`/api/storage/share/${shareLinkToken}`)
      .query({ password: 'wrong-password' });

    expect(response.status).toBe(401);
  });
});

