# Fix for ResumeEditor ChunkLoadError

## Issue
ChunkLoadError when loading ResumeEditor component - this is typically caused by stale webpack cache.

## Solution

1. **Stop your development server** (Ctrl+C)

2. **Clear Next.js cache:**
   ```powershell
   cd apps/web
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   ```

3. **Restart the dev server:**
   ```powershell
   npm run dev
   # or
   pnpm dev
   ```

## Alternative Fix (if above doesn't work)

If the error persists, try:
1. Hard refresh the browser (Ctrl+Shift+R or Ctrl+F5)
2. Clear browser cache
3. Restart the dev server again

The ResumeEditor component is properly exported and should load correctly after clearing the cache.

