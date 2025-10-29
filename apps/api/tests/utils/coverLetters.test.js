/**
 * Cover Letters API Tests
 * Testing cover letter CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Cover Letter API Tests', () => {
  let testUserId;
  let testJobId;
  let testCoverLetter;

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

    // Create a test job
    const job = await prisma.job.create({
      data: {
        userId: testUserId,
        title: 'Test Job',
        company: 'Test Company',
        location: 'Remote',
        status: 'applied'
      }
    });
    testJobId = job.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.coverLetter.deleteMany({ where: { userId: testUserId } });
    await prisma.job.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up cover letters before each test
    await prisma.coverLetter.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Cover Letter', () => {
    test('should create a new cover letter', async () => {
      const coverLetterData = {
        title: 'Cover Letter for Test Job',
        content: 'This is a test cover letter content.',
        jobId: testJobId
      };

      const coverLetter = await prisma.coverLetter.create({
        data: {
          userId: testUserId,
          ...coverLetterData
        }
      });

      expect(coverLetter).toBeDefined();
      expect(coverLetter.title).toBe(coverLetterData.title);
      expect(coverLetter.content).toBe(coverLetterData.content);
      expect(coverLetter.userId).toBe(testUserId);
    });

    test('should create cover letter with default template', async () => {
      const coverLetter = await prisma.coverLetter.create({
        data: {
          userId: testUserId,
          title: 'Untitled Cover Letter',
          content: 'Content here'
        }
      });

      expect(coverLetter).toBeDefined();
      expect(coverLetter.title).toBe('Untitled Cover Letter');
    });
  });

  describe('Get Cover Letter', () => {
    beforeEach(async () => {
      testCoverLetter = await prisma.coverLetter.create({
        data: {
          userId: testUserId,
          title: 'Test Cover Letter',
          content: 'Test content',
          jobId: testJobId
        }
      });
    });

    test('should get cover letter by ID', async () => {
      const coverLetter = await prisma.coverLetter.findUnique({
        where: { id: testCoverLetter.id }
      });

      expect(coverLetter).toBeDefined();
      expect(coverLetter.id).toBe(testCoverLetter.id);
    });

    test('should return cover letters by job ID', async () => {
      const coverLetters = await prisma.coverLetter.findMany({
        where: { jobId: testJobId }
      });

      expect(coverLetters).toBeDefined();
      expect(Array.isArray(coverLetters)).toBe(true);
    });
  });

  describe('Update Cover Letter', () => {
    beforeEach(async () => {
      testCoverLetter = await prisma.coverLetter.create({
        data: {
          userId: testUserId,
          title: 'Original Title',
          content: 'Original content'
        }
      });
    });

    test('should update cover letter content', async () => {
      const newContent = 'Updated content here';
      const updated = await prisma.coverLetter.update({
        where: { id: testCoverLetter.id },
        data: { content: newContent }
      });

      expect(updated.content).toBe(newContent);
    });

    test('should update cover letter title', async () => {
      const updated = await prisma.coverLetter.update({
        where: { id: testCoverLetter.id },
        data: { title: 'Updated Title' }
      });

      expect(updated.title).toBe('Updated Title');
    });
  });

  describe('Delete Cover Letter', () => {
    beforeEach(async () => {
      testCoverLetter = await prisma.coverLetter.create({
        data: {
          userId: testUserId,
          title: 'To Be Deleted',
          content: 'Test'
        }
      });
    });

    test('should delete a cover letter', async () => {
      await prisma.coverLetter.delete({ where: { id: testCoverLetter.id } });

      const deleted = await prisma.coverLetter.findUnique({
        where: { id: testCoverLetter.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

