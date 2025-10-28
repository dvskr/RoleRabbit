# Database Setup for RoleReady

This document explains how to set up and use the database backend for RoleReady.

## Overview

RoleReady now has a full database backend using Prisma ORM with SQLite (can be upgraded to PostgreSQL/MySQL). All data is stored in a structured database instead of localStorage.

## Database Schema

### Tables
- **User**: User accounts and authentication
- **Resume**: Resume data and versions
- **Job**: Job applications and tracking
- **CoverLetter**: Cover letter content
- **Email**: Email tracking and templates
- **Portfolio**: Portfolio websites
- **CloudFile**: File storage
- **Analytics**: Application analytics data
- **DiscussionPost**: Forum discussions
- **DiscussionComment**: Discussion comments

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/api
npm install
```

### 2. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates database)
npx prisma migrate dev --name init

# Or use SQLite (default)
npm run db:setup
```

### 3. Configure Environment

Create `.env` in `apps/api`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### 4. Start the API Server

```bash
npm run dev
```

The API will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `GET /health` - Health check
- `GET /api/status` - API status

### User Management (requires JWT)
- `GET /api/users/profile` - Get user profile
- `POST /api/users/login` - Login user
- `POST /api/users/register` - Register user

### Resume Management (requires JWT)
- `GET /api/resumes` - List all resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Job Tracking (requires JWT)
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Cloud Storage (requires JWT)
- `GET /api/cloud/list` - List files
- `POST /api/cloud/save` - Save file
- `GET /api/cloud/:id` - Get file
- `DELETE /api/cloud/:id` - Delete file

## Migration to Production Database

### Switching from SQLite to PostgreSQL

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update environment variable:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/roleready"
```

3. Run migrations:

```bash
npx prisma migrate dev --name migrate_to_postgresql
```

### Switching to MySQL

Similar process, just change the provider in schema:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## Backup and Restore

### Backup SQLite Database

```bash
# Copy the database file
cp apps/api/dev.db backups/dev_$(date +%Y%m%d).db
```

### Restore

```bash
# Copy backup back
cp backups/dev_20241201.db apps/api/dev.db
```

## Data Migration from localStorage

The app automatically migrates data from localStorage to the database on first use:

1. Detect localStorage data
2. Call migration endpoint
3. Store in database
4. Clear localStorage

## Development vs Production

### Development
- Uses SQLite (file-based, no server needed)
- Fast setup
- All data in single file
- Easy to reset: delete `dev.db`

### Production
- Use PostgreSQL or MySQL
- Better performance
- Scalable
- Proper backup strategy
- Environment variables for credentials

## Useful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Check database status
npx prisma db pull
```

## Troubleshooting

### Database locked
```bash
# Close Prisma Studio and other connections
npx prisma db pull
```

### Migration conflicts
```bash
# Reset and re-apply
npx prisma migrate reset
npx prisma migrate dev
```

### Schema changes not reflected
```bash
# Regenerate Prisma client
npx prisma generate
```

