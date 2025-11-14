# Redis Caching Layer

This document describes the Redis caching implementation for the RoleRabbit storage API.

## Overview

Redis caching is implemented to significantly improve performance for frequently accessed data like file lists, folder structures, and storage analytics. The caching layer is **optional** and the API will gracefully degrade to direct database queries if Redis is unavailable.

## Features

- **Automatic Cache Management**: Cache is automatically populated and invalidated
- **Graceful Degradation**: API works normally without Redis
- **Smart Invalidation**: Cache is invalidated only when data changes
- **Configurable TTL**: Different cache durations for different data types
- **Pattern-based Invalidation**: Bulk cache clearing for related keys

## Configuration

### Environment Variables

```bash
# Enable/disable Redis caching (default: enabled)
REDIS_ENABLED=true

# Redis connection settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # Optional
REDIS_DB=0  # Database number (0-15)
```

### Installation

Redis is already listed in dependencies. If not installed:

```bash
npm install ioredis
```

### Starting Redis

**macOS (via Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

## Cached Endpoints

### File Operations
- `GET /api/storage/files` - File list with pagination (5min TTL)
- Individual file details (5min TTL)

### Folder Operations
- `GET /api/storage/folders` - Folder list (10min TTL)

### Analytics
- `GET /api/storage/analytics` - Storage analytics (15min TTL)

## Cache Keys

The cache uses a hierarchical key structure:

```
user:{userId}:files:folder:{folderId}:type:{type}:page:{page}:limit:{limit}:deleted:{bool}:archived:{bool}
user:{userId}:folders:list
user:{userId}:file:{fileId}
user:{userId}:analytics
```

### Examples:
```
user:abc123:files:folder:all:type:resume:page:1:limit:50:deleted:false:archived:false
user:abc123:folders:list
user:abc123:file:file_xyz:
user:abc123:analytics
```

## Cache TTL (Time To Live)

| Data Type | TTL | Reason |
|-----------|-----|--------|
| File List | 5 minutes (300s) | Frequently changes |
| Folder List | 10 minutes (600s) | Changes less frequently |
| File Detail | 5 minutes (300s) | Metadata may change |
| Analytics | 15 minutes (900s) | Heavy query, can tolerate staleness |
| Search Results | 3 minutes (180s) | Results may change quickly |

## Cache Invalidation

Cache is automatically invalidated when data changes:

### File Operations
- **Upload**: Invalidates file list cache for user
- **Update**: Invalidates file list + specific file cache
- **Delete**: Invalidates file list + specific file cache
- **Restore**: Invalidates file list + specific file cache
- **Move**: Invalidates file list + specific file cache

### Folder Operations
- **Create**: Invalidates folder list cache
- **Update**: Invalidates folder list cache
- **Delete**: Invalidates folder list cache

### Batch Operations
- **Batch Delete**: Invalidates file list cache
- **Batch Move**: Invalidates file list cache
- **Batch Restore**: Invalidates file list cache

## Performance Impact

### Without Cache
- File list query: ~100-200ms (database query + formatting)
- Folder list query: ~50-100ms (database query + formatting)
- Analytics query: ~500-1000ms (complex aggregations)

### With Cache
- File list query (cached): ~5-10ms (Redis retrieval)
- Folder list query (cached): ~5-10ms (Redis retrieval)
- Analytics query (cached): ~5-10ms (Redis retrieval)

**Performance Improvement**: 10-100x faster for cached queries

### Cache Hit Rate

Expected cache hit rates:
- File list: 60-80% (users frequently refresh)
- Folder list: 80-90% (changes less often)
- Analytics: 90-95% (queried often, changes rarely)

## Monitoring

### Check Redis Connection

```bash
# From command line
redis-cli ping
# Should return: PONG

# Check keys
redis-cli KEYS "user:*" | head -10

# Get cache statistics
redis-cli INFO stats
```

### Application Logs

Cache operations are logged at DEBUG level:

```
[CACHE HIT] File list for user abc123
[CACHE SET] user:abc123:files:folder:all:type:all:page:1:limit:50:deleted:false:archived:false (TTL: 300s)
[CACHE INVALIDATE] File list for user abc123 after upload
```

### Metrics

The API exposes cache metrics at `/metrics`:

```
redis_cache_hits_total
redis_cache_misses_total
redis_cache_errors_total
redis_connection_status
```

## Manual Cache Management

### Clear User Cache

```javascript
const redisCache = require('./utils/redisCache');

// Clear all cache for a user
await redisCache.invalidateUser(userId);

// Clear file list cache for a user
await redisCache.invalidateFileList(userId);

// Clear folder cache for a user
await redisCache.invalidateFolders(userId);

// Clear specific file cache
await redisCache.invalidateFile(userId, fileId);
```

### Clear All Cache

```bash
# From Redis CLI
redis-cli FLUSHDB

# Or from application
const redisCache = require('./utils/redisCache');
await redisCache.delPattern('*');
```

## Best Practices

### When to Cache
✅ **DO cache:**
- Read-heavy endpoints (file lists, folder lists)
- Expensive queries (analytics, aggregations)
- Data that doesn't change frequently
- Data that can tolerate slight staleness

❌ **DON'T cache:**
- Real-time data that must be fresh
- User-specific sensitive data with strict compliance requirements
- Search queries (or use very short TTL)
- Rapidly changing data

### Cache Invalidation Strategy

1. **Invalidate on Write**: Always invalidate cache after create/update/delete operations
2. **Pattern-based Invalidation**: Use pattern matching to clear related keys
3. **Granular Invalidation**: Invalidate only affected cache keys, not everything
4. **Async Invalidation**: Don't block response waiting for cache invalidation

### Security Considerations

- **Never cache authentication tokens** in Redis with long TTL
- **Verify user permissions** before returning cached data
- **Use separate Redis instances** for production and development
- **Enable Redis AUTH** in production (via `REDIS_PASSWORD`)
- **Consider encryption** for sensitive cached data

## Troubleshooting

### Redis Connection Issues

**Problem**: `Redis cache error (will fallback to no-cache)`

**Solutions**:
1. Check if Redis is running: `redis-cli ping`
2. Verify connection settings in `.env`
3. Check firewall rules
4. Check Redis logs: `/var/log/redis/redis-server.log`

### Cache Not Invalidating

**Problem**: Seeing stale data after updates

**Solutions**:
1. Check logs for cache invalidation messages
2. Manually clear cache: `redis-cli FLUSHDB`
3. Verify invalidation logic is called after mutations
4. Reduce TTL for debugging

### Memory Issues

**Problem**: Redis using too much memory

**Solutions**:
```bash
# Check memory usage
redis-cli INFO memory

# Set max memory (e.g., 256MB)
redis-cli CONFIG SET maxmemory 256mb

# Set eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

**Configure in `redis.conf`:**
```
maxmemory 256mb
maxmemory-policy allkeys-lru  # Evict least recently used keys
```

### Cache Stampede

**Problem**: Many requests hitting database when cache expires

**Solution**: Implement staggered TTLs
```javascript
const ttl = BASE_TTL + Math.floor(Math.random() * 60); // Add 0-60s jitter
await redisCache.set(key, data, ttl);
```

## Production Deployment

### Redis Cluster

For high availability, use Redis Cluster or Sentinel:

```bash
# Redis Sentinel (recommended for production)
REDIS_SENTINELS=sentinel1:26379,sentinel2:26379,sentinel3:26379
REDIS_SENTINEL_NAME=mymaster
```

### Monitoring

Use Redis monitoring tools:
- **Redis Insight**: GUI for monitoring Redis
- **RedisInsight**: Official Redis monitoring tool
- **Prometheus + Grafana**: Custom dashboards

### Backup

Redis persistence options:
```
# RDB: Point-in-time snapshots
save 900 1      # Save if 1 key changed in 900 seconds
save 300 10     # Save if 10 keys changed in 300 seconds
save 60 10000   # Save if 10000 keys changed in 60 seconds

# AOF: Append-only file (more durable)
appendonly yes
appendfsync everysec
```

## Development Tips

### Disable Cache for Testing

```bash
REDIS_ENABLED=false npm run dev
```

### View Cached Data

```bash
# List all keys
redis-cli KEYS "user:*"

# Get specific cached data
redis-cli GET "user:abc123:files:folder:all:type:all:page:1:limit:50:deleted:false:archived:false"

# Monitor cache operations in real-time
redis-cli MONITOR
```

### Performance Testing

```bash
# Test cache performance
redis-cli --latency
redis-cli --latency-history

# Benchmark
redis-cli --intrinsic-latency 100
```

## Code Examples

### Custom Cache Key

```javascript
const redisCache = require('../utils/redisCache');

// Custom cache key
const cacheKey = `user:${userId}:custom:${resourceId}`;
const cachedData = await redisCache.get(cacheKey);

if (cachedData) {
  return reply.send(cachedData);
}

// Fetch from database
const data = await fetchData();

// Cache with custom TTL (10 minutes)
await redisCache.set(cacheKey, data, 600);
```

### Conditional Caching

```javascript
// Only cache for non-admin users
if (!user.isAdmin && redisCache.isAvailable()) {
  const cachedData = await redisCache.get(cacheKey);
  if (cachedData) return reply.send(cachedData);
}
```

## Future Enhancements

Potential improvements:
- [ ] Cache warming on application startup
- [ ] Distributed cache invalidation across multiple app instances
- [ ] Cache compression for large objects
- [ ] Cache hit/miss analytics dashboard
- [ ] Adaptive TTL based on usage patterns
- [ ] Write-through caching for critical data

## References

- [ioredis Documentation](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Caching Strategies](https://aws.amazon.com/caching/best-practices/)
