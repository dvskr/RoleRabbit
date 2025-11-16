# RoleRabbit Operations Runbook

Troubleshooting guide for common issues (Sections 4.8-4.9)

## Table of Contents

- [Deployment Failures](#deployment-failures)
- [Database Connection Errors](#database-connection-errors)
- [Job Queue Stuck](#job-queue-stuck)
- [High Error Rates](#high-error-rates)
- [Performance Issues](#performance-issues)
- [Security Incidents](#security-incidents)

## Quick Reference

| Issue | Severity | Response Time | Escalation |
|-------|----------|---------------|------------|
| Deployment Failure | High | 15 min | +30 min |
| Database Down | Critical | 5 min | +15 min |
| Queue Stuck | Medium | 30 min | +1 hour |
| High Error Rate | High | 15 min | +30 min |
| Security Breach | Critical | Immediate | Immediate |

## Deployment Failures

### Symptoms
- Deployment job fails in CI/CD
- Pods failing to start
- Rollout stuck
- Health checks failing

### Diagnosis

```bash
# Check deployment status
kubectl get deployments -n rolerabbit-production
kubectl rollout status deployment/rolerabbit-api -n rolerabbit-production

# Check pod status
kubectl get pods -n rolerabbit-production
kubectl describe pod <pod-name> -n rolerabbit-production

# Check pod logs
kubectl logs <pod-name> -n rolerabbit-production --tail=100

# Check events
kubectl get events -n rolerabbit-production --sort-by='.lastTimestamp'
```

### Resolution

**1. Image Pull Errors**
```bash
# Check image exists
docker pull ghcr.io/rolerabbit/app:latest

# Verify registry credentials
kubectl get secret regcred -n rolerabbit-production -o yaml
```

**2. Application Errors**
```bash
# Check environment variables
kubectl get configmap rolerabbit-config -n rolerabbit-production -o yaml
kubectl get secret rolerabbit-secrets -n rolerabbit-production

# Update config
kubectl edit configmap rolerabbit-config -n rolerabbit-production
kubectl rollout restart deployment/rolerabbit-api -n rolerabbit-production
```

**3. Resource Limits**
```bash
# Check resource usage
kubectl top pods -n rolerabbit-production

# Increase limits if needed
kubectl edit deployment rolerabbit-api -n rolerabbit-production
# Update resources.limits.memory and resources.limits.cpu
```

**4. Rollback**
```bash
# Quick rollback
./scripts/rollback.sh

# Manual rollback
kubectl rollout undo deployment/rolerabbit-api -n rolerabbit-production
kubectl rollout status deployment/rolerabbit-api -n rolerabbit-production
```

## Database Connection Errors

### Symptoms
- "Connection refused" errors
- "Too many connections" errors
- Slow query performance
- Connection timeouts

### Diagnosis

```bash
# Check database status
kubectl exec -it <api-pod> -n rolerabbit-production -- \
  psql $DATABASE_URL -c "SELECT version();"

# Check connections
psql $DATABASE_URL -c "
  SELECT count(*) as connections,
         state,
         wait_event_type
  FROM pg_stat_activity
  GROUP BY state, wait_event_type;"

# Check for long-running queries
psql $DATABASE_URL -c "
  SELECT pid, now() - query_start as duration, query
  FROM pg_stat_activity
  WHERE state = 'active'
  ORDER BY duration DESC;"
```

### Resolution

**1. Too Many Connections**
```bash
# Check current settings
psql $DATABASE_URL -c "SHOW max_connections;"
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Terminate idle connections
psql $DATABASE_URL -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
    AND state_change < now() - interval '1 hour';"

# Reduce connection pool size
kubectl set env deployment/rolerabbit-api \
  DB_POOL_MAX=15 -n rolerabbit-production
```

**2. Connection Timeout**
```bash
# Check network connectivity
kubectl exec -it <api-pod> -n rolerabbit-production -- \
  nc -zv <db-host> 5432

# Check firewall rules
# Ensure API server IPs are whitelisted

# Increase timeout
kubectl set env deployment/rolerabbit-api \
  DB_TIMEOUT=30000 -n rolerabbit-production
```

**3. Slow Queries**
```bash
# Enable slow query log
psql $DATABASE_URL -c "
  ALTER SYSTEM SET log_min_duration_statement = 1000;
  SELECT pg_reload_conf();"

# Analyze slow queries
psql $DATABASE_URL -c "
  SELECT query, calls, total_exec_time, mean_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;"

# Run VACUUM ANALYZE
psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

## Job Queue Stuck

### Symptoms
- Jobs piling up in waiting state
- No job completions
- Worker pods not processing
- Queue dashboard shows 0 active workers

### Diagnosis

```bash
# Check queue stats
curl http://localhost:3000/api/admin/queues

# Check worker pods
kubectl get pods -l app=rolerabbit-deployment-worker -n rolerabbit-production
kubectl logs -l app=rolerabbit-deployment-worker -n rolerabbit-production --tail=50

# Check Redis connection
kubectl exec -it <api-pod> -n rolerabbit-production -- \
  redis-cli -u $REDIS_URL ping
```

### Resolution

**1. Workers Not Running**
```bash
# Check worker status
kubectl get deployment rolerabbit-deployment-worker -n rolerabbit-production

# Scale up workers
kubectl scale deployment rolerabbit-deployment-worker \
  --replicas=4 -n rolerabbit-production

# Restart workers
kubectl rollout restart deployment/rolerabbit-deployment-worker \
  -n rolerabbit-production
```

**2. Redis Connection Issues**
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check Redis memory
redis-cli -u $REDIS_URL info memory

# Flush queue if corrupted (CAUTION!)
redis-cli -u $REDIS_URL FLUSHDB
```

**3. Stalled Jobs**
```bash
# Clean failed jobs
npm run queue:clean

# Retry failed jobs
node scripts/retry-failed-jobs.ts

# Clear queue and restart (LAST RESORT)
redis-cli -u $REDIS_URL DEL bull:deployment:*
kubectl rollout restart deployment/rolerabbit-deployment-worker
```

## High Error Rates

### Symptoms
- Error rate >5% in metrics
- Sentry showing many errors
- Users reporting failures
- Alert fired: HighAPIErrorRate

### Diagnosis

```bash
# Check error metrics
curl http://localhost:3000/api/metrics | grep rolerabbit_errors_total

# Check recent errors in Sentry
# Go to: https://sentry.io/organizations/rolerabbit/issues/

# Check application logs
kubectl logs -l app=rolerabbit-api -n rolerabbit-production \
  --tail=100 | jq 'select(.level == "error")'

# Check error distribution
kubectl logs -l app=rolerabbit-api -n rolerabbit-production \
  --since=1h | jq -r '.error.message' | sort | uniq -c | sort -rn
```

### Resolution

**1. Third-party Service Down**
```bash
# Check external service status
curl -I https://api.stripe.com/v1
curl -I https://api.cloudflare.com/client/v4

# Enable circuit breaker or disable feature
kubectl set env deployment/rolerabbit-api \
  FEATURE_STRIPE_ENABLED=false
```

**2. Memory Leak**
```bash
# Check memory usage
kubectl top pods -l app=rolerabbit-api

# Take heap snapshot
kubectl exec -it <api-pod> -- \
  kill -USR2 $(pgrep -f node)

# Restart pods one by one
kubectl delete pod <pod-name> -n rolerabbit-production
# Wait for new pod to be healthy before deleting next
```

**3. Bad Deployment**
```bash
# Rollback to previous version
./scripts/rollback.sh

# Or manual rollback
kubectl rollout undo deployment/rolerabbit-api
```

## Performance Issues

### Symptoms
- Slow response times
- High latency in metrics
- Database CPU at 100%
- Pods using max CPU/memory

### Diagnosis

```bash
# Check response time metrics
curl http://localhost:3000/api/metrics | grep http_request_duration

# Check resource usage
kubectl top pods -n rolerabbit-production
kubectl top nodes

# Check database performance
psql $DATABASE_URL -c "
  SELECT * FROM pg_stat_activity
  WHERE state = 'active'
  ORDER BY query_start;"
```

### Resolution

**1. Scale Up**
```bash
# Scale API servers
kubectl scale deployment rolerabbit-api --replicas=6

# Scale workers
kubectl scale deployment rolerabbit-deployment-worker --replicas=4
```

**2. Optimize Database**
```bash
# Run ANALYZE
psql $DATABASE_URL -c "ANALYZE;"

# Refresh materialized views
psql $DATABASE_URL -c "
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_analytics_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_analytics_yearly;"

# Check missing indexes
psql $DATABASE_URL -c "
  SELECT schemaname, tablename, attname, n_distinct, correlation
  FROM pg_stats
  WHERE schemaname = 'public'
    AND n_distinct > 100
    AND correlation < 0.1;"
```

**3. Clear Cache**
```bash
# Clear Redis cache
redis-cli -u $REDIS_URL FLUSHDB

# Invalidate CDN cache
npm run cdn:purge-all
```

## Security Incidents

### Symptoms
- Unauthorized access detected
- Unusual traffic patterns
- Failed login attempts spike
- Data breach suspected

### Immediate Actions

**1. Assess Scope**
```bash
# Check recent logins
psql $DATABASE_URL -c "
  SELECT * FROM auth_logs
  WHERE created_at > now() - interval '1 hour'
  ORDER BY created_at DESC;"

# Check API logs for suspicious activity
kubectl logs -l app=rolerabbit-api --since=1h | \
  jq 'select(.statusCode >= 400)'
```

**2. Contain**
```bash
# Block suspicious IPs in firewall
# Update security groups / network policies

# Revoke compromised API keys
./scripts/rotate-secrets.ts force-rotate

# Force logout all users
redis-cli -u $REDIS_URL FLUSHDB
```

**3. Investigate**
```bash
# Export logs for analysis
kubectl logs -l app=rolerabbit-api --since=24h > incident-logs.json

# Check database for unauthorized changes
psql $DATABASE_URL -c "
  SELECT * FROM portfolios
  WHERE updated_at > now() - interval '1 hour'
  ORDER BY updated_at DESC;"

# Review Sentry for errors
# Check for SQL injection, XSS attempts
```

**4. Notify**
```bash
# Notify team
# Post in #security-incidents Slack channel

# Notify users if data compromised
# Send email via Resend

# Update status page
# https://status.rolerabbit.com
```

**5. Document**
```bash
# Create incident report
cat > incidents/$(date +%Y-%m-%d)-security-incident.md <<EOF
# Security Incident Report

**Date**: $(date)
**Severity**: [Critical/High/Medium]
**Status**: [Investigating/Contained/Resolved]

## Timeline
- [Time] - Incident detected
- [Time] - Team notified
- [Time] - Containment actions taken

## Impact
- Users affected: [Number]
- Data compromised: [Yes/No/Unknown]
- Services affected: [List]

## Root Cause
[Analysis of how incident occurred]

## Resolution
[Steps taken to resolve]

## Prevention
[Measures to prevent recurrence]
EOF
```

## Common Commands

### Deployments
```bash
# List deployments
kubectl get deployments -n rolerabbit-production

# Describe deployment
kubectl describe deployment rolerabbit-api -n rolerabbit-production

# Update image
kubectl set image deployment/rolerabbit-api \
  api=ghcr.io/rolerabbit/app:v1.2.3

# Rollback
kubectl rollout undo deployment/rolerabbit-api

# Scale
kubectl scale deployment rolerabbit-api --replicas=5
```

### Pods
```bash
# List pods
kubectl get pods -n rolerabbit-production

# Logs
kubectl logs <pod-name> --tail=100 --follow

# Execute command
kubectl exec -it <pod-name> -- /bin/bash

# Delete pod (will be recreated)
kubectl delete pod <pod-name>
```

### Database
```bash
# Connect
psql $DATABASE_URL

# Backup
./scripts/backup-database.sh

# Restore
./scripts/restore-database.sh <backup-file>

# Migrations
npm run db:migrate
```

### Secrets
```bash
# List secrets
npm run rotate-secrets list

# Rotate secret
npm run rotate-secrets rotate rolerabbit/database/password

# Verify rotation
npm run rotate-secrets verify rolerabbit/jwt/secret
```

## Escalation Contacts

| Role | Contact | Response Time |
|------|---------|---------------|
| On-Call Engineer | PagerDuty | 15 min |
| Senior Engineer | Slack @senior-eng | 30 min |
| Engineering Manager | Phone | 1 hour |
| CTO | Email/Phone | 2 hours |

## External Services

| Service | Status Page | Support |
|---------|-------------|---------|
| Supabase | status.supabase.io | support@supabase.com |
| Cloudflare | cloudflarestatus.com | Enterprise Support |
| Stripe | status.stripe.com | support@stripe.com |
| Vercel | vercel-status.com | support@vercel.com |

## Post-Incident Actions

1. **Write Postmortem** (within 48 hours)
2. **Share Learnings** (team meeting)
3. **Implement Fixes** (assign owners and due dates)
4. **Update Runbook** (add new scenarios)
5. **Review Alerts** (adjust thresholds if needed)
