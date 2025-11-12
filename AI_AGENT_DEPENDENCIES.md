# AI Agent Auto-Apply - Required Dependencies

## Backend Dependencies (apps/api)

### Install Command
```bash
cd apps/api
npm install bull redis socket.io
```

### Package Versions

```json
{
  "dependencies": {
    "bull": "^4.12.0",
    "redis": "^4.6.12",
    "socket.io": "^4.6.1"
  }
}
```

### Purpose
- **bull**: Job queue for background task processing
- **redis**: In-memory data store for Bull queue
- **socket.io**: WebSocket server for real-time updates

---

## Frontend Dependencies (apps/web)

### Install Command
```bash
cd apps/web
npm install socket.io-client jspdf docx file-saver
```

### Package Versions

```json
{
  "dependencies": {
    "socket.io-client": "^4.6.1",
    "jspdf": "^2.5.1",
    "docx": "^8.5.0",
    "file-saver": "^2.0.5"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"
  }
}
```

### Purpose
- **socket.io-client**: WebSocket client for real-time updates
- **jspdf**: Client-side PDF generation
- **docx**: Client-side DOCX generation
- **file-saver**: Browser file download utility

---

## System Requirements

### Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:latest

# Verify
redis-cli ping  # Should return: PONG
```

### PostgreSQL
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Docker
docker run -d \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14

# Verify
psql --version  # Should show: psql (PostgreSQL) 14.x
```

---

## Optional Dependencies

### For Enhanced Features

```bash
# Image processing (if adding resume templates with images)
npm install sharp

# Rate limiting
npm install express-rate-limit

# Monitoring
npm install prom-client

# Logging
npm install winston
```

---

## Dependency Tree

```
AI Agent Auto-Apply
│
├── Backend (apps/api)
│   ├── Fastify (existing)
│   ├── Prisma (existing)
│   ├── bull → Redis-backed job queue
│   ├── redis → In-memory data store
│   └── socket.io → WebSocket server
│
└── Frontend (apps/web)
    ├── React/Next.js (existing)
    ├── socket.io-client → WebSocket client
    ├── jspdf → PDF generation
    ├── docx → DOCX generation
    └── file-saver → File downloads
```

---

## Version Compatibility

### Tested Configurations

✅ **Recommended Setup:**
```
Node.js: 18.19.0
PostgreSQL: 14.10
Redis: 7.2.3
npm: 10.2.3
```

✅ **Minimum Requirements:**
```
Node.js: 18.0.0+
PostgreSQL: 14.0+
Redis: 6.0+
npm: 8.0+
```

---

## Installation Order

Follow this order to avoid dependency conflicts:

```bash
# 1. System dependencies
brew install redis postgresql@14

# 2. Backend dependencies
cd apps/api
npm install

# 3. New backend packages
npm install bull redis socket.io

# 4. Generate Prisma client
npx prisma generate

# 5. Frontend dependencies
cd ../web
npm install

# 6. New frontend packages
npm install socket.io-client jspdf docx file-saver

# 7. TypeScript types (if needed)
npm install -D @types/file-saver
```

---

## Troubleshooting Dependencies

### Bull/Redis Issues

**Error:** `Cannot connect to Redis`

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Check connection string
echo $REDIS_URL
# Should be: redis://localhost:6379

# Restart Redis
brew services restart redis
```

### Socket.IO Issues

**Error:** `WebSocket connection failed`

**Solution:**
```bash
# Check CORS settings in apps/api
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"

# Check client URL in apps/web
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### jsPDF/docx Issues

**Error:** `Cannot find module 'jspdf'`

**Solution:**
```bash
cd apps/web
npm install jspdf docx file-saver
npm run build  # Rebuild
```

---

## Bundle Size Impact

### Frontend Bundle Analysis

```bash
# Before new dependencies
Total: ~800 KB (gzipped)

# After adding AI Agent features
Total: ~1.2 MB (gzipped)

# Breakdown:
- socket.io-client: ~50 KB
- jspdf: ~180 KB
- docx: ~220 KB
- file-saver: ~5 KB
```

### Optimization Tips

1. **Dynamic Imports:**
```typescript
// Don't import at top level
import { jsPDF } from 'jspdf';  ❌

// Use dynamic import
const { jsPDF } = await import('jspdf');  ✅
```

2. **Code Splitting:**
```typescript
// Split by route
const AIAgents = dynamic(() => import('@/components/AIAgents'), {
  loading: () => <LoadingSpinner />,
});
```

3. **Tree Shaking:**
Already implemented in `documentGenerator.ts` using dynamic imports!

---

## Security Considerations

### Package Audits

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update packages
npm update
```

### Recommended Policies

```json
{
  "scripts": {
    "preinstall": "npx npm-force-resolutions",
    "audit": "npm audit --production"
  },
  "resolutions": {
    "socket.io": "^4.6.1"
  }
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: AI Agent Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis:7
        ports:
          - 6379:6379

      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: password
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd apps/api && npm install
          cd apps/web && npm install

      - name: Run tests
        run: npm test
```

---

## License Information

All dependencies are under permissive licenses:

- **bull**: MIT
- **redis**: MIT
- **socket.io**: MIT
- **jspdf**: MIT
- **docx**: MIT
- **file-saver**: MIT

---

## Support

If you encounter dependency issues:

1. Check this guide first
2. Review error messages carefully
3. Verify system requirements
4. Check GitHub issues for similar problems
5. Create new issue with details

---

**Last Updated:** January 2025
