module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'auth.js',
    'server.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testTimeout: 30000, // 30 seconds for E2E tests
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
