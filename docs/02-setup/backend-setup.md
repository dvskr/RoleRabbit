# Backend Setup

## Overview

RoleReady uses a hybrid backend architecture:
- **Node.js API** (Fastify) - Data operations, CRUD, business logic
- **Python AI API** (FastAPI) - AI/ML processing, heavy computations

---

## Node.js API Setup

### Requirements

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd apps/api

# Install dependencies
npm install

# Or use pnpm
pnpm install
```

### Configuration

**File:** `apps/api/.env`

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL=file:./prisma/dev.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email (Optional)
RESEND_API_KEY=re_your_key
SENDGRID_API_KEY=SG.your_key

# AI Proxy
PYTHON_API_URL=http://localhost:8000

# Security
CORS_ORIGIN=http://localhost:3000
```

### Initialize Database

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push
```

### Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

**Server runs on:** http://localhost:3001

### Verify

```bash
# Health check
curl http://localhost:3001/health

# API status
curl http://localhost:3001/api/status
```

---

## Python AI API Setup

### Requirements

- Python 3.8+
- pip or poetry

### Installation

```bash
cd apps/api-python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

**File:** `apps/api-python/.env`

```env
# Server
PORT=8000
HOST=0.0.0.0

# AI
OPENAI_API_KEY=sk-your-openai-api-key-here

# JWT
JWT_SECRET=your-jwt-secret-here

# Models
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
```

### Start Server

```bash
cd apps/api-python

# Development mode
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Server runs on:** http://localhost:8000

### Verify

```bash
# Health check
curl http://localhost:8000/health

# API docs
# Visit: http://localhost:8000/docs
```

---

## Running Both APIs

### Option A: Separate Terminals

**Terminal 1:**
```bash
cd apps/api
npm run dev
```

**Terminal 2:**
```bash
cd apps/api-python
python main.py
```

### Option B: Background Processes

```bash
# Start Node.js API in background
cd apps/api && npm run dev &

# Start Python API in background
cd apps/api-python && python main.py &
```

### Option C: Using Scripts

**Windows:**
```powershell
.\START_SERVERS.ps1
```

**Mac/Linux:**
```bash
./start-dev.sh
```

---

## Architecture

### Request Flow

```
Frontend (Next.js:3000)
    ↓
Node.js API (Fastify:3001)
    ├─ Data operations → SQLite/PostgreSQL
    ├─ Auth & sessions → Prisma
    └─ AI requests → Python API (8000)
        ↓
    OpenAI API
```

### Key Components

**Node.js API:**
- Routes: `/apps/api/routes/*`
- Utils: `/apps/api/utils/*`
- Auth: JWT middleware
- Database: Prisma ORM

**Python AI API:**
- Main: `apps/api-python/main.py`
- AI models: OpenAI integration
- Auth: JWT validation

---

## API Endpoints

### Node.js API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

**Data:**
- `GET /api/resumes` - List resumes
- `POST /api/resumes` - Create resume
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job

**See:** [API Reference](../03-api/api-reference.md)

### Python AI API Endpoints

**AI Operations:**
- `POST /api/ai/generate` - Generate content
- `POST /api/ai/ats-score` - Calculate ATS score
- `POST /api/ai/analyze-job` - Analyze job description
- `POST /api/ai/analyze-resume` - Resume analysis

---

## Testing Backend

### Node.js API Tests

```bash
cd apps/api

# Run all tests
npm test

# Run specific test
npm test auth.test.js

# With coverage
npm test -- --coverage
```

### Python API Tests

```bash
cd apps/api-python

# Run tests
pytest

# With coverage
pytest --cov=.
```

### Integration Tests

```bash
# From root
npm run test:integration
```

---

## Monitoring

### Logs

**Node.js API:**
```bash
# View logs
tail -f apps/api/logs/app.log

# Or check console output
```

**Python API:**
```bash
# View logs in console
# Or configure logging
```

### Health Checks

```bash
# Node.js API
curl http://localhost:3001/health

# Python API
curl http://localhost:8000/health
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port
# Mac/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database Connection Issues

```bash
cd apps/api

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Python Import Errors

```bash
cd apps/api-python

# Reinstall dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

---

## Performance Tuning

### Node.js API

- Use connection pooling
- Enable compression
- Configure caching
- Set rate limits

### Python API

- Use async/await
- Configure workers
- Enable caching
- Monitor token usage

---

## Security

### Checklist

- ✅ JWT with httpOnly cookies
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers

**See:** [Security Documentation](../08-security/security.md)

---

## Next Steps

- [API Documentation](../03-api/api-reference.md)
- [Testing Guide](../07-testing/testing-guide.md)
- [Deployment Guide](../06-deployment/deployment-guide.md)

