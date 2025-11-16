# 🚀 Developer Quick Start Guide

**Last Updated:** November 15, 2025

---

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Setup](#database-setup)
3. [Running the Application](#running-the-application)
4. [Using New Features](#using-new-features)
5. [Testing](#testing)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## 🌍 Environment Setup

### 1. Required Environment Variables

Create `.env` file in `apps/api/`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/roleready"

# Authentication
JWT_SECRET="your-secret-key-minimum-32-characters-long"

# AI Services
OPENAI_API_KEY="sk-your-openai-key"

# Node Environment
NODE_ENV="development"
```

### 2. Recommended Environment Variables

```bash
# Cache
REDIS_URL="redis://localhost:6379"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"

# Monitoring (optional)
SENTRY_DSN="https://...@sentry.io/..."
```

### 3. Validate Environment

```bash
cd apps/api
node -e "require('./utils/validateEnv').validateEnv({ logResults: true })"
```

---

## 🗄️ Database Setup

### 1. Apply All Migrations

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Apply Prisma migrations
npx prisma migrate deploy

# Apply custom SQL migrations
node scripts/apply-critical-fixes.js
```

### 2. Verify Database

```bash
# Check tables
node scripts/check-tables.js

# Or use Prisma Studio
npx prisma studio
```

### 3. Seed Database (Optional)

```bash
# Create test user and sample data
node scripts/seed-database.js
```

---

## 🏃 Running the Application

### 1. Install Dependencies

```bash
# Root
npm install

# API
cd apps/api && npm install

# Web
cd apps/web && npm install
```

### 2. Start Development Servers

```bash
# Terminal 1: API Server (port 5000)
cd apps/api
npm run dev

# Terminal 2: Web Server (port 3000)
cd apps/web
npm run dev

# Terminal 3: Background Workers (optional)
cd apps/api
npm run workers
```

### 3. Verify Health

```bash
# Check API health
curl http://localhost:5000/api/health

# Check detailed health
curl http://localhost:5000/api/health/detailed
```

---

## 🎨 Using New Features

### 1. Validation Schemas

```javascript
// In route handlers
const { validateResumeData } = require('../schemas/resumeData.schema');

const result = validateResumeData(request.body.data);
if (!result.success) {
  return reply.status(400).send({
    success: false,
    error: 'Validation failed',
    details: result.errors
  });
}
```

### 2. Error Handling

```javascript
// In route handlers
const {
  asyncHandler,
  assertExists,
  assertOwnership,
  NotFoundError
} = require('../utils/errorHandler');

fastify.get('/api/resumes/:id', { preHandler: authenticate }, asyncHandler(async (request, reply) => {
  const resume = await getResume(request.params.id);
  assertExists(resume, 'Resume');
  assertOwnership(resume.userId, request.user.userId);
  
  return reply.send({ success: true, resume });
}));
```

### 3. Template Validation

```javascript
// In route handlers
const { validateTemplateId, sanitizeTemplateId } = require('../utils/templateValidator');

// Strict validation (throws error)
const template = validateTemplateId(templateId, false);

// Sanitization (returns default)
const safeTemplateId = sanitizeTemplateId(templateId);
```

### 4. Skeleton Loaders (Frontend)

```tsx
import { TemplateGallerySkeleton, ResumeListSkeleton } from '@/components/ui/SkeletonLoader';

// In component
{isLoading ? (
  <TemplateGallerySkeleton count={6} />
) : (
  <TemplateGallery templates={templates} />
)}
```

### 5. Offline Banner (Frontend)

```tsx
import OfflineBanner from '@/components/ui/OfflineBanner';

// In layout or app component
<OfflineBanner showReconnecting={true} />
```

### 6. Unsaved Changes Warning (Frontend)

```tsx
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';

function ResumeEditor() {
  const [hasChanges, setHasChanges] = useState(false);
  
  useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
    message: 'You have unsaved changes. Are you sure you want to leave?'
  });
  
  // ... rest of component
}
```

### 7. Cancellable Operations (Frontend)

```tsx
import { useCancellableOperation, CancellableOperation } from '@/components/ui/CancellableOperation';

function TailorResume() {
  const operation = useCancellableOperation({
    onCancel: () => {
      console.log('User cancelled operation');
      // Clean up
    }
  });
  
  const handleTailor = async () => {
    operation.start('Tailoring resume');
    
    try {
      // Use AbortSignal in fetch
      const response = await fetch('/api/tailor', {
        signal: operation.getSignal(),
        // ...
      });
      
      operation.complete();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Operation cancelled');
      }
    }
  };
  
  return (
    <>
      <button onClick={handleTailor}>Tailor Resume</button>
      <CancellableOperation
        isRunning={operation.isRunning}
        onCancel={operation.cancel}
        operationName={operation.operationName}
        progress={operation.progress}
      />
    </>
  );
}
```

---

## 🧪 Testing

### 1. Run Unit Tests

```bash
# API tests
cd apps/api
npm test

# Frontend tests
cd apps/web
npm test
```

### 2. Run Integration Tests

```bash
cd apps/api
npm run test:integration
```

### 3. Run E2E Tests

```bash
cd apps/web
npm run test:e2e
```

### 4. Check Coverage

```bash
npm run test:coverage
```

---

## 📝 Common Tasks

### 1. Create New Migration

```bash
cd apps/api
npx prisma migrate dev --name your_migration_name
```

### 2. Add New Validation Schema

```javascript
// In apps/api/schemas/resumeData.schema.js
const NewSectionSchema = z.object({
  field1: z.string().max(100),
  field2: z.number().min(0).max(100)
});

// Add to ResumeDataSchema
const ResumeDataSchema = z.object({
  // ... existing fields
  newSection: NewSectionSchema.optional()
});
```

### 3. Add New Error Code

```javascript
// In apps/api/utils/errorHandler.js
const ErrorCodes = {
  // ... existing codes
  NEW_ERROR_CODE: 'NEW_ERROR_CODE'
};

// Use in routes
throw new AppError('Error message', ErrorCodes.NEW_ERROR_CODE, 400);
```

### 4. Add New Template

```javascript
// In apps/api/utils/templateValidator.js
const AVAILABLE_TEMPLATES = [
  // ... existing templates
  {
    id: 'new-template',
    name: 'New Template',
    category: 'modern',
    description: 'Description here',
    isPremium: false,
    colorScheme: 'blue',
    features: ['Feature 1', 'Feature 2'],
    tags: ['tag1', 'tag2']
  }
];
```

### 5. Add New Health Check

```javascript
// In apps/api/routes/health.routes.js
fastify.get('/api/health/detailed', async (request, reply) => {
  // ... existing checks
  
  // Add new check
  try {
    await checkNewService();
    health.checks.newService = {
      status: 'healthy',
      message: 'Service is running'
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.newService = {
      status: 'unhealthy',
      message: error.message
    };
  }
});
```

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check database is running
psql -U postgres -c "SELECT 1"

# Test connection from Node
node -e "require('./apps/api/utils/db').connectDB()"

# Check connection string
echo $DATABASE_URL
```

### Migration Failures

```bash
# Reset database (CAUTION: Deletes all data)
cd apps/api
npx prisma migrate reset

# Or manually fix
psql -U postgres -d roleready
# Run SQL commands to fix issue
```

### Environment Variable Issues

```bash
# Validate all variables
cd apps/api
node -e "require('./utils/validateEnv').validateEnv({ exitOnError: false, logResults: true })"

# Check specific variable
echo $JWT_SECRET
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Prisma Client Issues

```bash
# Regenerate client
cd apps/api
npx prisma generate

# Clear cache
rm -rf node_modules/.prisma
npm install
```

### TypeScript Errors (Frontend)

```bash
# Regenerate types
cd apps/web
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Additional Resources

### Documentation
- [Complete Implementation Summary](./COMPLETE_IMPLEMENTATION_FINAL.md)
- [Production Readiness Status](./PRODUCTION_READINESS_STATUS.md)
- [Checklist Validation Report](./CHECKLIST_VALIDATION_REPORT.md)

### API Documentation
- Swagger UI: http://localhost:5000/api/docs
- OpenAPI Spec: http://localhost:5000/api/docs/openapi.json

### Monitoring
- Health Check: http://localhost:5000/api/health
- Detailed Health: http://localhost:5000/api/health/detailed
- Metrics: http://localhost:5000/api/metrics (if enabled)

---

## 🆘 Getting Help

### Check Logs

```bash
# API logs
cd apps/api
tail -f logs/app.log

# Or use logger
node -e "require('./utils/logger').info('Test message')"
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or set log level
LOG_LEVEL=debug npm run dev
```

### Common Issues
1. **"Template not found"** - Check `templateValidator.js` for available templates
2. **"Validation failed"** - Check `resumeData.schema.js` for field requirements
3. **"Database error"** - Check migrations are applied: `node scripts/check-tables.js`
4. **"Unauthorized"** - Check JWT_SECRET is set and token is valid

---

**Last Updated:** November 15, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready (Beta)



