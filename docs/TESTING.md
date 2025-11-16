# Testing Guide

Comprehensive testing documentation for RoleRabbit (Section 5: Testing & Quality)

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Frontend Unit Tests](#frontend-unit-tests)
- [Backend Unit Tests](#backend-unit-tests)
- [Integration Tests](#integration-tests)
- [Coverage Requirements](#coverage-requirements)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

## Overview

RoleRabbit uses Jest as the primary testing framework with the following test types:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test complete workflows with database and services
- **E2E Tests**: Test complete user journeys (Playwright)

### Coverage Goals

- **Target**: >80% code coverage for all critical code
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Structure

```
RoleRabbit/
├── apps/web/src/
│   ├── lib/
│   │   ├── api/__tests__/           # API client tests
│   │   ├── builder/__tests__/       # Portfolio builder tests
│   │   └── import/__tests__/        # Import/export tests
│   ├── services/__tests__/          # Backend service tests
│   ├── hooks/__tests__/             # React hooks tests
│   ├── utils/__tests__/             # Utility function tests
│   └── components/
│       └── __tests__/               # Component tests
├── test/
│   ├── setup.unit.ts                # Unit test setup
│   ├── setup.integration.ts         # Integration test setup
│   ├── integration/                 # Integration test suites
│   ├── utils/
│   │   └── test-helpers.ts          # Test utilities
│   └── __mocks__/                   # Global mocks
├── jest.config.js                   # Main Jest config
├── jest.config.unit.js              # Unit test config
└── jest.config.integration.js       # Integration test config
```

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

This generates a coverage report in `coverage/` directory.

### Specific Test File

```bash
npm test -- path/to/test-file.test.ts
```

### Specific Test Pattern

```bash
npm test -- --testNamePattern="Portfolio"
```

## Frontend Unit Tests

### API Client Tests

**Location**: `apps/web/src/lib/api/__tests__/client.test.ts`

**Coverage**:
- ✅ Mock fetch calls
- ✅ Test request format
- ✅ Test error handling
- ✅ Test response parsing

**Example**:

```typescript
it('should fetch portfolios successfully', async () => {
  mockFetchResponse({
    portfolios: [{ id: '1', title: 'Test' }],
  });

  const result = await apiClient.getPortfolios();

  expect(result.portfolios).toHaveLength(1);
  expect(global.fetch).toHaveBeenCalledWith('/api/portfolios', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Profile Mapper Tests

**Location**: `apps/web/src/lib/import/__tests__/profile-mapper.test.ts`

**Coverage**:
- ✅ Profile → portfolio mapping logic
- ✅ Edge cases (missing fields, null values)
- ✅ HTML sanitization
- ✅ URL validation

### Portfolio Builder Tests

**Location**: `apps/web/src/lib/builder/__tests__/portfolio-builder.test.ts`

**Coverage**:
- ✅ HTML generation
- ✅ CSS generation
- ✅ ZIP creation
- ✅ XSS prevention

### Custom Hooks Tests

**Location**: `apps/web/src/hooks/__tests__/usePortfolio.test.tsx`

**Coverage**:
- ✅ State management
- ✅ API call triggers
- ✅ Error states
- ✅ Optimistic updates
- ✅ Rollback on failure

### Validation Tests

**Location**: `apps/web/src/utils/__tests__/validation.test.ts`

**Coverage**:
- ✅ `validateEmail()`
- ✅ `validateURL()`
- ✅ `validateSubdomain()`
- ✅ `validatePortfolioData()`
- ✅ `validateSectionData()`

### Data Extraction Tests

**Location**: `apps/web/src/components/chat/__tests__/data-extraction.test.ts`

**Coverage**:
- ✅ Extract emails
- ✅ Extract URLs
- ✅ Extract technologies
- ✅ Extract projects
- ✅ Parse structured data from chat

## Backend Unit Tests

### PortfolioService Tests

**Location**: `apps/web/src/services/__tests__/portfolio.service.test.ts`

**Coverage**:
- ✅ Create with mocked database
- ✅ Update with authorization
- ✅ Delete (soft delete)
- ✅ Duplicate with new subdomain
- ✅ Validation errors

**Example**:

```typescript
it('should create portfolio successfully', async () => {
  const portfolioData = {
    title: 'Test Portfolio',
    templateId: 'template-1',
    userId: 'user-1',
  };

  mockDb.single.mockResolvedValueOnce({
    data: createMockPortfolio(portfolioData),
    error: null,
  });

  const result = await service.create(portfolioData);

  expect(result.title).toBe('Test Portfolio');
  expect(mockDb.insert).toHaveBeenCalled();
});
```

### TemplateService Tests

**Location**: `apps/web/src/services/__tests__/template.service.test.ts`

**Coverage**:
- ✅ Template rendering
- ✅ Validation
- ✅ Template caching
- ✅ Error handling

## Integration Tests

### Test Database Setup

Before running integration tests, ensure test database is configured:

```bash
# Set environment variable
export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/rolerabbit_test"

# Run migrations
npm run db:migrate
```

### Portfolio CRUD Flow Tests

**Location**: `test/integration/portfolio.test.ts`

**Coverage**:
- ✅ Create → Database insert → Retrieve
- ✅ Update → Version created → Retrieve updated
- ✅ Delete → Soft delete → Cascade delete
- ✅ Authorization checks
- ✅ Unique constraints

**Example**:

```typescript
it('should create portfolio and retrieve it', async () => {
  // Create
  const { data: created } = await supabase
    .from('portfolios')
    .insert({ title: 'Test', user_id: userId })
    .select()
    .single();

  expect(created).toBeDefined();

  // Retrieve
  const { data: retrieved } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', created.id)
    .single();

  expect(retrieved).toEqual(created);
});
```

### Analytics Tracking Tests

**Coverage**:
- ✅ Track view → Upsert analytics
- ✅ Aggregate data over date range
- ✅ Unique visitor counting

### Version Control Tests

**Coverage**:
- ✅ Create version
- ✅ Restore from version
- ✅ Version history

### Sharing Tests

**Coverage**:
- ✅ Create share link
- ✅ Retrieve via token
- ✅ Expiration handling

### Rate Limiting Tests

**Location**: `test/integration/rate-limiting.test.ts`

**Coverage**:
- ✅ Allow under limit
- ✅ Reject over limit (429)
- ✅ Reset after window

## Coverage Requirements

### Viewing Coverage

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Excluded from Coverage

- `*.d.ts` - Type definitions
- `*.stories.tsx` - Storybook stories
- `_app.tsx`, `_document.tsx` - Next.js special files

## Writing Tests

### Test Utilities

Use helper functions from `test/utils/test-helpers.ts`:

```typescript
import {
  createMockPortfolio,
  createMockTemplate,
  mockFetchResponse,
  mockFetchError,
} from '@/../test/utils/test-helpers';
```

### Mocking Fetch

```typescript
import { mockFetchResponse } from '@/../test/utils/test-helpers';

it('should fetch data', async () => {
  mockFetchResponse({ data: 'test' });

  const result = await apiClient.getData();

  expect(result.data).toBe('test');
});
```

### Testing Errors

```typescript
it('should handle errors', async () => {
  mockFetchError('Server error', 500);

  await expect(apiClient.getData()).rejects.toThrow();
});
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';

it('should manage state', async () => {
  const { result } = renderHook(() => usePortfolio('id'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});
```

### Database Cleanup

Integration tests automatically clean up after each test via `afterEach` in `test/setup.integration.ts`.

## CI/CD Integration

Tests run automatically in CI pipeline (`.github/workflows/ci.yml`):

### On Every PR and Push

1. **Security Scan**: npm audit, Snyk
2. **Lint & Type Check**: ESLint, TypeScript
3. **Unit Tests**: With coverage
4. **Integration Tests**: With PostgreSQL/Redis services
5. **Build Check**: Ensure build succeeds

### Required for Merge

All tests must pass before PR can be merged to main/develop.

### Test Commands in CI

```yaml
# Unit tests
- run: npm run test:unit -- --coverage

# Integration tests
- run: npm run test:integration
  env:
    DATABASE_URL: postgresql://test:test@localhost:5432/rolerabbit_test
    REDIS_URL: redis://localhost:6379
```

## Troubleshooting

### Tests Hanging

- Check for unclosed async operations
- Ensure all promises are awaited
- Use `--detectOpenHandles` flag

```bash
npm test -- --detectOpenHandles
```

### Database Connection Errors

Ensure test database is running and environment variables are set:

```bash
export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/rolerabbit_test"
export TEST_REDIS_URL="redis://localhost:6379/1"
```

### Mock Issues

Clear all mocks before each test:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Coverage Not Updating

Delete coverage directory and re-run:

```bash
rm -rf coverage/
npm run test:coverage
```

## Best Practices

1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation**
3. **Keep tests isolated** (no dependencies between tests)
4. **Use descriptive test names** (`it('should create portfolio when valid data provided')`)
5. **Follow AAA pattern**: Arrange, Act, Assert
6. **Mock external dependencies** (APIs, databases in unit tests)
7. **Clean up after tests** (restore mocks, clear database)
8. **Test edge cases** (null, undefined, empty arrays, long strings)
9. **Test error scenarios** (network failures, validation errors)
10. **Maintain >80% coverage** (but focus on meaningful tests)

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)

## Support

For testing issues or questions, see:
- [RUNBOOK.md](./RUNBOOK.md) - Operational troubleshooting
- GitHub Issues: Report testing bugs
