# File Upload Validation Guide

## Overview

This guide documents the file upload validation system implemented in RoleRabbit. The system provides comprehensive security validation for file uploads, preventing malicious files, validating file types and sizes, and ensuring data integrity.

## Table of Contents

- [Why Validate File Uploads?](#why-validate-file-uploads)
- [Validation Features](#validation-features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Security Considerations](#security-considerations)

---

## Why Validate File Uploads?

### Security Risks Without Validation

1. **Malicious File Upload** - Attackers can upload executable files (.exe, .sh) that could compromise the server
2. **Resource Exhaustion** - Large files can consume bandwidth and storage
3. **File Type Exploits** - Incorrect file types can cause parsing errors or crashes
4. **DOS Attacks** - Uploading many large files can overwhelm the system
5. **Data Corruption** - Invalid files can break functionality

### Impact

- **Data breach** - Malicious files could steal sensitive data
- **Server compromise** - Executable files could gain system access
- **Service disruption** - Large files could exhaust resources
- **User experience** - Invalid files cause errors and confusion

---

## Validation Features

### 1. File Type Validation

**Extension Check:**
- Validates file extension matches allowed types
- Case-insensitive matching
- Prevents dangerous extensions (.exe, .sh, .bat, etc.)

**MIME Type Check:**
- Validates file's reported MIME type
- Warns if MIME type doesn't match extension
- Supports PDF, DOC, DOCX, TXT

**File Signature Validation:**
- Reads actual file bytes (magic bytes)
- Verifies file content matches extension
- Detects file type spoofing
- Supported signatures:
  - PDF: `%PDF` (0x25 0x50 0x44 0x46)
  - DOC: OLE Compound File (0xD0 0xCF...)
  - DOCX: ZIP archive (0x50 0x4B...)
  - TXT: Printable ASCII text

### 2. File Size Validation

- **Maximum size:** 10 MB (configurable)
- **Minimum size:** 1 KB (prevents empty files)
- User-friendly size formatting (e.g., "2.5 MB")

### 3. Filename Validation

- **Length limit:** 255 characters (filesystem max)
- **Path traversal prevention:** Blocks `../` and `\`
- **Null byte detection:** Prevents null byte injection
- **Control character removal:** Strips dangerous characters
- **Sanitization:** Automatically cleans filenames

### 4. Security Checks

- **Dangerous extension blocking:** Prevents .exe, .bat, .sh, .js, etc.
- **Content verification:** Reads file bytes to verify type
- **Error handling:** Catches and reports validation errors
- **Logging:** Tracks validation failures for security monitoring

---

## Quick Start

### Basic Usage

```tsx
import { validateResumeFile } from '@/utils/fileValidation';

async function handleFileUpload(file: File) {
  // Validate the file
  const result = await validateResumeFile(file);

  if (!result.valid) {
    // Show errors to user
    alert(result.errors.join('\n'));
    return;
  }

  // File is valid, proceed with upload
  uploadFile(file);
}
```

### In React Component

```tsx
import { validateResumeFile } from '@/utils/fileValidation';
import { useState } from 'react';

function FileUpload() {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidating(true);
    setErrors([]);

    try {
      const result = await validateResumeFile(file, {
        checkContent: true, // Verify file signature
      });

      if (!result.valid) {
        setErrors(result.errors);
        return;
      }

      // File is valid
      await uploadFile(file);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      {errors.length > 0 && (
        <div className="error">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      <input
        type="file"
        onChange={handleFileChange}
        disabled={isValidating}
        accept=".pdf,.doc,.docx"
      />

      {isValidating && <p>Validating file...</p>}
    </div>
  );
}
```

---

## API Reference

### Main Functions

#### `validateResumeFile(file, options?)`

Comprehensive validation for resume file uploads.

**Parameters:**
- `file: File | null | undefined` - File to validate
- `options?: FileValidationOptions` - Validation options

**Options:**
```tsx
interface FileValidationOptions {
  maxSize?: number;          // Max file size in bytes (default: 10 MB)
  minSize?: number;          // Min file size in bytes (default: 1 KB)
  allowedTypes?: string[];   // Allowed MIME types
  allowedExtensions?: string[]; // Allowed extensions
  checkContent?: boolean;    // Verify file signature (default: true)
}
```

**Returns:** `Promise<FileValidationResult>`
```tsx
interface FileValidationResult {
  valid: boolean;            // Whether file passed validation
  errors: string[];          // Array of error messages
  warnings: string[];        // Array of warning messages
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}
```

**Example:**
```tsx
const result = await validateResumeFile(file, {
  maxSize: 5 * 1024 * 1024, // 5 MB
  checkContent: true,
});

if (result.valid) {
  console.log('File is valid:', result.fileInfo);
} else {
  console.error('Validation errors:', result.errors);
}
```

#### `validateMultipleFiles(files, options?)`

Validate multiple files at once.

**Parameters:**
- `files: File[]` - Array of files
- `options?: FileValidationOptions` - Same as validateResumeFile

**Returns:** `Promise<FileValidationResult[]>`

**Example:**
```tsx
const files = Array.from(fileInput.files || []);
const results = await validateMultipleFiles(files);

results.forEach((result, index) => {
  if (!result.valid) {
    console.error(`File ${index} invalid:`, result.errors);
  }
});
```

### Utility Functions

#### `formatFileSize(bytes)`

Format file size for display.

```tsx
formatFileSize(1024);        // "1 KB"
formatFileSize(1536);        // "1.5 KB"
formatFileSize(1048576);     // "1 MB"
formatFileSize(10485760);    // "10 MB"
```

#### `getFileExtension(filename)`

Extract file extension.

```tsx
getFileExtension('resume.pdf');      // ".pdf"
getFileExtension('document.docx');   // ".docx"
getFileExtension('noextension');     // ""
```

#### `sanitizeFilename(filename)`

Clean filename for safe storage.

```tsx
sanitizeFilename('../../../etc/passwd');  // "etcpasswd"
sanitizeFilename('file\0name.pdf');       // "filename.pdf"
sanitizeFilename('my resume.pdf');        // "my resume.pdf"
```

#### `isValidExtension(filename, allowedExtensions)`

Check if file extension is allowed.

```tsx
isValidExtension('resume.pdf', ['.pdf', '.doc']);  // true
isValidExtension('resume.exe', ['.pdf', '.doc']);  // false
```

#### `isDangerousExtension(filename)`

Check if extension is dangerous.

```tsx
isDangerousExtension('resume.pdf');  // false
isDangerousExtension('virus.exe');   // true
isDangerousExtension('script.sh');   // true
```

#### `validateFileSignature(file)`

Verify file content matches type.

```tsx
const result = await validateFileSignature(file);
// {
//   valid: true,
//   detectedType: 'application/pdf'
// }
```

---

## Validation Rules

### Allowed File Types

| Format | Extension | MIME Type | Max Size |
|--------|-----------|-----------|----------|
| PDF | .pdf | application/pdf | 10 MB |
| Word 97-2003 | .doc | application/msword | 10 MB |
| Word 2007+ | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | 10 MB |
| Plain Text | .txt | text/plain | 10 MB |

### Blocked File Types

These extensions are NEVER allowed:

| Type | Extensions |
|------|------------|
| Executables | .exe, .bat, .cmd, .com, .scr, .msi, .app |
| Scripts | .js, .vbs, .sh, .ps1 |
| Archives | .jar, .deb, .rpm |

### Size Limits

- **Minimum:** 1 KB (1,024 bytes)
- **Maximum:** 10 MB (10,485,760 bytes)
- **Configurable:** Can be adjusted per use case

### Filename Rules

- **Maximum length:** 255 characters
- **Prohibited characters:** `\0` (null byte), `/`, `\`, `..`
- **Control characters:** Automatically removed
- **Unicode:** Supported (UTF-8)

---

## Error Handling

### Common Errors

#### "File size exceeds maximum allowed size"

**Cause:** File is larger than 10 MB

**Solution:**
- Compress the file
- Use a different format
- Split into multiple files

#### "Invalid file extension"

**Cause:** File extension not in allowed list

**Solution:**
- Convert to PDF, DOC, or DOCX
- Ensure file has correct extension

#### "Dangerous file type detected"

**Cause:** File has executable extension (.exe, .bat, etc.)

**Solution:**
- Do not upload executable files
- Use document formats only

#### "File type could not be verified"

**Cause:** File signature doesn't match any known type

**Solution:**
- File may be corrupted
- Convert to standard format
- Try re-saving the file

#### "Filename contains invalid path characters"

**Cause:** Filename has `..`, `/`, or `\`

**Solution:**
- Rename file to remove path characters
- File will be automatically sanitized

### Handling Validation Results

```tsx
const result = await validateResumeFile(file);

if (!result.valid) {
  // Critical errors - file rejected
  result.errors.forEach(error => {
    console.error('❌', error);
  });

  // Don't proceed with upload
  return;
}

if (result.warnings.length > 0) {
  // Non-critical warnings - file accepted but flagged
  result.warnings.forEach(warning => {
    console.warn('⚠️', warning);
  });

  // Proceed with upload (warnings don't block)
}

// File is valid
console.log('✅ File valid:', result.fileInfo);
```

---

## Best Practices

### 1. Always Validate on Frontend AND Backend

```tsx
// ✅ GOOD - Validate on both sides
// Frontend (for UX)
const frontendResult = await validateResumeFile(file);
if (!frontendResult.valid) {
  showError(frontendResult.errors);
  return;
}

// Backend (for security)
app.post('/upload', async (req, res) => {
  const backendResult = await validateResumeFile(req.file);
  if (!backendResult.valid) {
    return res.status(400).json({ errors: backendResult.errors });
  }
  // Process file
});
```

### 2. Show Clear Error Messages

```tsx
// ✅ GOOD - User-friendly errors
{errors.map(error => (
  <div className="error">
    <AlertCircle /> {error}
  </div>
))}

// ❌ BAD - Generic error
<div>File upload failed</div>
```

### 3. Provide File Requirements Upfront

```tsx
// ✅ GOOD - Show requirements before upload
<div className="info">
  <h4>File Requirements:</h4>
  <ul>
    <li>Formats: PDF, DOC, DOCX</li>
    <li>Maximum size: 10 MB</li>
    <li>File will be validated for security</li>
  </ul>
</div>

<input type="file" ... />
```

### 4. Disable Input During Validation

```tsx
// ✅ GOOD - Prevent multiple uploads
<input
  type="file"
  onChange={handleFileChange}
  disabled={isValidating}
/>

{isValidating && <Spinner />}
```

### 5. Log Validation Failures

```tsx
// ✅ GOOD - Track security issues
if (!result.valid) {
  logger.warn('File validation failed:', {
    filename: file.name,
    errors: result.errors,
    userAgent: navigator.userAgent,
  });
}
```

### 6. Sanitize Filenames Before Storage

```tsx
import { sanitizeFilename } from '@/utils/fileValidation';

// ✅ GOOD - Clean filename
const safeFilename = sanitizeFilename(file.name);
await storage.save(safeFilename, fileData);

// ❌ BAD - Use original filename
await storage.save(file.name, fileData); // Path traversal risk!
```

---

## Security Considerations

### 1. File Signature Verification

Always use `checkContent: true` to verify file signatures:

```tsx
// ✅ SECURE - Verify actual file content
await validateResumeFile(file, { checkContent: true });

// ❌ INSECURE - Only check extension (easily spoofed)
await validateResumeFile(file, { checkContent: false });
```

### 2. Backend Validation is Required

Frontend validation is for UX only. Backend MUST validate again:

```tsx
// Frontend (can be bypassed)
const valid = await validateResumeFile(file);

// Backend (REQUIRED - cannot be bypassed)
app.post('/upload', validateUpload, async (req, res) => {
  // Validate here too!
});
```

### 3. Store Files Outside Web Root

```tsx
// ✅ SECURE - Store outside public directory
const uploadDir = '/var/uploads/resumes'; // Not accessible via web

// ❌ INSECURE - Public directory
const uploadDir = './public/uploads'; // Directly accessible!
```

### 4. Use Random Filenames

```tsx
// ✅ SECURE - Random UUID + sanitized original name
const safeFilename = `${crypto.randomUUID()}_${sanitizeFilename(file.name)}`;

// ❌ INSECURE - Use original filename
const filename = file.name; // User can control this!
```

### 5. Limit Upload Rate

```tsx
// Implement rate limiting
app.use('/upload', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
}));
```

### 6. Scan Files for Malware

```tsx
// Use antivirus scanning service
import { scanFile } from '@/services/antivirus';

const scanResult = await scanFile(file);
if (scanResult.infected) {
  throw new Error('Malware detected');
}
```

---

## Testing

### Manual Testing

Test with these scenarios:

```tsx
// Valid files
✅ resume.pdf (2 MB, valid PDF)
✅ document.docx (500 KB, valid DOCX)
✅ cover-letter.doc (100 KB, valid DOC)

// Invalid extension
❌ resume.exe (dangerous)
❌ document.zip (not allowed)
❌ file.html (not allowed)

// Invalid size
❌ huge.pdf (15 MB, too large)
❌ empty.pdf (0 bytes, too small)

// Spoofed files
❌ fake.pdf (actually .exe renamed to .pdf)
❌ malicious.docx (actually .zip with scripts)

// Invalid filenames
❌ ../../../etc/passwd (path traversal)
❌ file\0name.pdf (null byte injection)
```

### Automated Testing

```tsx
// tests/fileValidation.test.ts
import { validateResumeFile } from '@/utils/fileValidation';

describe('File Validation', () => {
  it('should accept valid PDF', async () => {
    const file = new File(['%PDF-1.4'], 'resume.pdf', {
      type: 'application/pdf',
    });
    const result = await validateResumeFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject dangerous extensions', async () => {
    const file = new File(['data'], 'virus.exe', {
      type: 'application/x-msdownload',
    });
    const result = await validateResumeFile(file);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Dangerous file type detected');
  });

  it('should reject files exceeding size limit', async () => {
    const largeData = new Array(11 * 1024 * 1024).fill(0); // 11 MB
    const file = new File(largeData, 'large.pdf', {
      type: 'application/pdf',
    });
    const result = await validateResumeFile(file);
    expect(result.valid).toBe(false);
  });
});
```

---

## Constants

All constants can be found in `/utils/fileValidation.ts`:

```tsx
// Maximum file size (10 MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Minimum file size (1 KB)
export const MIN_FILE_SIZE = 1024;

// Maximum filename length
export const MAX_FILENAME_LENGTH = 255;

// Allowed resume MIME types
export const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// Allowed resume extensions
export const ALLOWED_RESUME_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
];

// Dangerous extensions (blocked)
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr',
  '.js', '.vbs', '.jar', '.msi', '.app',
  '.deb', '.rpm', '.sh', '.ps1',
];
```

---

## Support

For questions or issues:

1. Review this guide
2. Check `/utils/fileValidation.ts` for implementation details
3. Review error messages for specific issues
4. Consult [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

**Last Updated:** 2025-11-13
**Version:** 1.0
**Status:** Active
