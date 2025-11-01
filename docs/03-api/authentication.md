# Authentication Guide

## Overview

RoleReady uses JWT (JSON Web Tokens) authentication with httpOnly cookies for security.

---

## Architecture

### Token Types

1. **Access Token** (short-lived, 15 minutes)
   - Stored in httpOnly cookie: `auth_token`
   - Used for all authenticated requests

2. **Refresh Token** (long-lived, 7 days)
   - Stored in httpOnly cookie: `refresh_token`
   - Used to obtain new access tokens

3. **Session Token** (30 days)
   - Stored in httpOnly cookie: `session_id`
   - Tracks active sessions

---

## Authentication Flow

### 1. Registration

```typescript
POST /api/auth/register

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**What happens:**
1. Password is hashed with bcrypt
2. User is created in database
3. JWT tokens are generated
4. Tokens are set in httpOnly cookies
5. User object is returned

### 2. Login

```typescript
POST /api/auth/login

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**What happens:**
1. Email/password verified
2. JWT tokens generated
3. Session created in database
4. Tokens set in httpOnly cookies
5. User returned

### 3. Authenticated Requests

All subsequent requests automatically include cookies:

```typescript
GET /api/users/profile
Cookie: auth_token=<jwt>; refresh_token=<token>; session_id=<id>
```

### 4. Token Refresh

If access token expires (15 minutes):

```typescript
POST /api/auth/refresh
Cookie: refresh_token=<token>
```

Returns new access token.

### 5. Logout

```typescript
POST /api/auth/logout
```

**What happens:**
1. Cookies cleared
2. Session deactivated in database
3. All refresh tokens deleted

---

## Frontend Integration

### AuthContext

**File:** `apps/web/src/contexts/AuthContext.tsx`

```typescript
const { user, login, signup, logout, isLoading } = useAuth();

// Login
await login('john@example.com', 'password');

// Signup
await signup('John Doe', 'john@example.com', 'password');

// Logout
await logout();
```

### Protected Routes

```typescript
// In middleware
if (!user && pathname !== '/login') {
  redirect('/login');
}
```

### Automatic Token Refresh

Tokens are automatically refreshed when expired:

```typescript
// In apiService
if (response.status === 401) {
  const refreshed = await fetch('/api/auth/refresh', {
    credentials: 'include'
  });
  
  if (refreshed.ok) {
    // Retry original request
  }
}
```

---

## Security Features

### httpOnly Cookies

Cookies are httpOnly, meaning JavaScript cannot access them:

```javascript
// ❌ This returns null
document.cookie  // Can't see auth_token

// ✅ Only HTTP requests work
fetch('/api/users/profile', { credentials: 'include' })
```

### SameSite Protection

Cookies use `sameSite: 'lax'` to prevent CSRF attacks.

### Secure in Production

In production, cookies are marked `secure: true` (HTTPS only).

### Password Hashing

- **Algorithm:** bcrypt with salt rounds: 10
- **Verification:** bcrypt.compare

### Session Management

- **Active sessions** tracked in database
- **Last activity** timestamp
- **Device/IP** logged for security

---

## 2FA (Two-Factor Authentication)

### Setup

```typescript
POST /api/auth/2fa/setup
```

Returns QR code for authenticator app.

### Enable

```typescript
POST /api/auth/2fa/enable
{
  "token": "123456"
}
```

### Login with 2FA

```typescript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password"
}

// Response: requires2FA: true

POST /api/auth/2fa/verify
{
  "token": "123456"
}
```

---

## Password Reset

### Request Reset

```typescript
POST /api/auth/forgot-password
{
  "email": "john@example.com"
}
```

Sends password reset email.

### Reset Password

```typescript
POST /api/auth/reset-password
{
  "token": "reset_token",
  "password": "NewPassword123!"
}
```

---

## Session Management

### Get Active Sessions

```typescript
GET /api/auth/sessions
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_id",
      "device": "Chrome on Mac",
      "ipAddress": "192.168.1.1",
      "lastActivity": "2025-01-31T10:00:00Z"
    }
  ]
}
```

### Deactivate All Sessions

```typescript
POST /api/auth/sessions/deactivate-all
```

### Deactivate Specific Session

```typescript
DELETE /api/auth/sessions/:id
```

---

## Error Handling

### Common Errors

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**Invalid credentials:**
```json
{
  "error": "Invalid email or password"
}
```

**Token expired:**
```json
{
  "error": "Token expired"
}
```

**Rate limit exceeded:**
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Best Practices

### For Frontend

1. **Never store tokens in localStorage**
   - Always use httpOnly cookies
   - Let browser handle security

2. **Handle token refresh automatically**
   - Check for 401 responses
   - Retry after refresh

3. **Show loading states**
   - While verifying session on mount
   - During login/signup

4. **Clear state on logout**
   - Clear user state
   - Redirect to login

### For Backend

1. **Always verify JWT**
   - Check signature
   - Validate expiration
   - Verify user exists

2. **Log all auth events**
   - Failed logins
   - Token refresh attempts
   - Session changes

3. **Rate limit auth endpoints**
   - Prevent brute force
   - Slow down attackers

---

## Testing

### Test Authentication

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' \
  -c cookies.txt

# Access protected route
curl http://localhost:3001/api/users/profile \
  -b cookies.txt
```

---

## Next Steps

- [API Reference](./api-reference.md)
- [Integration Guide](./integration-guide.md)
- [Security Documentation](../08-security/security.md)

