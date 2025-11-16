/**
 * TEST-015: Integration test for file share flow (with existing user and new user)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('File Share Integration - TEST-015', () => {
  let app;
  let ownerToken;
  let ownerId;
  let sharedUser;
  let fileId;

  beforeAll(async () => {
    app = await createServer();
    
    // Create owner
    const owner = await prisma.user.create({
      data: {
        email: 'owner@example.com',
        name: 'Owner',
        password: 'hashed-password',
      },
    });
    ownerId = owner.id;
    ownerToken = 'mock-owner-token';

    // Create shared user
    sharedUser = await prisma.user.create({
      data: {
        email: 'shared@example.com',
        name: 'Shared User',
        password: 'hashed-password',
      },
    });

    // Create test file
    const file = await prisma.storageFile.create({
      data: {
        userId: ownerId,
        name: 'Shared File',
        fileName: 'shared.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: 'owner/shared.pdf',
      },
    });
    fileId = file.id;
  });

  afterAll(async () => {
    await prisma.fileShare.deleteMany({ where: { fileId } });
    await prisma.storageFile.deleteMany({ where: { userId: ownerId } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, sharedUser.id] } } });
    await prisma.$disconnect();
  });

  it('should share file with existing user', async () => {
    const response = await request(app)
      .post(`/api/storage/files/${fileId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        userEmail: 'shared@example.com',
        permission: 'view',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.share).toBeDefined();

    // Verify share in database
    const share = await prisma.fileShare.findFirst({
      where: {
        fileId,
        sharedWith: sharedUser.id,
      },
    });
    expect(share).toBeDefined();
    expect(share.permission).toBe('view');
  });

  it('should create share link for new user', async () => {
    const response = await request(app)
      .post(`/api/storage/files/${fileId}/share-link`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        permission: 'view',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.shareLink).toBeDefined();
    expect(response.body.shareLink.token).toBeDefined();
  });
});

