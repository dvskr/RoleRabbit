/**
 * TEST-004: Unit tests for useCredentialOperations hook
 * Tests: CRUD operations for credentials
 */

import { renderHook, act } from '@testing-library/react';
import { useCredentialOperations } from '../useCredentialOperations';
import apiService from '../../../../services/apiService';

jest.mock('../../../../services/apiService');
jest.mock('../../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useCredentialOperations - TEST-004', () => {
  const mockCredential = {
    id: 'cred-1',
    name: 'GitHub',
    username: 'testuser',
    password: 'encrypted',
    url: 'https://github.com',
    notes: 'Test credential',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Credential', () => {
    it('should create credential successfully', async () => {
      mockApiService.createCredential = jest.fn().mockResolvedValue({
        success: true,
        credential: mockCredential,
      });

      const { result } = renderHook(() => useCredentialOperations());

      await act(async () => {
        await result.current.handleCreateCredential({
          name: 'GitHub',
          username: 'testuser',
          password: 'password123',
          url: 'https://github.com',
          notes: 'Test credential',
        });
      });

      expect(mockApiService.createCredential).toHaveBeenCalledWith({
        name: 'GitHub',
        username: 'testuser',
        password: 'password123',
        url: 'https://github.com',
        notes: 'Test credential',
      });
    });
  });

  describe('Read Credentials', () => {
    it('should load credentials successfully', async () => {
      mockApiService.getCredentials = jest.fn().mockResolvedValue({
        success: true,
        credentials: [mockCredential],
      });

      const { result } = renderHook(() => useCredentialOperations());

      await act(async () => {
        await result.current.loadCredentials();
      });

      expect(mockApiService.getCredentials).toHaveBeenCalled();
      expect(result.current.credentials).toContainEqual(expect.objectContaining({ id: 'cred-1' }));
    });
  });

  describe('Update Credential', () => {
    it('should update credential successfully', async () => {
      mockApiService.updateCredential = jest.fn().mockResolvedValue({
        success: true,
        credential: { ...mockCredential, name: 'Updated GitHub' },
      });

      const { result } = renderHook(() => useCredentialOperations());

      act(() => {
        result.current.setCredentials([mockCredential]);
      });

      await act(async () => {
        await result.current.handleUpdateCredential('cred-1', {
          name: 'Updated GitHub',
        });
      });

      expect(mockApiService.updateCredential).toHaveBeenCalledWith('cred-1', {
        name: 'Updated GitHub',
      });
    });
  });

  describe('Delete Credential', () => {
    it('should delete credential successfully', async () => {
      mockApiService.deleteCredential = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCredentialOperations());

      act(() => {
        result.current.setCredentials([mockCredential]);
      });

      await act(async () => {
        await result.current.handleDeleteCredential('cred-1');
      });

      expect(mockApiService.deleteCredential).toHaveBeenCalledWith('cred-1');
    });
  });
});

