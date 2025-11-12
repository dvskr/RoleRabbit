# ⚡ Quick Redis Reference Card

**For RoleReady Project** | Last Updated: Nov 2025

---

## 🚀 **FASTEST SETUP (5 Minutes)**

### Option 1: Automated Setup (Recommended)
```powershell
.\SETUP_REDIS.ps1
```
Follow the wizard prompts!

### Option 2: Manual Setup
1. **Get Redis URL from Upstash**
   - Visit: https://upstash.com
   - Create database → Copy URL

2. **Create `.env` file**
   ```powershell
   Copy-Item samples\environment-sample.env .env
   ```

3. **Add to `.env`**
   ```env
   REDIS_URL=rediss://default:xxx@your-redis.upstash.io:6379
   REDIS_TLS=true
   ```

4. **Copy to API directory**
   ```powershell
   Copy-Item .env apps\api\.env
   ```

5. **Restart servers**
   ```powershell
   .\START_SERVERS.ps1
   ```

---

## 📋 **Environment Variables Quick Reference**

### Required Variables
```env
REDIS_URL=rediss://default:password@redis-xxx.upstash.io:6379
REDIS_TLS=true
```

### Optional (with defaults)
```env
CACHE_KEY_PREFIX=roleready
REDIS_LAZY_CONNECT=true
REDIS_RECONNECT_INTERVAL_MS=5000
```

### Cache TTL Settings
```env
CACHE_DEFAULT_TTL_MS=300000              # 5 min
CACHE_RESUME_PARSE_TTL_MS=2592000000    # 30 days
CACHE_JOB_ANALYSIS_TTL_MS=86400000      # 24 hours
CACHE_ATS_SCORE_TTL_MS=21600000         # 6 hours
CACHE_AI_DRAFT_TTL_MS=7200000           # 2 hours
```

---

## 🔍 **Verify Setup**

### Check Logs
Look for this message:
```
✅ Redis cache connected
```

### Check Upstash Dashboard
1. Go to upstash.com
2. Click your database
3. Check "Metrics" tab for activity

### Test Performance
1. Analyze a resume (first time = slow)
2. Analyze same resume (second time = fast ⚡)

---

## 🐛 **Troubleshooting One-Liners**

| Problem | Solution |
|---------|----------|
| Connection failed | Check `REDIS_URL` in `.env` |
| TLS error | Set `REDIS_TLS=true` for Upstash |
| Not caching | Restart server, check logs |
| Still slow | Check Upstash dashboard → Metrics |

---

## 📊 **Your Project Stats**

- **Project Size**: Large (80,000+ LOC)
- **API Endpoints**: 100+
- **Why Redis Matters**: 
  - Resume parsing: 30-day cache
  - ATS scores: 6-hour cache
  - AI content: 2-hour cache
  - **Saves**: Time ⏱️ + Money 💰

---

## 🔗 **Quick Links**

- **Detailed Guide**: `REDIS_SETUP_GUIDE.md`
- **Upstash Dashboard**: https://console.upstash.com
- **Upstash Docs**: https://docs.upstash.com/redis
- **Sample Config**: `samples/environment-sample.env`

---

## 💡 **Pro Tips**

1. **Free Tier**: 10,000 commands/day (perfect for dev)
2. **Monitor Usage**: Check Upstash dashboard daily
3. **Production**: Upgrade to Pro when needed ($10/month)
4. **Security**: Never commit `.env` (already in `.gitignore`)
5. **Performance**: Longer TTL = more savings

---

## ⚙️ **Files Modified**

When you run setup, these files are created/updated:

```
RoleReady-FullStack/
├── .env                           ← Created/Updated
├── apps/api/.env                  ← Created/Updated (copy)
├── REDIS_SETUP_GUIDE.md          ← Full documentation
├── SETUP_REDIS.ps1               ← Setup wizard
└── samples/environment-sample.env ← Template (updated)
```

---

## 🎯 **Expected Results**

### Before Redis:
- Resume analysis: 3-5 seconds every time
- High OpenAI costs
- Slower user experience

### After Redis:
- First request: 3-5 seconds (cache miss)
- Subsequent: < 100ms (cache hit) ⚡
- Lower costs 💰
- Happier users 😊

---

**Need help?** See `REDIS_SETUP_GUIDE.md` for detailed documentation.

---

**Quick Start Summary:**
```powershell
# One command to rule them all:
.\SETUP_REDIS.ps1
```

That's it! 🚀

