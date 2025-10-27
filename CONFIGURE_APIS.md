# 🚀 API & Database Configuration Guide

## 📋 **Quick Start**

### **1. Environment Files Setup**

You need to create `.env` files for each service. They're gitignored but here's what to put:

#### **apps/api/.env**
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
HOST=localhost
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

#### **apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### **apps/api-python/.env**
```env
PORT=8000
HOST=localhost
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
DATABASE_URL=sqlite:///./data.db
```

---

### **2. Start the Services**

#### **Option A: Start All Services**

From the root directory:
```bash
# Install dependencies (if not done already)
npm install

# Start all services in one command
npm run dev:all
```

#### **Option B: Start Individually**

**Terminal 1 - Backend (Node.js API):**
```bash
cd apps/api
npm install
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend (Next.js):**
```bash
cd apps/web
npm install
npm run dev
# App runs on http://localhost:3000
```

**Terminal 3 - Python API (Optional):**
```bash
cd apps/api-python
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

---

### **3. Database Setup**

The database is already configured with SQLite. To reset it:

```bash
cd apps/api
npx prisma migrate reset
npx prisma migrate dev
```

This will:
- Drop all tables
- Recreate the schema
- Run all migrations
- Generate Prisma Client

---

### **4. Test the APIs**

#### **Health Check:**
```bash
curl http://localhost:3001/health
```

#### **API Status:**
```bash
curl http://localhost:3001/api/status
```

#### **Register a User:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User"
  }'
```

#### **Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

#### **Get User Profile (with token):**
```bash
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### **Get All Agents:**
```bash
curl http://localhost:3001/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### **Create an Agent:**
```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Job Discovery Bot",
    "description": "Automatically finds matching job postings",
    "type": "automatic",
    "status": "active",
    "config": {
      "keywords": ["React", "Next.js", "TypeScript"],
      "frequency": "daily"
    }
  }'
```

---

### **5. Verify Database**

Check the database directly:

```bash
cd apps/api
npx prisma studio
```

This opens Prisma Studio in your browser where you can:
- View all tables
- See data in real-time
- Manually edit records
- Test relationships

---

### **6. Common Issues**

#### **Database locked error:**
```bash
cd apps/api
rm prisma/dev.db-journal
# Then try again
```

#### **Port already in use:**
```bash
# Find the process
lsof -i :3001
# Kill it
kill -9 <PID>
```

#### **Cannot find module:**
```bash
cd apps/api
rm -rf node_modules package-lock.json
npm install
```

---

### **7. API Endpoints Summary**

**Authentication:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

**Users:**
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

**Jobs:**
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

**Resumes, Emails, Cover Letters, Portfolios, Cloud Files** - Same CRUD pattern

**AI Agents:**
- `GET /api/agents` - Get all agents
- `GET /api/agents/stats` - Get statistics
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/agents/:id/tasks` - Get agent tasks
- `POST /api/agents/:id/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task

**Total:** 54+ endpoints

---

## 🎉 **Next Steps**

1. ✅ Create `.env` files
2. ✅ Start services
3. ✅ Test APIs
4. ✅ Create user account
5. ✅ Test AI agents
6. ✅ Verify data in Prisma Studio

---

**All services are configured and ready to use!** 🚀

