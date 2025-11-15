/**
 * Jest Configuration for Integration Tests (Section 5.3)
 */

module.exports = {
  displayName: 'integration',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/test/integration/**/*.test.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.integration.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@/components/(.*)$': '<rootDir>/apps/web/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/apps/web/src/lib/$1',
    '^@/database/(.*)$': '<rootDir>/apps/web/src/database/$1',
    '^@/hooks/(.*)$': '<rootDir>/apps/web/src/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/apps/web/src/utils/$1',
  },
  transform: {
    '^.+\\.ts$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
      },
    }],
  },
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 1, // Run integration tests serially
};
