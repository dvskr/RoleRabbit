# Decoupled Theming Guide

## Overview

The decoupled theming system allows components to work with or without React context, enabling use in emails, PDFs, SSR, and standalone environments.

## Problem Solved

**Before:**
- All components required `useTheme()` from React context
- Components couldn't work outside React tree (emails, PDFs)
- Tight coupling to ThemeContext
- Difficult to test in isolation
- No fallback for SSR or standalone usage

**After:**
- Components work with or without context
- CSS variable fallback support
- Default theme always available
- Works in emails and PDFs
- Easy to test
- Full SSR compatibility

## Architecture

```
Component
    ↓
useThemeColors()
    ↓
Fallback Chain:
1. Provided colors (prop) → Use directly
2. React context      → Use if available
3. CSS variables      → Read from :root
4. Default theme      → Always works
```

## Quick Start

### Using the Hook

```tsx
import { useThemeColors } from '@/hooks/useThemeColors';

function MyComponent() {
  // Automatic fallback chain
  const colors = useThemeColors();

  return (
    <div style={{ background: colors.background, color: colors.primaryText }}>
      Hello World
    </div>
  );
}
```

### Using Utility Functions

```tsx
import { getThemeColors } from '@/utils/themeUtils';

// In non-React environment
function generateEmail() {
  const colors = getThemeColors();

  return `
    <div style="background: ${colors.background};">
      Email content
    </div>
  `;
}
```

## Theming Strategies

### 1. React Components (with Context)

**Best for:** Normal React components in the app

```tsx
import { useThemeColors } from '@/hooks/useThemeColors';

function TemplateCard() {
  const colors = useThemeColors();

  return (
    <div style={{
      background: colors.cardBackground,
      border: `1px solid ${colors.border}`,
    }}>
      {/* Content */}
    </div>
  );
}
```

**Benefits:**
- Respects user theme selection (light/dark)
- Automatic updates when theme changes
- No prop drilling needed

### 2. Standalone Components (no Context)

**Best for:** Components used outside React tree

```tsx
import { getThemeColors } from '@/utils/themeUtils';

function StandaloneCard() {
  const colors = getThemeColors(); // Uses CSS vars or default

  return (
    <div style={{ background: colors.cardBackground }}>
      Works anywhere!
    </div>
  );
}
```

**Benefits:**
- No context required
- Works in any environment
- Predictable behavior

### 3. Email Templates

**Best for:** Generating HTML emails

```tsx
import { generateEmailCSS, getThemeColors } from '@/utils/themeUtils';

function generateWelcomeEmail(userName: string): string {
  const colors = getThemeColors();
  const css = generateEmailCSS(colors);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        <div class="card">
          <h1 class="text-primary">Welcome, ${userName}!</h1>
          <p class="text-secondary">Thanks for joining us.</p>
          <a href="#" class="btn-primary">Get Started</a>
        </div>
      </body>
    </html>
  `;
}
```

**Features:**
- Inline styles work in all email clients
- Pre-generated CSS classes
- Consistent branding

### 4. PDF Generation

**Best for:** Creating PDF documents

```tsx
import { generateInlineStyles, getThemeColors } from '@/utils/themeUtils';

function generateResumePDF(data: ResumeData): string {
  const colors = getThemeColors();
  const styles = generateInlineStyles(colors);

  return `
    <div style="${Object.entries(styles.card).map(([k, v]) => `${k}: ${v}`).join('; ')}">
      <h1 style="${Object.entries(styles.primaryText).map(([k, v]) => `${k}: ${v}`).join('; ')}">
        ${data.name}
      </h1>
    </div>
  `;
}
```

**Benefits:**
- Works with PDF libraries (puppeteer, jsPDF)
- Inline styles ensure rendering
- No external CSS dependencies

### 5. Server-Side Rendering

**Best for:** Next.js server components

```tsx
import { getThemeColors } from '@/utils/themeUtils';

// Server Component (no 'use client')
export default function ServerRenderedPage() {
  const colors = getThemeColors(); // Uses default theme on server

  return (
    <div style={{ background: colors.background }}>
      Server-rendered content
    </div>
  );
}
```

**Benefits:**
- Works during SSR
- No hydration mismatches
- Fast initial render

## API Reference

### Hooks

#### `useThemeColors(providedColors?)`

Get theme colors with automatic fallback.

```tsx
const colors = useThemeColors();
// Returns: ThemeColors (never null)

// With custom colors
const colors = useThemeColors(customColors);
```

**Fallback order:**
1. providedColors parameter
2. React ThemeContext
3. CSS variables
4. DEFAULT_THEME_COLORS

#### `useThemeColorsOptional()`

Get theme colors from context only (no fallback).

```tsx
const colors = useThemeColorsOptional();
// Returns: ThemeColors | null
```

**Use when:**
- You want to detect if context exists
- You need conditional rendering based on context availability

#### `useHasThemeContext()`

Check if ThemeContext is available.

```tsx
const hasContext = useHasThemeContext();
// Returns: boolean

if (hasContext) {
  // Use context-dependent features
}
```

### Utility Functions

#### `getThemeColors(providedColors?)`

Non-hook version for use outside React.

```tsx
const colors = getThemeColors();
// Works in: Node.js, email generation, PDF generation, etc.
```

#### `getColorsFromCSSVariables()`

Read theme from CSS variables.

```tsx
const colors = getColorsFromCSSVariables();
// Returns: ThemeColors | null
```

**Returns null when:**
- Not in browser
- CSS variables not set
- Fewer than 10 variables found

#### `generateInlineStyles(colors)`

Generate inline style objects.

```tsx
const styles = generateInlineStyles(colors);

<div style={styles.card}>
  <span style={styles.primaryText}>Text</span>
  <button style={styles.primaryButton}>Click</button>
</div>
```

**Available styles:**
- `card`, `primaryText`, `secondaryText`
- `primaryButton`
- `successBadge`, `errorBadge`, `warningBadge`, `infoBadge`

#### `generateEmailCSS(colors)`

Generate complete CSS for emails.

```tsx
const css = generateEmailCSS(colors);

<style>{css}</style>
```

**Includes:**
- Reset styles
- Typography
- Cards, buttons, badges
- Links, text colors
- Responsive utilities

#### `themeToCSSVariables(colors)`

Convert ThemeColors to CSS variable declarations.

```tsx
const cssVars = themeToCSSVariables(colors);
// Returns: "--color-background: #fff;\n--color-text: #000;\n..."
```

#### `applyThemeToRoot(colors)`

Apply theme to document root.

```tsx
applyThemeToRoot(colors);
// Sets CSS variables on :root element
```

**Use when:**
- Changing theme dynamically
- Applying custom theme
- Overriding default theme

#### `isBrowser()`

Check if in browser environment.

```tsx
if (isBrowser()) {
  // Browser-only code
  const colors = getColorsFromCSSVariables();
}
```

## Migration Guide

### From ThemeContext to Decoupled Theme

#### Before (Tight Coupling):

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme(); // Requires context
  const colors = theme.colors;

  return <div style={{ background: colors.background }}>...</div>;
}
```

#### After (Decoupled):

```tsx
import { useThemeColors } from '@/hooks/useThemeColors';

function MyComponent() {
  const colors = useThemeColors(); // Works with or without context

  return <div style={{ background: colors.background }}>...</div>;
}
```

### From Prop Drilling to Hook

#### Before (Props):

```tsx
<TemplateCard colors={colors} />
<TemplateHeader colors={colors} />
<TemplateStats colors={colors} />
```

#### After (Hook):

```tsx
<TemplateCard />
<TemplateHeader />
<TemplateStats />

// Each component:
function TemplateCard() {
  const colors = useThemeColors();
  // ...
}
```

**Benefits:**
- No prop drilling
- Cleaner component APIs
- Easier refactoring

### Gradual Migration

You can migrate gradually - both approaches work:

```tsx
// Old components still work
<OldComponent colors={colors} />

// New components use hook
<NewComponent />
```

## Testing

### Mocking Theme in Tests

```tsx
import { getThemeColors } from '@/utils/themeUtils';

jest.mock('@/utils/themeUtils', () => ({
  getThemeColors: jest.fn(() => ({
    background: '#fff',
    primaryText: '#000',
    // ... other colors
  })),
}));

test('renders with theme', () => {
  render(<MyComponent />);
  // Component uses mocked theme
});
```

### Testing Without Context

```tsx
import { render } from '@testing-library/react';

// No ThemeProvider needed
test('works standalone', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Hello')).toBeInTheDocument();
});
```

### Testing With Custom Theme

```tsx
test('respects custom colors', () => {
  const customColors = { ...DEFAULT_THEME_COLORS, background: '#f00' };
  const { container } = render(<MyComponent colors={customColors} />);

  expect(container.firstChild).toHaveStyle({ background: '#f00' });
});
```

## CSS Variables Setup

To enable CSS variable fallback, define these in your global CSS:

```css
:root {
  --color-background: #ffffff;
  --color-card-background: #ffffff;
  --color-hover-background: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-primary-blue: #3b82f6;
  /* ... etc */
}

[data-theme="dark"] {
  --color-background: #1f2937;
  --color-card-background: #374151;
  --color-text-primary: #f9fafb;
  /* ... etc */
}
```

## Performance Considerations

### Caching

The utility functions don't cache by default. For repeated calls:

```tsx
// Inefficient
function MyComponent() {
  const colors1 = getThemeColors(); // Reads CSS vars
  const colors2 = getThemeColors(); // Reads again!

  // ...
}

// Efficient
function MyComponent() {
  const colors = getThemeColors(); // Read once
  // Use colors multiple times

  // ...
}
```

### Hook Usage

The `useThemeColors()` hook is lightweight but still a hook call. For deeply nested trees, consider:

```tsx
// Good - one hook call
function Parent() {
  const colors = useThemeColors();

  return (
    <>
      <Child colors={colors} />
      <Child colors={colors} />
    </>
  );
}

// Also good - each child independent
function Parent() {
  return (
    <>
      <Child /> {/* Uses useThemeColors internally */}
      <Child />
    </>
  );
}
```

## Best Practices

1. **Use hook in React components:**
   ```tsx
   const colors = useThemeColors();
   ```

2. **Use utility in non-React code:**
   ```tsx
   const colors = getThemeColors();
   ```

3. **Cache results when calling repeatedly:**
   ```tsx
   const colors = getThemeColors();
   // Use colors multiple times
   ```

4. **Provide custom colors when needed:**
   ```tsx
   const colors = useThemeColors(printColors);
   ```

5. **Use CSS variables for runtime theme switching:**
   ```tsx
   applyThemeToRoot(newColors);
   ```

6. **Generate email CSS once, reuse:**
   ```tsx
   const emailCSS = generateEmailCSS(colors);
   // Use in multiple emails
   ```

## Examples

### Complete Email Template

```tsx
import { generateEmailCSS, getThemeColors } from '@/utils/themeUtils';

export function generateTemplateEmail(template: Template): string {
  const colors = getThemeColors();
  const css = generateEmailCSS(colors);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>
        <div class="card">
          <h1 class="text-primary">${template.name}</h1>
          <p class="text-secondary">${template.description}</p>
          <div style="margin-top: 16px;">
            <span class="badge-success">Popular</span>
            <span class="badge-info">ATS-Friendly</span>
          </div>
          <a href="${template.url}" class="btn-primary">View Template</a>
        </div>
      </body>
    </html>
  `;
}
```

### Dynamic Theme Switcher

```tsx
import { applyThemeToRoot } from '@/utils/themeUtils';
import { lightTheme, darkTheme } from '@/themes';

function ThemeSwitcher() {
  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? lightTheme : darkTheme;

    applyThemeToRoot(newTheme);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

### Standalone Component Library

```tsx
import { getThemeColors } from '@/utils/themeUtils';

// Works without any React context
export function StandaloneButton({ children }: { children: React.ReactNode }) {
  const colors = getThemeColors();

  return (
    <button
      style={{
        background: colors.primaryBlue,
        color: '#ffffff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.primaryBlueHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.primaryBlue;
      }}
    >
      {children}
    </button>
  );
}
```

## Troubleshooting

### Colors not updating when theme changes

**Problem:** Using `getThemeColors()` doesn't react to context changes.

**Solution:** Use `useThemeColors()` hook in React components:

```tsx
// ❌ Won't update
const colors = getThemeColors();

// ✅ Updates with context
const colors = useThemeColors();
```

### Default theme instead of context theme

**Problem:** Component uses default theme even with ThemeProvider.

**Solution:** Ensure component is inside ThemeProvider tree:

```tsx
<ThemeProvider>
  <MyComponent /> {/* ✅ Has access to context */}
</ThemeProvider>

<MyComponent /> {/* ❌ Outside provider, uses default */}
```

### CSS variables not working

**Problem:** `getColorsFromCSSVariables()` returns null.

**Solution:** Define CSS variables in global CSS:

```css
:root {
  --color-background: #fff;
  /* ... other variables */
}
```

## FAQ

**Q: Should I use the hook or the utility function?**
A: Use `useThemeColors()` in React components. Use `getThemeColors()` in non-React code (emails, PDFs, Node.js).

**Q: Will this break existing code?**
A: No. The old `useTheme()` still works. This provides an alternative approach.

**Q: Do I need to define CSS variables?**
A: No. The default theme works without CSS variables. They're optional for enhanced flexibility.

**Q: Can I use custom colors?**
A: Yes. Pass them to `useThemeColors(customColors)` or `getThemeColors(customColors)`.

**Q: How do I test components?**
A: No special setup needed. Components work without context, making tests simpler.

**Q: What about performance?**
A: The utility functions are lightweight. The hook has negligible overhead.

## Support

For questions or issues:
1. Check this guide
2. Review inline JSDoc comments
3. Check implementation files
4. Consult team lead
