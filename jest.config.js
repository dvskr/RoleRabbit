/**
 * Jest Configuration (Section 5: Testing & Quality)
 *
 * Main configuration for running all tests
 */

module.exports = {
  projects: [
    '<rootDir>/jest.config.unit.js',
    '<rootDir>/jest.config.integration.js',
  ],
  collectCoverageFrom: [
    'apps/web/src/**/*.{ts,tsx}',
    '!apps/web/src/**/*.d.ts',
    '!apps/web/src/**/*.stories.tsx',
    '!apps/web/src/pages/_app.tsx',
    '!apps/web/src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
