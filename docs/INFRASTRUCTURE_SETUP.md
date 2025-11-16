# Infrastructure Setup Guide

Comprehensive guide for setting up RoleRabbit infrastructure (Sections 4.2-4.4)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Section 4.2: Static Hosting Setup](#section-42-static-hosting-setup)
- [Section 4.3: DNS & Domain Management](#section-43-dns--domain-management)
- [Section 4.4: Background Job Queue](#section-44-background-job-queue)
- [Testing & Verification](#testing--verification)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

- ✅ Supabase account (or AWS S3 + DigitalOcean Spaces)
- ✅ Cloudflare account (or AWS Route53 + CloudFront)
- ✅ Upstash Redis account (or self-hosted Redis)
- ✅ Domain registered (e.g., rolerabbit.com)

### Required Tools

```bash
# Install AWS CLI (if using AWS services)
brew install awscli  # macOS
# Or download from https://aws.amazon.com/cli/

# Install Cloudflare CLI (wrangler)
npm install -g wrangler

# Install Redis CLI
brew install redis  # macOS
```

## Section 4.2: Static Hosting Setup

### Option A: Supabase Storage (Recommended for Simplicity)

#### 1. Create Supabase Storage Bucket

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolios', 'portfolios', true);
```

#### 2. Configure CORS Policy

```sql
-- Allow GET requests from rolerabbit.com
UPDATE storage.buckets
SET cors = '[
  {
    "allowedOrigins": ["https://rolerabbit.com", "https://*.rolerabbit.com"],
    "allowedMethods": ["GET"],
    "allowedHeaders": ["*"],
    "maxAge": 3600
  }
]'::jsonb
WHERE id = 'portfolios';
```

#### 3. Configure RLS Policies

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolios');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolios');
```

#### 4. Update Environment Variables

```bash
# .env.local
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=portfolios
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Option B: AWS S3 + CloudFront

#### 1. Create S3 Bucket

```bash
# Set variables
BUCKET_NAME="rolerabbit-portfolios"
REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html
```

#### 2. Configure CORS Policy

```bash
# Create cors.json
cat > cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://rolerabbit.com", "https://*.rolerabbit.com"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file://cors.json
```

#### 3. Create IAM User and Policy

```bash
# Create IAM policy
cat > s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

# Create IAM user
aws iam create-user --user-name rolerabbit-s3-user

# Attach policy
aws iam put-user-policy \
  --user-name rolerabbit-s3-user \
  --policy-name RoleRabbitS3Access \
  --policy-document file://s3-policy.json

# Create access keys
aws iam create-access-key --user-name rolerabbit-s3-user
```

#### 4. Create CloudFront Distribution

```bash
# Create distribution config
cat > cloudfront-config.json <<EOF
{
  "CallerReference": "rolerabbit-$(date +%s)",
  "Comment": "RoleRabbit Portfolios CDN",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-rolerabbit-portfolios",
        "DomainName": "$BUCKET_NAME.s3.$REGION.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-rolerabbit-portfolios",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": { "Forward": "none" }
    },
    "MinTTL": 0,
    "DefaultTTL": 300,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "404",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "404",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF

# Create distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### 5. Update Environment Variables

```bash
# .env.local
STORAGE_PROVIDER=s3
S3_REGION=us-east-1
S3_BUCKET=rolerabbit-portfolios
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key

CDN_PROVIDER=cloudfront
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Option C: DigitalOcean Spaces

#### 1. Create Space

```bash
# Via DigitalOcean Control Panel:
# 1. Go to Spaces
# 2. Create Space
# 3. Select region (e.g., NYC3)
# 4. Name: rolerabbit-portfolios
# 5. Enable CDN

# Or via API
curl -X POST "https://api.digitalocean.com/v2/spaces" \
  -H "Authorization: Bearer $DO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rolerabbit-portfolios",
    "region": "nyc3"
  }'
```

#### 2. Configure CORS

```bash
# Create cors.xml
cat > cors.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://rolerabbit.com</AllowedOrigin>
    <AllowedOrigin>https://*.rolerabbit.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
EOF

# Apply CORS (using AWS CLI with DigitalOcean endpoint)
aws s3api put-bucket-cors \
  --bucket rolerabbit-portfolios \
  --cors-configuration file://cors.xml \
  --endpoint-url https://nyc3.digitaloceanspaces.com
```

#### 3. Update Environment Variables

```bash
# .env.local
STORAGE_PROVIDER=digitalocean
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=us-east-1  # Can be any value for DO Spaces
S3_BUCKET=rolerabbit-portfolios
S3_ACCESS_KEY_ID=your-spaces-key
S3_SECRET_ACCESS_KEY=your-spaces-secret

# CDN is automatically enabled with Spaces
CDN_PROVIDER=none  # Spaces has built-in CDN
```

## Section 4.3: DNS & Domain Management

### Option A: Cloudflare (Recommended)

#### 1. Add Domain to Cloudflare

```bash
# Via Cloudflare Dashboard:
# 1. Go to https://dash.cloudflare.com
# 2. Add a site
# 3. Enter domain: rolerabbit.com
# 4. Select plan (Free is sufficient)
# 5. Update nameservers at your domain registrar

# Or via API
curl -X POST "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rolerabbit.com",
    "jump_start": true
  }'
```

#### 2. Get Zone ID

```bash
# List zones
curl "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result[] | {name, id}'

# Save zone ID
export CLOUDFLARE_ZONE_ID="your-zone-id"
```

#### 3. Setup Wildcard DNS

```bash
# Create wildcard CNAME record
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "*",
    "content": "rolerabbit.com",
    "ttl": 300,
    "proxied": false
  }'
```

#### 4. Create API Token

```bash
# Via Cloudflare Dashboard:
# 1. Go to My Profile > API Tokens
# 2. Create Token
# 3. Use template: Edit zone DNS
# 4. Select specific zone: rolerabbit.com
# 5. Create token and save it
```

#### 5. Update Environment Variables

```bash
# .env.local
DNS_PROVIDER=cloudflare
BASE_DOMAIN=rolerabbit.com
CLOUDFLARE_ZONE_ID=your-zone-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### Option B: AWS Route53

#### 1. Create Hosted Zone

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name rolerabbit.com \
  --caller-reference $(date +%s)

# Get hosted zone ID
export ROUTE53_HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='rolerabbit.com.'].Id" \
  --output text | cut -d'/' -f3)

echo "Hosted Zone ID: $ROUTE53_HOSTED_ZONE_ID"
```

#### 2. Update Nameservers

```bash
# Get nameservers
aws route53 get-hosted-zone --id $ROUTE53_HOSTED_ZONE_ID \
  --query "DelegationSet.NameServers" --output table

# Update these nameservers at your domain registrar
```

#### 3. Setup Wildcard DNS

```bash
# Create wildcard record
cat > wildcard-record.json <<EOF
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "*.rolerabbit.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "rolerabbit.com" }
        ]
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $ROUTE53_HOSTED_ZONE_ID \
  --change-batch file://wildcard-record.json
```

#### 4. Update Environment Variables

```bash
# .env.local
DNS_PROVIDER=route53
BASE_DOMAIN=rolerabbit.com
ROUTE53_HOSTED_ZONE_ID=your-hosted-zone-id
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### DNS Verification Setup

#### Setup for Let's Encrypt ACME Challenges

```bash
# Test DNS-01 challenge
npm run test:acme-challenge
```

```typescript
// Test script: scripts/test-acme-challenge.ts
import { acmeChallenge } from '../apps/web/src/lib/dns/acme-challenge';

async function test() {
  const challenge = await acmeChallenge.setupChallenge(
    'test.rolerabbit.com',
    'test-token-12345'
  );

  if (challenge) {
    console.log('✓ DNS-01 challenge created and propagated');
    await acmeChallenge.removeChallenge(challenge);
    console.log('✓ Challenge cleaned up');
  } else {
    console.error('✗ DNS propagation failed');
  }
}

test();
```

## Section 4.4: Background Job Queue

### Option A: Upstash Redis (Recommended for Serverless)

#### 1. Create Upstash Redis Database

```bash
# Via Upstash Console (https://console.upstash.com):
# 1. Create Database
# 2. Choose region (closest to your deployment)
# 3. Enable TLS
# 4. Copy REST URL and Token
```

#### 2. Update Environment Variables

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Queue configuration
DEPLOYMENT_CONCURRENCY=5
PDF_CONCURRENCY=10
QUEUE_ALERTS_ENABLED=true
```

### Option B: Self-Hosted Redis

#### 1. Install Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Docker
docker run -d \
  --name rolerabbit-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

#### 2. Configure Redis

```bash
# Edit redis.conf
sudo nano /etc/redis/redis.conf

# Set password
requirepass your-secure-password

# Enable AOF persistence
appendonly yes
appendfsync everysec

# Set memory policy
maxmemory 2gb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis
```

#### 3. Update Environment Variables

```bash
# .env.local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_TLS=false

DEPLOYMENT_CONCURRENCY=5
PDF_CONCURRENCY=10
```

### Setup Job Queue Monitoring

#### 1. Install Bull Dashboard (Development)

```bash
npm install --save-dev @bull-board/express @bull-board/api
```

#### 2. Create Dashboard Route

```typescript
// apps/web/src/pages/api/admin/queues.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { queueManager } from '../../../lib/queue/queues';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(queueManager.deploymentQueue),
    new BullMQAdapter(queueManager.pdfQueue),
    new BullMQAdapter(queueManager.sslQueue),
    new BullMQAdapter(queueManager.analyticsQueue),
  ],
  serverAdapter,
});

export default serverAdapter.getRouter();
```

#### 3. Access Dashboard

```
http://localhost:3000/api/admin/queues
```

### Setup Failure Alerts

#### Email Alerts (Resend)

```bash
# .env.local
ALERT_CHANNELS=email,slack
ALERT_EMAIL_TO=admin@rolerabbit.com,devops@rolerabbit.com
ALERT_EMAIL_FROM=alerts@rolerabbit.com
RESEND_API_KEY=re_your_api_key
```

#### Slack Alerts

```bash
# Create Slack Incoming Webhook:
# 1. Go to https://api.slack.com/apps
# 2. Create New App
# 3. Enable Incoming Webhooks
# 4. Add New Webhook to Workspace
# 5. Select channel (#alerts)
# 6. Copy Webhook URL

# .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ALERT_CHANNEL=#alerts
```

### Start Workers

#### Production Deployment

```bash
# Start deployment worker
node dist/workers/deployment.js

# Start PDF worker
node dist/workers/pdf.js

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'deployment-worker',
      script: './dist/workers/deployment.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pdf-worker',
      script: './dist/workers/pdf.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

## Testing & Verification

### Test Storage Upload

```bash
npm run test:storage
```

```typescript
// scripts/test-storage.ts
import { storageService } from '../apps/web/src/lib/storage/storage-service';

async function test() {
  const result = await storageService.uploadFile(
    'test/index.html',
    '<h1>Test</h1>',
    { contentType: 'text/html', isPublic: true }
  );
  console.log('✓ Uploaded to:', result.url);
}
```

### Test CDN Invalidation

```bash
npm run test:cdn
```

```typescript
// scripts/test-cdn.ts
import { cdnService } from '../apps/web/src/lib/cdn/cdn-service';

async function test() {
  const result = await cdnService.invalidate(['test/*']);
  console.log('✓ Invalidation ID:', result.id);
}
```

### Test DNS Record Creation

```bash
npm run test:dns
```

```typescript
// scripts/test-dns.ts
import { dnsService } from '../apps/web/src/lib/dns/dns-service';

async function test() {
  const record = await dnsService.createRecord({
    type: 'TXT',
    name: '_test',
    value: 'test-verification',
    ttl: 60,
  });
  console.log('✓ Created record:', record.id);

  // Cleanup
  await dnsService.deleteRecord(record.id);
}
```

### Test Job Queue

```bash
npm run test:queue
```

```typescript
// scripts/test-queue.ts
import { queueManager } from '../apps/web/src/lib/queue/queues';

async function test() {
  const job = await queueManager.addDeploymentJob({
    portfolioId: 'test-portfolio',
    deploymentId: 'test-deployment',
    userId: 'test-user',
  });
  console.log('✓ Job created:', job.id);

  const stats = await queueManager.getQueueStats('deployment');
  console.log('✓ Queue stats:', stats);
}
```

## Monitoring & Maintenance

### Queue Health Monitoring

```typescript
// Check queue health
import { queueMonitor } from './apps/web/src/lib/queue/monitoring';

const health = await queueMonitor.getHealthStatus();
console.log(health);

// Get metrics
const metrics = await queueMonitor.getMetrics();
console.log(metrics);
```

### Cleanup Old Jobs

```bash
# Clean completed jobs older than 7 days
npm run queue:clean
```

```typescript
// scripts/queue-clean.ts
import { queueManager } from '../apps/web/src/lib/queue/queues';

async function clean() {
  await queueManager.cleanQueue('deployment', 7 * 24 * 3600 * 1000);
  await queueManager.cleanQueue('pdf', 7 * 24 * 3600 * 1000);
  console.log('✓ Queues cleaned');
}
```

## Troubleshooting

### Storage Issues

**Problem:** Upload fails with 403 Forbidden

```bash
# Check bucket permissions
aws s3api get-bucket-acl --bucket rolerabbit-portfolios

# Verify IAM permissions
aws iam get-user-policy --user-name rolerabbit-s3-user --policy-name RoleRabbitS3Access
```

### CDN Issues

**Problem:** Invalidation not working

```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# List invalidations
aws cloudfront list-invalidations --distribution-id YOUR_DISTRIBUTION_ID
```

### DNS Issues

**Problem:** DNS records not propagating

```bash
# Check DNS propagation
dig @8.8.8.8 test.rolerabbit.com
dig @1.1.1.1 test.rolerabbit.com

# Check Cloudflare DNS
curl -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records"
```

### Queue Issues

**Problem:** Jobs stuck in waiting state

```bash
# Check Redis connection
redis-cli ping

# Check worker status
pm2 status

# View worker logs
pm2 logs deployment-worker
```

**Problem:** High failure rate

```bash
# Check failed jobs
import { deploymentQueue } from './apps/web/src/lib/queue/queues';
const failed = await deploymentQueue.getFailed();
failed.forEach(job => console.log(job.failedReason));
```

## Next Steps

1. ✅ Configure production environment variables
2. ✅ Set up monitoring and alerting
3. ✅ Run all test scripts to verify setup
4. ✅ Deploy workers to production
5. ✅ Monitor queue health for 24 hours
6. ✅ Set up automated backups
7. ✅ Document runbook for common issues

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/rolerabbit/issues
- Documentation: https://docs.rolerabbit.com
- Email: support@rolerabbit.com
