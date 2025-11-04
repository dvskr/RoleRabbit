# .env File Configuration Example

## Lines 1-12: Supabase Storage Configuration

Here's what your `.env` file should look like (at minimum for storage):

```env
# ============================================
# Supabase Storage Configuration
# ============================================
# Storage Type: 'supabase' (recommended) or 'local'
STORAGE_TYPE=supabase

# Supabase Project URL (same for Storage, Database, Auth, everything)
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co

# Supabase Service Role Key (from Settings → API → service_role key)
# This is a long JWT token starting with 'eyJ...'
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Storage Bucket Name
SUPABASE_STORAGE_BUCKET=roleready-file

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

---

## 📝 Complete .env File Example

Here's a complete example with all common variables:

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
# Supabase Storage Configuration
# ============================================
STORAGE_TYPE=supabase
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3hvaXJobm52Y29tb3B4Y2RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.your-actual-signature-here
SUPABASE_STORAGE_BUCKET=roleready-file
MAX_FILE_SIZE=10485760

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:3000
```

---

## 🔍 Where to Get Each Value

### Line 5: `STORAGE_TYPE`
- Always: `supabase`
- Location: Just type it

### Line 8: `SUPABASE_URL`
- Value: `https://oawxoirhnnvcomopxcdd.supabase.co`
- Location: **Supabase Dashboard → Settings → API → Project URL**

### Line 11: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Long JWT token starting with `eyJ...`
- Location: **Supabase Dashboard → Settings → API → service_role key**
- ⚠️ Keep this secret!

### Line 14: `SUPABASE_STORAGE_BUCKET`
- Value: `roleready-file` (your bucket name)
- Location: **Supabase Dashboard → Storage → Your bucket**

### Line 17: `MAX_FILE_SIZE`
- Value: `10485760` (10MB in bytes)
- Location: You set this

---

## ✅ Quick Copy-Paste Template

```env
STORAGE_TYPE=supabase
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE
SUPABASE_STORAGE_BUCKET=roleready-file
MAX_FILE_SIZE=10485760
```

Just replace `PASTE_YOUR_SERVICE_ROLE_KEY_HERE` with your actual Service Role Key from Settings → API.

---

## ⚠️ Important Notes

1. **Never commit `.env` to git!**
2. **Service Role Key** is secret - don't share it
3. **Bucket name** must match exactly (case-sensitive)
4. **No quotes needed** around values (unless they contain spaces)
5. **No trailing spaces** after values

---

That's it! These 4 variables (plus bucket name) are all you need for Supabase Storage.

