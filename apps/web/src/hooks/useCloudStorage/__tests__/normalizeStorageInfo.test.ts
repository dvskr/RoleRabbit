import { normalizeStorageInfo, EMPTY_STORAGE_INFO, BYTES_IN_GB } from '../../useCloudStorage';

describe('normalizeStorageInfo', () => {
  it('returns empty info when storage is undefined', () => {
    expect(normalizeStorageInfo(undefined)).toEqual(EMPTY_STORAGE_INFO);
  });

  it('converts byte values to gigabytes and percentage', () => {
    const result = normalizeStorageInfo({ usedBytes: 512 * 1024 * 1024, limitBytes: BYTES_IN_GB });
    expect(result.used).toBeCloseTo(0.5, 2);
    expect(result.limit).toBeCloseTo(1, 2);
    expect(result.percentage).toBeCloseTo(50, 1);
    expect(result.usedBytes).toBe(512 * 1024 * 1024);
    expect(result.limitBytes).toBe(BYTES_IN_GB);
  });

  it('falls back gracefully when values missing or not numeric', () => {
    const result = normalizeStorageInfo({ usedGB: 2, limitGB: 4 });
    expect(result.used).toBe(2);
    expect(result.limit).toBe(4);
    expect(result.percentage).toBeCloseTo(50, 1);
    expect(result.usedBytes).toBe(2 * BYTES_IN_GB);
    expect(result.limitBytes).toBe(4 * BYTES_IN_GB);
  });

  it('guards against division by zero', () => {
    const result = normalizeStorageInfo({ usedBytes: 100, limitBytes: 0 });
    expect(result.used).toBe(0);
    expect(result.limit).toBe(0);
    expect(result.percentage).toBe(0);
  });
});


