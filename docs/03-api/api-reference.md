# API Reference

## Overview

RoleReady API is split into two backend services:
- **Node.js API** (`http://localhost:3001`) - Data operations, CRUD, business logic
- **Python AI API** (`http://localhost:8000`) - AI/ML processing

---

## Node.js API

### Base URL

```
http://localhost:3001
```

### Authentication

All endpoints (except auth) require JWT authentication via httpOnly cookie.

**Headers:**
```
Cookie: auth_token=<jwt_token>
```

---

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
- Sets httpOnly cookies: `auth_token`, `refresh_token`, `session_id`
- Returns user object

#### Logout
```http
POST /api/auth/logout
```

#### Verify Token
```http
GET /api/auth/verify
```

**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

---

### Resumes

#### Get All Resumes
```http
GET /api/resumes
```

**Response:**
```json
{
  "resumes": [
    {
      "id": "resume_id",
      "userId": "user_id",
      "name": "My Resume",
      "data": "{...resume_data...}",
      "templateId": "modern",
      "lastUpdated": "2025-01-31T10:00:00Z"
    }
  ]
}
```

#### Create Resume
```http
POST /api/resumes
Content-Type: application/json

{
  "name": "New Resume",
  "data": "{\"summary\":\"...\",\"skills\":[...]}",
  "templateId": "modern"
}
```

**Response:**
```json
{
  "success": true,
  "resume": { ... }
}
```

#### Update Resume
```http
PUT /api/resumes/:id
Content-Type: application/json

{
  "data": "{\"summary\":\"Updated summary\"}"
}
```

#### Delete Resume
```http
DELETE /api/resumes/:id
```

---

### Jobs

#### Get All Jobs
```http
GET /api/jobs
```

**Query Parameters:**
- `status` (optional) - Filter by status: `applied`, `interview`, `offer`, `rejected`

**Response:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "userId": "user_id",
      "title": "Senior Developer",
      "company": "Tech Corp",
      "location": "Remote",
      "status": "applied",
      "appliedDate": "2025-01-31",
      "salary": "$100k-120k"
    }
  ]
}
```

#### Create Job
```http
POST /api/jobs
Content-Type: application/json

{
  "title": "Senior Developer",
  "company": "Tech Corp",
  "location": "Remote",
  "status": "applied",
  "salary": "$100k-120k"
}
```

#### Update Job
```http
PUT /api/jobs/:id
Content-Type: application/json

{
  "status": "interview",
  "notes": "Scheduled for interview"
}
```

#### Delete Job
```http
DELETE /api/jobs/:id
```

#### Bulk Update Jobs
```http
POST /api/jobs/bulk-update
Content-Type: application/json

{
  "ids": ["job1", "job2", "job3"],
  "status": "applied"
}
```

---

### Cover Letters

#### Get All Cover Letters
```http
GET /api/cover-letters
```

**Query Parameters:**
- `jobId` (optional) - Filter by job ID

**Response:**
```json
{
  "coverLetters": [
    {
      "id": "letter_id",
      "userId": "user_id",
      "title": "Cover Letter for Tech Corp",
      "content": "...",
      "wordCount": 350,
      "createdAt": "2025-01-31T10:00:00Z"
    }
  ]
}
```

#### Create Cover Letter
```http
POST /api/cover-letters
Content-Type: application/json

{
  "title": "Cover Letter for Tech Corp",
  "content": "Dear Hiring Manager...",
  "jobId": "job_id"
}
```

#### Update Cover Letter
```http
PUT /api/cover-letters/:id
Content-Type: application/json

{
  "content": "Updated content..."
}
```

#### Delete Cover Letter
```http
DELETE /api/cover-letters/:id
```

---

### AI Endpoints

#### Generate AI Content
```http
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Write a professional summary for a software engineer",
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "content": "Experienced software engineer with expertise in...",
  "tokens_used": 150,
  "model": "gpt-4o-mini"
}
```

#### Calculate ATS Score
```http
POST /api/ai/ats-check
Content-Type: application/json

{
  "resume": "Resume text content...",
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "overall_score": 85,
  "category_scores": {
    "skills": 90,
    "experience": 85,
    "keywords": 80,
    "education": 85
  },
  "matched_keywords": ["React", "TypeScript", "Node.js"],
  "missing_keywords": ["AWS", "Docker"],
  "suggestions": [
    "Add AWS experience",
    "Include Docker in skills"
  ]
}
```

#### Analyze Job Description
```http
POST /api/ai/analyze-job
Content-Type: application/json

{
  "job_description": "We are looking for a..."
}
```

**Response:**
```json
{
  "skills": ["JavaScript", "React", "TypeScript"],
  "experience_level": "Mid-level",
  "keywords": ["AWS", "Docker", "CI/CD"],
  "salary_range": {
    "min": 80000,
    "max": 120000
  },
  "culture_indicators": [
    "Remote-friendly",
    "Fast-paced"
  ]
}
```

---

### Cloud Files

#### List Cloud Files
```http
GET /api/cloud-files
```

**Query Parameters:**
- `type` (optional) - Filter by type: `resume`, `cover_letter`, `document`
- `folder` (optional) - Filter by folder

#### Upload File
```http
POST /api/cloud/save
Content-Type: application/json

{
  "resumeData": {...},
  "name": "My Resume - Tech Corp"
}
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_id",
    "name": "My Resume - Tech Corp",
    "type": "resume",
    "createdAt": "2025-01-31T10:00:00Z"
  }
}
```

---

### Users

#### Get User Profile
```http
GET /api/users/profile
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": "url",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json

{
  "name": "John D. Doe",
  "location": "San Francisco, CA"
}
```

---

### System

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-31T10:00:00Z",
  "services": {
    "database": "connected",
    "memory": "ok"
  }
}
```

#### API Status
```http
GET /api/status
```

---

## Python AI API

### Base URL

```
http://localhost:8000
```

### Authentication

Uses JWT Bearer token (for internal communication).

---

## AI Endpoints

### Generate Content

```http
POST /api/ai/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Write a professional summary",
  "context": {"role": "Software Engineer"},
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "content": "Experienced software engineer...",
  "tokens_used": 150,
  "model": "gpt-4o-mini"
}
```

### ATS Score

```http
POST /api/ai/ats-score
Authorization: Bearer <token>
Content-Type: application/json

{
  "resume_text": "Professional summary...",
  "job_description": "Job requirements..."
}
```

**Response:**
```json
{
  "overall_score": 85.5,
  "category_scores": {
    "skills": 90,
    "experience": 85,
    "keywords": 80,
    "education": 85
  },
  "matched_keywords": ["React", "TypeScript"],
  "missing_keywords": ["AWS", "Docker"],
  "suggestions": ["Add AWS experience"]
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message here",
  "details": {...}
}
```

### Common Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Server Error
- **503** - Service Unavailable (AI not configured)

---

## Rate Limiting

- **Auth endpoints:** 10 requests/minute
- **Data endpoints:** 100 requests/minute
- **AI endpoints:** 60 requests/minute

Headers on rate limit:
```
Retry-After: 60
```

---

## Examples

### Complete Auth Flow

```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass123!"}'

# 2. Login (gets cookies)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123!"}' \
  -c cookies.txt

# 3. Get profile (uses cookies)
curl http://localhost:3001/api/users/profile \
  -b cookies.txt
```

### Creating Resume with AI

```bash
# 1. Generate AI summary
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"prompt":"Write professional summary for software engineer"}'

# 2. Create resume with AI-generated content
curl -X POST http://localhost:3001/api/resumes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"My Resume","data":"{\"summary\":\"AI generated summary\"}"}'
```

---

## Testing

### Interactive Docs

**Node.js API:**
- Browse localhost:3001 in browser
- Check console for available endpoints

**Python AI API:**
- Visit: http://localhost:8000/docs
- Interactive Swagger UI

### cURL Examples

All examples are available in this document above.

---

## Next Steps

- [Authentication Guide](./authentication.md)
- [Integration Guide](./integration-guide.md)
- [Python AI API Documentation](#)

