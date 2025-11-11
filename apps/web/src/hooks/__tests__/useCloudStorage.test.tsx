/**
 * Unit tests for useCloudStorage hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCloudStorage } from '../useCloudStorage';
import apiService from '../../services/apiService';
import webSocketService from '../../services/webSocketService';

// Mock dependencies
jest.mock('../../services/apiService');
jest.mock('../../services/webSocketService');
jest.mock('../useDebounce', () => ({
  useDebounce: (value: any) => value // Return value immediately for tests
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockWebSocketService = webSocketService as jest.Mocked<typeof webSocketService>;

// Mock user context
const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };

describe('useCloudStorage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockApiService.getCloudFiles.mockResolvedValue({
      success: true,
      files: []
    });

    mockApiService.getFolders.mockResolvedValue({
      success: true,
      folders: []
    });

    mockApiService.getStorageQuota.mockResolvedValue({
      success: true,
      storage: {
        usedBytes: 1000000,
        limitBytes: 10000000000
      }
    });

    mockWebSocketService.isConnected.mockReturnValue(true);
    mockWebSocketService.on.mockReturnValue(() => {}); // Mock unsubscribe function
    mockWebSocketService.emit.mockReturnValue(undefined);
  });

  describe('Initial State', () => {
    it('should initialize with empty files and folders', async () => {
      const { result } = renderHook(() => useCloudStorage(mockUser));

      expect(result.current.files).toEqual([]);
      expect(result.current.folders).toEqual([]);
      expect(result.current.selectedFiles).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should load files from API on mount', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          name: 'Resume.pdf',
          type: 'resume',
          size: 50000,
          createdAt: new Date().toISOString()
        }
      ];

      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: mockFiles
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(mockApiService.getCloudFiles).toHaveBeenCalledWith(false);
      });
    });

    it('should load folders from API on mount', async () => {
      const mockFolders = [
        {
          id: 'folder-1',
          name: 'Personal',
          color: '#3B82F6',
          fileCount: 5
        }
      ];

      mockApiService.getFolders.mockResolvedValue({
        success: true,
        folders: mockFolders
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(mockApiService.getFolders).toHaveBeenCalled();
      });
    });
  });

  describe('File Filtering', () => {
    it('should filter files by search term', async () => {
      const mockFiles = [
        { id: '1', name: 'Resume.pdf', type: 'resume', description: 'My resume' },
        { id: '2', name: 'Cover Letter.docx', type: 'document', description: 'Cover letter' },
        { id: '3', name: 'Portfolio.pdf', type: 'document', description: 'Work samples' }
      ];

      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: mockFiles as any
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(result.current.files.length).toBe(3);
      });

      // Set search term
      act(() => {
        result.current.setSearchTerm('resume');
      });

      await waitFor(() => {
        const filtered = result.current.filteredFiles;
        expect(filtered.length).toBeLessThanOrEqual(2);
      });
    });

    it('should filter files by type', async () => {
      const mockFiles = [
        { id: '1', name: 'Resume.pdf', type: 'resume' },
        { id: '2', name: 'Template.pdf', type: 'template' },
        { id: '3', name: 'Backup.zip', type: 'backup' }
      ];

      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: mockFiles as any
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(result.current.files.length).toBe(3);
      });

      // Filter by resume type
      act(() => {
        result.current.setFilterType('resume');
      });

      await waitFor(() => {
        const filtered = result.current.filteredFiles;
        expect(filtered.every(f => f.type === 'resume')).toBe(true);
      });
    });

    it('should filter files by folder', async () => {
      const mockFiles = [
        { id: '1', name: 'File1.pdf', folderId: 'folder-1' },
        { id: '2', name: 'File2.pdf', folderId: 'folder-2' },
        { id: '3', name: 'File3.pdf', folderId: 'folder-1' }
      ];

      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: mockFiles as any
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(result.current.files.length).toBe(3);
      });

      // Select folder
      act(() => {
        result.current.setSelectedFolderId('folder-1');
      });

      await waitFor(() => {
        const filtered = result.current.filteredFiles;
        expect(filtered.every(f => f.folderId === 'folder-1')).toBe(true);
        expect(filtered.length).toBe(2);
      });
    });

    it('should filter deleted files when showDeleted is true', async () => {
      const mockFiles = [
        { id: '1', name: 'Active.pdf', deletedAt: null },
        { id: '2', name: 'Deleted.pdf', deletedAt: new Date().toISOString() }
      ];

      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: mockFiles as any
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      // Toggle to show deleted files
      act(() => {
        result.current.setShowDeleted(true);
      });

      await waitFor(() => {
        expect(mockApiService.getCloudFiles).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('File Selection', () => {
    it('should select a single file', () => {
      const { result } = renderHook(() => useCloudStorage(mockUser));

      act(() => {
        result.current.handleFileSelect('file-1');
      });

      expect(result.current.selectedFiles).toContain('file-1');
    });

    it('should deselect a file when clicked again', () => {
      const { result } = renderHook(() => useCloudStorage(mockUser));

      act(() => {
        result.current.handleFileSelect('file-1');
      });

      expect(result.current.selectedFiles).toContain('file-1');

      act(() => {
        result.current.handleFileSelect('file-1');
      });

      expect(result.current.selectedFiles).not.toContain('file-1');
    });

    it('should select all files', async () => {
      const mockFiles = [
        { id: '1', name: 'File1.pdf' },
        { id: '2', name: 'File2.pdf' },
        { id: '3', name: 'File3.pdf' }
      ];

      mockApiService.getCloudFiles.mockResolvedValue({
        success: true,
        files: mockFiles as any
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(result.current.files.length).toBe(3);
      });

      act(() => {
        result.current.handleSelectAll();
      });

      expect(result.current.selectedFiles.length).toBe(3);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useCloudStorage(mockUser));

      act(() => {
        result.current.handleFileSelect('file-1');
        result.current.handleFileSelect('file-2');
      });

      expect(result.current.selectedFiles.length).toBe(2);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedFiles.length).toBe(0);
    });
  });

  describe('WebSocket Integration', () => {
    it('should authenticate WebSocket on mount', () => {
      renderHook(() => useCloudStorage(mockUser));

      expect(mockWebSocketService.emit).toHaveBeenCalledWith('authenticate', {
        userId: mockUser.id
      });
    });

    it('should set up event listeners for real-time updates', () => {
      renderHook(() => useCloudStorage(mockUser));

      expect(mockWebSocketService.on).toHaveBeenCalledWith('file_created', expect.any(Function));
      expect(mockWebSocketService.on).toHaveBeenCalledWith('file_updated', expect.any(Function));
      expect(mockWebSocketService.on).toHaveBeenCalledWith('file_deleted', expect.any(Function));
      expect(mockWebSocketService.on).toHaveBeenCalledWith('file_restored', expect.any(Function));
      expect(mockWebSocketService.on).toHaveBeenCalledWith('file_shared', expect.any(Function));
      expect(mockWebSocketService.on).toHaveBeenCalledWith('share_removed', expect.any(Function));
      expect(mockWebSocketService.on).toHaveBeenCalledWith('comment_added', expect.any(Function));
    });

    it('should cleanup WebSocket listeners on unmount', () => {
      const unsubscribe = jest.fn();
      mockWebSocketService.on.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useCloudStorage(mockUser));

      unmount();

      // Each listener should have been unsubscribed
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Debounced Search', () => {
    it('should debounce search input', async () => {
      const { result } = renderHook(() => useCloudStorage(mockUser));

      // Rapidly change search term
      act(() => {
        result.current.setSearchTerm('r');
      });
      act(() => {
        result.current.setSearchTerm('re');
      });
      act(() => {
        result.current.setSearchTerm('res');
      });
      act(() => {
        result.current.setSearchTerm('resu');
      });
      act(() => {
        result.current.setSearchTerm('resume');
      });

      // Final value should be 'resume'
      expect(result.current.searchTerm).toBe('resume');
    });
  });

  describe('Storage Quota', () => {
    it('should load storage quota information', async () => {
      const mockQuota = {
        usedBytes: 5000000000, // 5 GB
        limitBytes: 10000000000, // 10 GB
        usedGB: 5,
        limitGB: 10,
        percentage: 50
      };

      mockApiService.getStorageQuota.mockResolvedValue({
        success: true,
        storage: mockQuota
      });

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        expect(result.current.storageInfo.usedGB).toBeDefined();
      });
    });

    it('should refresh storage quota', async () => {
      const { result } = renderHook(() => useCloudStorage(mockUser));

      await act(async () => {
        await result.current.refreshStorageInfo();
      });

      expect(mockApiService.getStorageQuota).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockApiService.getCloudFiles.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCloudStorage(mockUser));

      await waitFor(() => {
        // Should not crash, files should remain empty
        expect(result.current.files).toEqual([]);
      });
    });

    it('should handle missing user', () => {
      const { result } = renderHook(() => useCloudStorage(null as any));

      // Should not crash
      expect(result.current.files).toEqual([]);
    });
  });
});
