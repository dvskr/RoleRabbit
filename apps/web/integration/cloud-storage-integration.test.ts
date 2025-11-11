/**
 * Integration Tests for Cloud Storage API
 * Tests the complete flow of file operations through the API
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

describe('Cloud Storage Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testFileId: string;
  let testFolderId: string;

  beforeAll(async () => {
    // Register and authenticate a test user
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Storage Test User',
        email: `storage-test-${Date.now()}@example.com`,
        password: 'password123'
      })
    });

    const data = await registerResponse.json();
    authToken = data.token || data.accessToken;
    testUserId = data.user?.id;
  });

  describe('File Upload and Management', () => {
    test('should upload a file successfully', async () => {
      const formData = new FormData();
      const blob = new Blob(['Test file content'], { type: 'application/pdf' });
      formData.append('file', blob, 'test-resume.pdf');
      formData.append('name', 'Test Resume');
      formData.append('type', 'resume');

      const response = await fetch(`${API_BASE_URL}/storage/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.file).toBeDefined();
      expect(data.file.name).toBe('Test Resume');
      expect(data.file.type).toBe('resume');

      testFileId = data.file.id;
    });

    test('should fetch all files', async () => {
      const response = await fetch(`${API_BASE_URL}/storage/files`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.files)).toBe(true);
      expect(data.files.length).toBeGreaterThan(0);

      // Verify pagination metadata
      expect(data.pagination).toBeDefined();
      expect(data.pagination.limit).toBeDefined();
    });

    test('should fetch files with pagination', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files?limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.files.length).toBeLessThanOrEqual(5);
      expect(data.pagination.limit).toBe(5);
    });

    test('should fetch files with selective includes', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files?include=folder`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      const file = data.files[0];

      // Should have folder info
      expect(file.folderName !== undefined).toBe(true);

      // Should NOT have shares/comments (not included)
      expect(file.sharedWith).toBeUndefined();
      expect(file.comments).toBeUndefined();
    });

    test('should update file metadata', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Updated Test Resume',
            description: 'Updated description'
          })
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.file.name).toBe('Updated Test Resume');
    });

    test('should star a file', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isStarred: true
          })
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.file.isStarred).toBe(true);
    });

    test('should download a file', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application');
    });

    test('should soft delete a file', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should fetch deleted files', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files?includeDeleted=true`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      const deletedFiles = data.files.filter((f: any) => f.deletedAt !== null);
      expect(deletedFiles.length).toBeGreaterThan(0);
    });

    test('should restore a deleted file', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Folder Management', () => {
    test('should create a folder', async () => {
      const response = await fetch(`${API_BASE_URL}/storage/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Folder',
          color: '#3B82F6'
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.folder.name).toBe('Test Folder');

      testFolderId = data.folder.id;
    });

    test('should fetch all folders', async () => {
      const response = await fetch(`${API_BASE_URL}/storage/folders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.folders)).toBe(true);
    });

    test('should move file to folder', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/move`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            folderId: testFolderId
          })
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should filter files by folder', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files?folderId=${testFolderId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.files.every((f: any) => f.folderId === testFolderId)).toBe(true);
    });

    test('should rename a folder', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/folders/${testFolderId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Renamed Test Folder'
          })
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.folder.name).toBe('Renamed Test Folder');
    });

    test('should delete a folder', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/folders/${testFolderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('File Sharing', () => {
    test('should share a file with another user', async () => {
      // Create another test user to share with
      const otherUserResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Share Recipient',
          email: `share-recipient-${Date.now()}@example.com`,
          password: 'password123'
        })
      });

      const otherUser = await otherUserResponse.json();

      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/share`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sharedWith: otherUser.user.id,
            permission: 'view'
          })
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.share).toBeDefined();
    });
  });

  describe('Comments', () => {
    test('should add a comment to a file', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: 'This is a test comment'
          })
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.comment.content).toBe('This is a test comment');
    });

    test('should fetch file comments', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.comments)).toBe(true);
      expect(data.comments.length).toBeGreaterThan(0);
    });
  });

  describe('Storage Quota', () => {
    test('should fetch storage quota information', async () => {
      const response = await fetch(`${API_BASE_URL}/storage/quota`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.storage).toBeDefined();
      expect(data.storage.usedBytes).toBeDefined();
      expect(data.storage.limitBytes).toBeDefined();
      expect(data.storage.percentage).toBeDefined();
    });
  });

  describe('Search and Filter', () => {
    test('should search files by name', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files?search=test`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.files.length).toBeGreaterThan(0);
    });

    test('should filter files by type', async () => {
      const response = await fetch(
        `${API_BASE_URL}/storage/files?type=resume`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.files.every((f: any) => f.type === 'resume')).toBe(true);
    });
  });

  afterAll(async () => {
    // Cleanup: permanently delete test file
    if (testFileId) {
      await fetch(
        `${API_BASE_URL}/storage/files/${testFileId}/permanent`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
    }
  });
});
