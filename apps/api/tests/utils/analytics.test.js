/**
 * Analytics API Tests
 * Testing analytics CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Analytics API Tests', () => {
  let testUserId;
  let testAnalytics;

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
    await prisma.analytics.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up analytics before each test
    await prisma.analytics.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Analytics', () => {
    test('should create new analytics entry', async () => {
      const analyticsData = {
        type: 'application',
        metric: 'count',
        value: 5,
        metadata: { date: new Date().toISOString() }
      };

      const analytics = await prisma.analytics.create({
        data: {
          userId: testUserId,
          ...analyticsData
        }
      });

      expect(analytics).toBeDefined();
      expect(analytics.type).toBe(analyticsData.type);
      expect(analytics.value).toBe(analyticsData.value);
      expect(analytics.userId).toBe(testUserId);
    });

    test('should create analytics with default timestamp', async () => {
      const analytics = await prisma.analytics.create({
        data: {
          userId: testUserId,
          type: 'view',
          metric: 'page',
          value: 1
        }
      });

      expect(analytics.timestamp).toBeDefined();
    });
  });

  describe('Get Analytics', () => {
    beforeEach(async () => {
      testAnalytics = await prisma.analytics.create({
        data: {
          userId: testUserId,
          type: 'engagement',
          metric: 'clicks',
          value: 10,
          metadata: { page: 'dashboard' }
        }
      });
    });

    test('should get analytics by ID', async () => {
      const analytics = await prisma.analytics.findUnique({
        where: { id: testAnalytics.id }
      });

      expect(analytics).toBeDefined();
      expect(analytics.id).toBe(testAnalytics.id);
    });

    test('should return analytics by type', async () => {
      const analytics = await prisma.analytics.findMany({
        where: { userId: testUserId, type: 'engagement' }
      });

      expect(Array.isArray(analytics)).toBe(true);
    });
  });

  describe('Update Analytics', () => {
    beforeEach(async () => {
      testAnalytics = await prisma.analytics.create({
        data: {
          userId: testUserId,
          type: 'test',
          metric: 'original',
          value: 5
        }
      });
    });

    test('should update analytics value', async () => {
      const updated = await prisma.analytics.update({
        where: { id: testAnalytics.id },
        data: { value: 15 }
      });

      expect(updated.value).toBe(15);
    });

    test('should update analytics metadata', async () => {
      const newMetadata = { updated: true };
      const updated = await prisma.analytics.update({
        where: { id: testAnalytics.id },
        data: { metadata: newMetadata }
      });

      expect(updated.metadata).toEqual(newMetadata);
    });
  });

  describe('Delete Analytics', () => {
    beforeEach(async () => {
      testAnalytics = await prisma.analytics.create({
        data: {
          userId: testUserId,
          type: 'test',
          metric: 'delete',
          value: 1
        }
      });
    });

    test('should delete analytics entry', async () => {
      await prisma.analytics.delete({ where: { id: testAnalytics.id } });

      const deleted = await prisma.analytics.findUnique({
        where: { id: testAnalytics.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

