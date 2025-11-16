# Infrastructure, Deployment & Operations Guide

## Overview

This document describes the infrastructure setup for the My Files feature, including environment variables, background jobs, scaling, and observability.

## Environment Variables

### Required Variables

See `apps/api/.env.example` for complete list. Key variables:

```bash
# Storage
STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_STORAGE_BUCKET=files
MAX_FILE_SIZE=10485760
DEFAULT_STORAGE_LIMIT=5368709120
FRONTEND_URL=http://localhost:3000

# Redis (for queues)
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://...
```

### Validation

Environment variables are validated on server startup. Missing required variables will cause the server to exit in production.

## Background Jobs

### Queue System

Uses BullMQ (Redis-based) for background job processing.

### Available Jobs

1. **Quota Sync** - Daily at 2 AM UTC
2. **Cleanup** - Hourly (expired shares, links, old logs)
3. **Orphaned Files** - Daily at 3 AM UTC
4. **Thumbnail Generation** - Async on image upload
5. **Virus Scanning** - Async on file upload
6. **Sensitive Data Scanning** - Async on file upload
7. **Quota Warnings** - Triggered when quota > 80%

### Starting Workers

Workers start automatically with the server. To run separately:

```bash
node apps/api/jobs/index.js
```

## Scaling

### Horizontal Scaling

- Use Supabase Storage (not local filesystem)
- Configure Redis for shared state
- Use CDN for public file serving
- Database connection pooling configured

### Storage Quota Limits

- **FREE**: 5GB, 10MB max file, 100 files
- **PRO**: 50GB, 100MB max file, 1000 files
- **PREMIUM**: 500GB, 500MB max file, 10000 files

## Observability

### Logging

Structured logging for all file operations:
- Upload, download, delete, share
- Request ID tracking
- No sensitive data logged

### Metrics

Tracked metrics:
- Upload/download counts and speeds
- Error rates
- Storage usage
- Operation durations

### Tracing

Distributed tracing with OpenTelemetry support (when configured).

### Alerting

Automatic alerts for:
- Storage quota > 90%
- Storage service failures
- High error rates (> 10%)

## Monitoring

### Queue Status

```javascript
const { getAllQueueStatuses } = require('./config/queue');
const statuses = await getAllQueueStatuses();
```

### Metrics Endpoint

`GET /metrics` - Prometheus metrics format

## Dependencies

Required packages (already in package.json):
- `bullmq` - Queue system
- `ioredis` - Redis client
- `sharp` - Thumbnail generation

## Deployment Checklist

1. ✅ Set all required environment variables
2. ✅ Configure Redis instance
3. ✅ Set up Supabase Storage (or S3)
4. ✅ Configure CDN (optional but recommended)
5. ✅ Set up monitoring/alerting (PagerDuty, etc.)
6. ✅ Configure OpenTelemetry collector (optional)
7. ✅ Set up secrets management (AWS Secrets Manager, Vault, etc.)

## Troubleshooting

### Queues Not Working

- Check Redis connection: `REDIS_URL` environment variable
- Check Redis is running: `redis-cli ping`
- Workers will log errors if Redis is unavailable

### Jobs Not Running

- Check worker logs for errors
- Verify Redis connection
- Check queue status: `getAllQueueStatuses()`

### High Error Rates

- Check alerting system logs
- Review file operation logs
- Check storage service health

