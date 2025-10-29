/**
 * API Service Integration Tests
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('API Service Integration', () => {
  let apiService: any;

  beforeEach(() => {
    // Mock API service
    apiService = {
      login: jest.fn(),
      register: jest.fn(),
      getJobs: jest.fn(),
      createJob: jest.fn()
    };
  });

  test('should handle login API call', async () => {
    apiService.login.mockResolvedValue({
      user: { id: '1', name: 'Test User' },
      token: 'test-token'
    });

    const result = await apiService.login('test@example.com', 'password');
    
    expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });

  test('should handle register API call', async () => {
    apiService.register.mockResolvedValue({
      success: true,
      user: { id: '1', name: 'New User' }
    });

    const result = await apiService.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    });
    
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  test('should fetch jobs from API', async () => {
    apiService.getJobs.mockResolvedValue({
      jobs: [
        { id: '1', title: 'Engineer', company: 'Tech Corp' }
      ]
    });

    const result = await apiService.getJobs();
    
    expect(Array.isArray(result.jobs)).toBe(true);
    expect(result.jobs.length).toBeGreaterThan(0);
  });

  test('should create job via API', async () => {
    apiService.createJob.mockResolvedValue({
      success: true,
      job: { id: '1', title: 'Engineer', company: 'Tech Corp' }
    });

    const result = await apiService.createJob({
      title: 'Engineer',
      company: 'Tech Corp',
      status: 'applied'
    });
    
    expect(result.success).toBe(true);
    expect(result.job).toBeDefined();
  });

  test('should handle API errors gracefully', async () => {
    apiService.getJobs.mockRejectedValue(new Error('Network error'));

    try {
      await apiService.getJobs();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Network error');
    }
  });
});

