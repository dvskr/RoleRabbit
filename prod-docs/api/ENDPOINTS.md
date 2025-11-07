# API Endpoints Documentation

## Profile Endpoints

### GET /api/users/profile

Get current user's profile with all related data.

**Authentication:** Required (JWT token)

**Rate Limit:** 60 requests/minute

**Request:**
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "emailNotifications": true,
    "profile": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "location": "string",
      "professionalBio": "string",
      "profilePicture": "string",
      "linkedin": "string",
      "github": "string",
      "portfolio": "string",
      "website": "string",
      "profileCompleteness": 85,
      "workExperiences": [
        {
          "id": "string",
          "company": "string",
          "role": "string",
          "location": "string",
          "startDate": "MM/YYYY",
          "endDate": "MM/YYYY",
          "isCurrent": false,
          "description": "string",
          "technologies": ["string"],
          "projectType": "Full-time"
        }
      ],
      "education": [
        {
          "id": "string",
          "institution": "string",
          "degree": "string",
          "field": "string",
          "startDate": "string",
          "endDate": "string"
        }
      ],
      "skills": ["string"],
      "projects": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "technologies": ["string"],
          "date": "string"
        }
      ]
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch profile",
  "details": "Error message"
}
```

---

### PUT /api/users/profile

Update user profile data.

**Authentication:** Required (JWT token)

**Rate Limit:** 10 requests/minute

**Request:**
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "professionalBio": "Experienced software engineer...",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "portfolio": "https://johndoe.dev",
  "website": "https://johndoe.com",
  "workExperiences": [
    {
      "company": "Tech Corp",
      "role": "Senior Engineer",
      "location": "San Francisco, CA",
      "startDate": "01/2020",
      "endDate": "12/2023",
      "isCurrent": false,
      "description": "Led development team...",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "projectType": "Full-time"
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "BS",
      "field": "Computer Science",
      "startDate": "2016",
      "endDate": "2020"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Project description...",
      "technologies": ["React", "TypeScript"],
      "date": "2023"
    }
  ],
  "skills": ["JavaScript", "TypeScript", "React"],
  "languages": [
    {
      "name": "English",
      "proficiency": "Native"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified",
      "issuer": "Amazon",
      "date": "2023"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "user": {
    // Updated user profile (same structure as GET response)
  },
  "success": true
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `email` | Cannot be changed (login email) |
| `phone` | Valid phone format (10-15 digits) |
| `linkedin`, `github`, `portfolio`, `website` | Valid URL format |
| `professionalBio` | Max 5000 characters |
| `workExperiences[].company` | Max 200 characters |
| `workExperiences[].role` | Max 200 characters |
| `workExperiences[].startDate` | MM/YYYY format or "Present" |
| `workExperiences[].endDate` | MM/YYYY format or "Present" |
| `workExperiences[].description` | Max 10000 characters |
| `projects[].title` | Max 200 characters |
| `projects[].description` | Max 10000 characters |

**Error Responses:**

**400 Bad Request (Validation Failed):**
```json
{
  "error": "Validation failed",
  "details": {
    "phone": "Invalid phone number format",
    "workExperiences.0.startDate": "Date must be in MM/YYYY format"
  }
}
```

**400 Bad Request (Invalid Field):**
```json
{
  "error": "Cannot modify user ID"
}
```

```json
{
  "error": "Login email cannot be changed. Use personal email field for contact information.",
  "hint": "The email you use to log in cannot be modified. If you need to update your contact email, use the \"Personal Email\" field in your profile."
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized: No user ID found in token"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to update profile",
  "details": "Error message"
}
```

---

### POST /api/users/profile/picture

Upload profile picture.

**Authentication:** Required (JWT token)

**Rate Limit:** 5 requests/minute

**Request:**
```http
POST /api/users/profile/picture
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

**Supported Formats:** JPEG, PNG, GIF, WebP

**Max File Size:** 5MB

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://storage.url/profile-picture.jpg"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "No file uploaded"
}
```

```json
{
  "error": "Invalid file type. Only images are allowed."
}
```

**413 Payload Too Large:**
```json
{
  "error": "File too large. Maximum size is 5MB."
}
```

---

## Notes

- All endpoints require authentication via JWT token
- Rate limits are enforced per IP address
- Profile completeness is automatically recalculated on GET requests
- Arrays (workExperiences, education, etc.) replace existing data entirely
- Empty arrays will clear all existing entries for that field

