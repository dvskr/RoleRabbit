/**
 * API Integration Tests
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = 'http://localhost:3001/api';

describe('API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Register a test user
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    
    const data = await response.json();
    authToken = data.token || data.accessToken || 'test-token';
    testUserId = data.user?.id || 'test-user-id';
  });

  describe('Authentication API', () => {
    test('POST /api/auth/register - should register new user', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: `newuser-${Date.now()}@example.com`,
          password: 'password123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBeDefined();
    });

    test('POST /api/auth/login - should authenticate user', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.token || data.user).toBeDefined();
    });
  });

  describe('Resume API', () => {
    test('GET /api/resumes - should return user resumes', async () => {
      const response = await fetch(`${API_BASE_URL}/resumes`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.resumes)).toBe(true);
    });

    test('POST /api/resumes - should create new resume', async () => {
      const response = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Resume',
          data: '{}',
          templateId: 'template-1'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.resume).toBeDefined();
    });
  });

  describe('Job API', () => {
    test('GET /api/jobs - should return user jobs', async () => {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.jobs)).toBe(true);
    });

    test('POST /api/jobs - should create new job', async () => {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Remote',
          status: 'applied'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job).toBeDefined();
    });
  });

  describe('Email API', () => {
    test('GET /api/emails - should return user emails', async () => {
      const response = await fetch(`${API_BASE_URL}/emails`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.emails)).toBe(true);
    });
  });

  afterAll(async () => {
    // Clean up test data if needed
  });
});

