# Build Fix Instructions

## Issue
Next.js build cache is looking for `AIAgents.tsx` but we now have `AIAgents/index.tsx`

## Solution Applied
1. ✅ Cleared `.next` build cache
2. ✅ Cleared TypeScript build info files
3. ✅ Verified file structure is correct

## Required Action: Restart Dev Server

**IMPORTANT:** You must completely restart your Next.js dev server for the changes to take effect.

### Steps:
1. Stop the current dev server (Ctrl+C)
2. Clear all caches:
   ```bash
   # In apps/web directory
   rm -rf .next
   rm -rf node_modules/.cache
   ```
3. Restart the dev server:
   ```bash
   npm run dev
   ```

### Alternative: Force Rebuild
```bash
npm run build
```

## Why This Happens

Next.js has aggressive caching. When file structure changes significantly:
- Module resolution cache needs to be rebuilt
- TypeScript compilation cache is stale
- Next.js webpack cache needs refresh

## Verification

After restart, the import should work:
```typescript
import('../../components/AIAgents')
// Resolves to: AIAgents/index.tsx ✅
```

## If Issues Persist

1. Check the console for specific import errors
2. Verify all barrel exports are working
3. Check TypeScript compilation errors
4. Verify no circular dependencies

