# Environment Configuration for Supabase Storage

## ✅ Quick Setup

Add these to your `apps/api/.env` file:

```env
# ============================================
# Storage Configuration
# ============================================
STORAGE_TYPE=supabase

# Supabase Storage (JavaScript SDK Method)
# Get these from: Supabase Dashboard → Settings → API
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=roleready-file

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

---

## 🔑 Where to Get Credentials

### 1. Supabase Project URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL**: `https://oawxoirhnnvcomopxcdd.supabase.co`

### 2. Service Role Key

1. Same page: **Settings** → **API**
2. Copy the **service_role** key (NOT the anon key)
3. ⚠️ **Keep this secret!** This key bypasses Row-Level Security

### 3. Storage Bucket Name

1. Go to **Storage** in the left sidebar
2. Your bucket name (e.g., `roleready-file`)

---

## 📝 Complete .env Example

```env
# ============================================
# Node.js API Configuration
# ============================================
PORT=3001
NODE_ENV=development

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://postgres:password@db.oawxoirhnnvcomopxcdd.supabase.co:5432/postgres

# ============================================
# Storage Configuration
# ============================================
STORAGE_TYPE=supabase

# Supabase Storage
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3hvaXJobm52Y29tb3B4Y2RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.your-actual-key-here
SUPABASE_STORAGE_BUCKET=roleready-file

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
```

---

## ⚠️ Important Notes

### About S3-Compatible Access Keys

If you see **Access Keys** in Storage settings:
- **Storage Endpoint**: `https://oawxoirhnnvcomopxcdd.storage.supabase.co/storage/v1/s3`
- **Access Key ID**: `a5f750a866c6d895fc440eecf7b4604d`

**These are NOT needed** for our current implementation. The storage handler uses the Supabase JavaScript SDK, which requires:
- ✅ Project URL (`SUPABASE_URL`)
- ✅ Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
- ✅ Bucket Name (`SUPABASE_STORAGE_BUCKET`)

**Not needed:**
- ❌ S3 Storage Endpoint
- ❌ Access Key ID
- ❌ Secret Access Key

### If You Want S3-Compatible Access

If you prefer to use S3-compatible API (requires AWS SDK):
1. You'd need to update `storageHandler.js` to use `@aws-sdk/client-s3`
2. Use the S3 endpoint and access keys instead
3. Not recommended - JavaScript SDK is simpler

---

## 🧪 Testing Your Configuration

After adding to `.env`, restart your server and check logs:

```bash
cd apps/api
npm run dev
```

You should see:
```
✅ Supabase Storage initialized with bucket: roleready-file
```

If you see:
```
⚠️ Supabase Storage credentials not found. Falling back to local storage.
```

Check:
1. ✅ All three variables are set correctly
2. ✅ No typos in variable names
3. ✅ Service Role Key is complete (very long string)
4. ✅ Bucket name matches exactly

---

## 🔒 Security

- **Never commit `.env` to git!**
- Add `.env` to `.gitignore`
- Use `.env.example` or `.env.sample` for reference
- Service Role Key has full access - keep it secret!

---

## 📚 Related Documentation

- [Supabase Storage Setup Guide](./SUPABASE_STORAGE_SETUP.md)
- [Storage Handler Implementation](../apps/api/utils/storageHandler.js)

