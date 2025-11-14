# Accessibility Testing Guide - RoleRabbit

## Overview

This guide covers accessibility (a11y) testing for the RoleRabbit application using jest-axe and manual testing techniques. Accessibility ensures the application is usable by people with disabilities, including those using screen readers, keyboard navigation, and other assistive technologies.

---

## Why Accessibility Matters

✅ **Legal Compliance** - Many jurisdictions require WCAG 2.1 compliance
✅ **Broader Audience** - ~15% of world population has some form of disability
✅ **Better UX** - Accessibility improvements benefit all users
✅ **SEO Benefits** - Better semantic HTML improves search rankings
✅ **Ethical Responsibility** - Technology should be inclusive

---

## WCAG 2.1 Guidelines

### Levels of Conformance

- **Level A** - Minimum level (essential)
- **Level AA** - Target level (most organizations)
- **Level AAA** - Highest level (aspirational)

### Four Principles (POUR)

1. **Perceivable** - Information must be presentable to users
2. **Operable** - UI components must be operable
3. **Understandable** - Information and UI must be understandable
4. **Robust** - Content must work with various technologies

---

## Setup

### 1. Install Dependencies

```bash
cd apps/web
npm install --save-dev jest-axe @axe-core/react
```

### 2. Install Chrome Extensions (Manual Testing)

- **axe DevTools** - https://www.deque.com/axe/devtools/
- **WAVE** - https://wave.webaim.org/extension/
- **Lighthouse** - Built into Chrome DevTools

### 3. Configuration Files

Files created:
- `jest.a11y.config.js` - Jest config for a11y tests
- `jest.a11y.setup.js` - Setup file with jest-axe matchers

---

## Automated Testing with jest-axe

### Run Accessibility Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Run in watch mode
npm run test:a11y -- --watch

# Run with coverage
npm run test:a11y -- --coverage

# Run specific test file
npm test -- Templates.a11y.test.tsx
```

### Writing Accessibility Tests

**Basic Test:**
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Test Specific Rules:**
```typescript
it('should pass color contrast checks', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
    },
  });
  expect(results).toHaveNoViolations();
});
```

**Test Multiple States:**
```typescript
describe('Accessibility', () => {
  it('should be accessible in default state', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should be accessible when disabled', async () => {
    const { container } = render(<Button disabled>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should be accessible when loading', async () => {
    const { container } = render(<Button loading>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Exclude Specific Elements:**
```typescript
it('should be accessible (excluding third-party components)', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container, {
    exclude: [['.third-party-widget']],
  });
  expect(results).toHaveNoViolations();
});
```

---

## Manual Testing Checklist

### Keyboard Navigation

**Test all interactive elements:**
- [ ] `Tab` moves focus forward
- [ ] `Shift+Tab` moves focus backward
- [ ] `Enter` activates buttons/links
- [ ] `Space` toggles checkboxes/buttons
- [ ] `Arrow keys` navigate menus/tabs
- [ ] `Escape` closes modals/dropdowns
- [ ] Focus indicators are visible
- [ ] No keyboard traps

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should be keyboard navigable', async () => {
  const user = userEvent.setup();
  render(<TemplateCard />);

  // Tab to button
  await user.tab();
  expect(screen.getByRole('button', { name: /preview/i })).toHaveFocus();

  // Press Enter
  await user.keyboard('{Enter}');
  expect(mockOnPreview).toHaveBeenCalled();
});
```

### Screen Reader Testing

**Tools:**
- **NVDA** (Windows, free) - https://www.nvaccess.org/
- **JAWS** (Windows, paid) - https://www.freedomscientific.com/
- **VoiceOver** (macOS, built-in) - Cmd+F5 to enable

**Test Checklist:**
- [ ] All images have alt text
- [ ] Headings are properly nested
- [ ] Links have descriptive text
- [ ] Form inputs have labels
- [ ] Error messages are announced
- [ ] Live regions announce updates
- [ ] ARIA labels are descriptive

**Testing with VoiceOver (macOS):**
```bash
# Enable VoiceOver
Cmd + F5

# Navigate
Ctrl + Option + Right Arrow  # Next item
Ctrl + Option + Left Arrow   # Previous item
Ctrl + Option + Cmd + H      # Next heading
Ctrl + Option + U            # Open rotor
```

### Color Contrast

**Minimum Ratios (WCAG AA):**
- Normal text: 4.5:1
- Large text (18pt+ or 14pt+ bold): 3:1
- UI components and graphics: 3:1

**Tools:**
- Chrome DevTools > Elements > Accessibility pane
- https://webaim.org/resources/contrastchecker/
- https://colourcontrast.cc/

**Check in Code:**
```tsx
// ❌ Bad - Low contrast
<button className="bg-gray-400 text-gray-500">Click me</button>

// ✅ Good - Sufficient contrast
<button className="bg-blue-600 text-white">Click me</button>
```

### Form Accessibility

**Checklist:**
- [ ] All inputs have labels
- [ ] Error messages are associated with inputs
- [ ] Required fields are indicated
- [ ] Field purposes use autocomplete attributes
- [ ] Group related fields with fieldset/legend

**Example:**
```tsx
// ✅ Good - Accessible form
<form>
  <label htmlFor="email">
    Email <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error email-hint"
    autoComplete="email"
  />
  <span id="email-hint">We'll never share your email</span>
  {error && (
    <span id="email-error" role="alert" aria-live="polite">
      {error}
    </span>
  )}
</form>
```

---

## Common Accessibility Issues

### 1. Missing Alt Text

```tsx
// ❌ Bad
<img src="/template.png" />

// ✅ Good
<img src="/template.png" alt="Professional resume template" />

// ✅ Good - Decorative image
<img src="/decoration.png" alt="" role="presentation" />
```

### 2. Poor Button Labels

```tsx
// ❌ Bad
<button onClick={handleClick}>
  <IconTrash />
</button>

// ✅ Good
<button onClick={handleClick} aria-label="Delete template">
  <IconTrash />
</button>

// ✅ Good - Visible label
<button onClick={handleClick}>
  <IconTrash /> Delete
</button>
```

### 3. Insufficient Color Contrast

```tsx
// ❌ Bad - 2.5:1 contrast
<p className="text-gray-400">Important information</p>

// ✅ Good - 7:1 contrast
<p className="text-gray-800">Important information</p>
```

### 4. Missing Form Labels

```tsx
// ❌ Bad
<input type="text" placeholder="Search templates" />

// ✅ Good
<label htmlFor="search">Search templates</label>
<input id="search" type="text" placeholder="Search templates" />

// ✅ Good - Visually hidden label
<label htmlFor="search" className="sr-only">Search templates</label>
<input id="search" type="text" placeholder="Search templates" />
```

### 5. Improper Heading Hierarchy

```tsx
// ❌ Bad - Skips h2
<h1>Templates</h1>
<h3>Popular Templates</h3>

// ✅ Good
<h1>Templates</h1>
<h2>Popular Templates</h2>
```

### 6. Non-Semantic HTML

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### 7. Missing Focus Indicators

```css
/* ❌ Bad - Removes focus outline */
button:focus {
  outline: none;
}

/* ✅ Good - Custom focus style */
button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

### 8. Keyboard Traps

```tsx
// ❌ Bad - Can't escape modal with keyboard
<Modal>
  <input onKeyDown={(e) => e.stopPropagation()} />
</Modal>

// ✅ Good - Allow Escape to close
<Modal onClose={handleClose}>
  <input onKeyDown={(e) => {
    if (e.key === 'Escape') handleClose();
  }} />
</Modal>
```

---

## ARIA Attributes

### Common ARIA Attributes

**Roles:**
```tsx
<nav role="navigation">
<main role="main">
<aside role="complementary">
<button role="button">
```

**States:**
```tsx
aria-disabled="true"
aria-expanded="false"
aria-checked="true"
aria-selected="false"
aria-hidden="false"
```

**Properties:**
```tsx
aria-label="Close dialog"
aria-labelledby="dialog-title"
aria-describedby="dialog-description"
aria-required="true"
aria-live="polite"  // or "assertive"
aria-atomic="true"
```

### When to Use ARIA

**Rule:** Use semantic HTML first, ARIA second.

```tsx
// ❌ Bad - Unnecessary ARIA
<div role="button" onClick={handleClick}>Click me</div>

// ✅ Good - Semantic HTML
<button onClick={handleClick}>Click me</button>

// ✅ Good - ARIA when semantic HTML insufficient
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>
```

---

## Testing Templates Component

### Accessibility Tests for Templates

```bash
npm test -- Templates.a11y.test.tsx
```

**Tests included:**
- No violations in empty state
- No violations with templates loaded
- No violations in loading state
- No violations in error state
- Proper heading hierarchy
- Accessible buttons with labels
- Accessible images with alt text
- Accessible form inputs with labels
- Proper ARIA roles

---

## Continuous Integration

### Add to CI Pipeline

```yaml
# .github/workflows/ci.yml
- name: Run accessibility tests
  run: npm run test:a11y
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run test:a11y
```

---

## Resources

### Tools
- **jest-axe** - https://github.com/nickcolley/jest-axe
- **axe DevTools** - https://www.deque.com/axe/devtools/
- **WAVE** - https://wave.webaim.org/
- **Lighthouse** - Chrome DevTools
- **Pa11y** - https://pa11y.org/

### Standards
- **WCAG 2.1** - https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices** - https://www.w3.org/WAI/ARIA/apg/

### Testing
- **Screen Readers** - https://www.nvaccess.org/, https://www.apple.com/accessibility/voiceover/
- **Contrast Checker** - https://webaim.org/resources/contrastchecker/

### Learning
- **WebAIM** - https://webaim.org/
- **A11y Project** - https://www.a11yproject.com/
- **Deque University** - https://dequeuniversity.com/

---

## Best Practices

1. **Test Early and Often** - Don't wait until the end
2. **Use Semantic HTML** - Prefer native elements over ARIA
3. **Test with Real Users** - Automated tests catch ~30-40% of issues
4. **Include Accessibility in Definition of Done** - Make it part of the process
5. **Document Patterns** - Create reusable accessible components
6. **Train the Team** - Everyone should understand basics
7. **Monitor in Production** - Use tools like axe-core in production

---

**Last Updated:** November 14, 2025
**Maintained By:** Development Team
