/**
 * Unit tests for useFolderOperations hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFolderOperations } from '../useFolderOperations';
import apiService from '../../../../services/apiService';

// Mock dependencies
jest.mock('../../../../services/apiService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useFolderOperations Hook', () => {
  let mockFiles: any[];
  let mockSetFiles: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFiles = [
      { id: 'file-1', name: 'File1.pdf', folderId: 'folder-1' },
      { id: 'file-2', name: 'File2.pdf', folderId: 'folder-2' },
      { id: 'file-3', name: 'File3.pdf', folderId: 'folder-1' },
      { id: 'file-4', name: 'File4.pdf', folderId: null }
    ];

    mockSetFiles = jest.fn();

    // Default API mocks
    mockApiService.getFolders.mockResolvedValue({
      success: true,
      folders: [
        { id: 'folder-1', name: 'Personal', color: '#3B82F6', fileCount: 2 },
        { id: 'folder-2', name: 'Work', color: '#10B981', fileCount: 1 }
      ]
    });

    mockApiService.createFolder.mockResolvedValue({
      success: true,
      folder: { id: 'new-folder', name: 'New Folder', color: '#F59E0B' }
    });

    mockApiService.updateFolder.mockResolvedValue({
      success: true,
      folder: { id: 'folder-1', name: 'Updated Folder' }
    });

    mockApiService.deleteFolder.mockResolvedValue({ success: true });
  });

  describe('Initialization', () => {
    it('should load folders on mount', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(mockApiService.getFolders).toHaveBeenCalled();
      });
    });

    it('should initialize with default folder selection (All Files)', () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      expect(result.current.selectedFolderId).toBeNull();
    });
  });

  describe('Folder Creation', () => {
    it('should create a new folder successfully', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await act(async () => {
        await result.current.handleCreateFolder('Projects', '#F59E0B');
      });

      expect(mockApiService.createFolder).toHaveBeenCalledWith({
        name: 'Projects',
        color: '#F59E0B'
      });
    });

    it('should add folder to local state after creation', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      const initialCount = result.current.folders.length;

      await act(async () => {
        await result.current.handleCreateFolder('New Folder', '#3B82F6');
      });

      await waitFor(() => {
        expect(result.current.folders.length).toBe(initialCount + 1);
      });
    });

    it('should handle folder creation errors', async () => {
      mockApiService.createFolder.mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      // Should not throw, but log error
      await act(async () => {
        await result.current.handleCreateFolder('Test Folder', '#3B82F6');
      });

      // Should still create a local folder as fallback
      await waitFor(() => {
        const hasTestFolder = result.current.folders.some(f => f.name === 'Test Folder');
        expect(hasTestFolder).toBe(true);
      });
    });
  });

  describe('Folder Update', () => {
    it('should rename a folder successfully', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.handleRenameFolder('folder-1', 'Personal Files');
      });

      expect(mockApiService.updateFolder).toHaveBeenCalledWith('folder-1', {
        name: 'Personal Files'
      });
    });

    it('should update folder in local state', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.handleRenameFolder('folder-1', 'Updated Name');
      });

      await waitFor(() => {
        const folder = result.current.folders.find(f => f.id === 'folder-1');
        expect(folder?.name).toBe('Updated Name');
      });
    });

    it('should handle rename errors', async () => {
      mockApiService.updateFolder.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      // Should not throw
      await act(async () => {
        await result.current.handleRenameFolder('folder-1', 'New Name');
      });
    });
  });

  describe('Folder Selection', () => {
    it('should select a folder', () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      act(() => {
        result.current.setSelectedFolderId('folder-1');
      });

      expect(result.current.selectedFolderId).toBe('folder-1');
    });

    it('should allow selecting "All Files" (null)', () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      act(() => {
        result.current.setSelectedFolderId('folder-1');
      });

      expect(result.current.selectedFolderId).toBe('folder-1');

      act(() => {
        result.current.setSelectedFolderId(null);
      });

      expect(result.current.selectedFolderId).toBeNull();
    });
  });

  describe('Folder Deletion', () => {
    it('should delete a folder successfully', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      const initialCount = result.current.folders.length;

      await act(async () => {
        await result.current.handleDeleteFolder('folder-2');
      });

      expect(mockApiService.deleteFolder).toHaveBeenCalledWith('folder-2');

      await waitFor(() => {
        expect(result.current.folders.length).toBe(initialCount - 1);
      });
    });

    it('should move files to root when deleting folder', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.handleDeleteFolder('folder-1');
      });

      // Files in folder-1 should be moved to root (folderId = null)
      expect(mockSetFiles).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should reset selectedFolderId if deleting selected folder', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.setSelectedFolderId('folder-1');
      });

      await act(async () => {
        await result.current.handleDeleteFolder('folder-1');
      });

      expect(result.current.selectedFolderId).toBeNull();
    });

    it('should handle deletion errors', async () => {
      mockApiService.deleteFolder.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      // Should not throw
      await act(async () => {
        await result.current.handleDeleteFolder('folder-1');
      });
    });
  });

  describe('Folder File Counts', () => {
    it('should calculate correct file counts for folders', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      // folder-1 has 2 files (file-1, file-3)
      const folder1 = result.current.folders.find(f => f.id === 'folder-1');
      expect(folder1?.fileCount).toBe(2);

      // folder-2 has 1 file (file-2)
      const folder2 = result.current.folders.find(f => f.id === 'folder-2');
      expect(folder2?.fileCount).toBe(1);
    });

    it('should update file counts when files change', async () => {
      const { result, rerender } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      // Add a new file to folder-1
      mockFiles.push({ id: 'file-5', name: 'File5.pdf', folderId: 'folder-1' });

      rerender();

      await waitFor(() => {
        const folder1 = result.current.folders.find(f => f.id === 'folder-1');
        expect(folder1?.fileCount).toBe(3);
      });
    });
  });

  describe('Empty State', () => {
    it('should handle empty folders list', async () => {
      mockApiService.getFolders.mockResolvedValue({
        success: true,
        folders: []
      });

      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders).toEqual([]);
      });
    });

    it('should handle API failure gracefully', async () => {
      mockApiService.getFolders.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        // Should not crash, folders should be empty
        expect(result.current.folders).toEqual([]);
      });
    });
  });

  describe('Folder Colors', () => {
    it('should preserve folder colors through operations', async () => {
      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await waitFor(() => {
        expect(result.current.folders.length).toBeGreaterThan(0);
      });

      const folder = result.current.folders[0];
      expect(folder.color).toBeDefined();
      expect(folder.color).toMatch(/^#[0-9A-F]{6}$/i); // Valid hex color
    });

    it('should use specified color when creating folder', async () => {
      const customColor = '#FF5733';

      const { result } = renderHook(() =>
        useFolderOperations(mockFiles, mockSetFiles)
      );

      await act(async () => {
        await result.current.handleCreateFolder('Custom Folder', customColor);
      });

      expect(mockApiService.createFolder).toHaveBeenCalledWith({
        name: 'Custom Folder',
        color: customColor
      });
    });
  });
});
