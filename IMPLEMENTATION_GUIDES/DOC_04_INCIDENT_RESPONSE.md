# Incident Response Runbook

## Overview
Step-by-step procedures for responding to production incidents affecting the Files system.

**Audience**: On-call engineers, SRE team, DevOps
**Priority**: P0 (Critical for production stability)
**Review Frequency**: Quarterly

---

## Incident Severity Levels

| Level | Impact | Response Time | Examples |
|-------|--------|---------------|----------|
| **SEV-1 (Critical)** | Complete service outage, data loss | 15 minutes | API down, database failure, widespread upload failures |
| **SEV-2 (High)** | Major feature unavailable | 1 hour | File preview broken, share links not working |
| **SEV-3 (Medium)** | Minor feature degradation | 4 hours | Slow response times, intermittent errors |
| **SEV-4 (Low)** | Cosmetic issues | Next business day | UI glitches, typos |

---

## General Incident Response Process

```
1. DETECT → 2. TRIAGE → 3. COMMUNICATE → 4. INVESTIGATE → 5. MITIGATE → 6. RESOLVE → 7. POST-MORTEM
```

### 1. Detect
- Monitoring alerts (Sentry, CloudWatch, Grafana)
- User reports (support tickets, social media)
- Internal team discovery

### 2. Triage (< 5 minutes)
- Assign severity level
- Page on-call engineer
- Create incident channel (#incident-YYYYMMDD-HH)

### 3. Communicate
- Post status page update
- Notify affected users (if SEV-1/SEV-2)
- Update incident channel every 30 minutes

### 4. Investigate
- Check logs, metrics, traces
- Identify root cause
- Document findings in incident doc

### 5. Mitigate
- Implement temporary fix
- Reduce blast radius
- Failover to backup systems

### 6. Resolve
- Deploy permanent fix
- Verify resolution
- Monitor for recurrence

### 7. Post-Mortem
- Write incident report
- Identify action items
- Schedule follow-up meeting

---

## SEV-1: API Server Down

### Symptoms
- `/health` endpoint returns 500 or times out
- Sentry: Spike in errors
- Grafana: 0 req/s on API dashboard

### Investigation Steps

```bash
# 1. Check if API process is running
ssh production-api-01
ps aux | grep node

# 2. Check API logs
tail -100 /var/log/api/error.log

# 3. Check system resources
top
df -h
free -m

# 4. Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# 5. Check Supabase status
curl https://status.supabase.com/api/v2/status.json
```

### Mitigation

**Option A: Restart API Server**
```bash
# Restart service
sudo systemctl restart rolerabbit-api

# Verify health
curl http://localhost:5000/health
```

**Option B: Failover to Standby**
```bash
# Switch load balancer to standby servers
aws elb deregister-targets --target-group-arn PRIMARY
aws elb register-targets --target-group-arn STANDBY

# Monitor
watch -n 5 'curl https://api.rolerabbit.com/health'
```

**Option C: Rollback Deployment**
```bash
# Revert to previous version
git checkout main@{1}
npm run deploy:rollback
```

### Communication Template

**Status Page Update:**
```
🔴 Major Outage - Files API Unavailable

We are currently investigating reports of API errors. 
Users may be unable to upload/download files.

Posted: 10:15 AM PST
Next update: 10:30 AM PST
```

**Resolution Update:**
```
✅ Resolved - Files API Restored

The issue has been resolved. API is fully operational.
Root cause: Database connection pool exhaustion.
Fix: Increased pool size from 20 to 50 connections.

Duration: 23 minutes
Posted: 10:38 AM PST
```

---

## SEV-1: Database Failure

### Symptoms
- All API requests return 500
- Logs show "ECONNREFUSED" or "Connection timeout"
- Grafana: Database connections = 0

### Investigation

```bash
# 1. Check database status
pg_isready -h $DB_HOST -p 5432

# 2. Check database connections
psql $DATABASE_URL -c "
  SELECT count(*), state
  FROM pg_stat_activity
  GROUP BY state;
"

# 3. Check for long-running queries
psql $DATABASE_URL -c "
  SELECT pid, now() - query_start as duration, query
  FROM pg_stat_activity
  WHERE state = 'active'
  ORDER BY duration DESC;
"

# 4. Check disk space
ssh db-server
df -h /var/lib/postgresql
```

### Mitigation

**Option A: Kill Long-Running Queries**
```sql
-- Kill specific query
SELECT pg_terminate_backend(PID);

-- Kill all idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < NOW() - INTERVAL '10 minutes';
```

**Option B: Failover to Read Replica**
```bash
# Promote read replica to primary
aws rds promote-read-replica --db-instance-identifier replica-01

# Update DATABASE_URL
heroku config:set DATABASE_URL="postgresql://replica-01..."

# Restart API servers
kubectl rollout restart deployment api
```

**Option C: Restore from Backup**
```bash
# LAST RESORT - Data loss possible!

# 1. Stop API servers
kubectl scale deployment api --replicas=0

# 2. Restore latest backup
aws rds restore-db-instance-from-snapshot \
  --db-instance-identifier restored-db \
  --db-snapshot-identifier snapshot-20240115

# 3. Update DNS/config to point to restored DB
# 4. Start API servers
# 5. Verify data integrity
```

---

## SEV-1: Storage System Failure

### Symptoms
- Upload errors: "Failed to upload file"
- Download errors: "File not found"
- Supabase status page shows outage

### Investigation

```bash
# 1. Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# 2. Test upload
curl -X POST https://api.rolerabbit.com/api/storage/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.txt"

# 3. Check storage usage
curl https://api.rolerabbit.com/admin/storage/stats

# 4. Check Supabase dashboard
# Go to: Dashboard > Storage > Logs
```

### Mitigation

**If Supabase Outage:**
```
1. Post status update (acknowledge issue)
2. Enable "Uploads disabled" banner in UI
3. Queue uploads for retry when service restored
4. Monitor Supabase status page
5. Re-enable when resolved
```

**If Storage Quota Exceeded:**
```bash
# 1. Emergency: Increase quota
# Via Supabase Dashboard: Settings > Billing > Upgrade

# 2. Clean up deleted files
curl -X POST https://api.rolerabbit.com/admin/cleanup/deleted

# 3. Notify large users to reduce usage
```

---

## SEV-2: File Upload Failures

### Symptoms
- Multiple user reports of upload failures
- Error rate > 5% on `/api/storage/files/upload`
- No system-wide outage

### Investigation

```bash
# 1. Check recent errors in Sentry
# Filter by: endpoint="/api/storage/files/upload"

# 2. Check API logs
grep "upload" /var/log/api/production.log | tail -100

# 3. Test upload as user
curl -X POST https://api.rolerabbit.com/api/storage/files/upload \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "file=@test.pdf" \
  -v

# 4. Check file size limits
psql $DATABASE_URL -c "
  SELECT user_id, subscription_tier
  FROM users
  WHERE id IN (SELECT DISTINCT user_id FROM upload_failures);
"
```

### Common Causes & Fixes

**1. File Size Limit Exceeded**
```
Fix: Update error message to clearly state limit
Code: "File size (15MB) exceeds limit for Free plan (10MB). Upgrade to Pro for 50MB files."
```

**2. Invalid File Type**
```javascript
// Fix: Allow all file types, remove validation
// Before:
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Unsupported file type');
}

// After:
// Accept all file types (validation happens in virus scanner)
```

**3. Network Timeout (Large Files)**
```javascript
// Fix: Increase timeout for uploads
fastify.server.timeout = 300000; // 5 minutes
```

---

## SEV-2: Performance Degradation

### Symptoms
- Slow page loads (> 3s)
- API response time > 2s (p95)
- User complaints about "slow" app

### Investigation

```bash
# 1. Check API response times
curl -w "@curl-format.txt" https://api.rolerabbit.com/api/storage/files

# 2. Check database query times
psql $DATABASE_URL -c "
  SELECT
    substring(query, 1, 50) as query,
    mean_exec_time,
    calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"

# 3. Check Redis cache hit rate
redis-cli INFO stats | grep keyspace

# 4. Check system resources
top
htop
iotop
```

### Mitigation

**1. Warm Up Cache**
```bash
curl -X POST https://api.rolerabbit.com/admin/cache/warm
```

**2. Add Missing Indexes**
```sql
-- Identify slow queries
EXPLAIN ANALYZE SELECT * FROM storage_files WHERE user_id = 'xxx';

-- Add index if missing
CREATE INDEX CONCURRENTLY idx_storage_files_user_id
  ON storage_files(user_id);
```

**3. Scale Up Resources**
```bash
# Horizontal scaling (add more API servers)
kubectl scale deployment api --replicas=5

# Vertical scaling (bigger instances)
aws ec2 modify-instance-attribute \
  --instance-id i-xxx \
  --instance-type t3.xlarge
```

---

## SEV-3: Share Links Not Working

### Symptoms
- Users report "Access denied" on share links
- Error: "Share link expired or invalid"

### Investigation

```bash
# 1. Test share link
curl https://rolerabbit.com/share/abc123xyz

# 2. Check share in database
psql $DATABASE_URL -c "
  SELECT
    id, file_id, token, permission,
    expires_at, max_downloads, download_count,
    created_at
  FROM file_shares
  WHERE token = 'abc123xyz';
"

# 3. Check file exists
psql $DATABASE_URL -c "
  SELECT id, name, is_deleted
  FROM storage_files
  WHERE id = (
    SELECT file_id FROM file_shares WHERE token = 'abc123xyz'
  );
"
```

### Common Causes

**1. Share Expired**
```sql
-- Extend expiration
UPDATE file_shares
SET expires_at = expires_at + INTERVAL '7 days'
WHERE token = 'abc123xyz';
```

**2. Download Limit Reached**
```sql
-- Increase limit
UPDATE file_shares
SET max_downloads = max_downloads + 10
WHERE token = 'abc123xyz';
```

**3. File Deleted**
```sql
-- Restore file
UPDATE storage_files
SET is_deleted = false, deleted_at = NULL
WHERE id = 'FILE_ID';
```

---

## Post-Incident Tasks

### Immediate (Within 24 hours)
- ⬜ Create incident post-mortem doc
- ⬜ Schedule post-mortem meeting
- ⬜ Update status page with final summary
- ⬜ Thank team members involved

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

## Incident Details
- **Date**: 2024-01-15
- **Duration**: 23 minutes (10:15 AM - 10:38 AM PST)
- **Severity**: SEV-1
- **Impact**: 100% of users unable to upload/download files

## Timeline
- 10:12 AM: Deployment completed
- 10:15 AM: Monitoring alerts triggered (high error rate)
- 10:17 AM: On-call engineer paged
- 10:20 AM: Incident declared, status page updated
- 10:25 AM: Root cause identified (database connection pool)
- 10:30 AM: Fix deployed (increased pool size)
- 10:35 AM: Service restored, monitoring
- 10:38 AM: Incident resolved

## Root Cause
Database connection pool exhausted due to:
1. Recent traffic increase (50% more users)
2. Pool size not scaled with traffic (still at default 20)
3. Long-running queries holding connections

## Impact
- 1,247 failed API requests
- 523 users affected
- $0 estimated revenue loss (free tier users)

## What Went Well
- Fast detection (3 minutes)
- Clear communication (status page updated within 5 min)
- Quick resolution (23 minutes total)

## What Went Wrong
- No alerting on connection pool usage
- Connection pool size not documented
- No automated scaling based on traffic

## Action Items
1. [P0] Add monitoring for DB connection pool usage (@alice)
2. [P0] Document connection pool configuration (@bob)
3. [P1] Implement auto-scaling for connection pool (@charlie)
4. [P1] Add load testing to CI/CD pipeline (@david)
5. [P2] Review all resource limits across services (@team)

## Lessons Learned
- Always load test before major traffic increases
- Monitor ALL resource utilization, not just CPU/memory
- Document all configuration settings

## Follow-Up Meeting
- **Date**: 2024-01-16, 2:00 PM PST
- **Attendees**: Engineering team, DevOps, Product
```

---

## Escalation Matrix

### Level 1: On-Call Engineer
- Handles SEV-3 and SEV-4 incidents
- Can escalate to Level 2 if needed

### Level 2: Engineering Lead
- Handles SEV-2 incidents
- Provides guidance to on-call engineer
- Makes deployment decisions

### Level 3: CTO + DevOps Lead
- Handles SEV-1 incidents
- Makes architecture decisions
- Approves emergency changes

### When to Escalate
- Incident duration > 1 hour
- Unable to identify root cause
- Requires architectural changes
- Affects > 50% of users

---

## Communication Guidelines

### Status Page Updates

**Investigating:**
```
🟡 Investigating - [Feature] Issues

We're investigating reports of [specific issue].
Users may experience [impact].

Posted: [Time]
Next update: [15 minutes from now]
```

**Identified:**
```
🟠 Identified - [Feature] Issues

We've identified the issue: [brief explanation].
Our team is working on a fix.

Posted: [Time]
Next update: [30 minutes from now]
```

**Monitoring:**
```
🟢 Monitoring - [Feature] Restored

A fix has been deployed. We're monitoring for stability.

Posted: [Time]
Next update: [1 hour from now]
```

**Resolved:**
```
✅ Resolved - [Feature] Fully Operational

The issue has been resolved.
Root cause: [brief explanation]
Duration: [X] minutes

Posted: [Time]
```

---

## Emergency Contacts

| Role | Primary | Secondary | Escalation |
|------|---------|-----------|------------|
| On-Call Engineer | [Name] | [Name] | Engineering Lead |
| Engineering Lead | [Name] | [Name] | CTO |
| DevOps Lead | [Name] | [Name] | CTO |
| CTO | [Name] | - | CEO |

**Emergency Slack**: `#incidents`
**Emergency Email**: `oncall@rolerabbit.com`
**Emergency Phone**: `+1-XXX-ONCALL`

---

## Tools & Access

| Tool | URL | Purpose |
|------|-----|---------|
| Status Page | https://status.rolerabbit.com | Incident communication |
| Sentry | https://sentry.io/rolerabbit | Error tracking |
| Grafana | https://grafana.rolerabbit.com | Metrics/dashboards |
| PagerDuty | https://rolerabbit.pagerduty.com | On-call scheduling |
| Incident.io | https://rolerabbit.incident.io | Incident management |

---

**Last Updated**: 2024-01-15
**Next Review**: 2024-04-15
**Owner**: DevOps Team
