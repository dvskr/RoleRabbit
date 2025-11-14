module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**'
  ],
  verbose: true
};
