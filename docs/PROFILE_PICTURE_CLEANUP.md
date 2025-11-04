# Profile Picture Cleanup

## Issue

When users change their profile picture, the old picture should be deleted from storage to:
1. **Save storage space** - Prevent accumulation of unused files
2. **Reduce costs** - Storage costs increase with unused files
3. **Maintain privacy** - Old pictures shouldn't remain accessible

## Current Implementation

The code **does attempt to delete old profile pictures**, but there might be issues:

### How It Works

1. **Before Upload:**
   - Extracts the storage path from the existing profile picture URL
   - Stores it in `oldPicturePath` variable

2. **After Upload:**
   - Deletes the old picture using `storageHandler.deleteFile(oldStoragePath)`
   - Logs success/failure

### Potential Issues

1. **Path Extraction Failures:**
   - If the URL format is unknown, `extractStoragePath()` returns `null`
   - Old picture won't be deleted if path can't be extracted

2. **Silent Failures:**
   - Deletion errors are logged as warnings but don't stop the upload
   - Old code had minimal logging, making it hard to debug

3. **Multiple Old Pictures:**
   - Each upload creates a new file with timestamp: `userId/2024/11/uuid-timestamp.jpg`
   - Old pictures might remain if deletion fails

## Fixes Applied

✅ **Enhanced Logging:**
- Added detailed logs for path extraction
- Success/failure messages for deletion
- Warning when path extraction fails

✅ **Improved Error Handling:**
- Better error messages
- Handles "file not found" gracefully
- Logs URL format when extraction fails

## How to Verify

### Check Server Logs

When a user uploads a new profile picture, you should see:

```
📸 Found existing profile picture, extracted path: userId/2024/11/uuid-timestamp.jpg
🗑️  Deleting old profile picture: userId/2024/11/uuid-timestamp.jpg
✅ Successfully deleted old profile picture: userId/2024/11/uuid-timestamp.jpg
```

### If Deletion Fails

You'll see warnings like:
```
⚠️  Could not delete old profile picture: <error message>
```

### Check Supabase Storage

1. Go to Supabase Dashboard → Storage → `roleready-file` bucket
2. Navigate to the user's folder: `{userId}/`
3. Check if old profile pictures remain

## Manual Cleanup Script

If you find orphaned profile pictures, you can create a cleanup script:

```javascript
// scripts/cleanup-orphaned-profile-pictures.js
const { PrismaClient } = require('@prisma/client');
const storageHandler = require('../utils/storageHandler');

async function cleanupOrphanedPictures() {
  const prisma = new PrismaClient();
  
  // Get all users with profile pictures
  const profiles = await prisma.userProfile.findMany({
    where: { profilePicture: { not: null } },
    select: { userId: true, profilePicture: true }
  });
  
  // List all files in storage
  // Compare with database records
  // Delete files not in database
  
  // This would require listing bucket contents
  // See Supabase Storage API: list() method
}
```

## Future Improvements

1. **Use Fixed Path for Profile Pictures:**
   - Instead of timestamp-based paths, use: `userId/profile-picture.jpg`
   - Enable `upsert: true` in Supabase upload to overwrite automatically
   - Simpler deletion logic

2. **Background Cleanup Job:**
   - Scheduled job to find orphaned files
   - Compare storage files with database records
   - Clean up files not referenced in database

3. **Storage Quota Tracking:**
   - Track profile picture size separately
   - Include in user's storage quota

## Testing

To test the deletion:

1. Upload a profile picture
2. Check server logs for deletion messages
3. Upload a new profile picture
4. Verify old picture is deleted in Supabase Storage
5. Check logs for success/failure messages

---

**Note:** The deletion happens **after** the new picture is uploaded, so even if deletion fails, the new picture is saved. This ensures users can always update their picture even if cleanup fails.

