# 🔧 ENVIRONMENT SETUP INSTRUCTIONS

## Overview
This document lists all required environment variables for the RoleReady Resume Builder application.

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

### Critical (P0) - Must Have

#### Database Configuration
```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database"

# Example:
DATABASE_URL="postgresql://postgres:password@localhost:5432/roleready"

# Read replica (optional, for performance)
DATABASE_READ_REPLICA_URL="postgresql://username:password@replica-host:port/database"

# Connection pool settings
DATABASE_CONNECTION_LIMIT=10
DATABASE_POOL_TIMEOUT=20
DATABASE_CONNECT_TIMEOUT=10
DATABASE_STATEMENT_TIMEOUT=30000
DATABASE_QUERY_TIMEOUT=10000
```

#### Redis Configuration
```bash
# Redis connection string
REDIS_URL="redis://host:port"

# Example:
REDIS_URL="redis://localhost:6379"

# Redis password (if required)
REDIS_PASSWORD="your-redis-password"

# Cache TTL (seconds)
REDIS_TTL=300
```

#### OpenAI Configuration
```bash
# OpenAI API key
OPENAI_API_KEY="sk-..."

# OpenAI model
OPENAI_MODEL="gpt-4"

# OpenAI timeout (milliseconds)
OPENAI_TIMEOUT=60000

# OpenAI max tokens
OPENAI_MAX_TOKENS=4000
```

#### Authentication & Security
```bash
# JWT signing secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# JWT expiration
JWT_EXPIRATION="7d"

# Session secret
SESSION_SECRET="your-session-secret-min-32-chars"

# Encryption key (for sensitive data)
ENCRYPTION_KEY="your-encryption-key-32-chars"
```

#### Application URLs
```bash
# Backend API URL (used by frontend)
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Frontend URL (used by backend for CORS, emails, etc.)
FRONTEND_URL="http://localhost:3000"

# Production URLs:
# NEXT_PUBLIC_API_URL="https://api.roleready.com"
# FRONTEND_URL="https://roleready.com"
```

#### Supabase (if using)
```bash
# Supabase project URL
SUPABASE_URL="https://your-project.supabase.co"

# Supabase anon key
SUPABASE_KEY="your-supabase-anon-key"

# Supabase service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

#### Node Environment
```bash
# Environment: "development" | "production" | "test"
NODE_ENV="development"

# Port configuration
PORT=3001
FRONTEND_PORT=3000
```

---

### High Priority (P1) - Should Have

#### File Storage
```bash
# Storage type: "local" | "s3" | "supabase"
STORAGE_TYPE="local"

# Local storage path
STORAGE_PATH="./uploads"

# AWS S3 (if using)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="roleready-uploads"

# Max file size (bytes)
MAX_FILE_SIZE=10485760  # 10MB
```

#### Email Configuration
```bash
# Email provider: "smtp" | "sendgrid" | "ses"
EMAIL_PROVIDER="smtp"

# SMTP settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@roleready.com"

# SendGrid (if using)
SENDGRID_API_KEY="your-sendgrid-api-key"

# AWS SES (if using)
AWS_SES_REGION="us-east-1"
```

#### Rate Limiting
```bash
# Rate limit window (milliseconds)
RATE_LIMIT_WINDOW=60000  # 1 minute

# Max requests per window
RATE_LIMIT_MAX_REQUESTS=60

# Rate limit for AI operations
AI_RATE_LIMIT_MAX_REQUESTS=10
```

#### Virus Scanning
```bash
# Virus scanning: "clamav" | "virustotal" | "none"
VIRUS_SCANNING_PROVIDER="clamav"

# ClamAV settings
CLAMAV_HOST="localhost"
CLAMAV_PORT=3310

# VirusTotal (if using)
VIRUSTOTAL_API_KEY="your-virustotal-api-key"
```

#### Monitoring & Logging
```bash
# Log level: "error" | "warn" | "info" | "debug"
LOG_LEVEL="info"

# Sentry DSN (for error tracking)
SENTRY_DSN="https://...@sentry.io/..."

# New Relic (if using)
NEW_RELIC_LICENSE_KEY="your-new-relic-key"
NEW_RELIC_APP_NAME="RoleReady"
```

#### Background Jobs
```bash
# BullMQ Redis connection
BULLMQ_REDIS_URL="redis://localhost:6379"

# Job concurrency
EXPORT_QUEUE_CONCURRENCY=5
AI_QUEUE_CONCURRENCY=3
PARSE_QUEUE_CONCURRENCY=5
EMBEDDING_QUEUE_CONCURRENCY=2

# Job timeouts (milliseconds)
EXPORT_JOB_TIMEOUT=300000  # 5 minutes
AI_JOB_TIMEOUT=120000      # 2 minutes
PARSE_JOB_TIMEOUT=60000    # 1 minute
```

---

## 📝 ENVIRONMENT FILES

### Development (.env.development)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/roleready_dev
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

### Production (.env.production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/roleready
DATABASE_READ_REPLICA_URL=postgresql://user:pass@replica-db.example.com:5432/roleready
REDIS_URL=redis://prod-redis.example.com:6379
NEXT_PUBLIC_API_URL=https://api.roleready.com
FRONTEND_URL=https://roleready.com
LOG_LEVEL=info
```

### Test (.env.test)
```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/roleready_test
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=error
```

---

## 🔐 SECRETS MANAGEMENT

### Using AWS Secrets Manager

```bash
# Install AWS SDK
npm install @aws-sdk/client-secrets-manager

# Store secrets
aws secretsmanager create-secret \
  --name roleready/production/database \
  --secret-string '{"url":"postgresql://..."}'

# Retrieve in application
# See: apps/api/config/secrets.js
```

### Using Doppler

```bash
# Install Doppler CLI
curl -Ls https://cli.doppler.com/install.sh | sh

# Login
doppler login

# Setup project
doppler setup

# Run application with Doppler
doppler run -- npm start
```

### Using HashiCorp Vault

```bash
# Install Vault
brew install vault

# Start Vault server
vault server -dev

# Store secrets
vault kv put secret/roleready \
  database_url="postgresql://..." \
  openai_api_key="sk-..."

# Retrieve in application
# See: apps/api/config/vault.js
```

---

## 🔄 SECRETS ROTATION SCHEDULE

| Secret | Rotation Frequency | Owner |
|--------|-------------------|-------|
| JWT_SECRET | 90 days | DevOps |
| OPENAI_API_KEY | 90 days | Engineering |
| DATABASE_PASSWORD | 90 days | Database Admin |
| AWS_SECRET_ACCESS_KEY | 90 days | DevOps |
| ENCRYPTION_KEY | 180 days | Security Team |

---

## ✅ VALIDATION CHECKLIST

Before starting the application, ensure:

- [ ] All required environment variables are set
- [ ] Database connection string is valid
- [ ] Redis is accessible
- [ ] OpenAI API key is valid
- [ ] JWT secret is at least 32 characters
- [ ] File storage is configured
- [ ] Email provider is configured (if using)
- [ ] Monitoring tools are configured (if using)

Run validation script:
```bash
node apps/api/utils/validateEnv.js
```

---

## 🆘 TROUBLESHOOTING

### Common Issues

#### 1. Missing Environment Variable
```
Error: Missing required environment variable: DATABASE_URL
```
**Solution:** Add the variable to your `.env` file

#### 2. Invalid Database URL
```
Error: Connection refused to database
```
**Solution:** Check DATABASE_URL format and database is running

#### 3. Redis Connection Failed
```
Error: Redis connection timeout
```
**Solution:** Verify Redis is running and REDIS_URL is correct

#### 4. Invalid OpenAI API Key
```
Error: OpenAI API authentication failed
```
**Solution:** Verify OPENAI_API_KEY is correct and has credits

---

## 📚 REFERENCES

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Redis Configuration](https://redis.io/docs/management/config/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Doppler Documentation](https://docs.doppler.com/)

---

## 🔒 SECURITY NOTES

1. **Never commit `.env` files to version control**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly (every 90 days)**
4. **Use secrets manager in production**
5. **Limit access to production secrets**
6. **Audit secret access regularly**
7. **Use strong, random secrets (min 32 characters)**
8. **Enable MFA for secrets manager access**

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

