# Database Connection Pooling Guide

## Overview

This guide explains how database connection pooling is configured and managed in the RoleReady application. Proper connection pooling is critical for production performance and reliability.

## What is Connection Pooling?

Connection pooling is a technique that maintains a pool of database connections that can be reused across multiple requests. This is much more efficient than creating a new connection for each database query.

### Benefits

1. **Performance**: Reusing connections is faster than creating new ones
2. **Resource Management**: Limits the number of concurrent connections to the database
3. **Scalability**: Handles high traffic without overwhelming the database
4. **Reliability**: Automatic reconnection and error recovery

## Configuration

### Environment Variables

Set these in your `.env` file:

```env
# Database Connection URL
DATABASE_URL="postgresql://user:password@localhost:5432/roleready?schema=public"

# Connection Pool Settings (Optional - defaults shown)
DB_CONNECTION_LIMIT=10        # Maximum connections in pool
DB_POOL_TIMEOUT=20            # Idle connection timeout (seconds)
DB_CONNECT_TIMEOUT=10         # New connection timeout (seconds)
DB_PGBOUNCER=false            # Enable pgBouncer compatibility
DB_SCHEMA_CACHE_TTL=300       # Schema cache TTL (seconds)
```

### Default Configuration

The application automatically configures the following pool parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `connection_limit` | 10 | Maximum number of connections in the pool |
| `pool_timeout` | 20s | How long an idle connection stays in the pool |
| `connect_timeout` | 10s | Maximum time to wait for a new connection |
| `statement_timeout` | 30s | Maximum time for a single query to execute |
| `pgbouncer` | false | pgBouncer compatibility mode |

## Sizing Your Connection Pool

### Formula

```
Total Connections = (Number of App Instances) × (Connection Limit per Instance)
```

**Important**: Ensure your database's `max_connections` is greater than the total connections from all app instances.

### Recommendations by Application Size

#### Small Application (< 100 concurrent users)
```env
DB_CONNECTION_LIMIT=10
```
- Good for: Development, staging, small production apps
- Database requirement: `max_connections` ≥ 20

#### Medium Application (100-1000 concurrent users)
```env
DB_CONNECTION_LIMIT=20
```
- Good for: Growing production apps
- Database requirement: `max_connections` ≥ 40 (for 2 app instances)

#### Large Application (> 1000 concurrent users)
```env
DB_CONNECTION_LIMIT=50
```
- Good for: High-traffic production apps
- Database requirement: `max_connections` ≥ 150 (for 3 app instances)

#### Very Large Application (> 10,000 concurrent users)
```env
DB_CONNECTION_LIMIT=100
DB_PGBOUNCER=true
```
- Good for: Enterprise-scale apps
- Requires: pgBouncer or similar connection pooler
- Database requirement: Depends on pgBouncer configuration

## Monitoring Connection Pool

### Health Check Endpoint

Check pool status via the health endpoint:

```bash
curl http://localhost:3001/health/detailed
```

Response includes pool information:

```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "pool": {
        "connectionLimit": 10,
        "poolTimeout": 20,
        "connectTimeout": 10,
        "pgbouncer": false,
        "isConnected": true,
        "reconnectAttempts": 0
      }
    }
  }
}
```

### Key Metrics to Monitor

1. **reconnectAttempts**: Should be 0 in normal operation
   - If > 0: Database connection issues
   - If > 5: Critical connection problem

2. **isConnected**: Should be `true`
   - If `false`: Database is unreachable

3. **Response Time**: Database query response time
   - Normal: < 100ms
   - Warning: 100-500ms
   - Critical: > 500ms

## Using Connection Pool in Code

### Standard Queries (Automatic Pooling)

```javascript
const { prisma } = require('./utils/db');

// Prisma automatically uses the connection pool
const users = await prisma.user.findMany();
```

### Queries with Retry Logic

For critical operations, use `safeQuery` wrapper:

```javascript
const { safeQuery, prisma } = require('./utils/db');

// Automatically retries on connection errors
const result = await safeQuery(async () => {
  return await prisma.user.findUnique({ where: { id: userId } });
});
```

### Raw SQL Queries

```javascript
const { prisma } = require('./utils/db');

const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

## Troubleshooting

### Problem: "Too many connections" error

**Symptoms**: Database rejects new connections

**Solutions**:
1. Reduce `DB_CONNECTION_LIMIT`
2. Increase database `max_connections`
3. Add more app instances with smaller pools
4. Implement pgBouncer

### Problem: Slow query performance

**Symptoms**: High response times, timeouts

**Solutions**:
1. Add database indexes (see `prisma/schema.prisma`)
2. Optimize slow queries
3. Increase `statement_timeout` if needed
4. Check database server resources

### Problem: Connection pool exhaustion

**Symptoms**: Requests hang, timeout errors

**Solutions**:
1. Increase `DB_CONNECTION_LIMIT`
2. Reduce query execution time
3. Implement request queuing
4. Scale horizontally (more app instances)

### Problem: Frequent reconnection attempts

**Symptoms**: `reconnectAttempts > 0` in health check

**Solutions**:
1. Check database server health
2. Verify network connectivity
3. Check firewall rules
4. Review database logs

## pgBouncer Integration

For very high traffic applications, use pgBouncer as an external connection pooler.

### Setup

1. Install pgBouncer:
```bash
# Ubuntu/Debian
sudo apt-get install pgbouncer

# macOS
brew install pgbouncer
```

2. Configure pgBouncer (`/etc/pgbouncer/pgbouncer.ini`):
```ini
[databases]
roleready = host=localhost port=5432 dbname=roleready

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

3. Update application configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:6432/roleready"
DB_PGBOUNCER=true
DB_CONNECTION_LIMIT=25  # Match pgBouncer default_pool_size
```

### pgBouncer Pool Modes

- **Session**: One connection per client session (default PostgreSQL behavior)
- **Transaction**: Connection returned after each transaction (recommended)
- **Statement**: Connection returned after each statement (most aggressive)

For RoleReady, use **transaction mode** for best balance of compatibility and performance.

## Best Practices

### 1. Connection Limit Sizing

- Start with default (10) and monitor
- Increase gradually based on load
- Never exceed database `max_connections`
- Consider horizontal scaling before very large pools

### 2. Query Optimization

- Add indexes for frequently queried fields
- Use `EXPLAIN ANALYZE` to identify slow queries
- Avoid N+1 query problems
- Use Prisma's query optimization features

### 3. Error Handling

- Always use try-catch for database operations
- Use `safeQuery` wrapper for critical operations
- Implement proper error logging
- Set up alerts for connection issues

### 4. Monitoring

- Track pool metrics in production
- Set up alerts for:
  - High reconnection attempts (> 3)
  - Slow queries (> 500ms)
  - Connection errors
  - Pool exhaustion
- Use APM tools for detailed insights

### 5. Testing

- Run connection pool tests before deployment
- Load test with realistic traffic patterns
- Test connection recovery scenarios
- Verify pool behavior under stress

## Testing Connection Pool

Run the connection pool test suite:

```bash
npm test -- phase8-connection-pooling.test.js
```

This test verifies:
- ✅ Pool configuration
- ✅ Concurrent connection handling
- ✅ Connection reuse and cleanup
- ✅ Pool statistics and monitoring
- ✅ Timeout and recovery
- ✅ Production readiness
- ✅ Sustained load handling

## Production Checklist

Before deploying to production:

- [ ] Connection pool size configured appropriately
- [ ] Database `max_connections` verified
- [ ] Health check endpoint tested
- [ ] Monitoring and alerts set up
- [ ] Connection pool tests passing
- [ ] Load testing completed
- [ ] Error handling verified
- [ ] Backup and recovery tested
- [ ] Documentation reviewed
- [ ] Team trained on troubleshooting

## Additional Resources

- [Prisma Connection Management](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [pgBouncer Documentation](https://www.pgbouncer.org/usage.html)
- [Database Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Check database server logs
4. Contact the development team

---

**Last Updated**: November 2024  
**Version**: 1.0.0

