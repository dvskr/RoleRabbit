# Supabase Storage Setup Guide

Yes! **Supabase Storage is perfect for file storage** (PDFs, JPGs, DOCX, etc.). This guide shows you how to set it up for **both development and production**.

---

## ✅ Why Supabase Storage?

- **Built-in Object Storage** - Similar to AWS S3, but easier to use
- **Integrated with Supabase** - Uses same credentials as your database
- **Free Tier** - 1GB free storage included (perfect for development!)
- **CDN Included** - Fast file delivery worldwide
- **Simple API** - Easy upload/download via JavaScript SDK
- **Security Built-in** - Row-level security policies for files
- **Works Everywhere** - Use the same storage for dev and production

---

## 📦 Installation

### 1. Install Supabase JavaScript Client

```bash
cd apps/api
npm install @supabase/supabase-js
```

This package is already included in the storage handler, but you need to install it.

---

## 🔧 Supabase Dashboard Setup

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure:
   - **Name**: `roleready-file`
   - **Public bucket**: `No` (recommended for security - files require authentication)
   - **File size limit**: 10MB (or your preference)
   - **Allowed MIME types**: Leave empty for all types, or specify:
     ```
     application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg
     ```
6. Click **"Create bucket"**

### Step 2: Set Up Bucket Policies (Row-Level Security)

1. Click on your `roleready-files` bucket
2. Go to **"Policies"** tab
3. Create policies for file access:

#### Policy 1: Allow Authenticated Users to Upload
```sql
-- Policy Name: "Allow authenticated uploads"
-- Operation: INSERT
-- Target roles: authenticated
s
(user_id() = (storage.folders(name)).owner_id)
```

#### Policy 2: Allow Users to Read Their Own Files
```sql
-- Policy Name: "Users can read their own files"
-- Operation: SELECT
-- Target roles: authenticated

bucket_id = 'roleready-files' AND auth.uid()::text = (storage.objects(name)).owner
```

#### Policy 3: Allow Users to Update Their Own Files
```sql
-- Policy Name: "Users can update their own files"
-- Operation: UPDATE
-- Target roles: authenticated

auth.uid()::text = (storage.objects(name)).owner
```

#### Policy 4: Allow Users to Delete Their Own Files
```sql
-- Policy Name: "Users can delete their own files"
-- Operation: DELETE
-- Target roles: authenticated

auth.uid()::text = (storage.objects(name)).owner
```

**Note:** For simpler setup, you can use **"Service Role"** key instead, which bypasses RLS. This is what the storage handler uses.

---

## 🔑 Get Your Supabase Credentials

### Option 1: Supabase JavaScript SDK (Recommended - What We're Using)

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co` (e.g., `https://oawxoirhnnvcomopxcdd.supabase.co`)
   - **Service Role Key**: (Keep this secret! Used for backend operations)
   - **Anon Key**: (Public key, safe for frontend)

**Note:** The storage handler uses the JavaScript SDK, so you need the Project URL and Service Role Key, NOT the S3 access keys.

### Option 2: S3-Compatible Access Keys

If you see **Access Keys** in the Storage settings:
- These are for S3-compatible API access (different from what our handler uses)
- Storage Endpoint: `https://oawxoirhnnvcomopxcdd.storage.supabase.co/storage/v1/s3`
- Access Key ID: `a5f750a866c6d895fc440eecf7b4604d`
- **Secret Access Key**: (You need to get this when creating the key)

**Important:** Our current implementation uses Option 1 (JavaScript SDK). If you want to use S3-compatible access, the storage handler would need to be updated to use AWS SDK instead.

---

## ⚙️ Environment Configuration

Add these to your `.env` file in `apps/api/`:

```env
# Storage Configuration
# Use Supabase Storage for both development and production (recommended)
STORAGE_TYPE=supabase

# Supabase Storage (same credentials for dev and prod)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=roleready-files

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
```

**⚠️ Important:**
- Use **Service Role Key** for backend (has full access, bypasses RLS)
- Use **Anon Key** only for frontend if you want client-side uploads
- Never commit `.env` file to git!
- **Same bucket works for dev and production** - files are organized by user ID automatically

---

## 📁 Supported File Types

The storage handler supports these file types:

### Documents
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- PowerPoint (`.ppt`, `.pptx`)
- Text (`.txt`, `.csv`, `.rtf`)

### Images
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

### Archives
- ZIP (`.zip`)
- RAR (`.rar`)
- 7Z (`.7z`)

### Other
- JSON (`.json`)
- XML (`.xml`)
- HTML (`.html`)

---

## 🚀 How It Works

### Upload Flow

1. **User uploads file** → Fastify receives multipart form data
2. **Validation** → File type, size, and security checks
3. **Supabase Upload** → File stored in `roleready-files` bucket
4. **Database Entry** → File metadata saved in PostgreSQL
5. **Response** → File info returned to frontend

### Download Flow

1. **User requests file** → API endpoint `/api/storage/files/:id/download`
2. **Permission Check** → Verify user has access
3. **Supabase Download** → Fetch file from bucket
4. **Stream Response** → Send file to user

### File Organization

Files are organized in Supabase Storage like this:
```
roleready-files/
  ├── user-id-1/
  │   ├── 2024/
  │   │   ├── 01/
  │   │   │   ├── uuid-timestamp.pdf
  │   │   │   └── uuid-timestamp.jpg
  │   │   └── 02/
  └── user-id-2/
      └── 2024/
          └── 01/
```

This organization:
- ✅ Prevents file conflicts
- ✅ Easy to manage user quotas
- ✅ Simple cleanup per user
- ✅ Organized by date

---

## 🔒 Security Features

### Built-in Security

1. **Authentication Required** - Only authenticated users can upload/download
2. **User Isolation** - Users can only access their own files
3. **File Validation** - Type and size checks before upload
4. **Path Sanitization** - Prevents directory traversal attacks
5. **Signed URLs** - Temporary access links for sharing

### Public vs Private Files

- **Private Files** (Default): Require authentication to access
- **Public Files**: Can be accessed via public URL (if bucket is public)

For RoleReady, we recommend keeping files private and using signed URLs for sharing.

---

## 🧪 Testing

### Test Upload

```javascript
// In your route handler
const storageHandler = require('./utils/storageHandler');

// Upload test
const fileStream = request.file();
const result = await storageHandler.upload(
  fileStream.file,
  userId,
  fileStream.filename,
  fileStream.mimetype
);

console.log('File uploaded:', result.path);
```

### Test Download

```javascript
const fileData = await storageHandler.download(storagePath);
// fileData is a stream - pipe to response
```

---

## 📊 Storage Limits

### Supabase Free Tier
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **File Size Limit**: 50MB per file

### Supabase Pro Tier
- **Storage**: 100GB (scales up)
- **Bandwidth**: 200GB/month
- **File Size Limit**: 50MB per file (can be increased)

---

## 💡 Development vs Production

**Same Setup for Both!**

Supabase Storage works perfectly for both development and production:

- ✅ **Development**: Free tier (1GB) is more than enough
- ✅ **Production**: Scales automatically, same configuration
- ✅ **Same Bucket**: Files are organized by user ID, so dev and prod data stay separate
- ✅ **Easy Testing**: Real file uploads/downloads in development
- ✅ **No Code Changes**: Same code works everywhere

**No need to switch storage types** - just use Supabase Storage for everything!

---

## 🔄 Migration from Local to Supabase

If you were previously using local storage:

1. ✅ **Install Supabase client**: `npm install @supabase/supabase-js` (already done!)
2. **Set up bucket** in Supabase Dashboard (see Step 1 above)
3. **Add environment variables** (see above)
4. **Change `STORAGE_TYPE`** from `local` to `supabase` (or remove it - defaults to supabase)
5. **That's it!** The handler automatically uses Supabase now.

**Note:** Existing local files can stay - they won't conflict. The handler will use Supabase for new uploads.

---

## 🐛 Troubleshooting

### Error: "Supabase Storage credentials not found"

**Solution:** Check your `.env` file has:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

### Error: "Bucket not found"

**Solution:** 
1. Go to Supabase Dashboard
2. Check bucket name matches `SUPABASE_STORAGE_BUCKET`
3. Ensure bucket exists and is accessible

### Error: "Permission denied"

**Solution:**
1. Check you're using **Service Role Key** (not Anon Key)
2. Verify bucket policies allow your operations
3. For testing, you can temporarily make bucket public

### Files Not Appearing

**Solution:**
1. Check Supabase Dashboard → Storage → Your bucket
2. Verify files are uploaded to correct path
3. Check file permissions in database

---

## 📚 Additional Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-from)
- [Row-Level Security for Storage](https://supabase.com/docs/guides/storage/security/access-control)

---

## ✅ Checklist

- [ ] Installed `@supabase/supabase-js` package
- [ ] Created `roleready-files` bucket in Supabase
- [ ] Set up bucket policies (if using RLS)
- [ ] Added environment variables to `.env`
- [ ] Tested file upload
- [ ] Tested file download
- [ ] Verified file organization structure

---

**That's it!** Your storage handler is ready to use Supabase Storage. The handler automatically falls back to local storage if Supabase isn't configured, making development easier.

