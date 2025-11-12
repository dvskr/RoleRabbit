# 🚀 Redis Setup Guide for RoleReady

This guide will help you set up **Upstash Redis** (recommended) for your RoleReady application.

---

## 📊 Why Redis for RoleReady?

Your application has **80,000+ lines of code** with expensive AI operations:
- ✅ Resume parsing (cached for 30 days)
- ✅ ATS score calculations (cached for 6 hours)
- ✅ AI-generated content (cached for 2 hours)
- ✅ Job analysis (cached for 24 hours)

**Without Redis**: Every user request triggers expensive OpenAI API calls 💸  
**With Redis**: Results are cached, saving time and money 💰

---

## 🎯 Recommended: Upstash Redis (5 Minutes Setup)

### Why Upstash?
- ✅ **Free tier**: 10,000 commands/day (perfect for development)
- ✅ **Serverless**: Pay only for what you use
- ✅ **Global**: Low latency worldwide
- ✅ **No credit card required** for free tier
- ✅ **Easy setup**: Just copy-paste a URL

---

## 📝 Step-by-Step Setup

### Step 1: Create Upstash Account

1. Go to: **https://upstash.com**
2. Click **"Sign Up"** (or **"Login"**)
3. Sign up with:
   - GitHub (fastest)
   - Google
   - Or email

### Step 2: Create a Redis Database

1. After login, click **"Create Database"**
2. Configure your database:

   ```
   Name: roleready-cache
   Type: Regional (recommended for development)
   Region: Choose closest to you
     - US users: us-east-1 (N. Virginia)
     - Europe users: eu-west-1 (Ireland)
     - Asia users: ap-southeast-1 (Singapore)
   Primary Region: Same as above
   TLS (SSL): ✅ Enabled (default)
   Eviction: ✅ Enabled (default)
   ```

3. Click **"Create"**

### Step 3: Get Your Connection URL

After creation, you'll see the **Database Details** page:

1. Look for the **"REST API"** section
2. Find **"UPSTASH_REDIS_REST_URL"** - Copy this URL

   It should look like:
   ```
   rediss://default:AbCdEfGh1234567890XyZ@happy-rabbit-12345.upstash.io:6379
   ```

   ⚠️ **Important**: Notice `rediss://` (with double 's') = TLS enabled

### Step 4: Create Your `.env` File

1. **In your project root**, copy the sample:
   ```powershell
   # PowerShell
   Copy-Item samples\environment-sample.env .env
   ```

   Or on Mac/Linux:
   ```bash
   cp samples/environment-sample.env .env
   ```

2. **Open `.env`** in your editor

3. **Find the Redis section** and update:
   ```env
   # ============================================
   # Redis Cache Configuration
   # ============================================
   
   # Paste your Upstash URL here (the one you copied in Step 3)
   REDIS_URL=rediss://default:YOUR_PASSWORD@your-redis.upstash.io:6379
   
   # Set to true because Upstash uses TLS
   REDIS_TLS=true
   
   # Optional: Customize these if needed
   CACHE_KEY_PREFIX=roleready
   REDIS_LAZY_CONNECT=true
   REDIS_RECONNECT_INTERVAL_MS=5000
   
   # Cache TTL Settings (optional - uses defaults if not set)
   CACHE_DEFAULT_TTL_MS=300000
   CACHE_RESUME_PARSE_TTL_MS=2592000000
   CACHE_JOB_ANALYSIS_TTL_MS=86400000
   CACHE_ATS_SCORE_TTL_MS=21600000
   CACHE_AI_DRAFT_TTL_MS=7200000
   CACHE_LRU_MAX_ITEMS=1000
   CACHE_LRU_TTL_MS=600000
   ```

4. **Save the file**

### Step 5: Create `.env` for API Directory (Important!)

Since your Node.js API is in `apps/api/`, you need to either:

**Option A: Copy `.env` to API directory (Recommended)**
```powershell
# PowerShell
Copy-Item .env apps\api\.env
```

**Option B: Use dotenv-cli to load from root**
Already configured in your project! Just make sure the root `.env` exists.

### Step 6: Restart Your API Server

```powershell
# Stop current servers (Ctrl+C)

# Then restart
.\START_SERVERS.ps1
```

Or if starting API only:
```powershell
cd apps\api
npm start
```

### Step 7: Verify Redis Connection

Check your server logs. You should see:

```
✅ Redis cache connected
```

If you see this, you're all set! 🎉

---

## 🧪 Testing Redis

### Test 1: Check Cache in Upstash Dashboard

1. Go back to **Upstash Dashboard**
2. Click on your **roleready-cache** database
3. Click **"Data Browser"** tab
4. After using your app (e.g., analyzing a resume), you should see keys like:
   ```
   roleready:resume:parse:abc123
   roleready:ats:score:xyz789
   ```

### Test 2: Test Performance

1. **First request** (no cache):
   - Analyze a resume
   - Note the response time (e.g., 3-5 seconds)

2. **Second request** (cached):
   - Analyze the same resume
   - Response time should be much faster (< 100ms)

---

## 🎛️ Upstash Dashboard Features

### Monitor Your Redis Usage

1. **Metrics** tab:
   - Commands per second
   - Memory usage
   - Connection count

2. **Data Browser** tab:
   - View cached data
   - Delete specific keys
   - Search keys by pattern

3. **Settings** tab:
   - Connection details
   - Reset password
   - Delete database

---

## 🔄 Alternative: Local Redis (Development Only)

If you prefer local Redis for development:

### Using Docker:

```powershell
# Pull Redis image
docker pull redis:alpine

# Run Redis
docker run -d --name roleready-redis -p 6379:6379 redis:alpine

# In your .env file:
REDIS_URL=redis://localhost:6379
REDIS_TLS=false
```

### Using Windows:

1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Install and run Redis
3. Use `REDIS_URL=redis://localhost:6379`

⚠️ **Note**: Local Redis data is lost when container stops. Not recommended for production.

---

## 🚨 Troubleshooting

### Error: "Redis connection failed"

**Cause**: Wrong URL or TLS setting

**Solution**:
1. Double-check your `REDIS_URL` in `.env`
2. Make sure `REDIS_TLS=true` for Upstash
3. Check if URL starts with `rediss://` (double 's')

### Error: "REDIS_URL is not defined"

**Cause**: `.env` file not loaded

**Solution**:
1. Make sure `.env` exists in `apps/api/` directory
2. Or ensure root `.env` exists and is being loaded
3. Restart your server

### Redis works but app still slow

**Cause**: Cache might not be hitting

**Solution**:
1. Check Upstash dashboard → Metrics
2. Look for "Commands" graph - should show activity
3. Check your logs for cache hit/miss messages

### "Too many commands" error (Free tier limit)

**Cause**: Exceeded 10,000 commands/day

**Solution**:
1. Upgrade to Upstash Pro ($10/month for 100K commands)
2. Or optimize cache settings (increase TTL)

---

## 📊 Production Deployment

### For Production (Vercel, Railway, etc.):

1. **Add environment variable** to your hosting platform:
   ```
   REDIS_URL=rediss://default:YOUR_PASSWORD@your-redis.upstash.io:6379
   REDIS_TLS=true
   ```

2. **Upstash handles scaling automatically** - no config needed!

3. **Monitor usage** in Upstash dashboard

4. **Consider upgrading** to Pro when you exceed free tier:
   - Pro: $10/month for 100K commands/day
   - Enterprise: Custom pricing

---

## 💡 Best Practices

1. **Never commit `.env`** - Already in `.gitignore` ✅
2. **Use different Redis databases** for dev/staging/prod:
   ```env
   # Development
   REDIS_URL=rediss://...upstash.io:6379/0
   
   # Production
   REDIS_URL=rediss://...upstash.io:6379/1
   ```

3. **Monitor cache hit rates** in Upstash dashboard

4. **Set appropriate TTLs**:
   - Frequently changing data: Short TTL (minutes)
   - Expensive computations: Long TTL (hours/days)
   - Resume parsing: 30 days ✅

---

## 🎉 You're All Set!

Your RoleReady application now has:
- ✅ Fast caching with Redis
- ✅ Reduced OpenAI API costs
- ✅ Better user experience
- ✅ Scalable infrastructure

### Next Steps:
1. Test your app's key features
2. Monitor Redis usage in Upstash dashboard
3. Adjust cache TTLs if needed
4. Enjoy faster response times! 🚀

---

## 📞 Need Help?

- **Upstash Docs**: https://docs.upstash.com/redis
- **Upstash Discord**: https://discord.gg/w9SenAtbme
- **Check your logs**: Look for Redis connection messages

---

**Last Updated**: November 2025  
**Version**: 1.0.0

