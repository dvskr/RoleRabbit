# 🚀 INFRASTRUCTURE QUICK START GUIDE

## Overview
Quick reference for setting up and running the RoleReady infrastructure components.

---

## ⚡ QUICK SETUP (5 Minutes)

### 1. Environment Variables
```bash
# Copy example config
cp apps/api/config/env.development.example .env

# Edit with your values
nano .env

# Required variables:
# - DATABASE_URL
# - REDIS_URL
# - OPENAI_API_KEY
# - JWT_SECRET (min 32 chars)
```

### 2. Validate Environment
```bash
node apps/api/utils/validateEnv.js
```

### 3. Start Background Workers
```bash
node apps/api/queues/startWorkers.js
```

### 4. Access Monitoring Dashboard
```
http://localhost:3001/admin/queues
Username: admin
Password: admin
```

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

### Critical (Must Have)
- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `REDIS_URL` - Redis connection
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `JWT_SECRET` - Min 32 characters
- [ ] `NODE_ENV` - development/production/test

### Recommended
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `FRONTEND_URL` - Frontend URL
- [ ] `DATABASE_READ_REPLICA_URL` - Read replica
- [ ] `SENTRY_DSN` - Error tracking (production)

---

## 🔧 COMMON TASKS

### Add a Job
```javascript
const { addJob } = require('./queues');

// Export PDF
await addJob('resume-export', 'export-pdf', {
  resumeId: 'resume-123',
  format: 'pdf',
  userId: 'user-456'
});

// Tailor resume
await addJob('ai-generation', 'tailor', {
  operation: 'tailor',
  resumeId: 'resume-123',
  userId: 'user-456',
  jobDescription: 'Job description...'
});
```

### Check Job Status
```javascript
const { getJobStatus } = require('./queues');

const status = await getJobStatus('resume-export', 'job-123');
console.log(status.state); // 'completed', 'active', 'failed'
```

### Get Queue Stats
```javascript
const { getAllQueueStats } = require('./queues');

const stats = await getAllQueueStats();
console.log(stats);
```

### Manual Cleanup
```bash
node -e "require('./queues/cleanup').manualCleanup()"
```

---

## 🔐 SECRETS MANAGEMENT

### AWS Secrets Manager
```javascript
const { getSecret } = require('./config/secrets');

// Configure
process.env.SECRETS_PROVIDER = 'aws';
process.env.AWS_REGION = 'us-east-1';

// Get secret
const dbUrl = await getSecret('DATABASE_URL');
```

### Doppler
```bash
# Install CLI
curl -Ls https://cli.doppler.com/install.sh | sh

# Login
doppler login

# Run app
doppler run -- npm start
```

### Environment Variables (Default)
```bash
# Just use .env file
export DATABASE_URL=postgresql://...
```

---

## 📊 MONITORING

### Bull Board Dashboard
- **URL:** `http://localhost:3001/admin/queues`
- **Features:**
  - View all queues
  - Monitor job progress
  - Retry failed jobs
  - View job details
  - Pause/resume queues

### Queue Statistics
```javascript
const { getQueueStats } = require('./queues');

const stats = await getQueueStats('resume-export');
// {
//   waiting: 5,
//   active: 2,
//   completed: 1234,
//   failed: 12
// }
```

---

## 🛠️ TROUBLESHOOTING

### Environment Validation Fails
```bash
# Run validation to see specific errors
node apps/api/utils/validateEnv.js

# Common issues:
# - Missing required variable
# - Invalid URL format
# - JWT secret too short
```

### Workers Not Starting
```bash
# Check Redis connection
redis-cli ping

# Check logs
tail -f logs/workers.log

# Restart workers
pkill -f startWorkers
node apps/api/queues/startWorkers.js
```

### Jobs Stuck in Queue
```bash
# Check worker status
# Access Bull Board: http://localhost:3001/admin/queues

# Manually retry failed jobs
# Or restart workers
```

### High Memory Usage
```bash
# Clean old jobs
node -e "require('./queues/cleanup').manualCleanup()"

# Check queue sizes
node -e "require('./queues').getAllQueueStats().then(console.log)"
```

---

## 🔄 DEPLOYMENT

### Development
```bash
# Start with nodemon
npm run dev

# Or with PM2
pm2 start apps/api/queues/startWorkers.js --name workers
```

### Production
```bash
# Use PM2 for process management
pm2 start apps/api/queues/startWorkers.js --name workers -i 2

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Docker
```dockerfile
# Dockerfile for workers
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "apps/api/queues/startWorkers.js"]
```

```bash
# Build and run
docker build -t roleready-workers .
docker run -d --name workers --env-file .env roleready-workers
```

---

## 📈 SCALING

### Horizontal Scaling
```bash
# Run multiple worker instances
pm2 start apps/api/queues/startWorkers.js -i 4

# Or use Docker Compose
docker-compose up --scale workers=4
```

### Queue Concurrency
```bash
# Adjust in environment
EXPORT_QUEUE_CONCURRENCY=10
AI_QUEUE_CONCURRENCY=5
PARSE_QUEUE_CONCURRENCY=10
```

### Redis Scaling
```bash
# Use Redis Cluster for high availability
# Or Redis Sentinel for automatic failover
```

---

## 🔒 SECURITY CHECKLIST

- [ ] Use secrets manager in production
- [ ] Rotate secrets every 90 days
- [ ] Enable Bull Board authentication
- [ ] Use HTTPS for all connections
- [ ] Limit Redis access to internal network
- [ ] Enable Redis password authentication
- [ ] Use environment-specific configs
- [ ] Never commit .env files

---

## 📚 DOCUMENTATION

- **Full Environment Guide:** `ENVIRONMENT_SETUP_INSTRUCTIONS.md`
- **Complete Implementation:** `SECTION_4.1_AND_4.2_COMPLETE.md`
- **Deployment Checklist:** `QUICK_DEPLOYMENT_CHECKLIST.md`

---

## 🆘 SUPPORT

### Logs
```bash
# Application logs
tail -f logs/app.log

# Worker logs
tail -f logs/workers.log

# PM2 logs
pm2 logs workers
```

### Health Checks
```bash
# Check API health
curl http://localhost:3001/api/health

# Check Redis
redis-cli ping

# Check database
psql $DATABASE_URL -c "SELECT 1"
```

---

**Status:** ✅ PRODUCTION READY  
**Last Updated:** November 15, 2025

