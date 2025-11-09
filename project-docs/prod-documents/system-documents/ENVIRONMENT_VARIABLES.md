# Production Environment Variables

Production environment variables configuration for RoleReady.

## 📋 Overview

Production environment variables differ from development. This document outlines production-specific configurations.

## 🔒 Production Requirements

### Critical Variables

| Variable | Description | Notes |
|----------|-------------|-------|
| `NODE_ENV` | Must be set to `production` | Required |
| `DATABASE_URL` | Production database URL | Use secure connection string |
| `JWT_SECRET` | Production JWT secret | Use strong, unique secret |
| `JWT_REFRESH_SECRET` | Production refresh secret | Use strong, unique secret |
| `SESSION_SECRET` | Production session secret | Use strong, unique secret |

### Frontend Production Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Production API URL | `https://api.roleready.com` |
| `NEXT_PUBLIC_AI_API_URL` | Production AI API URL | `https://ai-api.roleready.com` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | `https://roleready.com` |

### CORS Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGIN` | Production frontend URL | `https://roleready.com` |

## 🔐 Security Best Practices

1. **Use Secret Management**
   - Use platform secret management (Vercel, Railway, etc.)
   - Never hardcode secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use SSL/TLS connections
   - Use connection pooling
   - Limit database access

3. **API Keys**
   - Store API keys securely
   - Use environment-specific keys
   - Monitor API usage

## 📊 Monitoring Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LOG_LEVEL` | Set to `info` or `warn` | No |
| `ENABLE_API_LOGGING` | Enable API logging | Yes |
| `ENABLE_ANALYTICS` | Enable analytics | No |

## 🚀 Feature Flags

Configure feature flags based on production needs:

| Variable | Production Value | Notes |
|----------|------------------|-------|
| `ENABLE_AI_FEATURES` | `true` | Enable if AI is ready |
| `ENABLE_CLOUD_STORAGE` | `true` | Required for file storage |
| `ENABLE_EMAIL_FEATURES` | `true` | Enable if email is configured |
| `ENABLE_ANALYTICS` | `true` | Enable for production monitoring |

## 📝 Production Checklist

- [ ] All secrets are strong and unique
- [ ] `NODE_ENV` is set to `production`
- [ ] Database URL uses SSL connection
- [ ] CORS origin matches production domain
- [ ] API keys are production keys
- [ ] Rate limiting is configured
- [ ] Logging is enabled
- [ ] Monitoring is configured

---

**Last Updated:** [Date]

