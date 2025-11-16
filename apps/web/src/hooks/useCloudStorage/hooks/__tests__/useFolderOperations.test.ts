/**
 * TEST-003: Unit tests for useFolderOperations hook
 * Tests: create, rename, delete, move
 */

import { renderHook, act } from '@testing-library/react';
import { useFolderOperations } from '../useFolderOperations';
import apiService from '../../../../services/apiService';
import { ResumeFile, Folder } from '../../../../types/cloudStorage';

jest.mock('../../../../services/apiService');
jest.mock('../../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useFolderOperations - TEST-003', () => {
  const mockFiles: ResumeFile[] = [];
  const setFiles = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Folder', () => {
    it('should create folder successfully', async () => {
      const mockFolder: Folder = {
        id: 'folder-1',
        name: 'New Folder',
        color: '#4F46E5',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileCount: 0,
        parentId: null,
      };

      mockApiService.createFolder = jest.fn().mockResolvedValue({
        success: true,
        folder: mockFolder,
      });

      const { result } = renderHook(() => useFolderOperations(mockFiles, setFiles));

      await act(async () => {
        await result.current.handleCreateFolder('New Folder', '#4F46E5');
      });

      expect(mockApiService.createFolder).toHaveBeenCalledWith({
        name: 'New Folder',
        color: '#4F46E5',
      });
      expect(result.current.folders).toContainEqual(expect.objectContaining({ id: 'folder-1' }));
    });

    it('should handle folder creation errors', async () => {
      mockApiService.createFolder = jest.fn().mockRejectedValue(new Error('Folder creation failed'));

      const { result } = renderHook(() => useFolderOperations(mockFiles, setFiles));

      await act(async () => {
        await expect(
          result.current.handleCreateFolder('New Folder')
        ).rejects.toThrow('Folder creation failed');
      });
    });
  });

  describe('Rename Folder', () => {
    it('should rename folder successfully', async () => {
      const existingFolder: Folder = {
        id: 'folder-1',
        name: 'Old Name',
        color: '#4F46E5',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileCount: 0,
        parentId: null,
      };

      mockApiService.updateFolder = jest.fn().mockResolvedValue({
        success: true,
        folder: { ...existingFolder, name: 'New Name' },
      });

      const { result } = renderHook(() => useFolderOperations(mockFiles, setFiles));

      act(() => {
        result.current.setFolders([existingFolder]);
      });

      await act(async () => {
        await result.current.handleRenameFolder('folder-1', 'New Name');
      });

      expect(mockApiService.updateFolder).toHaveBeenCalledWith('folder-1', {
        name: 'New Name',
      });
    });
  });

  describe('Delete Folder', () => {
    it('should delete folder successfully', async () => {
      const folder: Folder = {
        id: 'folder-1',
        name: 'Test Folder',
        color: '#4F46E5',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileCount: 0,
        parentId: null,
      };

      mockApiService.deleteFolder = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useFolderOperations(mockFiles, setFiles));

      act(() => {
        result.current.setFolders([folder]);
      });

      await act(async () => {
        await result.current.handleDeleteFolder('folder-1');
      });

      expect(mockApiService.deleteFolder).toHaveBeenCalledWith('folder-1');
    });
  });

  describe('Move Files to Folder', () => {
    it('should move files to folder successfully', async () => {
      const file: ResumeFile = {
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

      mockApiService.moveFileToFolder = jest.fn().mockResolvedValue({
        success: true,
        file: { ...file, folderId: 'folder-1' },
      });

      const { result } = renderHook(() => useFolderOperations([file], setFiles));

      await act(async () => {
        await result.current.handleMoveToFolder('file-1', 'folder-1');
      });

      expect(mockApiService.moveFileToFolder).toHaveBeenCalledWith('file-1', 'folder-1');
    });
  });
});

