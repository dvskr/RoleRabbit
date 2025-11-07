# Coding Standards

Code style and standards for RoleReady development.

## 📝 General Principles

- **Readability** - Code should be easy to read and understand
- **Consistency** - Follow established patterns
- **Simplicity** - Prefer simple solutions over complex ones
- **Documentation** - Document complex logic and public APIs

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes
- Use enums for constants
- Prefer `const` over `let`, avoid `var`

### Naming Conventions

- **Variables/Functions:** camelCase (`userName`, `getUserData`)
- **Components:** PascalCase (`UserProfile`, `ResumeEditor`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Files:** kebab-case (`user-profile.tsx`, `api-client.ts`)
- **Types/Interfaces:** PascalCase (`UserData`, `ApiResponse`)

### File Organization

```
component-name/
├── index.tsx          # Main component
├── types.ts           # Type definitions
├── utils.ts           # Utility functions
├── hooks.ts           # Custom hooks
└── __tests__/         # Tests
    └── component.test.tsx
```

## 🎯 React/Next.js Standards

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { useState } from 'react';

// 2. Types
interface ComponentProps {
  // props
}

// 3. Component
export default function Component({ prop }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 6. Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Hooks Usage

- Use custom hooks for reusable logic
- Keep hooks at the top of component
- Include dependencies in useEffect arrays
- Clean up subscriptions in useEffect

### Props

- Use TypeScript interfaces for props
- Destructure props in function signature
- Provide default values when appropriate
- Document complex props

## 🗄️ Database Standards

### Prisma Schema

- Use descriptive model names
- Add comments to complex fields
- Use enums for fixed value sets
- Add indexes for frequently queried fields

### Queries

- Use Prisma query builder
- Avoid N+1 queries
- Use transactions for related operations
- Handle errors appropriately

## 🧪 Testing Standards

- Write tests for all new features
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases

## 📚 Documentation

### Code Comments

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data
 */
async function fetchUser(userId: string): Promise<User> {
  // Implementation
}
```

### README Files

- Include purpose and usage
- Provide code examples
- Document dependencies
- Include setup instructions

## 🔍 Code Review Checklist

- [ ] Code follows style guide
- [ ] Types are properly defined
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No console.logs in production code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed

## 🛠️ Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Jest** - Testing framework

## 📖 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated:** [Date]

