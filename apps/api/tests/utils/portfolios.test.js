/**
 * Portfolios API Tests
 * Testing portfolio CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Portfolio API Tests', () => {
  let testUserId;
  let testPortfolio;

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
    await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up portfolios before each test
    await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Portfolio', () => {
    test('should create a new portfolio', async () => {
      const portfolioData = {
        name: 'My Portfolio',
        websiteUrl: 'https://myportfolio.example.com',
        description: 'A professional portfolio',
        isActive: true
      };

      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUserId,
          ...portfolioData
        }
      });

      expect(portfolio).toBeDefined();
      expect(portfolio.name).toBe(portfolioData.name);
      expect(portfolio.websiteUrl).toBe(portfolioData.websiteUrl);
      expect(portfolio.userId).toBe(testUserId);
    });

    test('should create portfolio with default inactive status', async () => {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUserId,
          name: 'Test Portfolio',
          websiteUrl: 'https://test.com'
        }
      });

      expect(portfolio.isActive).toBe(false);
    });
  });

  describe('Get Portfolio', () => {
    beforeEach(async () => {
      testPortfolio = await prisma.portfolio.create({
        data: {
          userId: testUserId,
          name: 'Test Portfolio',
          websiteUrl: 'https://test.example.com',
          description: 'Test description',
          isActive: true
        }
      });
    });

    test('should get portfolio by ID', async () => {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: testPortfolio.id }
      });

      expect(portfolio).toBeDefined();
      expect(portfolio.id).toBe(testPortfolio.id);
    });

    test('should return all portfolios for a user', async () => {
      const portfolios = await prisma.portfolio.findMany({
        where: { userId: testUserId }
      });

      expect(portfolios).toBeDefined();
      expect(Array.isArray(portfolios)).toBe(true);
    });
  });

  describe('Update Portfolio', () => {
    beforeEach(async () => {
      testPortfolio = await prisma.portfolio.create({
        data: {
          userId: testUserId,
          name: 'Original Name',
          websiteUrl: 'https://original.com'
        }
      });
    });

    test('should update portfolio name', async () => {
      const updated = await prisma.portfolio.update({
        where: { id: testPortfolio.id },
        data: { name: 'Updated Name' }
      });

      expect(updated.name).toBe('Updated Name');
    });

    test('should update portfolio active status', async () => {
      const updated = await prisma.portfolio.update({
        where: { id: testPortfolio.id },
        data: { isActive: true }
      });

      expect(updated.isActive).toBe(true);
    });
  });

  describe('Delete Portfolio', () => {
    beforeEach(async () => {
      testPortfolio = await prisma.portfolio.create({
        data: {
          userId: testUserId,
          name: 'To Be Deleted',
          websiteUrl: 'https://delete.me'
        }
      });
    });

    test('should delete a portfolio', async () => {
      await prisma.portfolio.delete({ where: { id: testPortfolio.id } });

      const deleted = await prisma.portfolio.findUnique({
        where: { id: testPortfolio.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

