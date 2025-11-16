/**
 * TEST-038 to TEST-043: Load and performance tests
 */

const request = require('supertest');
const { createServer } = require('../../server');
const { createLoadTestData } = require('../fixtures/fileFixtures');

describe('Storage Load Tests', () => {
  let app;
  let authTokens = [];

  beforeAll(async () => {
    app = await createServer();
    // Setup load test data
    const { users } = await createLoadTestData();
    authTokens = users.map(() => 'mock-token');
  });

  describe('TEST-038: Load test for file upload endpoint (100 concurrent uploads)', () => {
    it('should handle 100 concurrent uploads', async () => {
      const uploadPromises = [];
      const fileContent = Buffer.from('test content');

      for (let i = 0; i < 100; i++) {
        uploadPromises.push(
          request(app)
            .post('/api/storage/files/upload')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
            .attach('file', fileContent, `test-${i}.pdf`)
            .field('displayName', `Test File ${i}`)
        );
      }

      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200);
      
      expect(successful.length).toBeGreaterThan(90); // At least 90% success rate
    }, 60000); // 60 second timeout
  });

  describe('TEST-039: Load test for file list endpoint (1000+ files)', () => {
    it('should list 1000+ files efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/storage/files')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .query({ page: 1, pageSize: 1000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.files).toBeDefined();
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  describe('TEST-040: Load test for file download endpoint (100 concurrent downloads)', () => {
    it('should handle 100 concurrent downloads', async () => {
      // First, create test files
      const fileIds = [];
      for (let i = 0; i < 100; i++) {
        // Create file and get ID
        fileIds.push(`file-${i}`);
      }

      const downloadPromises = fileIds.map(fileId =>
        request(app)
          .get(`/api/storage/files/${fileId}/download`)
          .set('Authorization', `Bearer ${authTokens[0]}`)
      );

      const results = await Promise.allSettled(downloadPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200);
      
      expect(successful.length).toBeGreaterThan(90);
    }, 60000);
  });

  describe('TEST-041: Performance test for file search (large dataset)', () => {
    it('should search efficiently in large dataset', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/storage/files')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .query({ search: 'test', page: 1, pageSize: 20 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('TEST-042: Performance test for storage quota calculation (large dataset)', () => {
    it('should calculate quota efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/storage/quota')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });
  });

  describe('TEST-043: Stress test for storage service (Supabase) under high load', () => {
    it('should handle high load gracefully', async () => {
      const operations = [];
      
      // Mix of operations
      for (let i = 0; i < 50; i++) {
        operations.push(
          request(app)
            .get('/api/storage/files')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
        );
      }

      for (let i = 0; i < 50; i++) {
        const fileContent = Buffer.from('test content');
        operations.push(
          request(app)
            .post('/api/storage/files/upload')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
            .attach('file', fileContent, `test-${i}.pdf`)
        );
      }

      const results = await Promise.allSettled(operations);
      const errorRate = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status >= 500)).length / results.length;
      
      expect(errorRate).toBeLessThan(0.1); // Less than 10% error rate
    }, 120000); // 2 minute timeout
  });
});

