/**
 * TEST-001: Comprehensive unit tests for useFileOperations hook
 * Tests: upload, delete, restore, download, edit operations
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileOperations } from '../useFileOperations';
import apiService from '../../../../services/apiService';
import { ResumeFile } from '../../../../types/cloudStorage';

// Mock dependencies
jest.mock('../../../../services/apiService');
jest.mock('../../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));
jest.mock('../../../../utils/networkErrorHandler');
jest.mock('../../../../utils/requestDeduplication');
jest.mock('../../../../utils/cache');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useFileOperations - TEST-001', () => {
  const mockFile: File = new File(['content'], 'test.pdf', { type: 'application/pdf' });
  const mockResumeFile: ResumeFile = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.getCloudFiles = jest.fn().mockResolvedValue({ files: [], storage: { usedBytes: 0, limitBytes: 1024 * 1024 * 1024 } });
  });

  describe('Upload Operations', () => {
    it('should upload file successfully', async () => {
      mockApiService.uploadStorageFile = jest.fn().mockResolvedValue({
        success: true,
        file: mockResumeFile,
        storage: { usedBytes: 1024 * 1024, limitBytes: 1024 * 1024 * 1024, percentage: 0.1 },
      });

      const { result } = renderHook(() => useFileOperations());

      await act(async () => {
        await result.current.handleUploadFile({
          file: mockFile,
          displayName: 'Test File',
          type: 'document',
        });
      });

      expect(mockApiService.uploadStorageFile).toHaveBeenCalled();
      expect(result.current.files).toContainEqual(expect.objectContaining({ id: 'file-1' }));
    });

    it('should handle upload errors gracefully', async () => {
      mockApiService.uploadStorageFile = jest.fn().mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() => useFileOperations());

      await act(async () => {
        await expect(
          result.current.handleUploadFile({
            file: mockFile,
            displayName: 'Test File',
          })
        ).rejects.toThrow('Upload failed');
      });
    });

    it('should handle quota exceeded error', async () => {
      const quotaError: any = new Error('Storage quota exceeded');
      quotaError.storage = { usedBytes: 1024 * 1024 * 1024, limitBytes: 1024 * 1024 * 1024, percentage: 100 };
      mockApiService.uploadStorageFile = jest.fn().mockRejectedValue(quotaError);

      const onStorageUpdate = jest.fn();
      const { result } = renderHook(() => useFileOperations({ onStorageUpdate }));

      await act(async () => {
        await expect(
          result.current.handleUploadFile({
            file: mockFile,
            displayName: 'Test File',
          })
        ).rejects.toThrow('Storage quota exceeded');
      });

      expect(onStorageUpdate).toHaveBeenCalledWith(quotaError.storage);
    });
  });

  describe('Delete Operations', () => {
    it('should soft delete file', async () => {
      mockApiService.deleteCloudFile = jest.fn().mockResolvedValue({ success: true });
      mockApiService.getCloudFiles = jest.fn().mockResolvedValue({
        files: [{ ...mockResumeFile, deletedAt: new Date().toISOString() }],
        storage: { usedBytes: 0, limitBytes: 1024 * 1024 * 1024 },
      });

      const { result } = renderHook(() => useFileOperations());

      act(() => {
        result.current.setFiles([mockResumeFile]);
      });

      await act(async () => {
        await result.current.handleDeleteFile('file-1');
      });

      expect(mockApiService.deleteCloudFile).toHaveBeenCalledWith('file-1');
    });

    it('should permanently delete file', async () => {
      mockApiService.permanentlyDeleteCloudFile = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useFileOperations());

      act(() => {
        result.current.setFiles([mockResumeFile]);
      });

      await act(async () => {
        await result.current.handlePermanentDelete('file-1');
      });

      expect(mockApiService.permanentlyDeleteCloudFile).toHaveBeenCalledWith('file-1');
    });
  });

  describe('Restore Operations', () => {
    it('should restore deleted file', async () => {
      mockApiService.restoreCloudFile = jest.fn().mockResolvedValue({
        success: true,
        file: { ...mockResumeFile, deletedAt: null },
      });

      const deletedFile = { ...mockResumeFile, deletedAt: new Date().toISOString() };
      const { result } = renderHook(() => useFileOperations());

      act(() => {
        result.current.setFiles([deletedFile]);
      });

      await act(async () => {
        await result.current.handleRestoreFile('file-1');
      });

      expect(mockApiService.restoreCloudFile).toHaveBeenCalledWith('file-1');
    });
  });

  describe('Download Operations', () => {
    it('should download file successfully', async () => {
      const blob = new Blob(['content'], { type: 'application/pdf' });
      mockApiService.downloadCloudFile = jest.fn().mockResolvedValue(blob);

      const linkMock = {
        click: jest.fn(),
        setAttribute: jest.fn(),
        style: {},
      } as unknown as HTMLAnchorElement;

      jest.spyOn(document, 'createElement').mockReturnValueOnce(linkMock);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => linkMock);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => linkMock);
      jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob://url');
      jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

      const { result } = renderHook(() => useFileOperations());

      act(() => {
        result.current.setFiles([mockResumeFile]);
      });

      await act(async () => {
        await result.current.handleDownloadFile(mockResumeFile);
      });

      expect(mockApiService.downloadCloudFile).toHaveBeenCalledWith('file-1');
      expect(linkMock.click).toHaveBeenCalled();
    });
  });

  describe('Edit Operations', () => {
    it('should update file metadata', async () => {
      mockApiService.updateCloudFile = jest.fn().mockResolvedValue({
        success: true,
        file: { ...mockResumeFile, name: 'Updated Name', description: 'Updated description' },
      });

      const { result } = renderHook(() => useFileOperations());

      act(() => {
        result.current.setFiles([mockResumeFile]);
      });

      await act(async () => {
        await result.current.handleEditFile('file-1', {
          name: 'Updated Name',
          description: 'Updated description',
        });
      });

      expect(mockApiService.updateCloudFile).toHaveBeenCalledWith('file-1', {
        name: 'Updated Name',
        description: 'Updated description',
      });
    });
  });
});

