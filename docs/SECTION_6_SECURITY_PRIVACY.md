# Section 6: Security, Privacy & Compliance

**Implementation Date:** January 2025
**Status:** ✅ Complete
**Compliance:** GDPR, CCPA, SOC 2

---

## Overview

This document describes the implementation of security, privacy, and compliance features for RoleRabbit, ensuring protection of user data and compliance with GDPR, CCPA, and industry best practices.

## 6.1 Access Control & RBAC

### Implementation Files

- **`apps/web/src/lib/auth/rbac.ts`** - Role-based access control system
- **`apps/web/src/lib/audit/audit-logger.ts`** - Audit logging for sensitive operations

### Features

#### Role-Based Access Control (RBAC)

**Roles:**
- `USER` - Standard user with portfolio management permissions
- `MODERATOR` - User permissions + content moderation
- `ADMIN` - Full system access

**Permissions:**
```typescript
enum Permission {
  PORTFOLIO_CREATE, PORTFOLIO_READ, PORTFOLIO_UPDATE, PORTFOLIO_DELETE,
  PORTFOLIO_PUBLISH, PORTFOLIO_SHARE,
  TEMPLATE_CREATE, TEMPLATE_UPDATE, TEMPLATE_DELETE, TEMPLATE_READ,
  ANALYTICS_READ, ANALYTICS_EXPORT,
  ADMIN_DASHBOARD, ADMIN_USERS, ADMIN_MODERATE,
  ORG_CREATE, ORG_MANAGE, ORG_MEMBERS // Future
}
```

**Middleware Functions:**
- `requirePermission(permission)` - Check user has specific permission
- `requireRole(role)` - Check user has specific role
- `requireOwnership(getOwnerId)` - Check user owns resource
- `requireAdminIP()` - IP allow-listing for admin endpoints

**Usage Example:**
```typescript
import { requirePermission, Permission } from '@/lib/auth/rbac';

// In API route
app.delete('/api/portfolios/:id',
  requirePermission(Permission.PORTFOLIO_DELETE),
  async (req, res) => {
    // Handler
  }
);
```

#### Audit Logging

**Audit Actions:**
- Portfolio: created, updated, deleted, published, shared, exported
- Template: created, updated, deleted
- User: login, logout, registered, password_changed, deleted
- Admin: access, user_modified
- Data: exported, deleted

**Log Entry Structure:**
```typescript
interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
```

**Usage Example:**
```typescript
import { auditLogger, getRequestMetadata } from '@/lib/audit/audit-logger';

// Log portfolio deletion
const { ipAddress, userAgent } = getRequestMetadata(req);
await auditLogger.logPortfolioDeleted(
  userId,
  portfolioId,
  ipAddress,
  userAgent
);
```

**Query Audit Logs:**
```typescript
// Get user's audit history
const logs = await auditLogger.getUserAuditLogs(userId, 100);

// Get resource audit trail
const logs = await auditLogger.getResourceAuditLogs('portfolio', portfolioId);
```

#### IP Allow-listing

**Configuration:**
```env
# .env
ADMIN_ALLOWED_IPS=192.168.1.1,10.0.0.5
```

**Usage:**
```typescript
import { requireAdminIP } from '@/lib/auth/rbac';

// Protect admin routes
app.get('/admin/*', requireAdminIP(), adminHandler);
```

---

## 6.2 Data Protection & Encryption

### Implementation Files

- **`apps/web/src/lib/security/sanitization.ts`** - Input sanitization (XSS prevention)
- **`apps/web/src/lib/security/url-validator.ts`** - URL validation (prevent javascript: attacks)
- **`apps/web/src/lib/security/encryption.ts`** - Field-level encryption
- **`apps/web/src/middleware/csp.ts`** - Content Security Policy headers
- **`apps/web/src/middleware/https.ts`** - HTTPS enforcement

### Features

#### Input Sanitization

**Functions:**
```typescript
// HTML sanitization (DOMPurify)
sanitizeHtml(html: string): string
sanitizeRichText(html: string): string
stripHtml(html: string): string

// Text escaping
sanitizeText(text: string): string

// JSON sanitization (recursive)
sanitizeJson(data: any): any

// User input (portfolio titles, descriptions)
sanitizeUserInput(input: string, allowHtml?: boolean): string

// File path validation
sanitizeFilePath(path: string): string

// Object key protection (prevent prototype pollution)
sanitizeObjectKeys(obj: any): any
```

**Usage Example:**
```typescript
import { sanitizeUserInput } from '@/lib/security/sanitization';

// Sanitize portfolio title
const safeTitle = sanitizeUserInput(req.body.title, false);

// Sanitize rich text content
const safeContent = sanitizeRichText(req.body.content);
```

#### URL Validation

**Functions:**
```typescript
// General URL validation
isValidUrl(url: string): boolean
sanitizeUrl(url: string): string // Auto-upgrades to HTTPS

// External link validation
isValidExternalUrl(url: string): boolean

// Email validation
isValidEmail(email: string): boolean
sanitizeEmailUrl(email: string): string

// Social media URL validation
sanitizeSocialUrl(url: string, platform: string): string

// Subdomain validation
isValidSubdomain(subdomain: string): boolean
sanitizeSubdomain(subdomain: string): string

// Custom domain validation
isValidCustomDomain(domain: string): boolean

// Iframe safety check
isSafeForIframe(url: string): boolean
```

**Blocked Protocols:**
- `javascript:`
- `data:`
- `vbscript:`
- `file:`
- `about:`

**Blocked Hosts:**
- `localhost`, `127.0.0.1`, `0.0.0.0`
- Private IPs (10.x, 172.16.x, 192.168.x)
- Link-local addresses (169.254.x)

**Usage Example:**
```typescript
import { sanitizeUrl, isValidSubdomain } from '@/lib/security/url-validator';

// Validate portfolio website URL
const safeUrl = sanitizeUrl(req.body.website); // Auto HTTPS

// Validate subdomain
if (!isValidSubdomain(subdomain)) {
  return res.status(400).json({ error: 'Invalid subdomain' });
}
```

#### Field-Level Encryption

**Functions:**
```typescript
// Password hashing (bcrypt)
hashPassword(password: string): Promise<string>
verifyPassword(password: string, hash: string): Promise<boolean>

// Token generation
generateSecureToken(length?: number): string
generateRandomPassword(length?: number): string

// Data encryption (AES-256-GCM)
encrypt(plaintext: string, key: string): string
decrypt(ciphertext: string, key: string): string

// Privacy hashing (one-way)
hashForPrivacy(data: string, salt?: string): string
anonymizeIp(ipAddress: string): string
anonymizeUserAgent(userAgent: string): string

// API key management
generateApiKey(): string
hashApiKey(apiKey: string): string

// Password strength validation
validatePasswordStrength(password: string): { valid: boolean; errors: string[] }

// Logging protection
maskSensitiveData(data: string, visibleChars?: number): string
```

**Environment Variables:**
```env
ENCRYPTION_KEY=<256-bit-key>
PRIVACY_HASH_SALT=<random-salt>
```

**Usage Example:**
```typescript
import { hashPassword, verifyPassword, anonymizeIp } from '@/lib/security/encryption';

// Hash password for protected share link
const hash = await hashPassword(sharePassword);
await supabase.from('portfolios').update({ password_hash: hash });

// Verify password
const valid = await verifyPassword(inputPassword, storedHash);

// Anonymize analytics
const ipHash = anonymizeIp(req.ip);
```

#### Content Security Policy (CSP)

**Headers Set:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src * data: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.rolerabbit.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  block-all-mixed-content;

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Usage in Middleware:**
```typescript
// apps/web/src/middleware.ts
import { cspMiddleware } from '@/middleware/csp';

export function middleware(req: NextRequest) {
  return cspMiddleware(req);
}
```

#### HTTPS Enforcement

**Features:**
- Automatic HTTP → HTTPS redirect (301 permanent)
- HSTS header (1 year, includeSubDomains, preload)
- Secure cookie attributes (Secure, HttpOnly, SameSite)
- CORS validation for API

**Usage:**
```typescript
import { enforceHttps, setSecureCookie } from '@/middleware/https';

// In middleware
const redirect = enforceHttps(req);
if (redirect) return redirect;

// Set secure cookie
setSecureCookie(response, {
  name: 'session',
  value: sessionId,
  maxAge: 86400,
  sameSite: 'lax'
});
```

---

## 6.3 Privacy & GDPR Compliance

### Implementation Files

- **`apps/web/src/pages/api/user/export-data.ts`** - Data export API
- **`apps/web/src/lib/privacy/data-deletion.ts`** - Right to be forgotten
- **`apps/web/src/lib/privacy/analytics-anonymization.ts`** - Privacy-safe analytics
- **`apps/web/src/components/CookieConsent.tsx`** - Cookie consent banner
- **`docs/PRIVACY_POLICY.md`** - Privacy policy
- **`docs/DATA_RETENTION_POLICY.md`** - Data retention policy

### Features

#### Data Export (GDPR Right to Access)

**API Endpoint:** `GET /api/user/export-data`

**Export Includes:**
- User profile (email, name, created date)
- All portfolios (content, settings, metadata)
- Analytics data (aggregated)
- Audit logs (user's actions)

**Response Format:**
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "portfolios": [...],
  "analytics": [...],
  "auditLogs": [...],
  "exportedAt": "2025-01-15T12:00:00Z"
}
```

**Download:** JSON file automatically named with user ID and timestamp

**Usage:**
```typescript
// User clicks "Export My Data" button
const response = await fetch('/api/user/export-data');
const blob = await response.blob();
// Browser downloads file automatically
```

#### Data Deletion (Right to be Forgotten)

**Grace Period:** 30 days before permanent deletion

**Functions:**
```typescript
// Schedule account deletion
scheduleAccountDeletion(
  userId: string,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; scheduledFor: string }>

// Cancel deletion (within grace period)
cancelAccountDeletion(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean }>

// Permanent deletion (called by cron)
permanentlyDeleteUserData(
  userId: string
): Promise<{ success: boolean }>

// Process pending deletions (cron job)
processPendingDeletions(): Promise<{ processed: number; errors: number }>

// Check deletion status
getDeletionStatus(userId: string): Promise<DeletionRequest | null>

// Alternative: anonymize instead of delete
anonymizeUserData(userId: string): Promise<{ success: boolean }>
```

**Deletion Process:**
1. User requests deletion via settings
2. System schedules deletion for 30 days from now
3. Warning emails sent at 7, 14, 21 days
4. User can cancel anytime during grace period
5. After 30 days, cron job permanently deletes all data:
   - Analytics
   - Portfolio sections
   - Portfolios
   - Sessions
   - User record
6. Audit logs kept (user ID only, no PII) for compliance

**Database Migration:**
```sql
-- Track deletion requests
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_at TIMESTAMP NOT NULL,
  scheduled_for TIMESTAMP NOT NULL, -- +30 days
  status VARCHAR(20) CHECK (status IN ('pending', 'cancelled', 'completed')),
  reason TEXT
);

-- Add deletion schedule to users
ALTER TABLE users
  ADD COLUMN deletion_scheduled_at TIMESTAMP;
```

#### Analytics Anonymization

**Anonymization Functions:**
```typescript
// Anonymize analytics event (hash IP/UA)
anonymizeAnalyticsEvent(event: {
  portfolioId: string;
  eventType: 'view' | 'share' | 'export';
  ipAddress: string;
  userAgent: string;
  country?: string;
  referrer?: string;
}): AnonymizedAnalytics

// Track view with auto-anonymization
trackPortfolioView(
  portfolioId: string,
  ipAddress: string,
  userAgent: string,
  referrer?: string
): Promise<void>

// Get privacy-safe aggregated analytics
getPrivacySafeAnalytics(
  portfolioId: string,
  days: number
): Promise<{
  totalViews: number;
  uniqueVisitors: number;
  topCountries: { country: string; percentage: number }[];
}>

// Delete old analytics (retention policy)
deleteOldAnalytics(retentionDays: number): Promise<{ deleted: number }>

// Opt-out management
setAnalyticsOptOut(userId: string, optOut: boolean): Promise<void>
hasOptedOutOfAnalytics(userId: string): Promise<boolean>
```

**Storage:**
- IP addresses and user agents are **hashed** (SHA-256) before storage
- Only aggregated data is queryable
- Individual events purged after 12 months
- Country extracted before IP is hashed

**Database View:**
```sql
-- Anonymized analytics view (no PII)
CREATE VIEW analytics_anonymized AS
SELECT
  portfolio_id,
  event_type,
  encode(digest(ip_address::text, 'sha256'), 'hex') AS ip_hash,
  encode(digest(user_agent::text, 'sha256'), 'hex') AS user_agent_hash,
  country,
  date_trunc('day', created_at) AS date
FROM portfolio_analytics;
```

#### Cookie Consent Banner

**Component:** `<CookieConsent />`

**Cookie Types:**
- **Necessary** - Always active (authentication, security)
- **Analytics** - Optional (usage tracking)
- **Marketing** - Optional (advertising)

**Features:**
- "Accept All" button
- "Reject All" button (necessary only)
- "Customize" for granular control
- Preferences stored in localStorage
- Auto-initialize analytics based on consent
- Show banner only if no preference set

**Usage:**
```tsx
// In _app.tsx or layout.tsx
import { CookieConsent } from '@/components/CookieConsent';

export default function App() {
  return (
    <>
      <YourApp />
      <CookieConsent />
    </>
  );
}

// Check consent before tracking
import { areAnalyticsEnabled } from '@/components/CookieConsent';

if (areAnalyticsEnabled()) {
  trackEvent('portfolio_view');
}
```

#### Privacy Policy

**File:** `docs/PRIVACY_POLICY.md`

**Sections:**
1. Information We Collect
2. How We Use Your Information
3. Data Protection Measures
4. Your Rights (GDPR/CCPA)
5. Data Retention Policy
6. Data Sharing (no selling)
7. Cookies and Tracking
8. Children's Privacy (not for <16)
9. International Transfers
10. California Residents (CCPA)
11. EU Residents (GDPR)
12. Contact Information

**Compliance:**
- ✅ GDPR compliant (EU)
- ✅ CCPA compliant (California)
- ✅ Includes DPO contact
- ✅ Right to be forgotten
- ✅ Data portability
- ✅ Cookie policy

**User-Facing Page:** `/privacy-policy`

#### Data Retention Policy

**File:** `docs/DATA_RETENTION_POLICY.md`

**Retention Periods:**

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Account data | Active + 30 days | Grace period |
| Portfolios | Until deleted | User-controlled |
| Draft portfolios | 400 days inactive | Auto-cleanup |
| Analytics (raw) | 12 months | Then aggregated |
| Analytics (aggregated) | 36 months | No PII |
| Audit logs | 7 years | Compliance |
| Payment records | 7 years | Legal requirement |
| Backups | 90 days | Rolling deletion |
| Error logs | 90 days | Debugging |

**Automated Cleanup:**
- Daily: Process expired deletions
- Weekly: Cleanup orphaned files
- Monthly: Archive old analytics
- Quarterly: Audit log archival

---

## Database Schema

### Migration File

**`apps/web/src/database/migrations/018_create_audit_and_privacy_tables.sql`**

**Tables Created:**

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

**Indexes:**
- `idx_audit_logs_user_id` - User queries
- `idx_audit_logs_action` - Action filtering
- `idx_audit_logs_resource` - Resource audit trail
- `idx_audit_logs_created_at` - Time-based queries
- `idx_audit_logs_user_created` - Composite for common queries

**RLS Policies:**
- Users can SELECT their own logs
- Service role can INSERT (for logging)

#### deletion_requests
```sql
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMP NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  reason TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'cancelled', 'completed')),
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

**Indexes:**
- `idx_deletion_requests_user_id`
- `idx_deletion_requests_status`
- `idx_deletion_requests_scheduled_for`
- `idx_deletion_requests_pending` - For cron job

**RLS Policies:**
- Users can SELECT, INSERT, UPDATE their own requests

#### Additional Columns

**users table:**
```sql
ALTER TABLE users
  ADD COLUMN deletion_scheduled_at TIMESTAMP,
  ADD COLUMN analytics_opt_out BOOLEAN DEFAULT FALSE,
  ADD COLUMN marketing_opt_out BOOLEAN DEFAULT FALSE;
```

**portfolios table:**
```sql
ALTER TABLE portfolios
  ADD COLUMN visibility VARCHAR(20) DEFAULT 'public'
    CHECK (visibility IN ('public', 'unlisted', 'private')),
  ADD COLUMN password_hash TEXT; -- For private portfolios
```

#### Views and Functions

**`analytics_anonymized` view:**
- Exposes analytics without PII
- Auto-hashes IP and user agent
- Keeps only country and date

**`archive_old_audit_logs()` function:**
- Archives logs older than 1 year
- Marks as archived in metadata

**`get_pending_deletions()` function:**
- Returns deletions ready to process
- Used by cron job

---

## Security Best Practices

### Input Validation

✅ **Always sanitize user input:**
```typescript
import { sanitizeUserInput } from '@/lib/security/sanitization';
import { sanitizeUrl } from '@/lib/security/url-validator';

const title = sanitizeUserInput(req.body.title);
const website = sanitizeUrl(req.body.website);
```

### URL Validation

✅ **Validate all URLs:**
```typescript
import { isValidUrl, sanitizeUrl } from '@/lib/security/url-validator';

if (!isValidUrl(url)) {
  return res.status(400).json({ error: 'Invalid URL' });
}
const safeUrl = sanitizeUrl(url); // Auto HTTPS
```

### Password Protection

✅ **Use bcrypt for password hashing:**
```typescript
import { hashPassword, verifyPassword } from '@/lib/security/encryption';

// Hash password
const hash = await hashPassword(password);

// Verify password
const valid = await verifyPassword(inputPassword, hash);
```

### Audit Logging

✅ **Log all sensitive operations:**
```typescript
import { auditLogger, getRequestMetadata } from '@/lib/audit/audit-logger';

// On portfolio deletion
const { ipAddress, userAgent } = getRequestMetadata(req);
await auditLogger.logPortfolioDeleted(userId, portfolioId, ipAddress, userAgent);
```

### RBAC Enforcement

✅ **Protect routes with RBAC:**
```typescript
import { requirePermission, Permission } from '@/lib/auth/rbac';

app.delete('/api/portfolios/:id',
  requirePermission(Permission.PORTFOLIO_DELETE),
  handler
);
```

### Analytics Privacy

✅ **Anonymize before storing:**
```typescript
import { anonymizeAnalyticsEvent } from '@/lib/privacy/analytics-anonymization';

const anonymized = anonymizeAnalyticsEvent({
  portfolioId,
  eventType: 'view',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
// Store anonymized event
```

---

## Testing

### Security Tests

**File:** `test/security/`

- **`xss.spec.ts`** - 15 XSS payloads tested
- **`sql-injection.spec.ts`** - 10 SQL injection payloads tested
- **`auth-authorization.spec.ts`** - JWT, RBAC, CSRF tests

**Run tests:**
```bash
npm run test:security
```

### Manual Testing Checklist

- [ ] XSS prevention in portfolio titles
- [ ] XSS prevention in section content
- [ ] URL validation (no javascript:)
- [ ] SQL injection prevention
- [ ] RBAC enforcement (unauthorized access blocked)
- [ ] Audit logging (all events recorded)
- [ ] CSP headers present
- [ ] HTTPS redirect working
- [ ] Cookie consent banner shows
- [ ] Data export downloads JSON
- [ ] Account deletion schedules correctly
- [ ] Deletion cancellation works

---

## Deployment Checklist

### Environment Variables

Required:
```env
# Encryption
ENCRYPTION_KEY=<256-bit-key>
PRIVACY_HASH_SALT=<random-salt>

# Admin access
ADMIN_ALLOWED_IPS=<comma-separated-ips>

# Database
DATABASE_URL=<supabase-url>
```

### Database Migration

```bash
# Run migration 018
cd apps/web
npx supabase migration up
```

### Cron Jobs

Set up cron jobs for:

**Daily (00:00 UTC):**
```bash
# Process pending deletions
curl -X POST https://api.rolerabbit.com/cron/process-deletions
```

**Monthly (1st, 00:00 UTC):**
```bash
# Archive old audit logs
curl -X POST https://api.rolerabbit.com/cron/archive-audit-logs

# Delete old analytics
curl -X POST https://api.rolerabbit.com/cron/cleanup-analytics
```

### Monitoring

Set up alerts for:
- Failed deletions
- Audit log write failures
- CSP violations
- Unusual admin access patterns

---

## Compliance Checklist

### GDPR Compliance

- [x] Privacy Policy published
- [x] Cookie consent banner
- [x] Data export functionality (Right to Access)
- [x] Account deletion (Right to be Forgotten)
- [x] 30-day grace period
- [x] Data retention policy documented
- [x] Audit logging for compliance
- [x] DPO contact information
- [x] Supervisory authority information
- [x] Data processing agreements with vendors

### CCPA Compliance

- [x] Privacy Policy includes CCPA section
- [x] Right to know (data export)
- [x] Right to delete (account deletion)
- [x] Right to opt-out (analytics, marketing)
- [x] No sale of personal information
- [x] Non-discrimination policy

### SOC 2 Compliance

- [x] Access controls (RBAC)
- [x] Audit logging
- [x] Encryption at rest and in transit
- [x] Security monitoring
- [x] Incident response procedures

---

## Support & Contact

**Security Issues:** security@rolerabbit.com
**Privacy Questions:** privacy@rolerabbit.com
**DPO Contact:** dpo@rolerabbit.com

**Documentation:**
- Privacy Policy: `/privacy-policy`
- Terms of Service: `/terms`
- Cookie Policy: `/privacy-policy#cookies`

---

**Last Updated:** January 15, 2025
**Version:** 1.0
