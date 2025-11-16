/**
 * TEST-010: Unit tests for storage handler (upload, download, delete)
 */

const storageHandler = require('../../utils/storageHandler');
const { createClient } = require('@supabase/supabase-js');

jest.mock('@supabase/supabase-js');

describe('Storage Handler - TEST-010', () => {
  const mockSupabaseClient = {
    storage: {
      from: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createClient.mockReturnValue(mockSupabaseClient);
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      const mockBucket = {
        upload: jest.fn().mockResolvedValue({
          data: { path: 'user-1/test-file.pdf' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://supabase.co/storage/v1/object/public/files/user-1/test-file.pdf' },
        }),
      };

      mockSupabaseClient.storage.from.mockReturnValue(mockBucket);

      const file = Buffer.from('test content');
      const result = await storageHandler.upload(file, 'user-1', 'test-file.pdf', 'application/pdf');

      expect(result.path).toBe('user-1/test-file.pdf');
      expect(mockBucket.upload).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const mockBucket = {
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' },
        }),
      };

      mockSupabaseClient.storage.from.mockReturnValue(mockBucket);

      const file = Buffer.from('test content');
      await expect(
        storageHandler.upload(file, 'user-1', 'test-file.pdf', 'application/pdf')
      ).rejects.toThrow();
    });
  });

  describe('downloadAsBuffer', () => {
    it('should download file successfully', async () => {
      const mockBucket = {
        download: jest.fn().mockResolvedValue({
          data: Buffer.from('file content'),
          error: null,
        }),
      };

      mockSupabaseClient.storage.from.mockReturnValue(mockBucket);

      const result = await storageHandler.downloadAsBuffer('user-1/test-file.pdf');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('file content');
    });

    it('should handle download errors', async () => {
      const mockBucket = {
        download: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'File not found' },
        }),
      };

      mockSupabaseClient.storage.from.mockReturnValue(mockBucket);

      await expect(
        storageHandler.downloadAsBuffer('user-1/non-existent.pdf')
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      const mockBucket = {
        remove: jest.fn().mockResolvedValue({
          data: [{ name: 'test-file.pdf' }],
          error: null,
        }),
      };

      mockSupabaseClient.storage.from.mockReturnValue(mockBucket);

      await storageHandler.delete('user-1/test-file.pdf');

      expect(mockBucket.remove).toHaveBeenCalledWith(['user-1/test-file.pdf']);
    });

    it('should handle delete errors', async () => {
      const mockBucket = {
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete failed' },
        }),
      };

      mockSupabaseClient.storage.from.mockReturnValue(mockBucket);

      await expect(
        storageHandler.delete('user-1/test-file.pdf')
      ).rejects.toThrow();
    });
  });
});

