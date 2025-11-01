# Testing Guide

## Overview

Testing strategies and quality assurance for RoleReady.

---

## Testing Strategy

### Unit Tests
- Component tests
- Hook tests
- Utility function tests
- Coverage target: 80%+

### Integration Tests
- API endpoint tests
- Database integration
- Service integration
- E2E workflows

### End-to-End Tests
- User journeys
- Cross-browser testing
- Accessibility testing
- Performance testing

---

## Running Tests

### Frontend Tests

```bash
cd apps/web

# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Backend Tests

```bash
cd apps/api

# Node.js API
npm test

# Python API
cd apps/api-python
pytest

# With coverage
pytest --cov=.
```

### E2E Tests

```bash
cd apps/web

# Playwright
npx playwright test

# Specific test
npx playwright test tests/dashboard.spec.ts
```

---

## Test Coverage

### Current Coverage

- Frontend: Target 80%
- Backend: Target 90%
- E2E: Critical paths

### Coverage Reports

```bash
npm test -- --coverage
# Check coverage/lcov-report/index.html
```

---

## Quality Assurance

### QA Checklist

See: [QA Checklist](./qa-checklist.md)

### Test Scenarios

- User registration
- Login/logout
- Profile management
- Resume creation/edit
- Job tracking
- Cover letter generation
- AI features
- File uploads
- Search/filter

---

## Continuous Integration

### GitHub Actions

- Run tests on PR
- Check coverage
- Lint code
- Build artifacts
- Deploy to staging

---

**Documentation coming soon.**

---

## Next Steps

- [Testing Guide](./testing-guide.md)
- [QA Checklist](./qa-checklist.md)
- [Performance Testing](./performance.md)

