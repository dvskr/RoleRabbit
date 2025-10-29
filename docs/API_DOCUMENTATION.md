# RoleReady API Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: `https://api.roleready.io`

## Authentication

All protected endpoints require JWT authentication via httpOnly cookies or Bearer token.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/login
Login and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### POST /api/auth/logout
Logout and invalidate token

#### GET /api/auth/verify
Verify authentication status

### Resumes

#### GET /api/resumes
Get all user's resumes

#### GET /api/resumes/:id
Get specific resume

#### POST /api/resumes
Create a new resume

#### PUT /api/resumes/:id
Update a resume

#### DELETE /api/resumes/:id
Delete a resume

#### POST /api/resumes/:id/export
Export resume to PDF/Word

### Jobs

#### GET /api/jobs
Get all user's job applications

#### GET /api/jobs/:id
Get specific job application

#### POST /api/jobs
Create a new job application

#### PUT /api/jobs/:id
Update job application

#### DELETE /api/jobs/:id
Delete job application

#### POST /api/jobs/:id/analytics
Get analytics for specific job

### AI

#### POST /api/ai/generate
Generate AI content (resume sections, cover letters, etc.)

#### POST /api/ai/analyze
Analyze resume for improvements

#### POST /api/ai/ats-score
Get ATS compatibility score

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": "Invalid email format"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

