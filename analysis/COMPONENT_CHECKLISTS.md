# Component-by-Component Implementation Checklists

Quick navigation to specific components you want to fix.

---

## 📑 Quick Navigation

- [Security & Auth](#security--auth)
- [Frontend Components](#frontend-components)
- [Backend Routes](#backend-routes)
- [Database](#database)
- [Browser Extension](#browser-extension)
- [Testing](#testing)

---

## 🔐 Security & Auth

### ⚡ Quick Wins (30 mins each)

**[ ] Delete Exposed Credentials**
1. Delete `apps/api/temp-check-resume.js`
2. Commit deletion
3. Log into Supabase → Reset password
4. Update `.env` with new password

**[ ] Enable CSRF**
1. Open `apps/api/server.js`
2. After line 155, add:
   ```javascript
   fastify.register(require('@fastify/csrf-protection'), {
     cookieKey: process.env.CSRF_SECRET || require('crypto').randomBytes(32).toString('hex'),
     cookieOpts: { signed: true }
   });
   ```
3. Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Add to `.env`: `CSRF_SECRET=<generated>`
5. Restart server

**[ ] Add Auth Rate Limiting**
1. Open `apps/api/routes/auth.routes.js`
2. For login route, change to:
   ```javascript
   fastify.post('/api/auth/login', {
     config: { rateLimit: { max: 5, timeWindow: '15 minutes' } }
   }, loginHandler);
   ```
3. Repeat for register, 2FA, forgot-password
4. Test with 6 rapid login attempts

**[ ] Reduce JWT Expiration**
1. Open `apps/api/routes/auth.routes.js`
2. Change `expiresIn: '365d'` to `expiresIn: '1h'`
3. Add refresh token creation
4. Test login

---

## 🎨 Frontend Components

### DashboardPageClient.tsx (800 lines → Split into 3)

**[ ] Create DashboardState.tsx (30 mins)**
```typescript
// apps/web/src/app/dashboard/DashboardState.tsx
import { createContext, useContext, useState } from 'react';

interface DashboardState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardState | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('resumes');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be within DashboardProvider');
  return context;
};
```

**[ ] Create DashboardModals.tsx (1 hour)**
```typescript
// apps/web/src/app/dashboard/DashboardModals.tsx
import { useReducer } from 'react';

type ModalState = {
  newResume: { open: boolean; data?: any };
  addSection: { open: boolean; name: string; content: string };
  settings: { open: boolean };
  // Add all your modals here
};

type ModalAction =
  | { type: 'OPEN'; modal: keyof ModalState; data?: any }
  | { type: 'CLOSE'; modal: keyof ModalState }
  | { type: 'CLOSE_ALL' };

const initialState: ModalState = {
  newResume: { open: false },
  addSection: { open: false, name: '', content: '' },
  settings: { open: false }
};

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, [action.modal]: { open: true, ...(action.data || {}) } };
    case 'CLOSE':
      return { ...state, [action.modal]: { ...state[action.modal], open: false } };
    case 'CLOSE_ALL':
      return initialState;
    default:
      return state;
  }
};

export const useModals = () => {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  return {
    modals: state,
    open: (modal: keyof ModalState, data?: any) => dispatch({ type: 'OPEN', modal, data }),
    close: (modal: keyof ModalState) => dispatch({ type: 'CLOSE', modal }),
    closeAll: () => dispatch({ type: 'CLOSE_ALL' })
  };
};
```

**[ ] Refactor DashboardPageClient.tsx (1 hour)**
1. Import new hooks
2. Delete all tab/sidebar useState
3. Delete all 23 modal useState
4. Replace with: `const { activeTab } = useDashboard();`
5. Replace with: `const { modals, open, close } = useModals();`
6. Update all `setShowXModal(true)` to `open('x')`
7. Wrap return in `<DashboardProvider>`

### ProfessionalTab.tsx (1,265 lines → Split into 2)

**[ ] Extract ProfessionalExperience.tsx (1 hour)**
```typescript
// apps/web/src/components/profile/ProfessionalExperience.tsx
interface Props {
  experiences: WorkExperience[];
  onUpdate: (experiences: WorkExperience[]) => void;
}

export const ProfessionalExperience: React.FC<Props> = ({ experiences, onUpdate }) => {
  const handleAdd = () => {
    onUpdate([...experiences, newExperience]);
  };

  const handleEdit = (index: number, data: WorkExperience) => {
    const updated = experiences.map((exp, i) => i === index ? data : exp);
    onUpdate(updated);
  };

  const handleDelete = (index: number) => {
    onUpdate(experiences.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Work Experience</h3>
      {experiences.map((exp, i) => (
        <ExperienceCard
          key={i}
          experience={exp}
          onEdit={(data) => handleEdit(i, data)}
          onDelete={() => handleDelete(i)}
        />
      ))}
      <button onClick={handleAdd}>Add Experience</button>
    </div>
  );
};
```

**[ ] Extract ProjectsList.tsx (1 hour)**
```typescript
// apps/web/src/components/profile/ProjectsList.tsx
interface Props {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
}

export const ProjectsList: React.FC<Props> = ({ projects, onUpdate }) => {
  // Similar structure to ProfessionalExperience
  // Move all project logic here
};
```

**[ ] Update ProfessionalTab.tsx (30 mins)**
```typescript
import { ProfessionalExperience } from './ProfessionalExperience';
import { ProjectsList } from './ProjectsList';

export const ProfessionalTab = () => {
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);

  return (
    <>
      <ProfessionalExperience experiences={experiences} onUpdate={setExperiences} />
      <ProjectsList projects={projects} onUpdate={setProjects} />
    </>
  );
};
```

### SkillsTab.tsx (1,093 lines → Split into 2)

**[ ] Extract SkillsEditor.tsx (1 hour)**
- Move all skill editing UI
- CRUD operations for skills
- Save as separate component

**[ ] Extract SkillsDisplay.tsx (1 hour)**
- Move skill visualization
- Skill categories display
- Read-only view

### useResumeData Hook (611 lines → Split into 4)

**[ ] useResumeState.ts (30 mins)**
```typescript
// apps/web/src/hooks/resume/useResumeState.ts
export const useResumeState = (initial: ResumeData) => {
  const [data, setData] = useState(initial);

  const update = (field: keyof ResumeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateSection = (section: string, index: number, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? value : item)
    }));
  };

  return { data, setData, update, updateSection };
};
```

**[ ] useResumeFormatting.ts (30 mins)**
```typescript
// apps/web/src/hooks/resume/useResumeFormatting.ts
export const useResumeFormatting = () => {
  const [formatting, setFormatting] = useState({
    fontFamily: 'Inter',
    fontSize: 12,
    lineSpacing: 1.2
  });

  const updateFormat = (key: string, value: any) => {
    setFormatting(prev => ({ ...prev, [key]: value }));
  };

  return { formatting, setFormatting, updateFormat };
};
```

**[ ] useResumeSave.ts (1 hour)**
```typescript
// apps/web/src/hooks/resume/useResumeSave.ts
export const useResumeSave = (resumeId: string, data: ResumeData) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/v1/resumes/${resumeId}`, {
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

  useEffect(() => {
    const interval = setInterval(save, 30000); // Auto-save every 30s
    return () => clearInterval(interval);
  }, [save]);

  return { save, isSaving, lastSaved };
};
```

**[ ] useResumeHistory.ts (1 hour)**
```typescript
// apps/web/src/hooks/resume/useResumeHistory.ts
export const useResumeHistory = (initial: ResumeData) => {
  const [history, setHistory] = useState<ResumeData[]>([initial]);
  const [index, setIndex] = useState(0);

  const addToHistory = (data: ResumeData) => {
    const newHistory = history.slice(0, index + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (index > 0) {
      setIndex(index - 1);
      return history[index - 1];
    }
  };

  const redo = () => {
    if (index < history.length - 1) {
      setIndex(index + 1);
      return history[index + 1];
    }
  };

  return { addToHistory, undo, redo, canUndo: index > 0, canRedo: index < history.length - 1 };
};
```

---

## 🔌 Backend Routes

### storage.routes.js (2,746 lines → Split into 4)

**[ ] Create files.routes.js (1 hour)**
```javascript
// apps/api/routes/storage/files.routes.js
const fileService = require('../../services/storage/fileService');

async function fileRoutes(fastify, options) {
  // POST /files - Upload
  fastify.post('/files', {
    preHandler: authenticate,
    schema: {
      consumes: ['multipart/form-data']
    }
  }, async (request, reply) => {
    const data = await request.file();
    const result = await fileService.uploadFile(request.user.id, data);
    return { success: true, file: result };
  });

  // GET /files/:id - Download
  fastify.get('/files/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    const file = await fileService.getFile(request.params.id, request.user.id);
    return reply.send(file);
  });

  // GET /files - List
  fastify.get('/files', {
    preHandler: authenticate
  }, async (request, reply) => {
    const files = await fileService.listFiles(request.user.id, request.query);
    return { success: true, files };
  });

  // DELETE /files/:id
  fastify.delete('/files/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    await fileService.deleteFile(request.params.id, request.user.id);
    return { success: true };
  });
}

module.exports = fileRoutes;
```

**[ ] Create folders.routes.js (1 hour)**
- Extract folder CRUD from storage.routes.js
- Lines ~800-1100 approximately
- Create, list, update, delete folders

**[ ] Create sharing.routes.js (1 hour)**
- Extract sharing logic
- Share file, create link, manage permissions
- Lines ~1100-1500 approximately

**[ ] Create quota.routes.js (30 mins)**
- Extract quota management
- Get usage, update limits
- Lines ~1500-1700 approximately

**[ ] Delete storage.routes.js (15 mins)**
1. Verify all moved
2. Test all endpoints
3. Delete old file
4. Update server.js

### users.routes.js (2,095 lines → Split into 3)

**[ ] Create profile.routes.js (1 hour)**
- Extract user profile endpoints
- GET/PUT /profile
- Profile picture upload
- Lines ~500-1000

**[ ] Create preferences.routes.js (30 mins)**
- Extract user preferences
- Notification settings
- Privacy settings

**[ ] Create subscription.routes.js (1 hour)**
- Extract subscription logic
- Billing endpoints
- Usage tracking

### resume.routes.js (1,134 lines → Split into service)

**[ ] Create resumeService.js (2 hours)**
```javascript
// apps/api/services/resumeService.js
class ResumeService {
  async create(userId, data) {
    return await prisma.resume.create({
      data: { userId, ...data }
    });
  }

  async getById(resumeId, userId) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new ApiError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    return resume;
  }

  async update(resumeId, userId, data) {
    await this.getById(resumeId, userId); // Check ownership

    return await prisma.resume.update({
      where: { id: resumeId },
      data
    });
  }

  async delete(resumeId, userId) {
    await this.getById(resumeId, userId);

    return await prisma.resume.delete({
      where: { id: resumeId }
    });
  }

  async list(userId, filters) {
    return await prisma.resume.findMany({
      where: { userId, ...filters },
      orderBy: { updatedAt: 'desc' }
    });
  }
}

module.exports = new ResumeService();
```

**[ ] Refactor resume.routes.js to use service (1 hour)**

---

## 🗄️ Database

### Add Constraints (30 mins each)

**[ ] StorageQuota Constraint**
```sql
-- Add check constraint
ALTER TABLE storage_quotas
ADD CONSTRAINT check_quota_usage
CHECK (used_bytes <= limit_bytes);
```

**[ ] Array Length Limits**
```sql
-- In Prisma schema
model WorkExperience {
  technologies String[] @default([])
  @@check("array_length(technologies, 1) <= 50")
}
```

### Add Indexes (15 mins each)

**[ ] Active Sessions Index**
```sql
CREATE INDEX CONCURRENTLY idx_active_sessions
ON sessions(user_id, is_active)
WHERE is_active = true;
```

**[ ] Non-Deleted Files Index**
```sql
CREATE INDEX CONCURRENTLY idx_non_deleted_files
ON storage_files(user_id, deleted_at)
WHERE deleted_at IS NULL;
```

---

## 🧩 Browser Extension

**[ ] Add Authentication (1 hour)**
File: `browser-extension/background.js`
```javascript
async function getAuthToken() {
  const { authToken } = await chrome.storage.local.get(['authToken']);
  return authToken;
}

async function syncJobToBackend(jobData) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });

  return response.ok;
}
```

**[ ] Create Login Page (1 hour)**
File: `browser-extension/login.html` + `login.js`

**[ ] Add Environment Config (30 mins)**
File: `browser-extension/config.js`

**[ ] Create Icons (30 mins)**
Use favicon.io to generate 16, 32, 48, 128px icons

---

## 🧪 Testing

### API Route Tests (3 hours each route)

**[ ] Test auth.routes.js**
```javascript
// apps/api/tests/auth.routes.test.js
test('POST /api/v1/auth/login - success', async (t) => {
  const app = await build(t);

  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email: 'test@example.com',
      password: 'Test1234'
    }
  });

  t.equal(response.statusCode, 200);
  t.ok(response.json().token);
});

test('POST /api/v1/auth/login - invalid credentials', async (t) => {
  // Test error case
});

test('POST /api/v1/auth/login - rate limiting', async (t) => {
  // Test 6 rapid attempts
});
```

**[ ] Test files.routes.js**
- Upload file
- Download file
- List files
- Delete file
- Unauthorized access
- File too large

**[ ] Test resume.routes.js**
- Create resume
- Get resume
- Update resume
- Delete resume
- List resumes

### Component Tests (2 hours each)

**[ ] Test DashboardState**
```typescript
// apps/web/src/app/dashboard/__tests__/DashboardState.test.tsx
import { render, screen } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../DashboardState';

test('provides dashboard state', () => {
  const TestComponent = () => {
    const { activeTab, setActiveTab } = useDashboard();
    return <div onClick={() => setActiveTab('jobs')}>{activeTab}</div>;
  };

  render(
    <DashboardProvider>
      <TestComponent />
    </DashboardProvider>
  );

  expect(screen.getByText('resumes')).toBeInTheDocument();
});
```

**[ ] Test useModals**
- Open modal
- Close modal
- Close all
- Pass data to modal

---

## 📦 Quick Reference

### Most Important Tasks (Do First)

1. ✅ Delete exposed credentials (15 mins)
2. ✅ Enable CSRF (30 mins)
3. ✅ Add auth rate limiting (30 mins)
4. ✅ Reduce JWT expiration (30 mins)
5. ✅ Split DashboardPageClient (3 hours)
6. ✅ Split useResumeData (4 hours)
7. ✅ Add API versioning (1 hour)
8. ✅ Split storage.routes.js (4 hours)
9. ✅ Add file route tests (3 hours)
10. ✅ Fix browser extension auth (2 hours)

### Time Estimates by Component

| Component | Estimated Time | Priority |
|-----------|----------------|----------|
| Security fixes | 4 hours | 🔴 CRITICAL |
| DashboardPageClient split | 6 hours | 🔴 HIGH |
| useResumeData split | 4 hours | 🔴 HIGH |
| ProfessionalTab split | 3 hours | 🟡 MEDIUM |
| SkillsTab split | 3 hours | 🟡 MEDIUM |
| storage.routes.js split | 6 hours | 🔴 HIGH |
| users.routes.js split | 4 hours | 🟡 MEDIUM |
| resume.routes.js refactor | 3 hours | 🟡 MEDIUM |
| File route tests | 3 hours | 🔴 HIGH |
| Resume route tests | 3 hours | 🔴 HIGH |
| Browser extension | 4 hours | 🟡 MEDIUM |
| Documentation | 6 hours | 🟢 LOW |

---

**Start with Security Fixes from IMPLEMENTATION_CHECKLIST.md Phase 0! 🚀**
