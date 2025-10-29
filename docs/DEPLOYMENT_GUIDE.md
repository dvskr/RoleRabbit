# Deployment Guide - RoleReady

**Version:** 1.0.0  
**Status:** Production Ready

---

## 🌍 Deployment Overview

RoleReady consists of **3 services**:
1. **Frontend** (Next.js) - Port 3000
2. **Node.js API** (Fastify) - Port 3001
3. **Python API** (FastAPI) - Port 8000

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

**File:** `docker-compose.yml`

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Individual Deployments

#### Frontend (Vercel/Netlify)
```bash
cd apps/web
npm run build
# Deploy .next folder to Vercel
```

#### Backend APIs (Railway/Heroku)
```bash
# Deploy both apps/api and apps/api-python
# Or use Docker images
```

---

## 📦 Production Environment Variables

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.roleready.com
NEXT_PUBLIC_WS_URL=wss://ws.roleready.com
```

### Node.js API (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/roleready
JWT_SECRET=your-production-secret
FRONTEND_URL=https://roleready.com
PORT=3001
```

### Python API (.env)
```env
OPENAI_API_KEY=your-production-key
DATABASE_URL=postgresql://user:pass@host:5432/roleready
```

---

## 🗄️ Database Setup

### PostgreSQL (Production)

```sql
-- Create database
CREATE DATABASE roleready;

-- Run migrations
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

---

## 🔒 Security Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Set secure cookie options
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Enable security headers

---

## 📊 Monitoring

### Health Checks
- Frontend: `https://yourdomain.com/health`
- Node.js API: `https://api.roleready.com/health`
- Python API: `https://api.roleready.com:8000/health`

### Recommended Tools
- **Sentry** - Error tracking
- **Datadog** - Metrics
- **UptimeRobot** - Uptime monitoring

---

## 🎯 CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

Automatically runs on:
- Push to main/feature_pro
- Pull requests

Stages:
1. Lint
2. Unit tests
3. E2E tests
4. Build
5. Deploy (production only)

---

## 🐳 Docker Images

Build:
```bash
docker build -t roleready-web:latest apps/web
docker build -t roleready-api:latest apps/api
docker build -t roleready-api-python:latest apps/api-python
```

Run:
```bash
docker run -p 3000:3000 roleready-web
docker run -p 3001:3001 roleready-api
docker run -p 8000:8000 roleready-api-python
```

---

## 📈 Scaling

### Horizontal Scaling
- Use load balancer for APIs
- Deploy multiple instances
- Setup session sharing (Redis)

### Database
- Use read replicas
- Enable connection pooling
- Setup automatic backups

### Caching
- Redis for sessions
- CDN for static assets
- Browser caching

---

**See:** `docker-compose.yml` for complete setup

