# Storage Upload Diagnostic Check

## 🔍 Step-by-Step Diagnosis

### Step 1: Verify Route is Registered

After restarting server, you should see:
```
📁 Storage routes registered: /api/storage/*
   → POST /api/storage/files/upload
✅ Supabase Storage initialized with bucket: roleready-files
```

### Step 2: Test Storage Connection

Open in browser or use curl:
```
GET http://localhost:3001/api/storage/test
```

Should return:
```json
{
  "success": true,
  "message": "Storage routes are working",
  "storageType": "supabase",
  "supabaseBucket": "roleready-files"
}
```

If this fails, storage isn't initialized.

### Step 3: Check Bucket Name

**CRITICAL:** Make sure your bucket name matches in:
- `.env` file: `SUPABASE_STORAGE_BUCKET=roleready-files`
- Supabase Dashboard: Storage bucket name

**Common Issues:**
- Bucket name mismatch (e.g., `roleready-file` vs `roleready-files`)
- Bucket doesn't exist in Supabase
- Bucket exists but policies aren't set

### Step 4: Verify Environment Variables

Check these are set in `apps/api/.env`:
```env
STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=roleready-files
```

### Step 5: Check Supabase Bucket

In Supabase Dashboard:
1. Go to **Storage** → **Buckets**
2. Verify bucket `roleready-files` exists
3. Check bucket is **public** OR policies allow service role access
4. Verify policies are applied (see `STORAGE_POLICIES.md`)

### Step 6: Test Upload with Logs

When you try to upload, check server logs for:
```
📤 File upload request received: POST /api/storage/files/upload
📤 File upload initiated by user: <userId>
Uploading file: <filename> for user: <userId>
File size: <size> bytes, Content-Type: <type>
```

If you see these logs, the route is working and file is being processed.
If upload fails after this, it's a Supabase connection issue.

---

## ❌ Common Errors

### Error: "Not Found" (404)
- **Cause:** Route not registered or server not restarted
- **Fix:** Restart API server and check for route registration logs

### Error: "Supabase upload failed: Bucket not found"
- **Cause:** Bucket name mismatch or bucket doesn't exist
- **Fix:** 
  1. Check bucket name in `.env` matches Supabase Dashboard
  2. Create bucket in Supabase if it doesn't exist
  3. Restart server

### Error: "Supabase upload failed: new row violates row-level security policy"
- **Cause:** Storage policies not set
- **Fix:** Run SQL policies from `STORAGE_POLICIES.md` in Supabase SQL Editor

### Error: "Storage upload returned invalid result"
- **Cause:** Upload succeeded but returned unexpected format
- **Fix:** Check storage handler is returning correct object structure

---

## ✅ Quick Fix Checklist

1. [ ] Restarted API server after adding routes
2. [ ] Route registration logs appear on startup
3. [ ] `/api/storage/test` endpoint returns success
4. [ ] Bucket name in `.env` matches Supabase Dashboard
5. [ ] Bucket exists in Supabase Storage
6. [ ] Storage policies are set (if using RLS)
7. [ ] Service Role Key is correct (not Anon Key)
8. [ ] Supabase URL is correct format: `https://xxx.supabase.co`

---

**Most likely issue: Bucket name mismatch or bucket doesn't exist!**

