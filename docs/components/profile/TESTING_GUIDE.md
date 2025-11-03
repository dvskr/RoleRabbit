# Profile Feature - End-to-End Testing Guide

## 🎯 Testing Overview

This guide walks you through testing all profile features end-to-end, from backend APIs to frontend UI.

---

## 📋 Prerequisites

### 1. Environment Setup

**Backend Environment (`apps/api/.env`):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/roleready
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Database Setup

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 3. Install Dependencies

```bash
# Backend
cd apps/api
npm install

# Frontend
cd apps/web
npm install
```

---

## 🚀 Step 1: Start Backend Server

```bash
cd apps/api
npm run dev
```

**Expected Output:**
```
🚀 RoleReady Node.js API running on http://localhost:3001
📊 Health check: http://localhost:3001/health
📋 API status: http://localhost:3001/api/status
```

**Verify:**
- Visit `http://localhost:3001/health` - Should return `{ "status": "ok" }`
- Visit `http://localhost:3001/api/status` - Should list available endpoints

---

## 🎨 Step 2: Start Frontend Server

```bash
cd apps/web
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

**Verify:**
- Visit `http://localhost:3000` - Should load the application

---

## ✅ Step 3: Authentication Testing

### 3.1 Register a New User

1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click "Register"
4. **Expected:** Redirected to dashboard or login

### 3.2 Login

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click "Login"
4. **Expected:** Redirected to dashboard

---

## 📝 Step 4: Profile Testing

### 4.1 Navigate to Profile

1. Click on "Profile" in navigation/sidebar
2. **Expected:** Profile page loads with 8 tabs visible

### 4.2 Test Profile Tab (Basic Information)

**Test Case 4.2.1: View Profile Data**
- **Action:** Open Profile tab
- **Expected:** See empty or default profile fields
- **Verify:** Fields include: First Name, Last Name, Email, Phone, Location, Bio

**Test Case 4.2.2: Edit Profile**
- **Action:** Click "Edit Profile" button
- **Expected:** Form fields become editable
- **Action:** Fill in fields:
  - First Name: `John`
  - Last Name: `Doe`
  - Phone: `+1 (555) 123-4567`
  - Location: `San Francisco, CA`
  - Bio: `Software engineer with 5+ years of experience`
- **Action:** Click "Save"
- **Expected:** 
  - Success message appears
  - Data saves and form returns to view mode
  - Changes persist on page refresh

**Test Case 4.2.3: Upload Profile Picture**
- **Action:** Click on profile picture area or upload button
- **Action:** Select an image file (JPG/PNG, max 5MB)
- **Expected:**
  - Image uploads successfully
  - Profile picture updates immediately
  - Picture persists on refresh

**Test Case 4.2.4: Cancel Edit**
- **Action:** Click "Edit Profile"
- **Action:** Make changes to fields
- **Action:** Click "Cancel"
- **Expected:** Changes discarded, original data restored

---

### 4.3 Test Professional Tab

**Test Case 4.3.1: Update Professional Info**
- **Action:** Click "Professional" tab
- **Action:** Click "Edit"
- **Action:** Fill in fields:
  - Current Role: `Senior Software Engineer`
  - Current Company: `Tech Corp`
  - Experience: `5-10 years`
  - Industry: `Technology`
  - Job Level: `Senior`
  - Employment Type: `Full-time`
  - Availability: `Available`
  - Salary Expectation: `$120,000 - $150,000`
  - Work Preference: `Remote`
- **Action:** Click "Save"
- **Expected:** Data saves successfully

---

### 4.4 Test Skills & Expertise Tab

**Test Case 4.4.1: Add Skills**
- **Action:** Click "Skills & Expertise" tab
- **Action:** Click "Add Skill"
- **Action:** Enter skill details:
  - Name: `JavaScript`
  - Proficiency: `Expert`
  - Years of Experience: `5`
- **Action:** Save
- **Expected:** Skill appears in list

**Test Case 4.4.2: Add Certification**
- **Action:** Click "Add Certification"
- **Action:** Enter:
  - Name: `AWS Certified Solutions Architect`
  - Issuer: `Amazon Web Services`
  - Date: `2024-01-15`
- **Action:** Save
- **Expected:** Certification appears in list

**Test Case 4.4.3: Add Language**
- **Action:** Click "Add Language"
- **Action:** Enter:
  - Name: `English`
  - Proficiency: `Native`
- **Action:** Save
- **Expected:** Language appears in list

---

### 4.5 Test Education Tab

**Test Case 4.5.1: Add Education**
- **Action:** Click "Education" section (may be in Professional tab)
- **Action:** Click "Add Education"
- **Action:** Enter:
  - Institution: `University of California`
  - Degree: `Bachelor's`
  - Field: `Computer Science`
  - Start Date: `2015-09-01`
  - End Date: `2019-06-01`
  - GPA: `3.8`
- **Action:** Save
- **Expected:** Education entry appears in list

---

### 4.6 Test Work Experience Tab

**Test Case 4.6.1: Add Work Experience**
- **Action:** Navigate to Professional tab or Work Experience section
- **Action:** Click "Add Work Experience"
- **Action:** Enter:
  - Company: `Tech Corp`
  - Role: `Software Engineer`
  - Start Date: `2020-01-01`
  - End Date: (leave empty for current) OR `2024-12-31`
  - Is Current: `Yes` (if end date empty)
  - Description: `Developed web applications using React and Node.js`
  - Technologies: `React, Node.js, TypeScript`
- **Action:** Save
- **Expected:** Work experience appears in list

---

### 4.7 Test Career Goals Tab

**Test Case 4.7.1: Add Career Goal**
- **Action:** Click "Career Goals" tab
- **Action:** Click "Add Career Goal"
- **Action:** Enter:
  - Title: `Become a Tech Lead`
  - Description: `Lead a team of 5+ engineers`
  - Target Date: `2025-12-31`
  - Progress: `50`
  - Category: `Role`
- **Action:** Save
- **Expected:** Career goal appears with progress indicator

**Test Case 4.7.2: Add Target Roles**
- **Action:** Add target role: `Tech Lead`
- **Expected:** Role appears in list

**Test Case 4.7.3: Add Target Companies**
- **Action:** Add target company: `Google`
- **Expected:** Company appears in list

---

### 4.8 Test Portfolio Tab

**Test Case 4.8.1: Add Project**
- **Action:** Click "Portfolio" tab
- **Action:** Click "Add Project"
- **Action:** Enter:
  - Title: `E-Commerce Platform`
  - Description: `Full-stack e-commerce solution`
  - Technologies: `React, Node.js, PostgreSQL`
  - Link: `https://github.com/user/project`
  - Date: `2024-01-01`
- **Action:** Save
- **Expected:** Project appears in portfolio

**Test Case 4.8.2: Add Achievement**
- **Action:** Click "Add Achievement"
- **Action:** Enter:
  - Title: `Best Hackathon Project`
  - Description: `Won first place in local hackathon`
  - Date: `2023-12-01`
  - Type: `Award`
- **Action:** Save
- **Expected:** Achievement appears in list

**Test Case 4.8.3: Add Social Link**
- **Action:** Add social link:
  - Platform: `LinkedIn`
  - URL: `https://linkedin.com/in/johndoe`
- **Action:** Save
- **Expected:** Link appears in list

---

### 4.9 Test Preferences Tab

**Test Case 4.9.1: Update Preferences**
- **Action:** Click "Preferences" tab
- **Action:** Toggle settings:
  - Email Notifications: `On`
  - SMS Notifications: `Off`
  - Privacy Level: `Professional`
  - Profile Visibility: `Public`
- **Action:** Save
- **Expected:** Preferences save successfully

---

### 4.10 Test Security Tab

**Test Case 4.10.1: Change Password**
- **Action:** Click "Security" tab
- **Action:** Click "Change Password"
- **Action:** Enter:
  - Current Password: `Test123!@#`
  - New Password: `NewPass123!@#`
  - Confirm Password: `NewPass123!@#`
- **Action:** Submit
- **Expected:** 
  - Success message appears
  - Password changes successfully
  - Can login with new password

**Test Case 4.10.2: Setup 2FA**
- **Action:** Click "Enable Two-Factor Authentication"
- **Expected:** 
  - QR code appears
  - Secret key displayed
  - Backup codes generated
- **Action:** Scan QR code with authenticator app (Google Authenticator, Authy)
- **Action:** Enter 6-digit code from app
- **Action:** Click "Enable"
- **Expected:** 
  - 2FA enabled successfully
  - Status shows "Enabled"

**Test Case 4.10.3: Disable 2FA**
- **Action:** Click "Disable Two-Factor Authentication"
- **Action:** Enter password and 2FA code
- **Action:** Confirm disable
- **Expected:** 2FA disabled successfully

**Test Case 4.10.4: View Active Sessions**
- **Action:** Scroll to "Login Activity" section
- **Expected:** 
  - List of active sessions appears
  - Current session marked
  - Device and browser info displayed
  - IP address shown
  - Last activity timestamp shown

**Test Case 4.10.5: Revoke Session**
- **Action:** Click "Revoke" on a non-current session
- **Expected:** Session removed from list

**Test Case 4.10.6: Revoke All Other Sessions**
- **Action:** Click "Revoke All Other Sessions"
- **Expected:** 
  - All sessions except current revoked
  - Only current session remains

---

### 4.11 Test Analytics Tab

**Test Case 4.11.1: View Analytics**
- **Action:** Click "Analytics" tab
- **Expected:** 
  - Profile completeness score displayed
  - Profile views count shown
  - Success rate displayed (if applicable)
  - Other metrics visible

**Test Case 4.11.2: Check Profile Completeness**
- **Action:** Navigate to Profile tab
- **Expected:** 
  - Completeness percentage shown
  - Progress indicator visible
  - Breakdown by section displayed

---

### 4.12 Test Help & Support Tab

**Test Case 4.12.1: View Support Options**
- **Action:** Click "Help & Support" tab
- **Expected:** 
  - Support options displayed
  - Contact information visible
  - FAQ or help links available

---

## 🔍 Step 5: API Testing (Optional - Using Postman/Thunder Client)

### 5.1 Get Profile

**Request:**
```
GET http://localhost:3001/api/users/profile
Headers:
  Cookie: session_id=<your-session-id>
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "skills": [],
    "education": [],
    ...
  }
}
```

### 5.2 Update Profile

**Request:**
```
PUT http://localhost:3001/api/users/profile
Headers:
  Cookie: session_id=<your-session-id>
  Content-Type: application/json
Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio"
}
```

**Expected Response:**
```json
{
  "user": { /* updated user object */ },
  "success": true
}
```

### 5.3 Upload Profile Picture

**Request:**
```
POST http://localhost:3001/api/users/profile/picture
Headers:
  Cookie: session_id=<your-session-id>
Body: (multipart/form-data)
  file: <image file>
```

**Expected Response:**
```json
{
  "success": true,
  "profilePicture": "data:image/jpeg;base64,...",
  "user": { /* updated user object */ }
}
```

### 5.4 Get Profile Completeness

**Request:**
```
GET http://localhost:3001/api/users/profile/completeness
Headers:
  Cookie: session_id=<your-session-id>
```

**Expected Response:**
```json
{
  "completeness": 75,
  "breakdown": {
    "basicInfo": { "score": 18, "maxScore": 20, "percentage": 90 },
    ...
  },
  "level": "Good"
}
```

### 5.5 Get Analytics

**Request:**
```
GET http://localhost:3001/api/users/profile/analytics
Headers:
  Cookie: session_id=<your-session-id>
```

**Expected Response:**
```json
{
  "profileViews": 10,
  "applicationsSent": 0,
  "interviewsScheduled": 0,
  "offersReceived": 0,
  "successRate": 0,
  "profileCompleteness": 75,
  "skillMatchRate": 0,
  "avgResponseTime": 0
}
```

### 5.6 Get Sessions

**Request:**
```
GET http://localhost:3001/api/users/sessions
Headers:
  Cookie: session_id=<your-session-id>
```

**Expected Response:**
```json
{
  "sessions": [
    {
      "id": "...",
      "device": "Desktop (Chrome)",
      "ipAddress": "127.0.0.1",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActivity": "2024-01-01T12:00:00Z",
      "isCurrent": true
    }
  ]
}
```

### 5.7 Setup 2FA

**Request:**
```
POST http://localhost:3001/api/auth/2fa/setup
Headers:
  Cookie: session_id=<your-session-id>
```

**Expected Response:**
```json
{
  "success": true,
  "secret": "BASE32SECRET",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["code1", "code2", ...]
}
```

### 5.8 Change Password

**Request:**
```
PUT http://localhost:3001/api/auth/password
Headers:
  Cookie: session_id=<your-session-id>
  Content-Type: application/json
Body:
{
  "currentPassword": "Test123!@#",
  "newPassword": "NewPass123!@#",
  "confirmPassword": "NewPass123!@#"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🐛 Step 6: Error Testing

### 6.1 Test Invalid Data

**Test Case 6.1.1: Invalid Email**
- **Action:** Try to update email with invalid format: `invalid-email`
- **Expected:** Error message: "Invalid email format"

**Test Case 6.1.2: Invalid File Type**
- **Action:** Try to upload non-image file (e.g., .pdf, .txt)
- **Expected:** Error message: "Invalid file type. Only images are allowed."

**Test Case 6.1.3: File Too Large**
- **Action:** Try to upload image > 5MB
- **Expected:** Error message: "File too large (max 5MB)"

**Test Case 6.1.4: Weak Password**
- **Action:** Try to change password to weak password: `123`
- **Expected:** Error message: "Password must be at least 8 characters with uppercase, lowercase, and number"

**Test Case 6.1.5: Password Mismatch**
- **Action:** Change password with mismatched confirmation
- **Expected:** Error message: "New password and confirmation do not match"

### 6.2 Test Unauthorized Access

**Test Case 6.2.1: Access Profile Without Login**
- **Action:** Logout, then try to access profile page
- **Expected:** Redirected to login page

**Test Case 6.2.2: API Call Without Auth**
- **Action:** Make API call without session cookie
- **Expected:** 401 Unauthorized response

---

## ✅ Step 7: Data Persistence Testing

### 7.1 Test Data Persistence

**Test Case 7.1.1: Refresh Page**
- **Action:** Update profile data
- **Action:** Refresh page (F5)
- **Expected:** Data persists, not lost

**Test Case 7.1.2: Logout and Login**
- **Action:** Update profile data
- **Action:** Logout
- **Action:** Login again
- **Expected:** Profile data still there

**Test Case 7.1.3: Multiple Devices**
- **Action:** Update profile on device 1
- **Action:** Check profile on device 2 (same account)
- **Expected:** Changes visible on device 2

---

## 📊 Step 8: Performance Testing

### 8.1 Test Large Data Sets

**Test Case 8.1.1: Many Skills**
- **Action:** Add 50+ skills
- **Expected:** UI remains responsive, saves successfully

**Test Case 8.1.2: Many Work Experiences**
- **Action:** Add 20+ work experiences
- **Expected:** UI remains responsive, saves successfully

**Test Case 8.1.3: Large Bio**
- **Action:** Enter bio with 5000+ characters
- **Expected:** Saves successfully, displays correctly

---

## 🎯 Step 9: Completeness Testing

### 9.1 Test Profile Completeness Calculation

**Test Case 9.1.1: Empty Profile**
- **Action:** Create new account, check completeness
- **Expected:** Completeness ~0-10%

**Test Case 9.1.2: Partial Profile**
- **Action:** Fill basic info only
- **Expected:** Completeness ~20-30%

**Test Case 9.1.3: Complete Profile**
- **Action:** Fill all sections
- **Expected:** Completeness ~90-100%

---

## 📝 Testing Checklist

Use this checklist to track your testing progress:

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Logout works
- [ ] Session persists after refresh

### Profile Tab
- [ ] View profile data
- [ ] Edit profile (basic info)
- [ ] Save profile changes
- [ ] Cancel edit discards changes
- [ ] Upload profile picture
- [ ] Profile picture displays correctly

### Professional Tab
- [ ] Update professional information
- [ ] All fields save correctly

### Skills Tab
- [ ] Add skill
- [ ] Edit skill
- [ ] Delete skill
- [ ] Add certification
- [ ] Add language

### Education
- [ ] Add education entry
- [ ] Edit education entry
- [ ] Delete education entry

### Work Experience
- [ ] Add work experience
- [ ] Edit work experience
- [ ] Delete work experience
- [ ] Mark as current role

### Career Goals
- [ ] Add career goal
- [ ] Update progress
- [ ] Add target roles
- [ ] Add target companies

### Portfolio
- [ ] Add project
- [ ] Add achievement
- [ ] Add social link

### Preferences
- [ ] Update notification settings
- [ ] Update privacy settings
- [ ] Settings persist

### Security
- [ ] Change password
- [ ] Setup 2FA
- [ ] Enable 2FA
- [ ] Disable 2FA
- [ ] View sessions
- [ ] Revoke session
- [ ] Revoke all sessions

### Analytics
- [ ] View analytics
- [ ] Completeness score updates
- [ ] Metrics display correctly

### Error Handling
- [ ] Invalid email format rejected
- [ ] Invalid file type rejected
- [ ] File too large rejected
- [ ] Weak password rejected
- [ ] Unauthorized access blocked

### Data Persistence
- [ ] Data persists on refresh
- [ ] Data persists after logout/login
- [ ] Data syncs across devices

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
- Check if database is running
- Verify `DATABASE_URL` in `.env`
- Run `npx prisma generate` and `npx prisma migrate dev`

### Issue: Frontend can't connect to backend
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running on port 3001
- Check CORS settings

### Issue: Profile picture won't upload
**Solution:**
- Check file size (< 5MB)
- Check file type (JPG, PNG, GIF, WEBP)
- Check backend logs for errors

### Issue: Changes don't persist
**Solution:**
- Check browser console for errors
- Verify API calls succeed (Network tab)
- Check backend logs

### Issue: 2FA QR code doesn't appear
**Solution:**
- Check backend logs for errors
- Verify `speakeasy` and `qrcode` packages installed
- Check browser console for errors

---

## 📊 Expected Test Results

After completing all tests, you should have:

✅ **All profile CRUD operations working**
✅ **All security features functional**
✅ **Data persisting correctly**
✅ **Error handling working**
✅ **Performance acceptable**
✅ **Profile completeness calculating correctly**

---

## 🎉 Success Criteria

The profile feature is working correctly if:

1. ✅ All 8 tabs load and display correctly
2. ✅ All form fields save and persist
3. ✅ Profile picture uploads and displays
4. ✅ Password change works
5. ✅ 2FA setup and enable/disable works
6. ✅ Session management works
7. ✅ Profile completeness calculates correctly
8. ✅ Analytics display correctly
9. ✅ No console errors
10. ✅ No API errors

---

**Happy Testing! 🚀**

If you encounter any issues, check the browser console and backend logs for error messages.

