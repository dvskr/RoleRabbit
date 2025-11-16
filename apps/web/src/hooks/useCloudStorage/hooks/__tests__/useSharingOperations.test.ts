/**
 * TEST-002: Unit tests for useSharingOperations hook
 * Tests: share, remove share, update permission, add comment
 */

import { renderHook, act } from '@testing-library/react';
import { useSharingOperations } from '../useSharingOperations';
import apiService from '../../../../services/apiService';
import { ResumeFile } from '../../../../types/cloudStorage';

jest.mock('../../../../services/apiService');
jest.mock('../../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useSharingOperations - TEST-002', () => {
  const mockFile: ResumeFile = {
    id: 'file-1',
    name: 'Test File',
    fileName: 'test.pdf',
    type: 'document',
    size: '1 MB',
    sizeBytes: 1024 * 1024,
    contentType: 'application/pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
    downloadCount: 0,
    viewCount: 0,
    isStarred: false,
    isArchived: false,
    sharedWith: [],
    comments: [],
    version: 1,
    owner: 'user-1',
    lastModified: new Date().toISOString(),
    folderId: null,
    deletedAt: null,
  };

  const setFiles = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setFiles.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const newFiles = updater([mockFile]);
        return newFiles;
      }
      return updater;
    });
  });

  describe('Share with User', () => {
    it('should share file with user successfully', async () => {
      mockApiService.shareFile = jest.fn().mockResolvedValue({
        success: true,
        share: {
          id: 'share-1',
          sharedWithEmail: 'user@example.com',
          permission: 'view',
        },
      });

      const { result } = renderHook(() => useSharingOperations([mockFile], setFiles));

      await act(async () => {
        await result.current.handleShareWithUser('file-1', 'user@example.com', 'view');
      });

      expect(mockApiService.shareFile).toHaveBeenCalledWith('file-1', {
        userEmail: 'user@example.com',
        permission: 'view',
      });
      expect(setFiles).toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useSharingOperations([mockFile], setFiles));

      await act(async () => {
        await expect(
          result.current.handleShareWithUser('file-1', 'invalid-email', 'view')
        ).rejects.toThrow('Please enter a valid email address');
      });
    });
  });

  describe('Remove Share', () => {
    it('should remove share successfully', async () => {
      mockApiService.removeShare = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSharingOperations([mockFile], setFiles));

      await act(async () => {
        await result.current.handleRemoveShare('file-1', 'share-1');
      });

      expect(mockApiService.removeShare).toHaveBeenCalledWith('file-1', 'share-1');
    });
  });

  describe('Update Permission', () => {
    it('should update share permission', async () => {
      mockApiService.updateSharePermission = jest.fn().mockResolvedValue({
        success: true,
        share: {
          id: 'share-1',
          permission: 'edit',
        },
      });

      const { result } = renderHook(() => useSharingOperations([mockFile], setFiles));

      await act(async () => {
        await result.current.handleUpdatePermission('file-1', 'share-1', 'edit');
      });

      expect(mockApiService.updateSharePermission).toHaveBeenCalledWith('file-1', 'share-1', 'edit');
    });
  });

  describe('Add Comment', () => {
    it('should add comment successfully', async () => {
      mockApiService.addComment = jest.fn().mockResolvedValue({
        success: true,
        comment: {
          id: 'comment-1',
          content: 'Test comment',
          userId: 'user-1',
          createdAt: new Date().toISOString(),
        },
      });

      const { result } = renderHook(() => useSharingOperations([mockFile], setFiles));

      await act(async () => {
        await result.current.handleAddComment('file-1', 'Test comment');
      });

      expect(mockApiService.addComment).toHaveBeenCalledWith('file-1', {
        content: 'Test comment',
      });
    });
  });
});

