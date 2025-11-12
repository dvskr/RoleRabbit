# Testing Implementation Guide

Quick reference for implementing missing tests

## Phase 1: Critical Infrastructure (Week 1)

### 1. Update Coverage Thresholds

**File**: `/apps/api/jest.config.js`
```javascript
// Change from 50 to 80
coverageThreshold: {
  global: {
    branches: 80,      // Up from 50
    functions: 80,     // Up from 50
    lines: 80,         // Up from 50
    statements: 80     // Up from 50
  },
  // Add critical paths
  './utils/**/*.js': {
    branches: 90,
    functions: 90,
    lines: 90
  },
  './routes/**/*.js': {
    branches: 85,
    functions: 85,
    lines: 85
  }
}
```

**File**: `/apps/web/jest.config.js`
```javascript
// Same changes
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/utils/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90
  },
  './src/services/**/*.ts': {
    branches: 85,
    functions: 85,
    lines: 85
  }
}
```

### 2. Create TESTING.md

**File**: `/TESTING.md`
```markdown
# Testing Guidelines

## Test Types

### Unit Tests
- Test individual functions/components in isolation
- Location: `__tests__` folders or `.test.ts` files
- Use mocks for external dependencies

### Integration Tests
- Test multiple components working together
- Location: `src/**/__tests__/*.integration.test.ts`
- Minimize mocks, test real workflows

### E2E Tests
- Test complete user workflows
- Location: `apps/web/e2e/*.spec.ts`
- Run against real browser instances

## Writing Tests

### Good Test Pattern
\`\`\`typescript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });

  it('should handle error cases', () => {
    const invalidInput = createInvalidData();
    
    expect(() => functionUnderTest(invalidInput)).toThrow();
  });
});
\`\`\`

### Running Tests
\`\`\`bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Specific file
npm test auth.test.js -- --testPathPattern="auth"
\`\`\`

## Coverage Requirements
- Global: 80%
- Critical utilities: 90%
- API routes: 85%
- Components: 80%
```

---

## Phase 2: Storage Routes (Weeks 2-3)

**File**: `/apps/api/tests/storage.routes.test.js`

Create with these test categories:

### Test Categories for Storage Routes

```javascript
// 1. File Upload Tests
describe('POST /api/storage/upload', () => {
  it('should upload file successfully');
  it('should validate file type');
  it('should check file size limits');
  it('should scan for viruses');
  it('should reject oversized files');
  it('should enforce quota limits');
  it('should return file metadata');
});

// 2. File Download Tests
describe('GET /api/storage/file/:id', () => {
  it('should download file successfully');
  it('should check access permissions');
  it('should enforce authentication');
  it('should track downloads');
  it('should return 404 for missing files');
  it('should handle deleted files');
});

// 3. File Deletion Tests
describe('DELETE /api/storage/file/:id', () => {
  it('should delete file successfully');
  it('should check ownership');
  it('should cleanup orphaned files');
  it('should free up quota');
  it('should return 403 for unauthorized');
});

// 4. Credential Management Tests
describe('Storage Credentials', () => {
  it('should store credentials securely');
  it('should encrypt sensitive data');
  it('should validate credentials');
  it('should rotate credentials');
});
```

---

## Phase 3: Resume Routes (Weeks 4-5)

**File**: `/apps/api/tests/resume.routes.test.js`

```javascript
describe('Resume Routes', () => {
  describe('POST /api/resumes', () => {
    it('should create resume');
    it('should validate resume data');
    it('should assign unique ID');
    it('should set ownership');
  });

  describe('GET /api/resumes/:id', () => {
    it('should fetch resume');
    it('should check permissions');
    it('should return formatted data');
  });

  describe('PUT /api/resumes/:id', () => {
    it('should update resume');
    it('should validate all fields');
    it('should preserve metadata');
    it('should track changes');
  });

  describe('DELETE /api/resumes/:id', () => {
    it('should delete resume');
    it('should cleanup references');
  });

  describe('POST /api/resumes/:id/export', () => {
    it('should export to PDF');
    it('should export to DOCX');
    it('should apply template styling');
    it('should handle missing data gracefully');
  });

  describe('POST /api/resumes/:id/duplicate', () => {
    it('should duplicate resume');
    it('should generate new name');
    it('should preserve content');
  });
});
```

---

## Phase 4: AI Services (Weeks 6-7)

**File**: `/apps/api/services/ai/__tests__/tailorService.test.js`

```javascript
describe('Tailor Service', () => {
  describe('normalizeResumeData', () => {
    it('should convert objects to arrays');
    it('should preserve nested structures');
    it('should handle edge cases');
    it('should validate output format');
  });

  describe('tailorResume', () => {
    it('should tailor resume to job description');
    it('should maintain formatting');
    it('should highlight relevant skills');
    it('should respect subscription limits');
    it('should track usage');
    it('should handle API failures');
    it('should retry on timeout');
  });

  describe('Rate Limiting', () => {
    it('should enforce per-user limits');
    it('should reset daily');
    it('should handle tier-specific limits');
  });
});
```

**File**: `/apps/api/services/ai/__tests__/generateContentService.test.js`

```javascript
describe('Generate Content Service', () => {
  describe('generateSectionDraft', () => {
    it('should generate content section');
    it('should validate section type');
    it('should apply tone preferences');
    it('should respect length constraints');
  });

  describe('parseGenerateResponse', () => {
    it('should parse AI response');
    it('should validate JSON format');
    it('should extract key sections');
    it('should handle malformed responses');
  });
});
```

---

## Phase 5: Security Tests (Week 8)

**File**: `/apps/api/tests/twoFactorAuth.routes.test.js`

```javascript
describe('Two-Factor Authentication', () => {
  describe('POST /api/auth/2fa/setup', () => {
    it('should generate QR code');
    it('should generate backup codes');
    it('should validate secret key');
  });

  describe('POST /api/auth/2fa/verify', () => {
    it('should verify OTP code');
    it('should validate timing window');
    it('should reject expired codes');
    it('should reject invalid codes');
    it('should lock after 3 failures');
  });

  describe('POST /api/auth/2fa/disable', () => {
    it('should disable 2FA');
    it('should require authentication');
    it('should require valid password');
    it('should invalidate backup codes');
  });
});
```

---

## Quick Test Template

### Component Test Template
```typescript
// /path/to/component/__tests__/Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '../Component';

describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should render', () => {
    render(<Component />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button', { name: /click/i }));
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });

  it('should call prop functions', () => {
    const mockFn = jest.fn();
    render(<Component onClick={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Service Test Template
```javascript
// /path/to/service/__tests__/service.test.js
describe('Service', () => {
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {
      // Setup mocks
    };
  });

  it('should perform operation', async () => {
    const result = await service.operation(input);
    expect(result).toEqual(expected);
  });

  it('should handle errors', async () => {
    mockDb.query.mockRejectedValue(new Error('DB Error'));
    
    await expect(service.operation(input))
      .rejects
      .toThrow('DB Error');
  });
});
```

### Route Test Template
```javascript
// /path/to/__tests__/routes.test.js
const Fastify = require('fastify');

describe('Routes', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();
    await app.register(require('../routes'));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle GET request', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/endpoint'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expected);
  });

  it('should validate input', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/endpoint',
      payload: { invalid: 'data' }
    });

    expect(response.statusCode).toBe(400);
  });
});
```

---

## Critical Files to Create Tests For

### Priority 1 (Start Now)
1. `/apps/api/routes/storage.routes.js` - 2,746 lines
2. `/apps/api/routes/resume.routes.js` - 1,134 lines
3. `/apps/api/services/ai/tailorService.js` - 631 lines

### Priority 2 (Start Next)
4. `/apps/api/routes/twoFactorAuth.routes.js` - 246 lines
5. `/apps/api/services/ai/generateContentService.js` - 159 lines
6. `/apps/api/services/ats/aiSkillExtractor.js` - 365 lines

### Priority 3 (Third)
7. `/apps/api/routes/editorAI.routes.js` - 418 lines
8. `/apps/api/services/resumeParser.js` - 11,271 lines
9. `/apps/api/services/baseResumeService.js` - 7,048 lines

---

## Useful Testing Libraries Already Available

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.x.x",
    "jest-environment-jsdom": "^29.x.x",
    "@playwright/test": "^1.x.x"
  }
}
```

No new dependencies needed - use what's already there!

---

## Checklist for Each Test File

- [ ] Descriptive test suite name
- [ ] Clear beforeEach/afterEach setup/teardown
- [ ] Positive case tests
- [ ] Error case tests
- [ ] Edge case tests
- [ ] Mock external dependencies properly
- [ ] Use meaningful assertion messages
- [ ] No skipped tests (xdescribe, xit)
- [ ] Minimum 80% coverage
- [ ] All tests passing locally before commit

---

## CI/CD Integration

Add to GitHub Actions or your CI system:
```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm run test:coverage
    - run: |
        if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
          echo "Coverage below 80%"
          exit 1
        fi
```

---

## Next Steps

1. **This Week**: Update jest configs and create TESTING.md
2. **Next Week**: Start storage.routes tests
3. **Follow-up**: Track progress in sprint board

Need help with any specific test? Reference the full analysis in `TESTING_COVERAGE_ANALYSIS.md`
