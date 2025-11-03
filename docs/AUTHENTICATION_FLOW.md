# Authentication Flow Documentation

## Overview

Yes, users **CAN** log in with the same email and password after creating an account. The authentication system is fully implemented and working.

## How It Works

### 1. User Registration (`/api/auth/register`)

When a user creates an account:
- Email, password, and name are validated
- Password is **hashed** using bcrypt and stored securely
- User record is created in the `users` table with:
  - `email` (unique)
  - `password` (hashed)
  - `name`
  - `provider: 'local'`
- JWT tokens are generated and stored in httpOnly cookies
- Session is created (persists until logout)

### 2. User Login (`/api/auth/login`)

When a user logs in:
- Email and password are sent to `/api/auth/login`
- System finds user by email in database
- Password is **verified** against stored hash using `verifyPassword()`
- If valid:
  - JWT tokens are generated
  - Session is created/refreshed
  - User is authenticated
- If invalid:
  - Returns 401 "Invalid credentials"

### 3. Password Storage

- Passwords are **never stored in plain text**
- They are hashed using `bcrypt` before storage
- Original password cannot be retrieved (one-way hash)
- Login compares hash of provided password with stored hash

## Database Schema: Single Table Design

### Why One Table?

The `User` table contains **all user-related data**:

1. **Authentication Fields:**
   - `id`, `email`, `password`, `provider`, `providerId`

2. **Profile Fields:**
   - Basic: `name`, `firstName`, `lastName`, `phone`, `location`, `bio`
   - Professional: `currentRole`, `currentCompany`, `experience`, etc.
   - JSON Arrays: `skills`, `workExperiences`, `education`, etc.

3. **Preferences:**
   - `emailNotifications`, `smsNotifications`, `privacyLevel`, etc.

4. **Security:**
   - `twoFactorEnabled`, `twoFactorSecret`, `twoFactorBackupCodes`

5. **Relations:**
   - `refreshTokens`, `sessions`, `passwordResetTokens`

### Benefits of Single Table:

- ✅ **Simpler queries** - Get all user data in one query
- ✅ **No joins needed** - Faster performance
- ✅ **Atomic updates** - Profile and auth data stay in sync
- ✅ **Easier to understand** - One source of truth
- ✅ **Better for small-medium apps** - No complex relationships

### Trade-offs:

- ⚠️ Table can get wide (many columns)
- ⚠️ JSON fields used for arrays (acceptable for this use case)
- ⚠️ Some fields may be null for users who haven't filled profiles

## Authentication Flow Diagram

```
Registration:
User → POST /api/auth/register → Validate → Hash Password → Create User → Generate Tokens → Set Cookies → Success

Login:
User → POST /api/auth/login → Find User → Verify Password → Generate Tokens → Set Cookies → Success

Subsequent Requests:
User → Request with Cookie → Verify JWT → Extract userId → Access Protected Routes
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Short-lived access tokens (15 min) + refresh tokens (7 days)
3. **httpOnly Cookies**: Tokens stored in httpOnly cookies (not accessible via JavaScript)
4. **Session Management**: Sessions persist until explicit logout (10 year expiration)
5. **Authentication Middleware**: All profile routes require valid JWT token
6. **User Isolation**: Users can ONLY access/modify their own profile data

## Testing Login

To verify login works:

1. **Register a new user:**
   ```bash
   POST http://localhost:3001/api/auth/register
   {
     "email": "test@example.com",
     "password": "Password123",
     "name": "Test User"
   }
   ```

2. **Login with same credentials:**
   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "test@example.com",
     "password": "Password123"
   }
   ```

3. **Access profile:**
   ```bash
   GET http://localhost:3001/api/users/profile
   # (with auth_token cookie from login)
   ```

## Files Involved

- **Backend Auth**: `apps/api/auth.js` - Registration and authentication logic
- **Backend Routes**: `apps/api/routes/auth.routes.js` - API endpoints
- **Frontend Auth**: `apps/web/src/contexts/AuthContext.tsx` - Login/signup functions
- **Database Schema**: `apps/api/prisma/schema.prisma` - User table definition
- **Security Utils**: `apps/api/utils/security.js` - Password hashing/verification

## Conclusion

✅ **Login IS implemented** - Users can log in with email/password anytime  
✅ **Single table design** - All user data in one `User` table for simplicity and performance  
✅ **Secure** - Passwords are hashed, tokens are secure, users are isolated

