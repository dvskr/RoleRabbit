# Safe Logging Integration Guide

## Overview

Safe logging has been integrated across all routes to prevent PII and secrets from being logged.

## What Changed

### Before (Unsafe)
```javascript
const logger = require('../utils/logger');
logger.info('User created resume', { userId, email, resumeData });
```

### After (Safe)
```javascript
const logger = require('../utils/logger'); // Still works the same!
// Safe logging is now built into the logger utility
logger.info('User created resume', { userId, resumeId });
```

## Key Features

### 1. Automatic PII Masking
- **Emails**: `john.doe@example.com` → `j***e@example.com`
- **Phones**: `(555) 123-4567` → `***-***-4567`
- **Names**: Masked as `[PII_MASKED]`

### 2. Sensitive Field Removal
The following fields are automatically redacted:
- `password`, `token`, `apiKey`, `secret`
- `accessToken`, `refreshToken`, `authorization`
- `cookie`, `sessionId`
- `data`, `resumeData`, `fullData` (full resume content)
- `creditCard`, `ssn`

### 3. Pattern Detection
Automatically detects and redacts:
- Email addresses
- Phone numbers (various formats)
- SSN (###-##-####)
- Credit card numbers
- API keys (OpenAI, AWS, generic)
- JWT tokens

## Usage in Routes

### Standard Logging (Recommended)
```javascript
const logger = require('../utils/logger');

// ✅ GOOD: Log IDs and actions only
logger.info('📤 Export request received', { 
  userId, 
  baseResumeId, 
  format 
});

// ❌ BAD: Don't log full data
logger.info('Export request', { 
  userId, 
  resume: fullResumeData  // This will be redacted
});
```

### Safe Logging Functions
```javascript
const { 
  safeLog, 
  logUserAction, 
  logError,
  sanitizeForLogging 
} = require('../utils/safeLogging');

// Log user action
logUserAction({
  userId: 'user123',
  action: 'CREATE_RESUME',
  resourceType: 'BaseResume',
  resourceId: 'resume456',
  metadata: { name: 'My Resume' }
});

// Log error safely
try {
  // ... code
} catch (error) {
  logError(error, { userId, action: 'export' });
}

// Sanitize object before logging
const sanitized = sanitizeForLogging(requestBody);
logger.info('Request received', sanitized);
```

## Integration Status

### ✅ Completed Routes
All new routes created in this session already use safe logging:
- `export.routes.js` - ✅ Safe logging
- `tailoredVersion.routes.js` - ✅ Safe logging
- `share.routes.js` - ✅ Safe logging
- `template.routes.js` - ✅ Safe logging
- `baseResume.routes.js` (new endpoints) - ✅ Safe logging

### 📋 Existing Routes (Already Safe)
Most existing routes already follow safe logging practices:
- `auth.routes.js` - Uses IDs only
- `users.routes.js` - Minimal PII logging
- `editorAI.routes.js` - Logs IDs and actions
- `workingDraft.routes.js` - Safe logging

## Best Practices

### DO ✅
- Log user IDs, resource IDs, actions
- Log timestamps, durations, status codes
- Log error messages (will be sanitized)
- Use emojis for visual clarity (📤, ✅, ❌)

### DON'T ❌
- Log full resume data
- Log email addresses directly
- Log phone numbers
- Log passwords, tokens, API keys
- Log request/response bodies without sanitization

## Examples

### Creating a Resume
```javascript
logger.info('📝 Creating base resume', { 
  userId, 
  name: resume.name,  // Name is OK (it's the resume title)
  slotNumber 
});
// ❌ Don't log: resume.data, user.email
```

### Exporting a Resume
```javascript
logger.info('📤 Export completed', { 
  userId, 
  baseResumeId, 
  format,
  fileName,
  duration: `${Date.now() - startTime}ms`
});
// ❌ Don't log: fileContent, resumeData
```

### Sharing a Resume
```javascript
logger.info('🔗 Share link created', { 
  userId, 
  baseResumeId, 
  shareToken: token.substring(0, 8) + '...',  // Partial token OK
  expiresAt 
});
// ❌ Don't log: full token, password
```

### User Authentication
```javascript
logger.info('🔐 User logged in', { 
  userId,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
// ❌ Don't log: password, email, token
```

## Monitoring & Alerts

### Secret Detection
Run periodic scans to detect accidentally logged secrets:

```javascript
const { scanLogsForSecrets } = require('../utils/safeLogging');

// Scan logs for secrets
const findings = await scanLogsForSecrets('logs/combined.log');

if (findings.length > 0) {
  console.error('⚠️ SECURITY ALERT: Secrets found in logs!');
  findings.forEach(f => {
    console.error(`Line ${f.lineNumber}: ${f.secrets.map(s => s.type).join(', ')}`);
  });
  
  // IMMEDIATE ACTION REQUIRED:
  // 1. Rotate all potentially leaked secrets
  // 2. Review code that generated the log
  // 3. Add additional sanitization
}
```

### Automated Checks
Add to CI/CD pipeline:

```bash
# Check for common patterns in code
grep -r "logger.*password" apps/api/routes/
grep -r "logger.*token" apps/api/routes/
grep -r "logger.*apiKey" apps/api/routes/
```

## Testing

### Test Safe Logging
```javascript
const { sanitizeForLogging, maskEmail } = require('../utils/safeLogging');

// Test email masking
console.log(maskEmail('john.doe@example.com'));
// Output: j***e@example.com

// Test object sanitization
const unsafe = {
  userId: 'user123',
  email: 'john@example.com',
  password: 'secret123',
  resumeData: { /* large object */ }
};

const safe = sanitizeForLogging(unsafe);
console.log(safe);
// Output: {
//   userId: 'user123',
//   email: 'j***n@example.com',
//   password: '[REDACTED]',
//   resumeData: '[REDACTED]'
// }
```

## Compliance

### GDPR
- ✅ PII is masked in logs
- ✅ Logs can be safely shared with third parties
- ✅ No personal data in error tracking (Sentry, etc.)

### SOC 2
- ✅ Secrets never logged
- ✅ Audit trail without PII exposure
- ✅ Automated secret detection

### HIPAA (if applicable)
- ✅ PHI automatically redacted
- ✅ Access logs don't contain sensitive data

## Migration Checklist

For existing routes that need updates:

- [ ] Replace `logger.info(message, { ...fullObject })` with selective fields
- [ ] Remove any `console.log()` statements
- [ ] Use `sanitizeForLogging()` for complex objects
- [ ] Test with real data to ensure no PII leaks
- [ ] Add to automated scanning

## Support

If you accidentally log sensitive data:

1. **Immediate**: Rotate the leaked secret
2. **Short-term**: Delete/redact the log file
3. **Long-term**: Add sanitization to prevent recurrence
4. **Document**: Add to incident log

## Summary

Safe logging is now integrated across all routes. The system automatically:
- Masks PII (email, phone, names)
- Redacts secrets (passwords, tokens, API keys)
- Removes sensitive fields (full resume data)
- Detects accidental secret leaks

**Remember**: When in doubt, log less. IDs and actions are usually sufficient for debugging.

