/**
 * Unit tests for dataNormalizer utility
 */

import { normalizeToArray } from '../dataNormalizer';

describe('normalizeToArray', () => {
  describe('Array inputs', () => {
    it('should return the same array if input is already an array', () => {
      const input = [1, 2, 3];
      expect(normalizeToArray(input)).toEqual([1, 2, 3]);
    });

    it('should handle empty arrays', () => {
      expect(normalizeToArray([])).toEqual([]);
    });

    it('should handle arrays with mixed types', () => {
      const input = [1, 'two', { three: 3 }, null, undefined];
      const result = normalizeToArray(input);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe('two');
    });
  });

  describe('Null and undefined inputs', () => {
    it('should return empty array for null', () => {
      expect(normalizeToArray(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect(normalizeToArray(undefined)).toEqual([]);
    });
  });

  describe('String inputs', () => {
    it('should parse valid JSON string arrays', () => {
      const input = '[1, 2, 3]';
      expect(normalizeToArray(input)).toEqual([1, 2, 3]);
    });

    it('should return empty array for invalid JSON string', () => {
      const input = 'not valid json';
      expect(normalizeToArray(input)).toEqual([]);
    });

    it('should handle empty string', () => {
      expect(normalizeToArray('')).toEqual([]);
    });

    it('should parse nested JSON arrays', () => {
      const input = '[[1, 2], [3, 4]]';
      expect(normalizeToArray(input)).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('Set inputs', () => {
    it('should convert Set to array', () => {
      const input = new Set([1, 2, 3]);
      const result = normalizeToArray(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should handle empty Set', () => {
      const input = new Set();
      expect(normalizeToArray(input)).toEqual([]);
    });
  });

  describe('Map inputs', () => {
    it('should convert Map to array of values', () => {
      const input = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result = normalizeToArray(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });
  });

  describe('Object inputs', () => {
    it('should convert object with numeric keys to array', () => {
      const input = { '0': 'first', '1': 'second', '2': 'third' };
      const result = normalizeToArray(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['first', 'second', 'third']);
    });

    it('should sort numeric keys correctly', () => {
      const input = { '2': 'third', '0': 'first', '1': 'second' };
      const result = normalizeToArray(input);
      expect(result).toEqual(['first', 'second', 'third']);
    });

    it('should convert regular object to array of values', () => {
      const input = { a: 1, b: 2, c: 3 };
      const result = normalizeToArray(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should filter out null and undefined values from object', () => {
      const input = { '0': 'first', '1': null, '2': 'third', '3': undefined };
      const result = normalizeToArray(input);
      expect(result).toEqual(['first', 'third']);
    });

    it('should handle object with string keys that look numeric', () => {
      const input = { '0': 'a', '01': 'b', '2': 'c' };
      const result = normalizeToArray(input);
      // '01' is not purely numeric, so it should be treated as regular object
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Type parameter', () => {
    it('should preserve type when specified', () => {
      interface TestType {
        id: number;
        name: string;
      }
      const input: TestType[] = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' }
      ];
      const result = normalizeToArray<TestType>(input);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('test1');
    });
  });

  describe('Edge cases', () => {
    it('should handle number zero', () => {
      expect(normalizeToArray(0)).toEqual([]);
    });

    it('should handle boolean false', () => {
      expect(normalizeToArray(false)).toEqual([]);
    });

    it('should handle boolean true', () => {
      expect(normalizeToArray(true)).toEqual([]);
    });

    it('should handle deeply nested JSON string', () => {
      const input = '{"0": {"nested": [1, 2]}, "1": {"nested": [3, 4]}}';
      const result = normalizeToArray(input);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

