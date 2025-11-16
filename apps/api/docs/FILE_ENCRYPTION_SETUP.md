# File Encryption Setup Guide

## Overview

The My Files feature supports file encryption at rest using AES-256-GCM encryption. This ensures that files stored in cloud storage (Supabase) or local filesystem are encrypted before being written to disk.

## Prerequisites

- Node.js environment with crypto module (built-in)
- Environment variable configuration access

## Setup Instructions

### 1. Generate Encryption Key

The encryption system uses a 32-byte (256-bit) key for AES-256-GCM. Generate a secure key:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important:** Store this key securely. If you lose it, encrypted files cannot be decrypted.

### 2. Set Environment Variables

Add the following to your `.env` file:

```env
# Enable file encryption
ENABLE_FILE_ENCRYPTION=true

# Encryption key (32-byte base64 encoded)
FILE_ENCRYPTION_KEY=your-generated-key-here-base64-encoded
```

### 3. Key Management

#### Development
- Store the key in `.env` file (never commit to git)
- Use a different key for each environment (dev, staging, prod)

#### Production
- **Recommended:** Use a secrets management service:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - Google Cloud Secret Manager
- **Alternative:** Use environment variables set by your deployment platform
- **Never:** Hardcode keys in source code or commit to version control

### 4. Key Rotation

If you need to rotate encryption keys:

1. **Backup all encrypted files** before rotation
2. Generate a new encryption key
3. Re-encrypt all files with the new key (requires application-level migration)
4. Update `FILE_ENCRYPTION_KEY` environment variable
5. Test decryption with new key
6. Remove old key from all systems

**Warning:** Key rotation is a complex process. Plan carefully and test thoroughly in a non-production environment first.

## How It Works

### Encryption Flow

1. **Upload:** File is encrypted using `encryptFile()` before being sent to storage
2. **Storage:** Encrypted file is stored in Supabase Storage or local filesystem
3. **Download:** File is decrypted using `decryptFile()` after being retrieved from storage

### Encryption Details

- **Algorithm:** AES-256-GCM (Advanced Encryption Standard with Galois/Counter Mode)
- **Key Size:** 256 bits (32 bytes)
- **IV (Initialization Vector):** Randomly generated for each file
- **Authentication:** GCM mode provides built-in authentication

### Security Features

- Each file is encrypted with a unique IV
- Authentication tag prevents tampering
- Keys are never logged or exposed in error messages
- Encryption is transparent to the application layer

## Verification

### Check if Encryption is Enabled

```bash
# In your application logs, look for:
# "File encrypted before upload" (on upload)
# "File decrypted after download" (on download)
```

### Test Encryption

1. Upload a test file with `ENABLE_FILE_ENCRYPTION=true`
2. Check storage - file should be encrypted (not readable as plain text)
3. Download the file - should decrypt correctly
4. Verify file content matches original

## Troubleshooting

### Error: "Failed to decrypt file"

**Causes:**
- Wrong encryption key
- File was encrypted with a different key
- File corruption

**Solutions:**
1. Verify `FILE_ENCRYPTION_KEY` matches the key used for encryption
2. Check file integrity in storage
3. Verify encryption was enabled when file was uploaded

### Error: "Encryption key not found"

**Cause:** `FILE_ENCRYPTION_KEY` environment variable is not set

**Solution:** Set `FILE_ENCRYPTION_KEY` in your `.env` file or environment

### Performance Impact

- **Encryption:** Minimal overhead (~5-10% for large files)
- **Decryption:** Minimal overhead (~5-10% for large files)
- **Memory:** Additional memory usage for encryption buffers

## Best Practices

1. **Always backup encryption keys** in a secure location
2. **Use different keys** for each environment
3. **Rotate keys periodically** (annually recommended)
4. **Monitor encryption errors** in application logs
5. **Test encryption/decryption** after deployment
6. **Document key locations** for your team (securely)

## Production Checklist

- [ ] Encryption key generated and stored securely
- [ ] `ENABLE_FILE_ENCRYPTION=true` set in production environment
- [ ] `FILE_ENCRYPTION_KEY` set in production environment
- [ ] Key backup created and stored securely
- [ ] Encryption tested in production-like environment
- [ ] Key rotation plan documented
- [ ] Team members aware of key location (if needed)
- [ ] Monitoring alerts configured for encryption errors

## Related Files

- `apps/api/utils/fileEncryption.js` - Encryption/decryption implementation
- `apps/api/routes/storage.routes.js` - Integration in upload/download endpoints

## Support

For issues or questions:
1. Check application logs for encryption-related errors
2. Verify environment variables are set correctly
3. Test with a small file first
4. Review this documentation

---

**Last Updated:** 2025-01-15

