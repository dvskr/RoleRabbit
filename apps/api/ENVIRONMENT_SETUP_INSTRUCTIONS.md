# 🔧 Environment Setup Instructions

## ❌ Current Issues

Your server failed to start due to:

1. **Missing CSRF_SECRET** - Required for security
2. **Weak JWT_SECRET** - Current secret is too short (needs 32+ characters)
3. **Missing Redis utility** - Fixed by updating health.routes.js

---

## ✅ Fixes Applied

### 1. Fixed Redis Import Issue
**File:** `apps/api/routes/health.routes.js`

**Changed:**
```javascript
// OLD (broken)
const redis = require('../utils/redis');

// NEW (working)
const { checkRedisHealth } = require('../utils/cacheManager');
```

**What it does:** Uses the existing `cacheManager` utility instead of a non-existent `redis` utility.

---

## 🔑 Required: Add Environment Variables

### Step 1: Open your `.env` file
Location: `apps/api/.env`

### Step 2: Add these two lines

```env
# CSRF Protection Secret (32+ characters)
CSRF_SECRET=feb4f362a7f9530d0eb88dfafa50d1ef263efe2d1eb2a5f2bd0d712f278a39e8

# JWT Secret (32+ characters) - REPLACE your current weak JWT_SECRET with this
JWT_SECRET=3ba51b35bf82c0dcb4d19cf05d1bcc7cd49550f0336efc4a14fd0ea13036b6d7
```

### Step 3: Save the file

### Step 4: Restart the server

```bash
npm run dev
```

---

## 📋 What Each Variable Does

### CSRF_SECRET
- **Purpose:** Protects against Cross-Site Request Forgery attacks
- **Used by:** `@fastify/csrf-protection` middleware
- **Security:** Must be 32+ characters, randomly generated
- **Impact:** Without this, the server won't start

### JWT_SECRET
- **Purpose:** Signs and verifies JSON Web Tokens for user authentication
- **Used by:** `@fastify/jwt` middleware
- **Security:** Must be 32+ characters, randomly generated
- **Impact:** Weak secrets can be cracked, compromising all user sessions

---

## ✅ After Adding Variables

Your server should start successfully and show:

```
✅ DATABASE_URL         postgresql://...
✅ OPENAI_API_KEY       ***
✅ JWT_SECRET           ***
✅ CSRF_SECRET          ***
✅ PORT                 3001
✅ NODE_ENV             development
✅ CORS_ORIGIN          http://localhost:3000
✅ REDIS_URL            redis://...
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to Git** - They contain secrets
2. **Use different secrets for dev/staging/production** - Don't reuse
3. **Rotate secrets periodically** - Generate new ones every 90 days
4. **Keep secrets long and random** - 32+ characters minimum

---

## 🆘 If You Still Have Issues

1. **Check file path:** Make sure `.env` is in `apps/api/` directory
2. **Check syntax:** No spaces around `=` sign
3. **Check quotes:** Don't wrap values in quotes
4. **Restart server:** Stop and start again after adding variables

---

**Generated:** November 14, 2024  
**Status:** Ready to apply

