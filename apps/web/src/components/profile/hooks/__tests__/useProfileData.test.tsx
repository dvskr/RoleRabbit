/**
 * Unit tests for useProfileData hook
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfileData } from '../useProfileData';
import { useProfile } from '@/contexts/ProfileContext';

// Mock the ProfileContext
jest.mock('@/contexts/ProfileContext', () => ({
  useProfile: jest.fn()
}));

const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;

describe('useProfileData', () => {
  const mockUpdateProfileData = jest.fn();
  const mockUserData = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProfile.mockReturnValue({
      userData: mockUserData,
      isLoading: false,
      updateProfileData: mockUpdateProfileData,
      refreshProfile: jest.fn()
    });
  });

  it('should initialize with context userData when available', () => {
    const { result } = renderHook(() => useProfileData({ isEditing: false }));
    
    expect(result.current.userData).toEqual(mockUserData);
    expect(result.current.isLoading).toBe(false);
  });

  it('should use localProfileData when editing', () => {
    const { result } = renderHook(() => useProfileData({ isEditing: true }));
    
    // Wait for local state to initialize
    waitFor(() => {
      expect(result.current.localProfileData).not.toBeNull();
    });
  });

  it('should provide updateLocalData function', () => {
    const { result } = renderHook(() => useProfileData({ isEditing: true }));
    
    expect(typeof result.current.updateLocalData).toBe('function');
    
    result.current.updateLocalData({ firstName: 'Jane' });
    
    waitFor(() => {
      expect(result.current.localProfileData?.firstName).toBe('Jane');
    });
  });

  it('should provide resetLocalData function', () => {
    const { result } = renderHook(() => useProfileData({ isEditing: true }));
    
    expect(typeof result.current.resetLocalData).toBe('function');
    
    // Update local data
    result.current.updateLocalData({ firstName: 'Jane' });
    
    // Reset it
    result.current.resetLocalData();
    
    waitFor(() => {
      expect(result.current.localProfileData?.firstName).toBe('John');
    });
  });

  it('should sync with context when not editing', () => {
    const updatedContextData = { ...mockUserData, firstName: 'Updated' };
    mockUseProfile.mockReturnValue({
      userData: updatedContextData,
      isLoading: false,
      updateProfileData: mockUpdateProfileData,
      refreshProfile: jest.fn()
    });

    const { result, rerender } = renderHook(() => useProfileData({ isEditing: false }));
    
    rerender();
    
    waitFor(() => {
      expect(result.current.userData.firstName).toBe('Updated');
    });
  });

  it('should handle loading state', () => {
    mockUseProfile.mockReturnValue({
      userData: null,
      isLoading: true,
      updateProfileData: mockUpdateProfileData,
      refreshProfile: jest.fn()
    });

    const { result } = renderHook(() => useProfileData({ isEditing: false }));
    
    expect(result.current.isLoading).toBe(true);
  });
});

