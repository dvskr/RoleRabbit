# Contributing to RoleRabbit

Thank you for your interest in contributing to RoleRabbit! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Guidelines](#commit-message-guidelines)
8. [Branch Naming Convention](#branch-naming-convention)
9. [Issue Guidelines](#issue-guidelines)
10. [Security Vulnerabilities](#security-vulnerabilities)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18.17 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher (optional for local development)
- Git
- A GitHub account

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RoleRabbit.git
   cd RoleRabbit
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/rolerabbit/RoleRabbit.git
   ```

### Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env.local with your configuration
   ```

3. **Set up database**:
   ```bash
   npm run db:setup
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Verify installation**:
   - Open http://localhost:3000
   - Run tests: `npm test`

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed setup instructions.

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

See [Branch Naming Convention](#branch-naming-convention) for naming guidelines.

### 2. Make Your Changes

- Write clean, maintainable code
- Follow our [code style guidelines](#code-style-guidelines)
- Add tests for new features
- Update documentation as needed

### 3. Run Tests

Before committing, ensure all tests pass:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

**Minimum Coverage Requirements:**
- Overall: 80%
- New code: 90%

### 4. Lint and Format

Run linting and formatting checks:

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### 5. Commit Your Changes

Write meaningful commit messages following our [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add portfolio export to PDF"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Fill in the PR template
4. Link related issues
5. Request review from maintainers

---

## Code Style Guidelines

### TypeScript Conventions

#### Naming Conventions

**Variables and Functions:**
```typescript
// Use camelCase
const userName = 'John Doe';
function calculateTotal() { }

// Boolean variables should be prefixed with is/has/should
const isActive = true;
const hasPermission = false;
const shouldRender = true;
```

**Constants:**
```typescript
// Use UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.rolerabbit.com';
```

**Interfaces and Types:**
```typescript
// Use PascalCase
interface UserProfile {
  id: string;
  name: string;
}

type PortfolioStatus = 'draft' | 'published';
```

**Enums:**
```typescript
// Use PascalCase for enum names, UPPER_CASE for values
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
```

#### Type Annotations

Always use explicit types for function parameters and return values:

```typescript
// ✅ Good
function createPortfolio(userId: string, data: PortfolioData): Promise<Portfolio> {
  // ...
}

// ❌ Bad
function createPortfolio(userId, data) {
  // ...
}
```

#### Avoid `any` Type

Use specific types instead of `any`:

```typescript
// ✅ Good
function processData(data: Record<string, unknown>): void { }
function handleError(error: Error): void { }

// ❌ Bad
function processData(data: any): void { }
function handleError(error: any): void { }
```

#### Use Type Guards

```typescript
function isPortfolio(value: unknown): value is Portfolio {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'userId' in value
  );
}
```

### ESLint Configuration

Our ESLint configuration enforces:

- **No unused variables**: Remove or prefix with underscore
- **No console.log**: Use proper logging (logger.info, logger.error)
- **Explicit return types**: For exported functions
- **No implicit any**: Always specify types
- **Prefer const**: Use `const` over `let` when possible

### Prettier Configuration

Code is automatically formatted using Prettier:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### React/Next.js Conventions

#### Component Structure

```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from './types';
import styles from './Component.module.css';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  // Hooks first
  const [state, setState] = React.useState('');

  // Event handlers
  const handleSubmit = () => {
    // ...
  };

  // Render
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
}
```

#### Use Functional Components

Prefer functional components with hooks over class components:

```typescript
// ✅ Good
export function Portfolio({ id }: Props) {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    fetchPortfolio(id).then(setData);
  }, [id]);

  return <div>{data?.title}</div>;
}

// ❌ Avoid
class Portfolio extends React.Component { }
```

#### Props Destructuring

Always destructure props in function signature:

```typescript
// ✅ Good
export function Button({ label, onClick, disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Bad
export function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### API Route Conventions

```typescript
// apps/web/src/pages/api/portfolios/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { withErrorHandler } from '@/middleware/error-handler';
import { validateSchema } from '@/lib/validation';
import { portfolioSchema } from '@/schemas/portfolio';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Type guard for method
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Validate input
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  // Fetch data
  const portfolio = await getPortfolio(id);

  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  return res.status(200).json(portfolio);
}

// Apply middleware
export default withAuth(withErrorHandler(handler));
```

### Database Conventions

#### Use Supabase Client Properly

```typescript
// ✅ Good - Use service client for server-side operations
import { createSupabaseServiceClient } from '@/database/client';

const supabase = createSupabaseServiceClient();
const { data, error } = await supabase
  .from('portfolios')
  .select('*')
  .eq('id', portfolioId)
  .single();

// ✅ Good - Use user client for client-side operations
import { createSupabaseBrowserClient } from '@/database/client';

const supabase = createSupabaseBrowserClient();
```

#### Handle Errors Properly

```typescript
const { data, error } = await supabase.from('portfolios').select('*');

if (error) {
  logger.error('Failed to fetch portfolios', { error });
  throw new DatabaseError('Failed to fetch portfolios', error);
}

return data;
```

### Error Handling

#### Use Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

#### Consistent Error Response Format

```typescript
// Error response format
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Testing Requirements

### Test Coverage Requirements

All pull requests must maintain or improve test coverage:

- **Overall coverage**: Minimum 80%
- **New code coverage**: Minimum 90%
- **Critical paths**: 100% coverage

### Writing Tests

#### Unit Tests

Test individual functions and components in isolation:

```typescript
// __tests__/lib/validation.test.ts
import { validateEmail, validatePortfolioData } from '@/lib/validation';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should reject emails with dangerous characters', () => {
    expect(validateEmail('user@<script>.com')).toBe(false);
  });
});
```

#### Integration Tests

Test API routes and database interactions:

```typescript
// __tests__/api/portfolios.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/portfolios';

describe('/api/portfolios', () => {
  it('should create portfolio for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'My Portfolio',
        template: 'modern-developer',
      },
    });

    req.user = { id: 'user-123', role: 'user' };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      title: 'My Portfolio',
      userId: 'user-123',
    });
  });
});
```

#### E2E Tests

Test complete user workflows:

```typescript
// __tests__/e2e/portfolio-creation.test.ts
import { test, expect } from '@playwright/test';

test('user can create and publish portfolio', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.goto('/dashboard');
  await page.click('text=Create Portfolio');

  await page.fill('[name="title"]', 'My Portfolio');
  await page.click('text=Modern Developer');
  await page.click('text=Create');

  await expect(page.locator('h1')).toContainText('My Portfolio');
});
```

### Test File Organization

```
apps/web/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   ├── components/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   └── e2e/
│       ├── auth.test.ts
│       ├── portfolio-creation.test.ts
│       └── publishing.test.ts
```

---

## Pull Request Process

### Before Submitting

1. **Update documentation** if you've made API changes
2. **Add tests** for new features
3. **Run full test suite**: `npm test`
4. **Check coverage**: `npm run test:coverage`
5. **Lint and format**: `npm run lint:fix && npm run format`
6. **Update CHANGELOG.md** with your changes

### PR Title Format

Use conventional commits format:

```
<type>(<scope>): <subject>

Examples:
feat(portfolio): add PDF export functionality
fix(auth): resolve session timeout issue
docs(api): update API documentation for v2
refactor(database): optimize portfolio query performance
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Added PDF export functionality
- Updated portfolio schema to include export settings
- Added tests for PDF generation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated Checks**: CI will run tests, linting, and coverage checks
2. **Code Review**: At least one maintainer must approve
3. **Address Feedback**: Make requested changes
4. **Final Approval**: Maintainer will merge once approved

### After Merge

- Delete your feature branch
- Update your local main branch
- Close related issues

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **ci**: CI/CD changes
- **revert**: Revert a previous commit

### Scope (Optional)

The scope should be the name of the affected module:

- `auth`
- `portfolio`
- `template`
- `api`
- `database`
- `ui`

### Examples

```bash
# Feature
feat(portfolio): add drag-and-drop section reordering

# Bug fix
fix(auth): resolve token expiration edge case

# Breaking change
feat(api)!: change portfolio API response format

BREAKING CHANGE: Portfolio API now returns data in v2 format

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(database): optimize portfolio query with indexes
```

---

## Branch Naming Convention

### Format

```
<type>/<short-description>
```

### Types

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### Examples

```bash
feature/portfolio-pdf-export
fix/auth-session-timeout
docs/api-documentation-v2
refactor/optimize-portfolio-queries
test/add-e2e-publishing-tests
chore/update-dependencies
```

### Branch Naming Rules

- Use lowercase letters
- Use hyphens to separate words
- Keep it short but descriptive
- Use present tense

---

## Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** to ensure it's not a usage question
3. **Verify the bug** with the latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Node version: [e.g. 18.17.0]
- Version: [e.g. 1.2.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

---

## Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead, please email security@rolerabbit.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## Pre-commit Hooks

We use Husky and lint-staged for pre-commit hooks.

### Setup

Pre-commit hooks are automatically installed when you run `npm install`.

### What Hooks Do

**pre-commit**:
- Run ESLint on staged files
- Run Prettier on staged files
- Run type checking
- Run affected tests

**commit-msg**:
- Validate commit message format
- Ensure commit follows conventional commits

### Skip Hooks (Not Recommended)

```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "your message"
```

Only skip hooks if absolutely necessary and with good reason.

---

## License

By contributing to RoleRabbit, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

If you have questions about contributing:

- Check our [Development Guide](docs/DEVELOPMENT.md)
- Check our [API Documentation](docs/API.md)
- Ask in GitHub Discussions
- Email: developers@rolerabbit.com

---

**Thank you for contributing to RoleRabbit! 🎉**
