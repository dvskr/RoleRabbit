# Getting Started with RoleReady

## Quick Start Guide

Welcome to RoleReady! This guide will help you get up and running quickly.

---

## Prerequisites

- **Node.js** 18+ installed
- **Python** 3.8+ installed
- **npm** or **pnpm** package manager
- **Git** for version control

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/roleready.git
cd roleready
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or use pnpm (recommended)
pnpm install
```

### 3. Set Up Environment Variables

Create `.env` files for each service:

**Root `.env`:**
```env
# Core configuration
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=file:./apps/api/prisma/dev.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Python API
PYTHON_API_URL=http://localhost:8000
```

**`apps/api/.env`:**
```env
# Node.js API
PORT=3001
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-jwt-secret-here

# Email (Optional)
RESEND_API_KEY=re_your_key
SENDGRID_API_KEY=SG.your_key
```

**`apps/api-python/.env`:**
```env
# Python AI API
PORT=8000
OPENAI_API_KEY=sk-your-openai-api-key

# Security
JWT_SECRET=your-jwt-secret-here
```

**`apps/web/.env.local`:**
```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

---

## Running the Application

### Option A: Start All Services (Recommended)

```bash
# Using npm
npm run dev:all

# Using pnpm
pnpm run dev:all

# Using PowerShell script (Windows)
.\start-dev.ps1

# Using bash script (Mac/Linux)
./start-dev.sh
```

### Option B: Start Services Individually

**Terminal 1 - Node.js API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Python AI API:**
```bash
cd apps/api-python
python main.py
# or
python -m uvicorn main:app --reload
```

**Terminal 3 - Next.js Frontend:**
```bash
cd apps/web
npm run dev
```

---

## Access the Application

- **Frontend:** http://localhost:3000
- **Node.js API:** http://localhost:3001
- **Python AI API:** http://localhost:8000
- **API Health Check:** http://localhost:3001/health
- **Python Health Check:** http://localhost:8000/health

---

## Verify Installation

1. **Check backend health:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:8000/health
   ```

2. **Visit the frontend:**
   - Open http://localhost:3000
   - Should see the RoleReady dashboard

3. **Test authentication:**
   - Click "Sign Up" to create an account
   - Try logging in

---

## First Steps

1. **Create an account** on the login page
2. **Fill out your profile** in the Profile section
3. **Build your first resume** in the Resume Builder
4. **Add a job application** in Job Tracker
5. **Try AI features** (requires OpenAI API key)

---

## Troubleshooting

### Port Already in Use

If ports 3000, 3001, or 8000 are already in use:

```bash
# Kill process on specific port (Mac/Linux)
lsof -ti:3001 | xargs kill -9

# Kill process on specific port (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database Issues

```bash
cd apps/api
npx prisma db push
npx prisma generate
```

### Python Issues

```bash
cd apps/api-python
pip install -r requirements.txt
```

---

## Next Steps

- **Read:** [Setup API Keys](../02-setup/setup-api-keys.md)
- **Configure:** [Database Setup](../02-setup/database-setup.md)
- **Explore:** [API Documentation](../03-api/api-reference.md)
- **Build:** [Architecture Guide](../05-architecture/system-overview.md)

---

## Need Help?

- Check [Troubleshooting Guide](../07-reference/troubleshooting.md)
- Read [FAQ](../07-reference/faq.md)
- Join our [Discord Community](#)

