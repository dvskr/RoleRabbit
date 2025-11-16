# RoleRabbit Deployment Guide

**Version:** 1.0
**Last Updated:** January 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Secrets Management](#secrets-management)
5. [Database Migrations](#database-migrations)
6. [Deployment Steps](#deployment-steps)
7. [Monitoring Setup](#monitoring-setup)
8. [Rollback Procedure](#rollback-procedure)
9. [Post-Deployment](#post-deployment)

---

## Overview

This guide covers deploying RoleRabbit to production using Vercel (frontend) and AWS/Railway (backend).

### Architecture

```
┌─────────────────┐
│   Cloudflare    │ ← DNS, CDN, DDoS protection
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌──▼─────┐
│ Vercel │ │  AWS   │
│  (Web) │ │  (API) │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
    ┌────▼────┐
    │Supabase │ ← PostgreSQL, Auth, Storage
    │  (DB)   │
    └─────────┘
```

### Recommended Stack

- **Frontend**: Vercel
- **Backend API**: AWS ECS/Railway/Render
- **Database**: Supabase/AWS RDS PostgreSQL
- **File Storage**: Supabase Storage/AWS S3
- **CDN**: Cloudflare
- **DNS**: Cloudflare
- **Monitoring**: Sentry, Datadog/New Relic
- **CI/CD**: GitHub Actions

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Coverage >= 80% (`npm run test:coverage`)
- [ ] Security scan clean (`npm audit`)
- [ ] No console.log statements in production code
- [ ] Environment variables documented

### Performance

- [ ] Bundle size optimized (`npm run check-bundle-size`)
- [ ] Images optimized (WebP format, lazy loading)
- [ ] Database queries optimized (indexes added)
- [ ] API endpoints < 500ms response time
- [ ] Lighthouse score >= 90

### Security

- [ ] All dependencies updated (`npm outdated`)
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection enabled

### Documentation

- [ ] API documentation updated
- [ ] Changelog updated (CHANGELOG.md)
- [ ] Deployment notes documented
- [ ] Rollback plan documented

---

## Infrastructure Setup

### 1. Domain and DNS

#### Cloudflare Setup

```bash
# Add domain to Cloudflare
1. Go to cloudflare.com
2. Add site → Enter domain
3. Update nameservers at domain registrar
4. Wait for DNS propagation (up to 48 hours)
```

#### DNS Records

```dns
# A Records
@       A       76.76.21.21  (Vercel IP)
www     A       76.76.21.21  (Vercel IP)

# CNAME Records
api     CNAME   your-app.herokuapp.com
*.sub   CNAME   cname.vercel-dns.com

# TXT Records (for verification)
@       TXT     "v=spf1 include:_spf.mx.cloudflare.net ~all"
_dmarc  TXT     "v=DMARC1; p=none; rua=mailto:postmaster@rolerabbit.com"
```

#### SSL/TLS Configuration

```yaml
# Cloudflare SSL/TLS Settings
SSL Mode: Full (strict)
Always Use HTTPS: On
Minimum TLS Version: 1.2
Automatic HTTPS Rewrites: On
TLS 1.3: On
```

### 2. Vercel Deployment (Frontend)

#### Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### Configure Project

```bash
cd apps/web

# Link to Vercel project
vercel link

# Configure environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all production environment variables
```

#### Build Settings

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

#### Deploy

```bash
# Production deployment
vercel --prod

# Or configure GitHub integration
# Automatic deployments on push to main
```

### 3. AWS ECS Deployment (Backend API)

#### Create ECR Repository

```bash
# Create repository
aws ecr create-repository \
  --repository-name rolerabbit-api \
  --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com
```

#### Build and Push Docker Image

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

```bash
# Build image
docker build -t rolerabbit-api apps/api

# Tag image
docker tag rolerabbit-api:latest \
  <account_id>.dkr.ecr.us-east-1.amazonaws.com/rolerabbit-api:latest

# Push image
docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/rolerabbit-api:latest
```

#### Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name rolerabbit-production

# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

**task-definition.json**:

```json
{
  "family": "rolerabbit-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "<account_id>.dkr.ecr.us-east-1.amazonaws.com/rolerabbit-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3001"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rolerabbit-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Create Service

```bash
# Create service
aws ecs create-service \
  --cluster rolerabbit-production \
  --service-name api \
  --task-definition rolerabbit-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=api,containerPort=3001"
```

### 4. Supabase Setup

#### Create Project

```bash
1. Go to supabase.com/dashboard
2. New project
3. Choose region (same as Vercel)
4. Set database password (save to secrets manager)
```

#### Configure Database

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create roles
CREATE ROLE app_user;
GRANT CONNECT ON DATABASE postgres TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Set up RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
-- ... more RLS policies
```

#### Configure Storage

```bash
# Create buckets
1. Storage → New bucket
2. Name: portfolios
3. Public: false
4. File size limit: 10MB
5. Allowed MIME types: image/*, application/pdf
```

#### Configure Auth

```bash
# Auth settings
1. Authentication → Providers
2. Enable: Email, Google, GitHub
3. Configure OAuth apps
4. Set redirect URLs
```

### 5. S3 Bucket (File Storage)

```bash
# Create bucket
aws s3 mb s3://rolerabbit-portfolios --region us-east-1

# Configure CORS
aws s3api put-bucket-cors \
  --bucket rolerabbit-portfolios \
  --cors-configuration file://cors.json
```

**cors.json**:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://rolerabbit.com", "https://*.rolerabbit.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

#### Configure Lifecycle

```bash
# Delete old files after 90 days
aws s3api put-bucket-lifecycle-configuration \
  --bucket rolerabbit-portfolios \
  --lifecycle-configuration file://lifecycle.json
```

### 6. CloudFront Distribution (CDN)

```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name rolerabbit-portfolios.s3.amazonaws.com \
  --default-root-object index.html
```

**CloudFront Settings**:

- Price Class: Use All Edge Locations
- Compress Objects: Yes
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- Cache Based on Headers: None
- Cache Based on Query Strings: All
- Forward Cookies: None
- TTL: 86400 (1 day)

---

## Secrets Management

### AWS Secrets Manager

#### Store Secrets

```bash
# Create secret
aws secretsmanager create-secret \
  --name rolerabbit/production/database \
  --secret-string '{"url":"postgresql://...","password":"..."}'

# Create JWT secret
aws secretsmanager create-secret \
  --name rolerabbit/production/jwt \
  --secret-string '{"secret":"your-jwt-secret"}'

# Create encryption key
aws secretsmanager create-secret \
  --name rolerabbit/production/encryption \
  --secret-string '{"key":"your-256-bit-key"}'
```

#### Retrieve Secrets

```javascript
// apps/api/src/config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

export async function getSecret(secretName: string): Promise<any> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString!);
}

// Usage
const dbSecret = await getSecret('rolerabbit/production/database');
const databaseUrl = dbSecret.url;
```

### Secret Rotation

#### Enable Auto-Rotation

```bash
# Enable rotation (every 30 days)
aws secretsmanager rotate-secret \
  --secret-id rolerabbit/production/database \
  --rotation-lambda-arn arn:aws:lambda:...:function:rotate-secret \
  --rotation-rules AutomaticallyAfterDays=30
```

#### Rotation Lambda

```javascript
// lambda/rotate-secret.js
exports.handler = async (event) => {
  const step = event.Step;
  const token = event.Token;
  const secretId = event.SecretId;

  switch (step) {
    case 'createSecret':
      // Generate new secret
      const newSecret = generateSecureSecret();
      await storeNewSecret(secretId, token, newSecret);
      break;

    case 'setSecret':
      // Update application to use new secret
      await updateApplicationSecret(secretId, token);
      break;

    case 'testSecret':
      // Test new secret
      await testNewSecret(secretId, token);
      break;

    case 'finishSecret':
      // Mark secret as current
      await finishRotation(secretId, token);
      break;
  }
};
```

### Environment Variables

#### Production Variables

**Vercel** (via Vercel Dashboard or CLI):

```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add ENCRYPTION_KEY production
vercel env add JWT_SECRET production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

**ECS** (via AWS Secrets Manager):

```json
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:...:secret:rolerabbit/production/database"
    },
    {
      "name": "JWT_SECRET",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:...:secret:rolerabbit/production/jwt"
    }
  ]
}
```

---

## Database Migrations

### Migration Strategy

1. **Write migrations**: Create SQL migration files
2. **Test locally**: Run migrations on local database
3. **Test staging**: Run migrations on staging database
4. **Backup production**: Take database snapshot
5. **Run production**: Execute migrations
6. **Verify**: Check migration status
7. **Monitor**: Watch for errors

### Running Migrations

#### Automated (Recommended)

```bash
# GitHub Actions workflow
name: Database Migration

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          npm run db:migrate
```

#### Manual

```bash
# Connect to production database
export DATABASE_URL="postgresql://..."

# Run all pending migrations
cd apps/web
npm run db:migrate

# Or run specific migration
psql $DATABASE_URL -f src/database/migrations/020_new_migration.sql

# Verify migration
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;"
```

### Rollback Migrations

#### Create Rollback File

For each migration, create a rollback file:

```sql
-- migrations/020_add_testimonials.sql
ALTER TABLE portfolios ADD COLUMN testimonials JSONB;
CREATE INDEX idx_portfolios_testimonials ON portfolios USING GIN (testimonials);

-- migrations/020_add_testimonials.rollback.sql
DROP INDEX IF EXISTS idx_portfolios_testimonials;
ALTER TABLE portfolios DROP COLUMN IF EXISTS testimonials;
```

#### Execute Rollback

```bash
# Rollback specific migration
psql $DATABASE_URL -f migrations/020_add_testimonials.rollback.sql

# Rollback to specific version
npm run db:rollback --to=019
```

### Handling Migration Failures

**If migration fails mid-execution:**

```bash
# 1. Check database state
psql $DATABASE_URL -c "SELECT * FROM schema_migrations;"

# 2. Identify failed migration
psql $DATABASE_URL -c "SELECT version, dirty FROM schema_migrations WHERE dirty = true;"

# 3. Manually fix database (if needed)
psql $DATABASE_URL < manual_fix.sql

# 4. Mark migration as completed or rollback
psql $DATABASE_URL -c "UPDATE schema_migrations SET dirty = false WHERE version = '020';"

# Or rollback
psql $DATABASE_URL -f migrations/020_rollback.sql
```

### Zero-Downtime Migrations

For large tables, use these strategies:

#### 1. Add Column (No Default)

```sql
-- Step 1: Add column (nullable, no default)
ALTER TABLE portfolios ADD COLUMN new_field TEXT;

-- Deploy application code that handles null values

-- Step 2: Backfill data (in batches)
UPDATE portfolios SET new_field = old_field WHERE new_field IS NULL LIMIT 1000;

-- Step 3: Make NOT NULL (after all backfilled)
ALTER TABLE portfolios ALTER COLUMN new_field SET NOT NULL;
```

#### 2. Rename Column

```sql
-- Step 1: Add new column
ALTER TABLE portfolios ADD COLUMN new_name TEXT;

-- Step 2: Backfill
UPDATE portfolios SET new_name = old_name;

-- Deploy code using new_name

-- Step 3: Drop old column
ALTER TABLE portfolios DROP COLUMN old_name;
```

#### 3. Add Index (Concurrently)

```sql
-- Create index without locking table
CREATE INDEX CONCURRENTLY idx_portfolios_user_id ON portfolios(user_id);

-- If fails, drop and retry
DROP INDEX IF EXISTS idx_portfolios_user_id;
CREATE INDEX CONCURRENTLY idx_portfolios_user_id ON portfolios(user_id);
```

---

## Deployment Steps

### 1. Pre-Deployment

```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version
npm version 1.2.0

# 3. Update CHANGELOG.md
# Add release notes

# 4. Run all tests
npm test
npm run test:e2e
npm run test:integration

# 5. Build and verify
npm run build
npm run start

# 6. Create PR to main
gh pr create --title "Release v1.2.0" --body "$(cat CHANGELOG.md)"
```

### 2. Database Backup

```bash
# Supabase backup
curl -X POST \
  "https://api.supabase.com/v1/projects/PROJECT_ID/database/backups" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Or PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://rolerabbit-backups/$(date +%Y%m%d)/
```

### 3. Run Migrations

```bash
# Set DATABASE_URL for production
export DATABASE_URL="postgresql://prod-url"

# Run migrations
npm run db:migrate

# Verify
psql $DATABASE_URL -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"
```

### 4. Deploy Backend API

```bash
# Build and push Docker image
docker build -t rolerabbit-api apps/api
docker tag rolerabbit-api:latest <ecr>/rolerabbit-api:v1.2.0
docker push <ecr>/rolerabbit-api:v1.2.0

# Update ECS service
aws ecs update-service \
  --cluster rolerabbit-production \
  --service api \
  --force-new-deployment \
  --task-definition rolerabbit-api:v1.2.0

# Wait for deployment
aws ecs wait services-stable \
  --cluster rolerabbit-production \
  --services api
```

### 5. Deploy Frontend

```bash
# Vercel deployment
cd apps/web
vercel --prod

# Or via Git push
git push origin main
# Vercel auto-deploys
```

### 6. Verify Deployment

```bash
# Check health endpoints
curl https://api.rolerabbit.com/health
curl https://rolerabbit.com/api/health

# Check database connectivity
curl https://api.rolerabbit.com/health/db

# Run smoke tests
npm run test:smoke

# Check error rate
# (Monitor Sentry/Datadog for 5 minutes)
```

---

## Monitoring Setup

### 1. Sentry (Error Tracking)

#### Install

```bash
npm install @sentry/nextjs @sentry/node
```

#### Configure

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});
```

### 2. Datadog (APM)

#### Install Agent

```bash
# Add to Dockerfile
RUN wget -O - https://s3.amazonaws.com/dd-agent/scripts/install_script.sh | DD_API_KEY=$DD_API_KEY bash
```

#### Configure

```javascript
// apps/api/src/config/datadog.ts
import tracer from 'dd-trace';

tracer.init({
  hostname: 'rolerabbit-api',
  env: process.env.NODE_ENV,
  service: 'api',
  version: process.env.APP_VERSION,
  logInjection: true,
});
```

### 3. Prometheus + Grafana

#### Expose Metrics

```javascript
// apps/api/src/routes/metrics.ts
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

#### Grafana Dashboards

```yaml
# grafana/dashboards/api-overview.json
{
  "title": "API Overview",
  "panels": [
    {
      "title": "Request Rate",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])"
        }
      ]
    },
    {
      "title": "Error Rate",
      "targets": [
        {
          "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
        }
      ]
    },
    {
      "title": "Response Time (p95)",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
        }
      ]
    }
  ]
}
```

### 4. Uptime Monitoring

#### UptimeRobot Setup

```bash
1. Go to uptimerobot.com
2. Add Monitor
3. Monitor Type: HTTPS
4. URL: https://rolerabbit.com
5. Interval: 5 minutes
6. Alert Contacts: team@rolerabbit.com
```

#### Custom Health Checks

```javascript
// apps/api/src/routes/health.ts
export async function healthCheck(req, res) {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
  };

  const healthy = Object.values(checks).every(c => c.healthy);

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  });
}
```

---

## Rollback Procedure

### When to Rollback

- Critical bugs affecting > 50% of users
- Data corruption or data loss
- Security vulnerability introduced
- Performance degradation > 50%
- Failed health checks

### Rollback Steps

#### 1. Immediate Rollback (Frontend)

```bash
# Vercel rollback to previous deployment
vercel rollback

# Or promote specific deployment
vercel promote <deployment-url> --prod
```

#### 2. Rollback Backend API

```bash
# Update ECS service to previous task definition
aws ecs update-service \
  --cluster rolerabbit-production \
  --service api \
  --task-definition rolerabbit-api:v1.1.0

# Wait for rollback
aws ecs wait services-stable \
  --cluster rolerabbit-production \
  --services api
```

#### 3. Rollback Database (if needed)

```bash
# Option A: Run rollback migration
psql $DATABASE_URL -f migrations/020_rollback.sql

# Option B: Restore from backup
# 1. Stop application
aws ecs update-service --desired-count 0 ...

# 2. Restore backup
pg_restore -d $DATABASE_URL backup_20250115.sql

# 3. Restart application
aws ecs update-service --desired-count 2 ...
```

#### 4. Verify Rollback

```bash
# Check health
curl https://api.rolerabbit.com/health

# Check error rate
# Monitor Sentry for 10 minutes

# Verify key functionality
npm run test:smoke
```

### Post-Rollback

```bash
# 1. Notify team
slack-notify "Rolled back to v1.1.0 due to [reason]"

# 2. Create incident report
# Document:
# - What went wrong
# - Impact (users affected, duration)
# - Root cause
# - Steps taken
# - Prevention measures

# 3. Fix issue in development
git checkout -b hotfix/issue-name

# 4. Test thoroughly
npm test
npm run test:e2e

# 5. Deploy fix
# Follow deployment steps
```

---

## Post-Deployment

### Verification Checklist

- [ ] Health checks passing
- [ ] Error rate < 1%
- [ ] Response time < 500ms
- [ ] All critical features working
- [ ] Migrations completed
- [ ] Monitoring dashboards updated
- [ ] No increase in error logs

### Monitoring Period

- **First 15 minutes**: Watch error rate, response time
- **First hour**: Monitor user feedback, check logs
- **First 24 hours**: Daily health check, review metrics
- **First week**: Weekly review, performance analysis

### Announcement

```markdown
# Release Notes v1.2.0

## New Features
- Added testimonials section to portfolios
- Improved analytics dashboard
- New template: Modern Developer

## Improvements
- 30% faster portfolio loading
- Enhanced security headers
- Better error handling

## Bug Fixes
- Fixed subdomain routing issue
- Resolved analytics tracking bug
- Fixed mobile responsive layout

## Breaking Changes
None

## Migration Required
Database migration will run automatically during deployment.
No action required from users.
```

---

**Last Updated:** January 15, 2025
**Version:** 1.0
