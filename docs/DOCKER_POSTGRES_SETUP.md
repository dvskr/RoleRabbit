# Docker PostgreSQL Setup - Step by Step Guide

## 📋 Quick Setup (5 minutes)

### Step 1: Install Docker Desktop
If you don't have Docker installed:
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify it's running (Docker icon in system tray should be green)

### Step 2: Run PostgreSQL Container

Open PowerShell or Terminal in your project root and run:

```bash
docker run --name roleready-postgres \
  -e POSTGRES_PASSWORD=roleready_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=roleready \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**What this does:**
- `--name roleready-postgres` - Names the container
- `-e POSTGRES_PASSWORD=roleready_dev` - Sets password
- `-e POSTGRES_USER=postgres` - Sets username (default)
- `-e POSTGRES_DB=roleready` - Creates database
- `-p 5432:5432` - Maps port 5432 to your machine
- `-d` - Runs in background (detached mode)
- `postgres:15-alpine` - Uses PostgreSQL 15 (lightweight)

### Step 3: Verify PostgreSQL is Running

```bash
docker ps
```

You should see `roleready-postgres` container running.

### Step 4: Add Database URL to .env

Create `apps/api/.env` file with:

```env
DATABASE_URL="postgresql://postgres:roleready_dev@localhost:5432/roleready"

# Your other settings...
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@roleready.com
JWT_SECRET=your-secret-key-change-this
OPENAI_API_KEY=your_openai_key_here
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### Step 5: Run Migration

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

## ✅ You're Done!

PostgreSQL is now running in Docker and your database is set up.

## 🔧 Useful Docker Commands

### Start PostgreSQL (if stopped)
```bash
docker start roleready-postgres
```

### Stop PostgreSQL
```bash
docker stop roleready-postgres
```

### View Logs
```bash
docker logs roleready-postgres
```

### Remove Container (if you want to start fresh)
```bash
docker stop roleready-postgres
docker rm roleready-postgres
```

### Access PostgreSQL Shell
```bash
docker exec -it roleready-postgres psql -U postgres -d roleready
```

### Backup Database
```bash
docker exec roleready-postgres pg_dump -U postgres roleready > backup.sql
```

### Restore Database
```bash
docker exec -i roleready-postgres psql -U postgres -d roleready < backup.sql
```

## 🎨 Using Docker Compose (Alternative)

You can also use the docker-compose file I created earlier:

```bash
docker-compose -f docker-compose.dev.yml up -d db
```

This starts PostgreSQL in Docker.

## ⚠️ Troubleshooting

### Port 5432 already in use
```bash
# Find what's using the port
netstat -ano | findstr :5432

# Or kill all processes on port 5432
npx kill-port 5432

# Then start container
docker start roleready-postgres
```

### Container name already exists
```bash
# Remove old container
docker rm roleready-postgres

# Run again
docker run --name roleready-postgres ...
```

### Database connection error
Check that:
1. Docker is running
2. Container is running: `docker ps`
3. DATABASE_URL in .env is correct
4. Try: `docker restart roleready-postgres`

## 🎯 Next Steps

Once PostgreSQL is running and migration is complete:
1. Let me know and I'll continue implementing features
2. We can start the servers
3. Test the application

## 📊 Verify Everything Works

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Open Prisma Studio (visual database browser)
cd apps/api
npx prisma studio
```

This opens a browser at http://localhost:5555 where you can see your database tables!

