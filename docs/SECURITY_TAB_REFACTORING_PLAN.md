# SecurityTab.tsx Refactoring Plan
## Detailed Step-by-Step Implementation Guide

**Current State**: 818 lines
**Target**: Modular, maintainable component structure (~200-300 lines)

---

## Phase 1: Pre-refactoring Setup

### Step 1.1: Backup Current File
- **Action**: Create backup at `apps/web/src/components/profile/tabs/SecurityTab.tsx.backup`
- **Status**: ✅ Backup will be created before refactoring

### Step 1.2: File Structure Analysis

**Current Component Structure**:

```typescript
SecurityTab (main component) - 818 lines
├── Imports (5 lines)
├── Component State (7 useState hooks)
│   ├── showPasswordModal: boolean
│   ├── show2FAModal: boolean
│   ├── twoFAEnabled: boolean
│   ├── profileVisibility: 'public' | 'recruiters' | 'private'
│   ├── showContactInfo: boolean
│   ├── passwordData: object (6 fields)
│   └── twoFACode: string, show2FACode: boolean
├── Handler Functions (4 functions)
│   ├── handlePasswordChange (lines 31-62)
│   ├── handleEnable2FA (lines 64-108)
│   ├── handleVerify2FA (lines 110-120)
│   └── handleLogoutSession (lines 122-125)
└── Main Render
    ├── Header Section (lines 128-141)
    ├── Password Management Section (lines 143-253)
    ├── Login Activity Section (lines 255-340)
    ├── Privacy Settings Section (lines 342-438)
    ├── Password Change Modal (lines 441-678)
    └── 2FA Setup Modal (lines 680-839)
```

### Step 1.3: Extraction Candidates

#### A. Components to Extract:
1. **PasswordManagementSection** - Password and 2FA settings (lines 143-253)
2. **LoginActivitySection** - Recent login activity display (lines 255-340)
3. **PrivacySettingsSection** - Privacy controls (lines 342-438)
4. **PasswordChangeModal** - Password change dialog (lines 441-678)
5. **TwoFASetupModal** - 2FA setup dialog (lines 680-839)
6. **SecurityHeader** - Header section (lines 128-141)

#### B. Repeated Patterns:
1. **Modal Structure Pattern** (PasswordChangeModal and TwoFASetupModal)
   - Header with close button
   - Form inputs with validation
   - Cancel/Submit buttons
   - Can extract shared Modal wrapper

2. **Password Input Pattern** (used 3 times in PasswordChangeModal)
   - Input field with show/hide toggle
   - Focus/blur handlers
   - Can extract PasswordInput component

3. **Settings Card Pattern** (used in all sections)
   - Card wrapper with consistent styling
   - Can extract SecurityCard component

#### C. State Logic:
1. **Password Modal State** (1 useState + passwordData object)
   - `showPasswordModal`
   - `passwordData` (6 fields)
   - **Extraction Target**: Custom hook `usePasswordModal`

2. **2FA Modal State** (2 useState hooks)
   - `show2FAModal`
   - `twoFACode`, `show2FACode`
   - **Extraction Target**: Custom hook `use2FAModal`

3. **Privacy Settings State** (2 useState hooks)
   - `profileVisibility`
   - `showContactInfo`
   - **Extraction Target**: Custom hook `usePrivacySettings`

#### D. Utility Functions:
1. **handlePasswordChange** (lines 31-62)
   - Password validation logic
   - API call simulation
   - **Location**: `utils/securityHelpers.ts`

2. **handleEnable2FA** (lines 64-108)
   - 2FA enable/disable API calls
   - **Location**: `utils/securityHelpers.ts`

3. **handleVerify2FA** (lines 110-120)
   - 2FA verification logic
   - **Location**: `utils/securityHelpers.ts`

4. **Password Validation**
   - Extract validation rules
   - **Location**: `utils/passwordValidation.ts`

#### E. Constants/Types:
1. **Security-related constants**
   - Password requirements
   - API endpoints
   - Modal backdrop style
   - **Location**: `components/profile/tabs/security/constants.ts`

2. **Type definitions**
   - PasswordData interface
   - ProfileVisibility type
   - Security settings types
   - **Location**: `components/profile/tabs/security/types.ts`

---

## Phase 2: Refactoring Steps (Incremental)

### Step 2.1: Extract Types and Interfaces
**File**: `apps/web/src/components/profile/tabs/security/types.ts`

**Types to Extract**:
- PasswordData interface
- ProfileVisibility type
- SecuritySectionProps
- PasswordModalProps
- TwoFAModalProps
- LoginSession interface

### Step 2.2: Extract Constants
**File**: `apps/web/src/components/profile/tabs/security/constants.ts`

**Constants to Extract**:
- Password requirements
- API endpoints
- Modal styles
- Default values

### Step 2.3: Extract Helper Functions
**Files to Create**:
1. `apps/web/src/utils/securityHelpers.ts` - Security API calls
2. `apps/web/src/utils/passwordValidation.ts` - Password validation

### Step 2.4: Extract Custom Hooks
**Files to Create**:
1. `apps/web/src/components/profile/tabs/security/hooks/usePasswordModal.ts`
2. `apps/web/src/components/profile/tabs/security/hooks/use2FAModal.ts`
3. `apps/web/src/components/profile/tabs/security/hooks/usePrivacySettings.ts`

### Step 2.5: Extract Sub-components
1. **SecurityHeader** - Header section
2. **PasswordManagementSection** - Password & 2FA section
3. **LoginActivitySection** - Recent logins
4. **PrivacySettingsSection** - Privacy controls
5. **PasswordChangeModal** - Password modal
6. **TwoFASetupModal** - 2FA modal
7. **PasswordInput** - Reusable password input with toggle

### Step 2.6: Optional Enhancements
- Extract shared Modal wrapper component
- Extract SecurityCard wrapper component

---

## Implementation Order

1. Step 2.1: Extract types (low risk)
2. Step 2.2: Extract constants (low risk)
3. Step 2.3: Extract helper functions (medium risk)
4. Step 2.4: Extract custom hooks (medium risk)
5. Step 2.5.1: Extract SecurityHeader (low risk)
6. Step 2.5.2: Extract PasswordInput (low risk)
7. Step 2.5.3: Extract PasswordManagementSection (medium risk)
8. Step 2.5.4: Extract LoginActivitySection (low risk)
9. Step 2.5.5: Extract PrivacySettingsSection (low risk)
10. Step 2.6.1: Extract PasswordChangeModal (medium risk)
11. Step 2.6.2: Extract TwoFASetupModal (medium risk)

---

## Estimated Results

- **Main file**: ~200-300 lines (from 818)
- **Reduction**: ~65-75%
- **New files**: 13-15 files
- **Better organization**: Clear separation of concerns

---

## Quality Assurance Checklist

- [ ] TypeScript compiles without errors
- [ ] No broken imports
- [ ] All features work as before
- [ ] Modals open/close correctly
- [ ] Password change works
- [ ] 2FA enable/disable works
- [ ] Privacy settings persist
- [ ] Visual appearance unchanged
- [ ] No console errors

