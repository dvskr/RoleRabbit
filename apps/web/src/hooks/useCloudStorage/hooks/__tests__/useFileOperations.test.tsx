/**
 * Unit tests for useFileOperations hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileOperations } from '../useFileOperations';
import apiService from '../../../../services/apiService';

// Mock dependencies
jest.mock('../../../../services/apiService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useFileOperations Hook', () => {
  let mockFiles: any[];
  let mockSetFiles: jest.Mock;
  const mockUser = { id: 'user-123', name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();

    mockFiles = [
      {
        id: 'file-1',
        name: 'Resume.pdf',
        type: 'resume',
        isStarred: false,
        isArchived: false,
        folderId: null,
        deletedAt: null
      },
      {
        id: 'file-2',
        name: 'Template.pdf',
        type: 'template',
        isStarred: true,
        isArchived: false,
        folderId: 'folder-1',
        deletedAt: null
      }
    ];

    mockSetFiles = jest.fn((updater) => {
      if (typeof updater === 'function') {
        mockFiles = updater(mockFiles);
      } else {
        mockFiles = updater;
      }
    });

    // Default API mocks
    mockApiService.uploadCloudFile.mockResolvedValue({
      success: true,
      file: { id: 'new-file', name: 'New.pdf' }
    });

    mockApiService.updateCloudFile.mockResolvedValue({
      success: true,
      file: { id: 'file-1', name: 'Updated.pdf' }
    });

    mockApiService.deleteCloudFile.mockResolvedValue({ success: true });
    mockApiService.restoreCloudFile.mockResolvedValue({ success: true });
    mockApiService.moveCloudFile.mockResolvedValue({ success: true });
  });

  describe('File Upload', () => {
    it('should upload a file successfully', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const payload = {
        file,
        displayName: 'Test File',
        type: 'resume' as const,
        folderId: null
      };

      await act(async () => {
        await result.current.handleUploadFile(payload);
      });

      expect(mockApiService.uploadCloudFile).toHaveBeenCalledWith(expect.any(FormData));
    });

    it('should handle upload errors', async () => {
      mockApiService.uploadCloudFile.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const payload = {
        file,
        displayName: 'Test File',
        type: 'resume' as const,
        folderId: null
      };

      await expect(result.current.handleUploadFile(payload)).rejects.toThrow('Upload failed');
    });
  });

  describe('File Edit - Optimistic Updates', () => {
    it('should optimistically update file and refresh on success', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      const updates = { name: 'Updated Resume.pdf' };

      await act(async () => {
        await result.current.handleEditFile('file-1', updates);
      });

      // Should update optimistically
      expect(mockSetFiles).toHaveBeenCalled();

      // Should call API
      expect(mockApiService.updateCloudFile).toHaveBeenCalledWith('file-1', updates);
    });

    it('should rollback on update failure', async () => {
      mockApiService.updateCloudFile.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      const originalName = mockFiles[0].name;
      const updates = { name: 'New Name.pdf' };

      await expect(
        act(async () => {
          await result.current.handleEditFile('file-1', updates);
        })
      ).rejects.toThrow('Update failed');

      // Should have attempted rollback
      expect(mockSetFiles).toHaveBeenCalled();
    });
  });

  describe('Star File - Optimistic Updates', () => {
    it('should optimistically star a file', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleStarFile('file-1');
      });

      expect(mockSetFiles).toHaveBeenCalled();
      expect(mockApiService.updateCloudFile).toHaveBeenCalledWith('file-1', {
        isStarred: true
      });
    });

    it('should optimistically unstar a starred file', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleStarFile('file-2'); // file-2 is already starred
      });

      expect(mockApiService.updateCloudFile).toHaveBeenCalledWith('file-2', {
        isStarred: false
      });
    });

    it('should rollback star on failure', async () => {
      mockApiService.updateCloudFile.mockRejectedValue(new Error('Star failed'));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await expect(
        act(async () => {
          await result.current.handleStarFile('file-1');
        })
      ).rejects.toThrow('Star failed');

      // Should have rolled back
      expect(mockSetFiles).toHaveBeenCalledTimes(2); // Once for optimistic, once for rollback
    });
  });

  describe('Archive File - Optimistic Updates', () => {
    it('should optimistically archive a file', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleArchiveFile('file-1');
      });

      expect(mockApiService.updateCloudFile).toHaveBeenCalledWith('file-1', {
        isArchived: true
      });
    });

    it('should optimistically unarchive an archived file', async () => {
      mockFiles[0].isArchived = true;

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleArchiveFile('file-1');
      });

      expect(mockApiService.updateCloudFile).toHaveBeenCalledWith('file-1', {
        isArchived: false
      });
    });
  });

  describe('Delete File - Optimistic Updates', () => {
    it('should optimistically delete a file', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleDeleteFile('file-1');
      });

      expect(mockSetFiles).toHaveBeenCalled();
      expect(mockApiService.deleteCloudFile).toHaveBeenCalledWith('file-1');
    });

    it('should rollback delete on failure', async () => {
      mockApiService.deleteCloudFile.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await expect(
        act(async () => {
          await result.current.handleDeleteFile('file-1');
        })
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('Restore File - Optimistic Updates', () => {
    it('should optimistically restore a deleted file', async () => {
      mockFiles[0].deletedAt = new Date().toISOString();

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleRestoreFile('file-1');
      });

      expect(mockApiService.restoreCloudFile).toHaveBeenCalledWith('file-1');
    });
  });

  describe('Move File - Optimistic Updates', () => {
    it('should optimistically move file to folder', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleMoveFile('file-1', 'folder-2');
      });

      expect(mockSetFiles).toHaveBeenCalled();
      expect(mockApiService.moveCloudFile).toHaveBeenCalledWith('file-1', 'folder-2');
    });

    it('should optimistically move file to root (null folder)', async () => {
      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handleMoveFile('file-2', null);
      });

      expect(mockApiService.moveCloudFile).toHaveBeenCalledWith('file-2', null);
    });

    it('should rollback move on failure', async () => {
      mockApiService.moveCloudFile.mockRejectedValue(new Error('Move failed'));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await expect(
        act(async () => {
          await result.current.handleMoveFile('file-1', 'folder-2');
        })
      ).rejects.toThrow('Move failed');
    });
  });

  describe('Permanent Delete', () => {
    it('should permanently delete a file', async () => {
      mockApiService.permanentlyDeleteCloudFile.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.handlePermanentDelete('file-1');
      });

      expect(mockApiService.permanentlyDeleteCloudFile).toHaveBeenCalledWith('file-1');
    });
  });

  describe('Download File', () => {
    it('should download a file', async () => {
      mockApiService.downloadCloudFile.mockResolvedValue(new Blob(['content']));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      const mockClick = jest.fn();
      const mockLink = { click: mockClick, href: '', download: '', style: {} };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

      await act(async () => {
        await result.current.handleDownloadFile('file-1', 'Resume.pdf');
      });

      expect(mockApiService.downloadCloudFile).toHaveBeenCalledWith('file-1');
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('Load Files from API', () => {
    it('should load files from API', async () => {
      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: [{ id: 'new-1', name: 'New File.pdf' }]
      });

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.loadFilesFromAPI(false);
      });

      expect(mockApiService.getCloudFiles).toHaveBeenCalledWith(false);
      expect(mockSetFiles).toHaveBeenCalled();
    });

    it('should load deleted files when includeDeleted is true', async () => {
      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: []
      });

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await act(async () => {
        await result.current.loadFilesFromAPI(true);
      });

      expect(mockApiService.getCloudFiles).toHaveBeenCalledWith(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApiService.getCloudFiles.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useFileOperations(mockFiles, mockSetFiles, mockUser)
      );

      await expect(
        act(async () => {
          await result.current.loadFilesFromAPI(false);
        })
      ).rejects.toThrow('Network error');
    });
  });
});
