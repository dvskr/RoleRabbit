const { getJobAnalytics, getApplicationTrends } = require('../../utils/jobAnalytics');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Job Analytics', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should get job analytics for user', async () => {
    const analytics = await getJobAnalytics('test-user-id', 30);
    expect(analytics).toHaveProperty('totalApplications');
    expect(analytics).toHaveProperty('statusBreakdown');
    expect(analytics).toHaveProperty('responseRate');
  });

  test('should get application trends', async () => {
    const trends = await getApplicationTrends('test-user-id', 30);
    expect(Array.isArray(trends)).toBe(true);
  });
});

