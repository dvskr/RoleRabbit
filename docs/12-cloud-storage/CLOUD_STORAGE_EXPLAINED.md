# Cloud Storage Implementation - Complete Explanation

## 🎯 The Key Question: What Storage Does It Use?

**Answer: Your PostgreSQL database!** That's it. No external cloud services needed.

---

## 📊 How Cloud Storage Works

### The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
│                                                              │
│  Frontend (Next.js)                                         │
│    ↓ makes API calls                                        │
│  Backend API (Node.js + Fastify)                            │
│    ↓ uses Prisma ORM                                        │
│  PostgreSQL Database                                         │
│    ┌──────────────────────────────────────────┐            │
│    │  Tables:                                 │            │
│    │  • cloud_files                           │            │
│    │  • cloud_folders                         │            │
│    │  • file_shares                           │            │
│    │  • credentials                           │            │
│    └──────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Database Tables

#### 1. `cloud_files` Table
Stores all uploaded files:

```sql
CREATE TABLE cloud_files (
  id              VARCHAR  PRIMARY KEY,
  user_id         VARCHAR  REFERENCES users(id),
  name            VARCHAR  NOT NULL,
  type            VARCHAR,  -- resume, cover_letter, document, etc.
  size            INT,      -- file size in bytes
  content_type    VARCHAR,  -- application/pdf, image/jpeg, etc.
  data            TEXT,     -- ⭐ Base64 encoded file content
  folder_id       VARCHAR  REFERENCES cloud_folders(id),
  tags            VARCHAR,
  description     TEXT,
  is_public       BOOLEAN DEFAULT false,
  is_starred      BOOLEAN DEFAULT false,
  is_archived     BOOLEAN DEFAULT false,
  download_count  INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP
);
```

**Key Point:** The `data` column stores the actual file content as Base64-encoded text.

#### 2. `cloud_folders` Table
Stores folder structure:

```sql
CREATE TABLE cloud_folders (
  id         VARCHAR  PRIMARY KEY,
  user_id    VARCHAR  REFERENCES users(id),
  name       VARCHAR  NOT NULL,
  color      VARCHAR,
  parent_id  VARCHAR  REFERENCES cloud_folders(id), -- For nested folders
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 3. `file_shares` Table
Stores sharing permissions:

```sql
CREATE TABLE file_shares (
  id           VARCHAR  PRIMARY KEY,
  file_id      VARCHAR  REFERENCES cloud_files(id),
  user_id      VARCHAR  REFERENCES users(id), -- User being shared with
  user_email   VARCHAR,
  permission   VARCHAR,  -- view, comment, edit, admin
  granted_by   VARCHAR,
  expires_at   TIMESTAMP
);
```

#### 4. `credentials` Table
Stores professional credentials:

```sql
CREATE TABLE credentials (
  id                  VARCHAR  PRIMARY KEY,
  user_id             VARCHAR  REFERENCES users(id),
  credential_type     VARCHAR,  -- certification, license, visa, degree, badge
  issuer              VARCHAR,
  name                VARCHAR,
  issued_date         DATE,
  expiration_date     DATE,
  verification_status VARCHAR,
  qr_code             VARCHAR,
  created_at          TIMESTAMP,
  updated_at          TIMESTAMP
);
```

---

## 🔄 How Files Are Stored

### Upload Flow

```
1. User uploads file (PDF, image, etc.)
   ↓
2. Frontend sends file to: POST /api/files/upload
   ↓
3. Backend:
   - Validates file type & size (max 10MB)
   - Converts file to Base64 string
   - Saves to cloud_files table
   ↓
4. Database stores:
   {
     id: "abc123",
     name: "My-Resume.pdf",
     size: 245678,
     content_type: "application/pdf",
     data: "JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PC9U..." // Base64
   }
   ↓
5. Frontend receives success response
```

### Download Flow

```
1. User clicks download button
   ↓
2. Frontend requests: GET /api/cloud-files/:id
   ↓
3. Backend queries database
   ↓
4. Database returns file with Base64 data
   ↓
5. Backend decodes Base64
   ↓
6. Frontend creates Blob and triggers download
```

---

## 💾 Storage Methods

### Method 1: Base64 in Database (Current Implementation)
**Used For:** Small to medium files (< 10MB)

**How:**
```javascript
// Upload
const buffer = await data.toBuffer();  // File → Buffer
const base64 = buffer.toString('base64');  // Buffer → Base64 string

// Save to database
await prisma.cloudFile.create({
  data: {
    name: "file.pdf",
    size: buffer.length,
    data: base64  // Stored as TEXT in PostgreSQL
  }
});

// Download
const file = await prisma.cloudFile.findUnique({ where: { id } });
const buffer = Buffer.from(file.data, 'base64');  // Base64 → Buffer
// Send buffer to client
```

**Pros:**
- ✅ No external dependencies
- ✅ Easy to implement
- ✅ Works with any database
- ✅ Automatic backups included

**Cons:**
- ⚠️ 33% size overhead (Base64 encoding)
- ⚠️ Database bloat for large files
- ⚠️ Slower queries with large data

### Method 2: File System Storage (Not Implemented)
**Would Be Used For:** Large files (10MB+)

**How It Would Work:**
```javascript
// Upload
const buffer = await data.toBuffer();
const filename = `uploads/${userId}/${timestamp}-${originalName}`;
fs.writeFileSync(filename, buffer);

// Save file path to database
await prisma.cloudFile.create({
  data: {
    name: "file.pdf",
    size: buffer.length,
    data: filename  // Just the path!
  }
});

// Download
const file = await prisma.cloudFile.findUnique({ where: { id } });
const buffer = fs.readFileSync(file.data);
// Send buffer to client
```

**Pros:**
- ✅ No size overhead
- ✅ Faster database queries
- ✅ Better for large files
- ✅ Can use CDN easily

**Cons:**
- ⚠️ Requires file system management
- ⚠️ Backup complexity
- ⚠️ Deployment considerations

### Method 3: External Storage Services (Not Implemented)
**Would Be Used For:** Production scale

**Services:** AWS S3, Google Cloud Storage, Azure Blob, Cloudinary

**How It Would Work:**
```javascript
// Upload
const buffer = await data.toBuffer();
const s3Key = `users/${userId}/files/${timestamp}-${originalName}`;
await s3.putObject({
  Bucket: 'my-bucket',
  Key: s3Key,
  Body: buffer
});

// Save S3 reference to database
await prisma.cloudFile.create({
  data: {
    name: "file.pdf",
    size: buffer.length,
    data: s3Key  // S3 key/reference
  }
});

// Download
const file = await prisma.cloudFile.findUnique({ where: { id } });
const s3Object = await s3.getObject({ Bucket: 'my-bucket', Key: file.data });
// Send to client
```

**Pros:**
- ✅ Infinite scalability
- ✅ Built-in CDN
- ✅ Automatic backups
- ✅ Cost-effective

**Cons:**
- ⚠️ External API dependency
- ⚠️ Costs money
- ⚠️ More complex setup

---

## 🎬 Real Example

### User Uploads a Resume

```javascript
// 1. Frontend (User uploads "MyResume.pdf")
const formData = new FormData();
formData.append('file', file);

fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});

// 2. Backend receives file
const buffer = await data.toBuffer();
// buffer = <Buffer 25 50 44 46 2d ...> (binary PDF data)

const base64 = buffer.toString('base64');
// base64 = "JVBERi0xLjMKJeLjz9M..." (text representation)

// 3. Save to database
await prisma.cloudFile.create({
  data: {
    userId: "user_123",
    name: "MyResume.pdf",
    type: "resume",
    size: 245678,
    contentType: "application/pdf",
    data: base64  // Base64 string stored as TEXT
  }
});

// 4. Frontend shows success message
```

### User Downloads a File

```javascript
// 1. Frontend requests file
fetch('/api/cloud-files/abc123');

// 2. Backend queries database
const file = await prisma.cloudFile.findUnique({
  where: { id: "abc123" }
});
// file.data = "JVBERi0xLjMKJeLjz9M..."

// 3. Convert back to Buffer
const buffer = Buffer.from(file.data, 'base64');

// 4. Send to client
reply.type(file.contentType);
reply.send(buffer);

// 5. Frontend creates download
const blob = new Blob([buffer], { type: file.contentType });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = file.name;
link.click();
```

---

## 🔐 Security

### What's Protected

1. **Authentication:** All endpoints require JWT token
2. **Authorization:** Users can only access their own files
3. **Privacy:** `isPublic` flag controls visibility
4. **Sharing:** Controlled via `file_shares` table with permissions

### Example Security Flow

```javascript
// 1. User must be authenticated
const auth = await authenticate(request);  // Checks JWT
// ↓ If not authenticated: 401 Unauthorized

// 2. Check file ownership
const file = await prisma.cloudFile.findUnique({ where: { id } });
if (file.userId !== auth.userId) {
  // User doesn't own this file
  // But they might have access via sharing
  const share = await prisma.fileShare.findFirst({
    where: {
      fileId: id,
      userId: auth.userId
    }
  });
  
  if (!share) {
    throw new Error('Access denied');  // 403 Forbidden
  }
}

// 3. File access granted
return file;
```

---

## 🚀 Why This Approach?

### For Development/Testing
- ✅ **No setup needed** - just use PostgreSQL
- ✅ **Works immediately** - no API keys
- ✅ **Self-contained** - everything in one database
- ✅ **Easy debugging** - inspect database directly

### For Production (Consider Upgrading)
- 📈 Database storage gets expensive for large files
- 📈 Consider S3/Cloud Storage for files > 5MB
- 📈 Add CDN for faster global access
- 📈 Implement file system storage as intermediate step

---

## 📝 Summary

**Your Cloud Storage System Uses:**

1. **Storage:** PostgreSQL database TEXT fields
2. **Format:** Base64-encoded file contents
3. **Max Size:** 10MB per file (configurable)
4. **External Services:** NONE required
5. **API Keys:** NONE needed

**What You Get:**
- ✅ Full file management (upload, download, delete)
- ✅ Folder organization
- ✅ File sharing with permissions
- ✅ Credential tracking
- ✅ User isolation and security

**When to Upgrade:**
- 📊 When files exceed 10MB regularly
- 📊 When database storage costs exceed object storage
- 📊 When global CDN speeds are needed
- 📊 When you have thousands of users

---

## 🎯 Bottom Line

**Your cloud storage isn't really "cloud" storage** - it's **database-backed file storage**. The term "cloud" refers to:
- Stored on your server (not locally on user's device)
- Accessible from anywhere with internet
- Managed through a web interface
- Includes "cloud-like" features (folders, sharing, etc.)

Think of it as: **Dropbox functionality, but stored in your own database instead of Dropbox's servers.**

---

**Questions?** Check:
- [Cloud Storage Implementation](CLOUD_STORAGE_IMPLEMENTATION.md) - Technical details
- [API Keys Explained](../02-setup/API_KEYS_EXPLAINED.md) - What you need
- [API Reference](../03-api/api-reference.md) - All endpoints

