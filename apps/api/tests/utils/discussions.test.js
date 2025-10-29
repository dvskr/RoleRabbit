/**
 * Discussions API Tests
 * Testing discussion post CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Discussion API Tests', () => {
  let testUserId;
  let testPost;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        provider: 'local'
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.discussionPost.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up posts before each test
    await prisma.discussionPost.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Discussion Post', () => {
    test('should create a new discussion post', async () => {
      const postData = {
        title: 'How to negotiate salary?',
        content: 'Looking for advice on salary negotiation.',
        community: 'general',
        tags: ['salary', 'negotiation']
      };

      const post = await prisma.discussionPost.create({
        data: {
          userId: testUserId,
          ...postData
        }
      });

      expect(post).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.userId).toBe(testUserId);
    });

    test('should create post with default community', async () => {
      const post = await prisma.discussionPost.create({
        data: {
          userId: testUserId,
          title: 'Test Post',
          content: 'Test content'
        }
      });

      expect(post).toBeDefined();
      expect(post.community).toBe('general');
    });
  });

  describe('Get Discussion Post', () => {
    beforeEach(async () => {
      testPost = await prisma.discussionPost.create({
        data: {
          userId: testUserId,
          title: 'Test Post',
          content: 'Test content',
          community: 'general'
        }
      });
    });

    test('should get discussion post by ID', async () => {
      const post = await prisma.discussionPost.findUnique({
        where: { id: testPost.id }
      });

      expect(post).toBeDefined();
      expect(post.id).toBe(testPost.id);
    });

    test('should return posts by community', async () => {
      const posts = await prisma.discussionPost.findMany({
        where: { community: 'general' }
      });

      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe('Update Discussion Post', () => {
    beforeEach(async () => {
      testPost = await prisma.discussionPost.create({
        data: {
          userId: testUserId,
          title: 'Original Title',
          content: 'Original content',
          community: 'general'
        }
      });
    });

    test('should update post content', async () => {
      const newContent = 'Updated content here';
      const updated = await prisma.discussionPost.update({
        where: { id: testPost.id },
        data: { content: newContent }
      });

      expect(updated.content).toBe(newContent);
    });

    test('should update post votes', async () => {
      const updated = await prisma.discussionPost.update({
        where: { id: testPost.id },
        data: { votes: 5 }
      });

      expect(updated.votes).toBe(5);
    });
  });

  describe('Delete Discussion Post', () => {
    beforeEach(async () => {
      testPost = await prisma.discussionPost.create({
        data: {
          userId: testUserId,
          title: 'To Be Deleted',
          content: 'Test'
        }
      });
    });

    test('should delete a discussion post', async () => {
      await prisma.discussionPost.delete({ where: { id: testPost.id } });

      const deleted = await prisma.discussionPost.findUnique({
        where: { id: testPost.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

