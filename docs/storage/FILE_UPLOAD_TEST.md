# File Upload Endpoint Testing Guide

## ✅ Upload Endpoint Implemented

**Endpoint:** `POST /api/storage/files/upload`  
**Authentication:** Required (JWT token)  
**Content-Type:** `multipart/form-data`

---

## 🧪 Testing the Upload Endpoint

### Using cURL

```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "displayName=My Resume" \
  -F "type=resume" \
  -F "description=My professional resume" \
  -F "isPublic=false"
```

### Using Postman

1. **Method:** POST
2. **URL:** `http://localhost:3001/api/storage/files/upload`
3. **Authorization:** 
   - Type: Bearer Token
   - Token: Your JWT token
4. **Body:** 
   - Type: `form-data`
   - Add fields:
     - `file` (File) - Select your file
     - `displayName` (Text) - Optional
     - `type` (Text) - Optional (default: 'document')
     - `description` (Text) - Optional
     - `isPublic` (Text) - Optional ('true' or 'false')
     - `folderId` (Text) - Optional

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('displayName', 'My Resume');
formData.append('type', 'resume');
formData.append('isPublic', 'false');

const response = await fetch('http://localhost:3001/api/storage/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}` // Or cookie if using httpOnly
  },
  credentials: 'include', // For cookies
  body: formData
});

const result = await response.json();
console.log('Upload result:', result);
```

---

## 📝 Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ Yes | The file to upload |
| `displayName` | String | No | Custom display name |
| `type` | String | No | File type (resume, template, document, etc.) |
| `description` | String | No | File description |
| `isPublic` | String | No | 'true' or 'false' (default: false) |
| `folderId` | String | No | Target folder ID |

---

## ✅ Success Response (201)

```json
{
  "success": true,
  "file": {
    "id": "file_1234567890_abc123",
    "name": "My Resume",
    "fileName": "resume.pdf",
    "type": "resume",
    "size": 245678,
    "storagePath": "userId/2024/01/uuid-timestamp.pdf",
    "publicUrl": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "storage": {
    "usedBytes": 5242880,
    "limitBytes": 5368709120,
    "usedGB": 0.005,
    "limitGB": 5,
    "percentage": 0.1
  }
}
```

---

## ❌ Error Responses

### 400 - Validation Error
```json
{
  "error": "File validation failed",
  "message": "File size (15.5MB) exceeds maximum allowed size of 10.0MB",
  "errors": ["File size exceeds limit"],
  "warnings": []
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "User ID not found in token"
}
```

### 403 - Quota Exceeded
```json
{
  "error": "Storage quota exceeded",
  "message": "Uploading this file would exceed your storage limit.",
  "storage": {
    "usedGB": "4.95",
    "limitGB": "5.00",
    "availableGB": "0.05",
    "fileSizeGB": "0.10"
  }
}
```

### 500 - Server Error
```json
{
  "error": "Upload failed",
  "message": "An error occurred while uploading the file"
}
```

---

## 🔍 Expected Behavior

1. **File Validation:**
   - ✅ Checks file type (extension + MIME type)
   - ✅ Checks file size (max 10MB default)
   - ✅ Sanitizes filename
   - ✅ Prevents dangerous files

2. **Storage Quota:**
   - ✅ Checks if upload would exceed quota
   - ✅ Creates quota record if missing
   - ✅ Updates quota after upload

3. **File Upload:**
   - ✅ Uploads to Supabase Storage
   - ✅ Organizes by user/date structure
   - ✅ Returns file metadata

4. **Response:**
   - ✅ Returns file info
   - ✅ Returns updated storage quota
   - ✅ Success status 201

---

## 🧪 Quick Test Steps

1. **Start your API server:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Get JWT token:**
   - Login via your auth endpoint
   - Copy the token from response

3. **Test upload:**
   ```bash
   curl -X POST http://localhost:3001/api/storage/files/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.pdf"
   ```

4. **Check response:**
   - Should return 201 with file info
   - Check Supabase Storage dashboard for uploaded file

---

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Endpoint registered at `/api/storage/files/upload`
- [ ] Authentication required (401 without token)
- [ ] File uploads successfully
- [ ] File appears in Supabase Storage
- [ ] Storage quota updates
- [ ] Response includes file metadata
- [ ] File validation works
- [ ] Quota check works

---

**Ready to test!** 🚀

