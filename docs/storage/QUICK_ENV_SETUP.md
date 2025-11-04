# Quick .env Configuration for Supabase Storage

## ✅ What You Need (JavaScript SDK Method)

Based on your Supabase project, here's what to add to `apps/api/.env`:

```env
# Storage Configuration
STORAGE_TYPE=supabase

# Supabase Storage (Get these from Settings → API, NOT from Access Keys)
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=roleready-file
```

---

## 🔑 Where to Get These Values

### 1. SUPABASE_URL
- Project URL: `https://oawxoirhnnvcomopxcdd.supabase.co`
- Found in: **Settings → API → Project URL**
- ✅ **Same URL for Storage, Database, Auth, Everything!**
- The JavaScript SDK automatically routes to storage
- You don't need a separate storage URL

### 2. SUPABASE_SERVICE_ROLE_KEY
- Go to: **Settings → API**
- Look for **"Project API keys"** section
- Copy the **`service_role`** key (the long JWT token starting with `eyJ...`)
- ⚠️ This is NOT the S3 Access Key ID - it's a completely different key!

**What it looks like:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3hvaXJobm52Y29tb3B4Y2RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.your-signature
```

**Characteristics:**
- Very long (200+ characters)
- Starts with `eyJ`
- Has dots (.) separating three parts
- JWT token format

### 3. SUPABASE_STORAGE_BUCKET
- Your bucket name: `roleready-file`
- Found in: **Storage → Your bucket name**

---

## ⚠️ Important: S3 Access Keys vs JavaScript SDK

**What you saw (S3 Access Keys):**
- Storage Endpoint: `https://oawxoirhnnvcomopxcdd.storage.supabase.co/storage/v1/s3`
- Access Key ID: `a5f750a866c6d895fc440eecf7b4604d`
- ❌ **These are NOT needed** for our implementation

**What we actually use (JavaScript SDK):**
- ✅ Project URL (`SUPABASE_URL`)
- ✅ Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) - from API settings
- ✅ Bucket name (`SUPABASE_STORAGE_BUCKET`)

---

## 📝 Complete Example

```env
# ============================================
# Storage Configuration
# ============================================
STORAGE_TYPE=supabase

# Supabase Storage
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3hvaXJobm52Y29tb3B4Y2RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.YOUR_ACTUAL_KEY_HERE
SUPABASE_STORAGE_BUCKET=roleready-file

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
```

---

## 🧪 Verify It's Working

After adding to `.env`, restart your server:

```bash
cd apps/api
npm run dev
```

Look for this in the logs:
```
✅ Supabase Storage initialized with bucket: roleready-file
```

If you see this instead:
```
⚠️ Supabase Storage credentials not found. Falling back to local storage.
```

Double-check:
1. All three variables are set
2. Service Role Key is complete (very long string starting with `eyJ...`)
3. Bucket name matches exactly: `roleready-file`

---

## 💡 Quick Reference

| What You Need | Where to Find It | Example |
|--------------|------------------|---------|
| `SUPABASE_URL` | Settings → API → Project URL | `https://oawxoirhnnvcomopxcdd.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key | `eyJhbGci...` (long JWT) |
| `SUPABASE_STORAGE_BUCKET` | Storage → Bucket name | `roleready-file` |

**NOT needed:**
- ❌ S3 Storage Endpoint
- ❌ Access Key ID  
- ❌ Secret Access Key

---

That's it! The S3 access keys you saw are for a different API method (S3-compatible), but we're using the simpler JavaScript SDK which only needs the three values above.

