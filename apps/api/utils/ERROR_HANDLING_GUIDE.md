# Error Handling Guide

## Overview

This guide explains how to use the standardized error response utility (`errorResponses.js`) to ensure consistent error handling across all API endpoints.

## Why Standardize Error Responses?

**Benefits:**
- ✅ Consistent error format across all endpoints
- ✅ Machine-readable error codes for frontend handling
- ✅ Better debugging with structured error details
- ✅ Improved API documentation
- ✅ Easier error tracking and monitoring

## Error Response Format

All error responses follow this standard format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "additionalInfo"
  }
}
```

## Quick Start

### Import the Utility

```javascript
const { ErrorResponses, asyncHandler } = require('../utils/errorResponses');
```

### Basic Usage

```javascript
// Before (inconsistent):
return reply.status(400).send({ error: 'Bad request' });
return reply.status(404).send({ message: 'Not found' });
return reply.status(401).send({ success: false, error: 'Unauthorized' });

// After (standardized):
return ErrorResponses.badRequest(reply, 'Invalid input data');
return ErrorResponses.notFound(reply, 'User');
return ErrorResponses.unauthorized(reply);
```

## Common Error Responses

### Authentication Errors (401)

```javascript
// Generic authentication required
ErrorResponses.unauthorized(reply);
// Output: { success: false, error: "Authentication required", code: "AUTH_REQUIRED" }

// Invalid credentials
ErrorResponses.invalidCredentials(reply);
// Output: { success: false, error: "Invalid email or password", code: "AUTH_INVALID_CREDENTIALS" }

// Expired token
ErrorResponses.tokenExpired(reply);
// Output: { success: false, error: "Token has expired", code: "AUTH_TOKEN_EXPIRED" }

// Invalid token
ErrorResponses.tokenInvalid(reply);
// Output: { success: false, error: "Invalid token", code: "AUTH_TOKEN_INVALID" }
```

### Validation Errors (400, 422)

```javascript
// Generic bad request
ErrorResponses.badRequest(reply, 'Invalid request data');

// Validation failed
ErrorResponses.validationError(reply, 'Validation failed', {
  errors: ['Email is required', 'Password too short']
});

// Missing required field
ErrorResponses.missingField(reply, 'email');
// Output: { success: false, error: "Missing required field: email", code: "VALIDATION_MISSING_FIELD" }

// Invalid format
ErrorResponses.invalidFormat(reply, 'email', 'user@example.com');
// Output: { success: false, error: "Invalid format for email. Expected: user@example.com" }
```

### Resource Errors (404, 409)

```javascript
// Resource not found
ErrorResponses.notFound(reply, 'User');
// Output: { success: false, error: "User not found", code: "RESOURCE_NOT_FOUND" }

// Resource already exists (conflict)
ErrorResponses.conflict(reply, 'Email already registered');
// Output: { success: false, error: "Email already registered", code: "RESOURCE_ALREADY_EXISTS" }
```

### Permission Errors (403)

```javascript
// Insufficient permissions
ErrorResponses.forbidden(reply, 'You do not have permission to delete this resource');
```

### Rate Limiting (429)

```javascript
// Rate limit exceeded
ErrorResponses.rateLimitExceeded(reply);
// Output: { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" }
```

### Server Errors (500)

```javascript
// Generic internal error
ErrorResponses.internalError(reply, 'Something went wrong');

// Database error
ErrorResponses.databaseError(reply);
// Output: { success: false, error: "Database error occurred", code: "DATABASE_ERROR" }

// External service error
ErrorResponses.externalServiceError(reply, 'OpenAI API');
// Output: { success: false, error: "OpenAI API error", code: "EXTERNAL_SERVICE_ERROR" }
```

## Async Handler Wrapper

Use `asyncHandler` to automatically catch and format errors:

```javascript
// Before:
fastify.post('/api/users', async (request, reply) => {
  try {
    const user = await createUser(request.body);
    return reply.send({ success: true, data: user });
  } catch (error) {
    console.error('Error:', error);
    return reply.status(500).send({ error: error.message });
  }
});

// After:
fastify.post('/api/users', asyncHandler(async (request, reply) => {
  const user = await createUser(request.body);
  return reply.send({ success: true, data: user });
}));
```

The `asyncHandler` automatically:
- Catches all errors
- Logs errors to console
- Returns standardized error responses
- Handles Prisma database errors (codes starting with 'P')
- Preserves custom error codes and status codes

## Real-World Examples

### Example 1: Login Endpoint

```javascript
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body;

  // Validation
  if (!email) {
    return ErrorResponses.missingField(reply, 'email');
  }
  if (!password) {
    return ErrorResponses.missingField(reply, 'password');
  }

  // Authenticate
  const user = await authenticateUser(email, password);
  if (!user) {
    return ErrorResponses.invalidCredentials(reply);
  }

  // Success response
  return reply.send({
    success: true,
    data: { user, token }
  });
});
```

### Example 2: Get User Endpoint

```javascript
fastify.get('/api/users/:id', asyncHandler(async (request, reply) => {
  const { id } = request.params;

  const user = await getUserById(id);
  if (!user) {
    return ErrorResponses.notFound(reply, 'User');
  }

  return reply.send({
    success: true,
    data: user
  });
}));
```

### Example 3: Update Resource Endpoint

```javascript
fastify.put('/api/posts/:id', asyncHandler(async (request, reply) => {
  const { id } = request.params;
  const userId = request.user.id;

  const post = await getPostById(id);
  if (!post) {
    return ErrorResponses.notFound(reply, 'Post');
  }

  if (post.authorId !== userId) {
    return ErrorResponses.forbidden(reply, 'You can only edit your own posts');
  }

  const updated = await updatePost(id, request.body);
  return reply.send({
    success: true,
    data: updated
  });
}));
```

## Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | Token has expired |
| `AUTH_TOKEN_INVALID` | 401 | Invalid token |
| `AUTH_INSUFFICIENT_PERMISSIONS` | 403 | Insufficient permissions |
| `VALIDATION_FAILED` | 422 | Validation failed |
| `VALIDATION_MISSING_FIELD` | 422 | Required field missing |
| `VALIDATION_INVALID_FORMAT` | 422 | Invalid field format |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource already exists |
| `RESOURCE_CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database error |
| `EXTERNAL_SERVICE_ERROR` | 500 | External service error |

## Frontend Integration

Frontend can handle errors consistently:

```typescript
try {
  const response = await apiService.login(email, password);
} catch (error: any) {
  switch (error.code) {
    case 'AUTH_INVALID_CREDENTIALS':
      toast.error('Invalid email or password');
      break;
    case 'RATE_LIMIT_EXCEEDED':
      toast.error('Too many attempts. Please try again later.');
      break;
    case 'VALIDATION_MISSING_FIELD':
      toast.error(`Missing required field: ${error.details?.field}`);
      break;
    default:
      toast.error(error.message || 'An error occurred');
  }
}
```

## Migration Guide

### Step 1: Import the utility

```javascript
const { ErrorResponses, asyncHandler } = require('../utils/errorResponses');
```

### Step 2: Replace error responses

Find and replace patterns:

```javascript
// Replace:
reply.status(400).send({ error: 'message' })
// With:
ErrorResponses.badRequest(reply, 'message')

// Replace:
reply.status(401).send({ error: 'Unauthorized' })
// With:
ErrorResponses.unauthorized(reply)

// Replace:
reply.status(404).send({ error: 'Not found' })
// With:
ErrorResponses.notFound(reply, 'ResourceName')

// Replace:
reply.status(500).send({ error: 'Internal error' })
// With:
ErrorResponses.internalError(reply)
```

### Step 3: Wrap async handlers (optional but recommended)

```javascript
// Before:
fastify.get('/api/resource', async (request, reply) => {
  try {
    // handler logic
  } catch (error) {
    // error handling
  }
});

// After:
fastify.get('/api/resource', asyncHandler(async (request, reply) => {
  // handler logic (try-catch removed, handled automatically)
}));
```

## Best Practices

1. **Always use ErrorResponses helpers** instead of manual reply.status().send()
2. **Provide specific error messages** that help users understand what went wrong
3. **Include details** for validation errors to show which fields are problematic
4. **Use asyncHandler** for async routes to reduce boilerplate
5. **Log errors** before sending responses for debugging
6. **Don't expose sensitive information** in error messages (e.g., database structure)
7. **Use appropriate HTTP status codes** - the helpers do this automatically

## Testing

Test error responses:

```javascript
const response = await fastify.inject({
  method: 'POST',
  url: '/api/auth/login',
  payload: { email: 'invalid@test.com', password: 'wrong' }
});

expect(response.statusCode).toBe(401);
expect(response.json()).toEqual({
  success: false,
  error: 'Invalid email or password',
  code: 'AUTH_INVALID_CREDENTIALS'
});
```

## Support

For questions or improvements, refer to:
- `apps/api/utils/errorResponses.js` - Source code
- `apps/api/routes/auth.routes.js` - Usage examples
