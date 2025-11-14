# RoleRabbit Deployment Rollback Plan

## Overview

This document provides a comprehensive rollback strategy for the RoleRabbit Templates system. Follow these procedures when a deployment causes critical issues that cannot be hot-fixed.

**Critical Information:**
- **Decision Time**: Rollback decision must be made within 15 minutes of detecting critical issues
- **Rollback SLA**: Complete rollback within 30 minutes of decision
- **Responsible Team**: SRE Team (Primary), Backend Team (Secondary)
- **Communication**: #incidents Slack channel + status page update

---

## Table of Contents

1. [Rollback Decision Criteria](#rollback-decision-criteria)
2. [Pre-Rollback Checklist](#pre-rollback-checklist)
3. [Rollback Procedures](#rollback-procedures)
4. [Database Rollback](#database-rollback)
5. [Service-Specific Rollback](#service-specific-rollback)
6. [Post-Rollback Procedures](#post-rollback-procedures)
7. [Rollback Testing](#rollback-testing)
8. [Emergency Contacts](#emergency-contacts)

---

## Rollback Decision Criteria

### Immediate Rollback Triggers (Auto-Rollback)

Automatically trigger rollback if ANY of these occur:

1. **Error Rate > 5%** for more than 2 minutes
2. **P95 Latency > 5 seconds** for more than 5 minutes
3. **Service Availability < 99%** for more than 3 minutes
4. **Critical Service Down** for more than 1 minute
5. **Database Connection Failures > 10%**
6. **Payment Processing Failures > 10%**
7. **Data Corruption Detected**
8. **Security Breach Detected**

### Manual Rollback Triggers

Consider rollback if:

1. **User-Reported Critical Bugs > 10** within 10 minutes
2. **Customer Impact** affecting > 1000 users
3. **Business-Critical Feature** is broken
4. **Data Integrity Issues** detected
5. **Third-Party Integration Failures** affecting core functionality

### Do NOT Rollback For

1. Minor UI bugs
2. Non-critical feature issues
3. Performance degradation < 20%
4. Issues affecting < 100 users
5. Issues that can be hot-fixed within 10 minutes

---

## Pre-Rollback Checklist

Before initiating rollback, complete this checklist:

### 1. Incident Verification (2 minutes)

- [ ] Confirm issue is not transient (wait 2 minutes, verify persistence)
- [ ] Check monitoring dashboards (Grafana, Prometheus)
- [ ] Review error logs (Kibana)
- [ ] Verify issue is not infrastructure-related (DNS, network, CDN)
- [ ] Document error messages and stack traces

### 2. Impact Assessment (3 minutes)

- [ ] Identify affected services
- [ ] Estimate number of affected users
- [ ] Determine business impact severity
- [ ] Check if issue is resolvable with hot-fix
- [ ] Verify rollback will resolve the issue

### 3. Communication (2 minutes)

- [ ] Post in #incidents channel: "Initiating rollback investigation for [deployment]"
- [ ] Notify on-call engineers
- [ ] Update status page to "Investigating"
- [ ] Start incident response document

### 4. Preparation (3 minutes)

- [ ] Identify last known good deployment version
- [ ] Verify backup availability
- [ ] Confirm database migration compatibility
- [ ] Review recent changes in last deployment
- [ ] Ensure team members are available

**Total Pre-Rollback Time: ~10 minutes**

---

## Rollback Procedures

### Quick Reference Command

```bash
# Emergency one-command rollback (use with caution)
./scripts/emergency-rollback.sh --version <last-good-version>
```

### Standard Rollback Process

#### Step 1: Initiate Rollback (1 minute)

```bash
# 1. Stop accepting new traffic
kubectl scale deployment rolerabbit-api --replicas=0

# 2. Announce rollback
./scripts/notify-rollback.sh --deployment "RoleRabbit API v2.1.0 to v2.0.5"

# 3. Create rollback tag
git tag -a rollback-$(date +%Y%m%d-%H%M%S) -m "Emergency rollback from $(git rev-parse HEAD)"
git push origin rollback-$(date +%Y%m%d-%H%M%S)
```

#### Step 2: Application Rollback (5 minutes)

**Option A: Kubernetes Deployment Rollback**

```bash
# View deployment history
kubectl rollout history deployment/rolerabbit-api

# Rollback to previous version
kubectl rollout undo deployment/rolerabbit-api

# Rollback to specific revision
kubectl rollout undo deployment/rolerabbit-api --to-revision=3

# Monitor rollback
kubectl rollout status deployment/rolerabbit-api

# Verify pods are healthy
kubectl get pods -l app=rolerabbit-api
```

**Option B: Docker Swarm Rollback**

```bash
# View service versions
docker service ps rolerabbit-api

# Rollback service
docker service update --rollback rolerabbit-api

# Monitor rollback
docker service ps rolerabbit-api
```

**Option C: Traditional Server Rollback**

```bash
# Switch symlink to previous release
cd /var/www/rolerabbit
ln -sfn releases/v2.0.5 current

# Restart services
systemctl restart rolerabbit-api
systemctl restart rolerabbit-web

# Verify services
systemctl status rolerabbit-api
```

#### Step 3: Frontend Rollback (2 minutes)

```bash
# Rollback Next.js deployment (Vercel)
vercel rollback --yes

# OR manual build rollback
cd apps/web
git checkout <last-good-commit>
npm run build
npm run deploy

# Clear CDN cache
./scripts/purge-cdn-cache.sh

# Verify frontend
curl -I https://rolerabbit.com
```

#### Step 4: Verify Rollback (3 minutes)

```bash
# Check application version
curl https://api.rolerabbit.com/version

# Check health endpoint
curl https://api.rolerabbit.com/health

# Monitor error rates
./scripts/check-error-rate.sh

# Check key metrics
./scripts/verify-metrics.sh
```

#### Step 5: Restore Traffic (2 minutes)

```bash
# Gradually increase traffic
kubectl scale deployment rolerabbit-api --replicas=2
sleep 30
# Monitor for 30 seconds
kubectl scale deployment rolerabbit-api --replicas=4
sleep 30
kubectl scale deployment rolerabbit-api --replicas=8

# Update load balancer
./scripts/update-lb.sh --enable-traffic
```

**Total Rollback Time: ~13 minutes**

---

## Database Rollback

### Database Rollback Strategy

**CRITICAL**: Database rollbacks are risky. Prefer forward-fixes when possible.

#### Option 1: Rollback Migrations (Preferred)

```bash
# List recent migrations
npx prisma migrate list

# Rollback last migration
npx prisma migrate rollback --name <migration-name>

# Verify migration status
npx prisma migrate status

# Regenerate Prisma client
npx prisma generate
```

#### Option 2: Restore from Backup

**Daily Backups**: Available for last 30 days
**Hourly Snapshots**: Available for last 24 hours

```bash
# List available backups
aws rds describe-db-snapshots --db-instance-identifier rolerabbit-db

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier rolerabbit-db-restored \
  --db-snapshot-identifier rolerabbit-db-2024-11-14-12-00

# Update database endpoint
kubectl set env deployment/rolerabbit-api \
  DATABASE_URL=postgresql://user:pass@rolerabbit-db-restored.xyz.rds.amazonaws.com/rolerabbit

# Restart application
kubectl rollout restart deployment/rolerabbit-api
```

#### Option 3: Point-in-Time Recovery (PITR)

```bash
# Restore to specific timestamp
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier rolerabbit-db \
  --target-db-instance-identifier rolerabbit-db-pitr \
  --restore-time 2024-11-14T15:30:00Z

# Verify data integrity
./scripts/verify-database.sh --instance rolerabbit-db-pitr

# Switch connection string
kubectl set env deployment/rolerabbit-api \
  DATABASE_URL=<new-connection-string>
```

### Database Rollback Risks

⚠️ **Warning**: Database rollback will cause data loss for any data created after the restore point.

**Before Database Rollback:**
1. Export current data
2. Notify users of potential data loss
3. Document all changes made since last backup
4. Consider forward-fix alternative

---

## Service-Specific Rollback

### API Service Rollback

```bash
# Rollback API deployment
kubectl rollout undo deployment/rolerabbit-api

# Clear API cache
redis-cli FLUSHDB

# Restart workers
kubectl rollout restart deployment/rolerabbit-workers
```

### Web Frontend Rollback

```bash
# Rollback Vercel deployment
vercel rollback

# OR manual rollback
cd apps/web
git checkout <last-good-commit>
vercel --prod
```

### WebSocket Service Rollback

```bash
# Gracefully disconnect clients
./scripts/websocket-graceful-shutdown.sh

# Rollback deployment
kubectl rollout undo deployment/rolerabbit-websocket

# Clients will auto-reconnect
```

### Background Jobs Rollback

```bash
# Stop current job processing
kubectl scale deployment/rolerabbit-workers --replicas=0

# Rollback worker deployment
kubectl rollout undo deployment/rolerabbit-workers

# Restart workers
kubectl scale deployment/rolerabbit-workers --replicas=4
```

---

## Post-Rollback Procedures

### Immediate Actions (Within 1 hour)

1. **Verify System Stability**
   ```bash
   # Monitor for 15 minutes
   ./scripts/monitor-system.sh --duration 15m

   # Check error rates
   curl https://api.rolerabbit.com/metrics | grep error_rate

   # Verify critical flows
   ./scripts/smoke-test.sh
   ```

2. **Communication**
   - [ ] Update #incidents channel with rollback completion
   - [ ] Update status page to "Resolved"
   - [ ] Send customer communication (if needed)
   - [ ] Schedule post-mortem meeting

3. **Data Verification**
   ```bash
   # Run data integrity checks
   npm run verify:data-integrity

   # Check for orphaned records
   npm run cleanup:orphaned-data

   # Verify critical business metrics
   npm run verify:business-metrics
   ```

### Within 24 Hours

1. **Post-Mortem Analysis**
   - Document what went wrong
   - Identify root cause
   - List contributing factors
   - Document lessons learned
   - Create action items

2. **Preventive Measures**
   - Add monitoring for the failure mode
   - Create automated tests
   - Update deployment checklist
   - Improve documentation

3. **Fix and Redeploy**
   - Create hotfix branch
   - Fix the issue
   - Add regression tests
   - Deploy to staging
   - Full QA testing
   - Gradual production rollout

---

## Rollback Testing

### Monthly Rollback Drill

Perform rollback drill on first Friday of each month at 2 PM EST:

```bash
# 1. Deploy test version to staging
git checkout staging
git merge test-rollback-branch
./deploy.sh --env staging

# 2. Perform rollback
./scripts/emergency-rollback.sh --env staging --version previous

# 3. Verify rollback success
./scripts/verify-rollback.sh --env staging

# 4. Document results
./scripts/log-rollback-drill.sh --success true/false --notes "..."
```

### Rollback Success Criteria

- [ ] Rollback completed within 30 minutes
- [ ] Error rate < 0.1%
- [ ] All services healthy
- [ ] No data loss (except expected)
- [ ] Customer-facing features working
- [ ] Monitoring alerts cleared

---

## Emergency Contacts

### On-Call Rotation

| Role | Primary | Secondary | Phone |
|------|---------|-----------|-------|
| SRE Lead | John Doe | Jane Smith | +1-555-0100 |
| Backend Lead | Bob Wilson | Alice Brown | +1-555-0101 |
| Frontend Lead | Charlie Davis | Eve Martinez | +1-555-0102 |
| Database Admin | Frank Miller | Grace Lee | +1-555-0103 |
| Security Lead | Henry Taylor | Ivy Chen | +1-555-0104 |
| Product Manager | Jack Anderson | Kelly White | +1-555-0105 |

### Escalation Path

1. **On-Call Engineer** (respond within 5 minutes)
2. **Team Lead** (escalate if no resolution in 10 minutes)
3. **VP Engineering** (escalate if no resolution in 20 minutes)
4. **CTO** (escalate for critical incidents)

### Communication Channels

- **Primary**: #incidents (Slack)
- **Escalation**: @here in #engineering
- **Critical**: PagerDuty incident
- **Public**: https://status.rolerabbit.com

---

## Rollback Scripts Reference

### Emergency Rollback Script

```bash
#!/bin/bash
# scripts/emergency-rollback.sh

set -e

VERSION=${1:?Please provide version to rollback to}
ENV=${2:-production}

echo "=== EMERGENCY ROLLBACK ==="
echo "Environment: $ENV"
echo "Target Version: $VERSION"
echo "==="

# Confirm
read -p "Are you sure you want to rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# Execute rollback
echo "Rolling back application..."
kubectl rollout undo deployment/rolerabbit-api

echo "Rolling back frontend..."
vercel rollback --yes

echo "Clearing caches..."
redis-cli FLUSHDB

echo "Verifying health..."
sleep 10
curl -f https://api.rolerabbit.com/health || exit 1

echo "=== ROLLBACK COMPLETE ==="
echo "Please monitor https://grafana.rolerabbit.com"
```

### Verify Rollback Script

```bash
#!/bin/bash
# scripts/verify-rollback.sh

echo "=== Verifying Rollback ==="

# Check application version
echo "Checking version..."
CURRENT_VERSION=$(curl -s https://api.rolerabbit.com/version | jq -r '.version')
echo "Current version: $CURRENT_VERSION"

# Check error rate
echo "Checking error rate..."
ERROR_RATE=$(curl -s http://prometheus:9090/api/v1/query?query=error_rate | jq -r '.data.result[0].value[1]')
echo "Current error rate: $ERROR_RATE%"

# Check health
echo "Checking health..."
curl -f https://api.rolerabbit.com/health || exit 1

# Check critical endpoints
echo "Checking critical endpoints..."
curl -f https://api.rolerabbit.com/api/templates || exit 1

echo "=== Verification Complete ==="
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-11-14 | SRE Team | Initial rollback plan |
| 1.1 | 2024-11-14 | Backend Team | Added database rollback procedures |
| 1.2 | 2024-11-14 | DevOps | Added Kubernetes-specific steps |

---

## Notes

1. **Always document** the rollback in the incident log
2. **Never skip** the verification step
3. **Always communicate** with stakeholders
4. **Practice makes perfect** - run drills regularly
5. **Update this document** after each rollback

---

**Last Updated**: November 14, 2024
**Next Review Date**: December 14, 2024
**Document Owner**: SRE Team
