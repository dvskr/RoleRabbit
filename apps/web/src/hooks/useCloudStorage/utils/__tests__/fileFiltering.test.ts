/**
 * TEST-005: Unit tests for file filtering and sorting logic
 */

import { filterAndSortFiles } from '../fileFiltering';
import { ResumeFile } from '../../../../../types/cloudStorage';

describe('fileFiltering - TEST-005', () => {
  const mockFiles: ResumeFile[] = [
    {
      id: 'file-1',
      name: 'Resume.pdf',
      fileName: 'resume.pdf',
      type: 'resume',
      size: '1 MB',
      sizeBytes: 1024 * 1024,
      contentType: 'application/pdf',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user-1',
      downloadCount: 10,
      viewCount: 20,
      isStarred: true,
      isArchived: false,
      sharedWith: [],
      comments: [],
      version: 1,
      owner: 'user-1',
      lastModified: '2024-01-01T00:00:00Z',
      folderId: null,
      deletedAt: null,
    },
    {
      id: 'file-2',
      name: 'Cover Letter.docx',
      fileName: 'cover-letter.docx',
      type: 'cover_letter',
      size: '500 KB',
      sizeBytes: 512 * 1024,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      userId: 'user-1',
      downloadCount: 5,
      viewCount: 10,
      isStarred: false,
      isArchived: false,
      sharedWith: [],
      comments: [],
      version: 1,
      owner: 'user-1',
      lastModified: '2024-01-02T00:00:00Z',
      folderId: 'folder-1',
      deletedAt: null,
    },
    {
      id: 'file-3',
      name: 'Portfolio.pdf',
      fileName: 'portfolio.pdf',
      type: 'portfolio',
      size: '2 MB',
      sizeBytes: 2 * 1024 * 1024,
      contentType: 'application/pdf',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      userId: 'user-1',
      downloadCount: 0,
      viewCount: 0,
      isStarred: false,
      isArchived: true,
      sharedWith: [],
      comments: [],
      version: 1,
      owner: 'user-1',
      lastModified: '2024-01-03T00:00:00Z',
      folderId: null,
      deletedAt: null,
    },
  ];

  describe('Filtering', () => {
    it('should filter by type', () => {
      const result = filterAndSortFiles(mockFiles, { type: 'resume' }, 'date', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('resume');
    });

    it('should filter by starred', () => {
      const result = filterAndSortFiles(mockFiles, { starred: true }, 'date', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].isStarred).toBe(true);
    });

    it('should filter by archived', () => {
      const result = filterAndSortFiles(mockFiles, { archived: true }, 'date', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].isArchived).toBe(true);
    });

    it('should filter by folder', () => {
      const result = filterAndSortFiles(mockFiles, { folderId: 'folder-1' }, 'date', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].folderId).toBe('folder-1');
    });

    it('should filter by search term', () => {
      const result = filterAndSortFiles(mockFiles, { search: 'Resume' }, 'date', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('Resume');
    });
  });

  describe('Sorting', () => {
    it('should sort by date descending', () => {
      const result = filterAndSortFiles(mockFiles, {}, 'date', 'desc');
      expect(result[0].id).toBe('file-3');
      expect(result[result.length - 1].id).toBe('file-1');
    });

    it('should sort by date ascending', () => {
      const result = filterAndSortFiles(mockFiles, {}, 'date', 'asc');
      expect(result[0].id).toBe('file-1');
      expect(result[result.length - 1].id).toBe('file-3');
    });

    it('should sort by name ascending', () => {
      const result = filterAndSortFiles(mockFiles, {}, 'name', 'asc');
      expect(result[0].name).toBe('Cover Letter.docx');
    });

    it('should sort by size descending', () => {
      const result = filterAndSortFiles(mockFiles, {}, 'size', 'desc');
      expect(result[0].sizeBytes).toBeGreaterThan(result[1].sizeBytes);
    });
  });

  describe('Combined Filtering and Sorting', () => {
    it('should filter and sort together', () => {
      const result = filterAndSortFiles(mockFiles, { type: 'resume' }, 'date', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('resume');
    });
  });
});

