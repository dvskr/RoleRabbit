# Setting Up API Keys

## Overview

RoleReady requires API keys for AI features. This guide explains how to configure them.

---

## Required: OpenAI API Key

**Required for:** Resume AI generation, ATS scoring, job analysis, AI conversation

### Step 1: Get Your OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Configure the Key

**For Python AI API:**

Create/update `apps/api-python/.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**For Root Level (Optional):**

Create/update root `.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### Step 3: Restart Services

```bash
# Kill existing Python API
# Then restart
cd apps/api-python
python main.py
```

### Step 4: Verify

Check logs for:
```
✅ "OpenAI client initialized successfully"
```

**Not:**
```
❌ "OPENAI_API_KEY not set - AI features will use fallback responses"
```

---

## Optional: Email Service Keys

**Required for:** Sending emails (welcome, password reset, job reminders)

### Option A: Resend (Recommended)

1. Sign up at https://resend.com
2. Get API key
3. Add to `apps/api/.env`:
```env
RESEND_API_KEY=re_your_key_here
```

### Option B: SendGrid

1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `apps/api/.env`:
```env
SENDGRID_API_KEY=SG.your_key_here
```

### Option C: SMTP (Development Only)

Add to `apps/api/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Environment Variables Reference

### Node.js API (`apps/api/.env`)

```env
# Required
PORT=3001
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-jwt-secret

# Optional: Email
RESEND_API_KEY=re_your_key
SENDGRID_API_KEY=SG.your_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

### Python AI API (`apps/api-python/.env`)

```env
# Required for AI features
OPENAI_API_KEY=sk-your-openai-key

# Required
PORT=8000
JWT_SECRET=your-jwt-secret

# Optional: Different models
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
```

### Frontend (`apps/web/.env.local`)

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

---

## Cost Estimates

### OpenAI (gpt-4o-mini)

- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

**Typical usage per feature:**
- Resume generation: ~500 tokens = **$0.0003**
- ATS analysis: ~1500 tokens = **$0.001**
- Job analysis: ~1000 tokens = **$0.0006**

**Monthly estimate:**
- 50 AI operations/day = **~$3/month per user**

---

## Security Best Practices

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Never share API keys** publicly
3. **Use different keys** for dev/staging/production
4. **Rotate keys** periodically
5. **Monitor usage** on provider dashboards
6. **Set spending limits** on OpenAI account

---

## Testing API Keys

### Test OpenAI

```bash
# Run Python API with key
cd apps/api-python
python main.py

# Check logs
✅ "OpenAI client initialized successfully"

# Try AI feature in dashboard
# Should see real AI responses (not errors)
```

### Test Email

```bash
# Test email sending
curl -X POST http://localhost:3001/api/emails/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Test email"}'
```

---

## Troubleshooting

### "503 OpenAI client not configured"

- Check that `OPENAI_API_KEY` is set in environment
- Restart the Python API server
- Check for typos in the key

### "401 Unauthorized" from OpenAI

- Your API key is invalid or expired
- Generate a new key from OpenAI dashboard
- Ensure key starts with `sk-`

### "Rate limit exceeded"

- Hit OpenAI's usage limits
- Upgrade OpenAI plan or wait for reset
- Check usage on OpenAI dashboard

---

## Next Steps

- [Configure Database](database-setup.md)
- [Backend Setup](../03-setup/backend-setup.md)
- [Docker Setup](docker-setup.md)

