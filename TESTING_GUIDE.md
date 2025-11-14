# Testing Guide - RoleRabbit Templates Feature

## Quick Start

### Run All Tests
```bash
# From project root
npm test

# Backend only
cd apps/api && npm test

# Frontend only
cd apps/web && npm test
```

### Run Tests with Coverage
```bash
# Backend with coverage
cd apps/api && npm run test:coverage

# Frontend with coverage
cd apps/web && npm run test:coverage
```

---

## Test Commands

### Backend (API) Tests

```bash
cd apps/api

# Run all tests
npm test

# Run in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only template-related tests
npm run test:templates

# Run only service layer tests
npm run test:services

# Run only API route tests
npm run test:routes

# Run specific test file
npm test -- templateService.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should fetch templates"
```

### Frontend (Web) Tests

```bash
cd apps/web

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only template-related tests
npm run test:templates

# Run only hooks tests
npm run test:hooks

# Run only component tests
npm run test:components

# Run specific test file
npm test -- useTemplates.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should toggle favorite"
```

---

## Test Files Organization

### Backend Tests
```
apps/api/tests/
├── templateService.test.js          # Service layer unit tests (505 lines)
├── templateFavoritesService.test.js # Favorites service tests (435 lines)
├── templatePreferencesService.test.js # Preferences tests (427 lines)
├── templateAnalyticsService.test.js  # Analytics tests (490 lines)
└── templates.routes.test.js          # API routes integration (764 lines)
```

### Frontend Tests
```
apps/web/src/hooks/__tests__/
├── useTemplates.test.ts             # Templates hook tests (567 lines)
├── useTemplateFavorites.test.ts     # Favorites hook tests (635 lines)
└── useTemplatePreferences.test.ts   # Preferences hook tests (700 lines)

apps/web/src/components/__tests__/
└── Templates.test.tsx                # Component tests (818 lines)
```

---

## Test Coverage Goals

### Backend
- **Services:** 80%+ coverage
- **Routes:** 90%+ coverage
- **Current:** Comprehensive test coverage achieved

### Frontend
- **Hooks:** 80%+ coverage
- **Components:** 70%+ coverage
- **Current:** Comprehensive test coverage achieved

---

## Writing New Tests

### Backend Service Test Template

```javascript
const { serviceFunction } = require('../services/yourService');
const { prisma } = require('../utils/db');

jest.mock('../utils/db');

describe('YourService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('serviceFunction', () => {
    it('should perform expected action', async () => {
      // Arrange
      const mockData = { id: '1', name: 'Test' };
      prisma.model.method.mockResolvedValue(mockData);

      // Act
      const result = await serviceFunction('arg');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(prisma.model.method).toHaveBeenCalledWith('arg');
    });

    it('should handle errors', async () => {
      // Arrange
      prisma.model.method.mockRejectedValue(new Error('Test error'));

      // Act
      const result = await serviceFunction('arg');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });
  });
});
```

### Frontend Hook Test Template

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYourHook } from '../useYourHook';
import { apiService } from '../../services/apiService';

jest.mock('../../services/apiService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useYourHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.method.mockResolvedValue({ success: true, data: [] });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useYourHook());

    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch data successfully', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    mockApiService.method.mockResolvedValue({ success: true, data: mockData });

    const { result } = renderHook(() => useYourHook());

    await act(async () => {
      await result.current.fetchData();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

### Component Test Template

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render successfully', () => {
    render(<YourComponent />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const onAction = jest.fn();
    render(<YourComponent onAction={onAction} />);

    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);

    expect(onAction).toHaveBeenCalled();
  });
});
```

---

## Best Practices

### 1. **Arrange-Act-Assert Pattern**
```javascript
it('should do something', async () => {
  // Arrange - Set up test data and mocks
  const mockData = { id: '1', name: 'Test' };
  mockFunction.mockResolvedValue(mockData);

  // Act - Execute the function/action
  const result = await functionUnderTest();

  // Assert - Verify the results
  expect(result).toEqual(expectedValue);
});
```

### 2. **Test Isolation**
- Each test should be independent
- Use `beforeEach` to reset mocks
- Don't rely on test execution order

### 3. **Descriptive Test Names**
- Use "should" statements: `it('should return error when input is invalid')`
- Be specific: `it('should update view mode and save to preferences')`

### 4. **Test Edge Cases**
- Empty states
- Error scenarios
- Boundary conditions
- Invalid inputs

### 5. **Mock External Dependencies**
- Database calls (Prisma)
- API requests
- Browser APIs (localStorage, etc.)
- External libraries

### 6. **Async Testing**
- Use `async/await` for async operations
- Use `waitFor` for waiting on state changes
- Use `act` for React state updates

---

## Debugging Tests

### Run Single Test File
```bash
npm test -- path/to/test-file.test.js
```

### Run Single Test Case
```bash
npm test -- --testNamePattern="specific test name"
```

### Debug Mode (with Node Inspector)
```bash
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test-file.test.js
```

### Show Console Logs
```bash
npm test -- --verbose
```

### Update Snapshots
```bash
npm test -- -u
```

---

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `feature_pro` branches
- Every pull request to `main` or `feature_pro`

### CI Workflow
1. Install dependencies
2. Run linter
3. Run backend tests with coverage
4. Run frontend tests with coverage
5. Upload coverage to Codecov
6. Build frontend
7. Run E2E tests (separate job)

### Local Pre-Push Testing
```bash
# Run all tests before pushing
npm test

# Run with coverage to ensure quality
npm run test:coverage

# Check if coverage meets thresholds
# Backend: 50% minimum (services/routes should be higher)
# Frontend: 50% minimum (hooks/components should be higher)
```

---

## Test Coverage Reports

### Generate Coverage
```bash
# Backend
cd apps/api && npm run test:coverage

# Frontend
cd apps/web && npm run test:coverage
```

### View Coverage Report
```bash
# Backend - Opens in browser
open apps/api/coverage/lcov-report/index.html

# Frontend - Opens in browser
open apps/web/coverage/lcov-report/index.html
```

### Coverage Files
- `coverage/lcov.info` - Machine-readable coverage data
- `coverage/lcov-report/` - HTML coverage report
- `coverage/coverage-summary.json` - JSON summary

---

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Run `npm install` in the correct directory (api or web)

### Issue: "Timeout" errors in async tests
**Solution:** Increase timeout or ensure async operations complete
```javascript
it('should complete', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: Tests pass locally but fail in CI
**Solution:**
- Check for environment-specific code
- Ensure mocks are properly set up
- Check for race conditions in async tests

### Issue: "ReferenceError: window is not defined"
**Solution:** Use proper test environment
```javascript
// In jest.config.js
testEnvironment: 'jsdom', // For browser tests
// or
testEnvironment: 'node',  // For Node.js tests
```

### Issue: Mock not working
**Solution:** Ensure mock is called before import
```javascript
jest.mock('../service');
const service = require('../service'); // Import after mock
```

---

## Performance Testing

### Test Execution Time
```bash
# Show slowest tests
npm test -- --verbose --listTests

# Run tests serially (slower but more stable)
npm test -- --runInBand
```

### Optimize Tests
- Mock expensive operations
- Use `beforeAll` for setup that doesn't change
- Avoid unnecessary `waitFor` delays
- Use `fakeTimers` for debounce/timeout tests

---

## Accessibility Testing

### Using jest-axe (Recommended for future)
```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)

### Internal Docs
- `TESTING_SUMMARY.md` - Complete test suite documentation
- `TEMPLATES_IMPLEMENTATION_SUMMARY.md` - Feature implementation details
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

### Test Statistics
- **Total Test Files:** 9
- **Total Test Lines:** 5,411
- **Backend Coverage:** Comprehensive (services + routes)
- **Frontend Coverage:** Comprehensive (hooks + components)

---

**Last Updated:** November 14, 2025
**Maintained By:** Development Team
**Questions?** Check TESTING_SUMMARY.md or ask in #engineering
