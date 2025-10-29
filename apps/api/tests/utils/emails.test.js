/**
 * Emails API Tests
 * Testing email CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Email API Tests', () => {
  let testUserId;
  let testJobId;
  let testEmail;

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
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.job.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up emails before each test
    await prisma.email.deleteMany({ where: { userId: testUserId } });
  });

  describe('Create Email', () => {
    test('should create a new email', async () => {
      const emailData = {
        to: 'employer@company.com',
        subject: 'Thank you for the opportunity',
        body: 'Thank you for considering my application.',
        type: 'followup',
        status: 'sent',
        jobId: testJobId
      };

      const email = await prisma.email.create({
        data: {
          userId: testUserId,
          ...emailData
        }
      });

      expect(email).toBeDefined();
      expect(email.to).toBe(emailData.to);
      expect(email.subject).toBe(emailData.subject);
      expect(email.userId).toBe(testUserId);
    });

    test('should create email with default status', async () => {
      const email = await prisma.email.create({
        data: {
          userId: testUserId,
          to: 'test@example.com',
          subject: 'Test',
          body: 'Test body'
        }
      });

      expect(email.status).toBe('draft');
    });
  });

  describe('Get Email', () => {
    beforeEach(async () => {
      testEmail = await prisma.email.create({
        data: {
          userId: testUserId,
          to: 'test@example.com',
          subject: 'Test Subject',
          body: 'Test body',
          status: 'sent'
        }
      });
    });

    test('should get email by ID', async () => {
      const email = await prisma.email.findUnique({
        where: { id: testEmail.id }
      });

      expect(email).toBeDefined();
      expect(email.id).toBe(testEmail.id);
    });

    test('should return emails by job ID', async () => {
      const emails = await prisma.email.findMany({
        where: { jobId: testJobId }
      });

      expect(emails).toBeDefined();
      expect(Array.isArray(emails)).toBe(true);
    });
  });

  describe('Update Email', () => {
    beforeEach(async () => {
      testEmail = await prisma.email.create({
        data: {
          userId: testUserId,
          to: 'test@example.com',
          subject: 'Original Subject',
          body: 'Original body',
          status: 'draft'
        }
      });
    });

    test('should update email status', async () => {
      const updated = await prisma.email.update({
        where: { id: testEmail.id },
        data: { status: 'sent' }
      });

      expect(updated.status).toBe('sent');
    });

    test('should update email body', async () => {
      const newBody = 'Updated body content';
      const updated = await prisma.email.update({
        where: { id: testEmail.id },
        data: { body: newBody }
      });

      expect(updated.body).toBe(newBody);
    });
  });

  describe('Delete Email', () => {
    beforeEach(async () => {
      testEmail = await prisma.email.create({
        data: {
          userId: testUserId,
          to: 'test@example.com',
          subject: 'To Be Deleted',
          body: 'Test'
        }
      });
    });

    test('should delete an email', async () => {
      await prisma.email.delete({ where: { id: testEmail.id } });

      const deleted = await prisma.email.findUnique({
        where: { id: testEmail.id }
      });

      expect(deleted).toBeNull();
    });
  });
});

