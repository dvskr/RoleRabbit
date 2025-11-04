# Storage Handler - Quick Start

## ✅ Created Files

1. **`apps/api/utils/storageHandler.js`** - Main storage handler
   - Uses Supabase Storage for both development and production (recommended)
   - Falls back to local filesystem if Supabase not configured
   - Automatic initialization

2. **`apps/api/utils/storageValidation.js`** - File validation
   - File type validation
   - Size limits
   - Security checks
   - Filename sanitization

3. **`docs/storage/SUPABASE_STORAGE_SETUP.md`** - Setup guide

---

## 🚀 Quick Start

### 1. Install Package (✅ Done)
```bash
npm install @supabase/supabase-js
```

### 2. Set Up Supabase Storage Bucket
1. Go to Supabase Dashboard
2. Create bucket: `roleready-files`
3. Copy your credentials

### 3. Configure Environment
Add to `apps/api/.env` (same config for dev and production):
```env
STORAGE_TYPE=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=roleready-files
MAX_FILE_SIZE=10485760  # 10MB
```

**💡 Tip:** Same configuration works for both development and production!

### 4. Use in Routes
```javascript
const storageHandler = require('./utils/storageHandler');

// Upload
const result = await storageHandler.upload(
  fileStream.file,
  userId,
  fileStream.filename,
  fileStream.mimetype
);

// Download
const fileStream = await storageHandler.download(storagePath);

// Delete
await storageHandler.deleteFile(storagePath);
```

---

## 📁 Supported File Types

✅ **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV  
✅ **Images**: PNG, JPG, JPEG, GIF, WebP, SVG  
✅ **Archives**: ZIP, RAR, 7Z  
✅ **Other**: JSON, XML, HTML  

---

## 🔧 Features

- ✅ **Unified Storage** - Supabase Storage for both dev and production
- ✅ **Automatic Fallback** - Falls back to local if Supabase not configured
- ✅ **File Validation** - Type, size, and security checks
- ✅ **Organized Structure** - Files organized by user/date automatically
- ✅ **Signed URLs** - Secure file sharing with expiration
- ✅ **Error Handling** - Graceful fallbacks and logging
- ✅ **Security** - Path sanitization, permission checks
- ✅ **CDN Included** - Fast file delivery via Supabase CDN

---

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_STORAGE_SETUP.md)** - Complete setup instructions
- **[Storage Handler Code](../apps/api/utils/storageHandler.js)** - Implementation details
- **[Validation Code](../apps/api/utils/storageValidation.js)** - Validation logic

---

**Ready to use!** 🎉

