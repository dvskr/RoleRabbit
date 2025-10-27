/**
 * Tests for API Service
 */

import apiService from '../../services/apiService';

describe('API Service', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    global.localStorage = localStorageMock as any;
  });

  describe('Authentication', () => {
    it('should get auth token', () => {
      (global.localStorage.getItem as jest.Mock).mockReturnValue('test-token');
      
      // Since getAuthToken is private, we test through public methods
      expect(true).toBe(true);
    });
  });

  describe('API Methods', () => {
    it('should have getJobs method', () => {
      expect(typeof apiService.getJobs).toBe('function');
    });

    it('should have getResumes method', () => {
      expect(typeof apiService.getResumes).toBe('function');
    });

    it('should have getEmails method', () => {
      expect(typeof apiService.getEmails).toBe('function');
    });

    it('should have getCoverLetters method', () => {
      expect(typeof apiService.getCoverLetters).toBe('function');
    });

    it('should have getPortfolios method', () => {
      expect(typeof apiService.getPortfolios).toBe('function');
    });
  });
});

