/**
 * Tests for Data Migration Utility
 */

const dataMigration = require('../../utils/dataMigration');

describe('DataMigration', () => {
  test('should register migrations', () => {
    const testMigration = {
      name: 'test_migration',
      up: async () => {},
      down: async () => {}
    };

    dataMigration.registerMigration(
      testMigration.name,
      testMigration.up,
      testMigration.down
    );

    expect(dataMigration.migrations).toContainEqual(testMigration);
  });

  test('should have migrations array', () => {
    expect(Array.isArray(dataMigration.migrations)).toBe(true);
  });
});

