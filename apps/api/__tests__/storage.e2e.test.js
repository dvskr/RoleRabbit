/**
 * End-to-End Tests for Storage API
 * Tests critical file operations from upload to delete
 */

const path = require('path');
const fs = require('fs').promises;

// Mock environment for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/rolerabbit_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.SENTRY_ENABLED = 'false';
process.env.REDIS_ENABLED = 'false';
process.env.IMAGE_OPTIMIZATION_ENABLED = 'false'; // Disable for faster tests

const fastify = require('fastify');
const { prisma } = require('../utils/db');
const jwt = require('jsonwebtoken');

// Test data
let app;
let testUser;
let authToken;
let testFile;
let testFolder;

describe('Storage API E2E Tests', () => {
  // Setup: Create test user and initialize app
  beforeAll(async () => {
    // Initialize Fastify app (simplified for testing)
    app = fastify({
      logger: false
    });

    // Register essential plugins
    await app.register(require('@fastify/jwt'), {
      secret: process.env.JWT_SECRET
    });
    await app.register(require('@fastify/multipart'));
    await app.register(require('@fastify/cookie'));

    // Register storage routes
    await app.register(require('../routes/storage.routes'), { prefix: '/api/storage' });

    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'hashed-password',
        emailVerified: true
      }
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test storage quota
    await prisma.storageQuota.create({
      data: {
        userId: testUser.id,
        usedBytes: 0,
        limitBytes: 1073741824 // 1GB
      }
    });
  });

  // Cleanup: Delete test data
  afterAll(async () => {
    // Delete test files
    if (testFile) {
      await prisma.storageFile.deleteMany({
        where: { userId: testUser.id }
      });
    }

    // Delete test folders
    if (testFolder) {
      await prisma.storageFolder.deleteMany({
        where: { userId: testUser.id }
      });
    }

    // Delete test user
    await prisma.storageQuota.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    // Close app and database
    await app.close();
    await prisma.$disconnect();
  });

  describe('File Upload', () => {
    test('should upload a file successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/upload',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          file: Buffer.from('test file content'),
          displayName: 'Test File',
          type: 'document',
          fileName: 'test.txt',
          contentType: 'text/plain'
        }
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.file).toHaveProperty('id');
      expect(body.file.name).toBe('Test File');
      expect(body.file.type).toBe('document');

      testFile = body.file;
    });

    test('should reject file upload without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/upload',
        payload: {
          file: Buffer.from('test content'),
          displayName: 'Test',
          type: 'document'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject file exceeding size limit', async () => {
      // Create 11MB buffer (exceeds 10MB limit)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/upload',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          file: largeBuffer,
          displayName: 'Large File',
          type: 'document',
          fileName: 'large.txt',
          contentType: 'text/plain'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('File List', () => {
    test('should list user files', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/files',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.files)).toBe(true);
      expect(body.files.length).toBeGreaterThan(0);
      expect(body).toHaveProperty('pagination');
    });

    test('should support pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/files?page=1&limit=10',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    test('should filter files by type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/files?type=document',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.files.forEach(file => {
        expect(file.type).toBe('document');
      });
    });
  });

  describe('File Download', () => {
    test('should download file successfully', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/storage/files/${testFile.id}/download`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
    });

    test('should return 404 for non-existent file', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/files/non-existent-id/download',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('File Update', () => {
    test('should update file metadata', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/storage/files/${testFile.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          name: 'Updated Test File',
          isStarred: true
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.file.name).toBe('Updated Test File');
      expect(body.file.isStarred).toBe(true);
    });
  });

  describe('File Delete and Restore', () => {
    test('should soft delete file', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/storage/files/${testFile.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('recycle bin');
    });

    test('should restore deleted file', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/storage/files/${testFile.id}/restore`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.file.deletedAt).toBeNull();
    });

    test('should show deleted files when includeDeleted=true', async () => {
      // Delete file again
      await app.inject({
        method: 'DELETE',
        url: `/api/storage/files/${testFile.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      // List with includeDeleted
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/files?includeDeleted=true',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.files.some(f => f.deletedAt !== null)).toBe(true);

      // Restore for other tests
      await app.inject({
        method: 'POST',
        url: `/api/storage/files/${testFile.id}/restore`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });
    });
  });

  describe('Folder Operations', () => {
    test('should create folder', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/folders',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          name: 'Test Folder',
          color: '#FF5733'
        }
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.folder.name).toBe('Test Folder');
      expect(body.folder.color).toBe('#FF5733');

      testFolder = body.folder;
    });

    test('should list folders', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/folders',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.folders)).toBe(true);
      expect(body.folders.length).toBeGreaterThan(0);
    });

    test('should update folder', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/storage/folders/${testFolder.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          name: 'Updated Folder Name'
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.folder.name).toBe('Updated Folder Name');
    });

    test('should move file to folder', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/storage/files/${testFile.id}/move`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          folderId: testFolder.id
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.file.folderId).toBe(testFolder.id);
    });

    test('should delete folder', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/storage/folders/${testFolder.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Batch Operations', () => {
    let file1, file2, file3;

    beforeAll(async () => {
      // Create test files for batch operations
      const files = await Promise.all([
        createTestFile('Batch File 1'),
        createTestFile('Batch File 2'),
        createTestFile('Batch File 3')
      ]);
      [file1, file2, file3] = files;
    });

    async function createTestFile(name) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/upload',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          file: Buffer.from(`content for ${name}`),
          displayName: name,
          type: 'document',
          fileName: `${name}.txt`,
          contentType: 'text/plain'
        }
      });
      return JSON.parse(response.body).file;
    }

    test('should batch delete files', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/batch/delete',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          fileIds: [file1.id, file2.id]
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.deletedCount).toBe(2);
    });

    test('should batch restore files', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/batch/restore',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          fileIds: [file1.id, file2.id]
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.restoredCount).toBe(2);
    });

    test('should batch move files', async () => {
      // Create folder for moving
      const folderResponse = await app.inject({
        method: 'POST',
        url: '/api/storage/folders',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          name: 'Batch Move Folder'
        }
      });
      const folder = JSON.parse(folderResponse.body).folder;

      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/batch/move',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          fileIds: [file1.id, file2.id, file3.id],
          targetFolderId: folder.id
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.movedCount).toBe(3);
    });
  });

  describe('Storage Analytics', () => {
    test('should get storage analytics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/storage/analytics',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalFiles');
      expect(body).toHaveProperty('totalSize');
      expect(body).toHaveProperty('filesByType');
      expect(typeof body.totalFiles).toBe('number');
    });
  });

  describe('Security', () => {
    test('should prevent unauthorized access to files', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          name: 'Other User',
          email: `other-${Date.now()}@example.com`,
          password: 'hashed-password',
          emailVerified: true
        }
      });

      const otherToken = jwt.sign(
        { userId: otherUser.id, email: otherUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Try to access first user's file
      const response = await app.inject({
        method: 'GET',
        url: `/api/storage/files/${testFile.id}/download`,
        headers: {
          authorization: `Bearer ${otherToken}`
        }
      });

      expect(response.statusCode).toBe(403);

      // Cleanup
      await prisma.user.delete({
        where: { id: otherUser.id }
      });
    });

    test('should reject invalid file types', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/storage/files/upload',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          file: Buffer.from('executable content'),
          displayName: 'Malicious File',
          type: 'document',
          fileName: 'malware.exe',
          contentType: 'application/x-msdownload'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
