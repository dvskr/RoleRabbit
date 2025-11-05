# Profile Fields Usage Analysis

## Overview
This document analyzes which UserProfile fields are actively being used in the RoleReady application.

## UserProfile Schema Fields

### ✅ **ACTIVELY USED FIELDS**

#### **Basic Information Fields**
| Field | Usage Status | Where Used |
|-------|-------------|------------|
| `firstName` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes (user data) |
| `lastName` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes (user data) |
| `phone` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Profile completeness calculation |
| `personalEmail` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Email validation |
| `location` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Profile completeness, Work experiences |
| `profilePicture` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT/DELETE), Auth routes, Profile completeness, Image upload endpoints |

#### **Social Links Fields**
| Field | Usage Status | Where Used |
|-------|-------------|------------|
| `linkedin` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Converted to socialLinks array |
| `github` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Projects table, Converted to socialLinks array |
| `portfolio` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Converted to socialLinks array |
| `website` | ✅ **Active** | ProfileTab (editing/display), API routes (GET/PUT), Auth routes, Converted to socialLinks array |

#### **Professional Fields**
| Field | Usage Status | Where Used |
|-------|-------------|------------|
| `professionalBio` | ✅ **Active** | ProfessionalTab (editing/display), API routes (GET/PUT), Auth routes, Profile completeness calculation |

#### **Analytics Fields**
| Field | Usage Status | Where Used |
|-------|-------------|------------|
| `profileCompleteness` | ✅ **Active** | Calculated in API (utils/profileCompleteness.js), Stored in database, Displayed in AnalyticsTab |

---

### ⚠️ **FIELDS NOT IN DATABASE SCHEMA BUT REFERENCED IN CODE**

These fields are checked in `profileCompleteness.js` but **DO NOT exist** in the UserProfile model:

| Field | Status | Notes |
|-------|--------|-------|
| `currentRole` | ❌ Not in schema | Checked in completeness calculation |
| `currentCompany` | ❌ Not in schema | Checked in completeness calculation |
| `experience` | ❌ Not in schema | Checked in completeness calculation |
| `industry` | ❌ Not in schema | Checked in completeness calculation |
| `jobLevel` | ❌ Not in schema | Checked in completeness calculation |
| `targetRoles` | ❌ Not in schema | Checked in completeness calculation |
| `targetCompanies` | ❌ Not in schema | Checked in completeness calculation |
| `bio` | ❌ Not in schema | Used as fallback for professionalBio in completeness |

**Note:** These are likely legacy fields from an older schema. The completeness calculation checks for them but they will always be null/undefined.

---

### 🗑️ **RECENTLY REMOVED FIELDS**

These fields were dropped from the database:
- `smsNotifications` (removed from users table)
- `privacyLevel` (removed from users table)
- `profileVisibility` (removed from users table)
- `profileViews` (removed from user_profiles table)

---

## Field Usage Details

### **API Routes Usage** (`apps/api/routes/users.routes.js`)

**GET `/api/users/profile`** - Returns all active fields:
- firstName, lastName, phone, personalEmail, location
- profilePicture, professionalBio
- linkedin, github, portfolio, website
- profileCompleteness

**PUT `/api/users/profile`** - Updates all active fields:
- Same fields as GET endpoint
- Validates personalEmail format
- Converts social links array to individual fields (linkedin, github, portfolio, website)

**GET `/api/users/profile/public/:userId`** - Public profile:
- Returns: professionalBio, linkedin, github, portfolio, website
- Does NOT return: firstName, lastName, phone, personalEmail, location (private info)

**POST `/api/storage/profile-picture`** - Profile picture upload:
- Updates `profilePicture` field
- Handles Supabase storage integration

### **Frontend Usage** (`apps/web/src/components/profile/tabs/`)

**ProfileTab.tsx** - Main profile editing:
- ✅ firstName, lastName (required fields)
- ✅ phone, personalEmail, location
- ✅ profilePicture (with upload functionality)
- ✅ linkedin, github, portfolio, website (with URL validation)

**ProfessionalTab.tsx**:
- ✅ professionalBio (main content)

**AnalyticsTab.tsx**:
- ✅ profileCompleteness (displays percentage and progress bar)

---

## Profile Completeness Calculation

The `calculateProfileCompleteness` function checks:

### ✅ **Fields That Exist & Are Checked:**
- name (from User model)
- email (from User model)
- phone ✅
- location ✅
- professionalBio ✅
- profilePicture ✅
- skills (from UserSkill relation)
- education (from Education relation)
- workExperiences (from WorkExperience relation)

### ❌ **Fields That DON'T Exist But Are Checked:**
- currentRole (not in schema)
- currentCompany (not in schema)
- experience (not in schema)
- industry (not in schema)
- jobLevel (not in schema)
- targetRoles (not in schema)
- targetCompanies (not in schema)

**Impact:** These missing fields will always return 0 points in the completeness calculation, reducing the maximum possible score.

---

## Recommendations

### 1. **Clean Up Profile Completeness Calculation**
   - Remove checks for fields that don't exist (currentRole, currentCompany, etc.)
   - Adjust scoring weights to account for removed fields
   - Current max achievable score is lower than 100% due to missing fields

### 2. **Consider Adding Missing Fields (if needed)**
   If these fields are important:
   - Add them to the UserProfile schema
   - Add UI components to edit them
   - Update API routes to handle them

### 3. **Fields That Could Be Removed**
   - None currently - all existing fields are actively used

### 4. **Fields That Are Stored But Converted**
   - `linkedin`, `github`, `portfolio`, `website` are stored individually but also converted to a `socialLinks` array format in some responses
   - Consider standardizing on one format

---

## Summary Statistics

- **Total Fields in Schema:** 11 fields (+ 2 system fields: createdAt, updatedAt)
- **Actively Used:** 11/11 (100%)
- **Fields Checked in Completeness:** 7 existing + 7 non-existent = 14 total checks
- **Missing from Completeness Check:** None (all active fields are checked)

---

## Conclusion

**All fields in the UserProfile schema are actively being used** in the application. The main issue is that the profile completeness calculation references fields that no longer exist in the schema, which means:

1. The completeness score calculation is incomplete
2. Users cannot achieve 100% completeness with current fields
3. The calculation logic should be updated to match the actual schema

