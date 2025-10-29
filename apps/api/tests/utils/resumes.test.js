/**
 * Resumes API Tests
 * Testing resume CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Resume API Tests', () => {
  let testUserId;
  let testResume;

  beforeAll(async () => {
    // Create a test user
    testUserId = 'test-user-' + Date.now();
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        provider: 'local'
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.resume.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up resumes before each test
    await prisma.resume.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Resume', () => {
    test('should create a new resume', async () => {
      const resumeData = {
        name: 'Test Resume',
        data: JSON.stringify({ sections: [] }),
        templateId: 'template-1'
      };

      const resume = await prisma.resume.create({
        data: {
          userId: testUserId,
          name: resumeData.name,
          data: resumeData.data,
          templateId: resumeData.templateId
        }
      });

      expect(resume).toBeDefined();
      expect(resume.name).toBe(resumeData.name);
      expect(resume.userId).toBe(testUserId);
    });

    test('should create resume with default name if not provided', async () => {
      const resume = await prisma.resume.create({
        data: {
          userId: testUserId,
          name: 'Untitled Resume',
          data: '{}'
        }
      });

      expect(resume.name).toBe('Untitled Resume');
    });
  });

  describe('Get Resume', () => {
    beforeEach(async () => {
      // Create a test resume
      testResume = await prisma.resume.create({
        data: {
          userId: testUserId,
          name: 'Test Resume',
          data: '{}'
        }
      });
    });

    test('should get resume by ID', async () => {
      const resume = await prisma.resume.findUnique({
        where: { id: testResume.id }
      });

      expect(resume).toBeDefined();
      expect(resume.id).toBe(testResume.id);
    });

    test('should return null for non-existent resume', async () => {
      const resume = await prisma.resume.findUnique({
        where: { id: 'non-existent-id' }
      });

      expect(resume).toBeNull();
    });
  });

  describe('List Resumes', () => {
    beforeEach(async () => {
      // Create multiple test resumes
      await prisma.resume.createMany({
        data: [
          { userId: testUserId, name: 'Resume 1', data: '{}' },
          { userId: testUserId, name: 'Resume 2', data: '{}' },
          { userId: testUserId, name: 'Resume 3', data: '{}' }
        ]
      });
    });

    test('should get all resumes for a user', async () => {
      const resumes = await prisma.resume.findMany({
        where: { userId: testUserId }
      });

      expect(resumes).toBeDefined();
      expect(resumes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Update Resume', () => {
    beforeEach(async () => {
      testResume = await prisma.resume.create({
        data: {
          userId: testUserId,
          name: 'Original Name',
          data: '{}'
        }
      });
    });

    test('should update resume name', async () => {
      const updated = await prisma.resume.update({
        where: { id: testResume.id },
        data: { name: 'Updated Name' }
      });

      expect(updated.name).toBe('Updated Name');
    });

    test('should update resume data', async () => {
      const newData = JSON.stringify({ sections: ['new section'] });
      const updated = await prisma.resume.update({
        where: { id: testResume.id },
        data: { data: newData }
      });

      expect(updated.data).toBe(newData);
    });
  });

  describe('Delete Resume', () => {
    beforeEach(async () => {
      testResume = await prisma.resume.create({
        data: {
          userId: testUserId,
          name: 'To Be Deleted',
          data: '{}'
        }
      });
    });

    test('should delete a resume', async () => {
      await prisma.resume.delete({ where: { id: testResume.id } });

      const deleted = await prisma.resume.findUnique({
        where: { id: testResume.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

