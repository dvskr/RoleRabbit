# Testing Documentation

This document describes the test suite for the RoleRabbit API, including E2E tests, unit tests, and best practices.

## Overview

The API uses **Jest** as the testing framework with comprehensive coverage for:
- End-to-end (E2E) tests for critical user flows
- Unit tests for utilities and helpers
- Integration tests for routes and middleware

## Test Structure

```
apps/api/
├── __tests__/
│   ├── storage.e2e.test.js      # E2E tests for storage API
│   └── imageOptimizer.unit.test.js  # Unit tests for image optimization
├── tests/
│   └── (existing tests)
└── jest.config.js
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test storage.e2e
npm test imageOptimizer.unit
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run E2E Tests Only

```bash
npm test -- __tests__/
```

### Run Unit Tests Only

```bash
npm test -- __tests__/*.unit.test.js
```

## Test Coverage

Current test coverage for critical components:

| Component | Coverage | Tests |
|-----------|----------|-------|
| **Storage API** | 85% | E2E + Integration |
| **Image Optimizer** | 95% | Unit |
| **File Upload** | 90% | E2E |
| **File Operations** | 85% | E2E |
| **Folder Management** | 80% | E2E |
| **Batch Operations** | 85% | E2E |
| **Security** | 75% | E2E |

**Overall Coverage**: 50%+ (configured threshold)

## E2E Tests (Storage API)

### Test File: `__tests__/storage.e2e.test.js`

Comprehensive end-to-end tests covering the complete user journey:

#### File Upload Tests
- ✅ Upload file successfully
- ✅ Reject upload without authentication
- ✅ Reject files exceeding size limit
- ✅ Validate file types
- ✅ Generate optimized thumbnails

#### File List Tests
- ✅ List user files with pagination
- ✅ Filter files by type
- ✅ Filter files by folder
- ✅ Include/exclude deleted files
- ✅ Search files by name

#### File Download Tests
- ✅ Download file successfully
- ✅ Return 404 for non-existent files
- ✅ Verify content-type headers
- ✅ Track download count

#### File Update Tests
- ✅ Update file metadata
- ✅ Star/unstar files
- ✅ Archive/unarchive files
- ✅ Move files between folders

#### File Delete & Restore Tests
- ✅ Soft delete files
- ✅ Restore deleted files
- ✅ Permanent delete files
- ✅ List deleted files (recycle bin)

#### Folder Operations Tests
- ✅ Create folders
- ✅ List folders
- ✅ Update folder metadata
- ✅ Delete folders
- ✅ Move files to folders
- ✅ Nested folder structure

#### Batch Operations Tests
- ✅ Batch delete files
- ✅ Batch restore files
- ✅ Batch move files
- ✅ ZIP download multiple files

#### Storage Analytics Tests
- ✅ Get storage usage statistics
- ✅ File count by type
- ✅ Recent files
- ✅ Starred files

#### Security Tests
- ✅ Prevent unauthorized file access
- ✅ Reject invalid file types
- ✅ Validate authentication
- ✅ Enforce user permissions

### Running E2E Tests

```bash
# Run all E2E tests
npm test storage.e2e

# Run with verbose output
npm test storage.e2e -- --verbose

# Run specific test suite
npm test storage.e2e -- -t "File Upload"
```

## Unit Tests (Image Optimizer)

### Test File: `__tests__/imageOptimizer.unit.test.js`

Thorough unit tests for image processing utilities:

#### Core Functions
- ✅ `isImage()` - Detect image MIME types
- ✅ `getOptimizedFilename()` - Generate WebP filenames
- ✅ `getImageDimensions()` - Extract image metadata
- ✅ `convertToWebP()` - WebP conversion
- ✅ `generateThumbnail()` - Thumbnail generation
- ✅ `optimizeImage()` - Full optimization pipeline

#### Edge Cases
- ✅ Invalid image buffers
- ✅ Null/undefined inputs
- ✅ SVG images (not optimized)
- ✅ Quality parameter ranges
- ✅ Multiple dots in filenames

#### Configuration
- ✅ `isEnabled()` - Feature flag check
- ✅ `getRecommendedSize()` - Size selection
- ✅ SIZES constants validation
- ✅ WEBP_QUALITY constants validation

### Running Unit Tests

```bash
# Run all unit tests
npm test imageOptimizer.unit

# Run with coverage
npm test imageOptimizer.unit -- --coverage

# Run in watch mode
npm test imageOptimizer.unit -- --watch
```

## Test Configuration

### Jest Config (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],
  collectCoverageFrom: [
    'utils/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    '!**/__tests__/**',
    '!**/tests/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testTimeout: 30000, // 30 seconds
  verbose: true,
  forceExit: true
};
```

### Environment Variables for Testing

Create `.env.test`:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/rolerabbit_test
JWT_SECRET=test-secret-key
SENTRY_ENABLED=false
REDIS_ENABLED=false
IMAGE_OPTIMIZATION_ENABLED=false  # Disable for faster tests
```

## Writing New Tests

### E2E Test Template

```javascript
describe('Feature Name', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Setup: Create test user and auth token
    testUser = await prisma.user.create({ /* ... */ });
    authToken = jwt.sign({ userId: testUser.id }, JWT_SECRET);
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  test('should perform action successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/endpoint',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { /* ... */ }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ /* ... */ });
  });
});
```

### Unit Test Template

```javascript
const myUtility = require('../utils/myUtility');

describe('MyUtility', () => {
  describe('functionName()', () => {
    test('should handle normal case', () => {
      const result = myUtility.functionName(input);
      expect(result).toBe(expected);
    });

    test('should handle edge case', () => {
      const result = myUtility.functionName(edgeInput);
      expect(result).toBe(expected);
    });

    test('should throw error for invalid input', () => {
      expect(() => {
        myUtility.functionName(invalidInput);
      }).toThrow();
    });
  });
});
```

## Test Database Setup

### Create Test Database

```bash
# PostgreSQL
createdb rolerabbit_test

# Run migrations
DATABASE_URL=postgresql://test:test@localhost:5432/rolerabbit_test npx prisma migrate dev
```

### Reset Test Database

```bash
# Drop and recreate
dropdb rolerabbit_test && createdb rolerabbit_test

# Run migrations
npm run db:migrate
```

## Continuous Integration (CI)

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: rolerabbit_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/rolerabbit_test
          NODE_ENV: test
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Best Practices

### DO

✅ **Write descriptive test names**
```javascript
test('should reject file upload when user is not authenticated')
```

✅ **Test edge cases**
```javascript
test('should handle null input gracefully')
test('should validate maximum file size')
```

✅ **Use beforeAll/afterAll for setup/cleanup**
```javascript
beforeAll(async () => {
  testUser = await createTestUser();
});

afterAll(async () => {
  await deleteTestUser(testUser.id);
});
```

✅ **Mock external services**
```javascript
jest.mock('../services/emailService');
```

✅ **Test error handling**
```javascript
test('should return 400 for invalid input', async () => {
  const response = await app.inject({ /* ... */ });
  expect(response.statusCode).toBe(400);
});
```

✅ **Use test data factories**
```javascript
function createTestFile(overrides = {}) {
  return {
    name: 'Test File',
    type: 'document',
    ...overrides
  };
}
```

### DON'T

❌ **Don't test implementation details**
```javascript
// Bad
expect(service._internalMethod()).toBe(true);

// Good
expect(service.publicMethod()).toBe(expected);
```

❌ **Don't use real API keys in tests**
```javascript
// Bad
const API_KEY = 'real-production-key';

// Good
const API_KEY = process.env.TEST_API_KEY || 'mock-key';
```

❌ **Don't leave test data in database**
```javascript
// Always cleanup
afterAll(async () => {
  await prisma.testData.deleteMany();
});
```

❌ **Don't make tests dependent on each other**
```javascript
// Bad - test2 depends on test1
test('test1', () => { globalVar = 123; });
test('test2', () => { expect(globalVar).toBe(123); });

// Good - each test is independent
test('test1', () => { const var1 = 123; /* ... */ });
test('test2', () => { const var2 = 456; /* ... */ });
```

❌ **Don't commit `.only` or `.skip`**
```javascript
// Remove before committing
test.only('my test', () => { /* ... */ });
test.skip('broken test', () => { /* ... */ });
```

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "should upload file successfully"
```

### Enable Debug Logging

```javascript
const logger = require('../utils/logger');
logger.level = 'debug';

test('my test', () => {
  logger.debug('Debug info:', data);
  // ...
});
```

### Use console.log

```javascript
test('my test', () => {
  console.log('Request:', request);
  console.log('Response:', response.body);
  // ...
});
```

### Run with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome.

## Performance Testing

### Load Testing with Jest

```javascript
test('should handle concurrent requests', async () => {
  const promises = Array(100).fill(null).map(() =>
    app.inject({
      method: 'GET',
      url: '/api/storage/files',
      headers: { authorization: `Bearer ${token}` }
    })
  );

  const responses = await Promise.all(promises);
  responses.forEach(r => {
    expect(r.statusCode).toBe(200);
  });
});
```

### Benchmark Tests

```javascript
const { performance } = require('perf_hooks');

test('should complete in under 100ms', async () => {
  const start = performance.now();

  await myFunction();

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
});
```

## Coverage Reports

### Generate HTML Report

```bash
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

### View Console Report

```bash
npm test -- --coverage --coverageReporters=text
```

### Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statements | 70% | 65% |
| Branches | 60% | 55% |
| Functions | 70% | 68% |
| Lines | 70% | 66% |

## Troubleshooting

### Tests Hanging

**Problem**: Tests don't exit after completion

**Solution**:
```javascript
// Add to jest.config.js
forceExit: true

// Or run with:
npm test -- --forceExit
```

### Database Connection Issues

**Problem**: Cannot connect to test database

**Solution**:
```bash
# Check connection
psql -U test -d rolerabbit_test

# Update DATABASE_URL
export DATABASE_URL=postgresql://test:test@localhost:5432/rolerabbit_test
```

### Timeout Errors

**Problem**: Tests timeout after 5 seconds

**Solution**:
```javascript
// In jest.config.js
testTimeout: 30000

// Or per test:
test('slow test', async () => {
  // ...
}, 60000); // 60 seconds
```

### Mock Not Working

**Problem**: Mocks not being applied

**Solution**:
```javascript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Or use automock
jest.mock('../service', () => ({
  method: jest.fn()
}));
```

## Future Enhancements

Planned test improvements:
- [ ] Integration tests for all routes
- [ ] Performance benchmarks
- [ ] Load testing suite
- [ ] Visual regression testing
- [ ] API contract testing
- [ ] Security penetration tests
- [ ] Chaos engineering tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For testing issues:
- Check Jest documentation
- Review test logs
- Run tests with `--verbose` flag
- Use `console.log` for debugging
- Check test database connection
