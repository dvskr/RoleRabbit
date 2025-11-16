# Client-Side Validation Implementation Guide

## ✅ Completed

### 1. **Enhanced Validation Utilities**
- **File**: `apps/web/src/utils/validationEnhanced.ts` (NEW)
- **File**: `apps/web/src/utils/validation.ts` (UPDATED)

**Added Functions:**
- ✅ `validateDateRange()` - Start date < End date
- ✅ `validateFutureDate()` - Warns if date is too far in future
- ✅ `validateDuplicateSkill()` - Case-insensitive duplicate check
- ✅ `validateDuplicateExperience()` - Duplicate entry warning
- ✅ `validateCustomSectionName()` - Empty, duplicates, special chars, length
- ✅ `validateFontSize()` - 8px - 18px range
- ✅ `validateMargins()` - 0.25in - 2in range
- ✅ `validateLineSpacing()` - 1.0 - 2.5 range
- ✅ `validateFileUpload()` - Size, type, extension, MIME validation
- ✅ `validateRequiredFields()` - Name, email, phone
- ✅ `validateResumeBeforeSave()` - Comprehensive validation

**Updated Constants:**
- ✅ `MAX_LENGTHS` - Added all required limits
- ✅ `FORMATTING_RANGES` - Font, margins, spacing ranges

---

## 🔨 TODO: Integration Tasks

### P0 - Critical (Must Have)

#### 1. **Integrate Required Fields Validation**
**Location**: `apps/web/src/hooks/useResumeData.ts` (in save/commit functions)

```typescript
import { validateRequiredFields } from '../utils/validationEnhanced';

// In handleSave or commitDraft function:
const validation = validateRequiredFields(resumeData);
if (!validation.isValid) {
  showToast(`Missing required fields: ${validation.missingFields.join(', ')}`, 'error');
  // Highlight fields in red (add error state)
  return;
}
```

#### 2. **Highlight Missing Fields**
**Location**: Contact fields components

```typescript
// Add error prop to input fields
<input
  className={`... ${hasError ? 'border-red-500' : 'border-gray-300'}`}
  style={{ borderColor: hasError ? colors.errorRed : colors.border }}
/>
```

#### 3. **Integrate File Upload Validation**
**Location**: `apps/web/src/components/modals/ImportModal.tsx`

```typescript
import { validateFileUpload } from '../../utils/validationEnhanced';

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const validation = validateFileUpload(file);
  if (!validation.isValid) {
    showToast(validation.error!, 'error');
    return;
  }
  
  // Proceed with upload
};
```

---

### P1 - High Priority (Should Have)

#### 4. **Integrate Date Range Validation**
**Location**: `apps/web/src/components/sections/ExperienceSection.tsx`

```typescript
import { validateDateRange, validateFutureDate } from '../../utils/validationEnhanced';

// When dates change:
const dateValidation = validateDateRange(exp.period, exp.endPeriod);
if (!dateValidation.isValid) {
  // Show error below date fields
}

const futureValidation = validateFutureDate(exp.endPeriod);
if (futureValidation.warning) {
  // Show warning (yellow) below date field
}
```

#### 5. **Integrate Duplicate Skills Validation**
**Location**: `apps/web/src/components/sections/SkillsSection.tsx`

```typescript
import { validateDuplicateSkill } from '../../utils/validationEnhanced';

const addSkill = (skill: string) => {
  const validation = validateDuplicateSkill(skill, skills);
  if (!validation.isValid) {
    showToast(validation.error!, 'error');
    return;
  }
  // Add skill
};
```

#### 6. **Integrate Custom Section Name Validation**
**Location**: `apps/web/src/components/modals/AddSectionModal.tsx`

```typescript
import { validateCustomSectionName } from '../../utils/validationEnhanced';

const handleAdd = () => {
  const existingNames = customSections.map(s => s.name);
  const validation = validateCustomSectionName(newSectionName, existingNames);
  if (!validation.isValid) {
    showToast(validation.error!, 'error');
    return;
  }
  // Add section
};
```

#### 7. **Integrate Formatting Validation**
**Location**: `apps/web/src/components/features/ResumeEditor/components/FormattingPanel.tsx`

```typescript
import { validateFontSize, validateMargins, validateLineSpacing } from '../../../utils/validationEnhanced';

// On font size change:
const handleFontSizeChange = (size: number) => {
  const validation = validateFontSize(size);
  if (!validation.isValid) {
    showToast(validation.error!, 'error');
    return;
  }
  setFontSize(size);
};

// Similar for margins and line spacing
```

---

### P2 - Medium Priority (Nice to Have)

#### 8. **Real-Time Validation**
**Location**: All input components

```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce'; // Create this hook

const [error, setError] = useState<string | null>(null);
const debouncedValue = useDebounce(value, 500);

useEffect(() => {
  const validation = validateEmail(debouncedValue);
  setError(validation.isValid ? null : validation.error);
}, [debouncedValue]);
```

#### 9. **Field-Level Error Messages**
**Location**: All form fields

```tsx
<div className="space-y-1">
  <input {...props} />
  {error && (
    <p className="text-xs text-red-600 flex items-center gap-1">
      <AlertCircle size={12} />
      {error}
    </p>
  )}
</div>
```

#### 10. **Validation Summary Panel**
**Location**: `apps/web/src/components/ValidationSummary.tsx` (NEW)

```tsx
interface ValidationSummaryProps {
  errors: Record<string, string>;
  onClose: () => void;
  onJumpToField: (field: string) => void;
}

export function ValidationSummary({ errors, onClose, onJumpToField }: ValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0) return null;
  
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-300 rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-red-800">
          You have {errorCount} {errorCount === 1 ? 'error' : 'errors'}
        </h4>
        <button onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <ul className="space-y-1">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>
            <button
              onClick={() => onJumpToField(field)}
              className="text-sm text-red-700 hover:underline"
            >
              • {error}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### P0 - Critical
- [ ] Add required fields validation to save/commit
- [ ] Highlight missing required fields in red
- [ ] Add file upload validation (size, type, MIME)
- [ ] Show error toasts for validation failures

### P1 - High Priority
- [ ] Add date range validation (start < end)
- [ ] Add future date warnings
- [ ] Add duplicate skills prevention
- [ ] Add duplicate experience warnings
- [ ] Add custom section name validation
- [ ] Add formatting range validation (font, margins, spacing)

### P2 - Medium Priority
- [ ] Add real-time validation with debounce
- [ ] Add field-level error messages
- [ ] Create validation summary panel
- [ ] Add "Jump to error" functionality

---

## 🎯 Quick Integration Example

### Example: Adding validation to email field

**Before:**
```tsx
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**After (with validation):**
```tsx
import { validateEmail } from '../../utils/validation';
import { useDebounce } from '../../hooks/useDebounce';

const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState<string | null>(null);
const debouncedEmail = useDebounce(email, 500);

useEffect(() => {
  if (debouncedEmail) {
    const validation = validateEmail(debouncedEmail);
    setEmailError(validation.isValid ? null : validation.error || null);
  } else {
    setEmailError(null);
  }
}, [debouncedEmail]);

<div>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={emailError ? 'border-red-500' : 'border-gray-300'}
  />
  {emailError && (
    <p className="text-xs text-red-600 mt-1">{emailError}</p>
  )}
</div>
```

---

## 🚀 Priority Order

1. **Start with P0** - Required fields validation (most critical for data quality)
2. **Then P1** - Date validation and duplicate prevention (prevents user errors)
3. **Finally P2** - Real-time validation and summary panel (UX polish)

---

## ✅ Summary

**Validation utilities are complete!** All validation functions are ready to use in:
- `apps/web/src/utils/validation.ts` (existing)
- `apps/web/src/utils/validationEnhanced.ts` (new)

**Next step**: Integrate these validations into the UI components following the guide above.

