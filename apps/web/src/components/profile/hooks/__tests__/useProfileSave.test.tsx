/**
 * Unit tests for useProfileSave hook
 */

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProfileSave } from '../useProfileSave';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/services/apiService');
jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn()
  }
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useProfileSave', () => {
  const mockUpdateProfileData = jest.fn();
  const mockSetLocalProfileData = jest.fn();
  const mockLocalProfileData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    skills: [],
    workExperiences: [],
    education: [],
    certifications: [],
    languages: [],
    projects: []
  };
  const mockDisplayData = { ...mockLocalProfileData };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document methods
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: null
    });
    Object.defineProperty(document, 'querySelectorAll', {
      writable: true,
      value: jest.fn(() => [])
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.isSaved).toBe(false);
    expect(result.current.saveMessage).toBeNull();
    expect(typeof result.current.handleSave).toBe('function');
  });

  it('should set isSaving to true when save starts', async () => {
    mockApiService.updateUserProfile.mockResolvedValue({
      user: mockLocalProfileData,
      success: true
    });

    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.isSaving).toBe(true);
  });

  it('should call API service with cleaned data', async () => {
    mockApiService.updateUserProfile.mockResolvedValue({
      user: mockLocalProfileData,
      success: true
    });

    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    await waitFor(() => {
      expect(mockApiService.updateUserProfile).toHaveBeenCalled();
    });
  });

  it('should update local state after successful save', async () => {
    const savedData = { ...mockLocalProfileData, firstName: 'Updated' };
    mockApiService.updateUserProfile.mockResolvedValue({
      user: savedData,
      success: true
    });

    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    await waitFor(() => {
      expect(mockSetLocalProfileData).toHaveBeenCalled();
      expect(mockUpdateProfileData).toHaveBeenCalled();
    });
  });

  it('should handle save errors', async () => {
    const error = new Error('Save failed');
    mockApiService.updateUserProfile.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
      expect(result.current.saveMessage).not.toBeNull();
      expect(result.current.saveMessage?.type).toBe('error');
    });
  });

  it('should clear save message', () => {
    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    act(() => {
      result.current.clearSaveMessage();
    });

    expect(result.current.saveMessage).toBeNull();
  });

  it('should set isSaved to true after successful save', async () => {
    mockApiService.updateUserProfile.mockResolvedValue({
      user: mockLocalProfileData,
      success: true
    });

    const { result } = renderHook(() =>
      useProfileSave({
        updateProfileData: mockUpdateProfileData,
        setLocalProfileData: mockSetLocalProfileData,
        localProfileData: mockLocalProfileData,
        displayData: mockDisplayData
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    await waitFor(() => {
      expect(result.current.isSaved).toBe(true);
    });
  });
});

