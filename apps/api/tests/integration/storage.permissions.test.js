/**
 * TEST-020: Integration test for permission checking (view, comment, edit, delete)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('Permission Checking Integration - TEST-020', () => {
  let app;
  let ownerToken;
  let viewerToken;
  let editorToken;
  let ownerId;
  let viewerId;
  let editorId;
  let fileId;

  beforeAll(async () => {
    app = await createServer();
    
    // Create owner
    const owner = await prisma.user.create({
      data: {
        email: 'owner-perm@example.com',
        name: 'Owner',
        password: 'hashed-password',
      },
    });
    ownerId = owner.id;
    ownerToken = 'mock-owner-token';

    // Create viewer
    const viewer = await prisma.user.create({
      data: {
        email: 'viewer-perm@example.com',
        name: 'Viewer',
        password: 'hashed-password',
      },
    });
    viewerId = viewer.id;
    viewerToken = 'mock-viewer-token';

    // Create editor
    const editor = await prisma.user.create({
      data: {
        email: 'editor-perm@example.com',
        name: 'Editor',
        password: 'hashed-password',
      },
    });
    editorId = editor.id;
    editorToken = 'mock-editor-token';

    // Create file
    const file = await prisma.storageFile.create({
      data: {
        userId: ownerId,
        name: 'Permission Test File',
        fileName: 'perm-test.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: `${ownerId}/perm-test.pdf`,
      },
    });
    fileId = file.id;

    // Create shares
    await prisma.fileShare.create({
      data: {
        fileId,
        userId: ownerId,
        sharedWith: viewerId,
        permission: 'view',
      },
    });

    await prisma.fileShare.create({
      data: {
        fileId,
        userId: ownerId,
        sharedWith: editorId,
        permission: 'edit',
      },
    });
  });

  afterAll(async () => {
    await prisma.fileShare.deleteMany({ where: { fileId } });
    await prisma.storageFile.deleteMany({ where: { userId: ownerId } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, viewerId, editorId] } } });
    await prisma.$disconnect();
  });

  it('should allow owner to delete file', async () => {
    const response = await request(app)
      .delete(`/api/storage/files/${fileId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
  });

  it('should allow viewer to view but not edit', async () => {
    // Restore file first
    await prisma.storageFile.update({
      where: { id: fileId },
      data: { deletedAt: null },
    });

    const viewResponse = await request(app)
      .get(`/api/storage/files/${fileId}/download`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(viewResponse.status).toBe(200);

    const editResponse = await request(app)
      .put(`/api/storage/files/${fileId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Updated Name' });

    expect(editResponse.status).toBe(403);
  });

  it('should allow editor to edit file', async () => {
    const response = await request(app)
      .put(`/api/storage/files/${fileId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(200);
  });
});

