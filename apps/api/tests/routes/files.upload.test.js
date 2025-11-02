const { PassThrough } = require('stream');

jest.mock('../../middleware/auth', () => ({
  authenticate: async (request) => {
    request.user = { userId: 'user-123', email: 'user@example.com' };
  }
}));

jest.mock('../../utils/cloudFiles', () => ({
  getCloudFilesByUserId: jest.fn(),
  getCloudFileById: jest.fn(),
  createCloudFile: jest.fn(),
  updateCloudFile: jest.fn(),
  deleteCloudFile: jest.fn(),
  permanentlyDeleteCloudFile: jest.fn(),
  restoreCloudFile: jest.fn(),
  getCloudFilesByFolder: jest.fn(),
  incrementDownloadCount: jest.fn()
}));

jest.mock('../../utils/storageQuota', () => ({
  ensureWithinQuota: jest.fn(),
  getUserStorageInfo: jest.fn()
}));

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  createReadStream: jest.fn(() => new PassThrough())
}));

const fastifyRoute = require('../../routes/files.routes');
const cloudFiles = require('../../utils/cloudFiles');
const storageQuota = require('../../utils/storageQuota');
const uploadUtils = require('../../utils/uploadUtils');
const fsPromises = require('fs/promises');
const fs = require('fs');

const createReply = () => {
  const reply = {
    statusCode: 200,
    headers: {},
    payload: null,
    status: jest.fn(function (code) {
      this.statusCode = code;
      return this;
    }),
    header: jest.fn(function (key, value) {
      this.headers[key] = value;
      return this;
    }),
    send: jest.fn(function (payload) {
      this.payload = payload;
      return this;
    })
  };
  return reply;
};

const createFileRequest = (overrides = {}) => {
  const buffer = Buffer.from('test file content');
  const fileObject = {
    filename: 'test.pdf',
    mimetype: 'application/pdf',
    fieldname: 'document',
    file: { bytesRead: buffer.length },
    fields: {
      displayName: { value: 'Test Display Name' },
      description: { value: 'Test description' },
      tags: { value: JSON.stringify(['tag1', 'tag2']) },
      folderId: { value: 'folder-1' },
      isPublic: { value: 'true' }
    },
    toBuffer: jest.fn().mockResolvedValue(buffer),
    ...overrides
  };

  return {
    file: jest.fn().mockResolvedValue(fileObject),
    user: { userId: 'user-123', email: 'user@example.com' }
  };
};

describe('files.routes upload & download handlers', () => {
  let uploadHandler;
  let downloadHandler;

  beforeAll(async () => {
    const fastifyMock = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn()
    };

    await fastifyRoute(fastifyMock);

    const uploadCall = fastifyMock.post.mock.calls.find(([path]) => path === '/api/files/upload');
    const downloadCall = fastifyMock.get.mock.calls.find(([path]) => path === '/api/files/:id/download');

    uploadHandler = uploadCall[2];
    downloadHandler = downloadCall[2];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/files/upload', () => {
    it('returns 400 when no file is provided', async () => {
      const request = {
        file: jest.fn().mockResolvedValue(null),
        user: { userId: 'user-123', email: 'user@example.com' }
      };
      const reply = createReply();

      await uploadHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });

    it('returns 400 when metadata validation fails', async () => {
      const validationError = new uploadUtils.UploadValidationError('Invalid metadata');
      const parseSpy = jest.spyOn(uploadUtils, 'parseUploadFields').mockImplementation(() => {
        throw validationError;
      });

      const request = createFileRequest();
      const reply = createReply();

      await uploadHandler(request, reply);

      expect(fsPromises.unlink).toHaveBeenCalled();
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Invalid metadata' });

      parseSpy.mockRestore();
    });

    it('returns 413 when storage quota exceeded', async () => {
      const quotaError = new Error('Storage quota exceeded');
      quotaError.code = 'STORAGE_QUOTA_EXCEEDED';
      quotaError.meta = { attemptedBytes: 123 };
      storageQuota.ensureWithinQuota.mockRejectedValueOnce(quotaError);
      storageQuota.getUserStorageInfo.mockResolvedValueOnce({ usedBytes: 100, limitBytes: 100 });

      const request = createFileRequest();
      const reply = createReply();

      await uploadHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(413);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'Storage quota exceeded',
        code: 'STORAGE_QUOTA_EXCEEDED',
        storage: { usedBytes: 100, limitBytes: 100 },
        meta: { attemptedBytes: 123 }
      });
    });

    it('uploads file, creates record, and returns storage info', async () => {
      storageQuota.ensureWithinQuota.mockResolvedValueOnce(undefined);
      storageQuota.getUserStorageInfo.mockResolvedValueOnce({ usedBytes: 500, limitBytes: 2048, percentage: 24.4 });
      cloudFiles.createCloudFile.mockResolvedValueOnce({
        id: 'file-123',
        name: 'Test Display Name',
        fileName: 'test.pdf'
      });

      const request = createFileRequest();
      const reply = createReply();

      await uploadHandler(request, reply);

      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalled();
      expect(cloudFiles.createCloudFile).toHaveBeenCalledWith('user-123', expect.objectContaining({
        name: 'Test Display Name',
        fileName: 'test.pdf',
        storagePath: expect.any(String)
      }));
      expect(reply.send).toHaveBeenCalledWith({
        success: true,
        file: { id: 'file-123', name: 'Test Display Name', fileName: 'test.pdf' },
        storage: { usedBytes: 500, limitBytes: 2048, percentage: 24.4 }
      });
    });
  });

  describe('GET /api/files/:id/download', () => {
    it('returns 404 when file does not exist', async () => {
      cloudFiles.getCloudFileById.mockResolvedValueOnce(null);
      const request = { params: { id: 'file-1' }, user: { userId: 'user-123' } };
      const reply = createReply();

      await downloadHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({ error: 'File not found' });
    });

    it('returns 403 when user does not own the file', async () => {
      cloudFiles.getCloudFileById.mockResolvedValueOnce({ id: 'file-1', userId: 'another-user' });
      const request = { params: { id: 'file-1' }, user: { userId: 'user-123' } };
      const reply = createReply();

      await downloadHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({ error: 'Forbidden' });
    });

    it('returns 410 when file is missing on disk', async () => {
      fs.existsSync.mockReturnValueOnce(false);
      cloudFiles.getCloudFileById.mockResolvedValueOnce({
        id: 'file-1',
        userId: 'user-123',
        storagePath: 'user-123/file-1.pdf'
      });
      storageQuota.getUserStorageInfo.mockResolvedValueOnce({ usedBytes: 0, limitBytes: 100 });
      const request = { params: { id: 'file-1' }, user: { userId: 'user-123' } };
      const reply = createReply();

      await downloadHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(410);
      expect(reply.send).toHaveBeenCalledWith({ error: 'File is no longer available on the server' });
    });

    it('streams the file and increments download count', async () => {
      fs.existsSync.mockReturnValueOnce(true);
      const stream = new PassThrough();
      jest.spyOn(fs, 'createReadStream').mockReturnValueOnce(stream);

      cloudFiles.getCloudFileById.mockResolvedValueOnce({
        id: 'file-1',
        userId: 'user-123',
        storagePath: 'user/file-1.pdf',
        fileName: 'resume.pdf',
        name: 'Resume',
        contentType: 'application/pdf'
      });

      const request = { params: { id: 'file-1' }, user: { userId: 'user-123' } };
      const reply = createReply();

      await downloadHandler(request, reply);

      expect(cloudFiles.incrementDownloadCount).toHaveBeenCalledWith('file-1');
      expect(reply.header).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(reply.send).toHaveBeenCalledWith(stream);
    });
  });
});


