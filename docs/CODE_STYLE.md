# RoleRabbit Code Style Guide

This document provides detailed code style guidelines for the RoleRabbit project.

---

## Table of Contents

1. [TypeScript Guidelines](#typescript-guidelines)
2. [React/Next.js Guidelines](#reactnextjs-guidelines)
3. [CSS/Styling Guidelines](#cssstyling-guidelines)
4. [API Design Guidelines](#api-design-guidelines)
5. [Database Guidelines](#database-guidelines)
6. [Testing Guidelines](#testing-guidelines)
7. [Security Guidelines](#security-guidelines)
8. [Performance Guidelines](#performance-guidelines)

---

## TypeScript Guidelines

### Type Safety

#### Always Use Explicit Types

```typescript
// ✅ Good
function calculateTotal(items: CartItem[], taxRate: number): number {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
}

// ❌ Bad
function calculateTotal(items, taxRate) {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
}
```

#### Avoid `any` Type

```typescript
// ✅ Good
function processApiResponse(data: unknown): Portfolio {
  if (!isPortfolio(data)) {
    throw new ValidationError('Invalid portfolio data');
  }
  return data;
}

// Type guard
function isPortfolio(value: unknown): value is Portfolio {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

// ❌ Bad
function processApiResponse(data: any): Portfolio {
  return data;
}
```

#### Use Union Types for Enums

```typescript
// ✅ Good - More type-safe
type PortfolioStatus = 'draft' | 'published' | 'archived';
type VisibilityLevel = 'public' | 'unlisted' | 'private';

// ✅ Also good - Use enum when you need reverse mapping
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// ❌ Bad - String literals without type
let status = 'published'; // Could be any string
```

#### Use Interfaces for Object Shapes

```typescript
// ✅ Good
interface Portfolio {
  id: string;
  userId: string;
  title: string;
  data: PortfolioData;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioData {
  hero: HeroSection;
  about?: AboutSection;
  experience?: ExperienceSection[];
  projects?: ProjectSection[];
}

// Use type for unions, intersections, utilities
type PortfolioWithOwner = Portfolio & { owner: User };
type PortfolioResponse = Portfolio | { error: string };
```

### Naming Conventions

#### Variables

```typescript
// ✅ Good - camelCase
const userName = 'John Doe';
const portfolioId = 'abc-123';
const totalAmount = 100;

// Boolean variables - prefix with is/has/should/can
const isActive = true;
const hasPermission = false;
const shouldRender = true;
const canEdit = false;

// ❌ Bad
const UserName = 'John'; // PascalCase is for types/classes
const portfolio_id = 'abc'; // snake_case
const active = true; // Not clear it's boolean
```

#### Constants

```typescript
// ✅ Good - UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const API_BASE_URL = 'https://api.rolerabbit.com';
const DEFAULT_PAGE_SIZE = 20;

// Object constants - Use camelCase for keys
const ERROR_MESSAGES = {
  notFound: 'Resource not found',
  unauthorized: 'Authentication required',
  forbidden: 'Permission denied',
} as const;

// ❌ Bad
const maxFileSize = 5000000; // Should be UPPER_CASE
const error_messages = { }; // Keys should be camelCase
```

#### Functions

```typescript
// ✅ Good - camelCase, verb-based names
function createPortfolio(data: PortfolioInput): Portfolio { }
function validateEmail(email: string): boolean { }
function getUserById(id: string): Promise<User> { }

// Event handlers - prefix with 'handle'
function handleSubmit(event: FormEvent): void { }
function handleClick(): void { }

// Async functions - make it clear they're async
async function fetchPortfolio(id: string): Promise<Portfolio> { }

// ❌ Bad
function portfolio(data: any) { } // Not descriptive
function get_user(id: string) { } // snake_case
function submit() { } // Event handler should be handleSubmit
```

### Function Best Practices

#### Keep Functions Small and Focused

```typescript
// ✅ Good - Single responsibility
function validatePortfolioTitle(title: string): boolean {
  return title.length >= 3 && title.length <= 100;
}

function validatePortfolioData(data: PortfolioInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!validatePortfolioTitle(data.title)) {
    errors.title = 'Title must be between 3 and 100 characters';
  }

  if (!data.templateId) {
    errors.templateId = 'Template is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ❌ Bad - Does too much
function createPortfolio(data: any) {
  // Validation
  if (!data.title || data.title.length < 3) {
    throw new Error('Invalid title');
  }

  // Database insert
  const portfolio = db.insert(data);

  // Send email
  sendEmail(data.userId, 'Portfolio created');

  // Log analytics
  analytics.track('portfolio_created');

  return portfolio;
}
```

#### Use Early Returns

```typescript
// ✅ Good
function getPortfolioUrl(portfolio: Portfolio): string | null {
  if (!portfolio.published) {
    return null;
  }

  if (!portfolio.subdomain) {
    return null;
  }

  return `https://${portfolio.subdomain}.rolerabbit.com`;
}

// ❌ Bad - Nested conditions
function getPortfolioUrl(portfolio: Portfolio): string | null {
  if (portfolio.published) {
    if (portfolio.subdomain) {
      return `https://${portfolio.subdomain}.rolerabbit.com`;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
```

#### Use Default Parameters

```typescript
// ✅ Good
function fetchPortfolios(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<Portfolio[]> {
  // ...
}

// ❌ Bad
function fetchPortfolios(userId: string, page?: number, limit?: number) {
  const actualPage = page || 1;
  const actualLimit = limit || 20;
  // ...
}
```

### Async/Await Best Practices

```typescript
// ✅ Good - Use async/await
async function createPortfolio(data: PortfolioInput): Promise<Portfolio> {
  try {
    const validated = await validatePortfolioData(data);
    const portfolio = await saveToDatabase(validated);
    await sendNotification(portfolio.userId, 'Portfolio created');
    return portfolio;
  } catch (error) {
    logger.error('Failed to create portfolio', { error, data });
    throw new AppError('Failed to create portfolio');
  }
}

// ✅ Good - Parallel async operations
async function getPortfolioWithOwner(id: string): Promise<PortfolioWithOwner> {
  const [portfolio, owner] = await Promise.all([
    getPortfolio(id),
    getUser(portfolio.userId),
  ]);

  return { ...portfolio, owner };
}

// ❌ Bad - Promise chains
function createPortfolio(data: any) {
  return validatePortfolioData(data)
    .then((validated) => saveToDatabase(validated))
    .then((portfolio) => sendNotification(portfolio.userId))
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

// ❌ Bad - Sequential when could be parallel
async function getPortfolioWithOwner(id: string) {
  const portfolio = await getPortfolio(id);
  const owner = await getUser(portfolio.userId); // Waits for portfolio first
  return { ...portfolio, owner };
}
```

---

## React/Next.js Guidelines

### Component Structure

```typescript
// ✅ Good - Organized component structure
import React, { useState, useEffect, useCallback } from 'react';
import { Portfolio } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import styles from './PortfolioCard.module.css';

interface Props {
  portfolio: Portfolio;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PortfolioCard({ portfolio, onEdit, onDelete }: Props) {
  // 1. Hooks
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // 2. Derived state
  const isOwner = user?.id === portfolio.userId;
  const canEdit = isOwner && !isDeleting;

  // 3. Event handlers
  const handleEdit = useCallback(() => {
    onEdit?.(portfolio.id);
  }, [portfolio.id, onEdit]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(portfolio.id);
    } finally {
      setIsDeleting(false);
    }
  }, [portfolio.id, onDelete]);

  // 4. Effects
  useEffect(() => {
    // Track view
    analytics.track('portfolio_viewed', { portfolioId: portfolio.id });
  }, [portfolio.id]);

  // 5. Render
  return (
    <div className={styles.card}>
      <h3>{portfolio.title}</h3>
      {canEdit && (
        <div className={styles.actions}>
          <Button onClick={handleEdit}>Edit</Button>
          <Button onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Props Best Practices

```typescript
// ✅ Good - Destructure props, clear interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
    >
      {label}
    </button>
  );
}

// ❌ Bad - Don't destructure, unclear props
export function Button(props: any) {
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
    </button>
  );
}
```

### Hooks Best Practices

```typescript
// ✅ Good - Custom hook
function usePortfolio(id: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPortfolio() {
      try {
        setLoading(true);
        const data = await getPortfolio(id);
        if (!cancelled) {
          setPortfolio(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPortfolio();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { portfolio, loading, error };
}

// Usage
function PortfolioPage({ id }: Props) {
  const { portfolio, loading, error } = usePortfolio(id);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  if (!portfolio) return <NotFound />;

  return <Portfolio data={portfolio} />;
}
```

### Conditional Rendering

```typescript
// ✅ Good - Clear conditional rendering
function Portfolio({ data, isOwner }: Props) {
  return (
    <div>
      <h1>{data.title}</h1>

      {/* Short-circuit for simple conditions */}
      {isOwner && <EditButton />}

      {/* Ternary for if-else */}
      {data.published ? <PublishedBadge /> : <DraftBadge />}

      {/* Early return for complex conditions */}
      {!data.sections.length && (
        <EmptyState message="No sections added yet" />
      )}
    </div>
  );
}

// ❌ Bad - Inline functions, complex logic in JSX
function Portfolio({ data, isOwner }: Props) {
  return (
    <div>
      {isOwner === true && data !== null && data.id ? (
        <button onClick={() => {
          if (confirm('Are you sure?')) {
            deletePortfolio(data.id);
          }
        }}>
          Delete
        </button>
      ) : null}
    </div>
  );
}
```

---

## CSS/Styling Guidelines

### Use CSS Modules

```css
/* ✅ Good - PortfolioCard.module.css */
.card {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
```

```typescript
// PortfolioCard.tsx
import styles from './PortfolioCard.module.css';

export function PortfolioCard({ title }: Props) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.actions}>
        {/* ... */}
      </div>
    </div>
  );
}
```

### CSS Variables for Theming

```css
/* ✅ Good - Use CSS variables */
:root {
  /* Colors */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-border: #e5e7eb;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.button {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Mobile-First Responsive Design

```css
/* ✅ Good - Mobile-first */
.container {
  padding: 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 720px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

/* ❌ Bad - Desktop-first */
.container {
  padding: 2rem;
  max-width: 960px;
}

@media (max-width: 1023px) {
  .container {
    max-width: 720px;
  }
}

@media (max-width: 767px) {
  .container {
    padding: 1rem;
    width: 100%;
  }
}
```

---

## API Design Guidelines

### Consistent Response Format

```typescript
// ✅ Good - Consistent success response
{
  "data": {
    "id": "portfolio-123",
    "title": "My Portfolio",
    "userId": "user-456"
  },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z"
  }
}

// List responses with pagination
{
  "data": [
    { "id": "1", "title": "Portfolio 1" },
    { "id": "2", "title": "Portfolio 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}

// Error response
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required",
    "templateId": "Invalid template ID"
  }
}
```

### HTTP Status Codes

```typescript
// ✅ Good - Use appropriate status codes
// 200 OK - Successful GET, PUT, PATCH
res.status(200).json({ data: portfolio });

// 201 Created - Successful POST
res.status(201).json({ data: newPortfolio });

// 204 No Content - Successful DELETE
res.status(204).end();

// 400 Bad Request - Validation error
res.status(400).json({
  error: 'Validation failed',
  code: 'VALIDATION_ERROR',
  details: errors,
});

// 401 Unauthorized - Not authenticated
res.status(401).json({
  error: 'Authentication required',
  code: 'UNAUTHORIZED',
});

// 403 Forbidden - Not authorized
res.status(403).json({
  error: 'Permission denied',
  code: 'FORBIDDEN',
});

// 404 Not Found - Resource not found
res.status(404).json({
  error: 'Portfolio not found',
  code: 'NOT_FOUND',
});

// 429 Too Many Requests - Rate limit exceeded
res.status(429).json({
  error: 'Too many requests',
  code: 'RATE_LIMIT_EXCEEDED',
  retryAfter: 60,
});

// 500 Internal Server Error - Unexpected error
res.status(500).json({
  error: 'Internal server error',
  code: 'INTERNAL_ERROR',
});
```

---

## Database Guidelines

### Use Prepared Statements

```typescript
// ✅ Good - Parameterized queries (prevents SQL injection)
const { data, error } = await supabase
  .from('portfolios')
  .select('*')
  .eq('user_id', userId)
  .eq('id', portfolioId);

// ❌ Bad - String concatenation (SQL injection risk!)
const query = `SELECT * FROM portfolios WHERE user_id = '${userId}'`;
```

### Handle Errors Properly

```typescript
// ✅ Good
const { data, error } = await supabase
  .from('portfolios')
  .select('*')
  .eq('id', id)
  .single();

if (error) {
  logger.error('Database error', { error, id });
  throw new DatabaseError('Failed to fetch portfolio', error);
}

if (!data) {
  throw new NotFoundError('Portfolio');
}

return data;

// ❌ Bad
const { data } = await supabase.from('portfolios').select('*').eq('id', id);
return data; // Could be null, error ignored
```

---

## Testing Guidelines

### Test File Naming

```
src/lib/validation.ts
src/lib/__tests__/validation.test.ts

src/components/Button.tsx
src/components/__tests__/Button.test.tsx
```

### Descriptive Test Names

```typescript
// ✅ Good - Descriptive test names
describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for emails without @ symbol', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should return false for emails with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });
});

// ❌ Bad - Unclear test names
describe('email validation', () => {
  it('works', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('fails', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

---

## Security Guidelines

### Input Validation

```typescript
// ✅ Good - Validate all inputs
import { z } from 'zod';

const portfolioSchema = z.object({
  title: z.string().min(3).max(100),
  templateId: z.string().uuid(),
  data: z.object({
    hero: z.object({
      headline: z.string().max(200),
    }),
  }),
});

export function validatePortfolioInput(data: unknown): PortfolioInput {
  return portfolioSchema.parse(data);
}

// ❌ Bad - No validation
export function createPortfolio(data: any) {
  return db.insert(data);
}
```

### Sanitize HTML

```typescript
// ✅ Good - Sanitize user-provided HTML
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

// ❌ Bad - Render raw HTML (XSS vulnerability!)
<div dangerouslySetInnerHTML={{ __html: userProvidedHtml }} />
```

---

## Performance Guidelines

### Optimize Database Queries

```typescript
// ✅ Good - Select only needed fields
const { data } = await supabase
  .from('portfolios')
  .select('id, title, created_at')
  .eq('user_id', userId);

// ❌ Bad - Select all fields
const { data } = await supabase
  .from('portfolios')
  .select('*')
  .eq('user_id', userId);
```

### Use React.memo for Expensive Components

```typescript
// ✅ Good - Memoize component
export const PortfolioCard = React.memo(function PortfolioCard({ portfolio }: Props) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});

// ❌ Bad - Re-renders on every parent render
export function PortfolioCard({ portfolio }: Props) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
}
```

---

**For more information, see [CONTRIBUTING.md](../CONTRIBUTING.md)**
