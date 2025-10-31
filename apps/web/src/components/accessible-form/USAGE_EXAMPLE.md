# AccessibleForm Components - Usage Guide

## Importing Components

### Option 1: Import from accessible-form directory
```typescript
import { 
  AccessibleInput, 
  AccessibleButton,
  AccessibleTextarea 
} from '@/components/accessible-form';
```

### Option 2: Import individual components
```typescript
import { AccessibleInput } from '@/components/accessible-form/AccessibleInput';
import { AccessibleButton } from '@/components/accessible-form/AccessibleButton';
```

## Component Usage Examples

### AccessibleInput
```tsx
import { AccessibleInput } from '@/components/accessible-form';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register } = useForm();
  
  return (
    <AccessibleInput
      label="Email Address"
      fieldName="email"
      type="email"
      required
      helperText="We'll never share your email"
      {...register('email')}
    />
  );
}
```

### AccessibleTextarea
```tsx
import { AccessibleTextarea } from '@/components/accessible-form';

<AccessibleTextarea
  label="Message"
  fieldName="message"
  required
  rows={5}
  error="This field is required"
  helperText="Enter your message here"
/>
```

### AccessibleSelect
```tsx
import { AccessibleSelect } from '@/components/accessible-form';

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' }
];

<AccessibleSelect
  label="Country"
  fieldName="country"
  required
  options={options}
/>
```

### AccessibleButton
```tsx
import { AccessibleButton } from '@/components/accessible-form';

<AccessibleButton
  variant="primary"
  size="md"
  loading={isSubmitting}
  disabled={isDisabled}
  onClick={handleSubmit}
>
  Submit Form
</AccessibleButton>
```

### AccessibleCheckbox
```tsx
import { AccessibleCheckbox } from '@/components/accessible-form';

<AccessibleCheckbox
  label="I agree to the terms and conditions"
  fieldName="agreeToTerms"
  required
  helperText="You must agree to continue"
/>
```

### AccessibleRadioGroup
```tsx
import { AccessibleRadioGroup } from '@/components/accessible-form';

const planOptions = [
  { value: 'basic', label: 'Basic Plan' },
  { value: 'pro', label: 'Pro Plan' },
  { value: 'enterprise', label: 'Enterprise Plan' }
];

<AccessibleRadioGroup
  label="Select Plan"
  name="plan"
  fieldName="plan"
  required
  options={planOptions}
  value={selectedPlan}
  onChange={setSelectedPlan}
/>
```

## Type Imports

```typescript
import type {
  AccessibleInputProps,
  AccessibleButtonProps,
  AccessibleTextareaProps,
  AccessibleSelectProps,
  AccessibleCheckboxProps,
  AccessibleRadioGroupProps
} from '@/components/accessible-form';
```

## Constants

Style constants are available for custom usage:

```typescript
import { 
  BUTTON_VARIANT_CLASSES,
  BUTTON_SIZE_CLASSES,
  BASE_INPUT_CLASSES,
  ERROR_INPUT_CLASSES
} from '@/components/accessible-form';
```

## Accessibility Provider Required

All components require the `AccessibilityProvider` context:

```tsx
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';

function App() {
  return (
    <AccessibilityProvider>
      {/* Your app content */}
      <MyForm />
    </AccessibilityProvider>
  );
}
```

## Features

✅ **Full ARIA support** - Screen reader compatible  
✅ **Keyboard navigation** - Tab, Enter, Escape support  
✅ **Error states** - Built-in error display  
✅ **Helper text** - Contextual guidance  
✅ **Required fields** - Visual indicators  
✅ **Loading states** - Button loading indicators  
✅ **Focus management** - Automatic focus trapping  
✅ **TypeScript** - Full type safety  

## Migration from Old AccessibleForm.tsx

If you previously imported from `AccessibleForm.tsx`:

**Before:**
```typescript
import { AccessibleInput } from '@/components/AccessibleForm';
```

**After (compatible):**
```typescript
import { AccessibleInput } from '@/components/accessible-form';
```

The old file has been removed. All imports must now use the new modular structure.

## Support

For questions or issues, see:
- `REFACTORING_SUMMARY.md` - Detailed refactoring documentation
- `types.ts` - All type definitions
- `constants.ts` - Available constants

