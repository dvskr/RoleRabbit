# Redis High Availability Guide

## Overview

This guide explains how Redis is configured for high availability in the RoleReady application, including persistence, monitoring, fallback mechanisms, and production best practices.

## Current Implementation ✅

### 1. Automatic Fallback to Memory Cache

**Status:** ✅ Implemented

The application uses a **two-tier caching strategy**:
- **Tier 1 (Memory):** LRU cache (default: 1000 items, 10-minute TTL)
- **Tier 2 (Redis):** Distributed cache for persistence and scaling

**Fallback Behavior:**
- If Redis is unavailable, the app automatically falls back to memory cache
- App continues to function normally (slightly slower, no distributed caching)
- No user-facing errors or crashes
- Automatic reconnection attempts when Redis becomes available

**Code Location:** `apps/api/utils/cacheManager.js`

### 2. Enhanced Connection Handling

**Status:** ✅ Implemented

**Features:**
- Exponential backoff retry strategy (1s, 2s, 4s, 8s, max 10s)
- Automatic reconnection on specific errors (READONLY, ECONNREFUSED, ETIMEDOUT)
- Maximum 10 reconnection attempts before giving up
- Comprehensive event logging (connect, ready, error, end, close, reconnecting)
- Error rate limiting (logs every 10th error to prevent spam)

**Configuration:**
```javascript
// apps/api/config/cacheConfig.js
{
  redisReconnectIntervalMs: 5000, // 5 seconds between manual reconnect attempts
  redisLazyConnect: true, // Connect on first use
  maxRetriesPerRequest: 3 // Retry failed operations
}
```

### 3. Health Checks and Monitoring

**Status:** ✅ Implemented

**Health Check Endpoint:** `/health/detailed`

**Metrics Tracked:**
- Connection status (ready, connecting, reconnecting, error, disconnected, closed, failed)
- Hit/miss rate
- Error count
- Reconnection attempts
- Last error message and timestamp
- Memory usage
- Response time

**Example Response:**
```json
{
  "status": "healthy",
  "checks": {
    "redis": {
      "status": "healthy",
      "responseTime": "5ms",
      "memoryUsed": "2.5M",
      "connectionStatus": "ready",
      "reconnectAttempts": 0,
      "lastError": null,
      "lastErrorTime": null
    },
    "cache": {
      "memory": {
        "entries": 245,
        "capacity": 1000,
        "utilizationPercent": "24.50"
      },
      "redis": {
        "enabled": true,
        "status": "ready",
        "hits": 1523,
        "misses": 342,
        "errors": 0,
        "reconnects": 0,
        "hitRate": "81.65%"
      }
    }
  }
}
```

### 4. Graceful Degradation

**Status:** ✅ Implemented

**Behavior When Redis is Down:**
1. App detects Redis is unavailable
2. Falls back to memory cache automatically
3. Logs warning (not error) - this is expected behavior
4. Continues serving requests normally
5. Attempts to reconnect in background
6. Resumes using Redis when connection restored

**No User Impact:**
- No error messages shown to users
- No failed requests
- Slightly slower (no distributed cache)
- Cache not shared across app instances

## Redis Persistence Configuration

### Option 1: RDB (Snapshotting) - Recommended for Most Cases

**What it does:** Periodic snapshots of the dataset

**Configuration (redis.conf):**
```conf
# Save snapshot every 60 seconds if at least 1000 keys changed
save 60 1000

# Save snapshot every 300 seconds if at least 100 keys changed
save 300 100

# Save snapshot every 900 seconds if at least 1 key changed
save 900 1

# Compress RDB files
rdbcompression yes

# Checksum RDB files
rdbchecksum yes

# RDB filename
dbfilename dump.rdb

# Directory for RDB files
dir /var/lib/redis
```

**Pros:**
- Fast restarts
- Compact single file
- Good for backups
- Minimal performance impact

**Cons:**
- Can lose data between snapshots (up to 60 seconds)
- Slow on large datasets
- Fork() can cause latency spikes

### Option 2: AOF (Append-Only File) - Maximum Durability

**What it does:** Logs every write operation

**Configuration (redis.conf):**
```conf
# Enable AOF
appendonly yes

# AOF filename
appendfilename "appendonly.aof"

# Fsync policy (choose one):
# - always: Fsync after every write (slowest, most durable)
# - everysec: Fsync every second (good balance) ✅ RECOMMENDED
# - no: Let OS decide when to fsync (fastest, least durable)
appendfsync everysec

# Rewrite AOF when it grows by 100%
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Don't fsync during rewrite (better performance)
no-appendfsync-on-rewrite no
```

**Pros:**
- Maximum durability (lose at most 1 second of data)
- More robust (can recover from corrupted files)
- Automatic log rewriting

**Cons:**
- Larger files than RDB
- Slower than RDB
- Longer restart times

### Option 3: RDB + AOF (Hybrid) - Best of Both Worlds ✅ RECOMMENDED

**Configuration (redis.conf):**
```conf
# Enable both
save 60 1000
save 300 100
save 900 1
appendonly yes
appendfsync everysec

# Use RDB for faster restarts, AOF for durability
aof-use-rdb-preamble yes
```

**Pros:**
- Fast restarts (RDB)
- Maximum durability (AOF)
- Best for production

**Cons:**
- Uses more disk space
- Slightly more complex

## Production Deployment

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: roleready-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: >
      redis-server
      --appendonly yes
      --appendfsync everysec
      --save 60 1000
      --save 300 100
      --save 900 1
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --tcp-backlog 511
      --timeout 0
      --tcp-keepalive 300
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks:
      - roleready-network

volumes:
  redis-data:
    driver: local

networks:
  roleready-network:
    driver: bridge
```

### Environment Variables

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_TLS=false
REDIS_TLS_REJECT_UNAUTHORIZED=true
REDIS_LAZY_CONNECT=true
REDIS_RECONNECT_INTERVAL_MS=5000

# Cache Configuration
CACHE_KEY_PREFIX=roleready
CACHE_DEFAULT_TTL_MS=300000
CACHE_RESUME_PARSE_TTL_MS=2592000000
CACHE_JOB_ANALYSIS_TTL_MS=86400000
CACHE_ATS_SCORE_TTL_MS=21600000
CACHE_AI_DRAFT_TTL_MS=7200000
CACHE_LRU_MAX_ITEMS=1000
CACHE_LRU_TTL_MS=600000
```

### Cloud Redis Services

#### AWS ElastiCache

```env
REDIS_URL=rediss://master.roleready-redis.abc123.use1.cache.amazonaws.com:6379
REDIS_TLS=true
```

**Features:**
- Automatic failover
- Multi-AZ replication
- Automatic backups
- Monitoring via CloudWatch

#### Azure Cache for Redis

```env
REDIS_URL=rediss://roleready-redis.redis.cache.windows.net:6380
REDIS_TLS=true
```

**Features:**
- High availability (99.9% SLA)
- Geo-replication
- Data persistence
- Azure Monitor integration

#### Redis Cloud (Redis Labs)

```env
REDIS_URL=rediss://redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
REDIS_TLS=true
```

**Features:**
- Active-active geo-distribution
- Auto-tiering (RAM + Flash)
- Automatic scaling
- 24/7 support

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Connection Status**
   - Alert if: `status !== 'ready'` for > 5 minutes
   - Action: Check Redis server, network, credentials

2. **Hit Rate**
   - Alert if: `hitRate < 70%` for > 1 hour
   - Action: Review cache TTLs, check if cache is being used

3. **Error Count**
   - Alert if: `errors > 100` in 5 minutes
   - Action: Check Redis logs, connection issues

4. **Reconnection Attempts**
   - Alert if: `reconnectAttempts > 5`
   - Action: Investigate connection stability

5. **Memory Usage**
   - Alert if: `used_memory > 80%` of `maxmemory`
   - Action: Increase Redis memory or review eviction policy

### Monitoring Tools

#### Prometheus + Grafana

**Install Redis Exporter:**
```bash
docker run -d \
  --name redis-exporter \
  -p 9121:9121 \
  oliver006/redis_exporter \
  --redis.addr=redis://localhost:6379
```

**Prometheus Configuration:**
```yaml
scrape_configs:
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

#### Application Monitoring

**Check health endpoint:**
```bash
curl http://localhost:3001/health/detailed | jq '.checks.redis'
```

**Monitor logs:**
```bash
# Watch for Redis errors
tail -f logs/app.log | grep -i redis

# Count errors in last hour
grep -i "redis.*error" logs/app.log | grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" | wc -l
```

## Backup and Recovery

### Automated Backups

**Backup Script (backup-redis.sh):**
```bash
#!/bin/bash

# Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"
BACKUP_DIR="/backups/redis"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Trigger BGSAVE
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" BGSAVE

# Wait for BGSAVE to complete
while [ $(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LASTSAVE) -eq $LAST_SAVE ]; do
  sleep 1
done

# Copy RDB file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/dump_$TIMESTAMP.rdb"

# Compress backup
gzip "$BACKUP_DIR/dump_$TIMESTAMP.rdb"

# Delete old backups
find "$BACKUP_DIR" -name "dump_*.rdb.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: dump_$TIMESTAMP.rdb.gz"
```

**Cron Schedule:**
```cron
# Daily backup at 2 AM
0 2 * * * /path/to/backup-redis.sh >> /var/log/redis-backup.log 2>&1
```

### Recovery

**From RDB:**
```bash
# Stop Redis
systemctl stop redis

# Replace dump.rdb
cp /backups/redis/dump_20241114_020000.rdb.gz /tmp/
gunzip /tmp/dump_20241114_020000.rdb.gz
cp /tmp/dump_20241114_020000.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb

# Start Redis
systemctl start redis
```

**From AOF:**
```bash
# Stop Redis
systemctl stop redis

# Replace appendonly.aof
cp /backups/redis/appendonly_20241114_020000.aof /var/lib/redis/appendonly.aof
chown redis:redis /var/lib/redis/appendonly.aof

# Start Redis
systemctl start redis
```

## Troubleshooting

### Redis Not Connecting

**Symptoms:** `redisStatus: 'error'` or `'disconnected'`

**Solutions:**
1. Check Redis is running: `redis-cli ping`
2. Check connection string: `echo $REDIS_URL`
3. Check network/firewall: `telnet localhost 6379`
4. Check Redis logs: `tail -f /var/log/redis/redis-server.log`
5. Verify credentials if using AUTH

### High Memory Usage

**Symptoms:** `used_memory` approaching `maxmemory`

**Solutions:**
1. Check eviction policy: `redis-cli CONFIG GET maxmemory-policy`
2. Set LRU eviction: `redis-cli CONFIG SET maxmemory-policy allkeys-lru`
3. Increase maxmemory: `redis-cli CONFIG SET maxmemory 512mb`
4. Review TTLs: Ensure keys expire appropriately
5. Clear unused keys: `redis-cli FLUSHDB` (caution!)

### Slow Performance

**Symptoms:** High response times, timeouts

**Solutions:**
1. Check slow log: `redis-cli SLOWLOG GET 10`
2. Monitor commands: `redis-cli MONITOR` (use sparingly)
3. Check persistence: Disable AOF fsync during peak times
4. Optimize queries: Use pipelining, avoid KEYS command
5. Scale up: Increase Redis memory/CPU

### Connection Timeouts

**Symptoms:** `ETIMEDOUT` errors

**Solutions:**
1. Increase timeout: `REDIS_CONNECT_TIMEOUT_MS=10000`
2. Check network latency: `ping redis-host`
3. Reduce connection pool size
4. Enable TCP keepalive: `tcp-keepalive 300`

## Testing

### Test Redis Failover

```bash
# 1. Start application
npm run dev

# 2. Verify Redis is working
curl http://localhost:3001/health/detailed | jq '.checks.redis.status'
# Should show: "healthy"

# 3. Stop Redis
docker stop roleready-redis
# OR
systemctl stop redis

# 4. Verify fallback to memory cache
curl http://localhost:3001/health/detailed | jq '.checks.redis.status'
# Should show: "unhealthy" or "error"

# 5. Verify app still works
curl http://localhost:3001/api/status
# Should return 200 OK

# 6. Restart Redis
docker start roleready-redis
# OR
systemctl start redis

# 7. Verify reconnection
curl http://localhost:3001/health/detailed | jq '.checks.redis.status'
# Should show: "healthy" after a few seconds
```

### Test Cache Recovery

```bash
# 1. Populate cache
# Make some API calls that use caching

# 2. Restart Redis
docker restart roleready-redis

# 3. Verify cache is empty (cold start)
curl http://localhost:3001/health/detailed | jq '.checks.cache.memory.entries'

# 4. Make API calls again
# Cache should repopulate
```

## Production Checklist

- [ ] Redis persistence enabled (RDB + AOF recommended)
- [ ] Automatic backups configured (daily minimum)
- [ ] Backup retention policy defined (30 days recommended)
- [ ] Monitoring and alerts set up
- [ ] Health checks integrated
- [ ] Failover tested
- [ ] Recovery procedure documented
- [ ] Memory limits configured (`maxmemory`)
- [ ] Eviction policy set (`allkeys-lru` recommended)
- [ ] TLS enabled for production
- [ ] Authentication enabled (if not using VPC)
- [ ] Network security configured (firewall rules)
- [ ] High availability setup (replication/cluster if needed)
- [ ] Disaster recovery plan documented

## Summary

**Current Status:** ✅ Production-Ready

- ✅ Automatic fallback to memory cache
- ✅ Enhanced connection handling with retry logic
- ✅ Comprehensive health checks and monitoring
- ✅ Graceful degradation when Redis is unavailable
- ✅ Metrics tracking (hits, misses, errors, reconnects)
- ✅ Integration with health check endpoints
- 📋 Persistence configuration guide provided
- 📋 Backup and recovery procedures documented
- 📋 Monitoring and alerting recommendations provided

**Next Steps (Optional):**
- Configure Redis persistence (RDB + AOF)
- Set up automated backups
- Configure monitoring alerts
- Test failover scenarios
- Document recovery procedures

---

**Last Updated**: November 14, 2024  
**Version**: 1.0.0

