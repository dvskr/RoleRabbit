# Docker Setup

## Overview

Run RoleReady using Docker containers for easy deployment and development.

---

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

**Install Docker:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## Quick Start

### Start All Services

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

### Stop Services

```bash
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## Service Architecture

### Development (`docker-compose.dev.yml`)

```
PostgreSQL (5432)
    ↓
Node.js API (3001)
    ↓
Next.js Web (3000)
    ↓
Python AI API (8000) [Optional]
```

### Production (`docker-compose.yml`)

Same architecture with production optimizations.

---

## Individual Services

### Start Database Only

```bash
docker-compose up -d postgres

# Connect to database
docker exec -it roleready-postgres psql -U roleready
```

### Start Node.js API

```bash
docker-compose up -d api

# View logs
docker logs -f roleready-api
```

### Start Frontend

```bash
docker-compose up -d web

# View logs
docker logs -f roleready-web
```

---

## Environment Configuration

### Development

Create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  postgres:
    ports:
      - "5432:5432"
  
  api:
    environment:
      - DATABASE_URL=postgresql://roleready:dev@postgres:5432/roleready_dev
      - JWT_SECRET=dev-secret-key
  
  web:
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
  
  api-python:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

### Production

Use environment files:

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

---

## Building Images

### Manual Build

```bash
# Build all
docker-compose build

# Build specific service
docker-compose build api

# No cache
docker-compose build --no-cache
```

### Using Dockerfiles

**Node.js API:**
```bash
cd apps/api
docker build -t roleready-api .
docker run -p 3001:3001 roleready-api
```

**Python AI:**
```bash
cd apps/api-python
docker build -t roleready-ai .
docker run -p 8000:8000 roleready-ai
```

**Frontend:**
```bash
cd apps/web
docker build -t roleready-web .
docker run -p 3000:3000 roleready-web
```

---

## Database

### PostgreSQL in Docker

**Start:**
```bash
docker-compose up -d postgres
```

**Connect:**
```bash
docker exec -it roleready-postgres psql -U roleready -d roleready_db
```

**Backup:**
```bash
docker exec roleready-postgres pg_dump -U roleready roleready_db > backup.sql
```

**Restore:**
```bash
cat backup.sql | docker exec -i roleready-postgres psql -U roleready roleready_db
```

---

## Volumes & Persistence

### Data Persistence

```yaml
volumes:
  postgres_data:      # Database files
  node_modules:       # Dependencies (optional)
  .next:              # Next.js build cache
```

### Mount Local Code (Development)

```yaml
services:
  api:
    volumes:
      - ./apps/api:/app
      - /app/node_modules  # Exclude node_modules
```

---

## Networking

### Internal Network

Services communicate via Docker network:
- `postgres:5432`
- `api:3001`
- `api-python:8000`

### External Access

```bash
# Frontend
http://localhost:3000

# Node.js API
http://localhost:3001

# Python API
http://localhost:8000

# Database
localhost:5432
```

---

## Health Checks

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Check Status

```bash
docker-compose ps

# Should show "healthy" for services
```

---

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Resource Usage

```bash
docker stats

# Specific service
docker stats roleready-api
```

---

## Production Deployment

### Production Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# With environment file
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d
```

### Optimizations

1. **Multi-stage builds** for smaller images
2. **.dockerignore** to exclude unnecessary files
3. **Image caching** for faster builds
4. **Resource limits** for stability
5. **Health checks** for reliability

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs service-name

# Rebuild
docker-compose up --build service-name
```

### Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Docker socket
sudo usermod -aG docker $USER
```

### Out of Space

```bash
# Clean up
docker system prune -a

# Remove volumes
docker volume prune
```

### Port Conflicts

Edit `docker-compose.yml`:
```yaml
services:
  api:
    ports:
      - "3002:3001"  # Change external port
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: docker-compose build
      - name: Test
        run: docker-compose up -d && npm test
```

---

## Security

### Best Practices

1. **Don't expose databases** to public
2. **Use secrets** for sensitive data
3. **Keep images updated**
4. **Scan for vulnerabilities**
5. **Use non-root users**

### Docker Secrets

```bash
# Create secret
echo "my-secret" | docker secret create jwt_secret -

# Use in service
docker service create --secret jwt_secret my-service
```

---

## Next Steps

- [Deployment Guide](../06-deployment/deployment-guide.md)
- [Scaling Guide](../06-deployment/scaling.md)
- [Production Setup](../06-deployment/production.md)

