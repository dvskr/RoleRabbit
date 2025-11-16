/**
 * Integration Tests: Resume CRUD Flow
 * 
 * Tests the complete CRUD flow with API integration
 */

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Resume CRUD Flow (API Integration)', () => {
  let testUserId: string;
  let createdResumeId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-crud@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password'
      }
    });
    testUserId = testUser.id;

    // Generate auth token (mock)
    authToken = 'test_token_' + testUserId;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.baseResume.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  // ============================================================================
  // CREATE RESUME
  // ============================================================================

  test('should create a new resume via API', async ({ request }) => {
    const response = await request.post('/api/base-resumes', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        userId: testUserId,
        name: 'Software Engineer Resume',
        slotNumber: 1,
        data: {
          contact: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-0100'
          },
          summary: 'Experienced software engineer with 5+ years',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Engineer',
              startDate: '2020-01',
              endDate: '2023-12',
              bullets: [
                'Developed microservices',
                'Led team of 5 engineers'
              ]
            }
          ],
          education: [
            {
              institution: 'University of Example',
              degree: 'BS Computer Science',
              field: 'Computer Science',
              startDate: '2015-09',
              endDate: '2019-05'
            }
          ],
          skills: {
            technical: ['JavaScript', 'Python', 'React', 'Node.js']
          }
        }
      }
    });

    expect(response.status()).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.resume).toBeDefined();
    expect(responseData.resume.name).toBe('Software Engineer Resume');

    createdResumeId = responseData.resume.id;

    // Verify database state
    const dbResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    expect(dbResume).toBeDefined();
    expect(dbResume?.userId).toBe(testUserId);
    expect(dbResume?.slotNumber).toBe(1);
    expect(dbResume?.isActive).toBe(false);
  });

  test('should reject creation when slot limit exceeded', async ({ request }) => {
    // Create 5 resumes (max limit)
    for (let i = 2; i <= 5; i++) {
      await prisma.baseResume.create({
        data: {
          userId: testUserId,
          name: `Resume ${i}`,
          slotNumber: i,
          data: { contact: { name: 'Test', email: 'test@example.com' } },
          formatting: {},
          metadata: {}
        }
      });
    }

    // Try to create 6th resume
    const response = await request.post('/api/base-resumes', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        userId: testUserId,
        name: 'Sixth Resume',
        slotNumber: 6,
        data: { contact: { name: 'Test', email: 'test@example.com' } }
      }
    });

    expect(response.status()).toBe(403);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('slot limit');
  });

  // ============================================================================
  // FETCH RESUME
  // ============================================================================

  test('should fetch resume by ID', async ({ request }) => {
    const response = await request.get(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.resume.id).toBe(createdResumeId);
    expect(responseData.resume.data.contact.name).toBe('John Doe');
    expect(responseData.resume.data.experience).toHaveLength(1);
  });

  test('should return 404 for non-existent resume', async ({ request }) => {
    const response = await request.get('/api/base-resumes/non-existent-id', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(404);
  });

  test('should return 403 for unauthorized access', async ({ request }) => {
    // Create resume for different user
    const otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        name: 'Other User',
        passwordHash: 'hashed'
      }
    });

    const otherResume = await prisma.baseResume.create({
      data: {
        userId: otherUser.id,
        name: 'Other Resume',
        slotNumber: 1,
        data: { contact: { name: 'Other', email: 'other@example.com' } },
        formatting: {},
        metadata: {}
      }
    });

    // Try to access with wrong user's token
    const response = await request.get(`/api/base-resumes/${otherResume.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(403);

    // Cleanup
    await prisma.baseResume.delete({ where: { id: otherResume.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  // ============================================================================
  // UPDATE RESUME
  // ============================================================================

  test('should update resume data', async ({ request }) => {
    const response = await request.patch(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        data: {
          contact: {
            name: 'John Doe',
            email: 'john.updated@example.com',
            phone: '555-0200'
          },
          summary: 'Updated summary with new achievements',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Engineer',
              startDate: '2020-01',
              endDate: '2023-12',
              bullets: [
                'Developed microservices',
                'Led team of 5 engineers',
                'Improved performance by 50%'
              ]
            }
          ],
          education: [
            {
              institution: 'University of Example',
              degree: 'BS Computer Science',
              field: 'Computer Science',
              startDate: '2015-09',
              endDate: '2019-05'
            }
          ],
          skills: {
            technical: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript']
          }
        }
      }
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.resume.data.contact.email).toBe('john.updated@example.com');
    expect(responseData.resume.data.summary).toBe('Updated summary with new achievements');

    // Verify database state
    const dbResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    expect(dbResume?.data).toMatchObject({
      contact: {
        email: 'john.updated@example.com'
      },
      summary: 'Updated summary with new achievements'
    });
  });

  test('should handle optimistic locking (version conflict)', async ({ request }) => {
    // Get current version
    const currentResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    // Update with old version number
    const response = await request.patch(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        version: (currentResume?.version || 1) - 1, // Old version
        data: {
          contact: { name: 'Test', email: 'test@example.com' },
          summary: 'Conflicting update'
        }
      }
    });

    expect(response.status()).toBe(409);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('conflict');
  });

  // ============================================================================
  // DELETE RESUME
  // ============================================================================

  test('should delete resume (soft delete)', async ({ request }) => {
    const response = await request.delete(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Verify soft delete in database
    const dbResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    expect(dbResume?.deletedAt).not.toBeNull();

    // Verify resume doesn't appear in list
    const listResponse = await request.get('/api/base-resumes', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const listData = await listResponse.json();
    const deletedResumeInList = listData.resumes.find((r: any) => r.id === createdResumeId);
    expect(deletedResumeInList).toBeUndefined();
  });

  test('should cascade delete working draft when deleting resume', async ({ request }) => {
    // Create new resume with draft
    const newResume = await prisma.baseResume.create({
      data: {
        userId: testUserId,
        name: 'Resume with Draft',
        slotNumber: 2,
        data: { contact: { name: 'Test', email: 'test@example.com' } },
        formatting: {},
        metadata: {}
      }
    });

    await prisma.workingDraft.create({
      data: {
        baseResumeId: newResume.id,
        userId: testUserId,
        data: { contact: { name: 'Draft', email: 'draft@example.com' } },
        formatting: {}
      }
    });

    // Delete resume
    await request.delete(`/api/base-resumes/${newResume.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    // Verify draft is also deleted
    const draft = await prisma.workingDraft.findUnique({
      where: { baseResumeId: newResume.id }
    });

    expect(draft).toBeNull();
  });
});

 * Integration Tests: Resume CRUD Flow
 * 
 * Tests the complete CRUD flow with API integration
 */

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Resume CRUD Flow (API Integration)', () => {
  let testUserId: string;
  let createdResumeId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-crud@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password'
      }
    });
    testUserId = testUser.id;

    // Generate auth token (mock)
    authToken = 'test_token_' + testUserId;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.baseResume.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  // ============================================================================
  // CREATE RESUME
  // ============================================================================

  test('should create a new resume via API', async ({ request }) => {
    const response = await request.post('/api/base-resumes', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        userId: testUserId,
        name: 'Software Engineer Resume',
        slotNumber: 1,
        data: {
          contact: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-0100'
          },
          summary: 'Experienced software engineer with 5+ years',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Engineer',
              startDate: '2020-01',
              endDate: '2023-12',
              bullets: [
                'Developed microservices',
                'Led team of 5 engineers'
              ]
            }
          ],
          education: [
            {
              institution: 'University of Example',
              degree: 'BS Computer Science',
              field: 'Computer Science',
              startDate: '2015-09',
              endDate: '2019-05'
            }
          ],
          skills: {
            technical: ['JavaScript', 'Python', 'React', 'Node.js']
          }
        }
      }
    });

    expect(response.status()).toBe(201);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.resume).toBeDefined();
    expect(responseData.resume.name).toBe('Software Engineer Resume');

    createdResumeId = responseData.resume.id;

    // Verify database state
    const dbResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    expect(dbResume).toBeDefined();
    expect(dbResume?.userId).toBe(testUserId);
    expect(dbResume?.slotNumber).toBe(1);
    expect(dbResume?.isActive).toBe(false);
  });

  test('should reject creation when slot limit exceeded', async ({ request }) => {
    // Create 5 resumes (max limit)
    for (let i = 2; i <= 5; i++) {
      await prisma.baseResume.create({
        data: {
          userId: testUserId,
          name: `Resume ${i}`,
          slotNumber: i,
          data: { contact: { name: 'Test', email: 'test@example.com' } },
          formatting: {},
          metadata: {}
        }
      });
    }

    // Try to create 6th resume
    const response = await request.post('/api/base-resumes', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        userId: testUserId,
        name: 'Sixth Resume',
        slotNumber: 6,
        data: { contact: { name: 'Test', email: 'test@example.com' } }
      }
    });

    expect(response.status()).toBe(403);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('slot limit');
  });

  // ============================================================================
  // FETCH RESUME
  // ============================================================================

  test('should fetch resume by ID', async ({ request }) => {
    const response = await request.get(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.resume.id).toBe(createdResumeId);
    expect(responseData.resume.data.contact.name).toBe('John Doe');
    expect(responseData.resume.data.experience).toHaveLength(1);
  });

  test('should return 404 for non-existent resume', async ({ request }) => {
    const response = await request.get('/api/base-resumes/non-existent-id', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(404);
  });

  test('should return 403 for unauthorized access', async ({ request }) => {
    // Create resume for different user
    const otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        name: 'Other User',
        passwordHash: 'hashed'
      }
    });

    const otherResume = await prisma.baseResume.create({
      data: {
        userId: otherUser.id,
        name: 'Other Resume',
        slotNumber: 1,
        data: { contact: { name: 'Other', email: 'other@example.com' } },
        formatting: {},
        metadata: {}
      }
    });

    // Try to access with wrong user's token
    const response = await request.get(`/api/base-resumes/${otherResume.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(403);

    // Cleanup
    await prisma.baseResume.delete({ where: { id: otherResume.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  // ============================================================================
  // UPDATE RESUME
  // ============================================================================

  test('should update resume data', async ({ request }) => {
    const response = await request.patch(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        data: {
          contact: {
            name: 'John Doe',
            email: 'john.updated@example.com',
            phone: '555-0200'
          },
          summary: 'Updated summary with new achievements',
          experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Engineer',
              startDate: '2020-01',
              endDate: '2023-12',
              bullets: [
                'Developed microservices',
                'Led team of 5 engineers',
                'Improved performance by 50%'
              ]
            }
          ],
          education: [
            {
              institution: 'University of Example',
              degree: 'BS Computer Science',
              field: 'Computer Science',
              startDate: '2015-09',
              endDate: '2019-05'
            }
          ],
          skills: {
            technical: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript']
          }
        }
      }
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.resume.data.contact.email).toBe('john.updated@example.com');
    expect(responseData.resume.data.summary).toBe('Updated summary with new achievements');

    // Verify database state
    const dbResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    expect(dbResume?.data).toMatchObject({
      contact: {
        email: 'john.updated@example.com'
      },
      summary: 'Updated summary with new achievements'
    });
  });

  test('should handle optimistic locking (version conflict)', async ({ request }) => {
    // Get current version
    const currentResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    // Update with old version number
    const response = await request.patch(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        version: (currentResume?.version || 1) - 1, // Old version
        data: {
          contact: { name: 'Test', email: 'test@example.com' },
          summary: 'Conflicting update'
        }
      }
    });

    expect(response.status()).toBe(409);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('conflict');
  });

  // ============================================================================
  // DELETE RESUME
  // ============================================================================

  test('should delete resume (soft delete)', async ({ request }) => {
    const response = await request.delete(`/api/base-resumes/${createdResumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Verify soft delete in database
    const dbResume = await prisma.baseResume.findUnique({
      where: { id: createdResumeId }
    });

    expect(dbResume?.deletedAt).not.toBeNull();

    // Verify resume doesn't appear in list
    const listResponse = await request.get('/api/base-resumes', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const listData = await listResponse.json();
    const deletedResumeInList = listData.resumes.find((r: any) => r.id === createdResumeId);
    expect(deletedResumeInList).toBeUndefined();
  });

  test('should cascade delete working draft when deleting resume', async ({ request }) => {
    // Create new resume with draft
    const newResume = await prisma.baseResume.create({
      data: {
        userId: testUserId,
        name: 'Resume with Draft',
        slotNumber: 2,
        data: { contact: { name: 'Test', email: 'test@example.com' } },
        formatting: {},
        metadata: {}
      }
    });

    await prisma.workingDraft.create({
      data: {
        baseResumeId: newResume.id,
        userId: testUserId,
        data: { contact: { name: 'Draft', email: 'draft@example.com' } },
        formatting: {}
      }
    });

    // Delete resume
    await request.delete(`/api/base-resumes/${newResume.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    // Verify draft is also deleted
    const draft = await prisma.workingDraft.findUnique({
      where: { baseResumeId: newResume.id }
    });

    expect(draft).toBeNull();
  });
});

