# Critical Bug Fix: Projects Data Loss on Save

**Date:** January 2025  
**Severity:** Critical  
**Status:** ✅ Fixed  
**Impact:** Projects were being removed from UI and database after saving

---

## Problem Summary

When users added projects to their profile and clicked save, all project data was being lost - both from the UI and the database. This was a critical data loss issue that prevented users from maintaining their project portfolios.

---

## Root Causes Identified

### 1. Missing Sanitization Function
- **Issue:** Projects didn't have a dedicated sanitization function like other fields (workExperiences, education, skills, certifications)
- **Impact:** Projects weren't properly validated or normalized before saving
- **Location:** `apps/web/src/components/Profile.tsx`

### 2. Object vs Array Format Mismatch
- **Issue:** Projects were sometimes sent as objects with numeric string keys (`{"0": {...}, "1": {...}}`) instead of arrays
- **Impact:** API's `Array.isArray()` check failed, causing projects to be skipped
- **Location:** Both frontend and backend

### 3. Technologies Field Serialization
- **Issue:** The `technologies` field is an array in the application but stored as JSON string in the database
- **Problem 1:** When saving, array wasn't being serialized to JSON string
- **Problem 2:** When reading, JSON string wasn't being parsed back to array
- **Impact:** Technologies data was lost or corrupted
- **Location:** `apps/api/routes/users.routes.js`

### 4. Missing Variable Assignment
- **Issue:** `await prisma.project.createMany()` result wasn't assigned to a variable
- **Impact:** Error when trying to log the result: `ReferenceError: result is not defined`
- **Location:** `apps/api/routes/users.routes.js:999`

### 5. TypeScript Syntax in JavaScript Files
- **Issue:** Type annotations (`: string`) were used in `.js` files
- **Impact:** Syntax errors preventing server from starting
- **Location:** `apps/api/routes/users.routes.js`

---

## Solution Implementation

### 1. Added `sanitizeProjects` Function

**File:** `apps/web/src/components/Profile.tsx`

```typescript
const sanitizeProjects = (projects: any, options?: { keepDrafts?: boolean }): any[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(projects);

  return (normalizedArray as any[])
    .map((proj, index) => {
      // Handle empty projects
      if (!proj) {
        if (keepDrafts) {
          return { id: `proj-${Date.now()}-${index}`, ... };
        }
        return null;
      }

      // Extract and validate fields
      const title = toStringSafe(proj.title || '');
      const description = toStringSafe(proj.description || '');
      // ... other fields

      // Handle technologies - can be array or comma-separated string
      let technologies: string[] = [];
      if (Array.isArray(proj.technologies)) {
        technologies = proj.technologies.map(t => toStringSafe(t)).filter(t => t.length > 0);
      } else if (typeof proj.technologies === 'string') {
        technologies = proj.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }

      // Check if project has any content
      const hasContent = !keepDrafts 
        ? (title.trim().length > 0 || description.trim().length > 0 || 
           technologies.length > 0 || date.trim().length > 0 || 
           link.trim().length > 0 || github.trim().length > 0)
        : true;

      if (!hasContent && !keepDrafts) {
        return null; // Filter out completely empty projects
      }

      return sanitized;
    })
    .filter(Boolean);
};
```

**Key Features:**
- Normalizes projects from various formats (arrays, objects, strings)
- Validates project content before saving
- Handles technologies in multiple formats (array, comma-separated string)
- Preserves all meaningful fields during editing (`keepDrafts: true`)
- Filters out empty projects only when saving (`keepDrafts: false`)

### 2. Enhanced `normalizeToArray` Function

**File:** `apps/web/src/components/Profile.tsx`

```typescript
const normalizeToArray = <T = any>(value: any): T[] => {
  // ... existing array/string/map checks ...
  
  if (typeof value === 'object') {
    // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
    const keys = Object.keys(value);
    const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
    if (hasNumericKeys && keys.length > 0) {
      // Sort by numeric key to maintain order
      const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
      return sortedKeys.map(key => (value as any)[key])
        .filter((item) => item !== undefined && item !== null) as T[];
    }
    return Object.values(value).filter((item) => item !== undefined && item !== null) as T[];
  }
  return [];
};
```

**Key Features:**
- Detects objects with numeric string keys
- Sorts keys numerically to maintain order
- Converts to array while preserving data integrity

### 3. Fixed API Normalization

**File:** `apps/api/routes/users.routes.js`

```javascript
// Handle projects - replace all existing ones
// Normalize projects from object format (e.g., {"0": {...}, "1": {...}}) to array
let normalizedProjects = [];
if (projects !== undefined) {
  if (Array.isArray(projects)) {
    normalizedProjects = projects;
  } else if (projects && typeof projects === 'object') {
    // Handle objects with numeric string keys
    const keys = Object.keys(projects);
    const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
    if (hasNumericKeys && keys.length > 0) {
      // Sort by numeric key to maintain order
      const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
      normalizedProjects = sortedKeys.map(key => projects[key]);
    } else {
      normalizedProjects = Object.values(projects);
    }
  }
}
```

### 4. Fixed Technologies Serialization

**When Saving (Array → JSON String):**

```javascript
// Serialize technologies array to JSON string for database storage
let technologiesJson = null;
if (proj.technologies) {
  if (Array.isArray(proj.technologies)) {
    // It's already an array
    technologiesJson = proj.technologies.length > 0 
      ? JSON.stringify(proj.technologies) 
      : null;
  } else if (typeof proj.technologies === 'string') {
    // Already a string, check if it's JSON or comma-separated
    try {
      JSON.parse(proj.technologies); // Validate it's valid JSON
      technologiesJson = proj.technologies;
    } catch {
      // Not JSON, treat as comma-separated and convert to JSON array
      const techArray = proj.technologies.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      technologiesJson = techArray.length > 0 
        ? JSON.stringify(techArray) 
        : null;
    }
  } else if (typeof proj.technologies === 'object' && proj.technologies !== null) {
    // Handle object (should be converted to array)
    const keys = Object.keys(proj.technologies);
    const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
    if (hasNumericKeys && keys.length > 0) {
      const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
      const techArray = sortedKeys.map(key => proj.technologies[key])
        .filter(t => t && t.trim().length > 0);
      technologiesJson = techArray.length > 0 
        ? JSON.stringify(techArray) 
        : null;
    } else {
      // Regular object, convert values to array
      const techArray = Object.values(proj.technologies)
        .filter(t => t && (typeof t === 'string' ? t.trim().length > 0 : true));
      technologiesJson = techArray.length > 0 
        ? JSON.stringify(techArray) 
        : null;
    }
  }
}
```

**When Reading (JSON String → Array):**

```javascript
// Transform projects - ensure technologies is parsed from JSON if needed
parsedUser.projects = Array.isArray(parsedUser.projects) 
  ? parsedUser.projects.map((proj) => {
      if (!proj || typeof proj !== 'object') {
        return null;
      }
      
      // Parse technologies if it's a string (JSON) or ensure it's an array
      let technologies = [];
      if (proj.technologies) {
        if (typeof proj.technologies === 'string') {
          try {
            technologies = JSON.parse(proj.technologies);
          } catch {
            // If not JSON, try splitting by comma
            technologies = proj.technologies.split(',')
              .map(t => t.trim())
              .filter(t => t.length > 0);
          }
        } else if (Array.isArray(proj.technologies)) {
          technologies = proj.technologies;
        }
      }
      
      return {
        ...proj,
        technologies: technologies,
        title: proj.title || '',
        description: proj.description || '',
        date: proj.date || '',
        link: proj.link || '',
        github: proj.github || ''
      };
    }).filter(Boolean) 
  : [];
```

### 5. Fixed Variable Assignment

**Before (Broken):**
```javascript
await prisma.project.createMany({ ... });
console.log('Successfully created project records:', result); // ❌ result is not defined
```

**After (Fixed):**
```javascript
const result = await prisma.project.createMany({ ... });
console.log('Successfully created project records:', result); // ✅ Works correctly
console.log('Created count:', result.count);
```

### 6. Removed TypeScript Syntax from JavaScript Files

**Before:**
```javascript
.map((t: string) => t.trim()).filter((t: string) => t.length > 0)
```

**After:**
```javascript
.map(t => t.trim()).filter(t => t.length > 0)
```

### 7. Added Comprehensive Debugging

**Frontend Logging:**
```typescript
logger.debug('=== PROJECTS SANITIZATION ===');
logger.debug('Projects before sanitization:', value);
logger.debug('Projects after sanitization:', sanitizedProjects);
logger.debug('projects in cleanedData:', cleanedData.projects);
logger.debug('Response projects:', response?.user?.projects);
```

**Backend Logging:**
```javascript
console.log('Received projects:', JSON.stringify(projects, null, 2));
console.log('Normalized projects:', JSON.stringify(normalizedProjects, null, 2));
console.log('Creating projects:', JSON.stringify(normalizedProjects, null, 2));
console.log('Successfully created project records:', result);
console.log('Verification: Projects in DB after save:', verifyProjects.length);
```

---

## Files Modified

### Frontend Changes
1. **`apps/web/src/components/Profile.tsx`**
   - Added `sanitizeProjects()` function
   - Enhanced `normalizeToArray()` to handle objects with numeric keys
   - Added projects sanitization in `handleSave()`
   - Added debug logging

### Backend Changes
2. **`apps/api/routes/users.routes.js`**
   - Added projects normalization from object format
   - Fixed technologies serialization (array → JSON string)
   - Fixed technologies deserialization (JSON string → array)
   - Fixed `result` variable assignment
   - Removed TypeScript syntax
   - Added comprehensive logging

---

## Testing Checklist

✅ **Projects Save Successfully**
- [x] Projects with all fields populated save correctly
- [x] Projects with partial fields save correctly
- [x] Empty projects are filtered out (not saved)
- [x] Projects persist after page refresh

✅ **Technologies Field**
- [x] Array format technologies save correctly
- [x] Comma-separated string technologies convert correctly
- [x] JSON string technologies parse correctly
- [x] Empty technologies array handled correctly

✅ **Data Format Handling**
- [x] Projects sent as arrays work correctly
- [x] Projects sent as objects with numeric keys convert correctly
- [x] Order is preserved when converting from object format

✅ **Error Handling**
- [x] No syntax errors in JavaScript files
- [x] Database operations complete successfully
- [x] Proper error messages if save fails

---

## Prevention Strategies

### 1. Consistency Check
- Ensure all array fields have sanitization functions
- Use the same normalization pattern across all fields
- Document expected data formats

### 2. Type Safety
- Avoid mixing TypeScript syntax in JavaScript files
- Use proper type checking before serialization
- Validate data formats at API boundaries

### 3. Testing
- Test with various data formats (arrays, objects, strings)
- Test edge cases (empty data, null, undefined)
- Test serialization/deserialization round-trips

### 4. Logging
- Add logging at critical transformation points
- Log before and after data transformations
- Log database operations for verification

---

## Related Issues

- **Issue:** Projects not appearing in UI after save
- **Related:** Similar normalization issues may exist for other fields
- **Follow-up:** Review other array fields for similar patterns

---

## Lessons Learned

1. **Consistency is Key:** All array fields should follow the same sanitization pattern
2. **Handle Multiple Formats:** Always normalize data from various formats (arrays, objects, strings)
3. **Database Mapping:** Be explicit about serialization/deserialization for complex types
4. **Test Edge Cases:** Empty objects `{}`, null, undefined can cause unexpected behavior
5. **Debugging Tools:** Comprehensive logging helps trace data flow and catch issues early

---

## References

- **Schema:** `apps/api/prisma/schema.prisma` - Project model definition
- **Frontend Types:** `apps/web/src/components/profile/types/profile.ts` - Project interface
- **API Route:** `apps/api/routes/users.routes.js` - Project save/read logic
- **Profile Component:** `apps/web/src/components/Profile.tsx` - Project sanitization

---

## Verification

After implementing these fixes:
1. ✅ Projects save successfully to database
2. ✅ Projects load correctly from database
3. ✅ Technologies field serializes/deserializes correctly
4. ✅ No syntax errors in JavaScript files
5. ✅ Projects persist after page refresh
6. ✅ Multiple projects can be saved and loaded
7. ✅ Projects with various field combinations work correctly

---

**Status:** ✅ **RESOLVED**  
**Date Fixed:** January 2025  
**Fixed By:** AI Assistant (Composer)  
**Verified By:** User Testing

