# Testing Guidelines

Testing strategy and guidelines for RoleReady.

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \     E2E Tests (Few)
      /____\
     /      \   Integration Tests (Some)
    /________\
   /          \  Unit Tests (Many)
  /____________\
```

### Test Types

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user flows

## 🎯 Testing Tools

- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking

## 📝 Writing Tests

### Unit Test Example

```typescript
describe('UserService', () => {
  it('should fetch user by id', async () => {
    const user = await fetchUser('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
});
```

### Component Test Example

```typescript
describe('UserProfile', () => {
  it('should render user information', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
test('user can create resume', async ({ page }) => {
  await page.goto('/editor');
  await page.fill('[name="name"]', 'John Doe');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

## ✅ Test Requirements

### Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Critical paths covered
- **E2E Tests:** Main user flows covered

### What to Test

- ✅ Business logic
- ✅ User interactions
- ✅ API integrations
- ✅ Error handling
- ✅ Edge cases

### What Not to Test

- ❌ Third-party library internals
- ❌ Implementation details
- ❌ Trivial getters/setters

## 🚀 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Test Organization

```
__tests__/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   └── components/
└── e2e/
    └── flows/
```

## 🔍 Best Practices

1. **Arrange-Act-Assert** - Structure tests clearly
2. **Descriptive names** - Test names should describe what they test
3. **Isolated tests** - Tests should not depend on each other
4. **Mock external dependencies** - Use mocks for APIs, databases
5. **Test behavior, not implementation** - Focus on what, not how

## 🐛 Debugging Tests

```bash
# Run specific test file
npm run test -- UserService.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should fetch user"

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/docs/intro)

---

**Last Updated:** [Date]

