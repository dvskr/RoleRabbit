# RoleRabbit Operational Runbooks

This document contains runbooks for responding to common incidents and operational tasks.

---

## Table of Contents

1. [Incident Response Overview](#incident-response-overview)
2. [Service Outage](#service-outage)
3. [Database Issues](#database-issues)
4. [Security Incidents](#security-incidents)
5. [Performance Degradation](#performance-degradation)
6. [Data Loss / Corruption](#data-loss--corruption)
7. [Deployment Rollback](#deployment-rollback)
8. [Scaling Operations](#scaling-operations)
9. [Monitoring & Alerts](#monitoring--alerts)

---

## Incident Response Overview

### Severity Levels

**SEV-1 (Critical)**
- Complete service outage
- Data breach
- Severe security vulnerability
- **Response Time:** Immediate (24/7)
- **Communication:** Every 30 minutes

**SEV-2 (High)**
- Partial service degradation
- Performance issues affecting >50% users
- Non-critical security issue
- **Response Time:** Within 1 hour
- **Communication:** Every 2 hours

**SEV-3 (Medium)**
- Minor feature broken
- Performance issues affecting <50% users
- **Response Time:** Within 4 hours
- **Communication:** Daily updates

**SEV-4 (Low)**
- Cosmetic issues
- Feature requests
- **Response Time:** Next business day
- **Communication:** As needed

### Incident Response Process

```
1. Detection → 2. Assessment → 3. Response → 4. Resolution → 5. Post-Mortem
```

**1. Detection**
- Alert triggered
- User report
- Monitoring dashboard

**2. Assessment**
- Determine severity
- Identify impact
- Assign incident commander

**3. Response**
- Follow runbook
- Escalate if needed
- Communicate with stakeholders

**4. Resolution**
- Fix applied
- Verify resolution
- Monitor for regression

**5. Post-Mortem**
- Within 48 hours
- Root cause analysis
- Action items
- Share learnings

---

## Service Outage

### Symptoms
- Site returns 500/503 errors
- Site completely unresponsive
- API requests failing
- No traffic reaching application

### Detection
```bash
# Check site status
curl -I https://rolerabbit.com
# Should return 200 OK

# Check health endpoint
curl https://rolerabbit.com/api/health
```

### Immediate Actions

**Step 1: Verify Outage**

```bash
# Check from multiple locations
curl https://rolerabbit.com
# Try from different network/device

# Check status page
open https://status.rolerabbit.com
```

**Step 2: Check Infrastructure**

```bash
# Vercel Dashboard
vercel ls
vercel logs [deployment-url] --follow

# AWS ECS (if applicable)
aws ecs list-services --cluster rolerabbit-cluster
aws ecs describe-services --cluster rolerabbit-cluster --services rolerabbit-api

# Railway (if applicable)
railway status
railway logs
```

**Step 3: Check Dependencies**

```bash
# Database
psql $DATABASE_URL -c "SELECT 1;"

# Supabase
curl https://[PROJECT_ID].supabase.co/rest/v1/
# Should return Supabase API response

# Redis (if applicable)
redis-cli ping
# Should return PONG
```

**Step 4: Check Recent Changes**

```bash
# Check recent deployments
git log -5 --oneline
vercel deployments ls --limit 5

# Check if related to recent deployment
# Compare deployment time with outage start
```

### Resolution Steps

**Option 1: Rollback Deployment**

```bash
# Vercel
vercel rollback [previous-deployment-url]

# Railway
railway rollback

# AWS ECS - Update to previous task definition
aws ecs update-service \
  --cluster rolerabbit-cluster \
  --service rolerabbit-api \
  --task-definition rolerabbit-api:PREVIOUS_VERSION
```

**Option 2: Restart Service**

```bash
# Vercel - Redeploy
vercel --prod

# Railway
railway restart

# AWS ECS
aws ecs update-service \
  --cluster rolerabbit-cluster \
  --service rolerabbit-api \
  --force-new-deployment
```

**Option 3: Scale Up**

```bash
# If capacity issue, scale up
# AWS ECS
aws ecs update-service \
  --cluster rolerabbit-cluster \
  --service rolerabbit-api \
  --desired-count 3  # Increase from 1 to 3
```

### Verification

```bash
# Verify site is up
curl -I https://rolerabbit.com
# Should return 200 OK

# Verify API works
curl https://rolerabbit.com/api/health
# Should return { "status": "ok" }

# Check error rate in monitoring
# Sentry, Datadog, etc.
```

### Communication Template

```
[RESOLVED] Service Outage - January 15, 2025

Impact: Complete service outage from 10:00 AM - 10:45 AM PST
Affected: All users
Root Cause: [Brief description]
Resolution: [What was done]

Timeline:
10:00 AM - Outage detected
10:05 AM - Incident declared (SEV-1)
10:10 AM - Root cause identified
10:30 AM - Fix deployed
10:45 AM - Service fully restored

We apologize for the inconvenience. A detailed post-mortem will be shared within 48 hours.
```

---

## Database Issues

### High CPU Usage

**Symptoms:**
- Slow queries
- API timeouts
- Database CPU >80%

**Detection:**

```sql
-- Check active queries
SELECT pid, usename, state, query_start, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Check long-running queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - query_start > interval '30 seconds'
ORDER BY duration DESC;
```

**Resolution:**

```sql
-- Kill long-running query (if safe)
SELECT pg_terminate_backend(PID);

-- Check for missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';

-- Analyze table statistics
ANALYZE portfolios;
VACUUM ANALYZE portfolios;
```

**Add Missing Indexes:**

```sql
-- Common indexes
CREATE INDEX CONCURRENTLY idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX CONCURRENTLY idx_portfolios_subdomain ON portfolios(subdomain);
CREATE INDEX CONCURRENTLY idx_portfolios_published ON portfolios(published) WHERE published = true;
```

### Connection Pool Exhausted

**Symptoms:**
- "Too many clients already" errors
- Connection timeouts
- Application can't connect

**Detection:**

```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Show max connections
SHOW max_connections;

-- Check connection by state
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;
```

**Resolution:**

```sql
-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < now() - interval '10 minutes'
  AND pid != pg_backend_pid();

-- Kill specific application connections (if safe)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE application_name = 'rolerabbit-api'
  AND state = 'idle';
```

**Prevention:**

```typescript
// Reduce connection pool size
// database/client.ts
const supabase = createClient(url, key, {
  db: {
    poolSize: 10,  // Adjust based on load
  },
});
```

### Database Migration Failed

**Symptoms:**
- Deployment failed
- Site shows errors about missing columns/tables
- Migration script exited with error

**Detection:**

```bash
# Check migration status
npm run db:migrate:status

# Check database schema
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\d portfolios"  # Describe table
```

**Resolution:**

**Option 1: Rollback and Retry**

```bash
# Rollback failed migration
npm run db:migrate:down

# Fix migration file
# Then retry
npm run db:migrate
```

**Option 2: Manual Fix**

```sql
-- If migration partially applied, check what's missing
-- Example: Migration added column but failed after
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';

-- Mark migration as completed
INSERT INTO schema_migrations (version) VALUES ('020');
```

**Option 3: Reset (Development Only!)**

```bash
# ⚠️ WARNING: Destroys all data
npm run db:reset
npm run db:migrate
npm run db:seed
```

---

## Security Incidents

### Suspected Data Breach

**Immediate Actions (SEV-1):**

**Step 1: Contain (0-15 minutes)**

```bash
# 1. Rotate all secrets immediately
# Generate new secrets
openssl rand -base64 32  # New JWT_SECRET
openssl rand -base64 32  # New ENCRYPTION_KEY

# 2. Update secrets in all environments
# AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id rolerabbit/production/jwt \
  --secret-string "NEW_SECRET"

# 3. Force logout all users
# Invalidate all sessions
psql $DATABASE_URL -c "DELETE FROM user_sessions;"
```

**Step 2: Assess (15-60 minutes)**

```sql
-- Check for suspicious activity
SELECT *
FROM security_logs
WHERE event_type IN ('UNAUTHORIZED_ACCESS', 'SUSPICIOUS_IP', 'BRUTE_FORCE')
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- Check affected users
SELECT DISTINCT user_id
FROM audit_logs
WHERE created_at BETWEEN '[INCIDENT_START]' AND '[INCIDENT_END]'
  AND action IN ('data.exported', 'data.accessed');

-- Check for data exfiltration
SELECT user_id, count(*) as export_count
FROM audit_logs
WHERE action = 'data.exported'
  AND created_at > now() - interval '24 hours'
GROUP BY user_id
HAVING count(*) > 5;  -- Unusual number of exports
```

**Step 3: Notify (Within 72 hours for GDPR)**

```typescript
// Send notification to affected users
import { sendSecurityNotification } from '@/lib/email';

const affectedUsers = await getAffectedUsers(incidentId);

for (const user of affectedUsers) {
  await sendSecurityNotification(user.email, {
    subject: 'Security Incident Notification',
    incidentType: 'data_breach',
    affectedData: ['email', 'profile_data'],
    actions: ['Password reset required', 'Review account activity'],
  });
}
```

**Step 4: Document**

```markdown
# Security Incident Report

**Incident ID:** INC-2025-001
**Severity:** SEV-1
**Detected:** 2025-01-15 10:00 PST
**Contained:** 2025-01-15 10:30 PST

## Summary
[Brief description of what happened]

## Impact
- Affected users: [Number]
- Data exposed: [Types of data]
- Duration: [How long breach was active]

## Root Cause
[What vulnerability was exploited]

## Response Actions
1. [Action taken with timestamp]
2. [Action taken with timestamp]

## Remediation
- [ ] Patch vulnerability
- [ ] Reset all user passwords
- [ ] Audit access logs
- [ ] Update security policies

## Lessons Learned
[What we learned and how to prevent in future]
```

### Brute Force Attack

**Detection:**

```sql
-- Check for failed login attempts
SELECT ip_address, count(*) as attempts
FROM security_logs
WHERE event_type = 'LOGIN_FAILURE'
  AND created_at > now() - interval '1 hour'
GROUP BY ip_address
HAVING count(*) > 10
ORDER BY attempts DESC;
```

**Resolution:**

```sql
-- Block IP addresses
INSERT INTO ip_blocklist (ip_address, reason, blocked_until)
VALUES
  ('192.168.1.1', 'Brute force attack', now() + interval '24 hours'),
  ('192.168.1.2', 'Brute force attack', now() + interval '24 hours');

-- Or update rate limiter
-- Manually add to blocked IPs in rate limiter
```

```typescript
// Update rate limiter
import { applyAccountRestriction } from '@/lib/rate-limiting';

await applyAccountRestriction(
  userId,
  'all',
  24,  // 24 hours
  'Brute force attack detected'
);
```

---

## Performance Degradation

### High Response Times

**Detection:**

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://rolerabbit.com/api/portfolios

# curl-format.txt:
# time_total:  %{time_total}s
# time_connect: %{time_connect}s
# time_starttransfer: %{time_starttransfer}s
```

**Diagnosis:**

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table bloat
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Resolution:**

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_portfolios_user_id_published
ON portfolios(user_id, published);

-- Vacuum tables
VACUUM ANALYZE portfolios;
VACUUM ANALYZE users;

-- Reindex if needed
REINDEX TABLE portfolios;
```

```typescript
// Add caching
import { cacheManager } from '@/lib/cache';

export async function getPortfolios(userId: string) {
  return await cacheManager.wrap(
    `portfolios:${userId}`,
    async () => {
      return await fetchPortfoliosFromDb(userId);
    },
    { ttl: 300 }  // Cache for 5 minutes
  );
}
```

---

## Data Loss / Corruption

### Accidental Data Deletion

**Detection:**

```sql
-- Check audit logs for recent deletions
SELECT *
FROM audit_logs
WHERE action LIKE '%.deleted'
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

**Recovery:**

```bash
# 1. Find latest backup before deletion
aws s3 ls s3://rolerabbit-backups/ --recursive | grep "2025-01-15"

# 2. Download backup
aws s3 cp s3://rolerabbit-backups/2025-01-15-10-00.sql.gz ./backup.sql.gz

# 3. Extract specific data
gunzip backup.sql.gz

# 4. Restore specific table/data
psql $DATABASE_URL < restore.sql
```

**Prevention:**

```sql
-- Enable soft deletes
ALTER TABLE portfolios ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE portfolios ADD COLUMN deleted_by UUID REFERENCES users(id);

-- Update queries to exclude soft-deleted
-- WHERE deleted_at IS NULL
```

### Database Corruption

**Detection:**

```sql
-- Check for corruption
SELECT * FROM pg_stat_database WHERE datname = 'rolerabbit';

-- Verify table integrity
SELECT pg_relation_size('portfolios');
```

**Resolution:**

```bash
# 1. Take immediate backup
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Try to repair
psql $DATABASE_URL -c "REINDEX DATABASE rolerabbit;"

# 3. If corruption severe, restore from backup
# See backup restoration procedure
```

---

## Deployment Rollback

### When to Rollback

- Critical bug in production
- Performance degradation >50%
- Security vulnerability introduced
- Database migration failed

### Rollback Procedure

**Vercel:**

```bash
# 1. List recent deployments
vercel deployments ls --limit 5

# 2. Identify last known good deployment
# 3. Rollback
vercel rollback [PREVIOUS_DEPLOYMENT_URL]

# 4. Verify
curl -I https://rolerabbit.com
```

**Railway:**

```bash
# 1. View deployments
railway deployments

# 2. Rollback
railway rollback [DEPLOYMENT_ID]
```

**AWS ECS:**

```bash
# 1. List task definitions
aws ecs list-task-definitions --family-prefix rolerabbit-api

# 2. Update service to previous version
aws ecs update-service \
  --cluster rolerabbit-cluster \
  --service rolerabbit-api \
  --task-definition rolerabbit-api:PREVIOUS_VERSION

# 3. Wait for deployment
aws ecs wait services-stable \
  --cluster rolerabbit-cluster \
  --services rolerabbit-api
```

### Database Rollback

```bash
# 1. Identify migration to rollback
npm run db:migrate:status

# 2. Rollback migration
npm run db:migrate:down

# 3. Verify schema
psql $DATABASE_URL -c "\d portfolios"
```

---

## Scaling Operations

### Scale Up (Increased Load)

**Horizontal Scaling:**

```bash
# AWS ECS - Increase task count
aws ecs update-service \
  --cluster rolerabbit-cluster \
  --service rolerabbit-api \
  --desired-count 5  # Increase from 2 to 5

# Railway - Scale service
railway scale --replicas 3
```

**Vertical Scaling:**

```bash
# Update task definition with more CPU/memory
aws ecs register-task-definition \
  --family rolerabbit-api \
  --cpu 1024 \
  --memory 2048
```

**Database Scaling:**

```bash
# Supabase - Upgrade plan via dashboard
# AWS RDS - Modify instance class
aws rds modify-db-instance \
  --db-instance-identifier rolerabbit-db \
  --db-instance-class db.t3.large \
  --apply-immediately
```

### Scale Down (Reduced Load)

```bash
# Reduce ECS tasks
aws ecs update-service \
  --cluster rolerabbit-cluster \
  --service rolerabbit-api \
  --desired-count 1
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

**Application:**
- Response time (p50, p95, p99)
- Error rate
- Request volume
- Active users

**Database:**
- CPU usage
- Connection count
- Query performance
- Storage usage

**Infrastructure:**
- Memory usage
- CPU usage
- Network I/O
- Disk usage

### Alert Thresholds

```yaml
# Example alert configuration (Datadog, Prometheus, etc.)

alerts:
  - name: "High Error Rate"
    condition: error_rate > 5%
    duration: 5m
    severity: SEV-2

  - name: "Database CPU High"
    condition: db_cpu > 80%
    duration: 10m
    severity: SEV-2

  - name: "Response Time Slow"
    condition: p95_response_time > 1000ms
    duration: 5m
    severity: SEV-3

  - name: "Service Down"
    condition: uptime < 100%
    duration: 1m
    severity: SEV-1
```

### Log Investigation

```bash
# Search logs for errors
# Vercel
vercel logs [deployment-url] | grep ERROR

# AWS CloudWatch
aws logs filter-log-events \
  --log-group-name /aws/ecs/rolerabbit \
  --filter-pattern "ERROR"

# Search for specific user
aws logs filter-log-events \
  --log-group-name /aws/ecs/rolerabbit \
  --filter-pattern "user-123"
```

---

## Post-Incident Review Template

```markdown
# Post-Incident Review: [INCIDENT_TITLE]

**Date:** 2025-01-15
**Severity:** SEV-1
**Duration:** 45 minutes
**Incident Commander:** [Name]

## Summary
[Brief description of incident]

## Impact
- Users affected: [Number/percentage]
- Revenue impact: [If applicable]
- Data loss: [None/Description]

## Timeline
- 10:00 AM - Incident detected
- 10:05 AM - SEV-1 declared
- 10:10 AM - Root cause identified
- 10:30 AM - Fix applied
- 10:45 AM - Incident resolved
- 11:00 AM - Monitoring continued

## Root Cause
[Detailed description of what caused the incident]

## Resolution
[What was done to fix it]

## What Went Well
- [Positive aspect 1]
- [Positive aspect 2]

## What Didn't Go Well
- [Issue 1]
- [Issue 2]

## Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

## Lessons Learned
[Key takeaways and how to prevent in future]
```

---

**Last Updated:** January 15, 2025
**Maintained By:** DevOps Team
**Review Schedule:** Quarterly
