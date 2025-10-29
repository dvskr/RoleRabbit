# RoleReady - Quick Start Guide

**Version:** 1.0.0  
**Last Updated:** October 28, 2025

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RoleReady-FullStack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Create `apps/api/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   NODE_ENV="development"
   ```
   
   Create `apps/api-python/.env`:
   ```env
   OPENAI_API_KEY="your-api-key"
   ```

4. **Run database migrations**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start all services**
   ```bash
   npm run dev:all
   ```

---

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Node.js API:** http://localhost:3001
- **Python API:** http://localhost:8000

---

## 📝 First Steps

### 1. Create an Account
- Go to http://localhost:3000/signup
- Register with email and password

### 2. Build Your Resume
- Navigate to Resumes
- Click "New Resume"
- Fill in your information
- Export as PDF or Word

### 3. Track Job Applications
- Go to Jobs
- Add a new job application
- Track status and add notes

### 4. Generate Cover Letters
- Go to Cover Letters
- Select a job
- Generate AI-powered content

### 5. Use AI Agents
- Navigate to AI Agents
- Enable Job Discovery Agent
- Let AI find matching jobs

---

## 🧪 Running Tests

```bash
# All tests
npm run test

# Frontend tests only
cd apps/web && npm test

# Backend tests only
cd apps/api && npm test

# E2E tests
npx playwright test
```

---

## 🔧 Development

### Project Structure
```
RoleReady-FullStack/
├── apps/
│   ├── api/          # Node.js backend (Port 3001)
│   ├── api-python/   # Python AI service (Port 8000)
│   └── web/          # Next.js frontend (Port 3000)
├── docs/              # Documentation
└── browser-extension/ # Browser extension
```

### Environment Variables

**apps/api/.env**
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-secret-key"
FRONTEND_URL="http://localhost:3000"
```

**apps/api-python/.env**
```env
OPENAI_API_KEY="your-openai-api-key"
```

---

## 📚 Documentation

- [API Documentation](docs/COMPLETED_ENDPOINTS.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Architecture Overview](docs/README.md)
- [TODO List](docs/COMPLETE_TODO_LIST.md)

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000, 3001, 8000
npx kill-port 3000 3001 8000
```

### Database Issues
```bash
cd apps/api
npx prisma migrate reset
npx prisma db push
```

### Build Errors
```bash
# Clean and rebuild
rm -rf apps/web/.next
npm run build
```

---

## 📞 Support

For issues or questions:
- Check [README.md](README.md)
- Review [COMPLETE_TODO_LIST.md](docs/COMPLETE_TODO_LIST.md)
- See [TESTING_GUIDE.md](docs/TESTING_GUIDE.md)

---

**Happy coding! 🚀**

