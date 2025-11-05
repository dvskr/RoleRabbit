# Migration Scripts

## Profile Pictures Migration

### migrate-profile-pictures.js

Migrates existing base64-encoded profile pictures to Supabase Storage.

**What it does:**
1. Finds all UserProfile records with base64 profile pictures (`data:image/...;base64,...`)
2. Converts base64 to file buffer
3. Uploads to Supabase Storage in user's folder
4. Updates database with Supabase URL
5. Removes base64 data from database

**Benefits:**
- Reduces database size (base64 adds ~33% overhead)
- Improves query performance
- Better scalability
- Files stored in proper storage (Supabase)

**Usage:**

```bash
cd apps/api
npm run migrate:profile-pictures
```

Or directly:
```bash
node scripts/migrate-profile-pictures.js
```

**Requirements:**
- Supabase Storage must be configured (see `.env` file)
- Database connection must be working
- User must have read/write access to database

**Environment Variables Needed:**
```env
DATABASE_URL=postgresql://...
STORAGE_TYPE=supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=roleready-files
```

**Safety:**
- ✅ Safe to run multiple times (only migrates base64 pictures)
- ✅ Non-destructive (keeps URLs if already migrated)
- ✅ Logs all operations
- ✅ Can be interrupted and resumed

**Output:**
- Shows progress for each profile picture
- Summary of successful/failed migrations
- Estimated database space saved

