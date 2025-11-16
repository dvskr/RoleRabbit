# Security & Deployment Guide

Comprehensive guide for sections 4.7-4.9: Security, Deployment Pipeline, and Disaster Recovery

## Table of Contents

- [Security & Secrets Management (4.7)](#security--secrets-management)
- [Deployment Pipeline (4.8)](#deployment-pipeline)
- [Disaster Recovery (4.9)](#disaster-recovery)

## Security & Secrets Management

### Secrets Manager Setup

**AWS Secrets Manager** (Recommended)

```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure

# Create secrets
aws secretsmanager create-secret \
  --name rolerabbit/database/password \
  --description "PostgreSQL database password" \
  --secret-string '{"value":"secure-password-here"}'

aws secretsmanager create-secret \
  --name rolerabbit/jwt/secret \
  --description "JWT signing secret" \
  --secret-string '{"value":"secure-jwt-secret-here"}'

# Enable automatic rotation (90 days)
aws secretsmanager rotate-secret \
  --secret-id rolerabbit/database/password \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotator \
  --rotation-rules AutomaticallyAfterDays=90
```

**HashiCorp Vault** (Alternative)

```bash
# Install Vault
brew install vault

# Start Vault server (development)
vault server -dev

# Set environment
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='dev-token'

# Create secrets
vault kv put secret/rolerabbit/database/password value=secure-password
vault kv put secret/rolerabbit/jwt/secret value=jwt-secret
```

### Secret Rotation Schedule

| Secret | Rotation Period | Method |
|--------|----------------|---------|
| Database Password | 90 days | Automated |
| JWT Secret | 90 days | Automated |
| API Keys (Stripe, Cloudflare) | 180 days | Manual |
| SSL Certificates | Auto (Let's Encrypt) | Automated |

**Rotate Secrets**

```bash
# Rotate all due secrets
npm run rotate-secrets rotate

# Force rotate all
npm run rotate-secrets force-rotate

# Rotate specific secret
npm run rotate-secrets rotate rolerabbit/database/password

# Verify rotation
npm run rotate-secrets verify rolerabbit/jwt/secret
```

### Environment Variables (NEVER Commit)

```.gitignore
# Already added to .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
secrets/
```

### Encryption at Rest

**PostgreSQL**

```sql
-- Enable encryption (Supabase has this by default)
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
SELECT pg_reload_conf();
```

**Redis (Upstash)**

```bash
# Upstash Redis has encryption at rest by default
# No additional configuration needed
```

**S3 Bucket**

```bash
# Enable server-side encryption
aws s3api put-bucket-encryption \
  --bucket rolerabbit-portfolios \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Encryption in Transit

**Force HTTPS**

All configured in `nginx.conf`:
- HTTP to HTTPS redirect
- TLS 1.2/1.3 only
- Strong cipher suites
- HSTS header

**Database TLS**

```bash
# PostgreSQL connection with TLS
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Firewall Rules

**Database Access**

```bash
# Allow only API server IPs (Kubernetes cluster)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-yyyyy  # API server security group
```

**Queue Dashboard**

```bash
# Restrict to admin IPs only
# In nginx.conf:
location /admin/queues {
  allow 203.0.113.0/24;  # Office IP
  allow 198.51.100.0/24; # VPN IP
  deny all;

  proxy_pass http://api_backend;
}
```

### IAM Roles (Service-to-Service Auth)

**Kubernetes Service Account**

```yaml
# kubernetes/service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rolerabbit-api
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/rolerabbit-api-role
```

**IAM Role Policy**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:rolerabbit/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::rolerabbit-portfolios/*"
    }
  ]
}
```

### Security Scanning

**Weekly Dependency Scan**

```bash
# Manual scan
npm audit --audit-level=high

# Fix vulnerabilities
npm audit fix

# Snyk scan
npx snyk test
npx snyk monitor
```

**GitHub Actions** (runs automatically in CI)

- npm audit on every PR
- Snyk scan weekly
- CodeQL analysis
- SARIF upload to Security tab

## Deployment Pipeline

### CI/CD Overview

```
Push to develop → CI Tests → Build Image → Deploy to Staging → Manual QA

Push to main → CI Tests → Build Image → Deploy to Staging → Approval → Deploy to Production
```

### CI Pipeline (.github/workflows/ci.yml)

**Runs on**: Every PR and push to main/develop

**Steps**:
1. Security scan (npm audit, Snyk)
2. Lint & type check (ESLint, TypeScript)
3. Unit tests (Jest with coverage)
4. Integration tests (with PostgreSQL, Redis)
5. E2E tests (Playwright)
6. Build check

**All tests must pass before merge**

### CD Pipeline (.github/workflows/deploy.yml)

**Staging Deployment** (automatic on develop):
1. Build Docker image
2. Push to container registry
3. Run database migrations
4. Deploy to Kubernetes (staging namespace)
5. Wait for rollout
6. Run smoke tests
7. Notify team (Slack)

**Production Deployment** (requires approval):
1. Build Docker image
2. Push to container registry
3. Run database migrations
4. Deploy to Kubernetes (blue-green strategy)
5. Wait for rollout (10 min timeout)
6. Run smoke tests
7. Create GitHub release
8. Notify team (Slack with @here)

### Database Migrations

**Staging**

```yaml
# Runs automatically before deployment
- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
  run: npm run db:migrate
```

**Production**

```bash
# Runs automatically with approval gate
# Migrations are run before code deployment
# If migration fails, deployment is aborted
```

### Docker Build

```dockerfile
# Multi-stage build for optimization
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

### Deployment Strategies

**Blue-Green Deployment** (Production)

```yaml
# In deploy.yml
strategy: blue-green
```

- New version (green) deployed alongside old (blue)
- Traffic switched to green after health checks
- Blue kept running for quick rollback
- Blue terminated after 1 hour if no issues

**Rolling Update** (Staging)

```yaml
# In api-deployment.yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

- Zero downtime
- One pod at a time
- Old pod only terminated after new pod is ready

### Rollback (<5 minutes)

**Automatic Rollback**

```bash
# If smoke tests fail, deployment automatically rolls back
# Configured in deploy.yml
```

**Manual Rollback**

```bash
# Quick rollback script
./scripts/rollback.sh

# Or manual Kubernetes rollback
kubectl rollout undo deployment/rolerabbit-api -n rolerabbit-production
kubectl rollout status deployment/rolerabbit-api -n rolerabbit-production
```

**Rollback Time**: Target <5 minutes (typically 2-3 minutes)

### Deployment Notifications

**Slack Notifications**

Configured in `.github/workflows/deploy.yml`:
- Deployment started
- Deployment completed (success/failure)
- Mentions @here on production failures

**Email Notifications**

GitHub Actions sends email to:
- Commit author
- Repository watchers
- On failure only

## Disaster Recovery

### Recovery Time Objectives (RTO)

| Service | RTO | RPO |
|---------|-----|-----|
| Database | 4 hours | 24 hours |
| Application | 1 hour | N/A |
| File Storage | 2 hours | 24 hours |
| Overall Platform | 4 hours | 24 hours |

### Disaster Recovery Procedures

#### Scenario 1: Database Failure

**Detection**
```bash
# Health check fails
curl https://rolerabbit.com/api/health/ready
# Returns 503 with database: fail
```

**Recovery Steps**

1. **Assess Damage**
```bash
# Try to connect
psql $DATABASE_URL

# Check replication status
psql -c "SELECT * FROM pg_stat_replication;"
```

2. **Restore from Backup**
```bash
# Get latest backup
aws s3 ls s3://rolerabbit-backups/db/ --recursive | sort | tail -n 1

# Download backup
aws s3 cp s3://rolerabbit-backups/db/backup-2025-01-15.sql.gz .

# Restore
./scripts/restore-database.sh backup-2025-01-15.sql.gz
```

3. **Verify**
```bash
# Run health check
curl https://rolerabbit.com/api/health/ready

# Check data integrity
psql -c "SELECT COUNT(*) FROM portfolios;"
```

**Time**: ~2-3 hours

#### Scenario 2: Complete Region Failure

**Recovery Steps**

1. **Failover to Secondary Region**
```bash
# Update DNS to point to secondary region
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://failover-dns.json
```

2. **Promote Read Replica**
```bash
# Promote PostgreSQL read replica to primary
aws rds promote-read-replica \
  --db-instance-identifier rolerabbit-db-replica-us-west-2
```

3. **Deploy Application**
```bash
# Deploy to secondary region Kubernetes cluster
kubectl config use-context us-west-2
kubectl apply -f infrastructure/kubernetes/
```

**Time**: ~3-4 hours

#### Scenario 3: Data Corruption

**Recovery Steps**

1. **Identify Corruption**
```bash
# Check recent changes
psql -c "SELECT * FROM portfolios WHERE updated_at > now() - interval '1 hour';"
```

2. **Point-in-Time Recovery**
```bash
# Restore to specific point
# Using continuous archiving (WAL)
pg_restore --dbname=rolerabbit_recovery \
  --time="2025-01-15 14:30:00" \
  backup.sql
```

3. **Verify and Switch**
```bash
# Verify data
psql rolerabbit_recovery -c "SELECT COUNT(*) FROM portfolios;"

# Switch connections
# Update DATABASE_URL to point to recovery database
```

**Time**: ~1-2 hours

### Testing Disaster Recovery

**Annual DR Test Checklist**

- [ ] Schedule maintenance window
- [ ] Notify team and users
- [ ] Take fresh backup
- [ ] Simulate database failure
- [ ] Restore from backup
- [ ] Measure restoration time
- [ ] Verify data integrity
- [ ] Document results
- [ ] Update procedures if needed

**Last Test**: [Insert Date]
**Next Test**: [Insert Date + 1 year]

### Cross-Region Failover

**Setup Read Replica**

```bash
# Create read replica in secondary region
aws rds create-db-instance-read-replica \
  --db-instance-identifier rolerabbit-db-replica-us-west-2 \
  --source-db-instance-identifier rolerabbit-db \
  --availability-zone us-west-2a
```

**Configure Geo-DNS**

```bash
# Route53 health check
aws route53 create-health-check \
  --health-check-config IPAddress=API_IP,Port=443,Type=HTTPS,ResourcePath=/api/health

# Failover routing
# Primary: us-east-1
# Secondary: us-west-2
# Automatic failover if health check fails
```

### Status Page

**Using Statuspage.io**

```bash
# Create status page
https://rolerabbit.statuspage.io

# Components to monitor:
- API
- Database
- Job Queue
- File Storage
- CDN

# Update status via API
curl -X PATCH https://api.statuspage.io/v1/pages/PAGE_ID/components/COMPONENT_ID \
  -H "Authorization: OAuth YOUR_API_KEY" \
  -d "component[status]=major_outage"
```

**Custom Status Page**

```typescript
// pages/status.tsx
// Real-time status from health checks
// Historical uptime from logs
// Incident history
```

### Backup Procedures

**Automated Daily Backups**

```bash
# Configured in cron
0 2 * * * /app/scripts/backup-database.sh

# Retention:
# - Daily backups: 30 days
# - Weekly backups: 90 days
# - Monthly backups: 1 year
```

**Backup Verification**

```bash
# Weekly automated restore test
0 3 * * 0 /app/scripts/test-restore.sh
```

## Emergency Contacts

| Role | Name | Phone | Email | Backup |
|------|------|-------|-------|--------|
| On-Call Eng | - | PagerDuty | - | Senior Eng |
| Senior Eng | - | [Phone] | [Email] | Eng Manager |
| Eng Manager | - | [Phone] | [Email] | CTO |
| CTO | - | [Phone] | [Email] | CEO |
| DBA | - | [Phone] | [Email] | - |
| DevOps | - | [Phone] | [Email] | - |

## Compliance & Audit

### Security Audit Log

```bash
# Database audit log
psql -c "SELECT * FROM audit_log WHERE created_at > now() - interval '24 hours';"

# Application audit log
kubectl logs -l app=rolerabbit-api --since=24h | jq 'select(.event | startswith("auth."))'

# Export for compliance
kubectl logs -l app=rolerabbit-api --since=30d > audit-$(date +%Y-%m).json
```

### Compliance Checklist

- [ ] Secrets rotated per schedule
- [ ] Backups tested monthly
- [ ] Security scans run weekly
- [ ] Access logs reviewed
- [ ] Failed login attempts monitored
- [ ] SSL certificates valid
- [ ] Firewall rules current
- [ ] DR test completed annually
- [ ] Incident postmortems written
- [ ] Team training completed

## References

- [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) - Detailed DR procedures
- [RUNBOOK.md](./RUNBOOK.md) - Operational troubleshooting
- [MONITORING_OBSERVABILITY.md](./MONITORING_OBSERVABILITY.md) - Monitoring setup
- [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md) - Infrastructure guide
