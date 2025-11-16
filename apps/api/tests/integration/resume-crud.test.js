const request = require('supertest');
const { app } = require('../../server');
const { prisma } = require('../../utils/db');
const { generateTestToken } = require('../helpers/auth');

describe('Resume CRUD Integration Tests', () => {
  let authToken;
  let testUserId;
  let testResumeId;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        subscriptionTier: 'PRO',
      },
    });
    testUserId = testUser.id;
    authToken = generateTestToken(testUserId);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.baseResume.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  describe('POST /api/base-resumes', () => {
    it('should create a new resume', async () => {
      const resumeData = {
        name: 'Software Engineer Resume',
        data: {
          contact: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
          },
          summary: 'Experienced software engineer with 5 years of experience',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Developer',
              startDate: '2020-01',
              endDate: '2023-12',
              bullets: ['Led team of 5 developers', 'Improved performance by 40%'],
            },
          ],
          skills: {
            technical: ['JavaScript', 'React', 'Node.js'],
          },
        },
      };

      const response = await request(app)
        .post('/api/base-resumes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resumeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.resume).toHaveProperty('id');
      expect(response.body.resume.name).toBe(resumeData.name);
      expect(response.body.resume.slotNumber).toBe(1);

      testResumeId = response.body.resume.id;
    });

    it('should reject resume creation when exceeding slot limit', async () => {
      // Create a free tier user
      const freeUser = await prisma.user.create({
        data: {
          email: 'free@example.com',
          name: 'Free User',
          subscriptionTier: 'FREE',
        },
      });
      const freeToken = generateTestToken(freeUser.id);

      // Create first resume (should succeed)
      await request(app)
        .post('/api/base-resumes')
        .set('Authorization', `Bearer ${freeToken}`)
        .send({ name: 'First Resume', data: {} })
        .expect(201);

      // Try to create second resume (should fail)
      const response = await request(app)
        .post('/api/base-resumes')
        .set('Authorization', `Bearer ${freeToken}`)
        .send({ name: 'Second Resume', data: {} })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('limit');

      // Cleanup
      await prisma.baseResume.deleteMany({ where: { userId: freeUser.id } });
      await prisma.user.delete({ where: { id: freeUser.id } });
    });
  });

  describe('GET /api/base-resumes/:id', () => {
    it('should fetch resume by ID', async () => {
      const response = await request(app)
        .get(`/api/base-resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.resume.id).toBe(testResumeId);
      expect(response.body.resume).toHaveProperty('data');
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .get('/api/base-resumes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when accessing another user\'s resume', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          name: 'Other User',
          subscriptionTier: 'FREE',
        },
      });
      const otherToken = generateTestToken(otherUser.id);

      const response = await request(app)
        .get(`/api/base-resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('PATCH /api/base-resumes/:id', () => {
    it('should update resume successfully', async () => {
      const updateData = {
        name: 'Updated Resume Name',
        data: {
          contact: {
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
          summary: 'Updated summary',
        },
      };

      const response = await request(app)
        .patch(`/api/base-resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.resume.name).toBe(updateData.name);
      expect(response.body.resume.data.contact.name).toBe('Jane Doe');
    });

    it('should detect version conflict', async () => {
      // Get current version
      const currentResume = await prisma.baseResume.findUnique({
        where: { id: testResumeId },
      });

      // Simulate another update (increment version)
      await prisma.baseResume.update({
        where: { id: testResumeId },
        data: { version: { increment: 1 } },
      });

      // Try to update with stale version
      const response = await request(app)
        .patch(`/api/base-resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Conflicting Update',
          expectedVersion: currentResume.version,
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('RESUME_CONFLICT');
    });
  });

  describe('DELETE /api/base-resumes/:id', () => {
    it('should soft delete resume', async () => {
      const response = await request(app)
        .delete(`/api/base-resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ soft: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify resume is soft deleted
      const deletedResume = await prisma.baseResume.findUnique({
        where: { id: testResumeId },
      });
      expect(deletedResume.deletedAt).not.toBeNull();
    });

    it('should hard delete resume', async () => {
      // Create a new resume for hard delete test
      const newResume = await prisma.baseResume.create({
        data: {
          userId: testUserId,
          slotNumber: 2,
          name: 'To Be Deleted',
          data: {},
        },
      });

      await request(app)
        .delete(`/api/base-resumes/${newResume.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ soft: 'false' })
        .expect(200);

      // Verify resume is hard deleted
      const deletedResume = await prisma.baseResume.findUnique({
        where: { id: newResume.id },
      });
      expect(deletedResume).toBeNull();
    });
  });

  describe('POST /api/base-resumes/:id/duplicate', () => {
    it('should duplicate resume successfully', async () => {
      // Create a resume to duplicate
      const originalResume = await prisma.baseResume.create({
        data: {
          userId: testUserId,
          slotNumber: 3,
          name: 'Original Resume',
          data: {
            contact: { name: 'John Doe' },
            summary: 'Original summary',
          },
        },
      });

      const response = await request(app)
        .post(`/api/base-resumes/${originalResume.id}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.resume.name).toContain('(Copy)');
      expect(response.body.resume.data).toEqual(originalResume.data);
      expect(response.body.resume.id).not.toBe(originalResume.id);

      // Cleanup
      await prisma.baseResume.delete({ where: { id: response.body.resume.id } });
      await prisma.baseResume.delete({ where: { id: originalResume.id } });
    });
  });

  describe('POST /api/base-resumes/:id/activate', () => {
    it('should activate resume and deactivate others', async () => {
      // Create two resumes
      const resume1 = await prisma.baseResume.create({
        data: {
          userId: testUserId,
          slotNumber: 4,
          name: 'Resume 1',
          isActive: true,
          data: {},
        },
      });

      const resume2 = await prisma.baseResume.create({
        data: {
          userId: testUserId,
          slotNumber: 5,
          name: 'Resume 2',
          isActive: false,
          data: {},
        },
      });

      // Activate resume 2
      await request(app)
        .post(`/api/base-resumes/${resume2.id}/activate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify resume 2 is active
      const updatedResume2 = await prisma.baseResume.findUnique({
        where: { id: resume2.id },
      });
      expect(updatedResume2.isActive).toBe(true);

      // Verify resume 1 is inactive
      const updatedResume1 = await prisma.baseResume.findUnique({
        where: { id: resume1.id },
      });
      expect(updatedResume1.isActive).toBe(false);

      // Cleanup
      await prisma.baseResume.deleteMany({
        where: { id: { in: [resume1.id, resume2.id] } },
      });
    });
  });
});


