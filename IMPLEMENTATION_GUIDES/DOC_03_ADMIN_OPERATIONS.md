# Admin Documentation for Operations

## Overview
Internal documentation for operations team to manage, monitor, and troubleshoot the Files system in production.

**Audience**: DevOps, SRE, Support Engineers, System Administrators
**Priority**: P0 (Critical for production operations)
**Update Frequency**: After every major release

---

## 1️⃣ System Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                         │
│              (nginx/CloudFlare) - SSL Termination            │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼──────────┐          ┌────────▼────────┐
│   Frontend      │          │   API Server    │
│  (Next.js 14)   │          │  (Fastify 5.6)  │
│  Port: 3000     │          │  Port: 5000     │
└─────────────────┘          └────────┬────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
       ┌──────▼──────┐         ┌─────▼─────┐         ┌──────▼──────┐
       │  PostgreSQL │         │  Supabase │         │    Redis    │
       │  (Prisma)   │         │  Storage  │         │   (Cache)   │
       │  Port: 5432 │         │  (Files)  │         │  Port: 6379 │
       └─────────────┘         └───────────┘         └─────────────┘
```

### Key Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Frontend | Next.js 14 | 3000 | User interface |
| API | Fastify 5.6 | 5000 | REST API |
| Database | PostgreSQL | 5432 | Metadata, users, shares |
| File Storage | Supabase | - | Actual file storage |
| Cache | Redis | 6379 | Query caching, rate limiting |
| Monitoring | Sentry | - | Error tracking |
| Logs | CloudWatch | - | Application logs |

### Environment Variables

```bash
# API Server (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/rolerabbit"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJ..."
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
SENTRY_DSN="https://xxx@sentry.io/xxx"
NODE_ENV="production"
PORT=5000
```

---

## 2️⃣ Common Operations Tasks

### Viewing System Health

```bash
# Check API server status
curl https://api.rolerabbit.com/health

# Expected response:
{
  "status": "healthy",
  "uptime": 86400,
  "database": "connected",
  "storage": "connected",
  "redis": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Checking Database Connections

```bash
# SSH into API server
ssh production-api-01

# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# View active queries
psql $DATABASE_URL -c "
  SELECT pid, usename, application_name, state, query
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY query_start DESC;
"
```

### Monitoring File Storage Usage

```bash
# Via Supabase Dashboard
# Go to: Settings > Storage > Usage

# Or via API
curl https://api.rolerabbit.com/admin/storage/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Response:
{
  "totalFiles": 15234,
  "totalSize": "45.2 GB",
  "usageByUser": [
    {"userId": "...", "fileCount": 234, "size": "1.2 GB"},
    ...
  ],
  "storageLimit": "100 GB",
  "percentUsed": 45.2
}
```

### Viewing Redis Cache Stats

```bash
# Connect to Redis
redis-cli -h production-redis-01

# View cache hit ratio
INFO stats | grep keyspace_hits
INFO stats | grep keyspace_misses

# View cache size
DBSIZE

# Clear cache (USE WITH CAUTION)
FLUSHDB  # Clears current database only
# or
FLUSHALL # Clears ALL databases (DON'T DO THIS IN PROD!)
```

---

## 3️⃣ User Management

### Viewing User Details

```bash
# Via API
curl https://api.rolerabbit.com/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Via Database
psql $DATABASE_URL -c "
  SELECT id, email, subscription_tier, created_at, last_login
  FROM users
  WHERE id = 'USER_ID';
"
```

### Viewing User's Files

```sql
-- All files for a user
SELECT
  id, name, type, size, created_at, is_deleted
FROM storage_files
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;

-- Storage usage by user
SELECT
  user_id,
  COUNT(*) as file_count,
  SUM(size) as total_bytes,
  pg_size_pretty(SUM(size)::bigint) as total_size
FROM storage_files
WHERE is_deleted = false
GROUP BY user_id
ORDER BY SUM(size) DESC
LIMIT 10;
```

### Disabling a User Account

```bash
# Soft disable (prevents login, keeps data)
curl -X POST https://api.rolerabbit.com/admin/users/USER_ID/disable \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"reason": "Terms of Service violation"}'

# Database update
psql $DATABASE_URL -c "
  UPDATE users
  SET is_active = false, disabled_reason = 'TOS violation'
  WHERE id = 'USER_ID';
"
```

### Deleting User Data (GDPR)

```bash
# DANGER: This is irreversible!

# 1. Export user data first
curl https://api.rolerabbit.com/admin/users/USER_ID/export \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  > user_data_export.json

# 2. Delete user and all files
curl -X DELETE https://api.rolerabbit.com/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"confirm": true, "deleteFiles": true}'

# What gets deleted:
# - User account
# - All files in Supabase Storage
# - All file metadata
# - Share links
# - Comments
# - File versions
# - Audit logs (anonymized, not deleted)
```

---

## 4️⃣ File Management

### Finding a File

```bash
# By file ID
curl https://api.rolerabbit.com/admin/files/FILE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# By filename
psql $DATABASE_URL -c "
  SELECT id, user_id, name, size, created_at
  FROM storage_files
  WHERE name LIKE '%filename%'
  ORDER BY created_at DESC;
"
```

### Viewing File Metadata

```sql
-- Complete file details
SELECT
  f.id,
  f.name,
  f.type,
  pg_size_pretty(f.size::bigint) as size,
  f.storage_path,
  f.is_deleted,
  f.created_at,
  u.email as owner_email,
  COUNT(DISTINCT s.id) as share_count,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT v.id) as version_count
FROM storage_files f
LEFT JOIN users u ON f.user_id = u.id
LEFT JOIN file_shares s ON f.id = s.file_id
LEFT JOIN file_comments c ON f.id = c.file_id
LEFT JOIN file_versions v ON f.id = v.file_id
WHERE f.id = 'FILE_ID'
GROUP BY f.id, u.email;
```

### Manually Deleting a File (Abuse)

```bash
# Soft delete (user can restore)
curl -X DELETE https://api.rolerabbit.com/admin/files/FILE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Permanent delete (cannot be restored)
curl -X DELETE https://api.rolerabbit.com/admin/files/FILE_ID?permanent=true \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"reason": "DMCA takedown", "confirm": true}'

# This will:
# 1. Delete from Supabase Storage
# 2. Delete all versions
# 3. Revoke all share links
# 4. Mark file as deleted in database (for audit trail)
```

### Viewing Large Files

```sql
-- Top 20 largest files
SELECT
  f.id,
  f.name,
  pg_size_pretty(f.size::bigint) as size,
  u.email as owner,
  f.created_at
FROM storage_files f
JOIN users u ON f.user_id = u.id
WHERE f.is_deleted = false
ORDER BY f.size DESC
LIMIT 20;
```

---

## 5️⃣ Share Link Management

### Viewing Active Share Links

```sql
-- All active shares
SELECT
  s.id,
  s.token,
  f.name as file_name,
  u.email as owner_email,
  s.permission,
  s.download_count,
  s.max_downloads,
  s.expires_at,
  s.created_at
FROM file_shares s
JOIN storage_files f ON s.file_id = f.id
JOIN users u ON f.user_id = u.id
WHERE (s.expires_at IS NULL OR s.expires_at > NOW())
  AND (s.max_downloads IS NULL OR s.download_count < s.max_downloads)
ORDER BY s.created_at DESC
LIMIT 50;
```

### Revoking a Share Link

```bash
# Via API
curl -X DELETE https://api.rolerabbit.com/admin/shares/SHARE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"reason": "Abuse reported"}'

# Via Database
psql $DATABASE_URL -c "
  UPDATE file_shares
  SET expires_at = NOW()
  WHERE id = 'SHARE_ID';
"
```

### Finding Shares by Token

```bash
# User reports abuse with URL: https://rolerabbit.com/share/abc123xyz

# Find the share
psql $DATABASE_URL -c "
  SELECT
    s.id,
    f.name,
    u.email as owner,
    s.permission,
    s.download_count
  FROM file_shares s
  JOIN storage_files f ON s.file_id = f.id
  JOIN users u ON f.user_id = u.id
  WHERE s.token = 'abc123xyz';
"
```

---

## 6️⃣ Performance Monitoring

### Database Query Performance

```sql
-- Slow queries (> 1 second)
SELECT
  substring(query, 1, 100) as query_preview,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- milliseconds
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### API Response Times

```bash
# View in Sentry Dashboard
# Go to: Performance > Web Vitals

# Or via logs
grep "response_time" /var/log/api/production.log | \
  awk '{sum+=$NF; count++} END {print "Avg:", sum/count, "ms"}'
```

### Redis Cache Hit Rate

```bash
redis-cli INFO stats | grep -E 'keyspace_hits|keyspace_misses' | \
  awk '
    /keyspace_hits/ {hits=$2}
    /keyspace_misses/ {misses=$2}
    END {
      total=hits+misses
      rate=(hits/total)*100
      printf "Hit Rate: %.2f%% (%d hits, %d misses)\n", rate, hits, misses
    }
  '
```

---

## 7️⃣ Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore from backup
gunzip < backup_20240115_103000.sql.gz | psql $DATABASE_URL

# Verify backup (check row counts)
psql $DATABASE_URL -c "
  SELECT
    'users' as table_name, COUNT(*) as row_count FROM users
  UNION ALL
  SELECT 'storage_files', COUNT(*) FROM storage_files
  UNION ALL
  SELECT 'file_shares', COUNT(*) FROM file_shares;
"
```

### File Storage Backups

```bash
# Supabase Storage has automatic backups
# Access via Dashboard: Settings > Storage > Backups

# Manual backup (sync to S3)
rclone sync supabase:bucket-name s3:backup-bucket \
  --progress \
  --log-file=/var/log/backup.log

# Restore from S3
rclone sync s3:backup-bucket supabase:bucket-name \
  --progress \
  --dry-run  # TEST FIRST!
```

---

## 8️⃣ Troubleshooting

### Upload Failures

**Symptom**: Users report "Upload failed" errors

**Diagnosis**:
```bash
# 1. Check Supabase Storage status
curl https://status.supabase.com/api/v2/status.json

# 2. Check storage limits
curl https://api.rolerabbit.com/admin/storage/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Check API logs
tail -f /var/log/api/production.log | grep "upload"

# 4. Check Sentry for errors
# Go to Sentry > Issues > Filter by "upload"
```

**Common Causes**:
- Storage quota exceeded (upgrade plan)
- Supabase outage (check status page)
- File size exceeds limit (check user's plan)
- Invalid file type (check validation rules)

**Resolution**:
```bash
# If storage full, clean up deleted files
curl -X POST https://api.rolerabbit.com/admin/cleanup/deleted \
  -H "Authorization: Bearer ADMIN_TOKEN"

# If Supabase issue, wait for resolution
# Monitor: https://status.supabase.com
```

### Download Failures

**Symptom**: "Failed to download" errors

**Diagnosis**:
```bash
# 1. Check if file exists
psql $DATABASE_URL -c "
  SELECT id, name, storage_path, is_deleted
  FROM storage_files
  WHERE id = 'FILE_ID';
"

# 2. Check Supabase Storage
# Via Supabase Dashboard: Storage > Browse

# 3. Test signed URL generation
curl https://api.rolerabbit.com/api/storage/files/FILE_ID/download \
  -H "Authorization: Bearer USER_TOKEN" \
  -v
```

**Common Causes**:
- File deleted but metadata remains
- Supabase signed URL expired
- Permissions issue
- Network timeout (large files)

**Resolution**:
```sql
-- Re-sync metadata with actual storage
UPDATE storage_files
SET is_deleted = true
WHERE id NOT IN (
  -- List of files in Supabase Storage
  SELECT file_id FROM supabase_files_sync
);
```

### Performance Issues

**Symptom**: Slow file list loading

**Diagnosis**:
```bash
# 1. Check database query time
psql $DATABASE_URL -c "EXPLAIN ANALYZE
  SELECT * FROM storage_files
  WHERE user_id = 'USER_ID'
  AND is_deleted = false
  ORDER BY created_at DESC
  LIMIT 50;
"

# 2. Check Redis cache
redis-cli GET "files:USER_ID:page:1"

# 3. Check API response time
curl -w "@curl-format.txt" \
  https://api.rolerabbit.com/api/storage/files \
  -H "Authorization: Bearer TOKEN"
```

**Common Causes**:
- Missing database indexes
- Redis cache miss
- Too many files (need pagination)
- Large file thumbnails

**Resolution**:
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_storage_files_user_created
  ON storage_files(user_id, created_at DESC)
  WHERE is_deleted = false;

-- Warm up cache
curl https://api.rolerabbit.com/admin/cache/warm \
  -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 9️⃣ Security Incidents

### Suspected Account Compromise

**Steps**:
1. Immediately disable account
2. Revoke all sessions
3. Audit recent activity
4. Reset password
5. Enable 2FA
6. Notify user

```bash
# 1. Disable account
curl -X POST https://api.rolerabbit.com/admin/users/USER_ID/disable \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"reason": "Security incident"}'

# 2. Revoke all sessions
curl -X POST https://api.rolerabbit.com/admin/users/USER_ID/sessions/revoke-all \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Audit recent activity
psql $DATABASE_URL -c "
  SELECT
    action,
    file_id,
    ip_address,
    user_agent,
    created_at
  FROM audit_logs
  WHERE user_id = 'USER_ID'
    AND created_at > NOW() - INTERVAL '7 days'
  ORDER BY created_at DESC;
"

# 4. Send security alert email
curl -X POST https://api.rolerabbit.com/admin/users/USER_ID/notify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "type": "security_alert",
    "subject": "Suspicious activity detected",
    "message": "We detected suspicious activity. Your account has been temporarily locked."
  }'
```

### Malware Upload

**Steps**:
1. Quarantine file
2. Disable share links
3. Scan user's other files
4. Notify user
5. Consider account suspension

```bash
# 1. Quarantine (soft delete + flag)
psql $DATABASE_URL -c "
  UPDATE storage_files
  SET
    is_deleted = true,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{quarantined}',
      'true'
    )
  WHERE id = 'FILE_ID';
"

# 2. Revoke all share links
psql $DATABASE_URL -c "
  UPDATE file_shares
  SET expires_at = NOW()
  WHERE file_id = 'FILE_ID';
"

# 3. Scan user's files with ClamAV
# (See virus scanning implementation guide)

# 4. Log incident
curl -X POST https://api.rolerabbit.com/admin/incidents \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "type": "malware",
    "fileId": "FILE_ID",
    "userId": "USER_ID",
    "severity": "high",
    "actions": ["quarantined", "shares_revoked"]
  }'
```

---

## 🔟 Deployment Procedures

### Pre-Deployment Checklist

- ⬜ Code reviewed and approved
- ⬜ All tests passing (unit + integration)
- ⬜ Database migrations tested
- ⬜ Environment variables updated
- ⬜ Dependencies up to date
- ⬜ Sentry release created
- ⬜ Backup taken before deploy
- ⬜ Rollback plan documented
- ⬜ On-call engineer notified

### Zero-Downtime Deployment

```bash
# 1. Run database migrations
npm run migrate:deploy

# 2. Deploy new version (blue-green deployment)
# Deploy to "green" servers first
ansible-playbook deploy.yml --limit green

# 3. Health check on green servers
for server in green-01 green-02 green-03; do
  curl https://$server.internal/health
done

# 4. Switch traffic to green (via load balancer)
aws elb register-targets \
  --target-group-arn $GREEN_TARGET_GROUP \
  --targets $(cat green-servers.txt)

# 5. Monitor for errors (5 minutes)
watch -n 5 'curl https://api.rolerabbit.com/health'

# 6. If successful, decommission blue servers
# If issues, rollback:
aws elb register-targets \
  --target-group-arn $BLUE_TARGET_GROUP \
  --targets $(cat blue-servers.txt)
```

### Rollback Procedure

```bash
# 1. Switch load balancer back to previous version
aws elb register-targets --target-group-arn $PREVIOUS_VERSION

# 2. Revert database migrations (if needed)
npm run migrate:rollback

# 3. Clear Redis cache
redis-cli FLUSHDB

# 4. Notify team
slack-cli send "#engineering" "⚠️ Rolled back deployment due to [ISSUE]"

# 5. Create incident post-mortem
# Template: docs/incident-postmortem-template.md
```

---

## Monitoring Dashboards

### Grafana Dashboards

**System Health**:
- CPU/Memory/Disk usage
- API request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)

**Business Metrics**:
- Files uploaded (count, size)
- Active users
- Storage used
- Share link clicks

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API Error Rate | > 1% | > 5% |
| Response Time (p95) | > 500ms | > 2s |
| Database Connections | > 80% | > 95% |
| Storage Used | > 80% | > 95% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |

---

## Emergency Contacts

| Role | Name | Phone | Email | Slack |
|------|------|-------|-------|-------|
| On-Call Engineer | TBD | +1-XXX-XXX-XXXX | oncall@rolerabbit.com | @oncall |
| Engineering Lead | TBD | +1-XXX-XXX-XXXX | eng-lead@rolerabbit.com | @eng-lead |
| DevOps Lead | TBD | +1-XXX-XXX-XXXX | devops@rolerabbit.com | @devops |
| CTO | TBD | +1-XXX-XXX-XXXX | cto@rolerabbit.com | @cto |

---

## External Services

| Service | Status Page | Dashboard | Support |
|---------|-------------|-----------|---------|
| Supabase | status.supabase.com | app.supabase.com | support@supabase.com |
| AWS | status.aws.amazon.com | console.aws.amazon.com | aws-support |
| Sentry | status.sentry.io | sentry.io | support@sentry.io |
| Redis Cloud | status.redis.com | app.redis.com | support@redis.com |

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-01-15 | 1.0 | Initial documentation | Team |
| 2024-02-01 | 1.1 | Added incident procedures | DevOps |
| 2024-03-15 | 1.2 | Updated monitoring alerts | SRE |

---

**Last Updated**: 2024-01-15
**Next Review**: 2024-04-15 (quarterly)
