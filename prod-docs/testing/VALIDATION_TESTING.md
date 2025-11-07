# Profile Validation Testing Guide

## Overview

This document provides a comprehensive guide for testing profile validation, including backend validation, error handling, and user experience.

---

## Backend Validation Tests

### Test Setup

1. **Start API server:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Get authentication token:**
   - Login via `/api/auth/login`
   - Extract token from response cookie

### Test Cases

#### 1. Email Validation

**Test:** Invalid email format in `personalEmail`
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personalEmail": "invalid-email"}'
```

**Expected:** Status 400, error message about invalid email format

**Test:** Valid email format
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personalEmail": "valid@example.com"}'
```

**Expected:** Status 200, success response

#### 2. Phone Number Validation

**Test:** Invalid phone format (too short)
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "123"}'
```

**Expected:** Status 400, validation error

**Test:** Valid phone format
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

**Expected:** Status 200, success

#### 3. URL Validation

**Test:** Invalid LinkedIn URL
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"linkedin": "not-a-url"}'
```

**Expected:** Status 400, validation error

**Test:** Valid URLs
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.dev"
  }'
```

**Expected:** Status 200, success

#### 4. Text Length Validation

**Test:** Professional bio exceeding max length
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"professionalBio\": \"${'a'.repeat(10001)}\"}"
```

**Expected:** Status 400, validation error about max length

#### 5. Protected Fields

**Test:** Attempt to modify login email
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@example.com"}'
```

**Expected:** Status 400, error message: "Login email cannot be changed"

**Test:** Attempt to modify user ID
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "different-id"}'
```

**Expected:** Status 400, error message: "Cannot modify user ID"

#### 6. Array Field Validation

**Test:** Invalid work experience structure
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workExperiences": [
      {
        "company": "",
        "role": "",
        "startDate": "invalid-date"
      }
    ]
  }'
```

**Expected:** Status 200 (validation may be lenient) or 400 if strict

**Test:** Valid work experience
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workExperiences": [
      {
        "company": "Test Company",
        "role": "Developer",
        "startDate": "2020-01",
        "endDate": "2021-01",
        "isCurrent": false,
        "technologies": ["React", "TypeScript"]
      }
    ]
  }'
```

**Expected:** Status 200, work experience saved

---

## Error Message Verification

### Expected Error Messages

1. **Invalid Email:**
   ```
   {
     "error": "Validation failed",
     "details": {
       "personalEmail": "Invalid email format"
     }
   }
   ```

2. **Invalid Phone:**
   ```
   {
     "error": "Validation failed",
     "details": {
       "phone": "Invalid phone number format"
     }
   }
   ```

3. **Invalid URL:**
   ```
   {
     "error": "Validation failed",
     "details": {
       "linkedin": "Invalid URL format"
     }
   }
   ```

4. **Protected Field:**
   ```
   {
     "error": "Login email cannot be changed. Use personal email field for contact information."
   }
   ```

---

## Manual Testing Checklist

### ✅ Basic Validation
- [ ] Test invalid email formats (missing @, invalid domain, etc.)
- [ ] Test invalid phone formats (too short, non-numeric, etc.)
- [ ] Test invalid URLs (missing protocol, invalid domain, etc.)
- [ ] Test text fields exceeding max length
- [ ] Test empty required fields (if any)

### ✅ Protected Fields
- [ ] Attempt to modify `email` field → Should fail
- [ ] Attempt to modify `id` field → Should fail
- [ ] Attempt to modify `userId` field → Should fail

### ✅ Array Fields
- [ ] Test empty arrays (should be accepted)
- [ ] Test malformed work experiences
- [ ] Test malformed projects
- [ ] Test technologies array format

### ✅ Edge Cases
- [ ] Test with null values
- [ ] Test with undefined values
- [ ] Test with empty strings
- [ ] Test with very long strings
- [ ] Test with special characters
- [ ] Test with SQL injection attempts
- [ ] Test with XSS attempts

---

## Frontend Validation Testing

### Visual Testing

1. **Invalid Input Feedback:**
   - Type invalid email → Should show error message
   - Type invalid phone → Should show error message
   - Submit form with errors → Should highlight invalid fields

2. **Save Flow:**
   - Make changes → Click Save → Should show "Saving..." state
   - Save success → Should show "Saved" confirmation
   - Save error → Should show error message

3. **Technologies Sync:**
   - Type technologies → Click Save without blurring → Should save correctly
   - Verify technologies appear after page reload

---

## Rate Limiting Tests

### Test Rate Limits

**GET Profile Endpoint (60 req/min):**
```bash
# Send 61 requests rapidly
for i in {1..61}; do
  curl http://localhost:3001/api/users/profile \
    -H "Cookie: token=YOUR_TOKEN"
done
```

**Expected:** First 60 succeed, 61st returns 429 Too Many Requests

**PUT Profile Endpoint (10 req/min):**
```bash
# Send 11 requests rapidly
for i in {1..11}; do
  curl -X PUT http://localhost:3001/api/users/profile \
    -H "Cookie: token=YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"firstName": "Test"}'
done
```

**Expected:** First 10 succeed, 11th returns 429

---

## Test Scripts

### Quick Validation Test

```bash
#!/bin/bash
# Quick validation test script

TOKEN="YOUR_TOKEN"
BASE_URL="http://localhost:3001/api/users/profile"

echo "Testing invalid email..."
curl -X PUT "$BASE_URL" \
  -H "Cookie: token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personalEmail": "invalid"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Testing valid email..."
curl -X PUT "$BASE_URL" \
  -H "Cookie: token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personalEmail": "valid@example.com"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Testing protected email field..."
curl -X PUT "$BASE_URL" \
  -H "Cookie: token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@example.com"}' \
  -w "\nStatus: %{http_code}\n\n"
```

---

## Test Results Template

| Test Case | Expected Result | Actual Result | Status |
|-----------|----------------|---------------|--------|
| Invalid email format | 400 error | | ⏳ |
| Valid email format | 200 success | | ⏳ |
| Invalid phone format | 400 error | | ⏳ |
| Invalid URL format | 400 error | | ⏳ |
| Text exceeding max length | 400 error | | ⏳ |
| Modify login email | 400 error | | ⏳ |
| Modify user ID | 400 error | | ⏳ |
| Rate limit exceeded | 429 error | | ⏳ |

---

## Notes

- All tests should be run against a test database
- Use test authentication tokens
- Clean up test data after tests
- Tests should be idempotent (can run multiple times)

---

**Last Updated:** 2024
**Test Coverage:** Backend validation, error handling, rate limiting

