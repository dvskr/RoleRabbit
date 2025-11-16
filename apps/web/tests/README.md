# Testing Guide for RoleReady Resume Builder

## Overview

This directory contains comprehensive tests for the RoleReady Resume Builder application, including:

- **Unit Tests**: Test individual validation utilities and functions
- **E2E Tests**: Test complete user flows and interactions

---

## 📁 Test Structure

```
tests/
├── e2e/
│   └── validation.spec.ts    # E2E tests for validation flows
└── README.md                  # This file

src/utils/__tests__/
└── validation.test.ts         # Unit tests for validation utilities
```

---

## 🧪 Running Tests

### **Unit Tests (Jest)**

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm test -- --watch

# Run specific test file
npm test validation.test.ts

# Run with coverage
npm test -- --coverage

# Run tests matching a pattern
npm test -- --testNamePattern="validateEmail"
```

### **E2E Tests (Playwright)**

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test validation.spec.ts

# Run tests in debug mode
npx playwright test --debug

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test by name
npx playwright test -g "should prevent save when required fields are empty"
```

---

## 📊 Test Coverage

### **Unit Tests Coverage**

The unit tests cover:

- ✅ All validation utility functions
- ✅ Email, phone, URL format validation
- ✅ Date parsing and validation
- ✅ Duplicate detection (skills, experience)
- ✅ Custom section name validation
- ✅ Sanitization functions
- ✅ Max length validation
- ✅ Required field validation

**Target Coverage**: 90%+ for validation utilities

### **E2E Tests Coverage**

The E2E tests cover:

- ✅ Required fields validation flow
- ✅ Email/phone/URL format validation
- ✅ Duplicate skills detection
- ✅ Duplicate experience warnings
- ✅ Custom section name validation
- ✅ Character counters and max length
- ✅ Validation summary panel
- ✅ Real-time validation
- ✅ Accessibility (ARIA attributes)
- ✅ Complete save flow

---

## 🎯 Test Scenarios

### **Unit Tests**

#### **1. Email Validation**
```typescript
✓ Should validate correct email formats
✓ Should reject invalid email formats
✓ Should allow empty emails (optional field)
```

#### **2. Phone Validation**
```typescript
✓ Should validate correct phone formats
✓ Should reject invalid phone formats
✓ Should allow empty phones (optional field)
```

#### **3. URL Validation**
```typescript
✓ Should validate correct URL formats
✓ Should reject invalid URL formats
✓ Should normalize URLs (add https://)
```

#### **4. Date Validation**
```typescript
✓ Should parse various date formats
✓ Should validate date ranges
✓ Should warn about future dates
✓ Should handle "Present" keyword
```

#### **5. Duplicate Detection**
```typescript
✓ Should detect duplicate skills (case-insensitive)
✓ Should detect duplicate experience entries
```

#### **6. Custom Section Validation**
```typescript
✓ Should validate section names
✓ Should reject empty names
✓ Should detect duplicate names
✓ Should reject invalid characters
```

### **E2E Tests**

#### **1. Required Fields Flow**
```typescript
✓ Prevent save when required fields are empty
✓ Show validation summary with multiple errors
✓ Allow clicking error to jump to field
```

#### **2. Format Validation Flow**
```typescript
✓ Show error for invalid email format
✓ Accept valid email formats
✓ Clear error when user starts typing
✓ Validate phone formats
✓ Auto-normalize URLs
```

#### **3. Duplicate Detection Flow**
```typescript
✓ Prevent adding duplicate skills
✓ Detect case-insensitive duplicates
✓ Auto-dismiss duplicate error after 3 seconds
✓ Warn about duplicate experience entries
✓ Allow dismissing duplicate warnings
```

#### **4. Custom Section Flow**
```typescript
✓ Validate custom section name on input
✓ Show error for invalid characters
✓ Show character counter
✓ Prevent exceeding max length
```

#### **5. Accessibility Flow**
```typescript
✓ Have proper ARIA attributes on invalid fields
✓ Have aria-required on required fields
✓ Link error messages with aria-describedby
```

---

## 🔧 Test Configuration

### **Jest Configuration** (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### **Playwright Configuration** (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 🐛 Debugging Tests

### **Unit Tests**

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Use VS Code debugger
# Add breakpoint in test file and press F5
```

### **E2E Tests**

```bash
# Run in debug mode (pauses on each step)
npx playwright test --debug

# Run with headed browser
npx playwright test --headed

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip

# Use Playwright Inspector
PWDEBUG=1 npx playwright test
```

---

## 📝 Writing New Tests

### **Unit Test Template**

```typescript
import { yourFunction } from '../yourModule';

describe('YourModule', () => {
  describe('yourFunction', () => {
    it('should do something', () => {
      const result = yourFunction('input');
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(yourFunction('')).toBe('default');
      expect(yourFunction(null)).toBe('default');
    });
  });
});
```

### **E2E Test Template**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform action', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Interact with page
    await page.locator('button').click();
    
    // Assert result
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

## 🚀 CI/CD Integration

### **GitHub Actions Example**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📊 Test Reports

### **Unit Test Coverage Report**

After running `npm test -- --coverage`, open:
```
coverage/lcov-report/index.html
```

### **E2E Test Report**

After running `npx playwright test`, open:
```
playwright-report/index.html
```

---

## 🎯 Best Practices

### **Unit Tests**

1. ✅ Test one thing per test
2. ✅ Use descriptive test names
3. ✅ Follow AAA pattern (Arrange, Act, Assert)
4. ✅ Test edge cases and error conditions
5. ✅ Keep tests independent
6. ✅ Mock external dependencies

### **E2E Tests**

1. ✅ Test user flows, not implementation
2. ✅ Use data-testid for stable selectors
3. ✅ Wait for elements properly
4. ✅ Clean up after tests
5. ✅ Use page object pattern for complex pages
6. ✅ Test critical paths first

---

## 🔍 Troubleshooting

### **Common Issues**

#### **Unit Tests**

**Issue**: Tests fail with "Cannot find module"
```bash
# Solution: Check module paths in jest.config.js
# Ensure moduleNameMapper is configured correctly
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in test
jest.setTimeout(10000);
```

#### **E2E Tests**

**Issue**: Element not found
```bash
# Solution: Add proper waits
await page.waitForSelector('button', { state: 'visible' });
```

**Issue**: Tests flaky
```bash
# Solution: Use proper wait strategies
await expect(page.locator('text')).toBeVisible({ timeout: 5000 });
```

**Issue**: Browser not launching
```bash
# Solution: Reinstall browsers
npx playwright install --with-deps
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🤝 Contributing

When adding new features:

1. Write unit tests for utilities
2. Write E2E tests for user flows
3. Ensure tests pass locally
4. Update this README if needed
5. Submit PR with tests

---

**Last Updated**: November 15, 2025
**Test Coverage**: 90%+ (target)
**Status**: ✅ Complete

