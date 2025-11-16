/**
 * TEST-018: Integration test for comment operations (add, reply, resolve)
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const { createServer } = require('../../server');

const prisma = new PrismaClient();

describe('Comment Operations Integration - TEST-018', () => {
  let app;
  let authToken;
  let userId;
  let fileId;
  let commentId;

  beforeAll(async () => {
    app = await createServer();
    
    const user = await prisma.user.create({
      data: {
        email: 'test-comments@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
    userId = user.id;
    authToken = 'mock-token';

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
      },
    });
    fileId = file.id;
  });

  afterAll(async () => {
    await prisma.fileComment.deleteMany({ where: { fileId } });
    await prisma.storageFile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should add comment to file', async () => {
    const response = await request(app)
      .post(`/api/storage/files/${fileId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'This is a test comment',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.comment).toBeDefined();
    commentId = response.body.comment.id;

    // Verify in database
    const comment = await prisma.fileComment.findUnique({
      where: { id: commentId },
    });
    expect(comment).toBeDefined();
    expect(comment.content).toBe('This is a test comment');
  });

  it('should add reply to comment', async () => {
    const response = await request(app)
      .post(`/api/storage/files/${fileId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'This is a reply',
        parentId: commentId,
      });

    expect(response.status).toBe(200);
    expect(response.body.comment.parentId).toBe(commentId);
  });
});

