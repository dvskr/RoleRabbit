/**
 * Jest configuration for accessibility tests
 * Uses jest-axe to test components for WCAG compliance
 */

module.exports = {
  displayName: 'accessibility',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.a11y.test.{ts,tsx}', '**/*.a11y.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.a11y.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    '!src/components/**/*.stories.{ts,tsx}',
    '!src/components/**/*.test.{ts,tsx}',
  ],
};
