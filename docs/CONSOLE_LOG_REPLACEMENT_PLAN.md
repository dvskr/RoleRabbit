# Console.log Replacement Plan

## Files to Update (30 files with console statements)

### Priority Order:

### 1. High Priority (Core Features) - 8 files
- `apps/web/src/components/jobs/JobDetailView.tsx` - 13 console.log (handler calls)
- `apps/web/src/components/JobTracker.tsx` - 1 console.log
- `apps/web/src/components/Discussion.tsx` - 7 console.log
- `apps/web/src/components/CloudStorage.tsx` - 2 console.log
- `apps/web/src/components/CoverLetterGenerator.tsx` - 3 console.log
- `apps/web/src/components/Templates.tsx` - 1 console.log
- `apps/web/src/app/dashboard/page.tsx` - 3 console.log
- `apps/web/src/components/RealTimeResumeEditor.tsx` - 1 console.log

### 2. Medium Priority (Components) - 10 files
- `apps/web/src/components/email/tabs/CampaignsTab.tsx` - 5 console.log
- `apps/web/src/components/email/tabs/ComposeTab.tsx` - 2 console.log
- `apps/web/src/components/email/tabs/ContactsTab.tsx` - 1 console.log
- `apps/web/src/components/UserProfileModal.tsx` - 1 console.log
- `apps/web/src/components/profile/components/ProfilePicture.tsx` - 1 console.log
- `apps/web/src/components/coverletter/tabs/PreviewTab.tsx` - 2 console.log
- `apps/web/src/components/coverletter/tabs/CustomTab.tsx` - 1 console.log
- `apps/web/src/components/coverletter/tabs/TemplatesTab.tsx` - 2 console.log
- `apps/web/src/components/dashboard/components/DataExport.tsx` - 9 console.log
- `apps/web/src/components/layout/OptimizedHeader.tsx` - 1 console.log

### 3. Lower Priority (Utilities & Hooks) - 7 files
- `apps/web/src/hooks/useUserProfile.ts` - 7 console.log
- `apps/web/src/hooks/useCloudStorage.ts` - 4 console.log
- `apps/web/src/hooks/useWebSocket.ts` - 4 console.log
- `apps/web/src/utils/exportHelpers.ts` - 1 console.log
- `apps/web/src/utils/aiHelpers.ts` - console.log
- `apps/web/src/components/dashboard/data/mockData.ts` - 4 console.log

### 4. Error Handling (Keep as-is) - 5 files
- `apps/web/src/services/errorHandler.tsx`
- `apps/web/src/components/ErrorRecovery.tsx`
- `apps/web/src/components/GlobalErrorBoundary.tsx`
- `apps/web/src/components/ErrorBoundary.tsx`
- `apps/web/src/services/webSocketService.ts`

**Note**: Error handling console.error() should remain as they're intentional for debugging.

---

## Replacement Strategy

### For each file:
1. Import logger: `import { logger } from '@/utils/logger';`
2. Replace `console.log()` with `logger.log()` or `logger.debug()`
3. Replace `console.info()` with `logger.info()`
4. Replace `console.warn()` with `logger.warn()`
5. Keep `console.error()` as is (or replace with `logger.error()`)

### Examples:

**Before:**
```typescript
console.log('Add interview note:', jobId, note);
```

**After:**
```typescript
import { logger } from '@/utils/logger';
logger.debug('Add interview note:', jobId, note);
```

**Before:**
```typescript
console.warn('Something might be wrong');
```

**After:**
```typescript
import { logger } from '@/utils/logger';
logger.warn('Something might be wrong');
```

---

## Implementation Order

1. **Start with Core Features** (8 files) - Most used code
2. **Then Components** (10 files) - Feature components
3. **Then Utilities** (7 files) - Helper functions
4. **Keep Error Handlers** - Ensure proper error logging

---

## Estimated Time

- **Core Features**: 1 hour (8 files)
- **Components**: 45 minutes (10 files)
- **Utilities**: 30 minutes (7 files)
- **Total**: ~2.5 hours for complete replacement

---

## Testing After Replacement

1. Run development server
2. Test each feature
3. Check browser console in development
4. Build production and verify logs are removed
5. Check for any TypeScript errors

---

**Ready to begin replacement process.**

