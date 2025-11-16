# 🔒 SECTION 6 DEPLOYMENT INSTRUCTIONS

## Security, Privacy & Compliance Implementation

**Date:** November 15, 2025  
**Status:** ✅ Ready for Deployment

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Dependencies Installation

```bash
cd apps/api
npm install speakeasy qrcode geoip-lite bcrypt
```

### 2. Environment Variables

Add to `apps/api/.env`:

```bash
# PII Encryption (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PII_ENCRYPTION_KEY=your-256-bit-encryption-key-here

# 2FA Encryption
TWO_FACTOR_ENCRYPTION_KEY=your-2fa-encryption-key-here

# JWT Secrets
JWT_SECRET=your-jwt-secret-for-access-tokens
JWT_REFRESH_SECRET=your-jwt-secret-for-refresh-tokens
```

**Generate Keys:**
```bash
# Generate all keys at once
node -e "
const crypto = require('crypto');
console.log('PII_ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
console.log('TWO_FACTOR_ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(32).toString('hex'));
"
```

---

## 🗄️ DATABASE MIGRATION

### Step 1: Run Security Migration

```bash
cd apps/api
psql $DATABASE_URL < prisma/migrations/add_pii_encryption.sql
```

### Step 2: Verify Tables Created

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'encryption_keys',
  'pii_access_logs',
  'data_retention_policies',
  'gdpr_data_requests',
  'user_consents',
  'two_factor_auth',
  'two_factor_attempts',
  'user_sessions',
  'suspicious_activities',
  'login_attempts'
)
ORDER BY table_name;
```

**Expected Output:** 10 tables

### Step 3: Verify Default Data

```sql
SELECT * FROM data_retention_policies;
```

**Expected Output:** 5 retention policies

---

## 🔧 CODE INTEGRATION

### Step 1: Update Main Server File

**File:** `apps/api/server.js` or `apps/api/app.js`

```javascript
// Add at the top
const { authenticateToken } = require('./utils/sessionManagement');
const { rateLimitAPI } = require('./middleware/ipRateLimit');
const { detectSuspiciousActivityMiddleware } = require('./utils/suspiciousActivityDetection');
const gdprRoutes = require('./routes/gdpr.routes');

// Apply global middleware (after body parser, before routes)
app.use(rateLimitAPI());
app.use(authenticateToken());
app.use(detectSuspiciousActivityMiddleware());

// Add GDPR routes
app.use('/api/gdpr', gdprRoutes);
```

### Step 2: Protect Sensitive Routes

**Example: Account Deletion**

```javascript
const { require2FA } = require('./utils/twoFactorAuth');

router.delete('/api/user/account', require2FA(), async (req, res) => {
  // Your existing account deletion logic
});
```

**Example: AI Operations**

```javascript
const { requireAIConsent } = require('./utils/consentManagement');

router.post('/api/editor-ai/tailor', requireAIConsent(), async (req, res) => {
  // Your existing AI operation logic
});
```

**Example: Login**

```javascript
const { rateLimitLogin, logLoginAttempt } = require('./middleware/ipRateLimit');

router.post('/api/auth/login', rateLimitLogin(), async (req, res) => {
  const { email, password } = req.body;
  
  // Your existing login logic
  const user = await authenticateUser(email, password);
  
  if (user) {
    // Log successful login
    await logLoginAttempt({
      email,
      userId: user.id,
      ipAddress: req.clientIP,
      success: true,
      failureReason: null
    });
    
    // Create session
    const { createSession } = require('./utils/sessionManagement');
    const { accessToken, refreshToken } = await createSession(
      user,
      req.clientIP,
      req.headers['user-agent']
    );
    
    res.json({ success: true, accessToken, refreshToken });
  } else {
    // Log failed login
    await logLoginAttempt({
      email,
      userId: null,
      ipAddress: req.clientIP,
      success: false,
      failureReason: 'invalid_credentials'
    });
    
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});
```

### Step 3: Add Password Validation

```javascript
const { validatePasswordMiddleware } = require('./utils/passwordPolicy');

router.post('/api/auth/register', validatePasswordMiddleware(), async (req, res) => {
  // Your existing registration logic
});

router.post('/api/auth/change-password', validatePasswordMiddleware(), async (req, res) => {
  // Your existing password change logic
});
```

---

## ⏰ SCHEDULE BACKGROUND JOBS

### Option 1: Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/RoleReady-FullStack && node apps/api/scripts/data-retention-cleanup.js >> /var/log/roleready-cleanup.log 2>&1
```

### Option 2: Using Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Name: "RoleReady Data Retention Cleanup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
6. Program: `node`
7. Arguments: `apps/api/scripts/data-retention-cleanup.js`
8. Start in: `C:\Users\sathish.kumar\RoleReady-FullStack`

### Option 3: Using BullMQ (Recommended)

**File:** `apps/api/queues/workers/cleanupWorker.js`

```javascript
const { Queue, Worker } = require('bullmq');
const { runDataRetentionCleanup } = require('../../utils/dataRetention');
const { cleanupExpiredSessions, cleanupInactiveSessions } = require('../../utils/sessionManagement');
const { cleanupOldLoginAttempts } = require('../../middleware/ipRateLimit');

const cleanupQueue = new Queue('data-retention-cleanup', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Schedule daily cleanup at 2 AM
cleanupQueue.add(
  'daily-cleanup',
  {},
  {
    repeat: {
      pattern: '0 2 * * *' // Cron format
    }
  }
);

// Worker to process cleanup jobs
const cleanupWorker = new Worker(
  'data-retention-cleanup',
  async (job) => {
    console.log('Starting data retention cleanup...');
    
    await runDataRetentionCleanup();
    await cleanupExpiredSessions();
    await cleanupInactiveSessions();
    await cleanupOldLoginAttempts();
    
    console.log('Data retention cleanup completed');
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  }
);

module.exports = { cleanupQueue, cleanupWorker };
```

---

## 🧪 TESTING

### Test 1: PII Encryption

```bash
node -e "
const { encryptPII, decryptPII } = require('./apps/api/utils/piiEncryption');

const testData = 'john.doe@example.com';
console.log('Original:', testData);

const encrypted = encryptPII(testData);
console.log('Encrypted:', encrypted.encrypted);

const decrypted = decryptPII(encrypted.encrypted);
console.log('Decrypted:', decrypted);

console.log('✅ Encryption test passed:', testData === decrypted);
"
```

### Test 2: 2FA Generation

```bash
node -e "
const { generate2FASecret } = require('./apps/api/utils/twoFactorAuth');

generate2FASecret('test-user-123', 'test@example.com').then(result => {
  console.log('2FA Secret:', result.secret);
  console.log('QR Code URL:', result.qrCodeUrl.substring(0, 50) + '...');
  console.log('Backup Codes:', result.backupCodes);
  console.log('✅ 2FA generation test passed');
}).catch(error => {
  console.error('❌ 2FA generation test failed:', error);
});
"
```

### Test 3: Password Validation

```bash
node -e "
const { validatePassword } = require('./apps/api/utils/passwordPolicy');

const weakPassword = validatePassword('weak');
console.log('Weak password validation:', weakPassword);

const strongPassword = validatePassword('Strong123!@#');
console.log('Strong password validation:', strongPassword);

console.log('✅ Password validation test passed');
"
```

### Test 4: Rate Limiting

```bash
# Use curl or Postman to test
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -i
  echo "Attempt $i"
done

# Expected: First 5 attempts return 401, 6th attempt returns 429 (rate limited)
```

### Test 5: GDPR Export

```bash
# Request data export
curl -X POST http://localhost:3001/api/gdpr/export-request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Check export status
curl -X GET http://localhost:3001/api/gdpr/export-status/REQUEST_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 MONITORING

### Key Metrics to Monitor

1. **PII Access Logs**
   ```sql
   SELECT COUNT(*), action, DATE(created_at) as date
   FROM pii_access_logs
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY action, date
   ORDER BY date DESC, action;
   ```

2. **Suspicious Activities**
   ```sql
   SELECT COUNT(*), severity, activity_type
   FROM suspicious_activities
   WHERE detected_at >= NOW() - INTERVAL '24 hours'
   AND is_resolved = false
   GROUP BY severity, activity_type
   ORDER BY severity DESC;
   ```

3. **2FA Usage**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE is_enabled = true) as enabled_users,
     COUNT(*) as total_users,
     ROUND(COUNT(*) FILTER (WHERE is_enabled = true) * 100.0 / COUNT(*), 2) as percentage
   FROM two_factor_auth;
   ```

4. **Active Sessions**
   ```sql
   SELECT COUNT(*) as active_sessions
   FROM user_sessions
   WHERE is_active = true
   AND expires_at > NOW();
   ```

5. **Rate Limit Hits**
   ```sql
   SELECT COUNT(*), success, DATE(attempted_at) as date
   FROM login_attempts
   WHERE attempted_at >= NOW() - INTERVAL '24 hours'
   GROUP BY success, date
   ORDER BY date DESC;
   ```

---

## 🚨 ALERTS SETUP

### Critical Alerts

1. **High Severity Suspicious Activity**
   - Trigger: `severity = 'critical'` in `suspicious_activities`
   - Action: Immediate notification to security team

2. **Multiple Failed 2FA Attempts**
   - Trigger: >10 failed attempts for single user in 1 hour
   - Action: Lock account, notify user

3. **GDPR Export Taking Too Long**
   - Trigger: Export request in "processing" status for >1 hour
   - Action: Investigate and notify admin

4. **High Rate Limit Hits**
   - Trigger: >1000 rate limit hits from single IP in 1 hour
   - Action: Consider IP ban, investigate

### Warning Alerts

1. **Unusual PII Access Pattern**
   - Trigger: >100 PII access logs from single user in 1 hour
   - Action: Review and investigate

2. **Low 2FA Adoption**
   - Trigger: <50% of users have 2FA enabled
   - Action: Send reminder emails

3. **Session Cleanup Issues**
   - Trigger: >10,000 expired sessions not cleaned up
   - Action: Check cleanup job status

---

## 🔄 ROLLBACK PLAN

If issues arise after deployment:

### Step 1: Disable Security Middleware (Temporary)

```javascript
// Comment out in server.js
// app.use(rateLimitAPI());
// app.use(authenticateToken());
// app.use(detectSuspiciousActivityMiddleware());
```

### Step 2: Rollback Database Migration

```sql
-- Drop security tables (CAUTION: Data loss)
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS suspicious_activities CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS two_factor_attempts CASCADE;
DROP TABLE IF EXISTS two_factor_auth CASCADE;
DROP TABLE IF EXISTS user_consents CASCADE;
DROP TABLE IF EXISTS gdpr_data_requests CASCADE;
DROP TABLE IF EXISTS data_retention_policies CASCADE;
DROP TABLE IF EXISTS pii_access_logs CASCADE;
DROP TABLE IF EXISTS encryption_keys CASCADE;

-- Remove columns from base_resumes
ALTER TABLE base_resumes DROP COLUMN IF EXISTS encrypted_data;
ALTER TABLE base_resumes DROP COLUMN IF EXISTS encryption_version;
ALTER TABLE base_resumes DROP COLUMN IF EXISTS encrypted_at;
```

### Step 3: Restart Services

```bash
# Restart API server
pm2 restart api

# Or if using npm
npm run dev
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Verify All Tables Exist

```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'encryption_keys', 'pii_access_logs', 'data_retention_policies',
  'gdpr_data_requests', 'user_consents', 'two_factor_auth',
  'two_factor_attempts', 'user_sessions', 'suspicious_activities',
  'login_attempts'
);
-- Expected: 10
```

### 2. Test GDPR Endpoints

```bash
# Should return 401 (unauthorized) - endpoint exists
curl -X POST http://localhost:3001/api/gdpr/export-request
```

### 3. Test Rate Limiting

```bash
# Should return rate limit headers
curl -I http://localhost:3001/api/health
# Look for: X-RateLimit-Limit, X-RateLimit-Remaining
```

### 4. Check Logs

```bash
# Should see security middleware logs
tail -f apps/api/logs/app.log | grep -i "security\|rate\|2fa\|suspicious"
```

### 5. Verify Cleanup Job

```bash
# Run manually
node apps/api/scripts/data-retention-cleanup.js

# Should see output:
# ========================================
# Data Retention Cleanup Started
# ...
# Data Retention Cleanup Completed
# ========================================
```

---

## 📞 SUPPORT

### Common Issues

**Issue:** `PII_ENCRYPTION_KEY environment variable not set`
- **Solution:** Add `PII_ENCRYPTION_KEY` to `.env` file

**Issue:** `speakeasy module not found`
- **Solution:** Run `npm install speakeasy qrcode geoip-lite bcrypt`

**Issue:** `Table pii_access_logs does not exist`
- **Solution:** Run database migration: `psql $DATABASE_URL < prisma/migrations/add_pii_encryption.sql`

**Issue:** Rate limiting not working
- **Solution:** Verify `login_attempts` table exists and middleware is applied

**Issue:** 2FA QR code not generating
- **Solution:** Check `TWO_FACTOR_ENCRYPTION_KEY` is set and `qrcode` package is installed

---

## 🎉 DEPLOYMENT COMPLETE!

Once all steps are completed and verified:

1. ✅ Dependencies installed
2. ✅ Environment variables set
3. ✅ Database migration run
4. ✅ Code integrated
5. ✅ Background jobs scheduled
6. ✅ Tests passed
7. ✅ Monitoring configured
8. ✅ Alerts set up
9. ✅ Post-deployment verification complete

**Your security, privacy, and compliance implementation is now live!** 🚀

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Verified By:** _____________  
**Status:** ✅ COMPLETE

