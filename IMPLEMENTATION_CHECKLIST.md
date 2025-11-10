# RoleRabbit - Implementation Checklist (Small Steps)

**How to use:** Check off each item as you complete it. Each task = 15-30 minutes max.

---

## 🚨 PHASE 0: CRITICAL SECURITY FIXES (DAY 1 - 4 HOURS)

### Task 0.1: Remove Exposed Credentials (30 mins)

- [ ] **Step 1:** Delete file `apps/api/temp-check-resume.js`
- [ ] **Step 2:** Run `git status` to confirm deletion
- [ ] **Step 3:** Commit: `git commit -m "Delete file with exposed credentials"`
- [ ] **Step 4:** Log into Supabase dashboard
- [ ] **Step 5:** Navigate to Database Settings
- [ ] **Step 6:** Click "Reset Database Password"
- [ ] **Step 7:** Generate new strong password (use password manager)
- [ ] **Step 8:** Update `.env` file with new password
- [ ] **Step 9:** Update production environment variables
- [ ] **Step 10:** Test database connection locally
- [ ] **Step 11:** Clean git history: `git filter-branch --tree-filter 'rm -f apps/api/temp-check-resume.js' HEAD`
- [ ] **Step 12:** Force push to backup branch (not main)

### Task 0.2: Enable CSRF Protection (30 mins)

**File:** `apps/api/server.js`

- [ ] **Step 1:** Open `apps/api/server.js`
- [ ] **Step 2:** Find line 155 (after CORS registration)
- [ ] **Step 3:** Add this code after line 155:
```javascript
// Register CSRF Protection
fastify.register(require('@fastify/csrf-protection'), {
  cookieKey: process.env.CSRF_SECRET || require('crypto').randomBytes(32).toString('hex'),
  cookieOpts: { signed: true, httpOnly: true, sameSite: 'strict' }
});
```
- [ ] **Step 4:** Add to `.env`: `CSRF_SECRET=<generate-random-string>`
- [ ] **Step 5:** Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Restart API server: `npm run dev:api`
- [ ] **Step 8:** Test POST endpoint with Postman/curl
- [ ] **Step 9:** Verify CSRF token in response headers
- [ ] **Step 10:** Commit: `git commit -m "Enable CSRF protection"`

### Task 0.3: Fix Build Error Bypass (1 hour)

**File:** `apps/web/next.config.js`

- [ ] **Step 1:** Open `apps/web/next.config.js`
- [ ] **Step 2:** Find line 24: `ignoreBuildErrors: true`
- [ ] **Step 3:** Delete that entire line
- [ ] **Step 4:** Save file
- [ ] **Step 5:** Run: `cd apps/web && npm run build`
- [ ] **Step 6:** Note all TypeScript errors in a file
- [ ] **Step 7:** Fix first error (usually missing types)
- [ ] **Step 8:** Run build again
- [ ] **Step 9:** Repeat until build succeeds
- [ ] **Step 10:** Run: `npm run type-check` to verify
- [ ] **Step 11:** Commit: `git commit -m "Fix TypeScript errors and enable build validation"`

### Task 0.4: Add Auth Rate Limiting (1 hour)

**File:** `apps/api/routes/auth.routes.js`

- [ ] **Step 1:** Open `apps/api/routes/auth.routes.js`
- [ ] **Step 2:** Find line ~40 where login route is defined
- [ ] **Step 3:** Change from:
```javascript
fastify.post('/api/auth/login', loginHandler);
```
- [ ] **Step 4:** Change to:
```javascript
fastify.post('/api/auth/login', {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes'
    }
  }
}, loginHandler);
```
- [ ] **Step 5:** Do same for `/api/auth/register` route
- [ ] **Step 6:** Do same for `/api/auth/2fa/verify` route
- [ ] **Step 7:** Do same for `/api/auth/forgot-password` route
- [ ] **Step 8:** Save file
- [ ] **Step 9:** Restart server
- [ ] **Step 10:** Test: Try logging in 6 times quickly
- [ ] **Step 11:** Verify you get rate limit error on 6th attempt
- [ ] **Step 12:** Commit: `git commit -m "Add rate limiting to auth endpoints"`

### Task 0.5: Fix Docker Default Passwords (30 mins)

**File:** `docker-compose.yml`

- [ ] **Step 1:** Open `docker-compose.yml`
- [ ] **Step 2:** Find line 12: `POSTGRES_PASSWORD: roleready_password`
- [ ] **Step 3:** Change to: `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}`
- [ ] **Step 4:** Find JWT secret placeholder
- [ ] **Step 5:** Change to: `JWT_SECRET: ${JWT_SECRET}`
- [ ] **Step 6:** Create `.env.docker` file in root
- [ ] **Step 7:** Add: `POSTGRES_PASSWORD=<generate-strong-password>`
- [ ] **Step 8:** Add: `JWT_SECRET=<generate-64-char-hex>`
- [ ] **Step 9:** Update `.env.example` with these variables
- [ ] **Step 10:** Add `.env.docker` to `.gitignore`
- [ ] **Step 11:** Test: `docker-compose up`
- [ ] **Step 12:** Commit: `git commit -m "Remove default passwords from Docker config"`

**✅ PHASE 0 COMPLETE - Commit and push all changes**

---

## 🔐 PHASE 1: AUTHENTICATION FIXES (DAY 2 - 6 HOURS)

### Task 1.1: Reduce JWT Expiration (1 hour)

**File:** `apps/api/routes/auth.routes.js`

- [ ] **Step 1:** Open `apps/api/routes/auth.routes.js`
- [ ] **Step 2:** Find line ~47: `expiresIn: '365d'`
- [ ] **Step 3:** Change to: `expiresIn: '1h'`
- [ ] **Step 4:** Find the login handler function
- [ ] **Step 5:** After creating JWT, add refresh token creation:
```javascript
const refreshToken = await createRefreshToken(user.id, '7d');
```
- [ ] **Step 6:** Return both tokens:
```javascript
return { token, refreshToken, user };
```
- [ ] **Step 7:** Save file
- [ ] **Step 8:** Open `apps/web/src/services/authService.ts`
- [ ] **Step 9:** Update login to store refreshToken
- [ ] **Step 10:** Test login flow
- [ ] **Step 11:** Verify token expires in 1 hour
- [ ] **Step 12:** Commit: `git commit -m "Reduce JWT expiration to 1 hour"`

### Task 1.2: Add Token Refresh Endpoint (1 hour)

**File:** `apps/api/routes/auth.routes.js`

- [ ] **Step 1:** Open `apps/api/routes/auth.routes.js`
- [ ] **Step 2:** Add new endpoint after login route:
```javascript
fastify.post('/api/auth/refresh', async (request, reply) => {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    return reply.status(401).send({ error: 'Refresh token required' });
  }

  const tokenData = await verifyRefreshToken(refreshToken);

  if (!tokenData) {
    return reply.status(401).send({ error: 'Invalid refresh token' });
  }

  const newToken = fastify.jwt.sign(
    { id: tokenData.userId },
    { expiresIn: '1h' }
  );

  return { token: newToken };
});
```
- [ ] **Step 3:** Save file
- [ ] **Step 4:** Test with Postman
- [ ] **Step 5:** Commit: `git commit -m "Add token refresh endpoint"`

### Task 1.3: Frontend Token Refresh Logic (2 hours)

**File:** `apps/web/src/services/authService.ts`

- [ ] **Step 1:** Open `apps/web/src/services/authService.ts`
- [ ] **Step 2:** Add function:
```typescript
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    localStorage.removeItem('refreshToken');
    throw new Error('Refresh failed');
  }

  const { token } = await response.json();
  localStorage.setItem('authToken', token);
  return token;
};
```
- [ ] **Step 3:** Save file
- [ ] **Step 4:** Open `apps/web/src/lib/api/index.ts` (or create if missing)
- [ ] **Step 5:** Add axios interceptor:
```typescript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Test: Wait 1 hour, make API call
- [ ] **Step 8:** Verify token auto-refreshes
- [ ] **Step 9:** Commit: `git commit -m "Add frontend token refresh logic"`

### Task 1.4: Fix Password Reset Timing Attack (30 mins)

**File:** `apps/api/routes/auth.routes.js`

- [ ] **Step 1:** Open `apps/api/routes/auth.routes.js`
- [ ] **Step 2:** Find password reset endpoint (~line 203)
- [ ] **Step 3:** Before the checks, add:
```javascript
// Constant time delay to prevent timing attacks
const constantTimeDelay = () => new Promise(resolve => setTimeout(resolve, 100));
```
- [ ] **Step 4:** Change validation logic:
```javascript
const resetToken = await prisma.passwordResetToken.findUnique({
  where: { token }
});

const isInvalid = !resetToken ||
                  resetToken.used ||
                  resetToken.expiresAt < new Date();

if (isInvalid) {
  await constantTimeDelay();
  return reply.status(400).send({ error: 'Invalid or expired reset token' });
}
```
- [ ] **Step 5:** Save file
- [ ] **Step 6:** Test reset flow
- [ ] **Step 7:** Commit: `git commit -m "Fix timing attack in password reset"`

### Task 1.5: Improve XSS Sanitization (30 mins)

**File:** `apps/api/utils/security.js`

- [ ] **Step 1:** Open `apps/api/utils/security.js`
- [ ] **Step 2:** Add import at top:
```javascript
const DOMPurify = require('isomorphic-dompurify');
```
- [ ] **Step 3:** Replace `sanitizeInput` function:
```javascript
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }
  if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  return input;
}
```
- [ ] **Step 4:** Save file
- [ ] **Step 5:** Test with XSS payload: `<script>alert('xss')</script>`
- [ ] **Step 6:** Verify it's stripped
- [ ] **Step 7:** Commit: `git commit -m "Improve XSS sanitization with DOMPurify"`

**✅ PHASE 1 COMPLETE - Commit and push**

---

## 🎨 PHASE 2: FRONTEND REFACTORING (DAYS 3-5 - 16 HOURS)

### Task 2.1: Split DashboardPageClient - Part 1 (2 hours)

**Create:** `apps/web/src/app/dashboard/DashboardState.tsx`

- [ ] **Step 1:** Create new file `apps/web/src/app/dashboard/DashboardState.tsx`
- [ ] **Step 2:** Add imports:
```typescript
'use client';
import React, { createContext, useContext, useState } from 'react';
```
- [ ] **Step 3:** Create context type:
```typescript
interface DashboardState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
```
- [ ] **Step 4:** Create context:
```typescript
const DashboardContext = createContext<DashboardState | null>(null);
```
- [ ] **Step 5:** Create provider:
```typescript
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('resumes');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }}>
      {children}
    </DashboardContext.Provider>
  );
};
```
- [ ] **Step 6:** Create custom hook:
```typescript
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
```
- [ ] **Step 7:** Save file
- [ ] **Step 8:** Commit: `git commit -m "Create DashboardState context"`

### Task 2.2: Split DashboardPageClient - Part 2 (2 hours)

**Create:** `apps/web/src/app/dashboard/DashboardModals.tsx`

- [ ] **Step 1:** Create new file `DashboardModals.tsx`
- [ ] **Step 2:** Move all modal-related state from DashboardPageClient
- [ ] **Step 3:** Create useModals hook with useReducer:
```typescript
type ModalState = {
  newResume: { open: boolean; data?: any };
  addSection: { open: boolean; name: string };
  settings: { open: boolean };
  // ... other modals
};

type ModalAction =
  | { type: 'OPEN_MODAL'; modal: keyof ModalState; data?: any }
  | { type: 'CLOSE_MODAL'; modal: keyof ModalState }
  | { type: 'CLOSE_ALL' };

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, [action.modal]: { open: true, data: action.data } };
    case 'CLOSE_MODAL':
      return { ...state, [action.modal]: { open: false } };
    case 'CLOSE_ALL':
      return initialModalState;
    default:
      return state;
  }
};
```
- [ ] **Step 4:** Create custom hook:
```typescript
export const useModals = () => {
  const [state, dispatch] = useReducer(modalReducer, initialModalState);

  return {
    modals: state,
    openModal: (modal: keyof ModalState, data?: any) =>
      dispatch({ type: 'OPEN_MODAL', modal, data }),
    closeModal: (modal: keyof ModalState) =>
      dispatch({ type: 'CLOSE_MODAL', modal }),
    closeAll: () => dispatch({ type: 'CLOSE_ALL' })
  };
};
```
- [ ] **Step 5:** Save file
- [ ] **Step 6:** Commit: `git commit -m "Create DashboardModals with useReducer"`

### Task 2.3: Split DashboardPageClient - Part 3 (2 hours)

**Refactor:** `apps/web/src/app/dashboard/DashboardPageClient.tsx`

- [ ] **Step 1:** Open `DashboardPageClient.tsx`
- [ ] **Step 2:** Import new providers:
```typescript
import { DashboardProvider, useDashboard } from './DashboardState';
import { useModals } from './DashboardModals';
```
- [ ] **Step 3:** Remove all useState for tabs, sidebar from component
- [ ] **Step 4:** Replace with: `const { activeTab, sidebarOpen } = useDashboard();`
- [ ] **Step 5:** Remove all modal useState (23 of them)
- [ ] **Step 6:** Replace with: `const { modals, openModal, closeModal } = useModals();`
- [ ] **Step 7:** Update all setShowXModal to openModal('x')
- [ ] **Step 8:** Wrap return in DashboardProvider
- [ ] **Step 9:** Save file
- [ ] **Step 10:** Test dashboard - all tabs should work
- [ ] **Step 11:** Test modals - all should open/close
- [ ] **Step 12:** Commit: `git commit -m "Refactor DashboardPageClient to use context"`

### Task 2.4: Split useResumeData Hook - Part 1 (2 hours)

**Create:** `apps/web/src/hooks/resume/useResumeState.ts`

- [ ] **Step 1:** Create folder `apps/web/src/hooks/resume/`
- [ ] **Step 2:** Create file `useResumeState.ts`
- [ ] **Step 3:** Move only data state from useResumeData:
```typescript
export const useResumeState = (initialData: ResumeData) => {
  const [data, setData] = useState(initialData);

  const updateField = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateSection = (section: string, index: number, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? value : item)
    }));
  };

  return { data, setData, updateField, updateSection };
};
```
- [ ] **Step 4:** Save file
- [ ] **Step 5:** Commit: `git commit -m "Extract useResumeState hook"`

### Task 2.5: Split useResumeData Hook - Part 2 (2 hours)

**Create:** `apps/web/src/hooks/resume/useResumeFormatting.ts`

- [ ] **Step 1:** Create file `useResumeFormatting.ts`
- [ ] **Step 2:** Move formatting state:
```typescript
export const useResumeFormatting = () => {
  const [formatting, setFormatting] = useState<FormattingOptions>({
    fontFamily: 'Inter',
    fontSize: 12,
    lineSpacing: 1.2,
    margins: { top: 20, right: 20, bottom: 20, left: 20 }
  });

  const updateFormatting = (key: string, value: any) => {
    setFormatting(prev => ({ ...prev, [key]: value }));
  };

  return { formatting, setFormatting, updateFormatting };
};
```
- [ ] **Step 3:** Save file
- [ ] **Step 4:** Commit: `git commit -m "Extract useResumeFormatting hook"`

### Task 2.6: Split useResumeData Hook - Part 3 (2 hours)

**Create:** `apps/web/src/hooks/resume/useResumeSave.ts`

- [ ] **Step 1:** Create file `useResumeSave.ts`
- [ ] **Step 2:** Move auto-save logic:
```typescript
export const useResumeSave = (resumeId: string, data: ResumeData) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveResume = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, data]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveResume, 30000);
    return () => clearInterval(interval);
  }, [saveResume]);

  return { saveResume, isSaving, lastSaved };
};
```
- [ ] **Step 3:** Save file
- [ ] **Step 4:** Commit: `git commit -m "Extract useResumeSave hook"`

### Task 2.7: Split useResumeData Hook - Part 4 (2 hours)

**Create:** `apps/web/src/hooks/resume/useResumeHistory.ts`

- [ ] **Step 1:** Create file `useResumeHistory.ts`
- [ ] **Step 2:** Move undo/redo logic:
```typescript
export const useResumeHistory = (initialData: ResumeData) => {
  const [history, setHistory] = useState<ResumeData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (data: ResumeData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return history[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return history[historyIndex + 1];
    }
  };

  return { addToHistory, undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1 };
};
```
- [ ] **Step 3:** Save file
- [ ] **Step 4:** Delete original `useResumeData.ts` (611 lines)
- [ ] **Step 5:** Update imports in components using it
- [ ] **Step 6:** Test resume editor thoroughly
- [ ] **Step 7:** Commit: `git commit -m "Extract useResumeHistory and complete hook split"`

### Task 2.8: Split ProfessionalTab Component (2 hours)

**Create:** `apps/web/src/components/profile/ProfessionalExperience.tsx`

- [ ] **Step 1:** Open `ProfessionalTab.tsx` (1,265 lines)
- [ ] **Step 2:** Create new file `ProfessionalExperience.tsx`
- [ ] **Step 3:** Extract work experience section (lines 1-600)
- [ ] **Step 4:** Create component:
```typescript
export const ProfessionalExperience = ({ experiences, onUpdate }) => {
  // Move work experience logic here
};
```
- [ ] **Step 5:** Save file
- [ ] **Step 6:** Create new file `ProjectsList.tsx`
- [ ] **Step 7:** Extract projects section (lines 601-1265)
- [ ] **Step 8:** Update ProfessionalTab to use both:
```typescript
return (
  <>
    <ProfessionalExperience experiences={workExperiences} onUpdate={updateExperiences} />
    <ProjectsList projects={projects} onUpdate={updateProjects} />
  </>
);
```
- [ ] **Step 9:** Save all files
- [ ] **Step 10:** Test professional tab
- [ ] **Step 11:** Commit: `git commit -m "Split ProfessionalTab into two components"`

**✅ PHASE 2 COMPLETE - Commit and push**

---

## 🔌 PHASE 3: BACKEND API IMPROVEMENTS (DAYS 6-8 - 16 HOURS)

### Task 3.1: Add API Versioning (1 hour)

**File:** `apps/api/server.js`

- [ ] **Step 1:** Open `server.js`
- [ ] **Step 2:** Find all route registrations (~line 296)
- [ ] **Step 3:** Change from:
```javascript
fastify.register(require('./routes/auth.routes'));
```
- [ ] **Step 4:** Change to:
```javascript
fastify.register(require('./routes/auth.routes'), { prefix: '/api/v1' });
```
- [ ] **Step 5:** Do for ALL route files
- [ ] **Step 6:** Update health check to `/v1/health`
- [ ] **Step 7:** Save file
- [ ] **Step 8:** Update all frontend API calls to use `/api/v1/`
- [ ] **Step 9:** Test all endpoints
- [ ] **Step 10:** Commit: `git commit -m "Add API versioning (v1)"`

### Task 3.2: Standardize Error Responses (2 hours)

**Create:** `apps/api/utils/ApiError.js`

- [ ] **Step 1:** Create file `utils/ApiError.js`
- [ ] **Step 2:** Add error class:
```javascript
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    };
  }
}

module.exports = { ApiError };
```
- [ ] **Step 3:** Update `utils/errorHandler.js`:
```javascript
const { ApiError } = require('./ApiError');

function globalErrorHandler(error, request, reply) {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send(error.toJSON());
  }

  // Default error
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
```
- [ ] **Step 4:** Save files
- [ ] **Step 5:** Commit: `git commit -m "Add standardized error class"`

### Task 3.3: Add Request Validation - Auth Routes (2 hours)

**File:** `apps/api/routes/auth.routes.js`

- [ ] **Step 1:** Open `auth.routes.js`
- [ ] **Step 2:** Create schemas at top of file:
```javascript
const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 8, maxLength: 128 }
    }
  }
};

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 8, maxLength: 128 },
      name: { type: 'string', minLength: 1, maxLength: 100 }
    }
  }
};
```
- [ ] **Step 3:** Update login route:
```javascript
fastify.post('/api/auth/login', { schema: loginSchema }, loginHandler);
```
- [ ] **Step 4:** Update register route with registerSchema
- [ ] **Step 5:** Save file
- [ ] **Step 6:** Test with invalid data
- [ ] **Step 7:** Verify validation errors
- [ ] **Step 8:** Commit: `git commit -m "Add validation to auth routes"`

### Task 3.4: Split storage.routes.js - Part 1 (2 hours)

**Create:** `apps/api/routes/storage/files.routes.js`

- [ ] **Step 1:** Create folder `routes/storage/`
- [ ] **Step 2:** Create file `files.routes.js`
- [ ] **Step 3:** Move file CRUD operations from storage.routes.js
- [ ] **Step 4:** Lines to move: File upload, download, list, delete (approx 500 lines)
- [ ] **Step 5:** Wrap in Fastify plugin:
```javascript
async function fileRoutes(fastify, options) {
  // Move file routes here
  fastify.post('/files', uploadHandler);
  fastify.get('/files/:id', downloadHandler);
  fastify.get('/files', listHandler);
  fastify.delete('/files/:id', deleteHandler);
}

module.exports = fileRoutes;
```
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Update `server.js`:
```javascript
fastify.register(require('./routes/storage/files.routes'), { prefix: '/api/v1/storage' });
```
- [ ] **Step 8:** Test file upload/download
- [ ] **Step 9:** Commit: `git commit -m "Extract file routes from storage"`

### Task 3.5: Split storage.routes.js - Part 2 (2 hours)

**Create:** `apps/api/routes/storage/folders.routes.js`

- [ ] **Step 1:** Create file `folders.routes.js`
- [ ] **Step 2:** Move folder operations from storage.routes.js
- [ ] **Step 3:** Lines to move: Create, list, delete folders (approx 300 lines)
- [ ] **Step 4:** Wrap in plugin:
```javascript
async function folderRoutes(fastify, options) {
  fastify.post('/folders', createFolderHandler);
  fastify.get('/folders', listFoldersHandler);
  fastify.delete('/folders/:id', deleteFolderHandler);
}

module.exports = folderRoutes;
```
- [ ] **Step 5:** Save file
- [ ] **Step 6:** Register in server.js
- [ ] **Step 7:** Test folder operations
- [ ] **Step 8:** Commit: `git commit -m "Extract folder routes from storage"`

### Task 3.6: Split storage.routes.js - Part 3 (2 hours)

**Create:** `apps/api/routes/storage/sharing.routes.js`

- [ ] **Step 1:** Create file `sharing.routes.js`
- [ ] **Step 2:** Move sharing/share link operations
- [ ] **Step 3:** Lines to move: Share file, create link, permissions (approx 400 lines)
- [ ] **Step 4:** Create plugin structure
- [ ] **Step 5:** Save and register
- [ ] **Step 6:** Test sharing features
- [ ] **Step 7:** Commit: `git commit -m "Extract sharing routes from storage"`

### Task 3.7: Create Service Layer - File Service (2 hours)

**Create:** `apps/api/services/storage/fileService.js`

- [ ] **Step 1:** Create folder `services/storage/`
- [ ] **Step 2:** Create file `fileService.js`
- [ ] **Step 3:** Extract business logic from file routes:
```javascript
class FileService {
  async uploadFile(userId, file, metadata) {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large');
    }

    // Upload to storage
    const storagePath = await this.saveToStorage(file);

    // Create database record
    const fileRecord = await prisma.storageFile.create({
      data: {
        userId,
        name: metadata.name,
        fileName: file.filename,
        type: metadata.type,
        contentType: file.mimetype,
        size: BigInt(file.size),
        storagePath
      }
    });

    return fileRecord;
  }

  async getFile(fileId, userId) {
    // Check permissions and return file
  }

  async deleteFile(fileId, userId) {
    // Check ownership and delete
  }
}

module.exports = new FileService();
```
- [ ] **Step 4:** Save file
- [ ] **Step 5:** Update routes to use service:
```javascript
const fileService = require('../../services/storage/fileService');

async function uploadHandler(request, reply) {
  const file = await request.file();
  const result = await fileService.uploadFile(request.user.id, file, request.body);
  return reply.send({ success: true, file: result });
}
```
- [ ] **Step 6:** Test upload flow
- [ ] **Step 7:** Commit: `git commit -m "Create file service layer"`

### Task 3.8: Delete Old storage.routes.js (30 mins)

- [ ] **Step 1:** Verify all functionality moved to new files
- [ ] **Step 2:** Test all storage endpoints
- [ ] **Step 3:** Delete `apps/api/routes/storage.routes.js` (2,746 lines)
- [ ] **Step 4:** Remove registration from server.js
- [ ] **Step 5:** Run full test suite
- [ ] **Step 6:** Commit: `git commit -m "Remove monolithic storage.routes.js"`

**✅ PHASE 3 COMPLETE - Commit and push**

---

## 🧪 PHASE 4: TESTING IMPROVEMENTS (DAYS 9-12 - 16 HOURS)

### Task 4.1: Setup Test Infrastructure (1 hour)

- [ ] **Step 1:** Install dependencies: `npm install --save-dev jest @testing-library/react`
- [ ] **Step 2:** Create `jest.config.js` in root:
```javascript
module.exports = {
  projects: [
    '<rootDir>/apps/web/jest.config.js',
    '<rootDir>/apps/api/jest.config.js'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
```
- [ ] **Step 3:** Update root package.json scripts:
```json
"test:all": "jest --coverage",
"test:watch": "jest --watch"
```
- [ ] **Step 4:** Run: `npm run test:all`
- [ ] **Step 5:** Note current coverage %
- [ ] **Step 6:** Commit: `git commit -m "Update test configuration with coverage thresholds"`

### Task 4.2: Test storage/files.routes.js (3 hours)

**Create:** `apps/api/tests/storage/files.routes.test.js`

- [ ] **Step 1:** Create folder `tests/storage/`
- [ ] **Step 2:** Create file `files.routes.test.js`
- [ ] **Step 3:** Setup test structure:
```javascript
const { test } = require('tap');
const { build } = require('../helper');

test('POST /api/v1/storage/files - upload file', async (t) => {
  const app = await build(t);

  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/storage/files',
    headers: {
      'Authorization': 'Bearer ' + testToken
    },
    payload: {
      // file data
    }
  });

  t.equal(response.statusCode, 200);
  t.ok(response.json().success);
});
```
- [ ] **Step 4:** Add test for GET /files/:id
- [ ] **Step 5:** Add test for GET /files (list)
- [ ] **Step 6:** Add test for DELETE /files/:id
- [ ] **Step 7:** Add test for unauthorized access
- [ ] **Step 8:** Add test for file too large
- [ ] **Step 9:** Add test for invalid file type
- [ ] **Step 10:** Run tests: `npm test`
- [ ] **Step 11:** Fix any failures
- [ ] **Step 12:** Commit: `git commit -m "Add tests for file routes"`

### Task 4.3: Test fileService.js (2 hours)

**Create:** `apps/api/tests/services/fileService.test.js`

- [ ] **Step 1:** Create file `tests/services/fileService.test.js`
- [ ] **Step 2:** Test uploadFile method
- [ ] **Step 3:** Test getFile method
- [ ] **Step 4:** Test deleteFile method
- [ ] **Step 5:** Test error cases (file too large, invalid type)
- [ ] **Step 6:** Mock Prisma calls
- [ ] **Step 7:** Run tests
- [ ] **Step 8:** Commit: `git commit -m "Add tests for file service"`

### Task 4.4: Test Resume Routes (3 hours)

**Create:** `apps/api/tests/resume.routes.test.js`

- [ ] **Step 1:** Create file `tests/resume.routes.test.js`
- [ ] **Step 2:** Test POST /api/v1/resumes (create)
- [ ] **Step 3:** Test GET /api/v1/resumes/:id
- [ ] **Step 4:** Test PUT /api/v1/resumes/:id (update)
- [ ] **Step 5:** Test DELETE /api/v1/resumes/:id
- [ ] **Step 6:** Test GET /api/v1/resumes (list all)
- [ ] **Step 7:** Test resume export endpoints
- [ ] **Step 8:** Test validation errors
- [ ] **Step 9:** Run tests
- [ ] **Step 10:** Commit: `git commit -m "Add tests for resume routes"`

### Task 4.5: Component Tests - DashboardState (2 hours)

**Create:** `apps/web/src/app/dashboard/__tests__/DashboardState.test.tsx`

- [ ] **Step 1:** Create folder `__tests__/`
- [ ] **Step 2:** Create test file
- [ ] **Step 3:** Test DashboardProvider renders children
- [ ] **Step 4:** Test activeTab state changes
- [ ] **Step 5:** Test sidebarOpen toggle
- [ ] **Step 6:** Test context throws without provider
- [ ] **Step 7:** Run: `npm test DashboardState`
- [ ] **Step 8:** Commit: `git commit -m "Add tests for DashboardState"`

### Task 4.6: Component Tests - useModals (2 hours)

**Create:** `apps/web/src/app/dashboard/__tests__/DashboardModals.test.tsx`

- [ ] **Step 1:** Create test file
- [ ] **Step 2:** Test openModal action
- [ ] **Step 3:** Test closeModal action
- [ ] **Step 4:** Test closeAll action
- [ ] **Step 5:** Test modal data passing
- [ ] **Step 6:** Run tests
- [ ] **Step 7:** Commit: `git commit -m "Add tests for useModals hook"`

### Task 4.7: Integration Test - Auth Flow (3 hours)

**Create:** `apps/web/e2e/auth.spec.ts`

- [ ] **Step 1:** Create file `e2e/auth.spec.ts`
- [ ] **Step 2:** Test registration flow:
```typescript
test('user can register', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test1234');
  await page.fill('[name="name"]', 'Test User');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```
- [ ] **Step 3:** Test login flow
- [ ] **Step 4:** Test logout
- [ ] **Step 5:** Test password reset request
- [ ] **Step 6:** Test 2FA setup
- [ ] **Step 7:** Run: `npx playwright test`
- [ ] **Step 8:** Commit: `git commit -m "Add E2E tests for auth flow"`

**✅ PHASE 4 COMPLETE - Commit and push**

---

## 🌐 PHASE 5: BROWSER EXTENSION FIXES (DAY 13 - 6 HOURS)

### Task 5.1: Add Authentication (2 hours)

**File:** `browser-extension/background.js`

- [ ] **Step 1:** Open `background.js`
- [ ] **Step 2:** Add token storage function at top:
```javascript
async function getAuthToken() {
  const result = await chrome.storage.local.get(['authToken']);
  return result.authToken;
}

async function setAuthToken(token) {
  await chrome.storage.local.set({ authToken: token });
}
```
- [ ] **Step 3:** Update syncJobToBackend function:
```javascript
async function syncJobToBackend(jobData) {
  const token = await getAuthToken();

  if (!token) {
    showNotification('Error', 'Please log in first');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });

    if (response.status === 401) {
      showNotification('Error', 'Session expired. Please log in again.');
      await chrome.storage.local.remove(['authToken']);
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Failed to sync job:', error);
    showNotification('Error', 'Failed to save job. Check your connection.');
    return false;
  }
}
```
- [ ] **Step 4:** Save file
- [ ] **Step 5:** Test job capture
- [ ] **Step 6:** Commit: `git commit -m "Add authentication to browser extension"`

### Task 5.2: Add Login Flow (2 hours)

**Create:** `browser-extension/login.html`

- [ ] **Step 1:** Create file `login.html`
- [ ] **Step 2:** Add login form:
```html
<!DOCTYPE html>
<html>
<head>
  <title>RoleReady Login</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="login-container">
    <h2>Login to RoleReady</h2>
    <form id="loginForm">
      <input type="email" id="email" placeholder="Email" required>
      <input type="password" id="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <div id="error" class="error"></div>
  </div>
  <script src="login.js"></script>
</body>
</html>
```
- [ ] **Step 3:** Create file `login.js`:
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { token } = await response.json();
    await chrome.storage.local.set({ authToken: token });

    window.close();
  } catch (error) {
    document.getElementById('error').textContent = 'Login failed. Check credentials.';
  }
});
```
- [ ] **Step 4:** Update `popup.html` to check auth:
```javascript
// In popup.js
chrome.storage.local.get(['authToken'], (result) => {
  if (!result.authToken) {
    chrome.tabs.create({ url: 'login.html' });
  }
});
```
- [ ] **Step 5:** Update manifest.json to include login.html
- [ ] **Step 6:** Test login flow
- [ ] **Step 7:** Commit: `git commit -m "Add login flow to extension"`

### Task 5.3: Add Environment Config (1 hour)

**Create:** `browser-extension/config.js`

- [ ] **Step 1:** Create file `config.js`:
```javascript
const config = {
  development: {
    API_BASE: 'http://localhost:3001',
    WEB_BASE: 'http://localhost:3000'
  },
  production: {
    API_BASE: 'https://api.roleready.io',
    WEB_BASE: 'https://app.roleready.io'
  }
};

const ENV = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest
  ? (chrome.runtime.getManifest().version.includes('dev') ? 'development' : 'production')
  : 'development';

export const API_BASE = config[ENV].API_BASE;
export const WEB_BASE = config[ENV].WEB_BASE;
```
- [ ] **Step 2:** Update background.js to import:
```javascript
import { API_BASE } from './config.js';
```
- [ ] **Step 3:** Update all hardcoded URLs
- [ ] **Step 4:** Save files
- [ ] **Step 5:** Test in dev and prod mode
- [ ] **Step 6:** Commit: `git commit -m "Add environment configuration to extension"`

### Task 5.4: Create Extension Icons (1 hour)

- [ ] **Step 1:** Create folder `browser-extension/icons/`
- [ ] **Step 2:** Use online tool (like favicon.io) to create icons
- [ ] **Step 3:** Generate 16x16px icon
- [ ] **Step 4:** Generate 32x32px icon
- [ ] **Step 5:** Generate 48x48px icon
- [ ] **Step 6:** Generate 128x128px icon
- [ ] **Step 7:** Save all in `icons/` folder
- [ ] **Step 8:** Test extension loads with icons
- [ ] **Step 9:** Commit: `git commit -m "Add extension icons"`

**✅ PHASE 5 COMPLETE - Commit and push**

---

## 📚 PHASE 6: DOCUMENTATION (DAY 14 - 6 HOURS)

### Task 6.1: Create README.md (2 hours)

**Create:** `README.md`

- [ ] **Step 1:** Create file in root
- [ ] **Step 2:** Add header and description
- [ ] **Step 3:** Add features list
- [ ] **Step 4:** Add tech stack
- [ ] **Step 5:** Add prerequisites
- [ ] **Step 6:** Add installation steps
- [ ] **Step 7:** Add environment variables section
- [ ] **Step 8:** Add running instructions
- [ ] **Step 9:** Add testing instructions
- [ ] **Step 10:** Add deployment section
- [ ] **Step 11:** Add contributing guidelines
- [ ] **Step 12:** Add license
- [ ] **Step 13:** Commit: `git commit -m "Add comprehensive README"`

### Task 6.2: Create API Documentation (2 hours)

**Create:** `API.md`

- [ ] **Step 1:** Create file `API.md`
- [ ] **Step 2:** Add API overview
- [ ] **Step 3:** Document authentication
- [ ] **Step 4:** Document all auth endpoints
- [ ] **Step 5:** Document user endpoints
- [ ] **Step 6:** Document resume endpoints
- [ ] **Step 7:** Document storage endpoints
- [ ] **Step 8:** Add request/response examples
- [ ] **Step 9:** Add error codes reference
- [ ] **Step 10:** Commit: `git commit -m "Add API documentation"`

### Task 6.3: Create TESTING.md (1 hour)

**Create:** `TESTING.md`

- [ ] **Step 1:** Create file
- [ ] **Step 2:** Document test structure
- [ ] **Step 3:** Add testing commands
- [ ] **Step 4:** Add coverage requirements
- [ ] **Step 5:** Add testing guidelines
- [ ] **Step 6:** Add examples
- [ ] **Step 7:** Commit: `git commit -m "Add testing documentation"`

### Task 6.4: Create CONTRIBUTING.md (1 hour)

**Create:** `CONTRIBUTING.md`

- [ ] **Step 1:** Create file
- [ ] **Step 2:** Add code of conduct
- [ ] **Step 3:** Add development setup
- [ ] **Step 4:** Add commit message guidelines
- [ ] **Step 5:** Add PR process
- [ ] **Step 6:** Add coding standards
- [ ] **Step 7:** Commit: `git commit -m "Add contributing guidelines"`

**✅ PHASE 6 COMPLETE - Commit and push**

---

## 🎉 FINAL PHASE: VERIFICATION & DEPLOYMENT PREP (DAY 15 - 4 HOURS)

### Task 7.1: Run Full Test Suite (1 hour)

- [ ] **Step 1:** Run: `npm run test:all`
- [ ] **Step 2:** Verify coverage > 70%
- [ ] **Step 3:** Fix any failing tests
- [ ] **Step 4:** Run: `npm run lint`
- [ ] **Step 5:** Fix all linting errors
- [ ] **Step 6:** Run: `npm run type-check`
- [ ] **Step 7:** Fix all type errors
- [ ] **Step 8:** Commit: `git commit -m "Fix all tests and type errors"`

### Task 7.2: Security Audit (1 hour)

- [ ] **Step 1:** Run: `npm audit`
- [ ] **Step 2:** Fix high/critical vulnerabilities
- [ ] **Step 3:** Verify no exposed secrets: `git secrets --scan-history`
- [ ] **Step 4:** Check .env files not in git
- [ ] **Step 5:** Verify CSRF enabled
- [ ] **Step 6:** Verify rate limiting works
- [ ] **Step 7:** Test JWT expiration
- [ ] **Step 8:** Commit fixes

### Task 7.3: Performance Check (1 hour)

- [ ] **Step 1:** Run Lighthouse on main pages
- [ ] **Step 2:** Check bundle size: `npm run build && ls -lh .next`
- [ ] **Step 3:** Verify < 500kb main bundle
- [ ] **Step 4:** Check API response times
- [ ] **Step 5:** Verify database indexes
- [ ] **Step 6:** Run load test on critical endpoints
- [ ] **Step 7:** Document results

### Task 7.4: Final Checklist (1 hour)

- [ ] **Step 1:** ✅ All CRITICAL security issues fixed
- [ ] **Step 2:** ✅ CSRF protection enabled
- [ ] **Step 3:** ✅ Auth rate limiting added
- [ ] **Step 4:** ✅ JWT expiration reduced to 1h
- [ ] **Step 5:** ✅ Large components split
- [ ] **Step 6:** ✅ API versioning implemented
- [ ] **Step 7:** ✅ Test coverage > 70%
- [ ] **Step 8:** ✅ Documentation complete
- [ ] **Step 9:** ✅ Browser extension functional
- [ ] **Step 10:** ✅ No build errors
- [ ] **Step 11:** ✅ All tests passing
- [ ] **Step 12:** ✅ Ready for production

### Task 7.5: Create Release

- [ ] **Step 1:** Update version in package.json to 1.0.0
- [ ] **Step 2:** Create CHANGELOG.md
- [ ] **Step 3:** Tag release: `git tag -a v1.0.0 -m "Production ready release"`
- [ ] **Step 4:** Push tags: `git push origin v1.0.0`
- [ ] **Step 5:** Create GitHub release
- [ ] **Step 6:** Document deployment steps
- [ ] **Step 7:** 🎉 CELEBRATE!

**✅ ALL PHASES COMPLETE - PRODUCTION READY! 🚀**

---

## 📊 Progress Tracker

**Total Tasks:** 150+
**Estimated Time:** 80 hours (10 working days)
**Current Progress:** 0%

**Track your progress:**
```
Phase 0 (Critical): [ ] [ ] [ ] [ ] [ ]  (0/5)
Phase 1 (Auth):     [ ] [ ] [ ] [ ] [ ]  (0/5)
Phase 2 (Frontend): [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]  (0/8)
Phase 3 (Backend):  [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]  (0/8)
Phase 4 (Testing):  [ ] [ ] [ ] [ ] [ ] [ ] [ ]  (0/7)
Phase 5 (Extension):[ ] [ ] [ ] [ ]  (0/4)
Phase 6 (Docs):     [ ] [ ] [ ] [ ]  (0/4)
Phase 7 (Final):    [ ] [ ] [ ] [ ] [ ]  (0/5)
```

---

## 💡 Tips for Success

1. **Work in order** - Each phase builds on previous ones
2. **Commit often** - After each task completion
3. **Test immediately** - Don't move on if tests fail
4. **Take breaks** - 5-10 min break every hour
5. **Ask for help** - If stuck >30 mins on one step
6. **Track progress** - Check off items as you go
7. **Document issues** - Note problems for later
8. **Celebrate wins** - Phase completion = achievement!

---

**Start with Phase 0 - Critical Security Fixes NOW! 🚀**
