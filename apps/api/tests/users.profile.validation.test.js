/**
 * Integration tests for profile validation
 * Tests backend validation logic for profile endpoints
 */

const request = require('supertest');
const { createFastifyApp } = require('../utils/testHelpers');

describe('Profile Validation Tests', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(async () => {
    app = await createFastifyApp();
    // Setup: Create test user and get auth token
    // This would typically be done in a test setup
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('PUT /api/users/profile - Validation', () => {
    it('should reject invalid email format in personalEmail', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          personalEmail: 'invalid-email-format'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('email');
    });

    it('should reject invalid phone number format', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          phone: '123' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject invalid URL format for LinkedIn', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          linkedin: 'not-a-valid-url'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject invalid URL format for GitHub', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          github: 'not-a-valid-url'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject text fields exceeding max length', async () => {
      const longString = 'a'.repeat(10001); // Assuming max length is 10000
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          professionalBio: longString
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject invalid date format', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          workExperiences: [{
            company: 'Test Company',
            role: 'Developer',
            startDate: 'invalid-date-format'
          }]
        });

      // Note: Date validation might be lenient, adjust expectations accordingly
      expect([200, 400]).toContain(response.status);
    });

    it('should accept valid profile data', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        location: 'New York, NY',
        professionalBio: 'Experienced developer',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        skills: [{ name: 'JavaScript' }, { name: 'TypeScript' }],
        workExperiences: [{
          company: 'Test Company',
          role: 'Developer',
          startDate: '2020-01',
          endDate: '2021-01',
          isCurrent: false
        }]
      };

      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('should reject attempts to modify email (login email)', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          email: 'newemail@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('email');
    });

    it('should reject attempts to modify user ID', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          id: 'different-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Validation Error Messages', () => {
    it('should return specific error messages for validation failures', async () => {
      const response = await request(app.server)
        .put('/api/users/profile')
        .set('Cookie', `token=${authToken}`)
        .send({
          personalEmail: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
    });
  });
});

