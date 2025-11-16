# My Files Feature - Setup Instructions

**INFRA-001, DOC-012**: Complete setup guide for the My Files feature

## Overview

The My Files feature provides secure file storage, sharing, and management capabilities. This guide covers environment configuration, local development setup, and deployment.

## Environment Variables

### Required Variables

#### Storage Configuration

- **STORAGE_TYPE** (`supabase`|`local`)
  - Storage provider type
  - Default: `supabase` (recommended for production)
  - Use `local` for development/testing

- **FRONTEND_URL** (required)
  - Frontend URL for share links and email notifications
  - Example: `http://localhost:3000` (dev) or `https://app.roleready.com` (prod)

#### Supabase Storage (Required when `STORAGE_TYPE=supabase`)

- **SUPABASE_URL** (required if using Supabase)
  - Supabase project URL
  - Example: `https://xxxxx.supabase.co`

- **SUPABASE_SERVICE_ROLE_KEY** (required if using Supabase)
  - Supabase service role key (keep secret!)
  - Used for server-side file operations

- **SUPABASE_STORAGE_BUCKET** (required if using Supabase)
  - Storage bucket name
  - Default: `roleready-file`

#### Local Storage (Required when `STORAGE_TYPE=local`)

- **STORAGE_PATH** (required if using local storage)
  - Local directory path for file storage
  - Default: `./uploads`
  - Make sure the directory exists and is writable

### Optional Variables

- **MAX_FILE_SIZE** (default: `10485760` = 10MB)
  - Maximum file size in bytes
  - Applies to uploads

- **DEFAULT_STORAGE_LIMIT** (default: `5368709120` = 5GB)
  - Default storage quota per user in bytes

- **STORAGE_TIMEOUT_MS** (default: `60000` = 60 seconds)
  - Storage operation timeout in milliseconds

- **STORAGE_CDN_URL** (optional)
  - CDN URL for public file serving
  - Reduces server load for public files

- **ENABLE_FILE_ENCRYPTION** (`true`|`false`, default: `false`)
  - Enable file encryption at rest
  - Requires encryption key setup

### Database

- **DATABASE_URL** (required)
  - PostgreSQL connection string
  - Example: `postgresql://user:password@localhost:5432/roleready`

### Redis (for queues and caching)

- **REDIS_URL** (optional, default: `redis://localhost:6379`)
  - Redis connection URL
  - Required for background jobs

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository>
cd RoleReady-FullStack
npm install
```

### 2. Environment Configuration

Create `.env` file in `apps/api/`:

```bash
# Copy example (if available)
cp .env.example .env
```

Or manually create with minimum required variables:

```bash
# Storage (local for development)
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# Frontend
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/roleready

# Node environment
NODE_ENV=development
```

### 3. Create Storage Directory

```bash
mkdir -p apps/api/uploads
```

### 4. Database Setup

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

### 5. Start Development Server

```bash
cd apps/api
npm run dev
```

The API server will start on `http://localhost:3001` (or your configured PORT).

## Testing the Setup

### 1. Verify Storage Configuration

The server startup logs should show:
```
✅ Environment validation passed
✅ Storage initialized: local (path: ./uploads)
```

### 2. Test File Upload

Use the frontend or make a test API call:

```bash
curl -X POST http://localhost:3001/api/storage/files \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@test.pdf"
```

### 3. Verify File Storage

Check that files are created in the storage directory:
```bash
ls -la apps/api/uploads/
```

## Production Deployment

### 1. Use Supabase Storage

In production, use Supabase for better scalability:

```bash
STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_STORAGE_BUCKET=roleready-file
```

### 2. Environment-Specific Configuration

The application automatically adjusts configuration based on `NODE_ENV`:

- **development**: Local storage, no encryption, verbose logging
- **staging**: Supabase storage, encryption enabled, metrics enabled
- **production**: Supabase storage, all security features enabled

### 3. Secrets Management

**INFRA-003**: For production, use a secrets manager:

```bash
SECRETS_PROVIDER=aws  # or 'vault'
```

Configure AWS Secrets Manager or HashiCorp Vault to store:
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- Database credentials

### 4. Enable Background Jobs

Background jobs run automatically when `ENABLE_BACKGROUND_JOBS=true` (default).

Jobs:
- **Quota Sync**: Daily at 2 AM
- **Cleanup**: Hourly (expired shares/links, old logs)
- **Orphaned Files**: Daily at 3 AM

### 5. Monitoring

**INFRA-024 to INFRA-027**: Set up monitoring for:
- Storage quota usage (>90% alert)
- Storage service failures
- High error rates
- Upload/download performance

## Troubleshooting

### Common Issues

#### 1. Storage Directory Not Writable

**Error**: `EACCES: permission denied`

**Solution**:
```bash
chmod 755 apps/api/uploads
```

#### 2. Environment Variables Missing

**Error**: `Environment validation failed`

**Solution**: Check `.env` file has all required variables. See Required Variables section above.

#### 3. Supabase Connection Failed

**Error**: `Failed to initialize Supabase storage`

**Solutions**:
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active
- Verify bucket exists and has correct permissions

#### 4. Database Migration Errors

**Error**: `Migration failed`

**Solution**:
```bash
cd apps/api
npx prisma migrate reset  # WARNING: Deletes all data
npx prisma migrate deploy
```

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Diagram](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

