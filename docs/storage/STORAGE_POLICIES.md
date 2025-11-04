# Supabase Storage Policies Setup Guide

## 📋 Overview

Storage policies control who can upload, download, and manage files in your Supabase Storage bucket. This guide provides ready-to-use SQL policies for your `roleready-file` bucket.

---

## 🚀 Quick Setup

### Step 1: Go to Storage Policies

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Storage** → **Policies**
4. Click on your bucket: **`roleready-file`**
5. Click **"New Policy"** or go to **"Policies"** tab

### Step 2: Add Policies

Add each policy below. Supabase will help you create them through the UI, or you can use the SQL Editor.

---

## ✅ Required Policies

### Policy 1: Allow Authenticated Users to Upload Their Own Files

**Policy Name:** `Users can upload their own files`  
**Operation:** `INSERT`  
**Target Roles:** `authenticated`

**SQL Policy:**
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation:**
- Users can only upload files to their own folder
- Files are stored as: `{userId}/{year}/{month}/filename`
- Policy checks that the first folder matches the user's ID

---

### Policy 2: Allow Users to Read Their Own Files

**Policy Name:** `Users can read their own files`  
**Operation:** `SELECT`  
**Target Roles:** `authenticated`

**SQL Policy:**
```sql
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation:**
- Users can download/view files in their own folder
- Prevents access to other users' files

---

### Policy 3: Allow Users to Update Their Own Files

**Policy Name:** `Users can update their own files`  
**Operation:** `UPDATE`  
**Target Roles:** `authenticated`

**SQL Policy:**
```sql
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation:**
- Users can rename/replace files in their own folder
- Prevents modifying other users' files

---

### Policy 4: Allow Users to Delete Their Own Files

**Policy Name:** `Users can delete their own files`  
**Operation:** `DELETE`  
**Target Roles:** `authenticated`

**SQL Policy:**
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation:**
- Users can delete files from their own folder
- Prevents deleting other users' files

---

## 🔧 Alternative: Service Role Bypass (Simpler Setup)

If you're using **Service Role Key** in your backend (which bypasses RLS), you can simplify the policies:

### Option A: Public Upload (Not Recommended)

**Policy Name:** `Allow authenticated uploads`  
**Operation:** `INSERT`  
**Target Roles:** `authenticated`

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'roleready-file');
```

**Note:** This allows any authenticated user to upload anywhere in the bucket. Use with caution!

---

### Option B: Service Role Only (Recommended for Backend)

Since you're using **Service Role Key** in your backend:
- ✅ Service Role Key **bypasses all RLS policies**
- ✅ Backend can upload/download any file
- ✅ You control access through your backend code

**For this setup, you can use simpler policies:**

```sql
-- Allow authenticated users to read (if needed for direct access)
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📝 Recommended Policy Setup (Service Role Backend)

Since your backend uses Service Role Key (which bypasses RLS), here's the minimal setup:

### 1. Enable RLS on Storage Objects

First, ensure RLS is enabled:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 2. Add Read Policy (for direct file access if needed)

**Policy Name:** `Users can read their own files`  
**Operation:** `SELECT`  
**Target Roles:** `authenticated`

```sql
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Backend Access (Service Role)

Since your backend uses Service Role Key:
- ✅ No policies needed for backend operations
- ✅ Backend can upload/download/delete via Service Role
- ✅ RLS policies only apply to authenticated users (frontend direct access)

---

## 🎯 How to Add Policies in Supabase Dashboard

### Method 1: Using UI (Easier)

1. Go to **Storage** → **Policies**
2. Select bucket: **`roleready-file`**
3. Click **"New Policy"**
4. Choose template or **"Create policy from scratch"**
5. Fill in:
   - **Policy Name**: e.g., "Users can read their own files"
   - **Allowed Operation**: SELECT, INSERT, UPDATE, or DELETE
   - **Target Roles**: `authenticated`
   - **USING expression**: (the WHERE condition)
   - **WITH CHECK expression**: (for INSERT/UPDATE)
6. Click **"Save"**

### Method 2: Using SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Paste the SQL policy
3. Click **"Run"**

---

## ✅ Policy Checklist

For Service Role backend setup:

- [ ] RLS enabled on `storage.objects`
- [ ] Read policy: Users can read their own files (optional - only if frontend needs direct access)
- [ ] Backend uses Service Role Key (bypasses RLS) ✅ Already configured

**Note:** Since your backend uses Service Role Key, you don't need INSERT/UPDATE/DELETE policies - the backend bypasses RLS automatically.

---

## 🔒 Security Notes

1. **Service Role Key** bypasses all RLS policies
2. **Backend controls access** through your code (checking userId, etc.)
3. **RLS policies** protect direct frontend access (if users access files directly)
4. **File organization** (`userId/YYYY/MM/filename`) ensures user isolation

---

## 🧪 Testing Policies

After adding policies:

1. **Test backend upload** (uses Service Role):
   ```javascript
   // Your backend code - should work
   await storageHandler.upload(fileStream, userId, fileName, contentType);
   ```

2. **Test user access** (if you add read policy):
   - Try accessing file directly via URL
   - Should only work for user's own files

---

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"

**Solution:**
- Check policy conditions match your file path structure
- Ensure `userId` matches the folder name
- Verify policy is enabled and targeting correct bucket

### Backend uploads fail

**Solution:**
- Check you're using **Service Role Key** (not Anon Key)
- Service Role bypasses policies - should work without policies
- Check bucket name matches exactly

### Users can't access their files

**Solution:**
- Add SELECT policy for authenticated users
- Check file path structure matches policy conditions
- Verify `auth.uid()` matches folder structure

---

## 📚 Complete Policy Example

For a complete setup with all operations:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Upload policy
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Read policy
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Update policy
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete policy
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'roleready-file' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 💡 Recommendation for Your Setup

Since you're using **Service Role Key** in the backend:

**Minimal Setup:**
- ✅ Enable RLS (security best practice)
- ✅ Add SELECT policy (if frontend needs direct file access)
- ✅ Backend operations work without additional policies (Service Role bypasses RLS)

**This is the simplest and most secure setup!**

---

**Ready to add these policies?** Go to **Storage → Policies → `roleready-file` → New Policy** and add them one by one, or use the SQL Editor to run them all at once.

