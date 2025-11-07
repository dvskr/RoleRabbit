# Environment Variables Documentation

Complete reference for all environment variables used in RoleReady.

## 📋 Overview

RoleReady uses environment variables for configuration across frontend, Node.js API, and Python API services.

## 🔧 Frontend Environment Variables

Location: `apps/web/.env.local`

### API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Node.js API base URL | `http://localhost:3001` | Yes |
| `NEXT_PUBLIC_AI_API_URL` | Python AI API base URL | `http://localhost:8000` | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` | Yes |

## 🔧 Node.js API Environment Variables

Location: `apps/api/.env`

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3001` | No |
| `NODE_ENV` | Environment mode | `development` | Yes |

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |

Example: `postgresql://user:password@localhost:5432/roleready_db`

### Authentication Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` | No |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - | Yes |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` | No |
| `SESSION_SECRET` | Session secret key | - | Yes |
| `SESSION_MAX_AGE` | Session max age in ms | `86400000` | No |

### CORS Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` | No |

## 🔧 Python API Environment Variables

Location: `apps/api-python/.env`

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PYTHON_API_PORT` | Python API port | `8000` | No |
| `PYTHON_ENV` | Python environment | `development` | No |

### AI Services Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | Yes (for AI features) |
| `ANTHROPIC_API_KEY` | Anthropic API key | - | No |
| `GOOGLE_AI_API_KEY` | Google AI API key | - | No |

## 📧 Email Configuration (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server host | - | No |
| `SMTP_PORT` | SMTP server port | `587` | No |
| `SMTP_USER` | SMTP username | - | No |
| `SMTP_PASSWORD` | SMTP password | - | No |
| `SMTP_FROM` | From email address | - | No |

## 💾 Storage Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `STORAGE_TYPE` | Storage type (`supabase` or `local`) | `supabase` | No |
| `STORAGE_PATH` | Local storage path (if using local) | `./uploads` | No |
| `SUPABASE_URL` | Supabase project URL | - | Yes (if using Supabase) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - | Yes (if using Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | Yes (if using Supabase) |
| `SUPABASE_STORAGE_BUCKET` | Supabase storage bucket name | `roleready-file` | No |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) | No |

### AWS S3 (Alternative)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key | - | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - | No |
| `AWS_REGION` | AWS region | `us-east-1` | No |
| `AWS_S3_BUCKET` | S3 bucket name | - | No |

## 🔒 Security & Rate Limiting

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `PASSWORD_MIN_LENGTH` | Minimum password length | `8` | No |
| `PASSWORD_REQUIRE_UPPERCASE` | Require uppercase | `true` | No |
| `PASSWORD_REQUIRE_LOWERCASE` | Require lowercase | `true` | No |
| `PASSWORD_REQUIRE_NUMBER` | Require number | `true` | No |
| `PASSWORD_REQUIRE_SPECIAL` | Require special char | `true` | No |

## 🚩 Feature Flags

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENABLE_AI_FEATURES` | Enable AI features | `true` | No |
| `ENABLE_CLOUD_STORAGE` | Enable cloud storage | `true` | No |
| `ENABLE_EMAIL_FEATURES` | Enable email features | `false` | No |
| `ENABLE_ANALYTICS` | Enable analytics | `false` | No |

## 🐛 Development & Debugging

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DEBUG` | Enable debug mode | `false` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `ENABLE_API_LOGGING` | Enable API logging | `true` | No |

## 📝 Setup Instructions

1. Copy the sample environment file:
   ```bash
   cp samples/environment-sample.env .env
   ```

2. Update values in `.env` files:
   - `apps/web/.env.local` - Frontend variables
   - `apps/api/.env` - Node.js API variables
   - `apps/api-python/.env` - Python API variables

3. **Required for AI features:** Set `OPENAI_API_KEY`

4. **Required for database:** Set `DATABASE_URL`

5. **Required for authentication:** Set `JWT_SECRET` and `JWT_REFRESH_SECRET`

## ⚠️ Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Rotate secrets regularly
- Use environment-specific values for dev/staging/prod

---

**Last Updated:** [Date]

