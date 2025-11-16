/**
 * TEST-006: Unit tests for storage quota calculation logic
 */

import { calculateStorageQuota, formatStorageInfo } from '../fileOperations';

describe('Storage Quota Calculation - TEST-006', () => {
  describe('calculateStorageQuota', () => {
    it('should calculate percentage correctly', () => {
      const result = calculateStorageQuota(1024 * 1024 * 1024, 5 * 1024 * 1024 * 1024); // 1GB used, 5GB limit
      expect(result.percentage).toBe(20);
      expect(result.usedGB).toBe(1);
      expect(result.limitGB).toBe(5);
    });

    it('should handle zero usage', () => {
      const result = calculateStorageQuota(0, 5 * 1024 * 1024 * 1024);
      expect(result.percentage).toBe(0);
      expect(result.usedGB).toBe(0);
    });

    it('should handle full quota', () => {
      const result = calculateStorageQuota(5 * 1024 * 1024 * 1024, 5 * 1024 * 1024 * 1024);
      expect(result.percentage).toBe(100);
    });

    it('should handle over quota', () => {
      const result = calculateStorageQuota(6 * 1024 * 1024 * 1024, 5 * 1024 * 1024 * 1024);
      expect(result.percentage).toBeGreaterThan(100);
    });
  });

  describe('formatStorageInfo', () => {
    it('should format storage info correctly', () => {
      const result = formatStorageInfo({
        usedBytes: 1024 * 1024 * 1024,
        limitBytes: 5 * 1024 * 1024 * 1024,
      });
      expect(result.used).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.percentage).toBe(20);
    });

    it('should handle missing data', () => {
      const result = formatStorageInfo({});
      expect(result.used).toBe(0);
      expect(result.limit).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });
});

