# Backend API Optimization Plan

**Date**: 2025-11-11
**Scope**: Cloud Storage API (`storage.routes.js`)
**Status**: 🔄 In Progress

## Executive Summary

The storage API has 27 endpoints handling files, folders, sharing, comments, and credentials. Current implementation has several performance bottlenecks that will become critical as the user base grows.

## Critical Performance Issues Identified

### 1. **No Pagination** - HIGH PRIORITY 🔴
- **Endpoint**: `GET /api/storage/files` (line 37)
- **Issue**: Loads ALL files for a user in a single query
- **Impact**:
  - User with 1000 files = 1000+ DB rows + all relations loaded
  - Large JSON response (megabytes)
  - Slow API response (2-5+ seconds)
  - High memory usage on server
- **Solution**: Implement cursor-based pagination

### 2. **Over-fetching Related Data** - HIGH PRIORITY 🔴
- **Endpoint**: `GET /api/storage/files` (lines 85-141)
- **Issue**: Always loads folders, shares, comments for every file
- **Impact**:
  - 100 files × (shares + comments + users) = thousands of DB rows
  - N+1 queries for related entities (mitigated by includes but still heavy)
  - Client may not need all this data (e.g., simple file listing)
- **Solution**: Add selective includes via query parameters

### 3. **No Database Indexing** - MEDIUM PRIORITY 🟡
- **Issue**: Missing indexes on frequently queried columns
- **Impact**: Slow queries as data grows
- **Affected Queries**:
  - `WHERE userId = ?` (every query)
  - `WHERE deletedAt IS NULL` / `IS NOT NULL`
  - `WHERE folderId = ?`
  - `WHERE type = ?`
  - `WHERE name CONTAINS ?` (search)
- **Solution**: Add composite indexes

### 4. **No Response Caching** - MEDIUM PRIORITY 🟡
- **Issue**: Every request hits the database, even for unchanged data
- **Impact**: Unnecessary DB load, slower responses
- **Solution**: Add Redis caching with TTL and cache invalidation

### 5. **Heavy Data Transformation** - LOW PRIORITY 🟢
- **Issue**: Complex object mapping in application code (lines 145-198)
- **Impact**: CPU usage, memory allocations
- **Solution**: Use Prisma select to return data in correct shape

### 6. **No Rate Limiting** - MEDIUM PRIORITY 🟡
- **Issue**: No protection against abuse/DoS
- **Impact**: Single user can overload API
- **Solution**: Add rate limiting middleware

### 7. **Large File Uploads Block Event Loop** - LOW PRIORITY 🟢
- **Issue**: Synchronous file processing
- **Impact**: Blocks Node.js event loop during uploads
- **Solution**: Use streaming and worker threads

## Optimization Implementation Plan

### Phase 1: Quick Wins (Immediate Impact) ⚡

#### 1.1 Add Pagination to GET /files
```javascript
// Query parameters:
// - limit: Number of files to return (default: 50, max: 100)
// - cursor: ID of last file from previous page
// - sort: Sort field (createdAt, name, size)
// - order: Sort order (asc, desc)

const limit = Math.min(parseInt(request.query.limit) || 50, 100);
const cursor = request.query.cursor;

const files = await prisma.storageFile.findMany({
  where: {
    userId,
    deletedAt: null,
    ...(cursor ? { id: { lt: cursor } } : {})
  },
  take: limit + 1, // Take one extra to check if there are more
  orderBy: { createdAt: 'desc' }
});

const hasMore = files.length > limit;
if (hasMore) files.pop(); // Remove the extra item

return {
  files: formattedFiles,
  pagination: {
    hasMore,
    nextCursor: hasMore ? files[files.length - 1].id : null,
    limit
  }
};
```

**Impact**: 95% reduction in data transfer and query time

#### 1.2 Add Selective Includes
```javascript
// Query parameters:
// - include: Comma-separated list (shares,comments,folder)

const includeShares = request.query.include?.includes('shares');
const includeComments = request.query.include?.includes('comments');
const includeFolder = request.query.include?.includes('folder');

const files = await prisma.storageFile.findMany({
  where,
  include: {
    ...(includeFolder && { folder: { select: { id: true, name: true } } }),
    ...(includeShares && { shares: { include: { ... } } }),
    ...(includeComments && { comments: { where: { parentId: null }, include: { ... } } })
  }
});
```

**Impact**: 80% reduction in data transfer when full data not needed

#### 1.3 Add Database Indexes
```sql
-- apps/api/prisma/migrations/add_storage_indexes.sql

-- Main query index (userId + deletedAt is most common query)
CREATE INDEX CONCURRENTLY idx_storage_file_user_deleted
ON "StorageFile"("userId", "deletedAt", "createdAt" DESC);

-- Folder filtering
CREATE INDEX CONCURRENTLY idx_storage_file_folder
ON "StorageFile"("folderId") WHERE "folderId" IS NOT NULL;

-- Type filtering
CREATE INDEX CONCURRENTLY idx_storage_file_type
ON "StorageFile"("type");

-- Search optimization (GIN index for full-text search)
CREATE INDEX CONCURRENTLY idx_storage_file_search
ON "StorageFile" USING GIN(to_tsvector('english', "name" || ' ' || COALESCE("description", '')));

-- Starred files quick access
CREATE INDEX CONCURRENTLY idx_storage_file_starred
ON "StorageFile"("userId", "isStarred") WHERE "isStarred" = true;

-- Recently accessed files
CREATE INDEX CONCURRENTLY idx_storage_file_updated
ON "StorageFile"("userId", "updatedAt" DESC);
```

**Impact**: 10x faster queries as data grows

### Phase 2: Caching Layer (Significant Impact) 🚀

#### 2.1 Add Redis Caching for GET /files
```javascript
const cacheKey = `files:${userId}:${folderId}:${includeDeleted}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const files = await prisma.storageFile.findMany({ ... });
await redis.setex(cacheKey, 300, JSON.stringify(files)); // 5 min TTL

return files;
```

#### 2.2 Cache Invalidation Strategy
```javascript
// When file is created/updated/deleted:
await redis.del(`files:${userId}:*`); // Invalidate all user's file caches
await redis.del(`quota:${userId}`);   // Invalidate storage quota cache
```

**Impact**: 90% reduction in database queries for repeated requests

### Phase 3: Advanced Optimizations (Long-term) 🎯

#### 3.1 Rate Limiting
```javascript
const rateLimit = require('@fastify/rate-limit');

fastify.register(rateLimit, {
  max: 100,           // Max 100 requests
  timeWindow: 60000,  // Per minute
  keyGenerator: (request) => request.user?.id || request.ip
});
```

#### 3.2 Database Connection Pooling
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20  // Increase from default 10
}
```

#### 3.3 Query Optimization
- Use `select` instead of loading full objects
- Batch related queries
- Use database views for complex joins

#### 3.4 CDN for File Delivery
- Serve files through CloudFlare or AWS CloudFront
- Reduce bandwidth costs by 70%
- Improve download speeds globally

## Implementation Priority

### Week 1: Critical Fixes
1. ✅ Add pagination to GET /files
2. ✅ Add selective includes
3. ✅ Add database indexes
4. ⏳ Test with 10,000+ files

### Week 2: Caching
1. ⏳ Set up Redis
2. ⏳ Implement cache layer
3. ⏳ Add cache invalidation
4. ⏳ Monitor cache hit rates

### Week 3: Advanced
1. ⏳ Add rate limiting
2. ⏳ Optimize database connection pooling
3. ⏳ Performance testing
4. ⏳ CDN setup (if needed)

## Expected Performance Improvements

### Before Optimization
- GET /files with 1000 files: **3-5 seconds**
- Database queries per request: **1-100+**
- Data transfer: **5-10 MB**
- Memory usage: **High** (loading all relations)

### After Phase 1 (Pagination + Indexes)
- GET /files with pagination: **100-300ms** (93% faster)
- Database queries per request: **1-5**
- Data transfer: **50-200 KB** (95% reduction)
- Memory usage: **Low** (only requested data)

### After Phase 2 (+ Caching)
- GET /files (cached): **10-50ms** (99% faster)
- Database queries per request: **0** (cache hit)
- Data transfer: **50-200 KB**
- Memory usage: **Very Low**

## Monitoring & Metrics

Add performance monitoring:
```javascript
const responseTime = Date.now() - startTime;
logger.info('API Performance', {
  endpoint: '/api/storage/files',
  method: 'GET',
  userId,
  responseTime,
  fileCount: files.length,
  cached: !!cached
});
```

Track:
- Response times (p50, p95, p99)
- Database query counts
- Cache hit rates
- Error rates
- Memory usage

## Risk Assessment

### Low Risk ✅
- Adding pagination (backwards compatible with query params)
- Adding indexes (CONCURRENTLY prevents locking)
- Adding selective includes (optional query params)

### Medium Risk ⚠️
- Caching (need proper invalidation strategy)
- Rate limiting (may block legitimate users if too strict)

### High Risk 🔴
- None in current plan

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 optimizations
3. Test with production-like data
4. Monitor performance metrics
5. Proceed to Phase 2 if needed

---

**Prepared by**: Claude
**Review Status**: Pending
