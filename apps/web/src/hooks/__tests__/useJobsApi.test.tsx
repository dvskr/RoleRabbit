/**
 * Tests for useJobsApi Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useJobsApi } from '../../hooks/useJobsApi';

// Mock the API service
jest.mock('../../services/apiService', () => ({
  default: {
    getJobs: jest.fn(),
    saveJob: jest.fn(),
    updateJob: jest.fn(),
    deleteJob: jest.fn(),
  },
}));

describe('useJobsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useJobsApi());

    expect(result.current.jobs).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should have all required functions', () => {
    const { result } = renderHook(() => useJobsApi());

    expect(typeof result.current.addJob).toBe('function');
    expect(typeof result.current.updateJob).toBe('function');
    expect(typeof result.current.deleteJob).toBe('function');
    expect(typeof result.current.bulkDelete).toBe('function');
    expect(typeof result.current.bulkUpdateStatus).toBe('function');
  });
});

