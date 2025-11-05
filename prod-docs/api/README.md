# API Documentation

## Profile Endpoints

### GET /api/users/profile
**Description:** Get current user's profile  
**Authentication:** Required  
**Rate Limit:** 60 requests/minute

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "profile": {
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "location": "string",
      "professionalBio": "string",
      "workExperiences": [...],
      "education": [...],
      "skills": [...],
      "projects": [...],
      "profileCompleteness": 0-100
    }
  }
}
```

### PUT /api/users/profile
**Description:** Update user profile  
**Authentication:** Required  
**Rate Limit:** 10 requests/minute

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "location": "string",
  "professionalBio": "string",
  "workExperiences": [...],
  "education": [...],
  "skills": [...],
  "projects": [...]
}
```

**Validation Rules:**
- Email: Valid email format (if provided)
- Phone: Valid phone format (if provided)
- URLs: Valid URL format (LinkedIn, GitHub, Portfolio, Website)
- Dates: MM/YYYY format
- Text Limits:
  - Professional Bio: max 5000 chars
  - Descriptions: max 10000 chars
  - Company/Role: max 200 chars

---

## Status

- ✅ Endpoints implemented
- ⚠️ Validation needed
- ⚠️ Rate limiting needed
- ⚠️ Error handling improvements needed

