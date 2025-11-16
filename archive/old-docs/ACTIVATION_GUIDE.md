# RoleRabbit Activation Guide

This guide walks you through activating all the security, moderation, and documentation features implemented in Sections 6-7.

---

## Prerequisites

Before activating the new features, ensure you have:

- Node.js 18.17 or higher
- PostgreSQL 14 or higher (or Supabase account)
- Redis 7+ (optional, but recommended for production)
- Git repository cloned locally

---

## Step 1: Install Dependencies

First, install all required npm packages:

```bash
# Navigate to project root
cd /home/user/RoleRabbit

# Install all dependencies
npm install

# Install specific security dependencies
cd apps/web
npm install bcryptjs isomorphic-dompurify zod
npm install --save-dev @types/bcryptjs

# Install linting and code quality tools
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional

# Initialize Husky
npx husky install
```

---

## Step 2: Configure Environment Variables

Create or update your `.env.local` file in `apps/web/`:

```bash
cd apps/web
cp .env.example .env.local
```

Add these required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rolerabbit
# Or for Supabase:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Encryption
ENCRYPTION_KEY=your-encryption-key-min-32-chars

# Rate Limiting (Optional - Redis)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@rolerabbit.com

# File Scanning (Optional)
VIRUSTOTAL_API_KEY=your-virustotal-api-key

# Monitoring (Production)
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Environment
NODE_ENV=development
```

Generate secure keys:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Step 3: Run Database Migrations

Apply the new database migrations to add all security and moderation tables:

```bash
# From apps/web directory
npm run db:migrate

# Or manually with psql
psql $DATABASE_URL -f src/database/migrations/018_create_audit_and_privacy_tables.sql
psql $DATABASE_URL -f src/database/migrations/019_create_moderation_and_security_tables.sql
```

Verify migrations:

```bash
psql $DATABASE_URL -c "\dt"
# Should show: audit_logs, deletion_requests, review_queue, abuse_reports, security_logs
```

---

## Step 4: Seed Initial Data (Optional)

Create an admin user for testing:

```bash
# Create a seed script
cat > src/database/seed-admin.sql <<'EOF'
-- Insert admin user (modify with your details)
INSERT INTO auth.users (id, email, encrypted_password, role)
VALUES (
  gen_random_uuid(),
  'admin@rolerabbit.com',
  crypt('AdminPassword123!', gen_salt('bf')), -- Change this password!
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert moderator user
INSERT INTO auth.users (id, email, encrypted_password, role)
VALUES (
  gen_random_uuid(),
  'moderator@rolerabbit.com',
  crypt('ModeratorPass123!', -- Change this password!
  gen_salt('bf')),
  'moderator'
) ON CONFLICT (email) DO NOTHING;
EOF

# Run seed script
psql $DATABASE_URL -f src/database/seed-admin.sql
```

---

## Step 5: Start the Development Server

```bash
# From apps/web directory
npm run dev

# Server should start on http://localhost:3000
```

Verify the server is running:

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

---

## Step 6: Test API Endpoints

### Test Authentication

```bash
# Login as admin (adjust based on your auth implementation)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rolerabbit.com","password":"AdminPassword123!"}'

# Save the token from response
TOKEN="your-jwt-token-here"
```

### Test Abuse Reporting

```bash
# Submit abuse report
curl -X POST http://localhost:3000/api/abuse/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "portfolioId": "some-portfolio-uuid",
    "reason": "spam",
    "description": "This portfolio contains spam content"
  }'

# Get abuse reports (moderator/admin only)
curl http://localhost:3000/api/abuse/reports \
  -H "Authorization: Bearer $TOKEN"
```

### Test Review Queue

```bash
# Get review queue (moderator/admin only)
curl "http://localhost:3000/api/admin/review-queue?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Approve content
curl -X POST http://localhost:3000/api/admin/review-queue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "queueId": "queue-item-uuid",
    "action": "approve",
    "notes": "Content is acceptable"
  }'
```

### Test Content Moderation

```bash
# Scan portfolio
curl -X POST http://localhost:3000/api/admin/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "portfolioId": "portfolio-uuid",
    "action": "scan"
  }'

# Unpublish portfolio
curl -X POST http://localhost:3000/api/admin/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "portfolioId": "portfolio-uuid",
    "action": "unpublish",
    "reason": "Violates community guidelines"
  }'
```

### Test Account Deletion

```bash
# Schedule account deletion
curl -X POST http://localhost:3000/api/user/delete-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "password": "UserPassword123!",
    "reason": "No longer need the account"
  }'

# Check deletion status
curl http://localhost:3000/api/user/delete-account \
  -H "Authorization: Bearer $TOKEN"

# Cancel deletion
curl -X DELETE http://localhost:3000/api/user/delete-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"confirm": true}'
```

### Test Data Export

```bash
# Export user data (GDPR)
curl http://localhost:3000/api/user/export-data \
  -H "Authorization: Bearer $TOKEN" \
  > my-data.json
```

### Test Rate Limit Stats

```bash
# Get rate limit statistics (admin only)
curl http://localhost:3000/api/admin/rate-limits \
  -H "Authorization: Bearer $TOKEN"
```

---

## Step 7: View API Documentation

The OpenAPI/Swagger documentation is available at:

```
http://localhost:3000/api-docs
```

This provides interactive API documentation where you can:
- Browse all endpoints
- See request/response schemas
- Test APIs directly from the browser
- View authentication requirements

---

## Step 8: Frontend Integration

To use these APIs in your frontend, create API client functions:

```typescript
// lib/api/moderation.ts
import { createSupabaseBrowserClient } from '@/database/client';

export async function submitAbuseReport(
  portfolioId: string,
  reason: string,
  description: string
) {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch('/api/abuse/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ portfolioId, reason, description }),
  });

  return response.json();
}

export async function getReviewQueue(status?: string, page = 1) {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  const params = new URLSearchParams({ page: page.toString() });
  if (status) params.append('status', status);

  const response = await fetch(`/api/admin/review-queue?${params}`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
    },
  });

  return response.json();
}
```

Create React components:

```typescript
// components/AbuseReportButton.tsx
import { useState } from 'react';
import { submitAbuseReport } from '@/lib/api/moderation';

export function AbuseReportButton({ portfolioId }: { portfolioId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    try {
      await submitAbuseReport(portfolioId, reason, description);
      alert('Report submitted successfully');
      setIsOpen(false);
    } catch (error) {
      alert('Failed to submit report');
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Report Abuse</button>
      {isOpen && (
        <div className="modal">
          <h2>Report Abuse</h2>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="inappropriate_content">Inappropriate Content</option>
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
          />
          <button onClick={handleSubmit}>Submit Report</button>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
        </div>
      )}
    </>
  );
}
```

---

## Step 9: Set Up Automated Tasks

### Scheduled Account Deletion (Cron Job)

Create a cron job to process pending deletions:

```typescript
// scripts/process-deletions.ts
import { createSupabaseServiceClient } from '../apps/web/src/database/client';
import { permanentlyDeleteUserData } from '../apps/web/src/lib/privacy/data-deletion';

async function processDeletions() {
  const supabase = createSupabaseServiceClient();

  // Find deletion requests that are ready
  const { data: requests } = await supabase
    .from('deletion_requests')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString());

  for (const request of requests || []) {
    try {
      await permanentlyDeleteUserData(request.user_id);

      // Mark as completed
      await supabase
        .from('deletion_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', request.id);

      console.log(`Deleted user: ${request.user_id}`);
    } catch (error) {
      console.error(`Failed to delete user ${request.user_id}:`, error);
    }
  }
}

processDeletions().then(() => process.exit(0));
```

Add to crontab (run daily at 2 AM):

```bash
# Edit crontab
crontab -e

# Add line:
0 2 * * * cd /path/to/RoleRabbit && node scripts/process-deletions.js
```

Or use Vercel Cron (in vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cron/process-deletions",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Audit Log Cleanup (Retention Policy)

Create a script to clean up old audit logs:

```typescript
// scripts/cleanup-audit-logs.ts
import { createSupabaseServiceClient } from '../apps/web/src/database/client';

async function cleanupAuditLogs() {
  const supabase = createSupabaseServiceClient();

  // Delete audit logs older than 1 year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .lt('created_at', oneYearAgo.toISOString());

  if (error) {
    console.error('Failed to cleanup audit logs:', error);
  } else {
    console.log('Audit logs cleaned up successfully');
  }
}

cleanupAuditLogs().then(() => process.exit(0));
```

---

## Step 10: Enable Cookie Consent

Add the CookieConsent component to your layout:

```typescript
// app/layout.tsx or pages/_app.tsx
import { CookieConsent } from '@/components/CookieConsent';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
```

---

## Step 11: Configure Pre-commit Hooks

The pre-commit hooks are already configured, but you need to activate them:

```bash
# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Test pre-commit hook
git add .
git commit -m "test: verify pre-commit hooks work"
# Should run linting, formatting, and type-checking
```

---

## Step 12: Set Up Monitoring (Production)

### Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

Configure in `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Datadog Monitoring (Optional)

```bash
npm install dd-trace
```

Add to `instrumentation.ts`:

```typescript
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    require('dd-trace').init();
  }
}
```

---

## Step 13: Create Admin Dashboard

Create an admin page to manage moderation:

```typescript
// app/admin/page.tsx
import { getReviewQueue } from '@/lib/api/moderation';

export default async function AdminDashboard() {
  const { data: queue } = await getReviewQueue('pending');

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Review Queue ({queue.length})</h2>
        {queue.map((item) => (
          <div key={item.id}>
            <p>Portfolio: {item.portfolioId}</p>
            <p>Priority: {item.priority}</p>
            <p>Score: {item.moderationResult.score}</p>
            <button>Approve</button>
            <button>Reject</button>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## Step 14: Testing Checklist

Before going to production, test these scenarios:

- [ ] User can report abusive portfolio
- [ ] Rate limiting works (try submitting 11 reports quickly)
- [ ] Moderator can view review queue
- [ ] Moderator can approve/reject content
- [ ] Admin can ban users
- [ ] User can schedule account deletion
- [ ] User can cancel account deletion within 30 days
- [ ] Account is deleted after 30 days
- [ ] User can export their data (GDPR)
- [ ] Audit logs are created for all actions
- [ ] Cookie consent banner appears
- [ ] Pre-commit hooks prevent bad commits
- [ ] API documentation is accessible at /api-docs

---

## Step 15: Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform (Vercel, Railway, etc.)

2. **Run migrations** in production database:
   ```bash
   # Connect to production DB
   psql $PRODUCTION_DATABASE_URL -f apps/web/src/database/migrations/018_create_audit_and_privacy_tables.sql
   psql $PRODUCTION_DATABASE_URL -f apps/web/src/database/migrations/019_create_moderation_and_security_tables.sql
   ```

3. **Enable HTTPS enforcement** (already in middleware/https.ts)

4. **Configure Redis** for rate limiting:
   ```bash
   # Set REDIS_URL in production
   REDIS_URL=redis://your-redis-host:6379
   ```

5. **Set up cron jobs** for automated tasks

6. **Configure SMTP** for email notifications

7. **Enable monitoring** (Sentry, Datadog)

8. **Review security headers** in middleware/csp.ts

---

## Troubleshooting

### "Module not found" errors

```bash
npm install
npm run build
```

### Database connection errors

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check migrations
psql $DATABASE_URL -c "\dt"
```

### Rate limiting not working

```bash
# Install Redis
# macOS: brew install redis
# Linux: sudo apt install redis

# Start Redis
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### Pre-commit hooks not running

```bash
# Reinstall Husky
rm -rf .husky
npm install
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

---

## Next Steps

1. **Create Admin UI** - Build dashboards for moderation
2. **Add Email Notifications** - Notify users of moderation actions
3. **Integrate File Scanning** - Connect VirusTotal API
4. **Set Up Monitoring Alerts** - Configure Sentry/Datadog alerts
5. **Write E2E Tests** - Test complete user flows
6. **Create User Documentation** - Based on USER_GUIDE.md
7. **Train Moderators** - Using RUNBOOKS.md procedures

---

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Check [DEVELOPMENT.md](docs/DEVELOPMENT.md)
3. Check [DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. Create a GitHub issue
5. Email: support@rolerabbit.com

---

**Congratulations! Your RoleRabbit platform is now fully activated with enterprise-grade security, moderation, and compliance features! 🎉**
