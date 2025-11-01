# Frontend-Backend Integration Guide

## Overview

This guide explains how the frontend components connect to the backend API.

---

## Architecture

```
Next.js Frontend (port 3000)
    ↓ apiService
Node.js API (port 3001)
    ├─ Database operations
    ├─ Authentication
    └─ AI requests → Python API (port 8000)
```

---

## How It Works

### 1. Centralized API Service

**File:** `apps/web/src/services/apiService.ts`

All API calls go through this service:

```typescript
import apiService from '@/services/apiService';

// Example: Get user profile
const profile = await apiService.getUserProfile();

// Example: Create resume
const resume = await apiService.saveResume({
  name: "My Resume",
  data: resumeData
});
```

### 2. Automatic Authentication

The `apiService` automatically includes credentials:

```typescript
fetch('/api/users/profile', {
  credentials: 'include'  // Sends httpOnly cookies
});
```

### 3. Error Handling

Centralized error handling:

```typescript
try {
  const result = await apiService.getJobs();
} catch (error) {
  // Automatic error handling
  // Logging, user notifications, etc.
}
```

---

## Integration Points

### Authentication

**Context:** `apps/web/src/contexts/AuthContext.tsx`

```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  setUser(data.user);
};
```

### User Profile

**Component:** `apps/web/src/components/Profile.tsx`

```typescript
useEffect(() => {
  const loadProfile = async () => {
    const response = await apiService.getUserProfile();
    setProfileData(response.user);
  };
  loadProfile();
}, []);

const handleSave = async () => {
  await apiService.updateUserProfile(profileData);
  toast.success('Profile saved');
};
```

### Resume Builder

**Hook:** `apps/web/src/hooks/useResumeData.ts`

```typescript
// Load resume on mount
useEffect(() => {
  const loadResume = async () => {
    const response = await apiService.getResumes();
    const resume = response.resumes[0];
    setResumeData(JSON.parse(resume.data));
    setCurrentResumeId(resume.id);
  };
  loadResume();
}, []);

// Auto-save every 30 seconds
useEffect(() => {
  if (hasChanges && currentResumeId) {
    const timer = setTimeout(async () => {
      await apiService.updateResume(currentResumeId, {
        data: JSON.stringify(resumeData)
      });
      setHasChanges(false);
    }, 30000);
    return () => clearTimeout(timer);
  }
}, [resumeData, currentResumeId, hasChanges]);
```

### Job Tracker

**Hook:** `apps/web/src/hooks/useJobsApi.ts`

```typescript
// Load jobs
useEffect(() => {
  const loadJobs = async () => {
    const response = await apiService.getJobs();
    setJobs(response.jobs);
  };
  loadJobs();
}, []);

// Add job
const addJob = async (job: Omit<Job, 'id'>) => {
  const response = await apiService.saveJob(job);
  setJobs(prev => [...prev, response.job]);
};

// Update job
const updateJob = async (id: string, updates: Partial<Job>) => {
  await apiService.updateJob(id, updates);
  setJobs(prev => prev.map(job => 
    job.id === id ? { ...job, ...updates } : job
  ));
};
```

### Cover Letters

**Component:** `apps/web/src/components/CoverLetterGenerator.tsx`

```typescript
// Load recent draft
useEffect(() => {
  const loadDraft = async () => {
    const response = await apiService.getCoverLetters();
    const latest = response.coverLetters[0];
    setContent(latest.content);
    setDraftId(latest.id);
  };
  loadDraft();
}, []);

// Auto-save
useEffect(() => {
  if (draftId && content) {
    const timer = setTimeout(async () => {
      await apiService.updateCoverLetter(draftId, {
        content, title, wordCount
      });
    }, 30000);
    return () => clearTimeout(timer);
  }
}, [content, draftId]);
```

### AI Features

**Service:** `apps/web/src/services/aiService.ts`

```typescript
// AI generation goes through Node.js proxy
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ prompt, context, model })
});

// Node.js API proxies to Python API
// Python API calls OpenAI
```

**Flow:**
```
Frontend → Node.js API (ai.routes.js) → Python API → OpenAI
```

---

## Data Flow Examples

### Creating a New Resume

1. **User clicks "New Resume"**
   ```typescript
   // apps/web/src/app/dashboard/page.tsx
   const handleNewResume = async () => {
     const response = await apiService.saveResume({
       name: `New Resume ${Date.now()}`,
       data: JSON.stringify(emptyResume),
       templateId: selectedTemplate
     });
     setCurrentResumeId(response.resume.id);
   };
   ```

2. **Request sent:**
   ```http
   POST /api/resumes
   Cookie: auth_token=<jwt>
   
   {
     "name": "New Resume",
     "data": "{...}",
     "templateId": "modern"
   }
   ```

3. **Backend processes:**
   ```javascript
   // apps/api/routes/resumes.routes.js
   fastify.post('/api/resumes', async (request, reply) => {
     const resume = await createResume(userId, request.body);
     return { success: true, resume };
   });
   ```

4. **Database stores:**
   ```javascript
   // apps/api/utils/resumes.js
   const resume = await prisma.resume.create({
     data: {
       userId,
       name: "New Resume",
       data: "{...}",
       templateId: "modern"
     }
   });
   ```

5. **Frontend updates:**
   - Local state updated
   - UI reflects new resume
   - Ready for editing

---

## State Management

### Local State vs Backend

**Always use local state first:**
```typescript
const [resumeData, setResumeData] = useState(initialData);

// Update local state immediately for instant UI
setResumeData(newData);

// Then save to backend in background
apiService.updateResume(id, newData);
```

**For optimistic updates:**
```typescript
// Update UI immediately
setJobs(prev => prev.map(job => 
  job.id === id ? { ...job, ...updates } : job
));

// Sync to backend
await apiService.updateJob(id, updates);
```

---

## Error Handling

### Standard Pattern

```typescript
try {
  const response = await apiService.someOperation();
  toast.success('Success!');
} catch (error) {
  logger.error('Operation failed:', error);
  toast.error('Operation failed');
  throw error;
}
```

### Retry Logic

```typescript
// Auto-retry on 401 (token refresh)
if (response.status === 401) {
  await refreshToken();
  return retryOriginalRequest();
}
```

---

## Performance

### Caching

**No client-side caching yet**, but planned:
- Cache user profile
- Cache recent resumes
- Cache job list

### Debouncing

**Auto-save is debounced:**
```typescript
// Auto-save waits 30s after last change
useEffect(() => {
  const timer = setTimeout(() => {
    saveToBackend();
  }, 30000);
  
  return () => clearTimeout(timer);
}, [data]);
```

### Pagination

**Large lists are paginated:**
```typescript
// Future: Add pagination
GET /api/jobs?page=1&limit=50
```

---

## Testing Integration

### Mocking API Calls

```typescript
// In tests
jest.mock('@/services/apiService', () => ({
  getUserProfile: jest.fn().mockResolvedValue({ user: mockUser })
}));
```

### E2E Tests

```typescript
// Playwright test
test('can create and save resume', async ({ page }) => {
  await page.goto('/dashboard');
  await page.fill('#resume-name', 'Test Resume');
  await page.click('button:has-text("Save")');
  
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

---

## Next Steps

- [API Reference](./api-reference.md)
- [Authentication Guide](./authentication.md)
- [Architecture Documentation](../05-architecture/system-overview.md)

