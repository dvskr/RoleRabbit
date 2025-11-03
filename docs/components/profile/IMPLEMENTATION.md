# Profile Component - Full Implementation Requirements

## Overview

This document outlines all requirements for full-stack implementation of the Profile component, including backend integration, database setup, API endpoints, and feature implementation.

## Current Status

### ✅ Already Implemented
- Frontend component built with all UI tabs
- ProfileContext loads data from API
- API service methods exist (`getUserProfile`, `updateUserProfile`)
- Backend routes exist (`/api/users/profile`, `/api/users/profile/picture`, `/api/users/profile/parse-resume`)
- Prisma schema with all user fields
- Profile picture upload (base64 storage)
- Resume import UI component

### ⚠️ Needs Verification/Implementation
- Database migrations and connection
- API endpoint testing and error handling
- Resume parsing backend utilities
- Security tab backend integration
- Profile completeness calculation
- Analytics/metrics tracking
- File storage optimization

---

## 1. Database Setup

### Status: Partially Done

**Current State:**
- Prisma schema exists with all user fields
- Schema includes JSON fields for complex data

**Requirements:**

#### 1.1 Run Migrations
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

#### 1.2 Verify Database Connection
- Ensure PostgreSQL is running (or SQLite for dev)
- Verify `DATABASE_URL` in `.env` file
- Test connection in `apps/api/utils/db.js`

#### 1.3 Required Fields Mapping
Ensure these JSON fields parse correctly:
- `workExperiences` - Array of work experience objects
- `volunteerExperiences` - Array of volunteer experience objects
- `recommendations` - Array of recommendation objects
- `publications` - Array of publication objects
- `patents` - Array of patent objects
- `organizations` - Array of organization objects
- `testScores` - Array of test score objects

**Test Cases:**
- Create user with full profile data
- Verify all JSON fields save correctly
- Verify all JSON fields load correctly
- Test with null/empty arrays

---

## 2. API Endpoints Verification

### Status: Routes Exist, Need Testing

### 2.1 GET /api/users/profile

**Purpose:** Retrieve user profile data

**Authentication:** Required (JWT token)

**Response Fields:**
- Basic info: firstName, lastName, email, phone, location, bio, profilePicture
- Professional: currentRole, currentCompany, experience, industry, jobLevel, employmentType, availability, salaryExpectation, workPreference
- Links: linkedin, github, website
- JSON Arrays: skills, certifications, languages, education, careerGoals, targetRoles, targetCompanies, socialLinks, projects, achievements, careerTimeline, workExperiences, volunteerExperiences, recommendations, publications, patents, organizations, testScores
- Preferences: jobAlerts, emailNotifications, smsNotifications, privacyLevel, profileVisibility

**Requirements:**
- Parse all JSON fields back to arrays/objects
- Handle null/undefined fields gracefully
- Return empty arrays for missing JSON fields
- Return 404 if user not found
- Return 401 if not authenticated

**Test Cases:**
- Get profile with all fields populated
- Get profile with minimal data
- Get profile with null fields
- Test authentication requirement

---

### 2.2 PUT /api/users/profile

**Purpose:** Update user profile data

**Authentication:** Required (JWT token)

**Request Body:** Partial user data object

**Validation Required:**
- Email format validation (if email is updated)
- Field allowlist (only allow defined fields)
- JSON array fields must be stringified

**Requirements:**
- Update only provided fields
- Stringify JSON array fields before saving
- Auto-update `name` field from firstName/lastName
- Validate email format if email is updated
- Return updated user data with parsed JSON fields
- Handle null/undefined values correctly

**Allowed Fields:**
```javascript
const allowedFields = [
  'name', 'email', 'profilePicture',
  'firstName', 'lastName', 'phone', 'location', 'bio',
  'currentRole', 'currentCompany', 'experience', 'industry',
  'jobLevel', 'employmentType', 'availability', 'salaryExpectation', 'workPreference',
  'linkedin', 'github', 'website',
  'skills', 'certifications', 'languages', 'education',
  'careerGoals', 'targetRoles', 'targetCompanies',
  'socialLinks', 'projects', 'achievements', 'careerTimeline',
  'workExperiences', 'volunteerExperiences', 'recommendations',
  'publications', 'patents', 'organizations', 'testScores',
  'jobAlerts', 'emailNotifications', 'smsNotifications',
  'privacyLevel', 'profileVisibility'
];
```

**Test Cases:**
- Update single field
- Update multiple fields
- Update JSON array fields
- Update with invalid email
- Update with unauthorized fields (should be ignored)
- Test auto-update of `name` field

---

### 2.3 POST /api/users/profile/picture

**Purpose:** Upload and update profile picture

**Authentication:** Required (JWT token)

**Request:** Multipart form data with file

**Validation:**
- File type: image/jpeg, image/png, image/jpg, image/gif, image/webp
- File size: Max 5MB
- File required

**Current Implementation:**
- Stores as base64 data URL in database

**Requirements:**
- Validate file type and size
- Convert image to base64
- Update user's profilePicture field
- Return updated user with new profilePicture

**Future Enhancement:**
- Store files in file system or cloud storage
- Add image compression/resizing
- Generate thumbnails
- Store file path instead of base64

**Test Cases:**
- Upload valid image file
- Upload invalid file type (should fail)
- Upload file too large (should fail)
- Upload without file (should fail)
- Verify base64 storage format

---

### 2.4 POST /api/users/profile/parse-resume

**Purpose:** Parse uploaded resume file and extract profile data

**Authentication:** Required (JWT token)

**Request:** Multipart form data with resume file

**Supported Formats:**
- PDF (application/pdf)
- DOC (application/msword)
- DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- TXT (text/plain)

**Requirements:**
- Validate file type
- Extract text from file using `documentExtractor.js`
- Parse resume text using `resumeParser.js`
- Return structured data matching profile fields

**Backend Utilities:**
- `apps/api/utils/documentExtractor.js` - Extracts text from files
- `apps/api/utils/resumeParser.js` - Parses text into structured data

**Data Mapping:**
- Contact info → firstName, lastName, email, phone
- Experience → workExperiences array
- Education → education array
- Skills → skills array
- Certifications → certifications array
- Summary → bio
- Location → location

**Test Cases:**
- Parse PDF resume
- Parse DOCX resume
- Parse DOC resume
- Parse TXT resume
- Handle corrupted files
- Handle scanned PDFs (image-based)
- Handle empty files
- Verify extracted data mapping

---

## 3. Resume Parsing Implementation

### Status: Backend Utilities Exist, Need Verification

### 3.1 Document Extractor (`documentExtractor.js`)

**Purpose:** Extract text from various file formats

**Supported Formats:**
- PDF: Using `pdf-parse` library
- DOCX: Using `mammoth` library
- DOC: May need additional library
- TXT: Direct text reading

**Requirements:**
- Handle all supported formats
- Return plain text string
- Handle errors gracefully (corrupted files, unsupported formats)
- Handle image-based PDFs (scanned documents)

**Error Handling:**
- Return clear error messages
- Handle file corruption
- Handle unsupported formats
- Handle empty files

---

### 3.2 Resume Parser (`resumeParser.js`)

**Purpose:** Parse extracted text into structured profile data

**Requirements:**
- Extract contact information (name, email, phone, location)
- Extract work experience (company, role, dates, description)
- Extract education (institution, degree, field, dates, GPA)
- Extract skills (list of skills)
- Extract certifications (name, issuer, date)
- Extract summary/bio
- Handle various resume formats

**Output Structure:**
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  location: string,
  bio: string,
  workExperiences: [{
    company: string,
    role: string,
    startDate: string,
    endDate: string,
    isCurrent: boolean,
    description: string
  }],
  education: [{
    institution: string,
    degree: string,
    field: string,
    startDate: string,
    endDate: string,
    gpa: string
  }],
  skills: string[],
  certifications: [{
    name: string,
    issuer: string,
    issuedDate: string
  }]
}
```

**Test Cases:**
- Parse well-formatted resume
- Parse resume with missing sections
- Parse resume with unusual formatting
- Handle dates in various formats
- Extract skills from different sections
- Handle multiple work experiences
- Handle multiple education entries

---

## 4. Profile Picture Upload Enhancement

### Status: Basic Implementation Exists (Base64)

### Current Implementation
- Stores profile picture as base64 data URL in database
- Limited to 5MB file size
- Simple but not scalable

### Option A: Keep Base64 (Simple)
**Requirements:**
- Add image compression before storing
- Validate image dimensions (max 2000x2000px)
- Optimize image quality (reduce file size)
- Consider max size limits (1-2MB compressed)

**Pros:**
- Simple implementation
- No file system needed
- Works immediately

**Cons:**
- Database bloat
- Slower queries
- Not scalable

---

### Option B: File Storage (Recommended)
**Requirements:**
- Store files in `uploads/profiles/{userId}/` directory
- Store file path/URL in database
- Add file serving endpoint: `GET /api/files/profiles/:userId/:filename`
- Implement image resizing/optimization
- Generate thumbnails (optional)
- Add CDN support (optional)

**Implementation:**
```javascript
// Store file instead of base64
const filePath = `uploads/profiles/${userId}/${Date.now()}-${data.filename}`;
await fs.writeFile(filePath, buffer);
updateData.profilePicture = `/api/files/profiles/${userId}/${filename}`;
```

**File Serving Endpoint:**
```javascript
fastify.get('/api/files/profiles/:userId/:filename', async (request, reply) => {
  // Verify user has access
  // Stream file
  // Set appropriate headers
});
```

**Pros:**
- Scalable
- Better performance
- Smaller database
- Can use CDN

**Cons:**
- More complex
- Requires file system setup
- Need file cleanup on user deletion

---

## 5. Security Tab Implementation

### Status: Frontend Exists, Backend Integration Needed

### 5.1 Password Change

**Endpoint:** `PUT /api/auth/password` (verify exists)

**Requirements:**
- Validate current password
- Validate new password (strength requirements)
- Hash new password with bcrypt
- Update password in database
- Optionally invalidate all sessions

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Request Body:**
```javascript
{
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}
```

**Test Cases:**
- Change password with correct current password
- Change password with incorrect current password (should fail)
- Change password with weak new password (should fail)
- Change password with mismatched confirm password (should fail)

---

### 5.2 Two-Factor Authentication (2FA)

**Status:** Backend routes exist, verify implementation

**Endpoints to Verify:**

1. **POST /api/auth/2fa/setup**
   - Generates secret key
   - Returns QR code URL
   - Returns backup codes

2. **POST /api/auth/2fa/enable**
   - Verifies token
   - Enables 2FA for user
   - Stores secret in database

3. **POST /api/auth/2fa/disable**
   - Disables 2FA
   - Clears secret from database

4. **POST /api/auth/2fa/verify**
   - Verifies 2FA token during login

5. **GET /api/auth/2fa/status**
   - Returns 2FA enabled status

**Requirements:**
- Use `speakeasy` library for TOTP
- Generate QR code using `qrcode` library
- Store secret securely in database
- Generate backup codes
- Verify token on enable

**Test Cases:**
- Setup 2FA (generate QR code)
- Enable 2FA with valid token
- Enable 2FA with invalid token (should fail)
- Verify 2FA status
- Disable 2FA
- Verify 2FA during login

---

### 5.3 Login Activity / Session Management

**Status:** Need to implement endpoints

**Required Endpoints:**

1. **GET /api/users/sessions**
   - List all active sessions for user
   - Show device info, IP address, last activity
   - Return session ID, device, IP, userAgent, createdAt, lastActivity

2. **DELETE /api/users/sessions/:id**
   - Revoke specific session
   - Return success confirmation

3. **DELETE /api/users/sessions**
   - Revoke all sessions except current
   - Return success confirmation

**Requirements:**
- Query Session model from database
- Filter by userId
- Show formatted device info
- Handle session expiration
- Update lastActivity on request

**Response Format:**
```javascript
{
  sessions: [{
    id: string,
    device: string,
    ipAddress: string,
    userAgent: string,
    createdAt: string,
    lastActivity: string,
    isCurrent: boolean
  }]
}
```

**Test Cases:**
- Get all sessions
- Revoke specific session
- Revoke all sessions
- Verify current session detection

---

### 5.4 Privacy Settings

**Status:** Already handled in profile update

**Fields:**
- `privacyLevel`: 'Professional' | 'Personal' | 'Private'
- `profileVisibility`: 'Public' | 'Private' | 'Limited'

**Requirements:**
- Verify these fields save correctly in profile update
- Apply privacy settings when fetching public profile
- Respect privacy settings in profile sharing

---

## 6. Billing Tab Implementation

### Status: Frontend Exists, Backend Missing

### 6.1 Database Schema

**Required Models:**
```prisma
model Subscription {
  id              String   @id @default(cuid())
  userId          String
  plan            String   // free, basic, premium, enterprise
  status          String   // active, cancelled, expired, trial
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  invoices        Invoice[]
  
  @@index([userId])
  @@map("subscriptions")
}

model Invoice {
  id              String   @id @default(cuid())
  subscriptionId  String
  amount          Float
  currency        String   @default("USD")
  status          String   // paid, pending, failed
  invoiceDate     DateTime
  dueDate         DateTime?
  paidAt          DateTime?
  invoiceUrl      String?
  
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  
  @@index([subscriptionId])
  @@map("invoices")
}

model PaymentMethod {
  id              String   @id @default(cuid())
  userId          String
  type            String   // card, paypal
  last4           String?
  brand            String?
  expiryMonth     Int?
  expiryYear      Int?
  isDefault       Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@map("payment_methods")
}
```

---

### 6.2 Required Endpoints

1. **GET /api/billing/subscription**
   - Get current subscription status
   - Return plan, status, period dates

2. **GET /api/billing/invoices**
   - Get invoice history
   - Pagination support

3. **POST /api/billing/subscribe**
   - Create/update subscription
   - Integrate with payment provider (Stripe/PayPal)

4. **POST /api/billing/cancel**
   - Cancel subscription
   - Set cancelAtPeriodEnd flag

5. **GET /api/billing/payment-methods**
   - Get saved payment methods

6. **POST /api/billing/payment-methods**
   - Add payment method
   - Set as default

7. **DELETE /api/billing/payment-methods/:id**
   - Remove payment method

8. **POST /api/billing/webhook**
   - Handle payment provider webhooks
   - Update subscription status
   - Create invoices

---

### 6.3 Payment Provider Integration

**Options:**
- Stripe (recommended)
- PayPal
- Other providers

**Requirements:**
- Set up payment provider account
- Configure webhook endpoints
- Handle subscription events
- Handle payment failures
- Generate invoices

---

## 7. Data Validation

### Status: Partial - Some Validation Exists

### 7.1 Required Validations

**Email:**
- Valid email format
- Already implemented

**Phone:**
- Valid phone format (optional)
- International format support

**URLs:**
- LinkedIn, GitHub, website URLs
- Valid URL format
- Protocol validation (http/https)

**Arrays:**
- Skills: Max items (e.g., 50), no duplicates
- Education: Required fields (institution, degree, dates)
- Work experience: Required fields (company, role, dates)
- Social links: Valid URL format

**Dates:**
- Education dates: Start date before end date
- Work experience dates: Start date before end date
- Handle "current" dates (endDate is null)

**File Uploads:**
- File size limits
- File type validation
- Already implemented for profile picture

---

### 7.2 Validation Implementation

**Frontend:**
- Real-time validation while typing
- Show validation errors
- Prevent submission if invalid

**Backend:**
- Validate all inputs before saving
- Return specific error messages
- Reject invalid data

**Validation Library:**
- Use existing `utils/validation.js`
- Add new validators as needed

---

## 8. Error Handling

### Status: Basic Error Handling Exists

### 8.1 Required Error Handling

**Network Errors:**
- Connection timeout
- Server unavailable
- Network failure
- Show user-friendly messages

**Validation Errors:**
- Field-specific error messages
- Show which fields are invalid
- Suggest corrections

**Server Errors:**
- 500 errors
- Database errors
- Generic error messages (don't expose internals)

**Authentication Errors:**
- 401 Unauthorized
- Session expired
- Redirect to login

**Optimistic Updates:**
- Update UI immediately
- Rollback on failure
- Show error message

**Retry Logic:**
- Retry failed requests (up to 3 times)
- Exponential backoff
- Show retry status

---

### 8.2 Error Message Examples

**Network Error:**
```
"Cannot connect to server. Please check your internet connection and try again."
```

**Validation Error:**
```
"Invalid email format. Please enter a valid email address."
```

**Server Error:**
```
"An error occurred while saving your profile. Please try again later."
```

**Session Expired:**
```
"Your session has expired. Please log in again."
```

---

## 9. Profile Completeness Calculation

### Status: Frontend Calculates, Backend Doesn't Update

### 9.1 Completeness Score Calculation

**Endpoint:** `GET /api/users/profile/completeness`

**Scoring Breakdown:**
- Basic Info (20%): name, email, phone, location, bio, profilePicture
- Professional Info (25%): currentRole, currentCompany, experience, industry, jobLevel
- Skills (15%): At least 5 skills
- Education (15%): At least one education entry
- Work Experience (15%): At least one work experience
- Career Goals (10%): careerGoals, targetRoles, targetCompanies

**Calculation:**
```javascript
function calculateCompleteness(user) {
  let score = 0;
  
  // Basic Info (20%)
  if (user.name) score += 3;
  if (user.email) score += 3;
  if (user.phone) score += 2;
  if (user.location) score += 2;
  if (user.bio) score += 5;
  if (user.profilePicture) score += 5;
  
  // Professional Info (25%)
  if (user.currentRole) score += 5;
  if (user.currentCompany) score += 5;
  if (user.experience) score += 5;
  if (user.industry) score += 5;
  if (user.jobLevel) score += 5;
  
  // Skills (15%)
  if (user.skills && user.skills.length >= 5) score += 15;
  else if (user.skills && user.skills.length > 0) score += (user.skills.length / 5) * 15;
  
  // Education (15%)
  if (user.education && user.education.length > 0) score += 15;
  
  // Work Experience (15%)
  if (user.workExperiences && user.workExperiences.length > 0) score += 15;
  
  // Career Goals (10%)
  if (user.careerGoals && user.careerGoals.length > 0) score += 5;
  if (user.targetRoles && user.targetRoles.length > 0) score += 3;
  if (user.targetCompanies && user.targetCompanies.length > 0) score += 2;
  
  return Math.min(100, Math.round(score));
}
```

**Requirements:**
- Calculate on profile load
- Update `profileCompleteness` field in user table
- Return completeness score in profile response
- Show progress indicators in UI

---

## 10. Analytics/Metrics Tracking

### Status: Fields Exist in Schema, Not Populated

### 10.1 Metrics to Track

**Profile Metrics:**
- `profileViews` - Number of times profile viewed
- `applicationsSent` - Number of job applications sent
- `interviewsScheduled` - Number of interviews scheduled
- `offersReceived` - Number of job offers received
- `successRate` - Percentage (offers/interviews)
- `profileCompleteness` - Percentage (0-100)
- `skillMatchRate` - Percentage (from AI analysis)
- `avgResponseTime` - Average response time (days)

### 10.2 Implementation

**Update Metrics:**
- Increment `profileViews` when profile is viewed
- Update `applicationsSent` from Job Tracker
- Update `interviewsScheduled` from Job Tracker
- Update `offersReceived` from Job Tracker
- Calculate `successRate` automatically
- Calculate `profileCompleteness` on profile save
- Calculate `skillMatchRate` from AI analysis
- Calculate `avgResponseTime` from application dates

**Endpoint:** `GET /api/users/profile/analytics`
- Return all metrics
- Include trends (optional)
- Include comparisons (optional)

**Auto-Updates:**
- Profile views: Increment on profile page load
- Applications: Update from Job Tracker API
- Interviews: Update from Job Tracker API
- Offers: Update from Job Tracker API

---

## 11. Work Experience Management

### Status: Schema Supports It, UI Needs Verification

### 11.1 Data Structure

**Work Experience Object:**
```typescript
interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  client?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD or empty if current
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
  projectType?: 'Client Project' | 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Consulting';
}
```

### 11.2 CRUD Operations

**Requirements:**
- Add work experience
- Edit work experience
- Delete work experience
- Reorder work experiences
- Validate required fields (company, role, startDate)
- Handle date formatting
- Handle "current" flag (endDate is null)

**Validation:**
- Company: Required, min 2 characters
- Role: Required, min 2 characters
- Start date: Required, valid date format
- End date: If not current, must be after start date
- Description: Optional, max 2000 characters

**Storage:**
- Store as JSON array in `workExperiences` field
- Parse from JSON on load
- Stringify to JSON on save

---

## 12. Education Management

### Status: Similar to Work Experience

### 12.1 Data Structure

**Education Object:**
```typescript
interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD or empty if current
  isCurrent: boolean;
  gpa?: string;
  honors?: string[];
  description?: string;
}
```

### 12.2 CRUD Operations

**Requirements:**
- Add education entry
- Edit education entry
- Delete education entry
- Reorder education entries
- Validate required fields (institution, degree, field, dates)
- Handle GPA formatting
- Handle honors/awards

**Validation:**
- Institution: Required, min 2 characters
- Degree: Required (e.g., "Bachelor's", "Master's", "PhD")
- Field: Required (e.g., "Computer Science")
- Start date: Required, valid date format
- End date: If not current, must be after start date
- GPA: Optional, format validation (e.g., "3.5" or "3.5/4.0")

---

## 13. Profile Export

### Status: Not Implemented

### 13.1 Export Formats

**Endpoint:** `GET /api/users/profile/export?format=json|pdf|docx`

**Formats:**
1. **JSON** - Full profile data as JSON
2. **PDF** - Formatted profile document
3. **DOCX** - Word document

### 13.2 Implementation

**JSON Export:**
- Return full profile data
- Include all fields
- Pretty formatted

**PDF Export:**
- Use `puppeteer` or `pdfkit`
- Format professionally
- Include all sections
- Add header/footer

**DOCX Export:**
- Use `docx` library
- Format professionally
- Include all sections
- Preserve formatting

**Requirements:**
- Include all profile sections
- Format professionally
- Handle missing data gracefully
- Add timestamps
- Add export metadata

---

## 14. Profile Sharing

### Status: Not Implemented

### 14.1 Public Profile Page

**Endpoint:** `GET /api/users/profile/public/:userId`

**Requirements:**
- Only if `profileVisibility` is "Public"
- Show limited data based on privacy settings
- Don't show sensitive information (email, phone)
- Track profile views
- Generate shareable link: `/profile/public/:userId`

**Privacy Levels:**
- **Public:** Show all allowed fields
- **Limited:** Show basic info only
- **Private:** 404 Not Found

**Allowed Public Fields:**
- Name
- Bio
- Profile picture
- Current role/company
- Skills (if privacy allows)
- Public portfolio link
- Social links (if privacy allows)

**Blocked Public Fields:**
- Email
- Phone
- Address
- Salary expectations
- Applications/interviews/offers

### 14.2 Shareable Link

**Format:** `https://roleready.com/profile/public/{userId}`

**Features:**
- Unique per user
- Works only if profile is public
- Track views
- Show view count to user

---

## 15. Testing Requirements

### 15.1 Unit Tests

**Backend:**
- Profile update logic
- JSON field parsing
- Validation functions
- Resume parsing utilities

**Frontend:**
- Profile form validation
- Data transformation
- API service methods

### 15.2 Integration Tests

**API Endpoints:**
- GET /api/users/profile
- PUT /api/users/profile
- POST /api/users/profile/picture
- POST /api/users/profile/parse-resume

**Test Scenarios:**
- Successful profile load
- Successful profile update
- Failed profile update (validation)
- Profile picture upload
- Resume parsing

### 15.3 E2E Tests

**Profile Flow:**
1. Load profile page
2. View profile data
3. Enter edit mode
4. Update profile fields
5. Save profile
6. Verify data saved
7. Upload profile picture
8. Import resume
9. Verify data updated

**Error Scenarios:**
- Network failure during save
- Validation errors
- Server errors
- Session expiration

---

## Implementation Priority

### High Priority (Must Have)
1. ✅ Database migrations and connection
2. ✅ Verify all API endpoints work
3. ✅ Resume parsing implementation
4. ✅ Profile picture upload (base64 minimum)
5. ✅ Data validation
6. ✅ Error handling

### Medium Priority (Should Have)
1. ⚠️ Profile completeness calculation
2. ⚠️ Security tab (password change, 2FA, sessions)
3. ⚠️ Work experience and education CRUD
4. ⚠️ Analytics/metrics tracking

### Low Priority (Nice to Have)
1. 📋 File storage for profile pictures
2. 📋 Billing tab implementation
3. 📋 Profile export
4. 📋 Profile sharing

---

## Quick Implementation Checklist

### Database Setup
- [ ] Run Prisma migrations (`npx prisma migrate dev`)
- [ ] Generate Prisma client (`npx prisma generate`)
- [ ] Verify database connection
- [ ] Test creating user with profile data
- [ ] Verify JSON fields save/load correctly

### API Endpoints
- [ ] Test `GET /api/users/profile` endpoint
- [ ] Test `PUT /api/users/profile` endpoint
- [ ] Test profile picture upload
- [ ] Test resume parsing (PDF, DOCX)
- [ ] Verify error handling for all endpoints

### Resume Parsing
- [ ] Verify `documentExtractor.js` works for all formats
- [ ] Verify `resumeParser.js` extracts data correctly
- [ ] Test with various resume formats
- [ ] Handle edge cases (scanned PDFs, corrupted files)

### Security Tab
- [ ] Implement password change endpoint
- [ ] Verify 2FA endpoints work
- [ ] Implement session management endpoints
- [ ] Test all security features

### Additional Features
- [ ] Implement profile completeness calculation
- [ ] Add analytics/metrics tracking
- [ ] Implement work experience CRUD
- [ ] Implement education CRUD
- [ ] Add data validation
- [ ] Improve error handling

### Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Test error scenarios

---

## Related Documentation

- [Profile Component Overview](./README.md)
- [API Reference](../../backend/routes/README.md)
- [Database Schema](../../../apps/api/prisma/schema.prisma)

---

**Last Updated:** [Current Date]
**Status:** Implementation Requirements Documented
**Next Steps:** Begin with High Priority items

