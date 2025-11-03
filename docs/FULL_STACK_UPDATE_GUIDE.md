# Full Stack Update Guide

**When you make changes in the frontend, here are ALL the places you need to update across the full stack.**

---

## 📋 Table of Contents

1. [Frontend Changes](#frontend-changes)
2. [Backend Changes](#backend-changes)
3. [Database Changes](#database-changes)
4. [Type Definitions](#type-definitions)
5. [Data Mapping & Transformation](#data-mapping--transformation)
6. [Quick Reference Checklist](#quick-reference-checklist)

---

## 🎨 Frontend Changes

### 1. **Type Definitions** (`apps/web/src/components/profile/types/profile.ts`)

**When to update:** Adding new fields, changing field types, or modifying interfaces.

**Example:** Adding a new field `summary` to `UserData`:

```typescript
export interface UserData {
  // ... existing fields
  summary: string; // NEW FIELD
}
```

**Files to update:**
- `apps/web/src/components/profile/types/profile.ts` - Main type definitions
- `apps/web/src/types/userProfile.ts` - Legacy types (if still used)

---

### 2. **Component Default Values** (`apps/web/src/components/Profile.tsx`)

**When to update:** Adding new fields that need default values.

**Example:** Adding `summary` field:

```typescript
const defaultUserData: UserData = {
  // ... existing fields
  summary: '', // NEW DEFAULT VALUE
};
```

**Files to update:**
- `apps/web/src/components/Profile.tsx` - Default user data object

---

### 3. **Form Components** (Profile Tab Components)

**When to update:** Adding new form fields or modifying existing ones.

**Example:** Adding a `summary` textarea in `ProfileTab.tsx`:

```typescript
<FormField
  id="profile-summary"
  name="summary"
  label="Professional Summary"
  type="textarea"
  value={userData.summary || ''}
  onChange={(value) => onUserDataChange({ summary: value })}
  disabled={!isEditing}
  rows={4}
  maxLength={2000}
  showCounter={true}
  autoResize={true}
/>
```

**Files to update:**
- `apps/web/src/components/profile/tabs/ProfileTab.tsx`
- `apps/web/src/components/profile/tabs/ProfessionalTab.tsx`
- `apps/web/src/components/profile/tabs/SkillsTab.tsx`
- `apps/web/src/components/profile/tabs/CareerTab.tsx`
- `apps/web/src/components/profile/tabs/PortfolioTab.tsx`
- Any other tab component where the field appears

---

### 4. **Context/State Management** (`apps/web/src/contexts/ProfileContext.tsx`)

**When to update:** Adding fields that need to be mapped from API response or managed in state.

**Example:** Adding `summary` field mapping:

```typescript
const userDataWithDefaults: UserData = {
  // ... existing mappings
  summary: userProfile.summary || '', // NEW MAPPING
};
```

**Files to update:**
- `apps/web/src/contexts/ProfileContext.tsx` - API response mapping (lines 46-106)
- Any other context that manages profile data

---

## 🔧 Backend Changes

### 5. **API Route - GET Endpoint** (`apps/api/routes/users.routes.js`)

**When to update:** Adding fields that should be returned in GET `/api/users/profile`.

**Example:** Adding `summary` to the select statement:

```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    // ... existing fields
    summary: true, // NEW FIELD IN SELECT
  }
});
```

**Also update:** JSON parsing if it's an array/object field:

```javascript
const jsonFields = [
  // ... existing fields
  'summary', // ADD IF IT'S A JSON FIELD
];
```

**Files to update:**
- `apps/api/routes/users.routes.js` - GET `/api/users/profile` handler (lines 34-112)

---

### 6. **API Route - PUT Endpoint** (`apps/api/routes/users.routes.js`)

**When to update:** Adding fields that can be updated via PUT `/api/users/profile`.

**Example:** Adding `summary` to allowed fields:

```javascript
const allowedFields = [
  // ... existing fields
  'summary', // NEW FIELD
];
```

**Also update:** JSON stringification if it's an array/object field:

```javascript
const jsonFields = [
  // ... existing fields
  'summary', // ADD IF IT NEEDS JSON STRINGIFICATION
];
```

**Also update:** Response select statement:

```javascript
const updatedUser = await prisma.user.update({
  // ... existing code
  select: {
    // ... existing fields
    summary: true, // NEW FIELD IN RESPONSE
  }
});
```

**Files to update:**
- `apps/api/routes/users.routes.js` - PUT `/api/users/profile` handler (lines 115-278)
  - `allowedFields` array (line 143-154)
  - `jsonFields` array (line 161) - if field is array/object
  - Response `select` statement (line 194-241)

---

### 7. **Profile Completeness Calculator** (`apps/api/utils/profileCompleteness.js`)

**When to update:** Adding fields that should contribute to profile completeness score.

**Example:** Adding `summary` to completeness calculation:

```javascript
function calculateProfileCompleteness(user) {
  let score = 0;
  let totalFields = 0;
  
  // ... existing checks
  if (user.summary && user.summary.trim().length > 0) {
    score += 5; // NEW FIELD CONTRIBUTION
  }
  totalFields += 5; // UPDATE TOTAL
  
  return {
    score: Math.round((score / totalFields) * 100),
    // ...
  };
}
```

**Files to update:**
- `apps/api/utils/profileCompleteness.js` - Completeness calculation logic

---

## 🗄️ Database Changes

### 8. **Prisma Schema** (`apps/api/prisma/schema.prisma`)

**When to update:** Adding new database fields or modifying existing ones.

**Example:** Adding `summary` field to `UserProfile` model:

```prisma
model UserProfile {
  id        String @id @default(cuid())
  userId    String @unique
  
  // ... existing fields
  summary   String? // NEW FIELD
  
  // ... relations
}
```

**Important:** 
- Use `String?` for optional fields
- Use `String` for required fields
- Use `DateTime` for dates
- Use `Int` for numbers
- Use `Boolean` for true/false values

**Files to update:**
- `apps/api/prisma/schema.prisma` - Database schema definition

---

### 9. **Database Migration**

**When to update:** After modifying `schema.prisma`, you must create and run a migration.

**Commands:**

```bash
# Generate migration
cd apps/api
npx prisma migrate dev --name add_summary_field

# OR push directly (for development only)
npx prisma db push --accept-data-loss
```

**After migration:**
- Verify the field exists in database
- Check if old data needs migration/default values

**Files to update:**
- Migration files in `apps/api/prisma/migrations/` (auto-generated)

---

## 🔄 Data Mapping & Transformation

### 10. **API Service** (`apps/web/src/services/apiService.ts`)

**When to update:** Usually NOT needed, as API service uses generic request methods. However, if you add custom endpoints or transformations, update here.

**Example:** If adding a dedicated endpoint for summary:

```typescript
async updateProfileSummary(summary: string) {
  return this.request('/api/users/profile/summary', {
    method: 'PUT',
    body: JSON.stringify({ summary }),
  });
}
```

**Files to update:**
- `apps/web/src/services/apiService.ts` - Only if adding custom methods

---

### 11. **Field Limits & Validation** (`apps/web/src/utils/fieldLimits.ts`)

**When to update:** Adding character limits or validation rules for new fields.

**Example:** Adding limit for `summary`:

```typescript
export const FIELD_LIMITS = {
  // ... existing limits
  summary: 2000, // NEW FIELD LIMIT
} as const;
```

**Files to update:**
- `apps/web/src/utils/fieldLimits.ts` - Field limits definition

---

### 12. **Data Normalization** (`apps/web/src/utils/resumeDataNormalizer.ts`)

**When to update:** Adding normalization logic for parsed resume data (if using resume parsing feature).

**Example:** Adding normalization for `summary`:

```typescript
static prepareForUI(parsedData: any): any {
  return {
    // ... existing mappings
    summary: this.normalizeText(parsedData.summary, 2000), // NEW NORMALIZATION
  };
}
```

**Files to update:**
- `apps/web/src/utils/resumeDataNormalizer.ts` - Data normalization utilities

---

## 📝 Quick Reference Checklist

When adding a new field (e.g., `summary`), update these files in order:

### ✅ Frontend
- [ ] `apps/web/src/components/profile/types/profile.ts` - Add to `UserData` interface
- [ ] `apps/web/src/components/Profile.tsx` - Add to `defaultUserData`
- [ ] `apps/web/src/contexts/ProfileContext.tsx` - Add to API response mapping
- [ ] `apps/web/src/components/profile/tabs/[TabName].tsx` - Add form field component
- [ ] `apps/web/src/utils/fieldLimits.ts` - Add character limit (if needed)
- [ ] `apps/web/src/utils/resumeDataNormalizer.ts` - Add normalization (if using resume parsing)

### ✅ Backend
- [ ] `apps/api/prisma/schema.prisma` - Add field to `UserProfile` model
- [ ] `apps/api/routes/users.routes.js` - Update GET endpoint `select` statement
- [ ] `apps/api/routes/users.routes.js` - Add to `allowedFields` in PUT endpoint
- [ ] `apps/api/routes/users.routes.js` - Add to `jsonFields` if array/object
- [ ] `apps/api/routes/users.routes.js` - Update PUT response `select` statement
- [ ] `apps/api/utils/profileCompleteness.js` - Add to completeness calculation (if needed)

### ✅ Database
- [ ] Run migration: `npx prisma migrate dev --name add_summary_field`
- [ ] Verify field exists: Check database tables
- [ ] Test: Create/update user with new field

---

## 🎯 Common Scenarios

### Scenario 1: Adding a Simple Text Field

**Example:** Adding `summary` (string, optional)

1. **Frontend Types:** Add `summary: string;` to `UserData`
2. **Frontend Default:** Add `summary: ''` to `defaultUserData`
3. **Frontend Form:** Add `<FormField>` component
4. **Frontend Context:** Add `summary: userProfile.summary || ''` to mapping
5. **Backend Schema:** Add `summary String?` to `UserProfile`
6. **Backend GET:** Add `summary: true` to select
7. **Backend PUT:** Add `'summary'` to `allowedFields`
8. **Backend PUT Response:** Add `summary: true` to select
9. **Database:** Run `npx prisma db push` or migration

---

### Scenario 2: Adding an Array Field

**Example:** Adding `awards` (array of objects)

1. **Frontend Types:** Add `awards: Award[]` to `UserData` + define `Award` interface
2. **Frontend Default:** Add `awards: []` to `defaultUserData`
3. **Frontend Form:** Add array management component (similar to skills/education)
4. **Frontend Context:** Add `awards: userProfile.awards || []` to mapping
5. **Backend Schema:** Add `awards String?` (stored as JSON string)
6. **Backend GET:** Add `awards: true` to select + add to `jsonFields` for parsing
7. **Backend PUT:** Add `'awards'` to `allowedFields` + add to `jsonFields` for stringification
8. **Backend PUT Response:** Add `awards: true` to select + add to `jsonFields` for parsing
9. **Database:** Run migration

---

### Scenario 3: Adding a Related Table (One-to-Many)

**Example:** Adding `courses` (separate table)

1. **Frontend Types:** Add `courses: Course[]` to `UserData` + define `Course` interface
2. **Frontend Default:** Add `courses: []` to `defaultUserData`
3. **Frontend Form:** Add array management component
4. **Frontend Context:** Add `courses: userProfile.courses || []` to mapping
5. **Backend Schema:** Create new `Course` model with `profileId` relation
6. **Backend GET:** Use `include: { courses: true }` in Prisma query
7. **Backend PUT:** Create separate endpoint or handle in array format
8. **Database:** Run migration to create `courses` table

---

### Scenario 4: Modifying Existing Field

**Example:** Changing `bio` from `String?` to `String` (required)

1. **Frontend Types:** Change `bio: string;` (remove `?`)
2. **Frontend Validation:** Add required validation in form
3. **Backend Schema:** Change `bio String?` to `bio String`
4. **Backend Validation:** Add required check in PUT endpoint
5. **Database:** Run migration (may need default value for existing rows)

---

## ⚠️ Important Notes

### ⚠️ CURRENT STATE: API Routes Need Migration

**Important:** The API routes (`apps/api/routes/users.routes.js`) are currently still using the **old single-table approach** (`prisma.user.findUnique`), but the database schema has been **normalized** into separate tables (`user_profiles`, `work_experiences`, etc.).

**What this means:**
- Database schema: ✅ Normalized (21 tables)
- API routes: ⚠️ Still using old single-table queries
- Frontend: ✅ Expects normalized data structure

**Before making new changes, you should:**
1. Update API routes to use normalized schema (JOIN queries)
2. OR continue using old approach until migration is complete

See TODO items for API route migration.

---

### Normalized Schema (Target State)

We're moving to a **normalized database schema** with separate tables:
- `users` - Authentication & core user data
- `user_profiles` - Profile data
- `work_experiences` - Work experience entries
- `education` - Education entries
- `skills` + `user_skills` - Skills (many-to-many)
- And more...

**When adding fields:**
- **Simple fields** (strings, numbers, booleans) → Add to `user_profiles` table
- **Array fields** (multiple entries) → Consider separate table or JSON string
- **Complex nested data** → Use separate table with `profileId` foreign key

### API Response Format

The backend returns data in this format:
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    // ... all profile fields
  }
}
```

### Frontend Data Format

The frontend expects `UserData` type which may include computed/derived fields not in the database.

---

## 🧪 Testing Checklist

After making changes:

1. **Frontend Testing:**
   - [ ] Form renders correctly
   - [ ] Default values work
   - [ ] Validation works (if applicable)
   - [ ] Save/update works
   - [ ] Data persists after refresh

2. **Backend Testing:**
   - [ ] GET endpoint returns new field
   - [ ] PUT endpoint accepts new field
   - [ ] PUT endpoint updates correctly
   - [ ] Validation works (if applicable)
   - [ ] Error handling works

3. **Database Testing:**
   - [ ] Field exists in database
   - [ ] Field type is correct
   - [ ] Field constraints work (nullable, unique, etc.)
   - [ ] Old data migrated correctly (if applicable)

---

## 📚 Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [API Routes Documentation](../apps/api/README.md)
- [Profile Component Documentation](./components/profile/README.md)
- [Data Flow Documentation](./components/profile/DATA_FLOW.md)

---

**Last Updated:** 2024-11-02
**Schema Version:** Normalized (21 tables)

