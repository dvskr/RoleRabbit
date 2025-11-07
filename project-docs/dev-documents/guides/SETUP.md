# Development Setup Guide

Complete guide to setting up your local development environment.

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm installed globally
- Git configured
- Code editor (VS Code recommended)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone [repository-url]
cd RoleReady-FullStack
```

### 2. Install Dependencies

```bash
npm run install:all
# or
pnpm install
```

### 3. Environment Setup

Copy environment files:

```bash
cp .env.example .env.local
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Configure environment variables (see [Environment Variables](#environment-variables))

### 4. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Run migrations
cd apps/api
npx prisma migrate dev
```

### 5. Start Development Servers

```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:3000
- Node.js API: http://localhost:3001
- Python API: http://localhost:8000

## 🔧 Environment Variables

> **Note:** Copy `samples/environment-sample.env` to `.env` and update with your actual values.

### Frontend (.env.local)

```env
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend API (.env)

```env
# Node.js API Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/roleready_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Session Management
SESSION_SECRET=your-session-secret-key-change-this
SESSION_MAX_AGE=86400000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Python API (.env)

```env
# Python API Configuration
PYTHON_API_PORT=8000
PYTHON_ENV=development

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Other AI Services
ANTHROPIC_API_KEY=your-anthropic-key-if-using
GOOGLE_AI_API_KEY=your-google-ai-key-if-using
```

## 🛠️ Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Prisma
- Tailwind CSS IntelliSense

### Useful Commands

```bash
# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📚 Next Steps

- Read [Architecture Documentation](./ARCHITECTURE.md)
- Review [Coding Standards](./CODING_STANDARDS.md)
- Check [Contributing Guide](./CONTRIBUTING.md)

## ❓ Troubleshooting

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues.

---

**Last Updated:** [Date]

