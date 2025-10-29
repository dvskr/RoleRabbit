# RoleReady API - Node.js Backend

**Version:** 1.0.0  
**Status:** Production Ready  
**Port:** 3001

---

## 🚀 Quick Start

### Installation
```bash
cd apps/api
npm install
```

### Development
```bash
npm run dev
```

Server will run on `http://localhost:3001`

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh access token

### Resumes
- `GET /api/resumes` - Get all user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get resume by ID
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/export` - Export resume (PDF/DOCX)

### Jobs
- `GET /api/jobs` - Get all user jobs
- `POST /api/jobs` - Create new job application
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/analytics` - Get job analytics
- `GET /api/jobs/analytics/summary` - Get success metrics

### Emails
- `GET /api/emails` - Get all user emails
- `POST /api/emails` - Create new email
- `GET /api/emails/:id` - Get email by ID
- `PUT /api/emails/:id` - Update email
- `DELETE /api/emails/:id` - Delete email

### Cover Letters
- `GET /api/cover-letters` - Get all cover letters
- `POST /api/cover-letters` - Create new cover letter
- `GET /api/cover-letters/:id` - Get cover letter by ID
- `PUT /api/cover-letters/:id` - Update cover letter
- `DELETE /api/cover-letters/:id` - Delete cover letter

### Portfolios
- `GET /api/portfolios` - Get all portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/:id` - Get portfolio by ID
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio

### Cloud Files
- `GET /api/cloud-files` - Get all cloud files
- `POST /api/cloud-files` - Create new cloud file
- `GET /api/cloud-files/:id` - Get cloud file by ID
- `PUT /api/cloud-files/:id` - Update cloud file
- `DELETE /api/cloud-files/:id` - Delete cloud file

### Files
- `POST /api/files/upload` - Upload file

### AI Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent by ID
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/execute` - Execute agent
- `GET /api/agents/:id/tasks` - Get agent tasks
- `POST /api/agents/run-all` - Run all active agents

### System
- `GET /health` - Health check
- `GET /api/status` - API status

---

## 🛠️ Utilities

### Authentication
- `auth.js` - User registration, login, password management
- `utils/refreshToken.js` - Refresh token handling
- `utils/sessionManager.js` - Session management
- `utils/passwordReset.js` - Password reset flow
- `utils/security.js` - Security utilities

### AI & Agents
- `utils/aiAgents.js` - AI agent utilities
- `utils/agentExecutor.js` - Agent execution
- `utils/agentScheduler.js` - Agent scheduling
- `utils/jobScraper.js` - Job scraping

### Data Management
- `utils/resumes.js` - Resume CRUD operations
- `utils/jobs.js` - Job CRUD operations
- `utils/emails.js` - Email management
- `utils/coverLetters.js` - Cover letter management
- `utils/portfolios.js` - Portfolio management
- `utils/cloudFiles.js` - Cloud file management
- `utils/analytics.js` - Analytics tracking

### Export & Utilities
- `utils/resumeExport.js` - Resume export (PDF/DOCX)
- `utils/fileUpload.js` - File upload handling
- `utils/emailService.js` - Email sending
- `utils/dataExport.js` - Data export
- `utils/staticGenerator.js` - Static site generation

### System
- `utils/logger.js` - Structured logging
- `utils/errorHandler.js` - Global error handling
- `utils/auditLogger.js` - Audit logging
- `utils/healthCheck.js` - Health checks
- `utils/monitoring.js` - Application monitoring
- `utils/scheduler.js` - Job scheduler
- `utils/backgroundJobs.js` - Background jobs

### Validation & Security
- `utils/validation.js` - Input validation
- `utils/sanitizer.js` - Input sanitization
- `utils/cache.js` - Caching
- `utils/cachingStrategy.js` - Caching strategy
- `utils/pagination.js` - Pagination
- `utils/search.js` - Search utilities

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test auth.test.js
```

---

## 📦 Dependencies

### Core
- `fastify` - Web framework
- `@prisma/client` - Database ORM
- `@fastify/jwt` - JWT authentication
- `@fastify/cors` - CORS support
- `@fastify/multipart` - File uploads
- `@fastify/helmet` - Security headers
- `@fastify/compress` - Response compression
- `@fastify/rate-limit` - Rate limiting

---

## 🔐 Security

- ✅ httpOnly cookies for JWT tokens
- ✅ Refresh token mechanism
- ✅ Session management
- ✅ Password reset flow
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Security headers (Helmet)
- ✅ XSS protection
- ✅ SQL injection prevention

---

## 📊 Database

Using Prisma with SQLite (dev) / PostgreSQL (prod)

**Schema:** `prisma/schema.prisma`  
**Migrations:** `prisma/migrations/`

### Models
- User, RefreshToken, Session
- Resume, Job, CoverLetter
- Email, Portfolio, CloudFile
- AIAgent, Analytics, DiscussionPost

---

**See:** `docs/COMPLETED_ENDPOINTS.md` for full API documentation

