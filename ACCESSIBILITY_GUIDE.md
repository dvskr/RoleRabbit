# Accessibility Implementation Guide
**Section 1.8: WCAG 2.1 AA Compliance**

This guide documents the accessibility features implemented in the RoleRabbit portfolio builder to ensure WCAG 2.1 AA compliance.

## Table of Contents
1. [Accessibility Utilities](#accessibility-utilities)
2. [Form Accessibility](#form-accessibility)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Modal Dialogs](#modal-dialogs)
5. [Error Handling](#error-handling)
6. [Visual Elements](#visual-elements)
7. [Testing Checklist](#testing-checklist)

---

## Accessibility Utilities

### Location: `apps/web/src/hooks/useA11y.ts`

Provides reusable hooks and utilities:

**1. useFocusTrap(isActive: boolean)**
- Traps focus within a container (for modals)
- Tab/Shift+Tab cycles within the container
- Returns: `containerRef` to attach to the modal element

```tsx
const containerRef = useFocusTrap(isOpen);
return <div ref={containerRef}>{/* modal content */}</div>;
```

**2. useInitialFocus(isOpen: boolean, selector?: string)**
- Sets focus to first focusable element when modal opens
- Returns: `elementRef` to attach to modal container

```tsx
const elementRef = useInitialFocus(isOpen);
return <div ref={elementRef}>{/* modal content */}</div>;
```

**3. useReturnFocus(isOpen: boolean)**
- Returns focus to trigger element when modal closes
- Automatically stores and restores focus

```tsx
useReturnFocus(isOpen);
```

**4. useKeyboardNavigation(items, onSelect, options)**
- Handles arrow key navigation for lists/grids
- Supports Enter/Space to select
- Returns: `{ handleKeyDown, setCurrentIndex, currentIndex }`

```tsx
const { handleKeyDown } = useKeyboardNavigation(templates, (index) => {
  selectTemplate(templates[index]);
});
return <div onKeyDown={handleKeyDown}>{/* items */}</div>;
```

**5. useUniqueId(prefix?: string)**
- Generates unique IDs for aria-describedby and aria-labelledby

```tsx
const errorId = useUniqueId('error');
<input aria-describedby={errorId} />
<div id={errorId} role="alert">{error}</div>
```

---

## Form Accessibility

### Requirements Implemented

✅ **#1: ARIA Labels for Icon-Only Buttons**
- All icon-only buttons have `aria-label`
- Decorative icons have `aria-hidden="true"`

```tsx
<button aria-label="Upload profile picture">
  <Upload aria-hidden="true" />
  Upload Photo
</button>
```

✅ **#2: Form Labels with htmlFor**
- All form inputs have associated `<label>` with `htmlFor`
- Screen reader only labels use `sr-only` class

```tsx
<label htmlFor="setup-full-name">Full Name</label>
<input id="setup-full-name" />
```

✅ **#3: aria-required for Required Fields**
- All required fields have both `required` and `aria-required="true"`

```tsx
<input
  required
  aria-required="true"
  id="setup-full-name"
/>
```

✅ **#4: aria-invalid and aria-describedby**
- Fields with errors have `aria-invalid={true}`
- Error messages linked via `aria-describedby`

```tsx
const errorId = useUniqueId('name-error');
<input
  aria-invalid={!isValid}
  aria-describedby={!isValid ? errorId : undefined}
/>
<ValidationMessage id={errorId} error={error} />
```

### Example: Accessible Form Field

```tsx
const errorId = useUniqueId('email-error');
const isInvalid = !emailValidation.isValid && (touched || attempted);

<label htmlFor="setup-email">
  Email <span className="text-red-600">*</span>
</label>
<input
  id="setup-email"
  type="email"
  required
  aria-required="true"
  aria-invalid={isInvalid}
  aria-describedby={isInvalid ? errorId : undefined}
/>
<ValidationMessage id={errorId} error={emailValidation.error} />
```

---

## Keyboard Navigation

### ✅ #7: Template Selection (Implemented in SetupStep)

Templates support full keyboard navigation:
- **Arrow keys**: Navigate between templates
- **Enter/Space**: Select current template
- **Home/End**: Jump to first/last template
- **Tab**: Move to next focusable element

```tsx
const { handleKeyDown } = useKeyboardNavigation(templates, (index) => {
  setTemplate(templates[index].id);
});

<div role="radiogroup" onKeyDown={handleKeyDown}>
  {templates.map(t => (
    <button
      role="radio"
      aria-checked={selected === t.id}
      tabIndex={selected === t.id ? 0 : -1}
    >
      {t.name}
    </button>
  ))}
</div>
```

### ⏳ #8: Tab Interface (Pending Implementation)

For tab-based interfaces (AIPortfolioBuilder):
- Use `role="tablist"` on container
- Use `role="tab"` on tab buttons
- Use `role="tabpanel"` on content
- Arrow keys navigate tabs
- Tab/Shift+Tab moves to next/previous control

---

## Modal Dialogs

### Requirements #9, #10, #11

**Complete Modal Example:**

```tsx
import { useFocusTrap, useInitialFocus, useReturnFocus } from '@/hooks/useA11y';

function MyModal({ isOpen, onClose }) {
  // Combine all three hooks
  const containerRef = useFocusTrap(isOpen);
  const initialFocusRef = useInitialFocus(isOpen);
  useReturnFocus(isOpen);

  return (
    <div ref={containerRef}>
      <div ref={initialFocusRef}>
        <h2>Modal Title</h2>
        <button onClick={onClose} aria-label="Close modal">
          <X aria-hidden="true" />
        </button>
        {/* modal content */}
      </div>
    </div>
  );
}
```

---

## Error Handling

### ✅ #5: role="alert" for Error Messages

The `ValidationMessage` component automatically includes:
- `role="alert"` for immediate announcement
- `aria-live="polite"` for dynamic updates
- `aria-atomic="true"` to announce full message

```tsx
// apps/web/src/components/validation/ValidationMessage.tsx
<div
  id={id}
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  <AlertCircle aria-hidden="true" />
  <span>{error}</span>
</div>
```

### ✅ #6: role="status" for Success Messages

Toast notifications (Radix UI Toast) automatically set:
- `role="status"` for success messages
- `role="alert"` for error messages
- Proper ARIA attributes for screen reader announcement

---

## Visual Elements

### ✅ #13: Visible Focus Indicators

All interactive elements have visible focus styles:

```css
.focus\:ring-2 {
  focus: outline-none;
  focus: ring-2 ring-purple-500 ring-offset-2;
}
```

**Important:** Never use `outline: none` without a replacement focus indicator!

### ✅ #14 & #17: Alt Text for Images

All images have descriptive alt text:

```tsx
// Profile pictures
<img src={profilePic} alt="Profile picture preview" />

// Decorative icons
<User aria-hidden="true" />

// Template previews
<button aria-label={`${template.name}: ${template.description}`}>
  <div className="preview" aria-hidden="true">{/* visual only */}</div>
</button>
```

### ✅ #18: Skip Links

**Location:** `apps/web/src/components/accessibility/SkipLinks.tsx`

Skip links allow keyboard users to bypass navigation:

```tsx
import { SkipLinks, MainContent } from '@/components/accessibility/SkipLinks';

// At the top of your page/layout
<SkipLinks />

// Wrap main content
<MainContent>
  {/* Your page content */}
</MainContent>
```

Skip links are visually hidden until focused via keyboard.

---

## Testing Checklist

### ✅ #16: Color Contrast

Ensure all text meets WCAG AA requirements:
- **Normal text (< 18pt)**: 4.5:1 contrast ratio
- **Large text (≥ 18pt)**: 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

**Tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### ⏳ #14: Automated Audits (Recommended)

Run automated accessibility tests:

```bash
# Using Lighthouse
npm run lighthouse

# Using axe-core
npm install --save-dev @axe-core/react
```

Add to your app:

```tsx
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### ⏳ #15: Screen Reader Testing (Recommended)

Test with real screen readers:
- **Windows**: NVDA (free) or JAWS
- **Mac**: VoiceOver (built-in, Cmd+F5)
- **Mobile**: TalkBack (Android) or VoiceOver (iOS)

**Test scenarios:**
1. Navigate the entire form using only keyboard
2. Fill out form with screen reader active
3. Trigger and recover from validation errors
4. Select templates using arrow keys
5. Open and close modals

---

## Component-Specific Implementation

### SetupStep.tsx

Fully accessible form with:
- ✅ All required ARIA attributes
- ✅ Keyboard navigation for templates
- ✅ Error announcements
- ✅ Focus indicators
- ✅ Alt text on images
- ✅ Icon-only button labels

### TemplateSelector.tsx

Template grid with:
- ✅ Skeleton loading states
- ✅ Error state with retry
- ✅ Empty states
- ⏳ Keyboard navigation (pending)

### Modals (Pending)

Need to enhance:
- AddLinkModal
- ResumeUploadModal
- TemplatePreviewModal

With:
- Focus trap
- Initial focus
- Return focus
- Escape key to close

---

## Accessibility Best Practices

### DO:
✅ Use semantic HTML (`<button>`, `<label>`, `<main>`, etc.)
✅ Provide text alternatives for non-text content
✅ Ensure all functionality is keyboard accessible
✅ Use ARIA attributes when semantic HTML isn't enough
✅ Test with actual assistive technologies
✅ Maintain logical tab order
✅ Provide visible focus indicators

### DON'T:
❌ Remove focus outlines without replacement
❌ Use `div` or `span` for interactive elements
❌ Rely solely on color to convey information
❌ Use `tabindex` > 0 (breaks natural tab order)
❌ Trap users without a way to escape
❌ Use placeholder as a label replacement
❌ Auto-focus without user action (except modals)

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

---

## Summary

### Completed (11/18 requirements):
✅ #1: ARIA labels for icon-only buttons
✅ #2: Form labels with htmlFor
✅ #3: aria-required on required fields
✅ #4: aria-invalid and aria-describedby
✅ #5: role="alert" on error messages
✅ #6: role="status" on success messages (Radix UI Toast)
✅ #7: Keyboard navigation for templates
✅ #12: Keyboard accessibility for interactive elements
✅ #13: Visible focus indicators
✅ #17: Alt text for images
✅ #18: Skip links

### Pending (7/18 requirements):
⏳ #8: Tab interface keyboard navigation
⏳ #9: Focus trap in modals
⏳ #10: Initial focus in modals
⏳ #11: Return focus on modal close
⏳ #14: Automated accessibility audit
⏳ #15: Screen reader testing
⏳ #16: Color contrast verification

**Note:** Requirements #9-11 have utilities created (`useA11y.ts`) but need to be applied to existing modal components.
