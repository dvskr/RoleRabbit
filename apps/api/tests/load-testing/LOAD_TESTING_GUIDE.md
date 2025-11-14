# Load Testing Guide

**Date:** November 14, 2024  
**Status:** Ready to Execute  
**Tool:** k6 (https://k6.io)

---

## 📊 Overview

This guide provides instructions for load testing the RoleReady API to ensure it can handle production traffic.

---

## 🎯 Goals

1. **Verify Performance:** Ensure API meets response time requirements
2. **Find Bottlenecks:** Identify slow endpoints and database queries
3. **Determine Capacity:** Find maximum concurrent users system can handle
4. **Test Resilience:** Verify system recovers from high load
5. **Validate Scaling:** Ensure system scales horizontally

---

## 🚀 Quick Start

### 1. Install k6

**macOS:**
```bash
brew install k6
```

**Windows:**
```powershell
choco install k6
```

**Linux:**
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 2. Set Environment Variables

```bash
export BASE_URL="http://localhost:3001"
export AUTH_TOKEN="your-jwt-token-here"
```

### 3. Run Tests

```bash
# Run all scenarios
k6 run apps/api/tests/load-testing/k6-load-test.js

# Run specific scenario
k6 run --scenario smoke apps/api/tests/load-testing/k6-load-test.js

# Run with custom VUs and duration
k6 run --vus 10 --duration 30s apps/api/tests/load-testing/k6-load-test.js
```

---

## 📋 Test Scenarios

### 1. Smoke Test (2 VUs, 1 minute)
**Purpose:** Verify system works with minimal load

**What it tests:**
- Health check endpoint
- API status endpoint
- Basic functionality

**Success criteria:**
- All requests return 200
- Response time < 500ms
- No errors

### 2. Load Test (0-50 VUs, 14 minutes)
**Purpose:** Test normal expected load

**Stages:**
1. Ramp up to 10 VUs (2 minutes)
2. Ramp up to 50 VUs (5 minutes)
3. Stay at 50 VUs (5 minutes)
4. Ramp down to 0 (2 minutes)

**What it tests:**
- User profile fetching
- Resume list loading
- Health checks under load

**Success criteria:**
- Error rate < 1%
- p95 response time < 2000ms
- p99 response time < 5000ms
- No crashes

### 3. Stress Test (0-200 VUs, 14 minutes)
**Purpose:** Find breaking point

**Stages:**
1. Ramp up to 50 VUs (2 minutes)
2. Ramp up to 100 VUs (5 minutes)
3. Ramp up to 200 VUs (5 minutes)
4. Ramp down to 0 (2 minutes)

**What it tests:**
- System behavior under high load
- Rate limiting effectiveness
- Database connection pool
- Memory usage

**Success criteria:**
- System doesn't crash
- Rate limiting kicks in (429 responses)
- Graceful degradation
- Recovery after load drops

### 4. Spike Test (0-100 VUs, 1.5 minutes)
**Purpose:** Test sudden traffic increase

**Stages:**
1. Sudden spike to 100 VUs (10 seconds)
2. Stay at 100 VUs (1 minute)
3. Drop back to 0 (10 seconds)

**What it tests:**
- System response to sudden traffic
- Auto-scaling behavior
- Queue handling

**Success criteria:**
- System handles spike without crashing
- Response time < 2000ms during spike
- Quick recovery

---

## 📊 Performance Targets

### Response Time Targets

| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| Health Check | < 50ms | < 100ms | < 200ms |
| User Profile | < 200ms | < 500ms | < 1000ms |
| Resume List | < 300ms | < 800ms | < 1500ms |
| ATS Check (cached) | < 500ms | < 1500ms | < 3000ms |
| ATS Check (fresh) | < 3000ms | < 8000ms | < 15000ms |
| Resume Parsing | < 3000ms | < 8000ms | < 15000ms |
| Tailoring | < 8000ms | < 20000ms | < 40000ms |

### Capacity Targets

- **Concurrent Users:** 50+ without degradation
- **Requests per Second:** 100+ for read operations
- **Error Rate:** < 1% under normal load
- **Uptime:** 99.9% during tests

---

## 🔍 Monitoring During Tests

### 1. Server Metrics

**CPU Usage:**
```bash
# Linux/Mac
top -p $(pgrep -f "node server.js")

# Windows
tasklist /FI "IMAGENAME eq node.exe"
```

**Memory Usage:**
```bash
# Linux/Mac
ps aux | grep node

# Windows
wmic process where name="node.exe" get WorkingSetSize
```

**Network:**
```bash
# Linux
netstat -an | grep :3001

# Mac
lsof -i :3001
```

### 2. Database Metrics

**PostgreSQL:**
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;

-- Database size
SELECT pg_size_pretty(pg_database_size('roleready'));
```

### 3. Application Logs

```bash
# Tail logs
tail -f apps/api/logs/combined.log

# Filter errors
tail -f apps/api/logs/combined.log | grep ERROR

# Count errors
grep ERROR apps/api/logs/combined.log | wc -l
```

---

## 📈 Analyzing Results

### 1. k6 Output

k6 provides real-time output during tests:

```
     ✓ health check status is 200
     ✓ profile status is 200
     ✓ profile response time < 500ms

     checks.........................: 100.00% ✓ 1500      ✗ 0
     data_received..................: 2.1 MB  35 kB/s
     data_sent......................: 150 kB  2.5 kB/s
     http_req_duration..............: avg=245ms min=50ms med=200ms max=1.2s p(95)=500ms p(99)=800ms
     http_reqs......................: 1500    25/s
     iterations.....................: 500     8.33/s
```

### 2. Key Metrics to Watch

**Response Time:**
- Average should be < 1000ms
- p95 should be < 2000ms
- p99 should be < 5000ms

**Error Rate:**
- Should be < 1% under normal load
- 429 (rate limit) errors are expected under stress

**Throughput:**
- Requests per second should be stable
- Should not decrease significantly under load

**Resource Usage:**
- CPU should be < 80% under normal load
- Memory should not grow indefinitely (memory leak check)
- Database connections should not be exhausted

---

## 🐛 Common Issues & Solutions

### Issue 1: High Response Times

**Symptoms:**
- p95 > 5000ms
- Timeouts

**Possible Causes:**
- Database queries not using indexes
- N+1 query problem
- Slow AI operations
- Memory leak

**Solutions:**
- Add database indexes
- Optimize queries
- Add caching
- Increase timeout limits
- Scale horizontally

### Issue 2: High Error Rate

**Symptoms:**
- Error rate > 5%
- 500 errors

**Possible Causes:**
- Database connection pool exhausted
- Memory exhausted
- Unhandled exceptions

**Solutions:**
- Increase connection pool size
- Add error handling
- Fix memory leaks
- Add rate limiting

### Issue 3: System Crashes

**Symptoms:**
- Server stops responding
- Out of memory errors

**Possible Causes:**
- Memory leak
- Infinite loops
- Unhandled promises

**Solutions:**
- Profile memory usage
- Add memory limits
- Fix memory leaks
- Add circuit breakers

---

## 📝 Test Checklist

### Before Testing
- [ ] Backup database
- [ ] Set up monitoring (CPU, memory, network)
- [ ] Clear logs
- [ ] Ensure test environment matches production
- [ ] Set realistic test data
- [ ] Configure rate limits

### During Testing
- [ ] Monitor server metrics
- [ ] Watch application logs
- [ ] Check database connections
- [ ] Observe response times
- [ ] Note any errors

### After Testing
- [ ] Analyze k6 results
- [ ] Review server logs
- [ ] Check for memory leaks
- [ ] Document bottlenecks
- [ ] Create optimization tickets
- [ ] Plan capacity upgrades

---

## 🎯 Next Steps After Load Testing

1. **Optimize Bottlenecks**
   - Add database indexes
   - Optimize slow queries
   - Add caching
   - Compress responses

2. **Scale Infrastructure**
   - Add more server instances
   - Increase database resources
   - Add load balancer
   - Set up auto-scaling

3. **Improve Monitoring**
   - Set up APM (New Relic/Datadog)
   - Configure alerts
   - Create dashboards
   - Track trends

4. **Plan Capacity**
   - Calculate max users
   - Estimate costs
   - Plan scaling strategy
   - Set up auto-scaling

---

## 📚 Resources

- **k6 Documentation:** https://k6.io/docs/
- **Load Testing Best Practices:** https://k6.io/docs/testing-guides/
- **Performance Optimization:** https://nodejs.org/en/docs/guides/simple-profiling/
- **Database Optimization:** https://www.postgresql.org/docs/current/performance-tips.html

---

**Ready to test!** 🚀

Run the tests and optimize based on results.

