# 🚀 Resume Builder - Quick Start Guide

**Get up and running in 5 minutes!**

---

## 📋 Prerequisites

- Node.js 18+ installed
- Docker & Docker Compose installed
- Git installed
- OpenAI API key (for AI features)

---

## ⚡ Quick Start (Docker)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/your-org/roleready.git
cd roleready

# Copy environment file
cp .env.example .env

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=your_key_here" >> .env
```

### 2. Start Everything

```bash
# Start all services with Docker Compose
docker-compose up -d

# Wait for services to be healthy (~30 seconds)
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec api npm run migrate

# Seed development data
docker-compose exec api node scripts/seed-dev-data.js
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **pgAdmin**: http://localhost:5050 (admin@roleready.com / admin)
- **Redis Commander**: http://localhost:8081

### 5. Login

Use test credentials:
- **Email**: test@example.com
- **Password**: password123

---

## 🛠️ Manual Setup (Without Docker)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api && npm install && cd ../..

# Install Web dependencies
cd apps/web && npm install && cd ../..
```

### 2. Setup Database

```bash
# Start PostgreSQL (if not running)
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service

# Create database
createdb roleready_dev

# Run migrations
cd apps/api
npm run migrate
```

### 3. Setup Redis

```bash
# Start Redis (if not running)
# macOS: brew services start redis
# Linux: sudo systemctl start redis
# Windows: Start Redis service
```

### 4. Configure Environment

```bash
# apps/api/.env
DATABASE_URL=postgresql://localhost:5432/roleready_dev
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_key_here
JWT_SECRET=your_secret_here
PORT=3001

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Start Services

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web
cd apps/web
npm run dev

# Terminal 3: Start Worker (optional)
cd apps/api
npm run worker
```

### 6. Seed Data

```bash
cd apps/api
node scripts/seed-dev-data.js
```

---

## 📚 Key Features to Test

### 1. Create Resume
1. Navigate to Resume Builder tab
2. Click "New Resume"
3. Fill in contact information
4. Add experience, education, skills
5. Changes auto-save every 5 seconds

### 2. Import Resume
1. Click "Import" button
2. Upload PDF or DOCX file
3. Review parsed data
4. Edit and apply

### 3. Tailor Resume
1. Open existing resume
2. Click "AI Tools"
3. Paste job description
4. Click "Tailor Resume"
5. Review and apply changes

### 4. Export Resume
1. Open resume
2. Click "Export"
3. Select format (PDF, DOCX, TXT, JSON)
4. Download file

### 5. Apply Template
1. Click "Templates" tab
2. Browse templates
3. Click template to preview
4. Click "Apply"

---

## 🧪 Running Tests

### Unit Tests

```bash
# Frontend tests
cd apps/web
npm test

# Backend tests
cd apps/api
npm test
```

### Integration Tests

```bash
cd apps/api
npm run test:integration
```

### E2E Tests

```bash
cd apps/web
npm run test:e2e
```

### All Tests

```bash
# From root
npm run test:all
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :3001, :5432, :6379

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Reset database
npm run db:reset
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Restart Redis
brew services restart redis  # macOS
sudo systemctl restart redis  # Linux
```

### Migration Errors

```bash
# Reset database and re-run migrations
npm run db:reset
npm run migrate

# Or run migrations manually
cd apps/api
npx prisma migrate dev
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

---

## 📖 Additional Resources

### Documentation
- [Database Schema](./RESUME_BUILDER_DATABASE_SCHEMA.md)
- [API Documentation](http://localhost:3001/api/docs)
- [Template Guide](./RESUME_TEMPLATES_GUIDE.md)
- [User Journeys](./RESUME_BUILDER_USER_JOURNEYS.md)
- [Production Checklist](./RESUME_BUILDER_PRODUCTION_CHECKLIST.md)

### Development Tools
- **API Testing**: Use Postman or http://localhost:3001/api/docs
- **Database**: pgAdmin at http://localhost:5050
- **Cache**: Redis Commander at http://localhost:8081
- **Logs**: `docker-compose logs -f api` or `docker-compose logs -f web`

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart service
docker-compose restart api

# Access service shell
docker-compose exec api sh

# Run database query
docker-compose exec postgres psql -U roleready -d roleready_dev

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

---

## 🎯 Next Steps

1. ✅ Explore the Resume Builder UI
2. ✅ Test all major features
3. ✅ Review API documentation
4. ✅ Read database schema docs
5. ✅ Run test suite
6. ✅ Customize templates
7. ✅ Deploy to staging

---

## 💡 Tips

- **Auto-save**: Changes save automatically every 5 seconds
- **Undo/Redo**: Use Ctrl+Z / Ctrl+Y or buttons in header
- **Keyboard Shortcuts**: Press `?` to see all shortcuts
- **Offline Mode**: App works offline, syncs when reconnected
- **Templates**: 60+ templates available, filterable by category
- **AI Features**: Requires OpenAI API key in environment

---

## 🆘 Need Help?

- **Documentation**: Check the docs folder
- **API Issues**: Check http://localhost:3001/api/docs
- **Database Issues**: Use pgAdmin at http://localhost:5050
- **Logs**: `docker-compose logs -f api`
- **GitHub Issues**: Create an issue on GitHub
- **Email**: support@roleready.com

---

**Happy Coding! 🎉**
