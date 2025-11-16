/**
 * Jest Configuration for Unit Tests (Sections 5.1 & 5.2)
 */

module.exports = {
  displayName: 'unit',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/apps/web/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/apps/web/src/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/integration/',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.unit.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@/components/(.*)$': '<rootDir>/apps/web/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/apps/web/src/lib/$1',
    '^@/database/(.*)$': '<rootDir>/apps/web/src/database/$1',
    '^@/hooks/(.*)$': '<rootDir>/apps/web/src/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/apps/web/src/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  collectCoverageFrom: [
    'apps/web/src/**/*.{ts,tsx}',
    '!apps/web/src/**/*.d.ts',
    '!apps/web/src/**/*.stories.tsx',
    '!apps/web/src/pages/_app.tsx',
    '!apps/web/src/pages/_document.tsx',
    '!apps/web/src/pages/api/**/*',
  ],
};
