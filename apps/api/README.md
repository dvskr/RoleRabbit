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

### Users/Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/picture` - Upload profile picture
- `GET /api/users/profile/completeness` - Get profile completeness score
- `GET /api/users/profile/analytics` - Get profile analytics
- `GET /api/users/profile/export` - Export profile (JSON)
- `GET /api/users/profile/public/:userId` - Get public profile
- `GET /api/users/sessions` - Get user sessions
- `DELETE /api/users/sessions/:id` - Revoke session
- `DELETE /api/users/sessions` - Revoke all sessions

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

### Profile Management
- `utils/profileCompleteness.js` - Profile completeness calculation
- `utils/sessionManager.js` - Session management
- `utils/passwordReset.js` - Password reset flow

### System
- `utils/logger.js` - Structured logging
- `utils/errorHandler.js` - Global error handling
- `utils/auditLogger.js` - Audit logging
- `utils/healthCheck.js` - Health checks
- `utils/emailService.js` - Email sending (auth emails only)

### Validation & Security
- `utils/validation.js` - Input validation
- `utils/sanitizer.js` - Input sanitization
- `utils/security.js` - Security utilities

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
- User (with all profile fields)
- RefreshToken, Session, PasswordResetToken
- AuditLog, AIUsage, Notification

---

**See:** `docs/COMPLETED_ENDPOINTS.md` for full API documentation

