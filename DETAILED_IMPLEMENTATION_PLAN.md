# RoleReady - Detailed Step-by-Step Implementation Plan

**Goal:** Complete, fully functional application with real-time backend integration  
**Timeline:** 4-5 weeks  
**Approach:** Hybrid (Frontend Polish → API Design → Backend Integration → AI Integration)

---

## 📅 WEEK 1: Frontend Polish (Days 1-5)

### **DAY 1: Fix Critical UI Bugs & Error Handling**

#### **Morning (3-4 hours): Setup & Quick Wins**

**Step 1.1: Create Bug Fix Checklist**
- [ ] Open `END_TO_END_TESTING_REPORT.md`
- [ ] Create `BUGS_TO_FIX.md` with all marked issues
- [ ] Prioritize: Critical (blocks functionality) → High (affects UX) → Low (polish)

**Files to Create:**
```
BUGS_TO_FIX.md
```

**Step 1.2: Fix PowerShell Scripts** ✅ (Already Done)
- [x] Verify `start-dev.ps1` works
- [x] Verify `START_SERVERS.ps1` works
- [ ] Test by running: `.\start-dev.ps1`

**Step 1.3: Add Global Error Handling**

**File:** `apps/web/src/components/GlobalErrorBoundary.tsx`
- [ ] Enhance error messages
- [ ] Add "Report Bug" functionality
- [ ] Add error logging to console/file

**Code to Add:**
```typescript
// Add better error recovery
const handleReload = () => {
  window.location.reload();
};

const handleClearCache = () => {
  localStorage.clear();
  window.location.reload();
};
```

#### **Afternoon (3-4 hours): Form Validations**

**Step 1.4: Add Missing Validations**

**Files to Update:**
1. `apps/web/src/components/features/ResumeEditor.tsx`
   - [ ] Validate email format in contact section
   - [ ] Validate date formats (start/end dates)
   - [ ] Prevent empty required fields
   - [ ] Add character limits with counters

**Code to Add:**
```typescript
// In ContactSection component
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Add to email input
onChange={(e) => {
  const value = e.target.value;
  if (value && !validateEmail(value)) {
    setEmailError('Invalid email format');
  } else {
    setEmailError('');
  }
  setEmail(value);
}}
```

2. `apps/web/src/components/JobTracker.tsx`
   - [ ] Validate job URL format
   - [ ] Validate date fields
   - [ ] Required field indicators
   - [ ] Salary format validation

3. `apps/web/src/components/email/components/EmailComposerAI.tsx`
   - [ ] Validate email addresses in To/CC/BCC
   - [ ] Required field validation
   - [ ] Subject character limit (100 chars)

**Step 1.5: Add Loading States**

**Create:** `apps/web/src/hooks/useLoadingState.ts`
```typescript
import { useState, useCallback } from 'react';

export function useLoadingState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: Error) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      if (onError) onError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
}
```

**Files to Update:**
- [ ] Resume Editor: Add loading to save button
- [ ] Job Tracker: Add loading to add/edit job
- [ ] Email Composer: Add loading to send button
- [ ] Profile: Add loading to save changes

**Step 1.6: Add Toast Notifications**

**File:** `apps/web/src/components/ui/Toast.tsx` (Create if doesn't exist)

**Update:** All components to use toast notifications
- [ ] Success: "Resume saved successfully"
- [ ] Error: "Failed to save resume"
- [ ] Info: "Auto-saving..."
- [ ] Warning: "You have unsaved changes"

---

### **DAY 2: Complete Export/Import & Keyboard Shortcuts**

#### **Morning (3-4 hours): Export Functionality**

**Step 2.1: Fix PDF Export**

**File:** `apps/web/src/components/features/ResumeEditor.tsx`

**Update Export Modal:**
```typescript
const handleExportPDF = async () => {
  try {
    setIsExporting(true);
    
    // Use html2canvas + jsPDF
    const element = document.getElementById('resume-preview');
    if (!element) throw new Error('Preview element not found');
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${resumeFileName || 'resume'}.pdf`);
    
    toast.success('PDF exported successfully');
  } catch (error) {
    toast.error('Failed to export PDF');
    logger.error('Export error:', error);
  } finally {
    setIsExporting(false);
  }
};
```

**Step 2.2: Fix Word Export**

**Install dependency:**
```bash
cd apps/web
npm install docx
```

**Code to Add:**
```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

const handleExportWord = async () => {
  try {
    setIsExporting(true);
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: resumeData.name || 'Resume', bold: true, size: 32 })
            ]
          }),
          // Add all resume sections as paragraphs
          ...resumeData.experience?.map(exp => 
            new Paragraph({
              children: [
                new TextRun({ text: exp.title, bold: true }),
                new TextRun({ text: ` at ${exp.company}` })
              ]
            })
          ) || []
        ]
      }]
    });
    
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeFileName || 'resume'}.docx`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Word document exported successfully');
  } catch (error) {
    toast.error('Failed to export Word document');
    logger.error('Export error:', error);
  } finally {
    setIsExporting(false);
  }
};
```

#### **Afternoon (3-4 hours): Import Functionality**

**Step 2.3: Complete Resume Import from JSON**

**File:** `apps/web/src/components/modals/ImportModal.tsx`

**Update:**
```typescript
const handleImportJSON = async (file: File) => {
  try {
    setIsImporting(true);
    const text = await file.text();
    const importedData = JSON.parse(text);
    
    // Validate structure
    if (!importedData.resumeData) {
      throw new Error('Invalid resume file format');
    }
    
    // Migrate data
    setResumeData(importedData.resumeData);
    if (importedData.customSections) setCustomSections(importedData.customSections);
    if (importedData.resumeFileName) setResumeFileName(importedData.resumeFileName);
    
    toast.success('Resume imported successfully');
    onClose();
  } catch (error) {
    toast.error('Failed to import resume');
    logger.error('Import error:', error);
  } finally {
    setIsImporting(false);
  }
};
```

**Step 2.4: Add PDF Import (Basic)**

**Install:**
```bash
npm install pdf-parse
```

**Code:**
```typescript
import pdf from 'pdf-parse';

const handleImportPDF = async (file: File) => {
  try {
    setIsImporting(true);
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdf(Buffer.from(arrayBuffer));
    
    // Extract text and try to parse
    // This is basic - full parsing would need ML/NLP
    const text = data.text;
    
    // Simple extraction (enhance with better parsing)
    const lines = text.split('\n');
    const name = lines[0] || '';
    
    setResumeData({
      ...resumeData,
      name,
      // Add more parsing logic
    });
    
    toast.success('PDF imported (basic parsing)');
  } catch (error) {
    toast.error('Failed to parse PDF');
  } finally {
    setIsImporting(false);
  }
};
```

**Step 2.5: Complete Keyboard Shortcuts**

**File:** `apps/web/src/hooks/useKeyboardShortcuts.ts`

**Update:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S: Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
    
    // Ctrl+N: New Resume
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      onNewResume?.();
    }
    
    // Ctrl+E: Export
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      onExport?.();
    }
    
    // Ctrl+F: Search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      onSearch?.();
    }
    
    // Ctrl+Z: Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      onUndo?.();
    }
    
    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      onRedo?.();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onSave, onNewResume, onExport, onSearch, onUndo, onRedo]);
```

**Files to Update:**
- [ ] Resume Editor: Connect all shortcuts
- [ ] Job Tracker: Add shortcuts
- [ ] Email Composer: Add shortcuts

---

### **DAY 3: UI Polish & User Feedback**

#### **Step 3.1: Add Success/Error Messages Everywhere**

**Create:** `apps/web/src/utils/toast.ts`
```typescript
import { toast } from 'react-hot-toast'; // or your toast library

export const showSuccess = (message: string) => {
  toast.success(message, { duration: 3000 });
};

export const showError = (message: string) => {
  toast.error(message, { duration: 4000 });
};

export const showInfo = (message: string) => {
  toast.info(message, { duration: 3000 });
};
```

**Update All Components:**
- [ ] Every save operation
- [ ] Every delete operation
- [ ] Every export/import
- [ ] Form submissions

#### **Step 3.2: Add Auto-Save Indicators**

**File:** `apps/web/src/hooks/useAutoSave.ts`

**Enhance:**
```typescript
const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

useEffect(() => {
  const timer = setTimeout(() => {
    setSaveStatus('saving');
    saveToStorage().then(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('saved'), 2000);
    });
  }, 2000); // Debounce 2 seconds

  return () => clearTimeout(timer);
}, [data]);

// Show in UI
{saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
{saveStatus === 'saved' && <span className="text-green-500">Saved</span>}
{saveStatus === 'unsaved' && <span className="text-orange-500">Unsaved changes</span>}
```

#### **Step 3.3: Fix Modal Closing Issues**

**Check All Modals:**
- [ ] Close on outside click
- [ ] Close on Escape key
- [ ] Close button works
- [ ] Don't close on form submit (unless successful)

**Code Pattern:**
```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

---

### **DAY 4-5: Testing & Final Polish**

#### **Step 4.1: End-to-End Testing**

**Test Checklist:**
- [ ] Create test account
- [ ] Create resume from scratch
- [ ] Save resume
- [ ] Export to PDF
- [ ] Export to Word
- [ ] Import JSON resume
- [ ] Add job to tracker
- [ ] Create cover letter
- [ ] Send test email
- [ ] Upload file to cloud storage
- [ ] Test all keyboard shortcuts
- [ ] Test form validations
- [ ] Test error handling (disconnect API)

#### **Step 4.2: Performance Optimization**

**Tasks:**
- [ ] Add React.memo to heavy components
- [ ] Lazy load images
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Check Lighthouse scores

#### **Step 4.3: Documentation**

**Create:**
- [ ] `USER_GUIDE.md` - How to use the app
- [ ] `KEYBOARD_SHORTCUTS.md` - All shortcuts
- [ ] Update `README.md` with current status

---

## 📅 WEEK 1-2: API Design & Abstraction Layer (Days 6-10)

### **DAY 6: API Type Definitions**

#### **Step 6.1: Create API Types**

**Create:** `apps/web/src/types/api.ts`

```typescript
// ===== AUTHENTICATION =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken?: string; // If not using httpOnly cookies
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
}

// ===== USER =====
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  phone?: string;
  // ... all profile fields
}

// ===== RESUME =====
export interface Resume {
  id: string;
  userId: string;
  name: string;
  data: ResumeData;
  customSections?: CustomSection[];
  fontFamily?: string;
  fontSize?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface CreateResumeRequest {
  name: string;
  data: ResumeData;
  customSections?: CustomSection[];
}

export interface UpdateResumeRequest extends Partial<CreateResumeRequest> {
  id: string;
}

// ===== JOB =====
export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location?: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'archived';
  appliedDate: string;
  salary?: string;
  description?: string;
  url?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  remote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  location?: string;
  status?: Job['status'];
  appliedDate: string;
  // ... all job fields
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string;
}

// ===== EMAIL =====
export interface Email {
  id: string;
  userId: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  sentAt?: string;
  createdAt: string;
}

export interface SendEmailRequest {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[];
}

// ===== CLOUD STORAGE =====
export interface CloudFile {
  id: string;
  userId: string;
  name: string;
  type: 'resume' | 'cover-letter' | 'portfolio' | 'other';
  size: string;
  data: any;
  tags?: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== AI =====
export interface AIRequest {
  type: 'resume-optimize' | 'generate-content' | 'email' | 'cover-letter';
  prompt: string;
  context?: any;
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  metadata?: any;
}

// ===== API RESPONSE WRAPPERS =====
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

#### **Step 6.2: Create API Service Interface**

**Update:** `apps/web/src/services/apiService.ts`

**Add Interface:**
```typescript
export interface IApiService {
  // Auth
  login(email: string, password: string): Promise<LoginResponse>;
  register(data: RegisterRequest): Promise<RegisterResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  
  // Resume
  getResumes(): Promise<Resume[]>;
  getResume(id: string): Promise<Resume>;
  createResume(data: CreateResumeRequest): Promise<Resume>;
  updateResume(id: string, data: UpdateResumeRequest): Promise<Resume>;
  deleteResume(id: string): Promise<void>;
  
  // Jobs
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job>;
  createJob(data: CreateJobRequest): Promise<Job>;
  updateJob(id: string, data: UpdateJobRequest): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  
  // Profile
  getProfile(): Promise<UserProfile>;
  updateProfile(data: Partial<UserProfile>): Promise<UserProfile>;
  
  // Cloud Storage
  saveFile(file: CloudFile): Promise<CloudFile>;
  getFiles(): Promise<CloudFile[]>;
  deleteFile(id: string): Promise<void>;
  
  // AI
  generateAI(request: AIRequest): Promise<AIResponse>;
  
  // Email
  sendEmail(data: SendEmailRequest): Promise<Email>;
}
```

---

### **DAY 7: Mock API Implementation**

#### **Step 7.1: Create Mock API Service**

**Create:** `apps/web/src/services/apiMockService.ts`

```typescript
import { IApiService } from './apiService';
import * as API from '../types/api';

export class MockApiService implements IApiService {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email: string, password: string): Promise<API.LoginResponse> {
    await this.delay(800);
    
    // Simulate validation
    if (email === 'test@example.com' && password === 'password') {
      return {
        user: {
          id: '1',
          name: 'Test User',
          email: email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async register(data: API.RegisterRequest): Promise<API.RegisterResponse> {
    await this.delay(800);
    return {
      user: {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  async logout(): Promise<void> {
    await this.delay(300);
  }

  async getCurrentUser(): Promise<API.User> {
    await this.delay(300);
    // Get from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored);
    }
    throw new Error('Not authenticated');
  }

  async getResumes(): Promise<API.Resume[]> {
    await this.delay(500);
    const stored = localStorage.getItem('resumes');
    return stored ? JSON.parse(stored) : [];
  }

  async getResume(id: string): Promise<API.Resume> {
    await this.delay(300);
    const resumes = await this.getResumes();
    const resume = resumes.find(r => r.id === id);
    if (!resume) throw new Error('Resume not found');
    return resume;
  }

  async createResume(data: API.CreateResumeRequest): Promise<API.Resume> {
    await this.delay(600);
    const resumes = await this.getResumes();
    const newResume: API.Resume = {
      id: Date.now().toString(),
      userId: '1',
      name: data.name,
      data: data.data,
      customSections: data.customSections || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    resumes.push(newResume);
    localStorage.setItem('resumes', JSON.stringify(resumes));
    return newResume;
  }

  async updateResume(id: string, data: API.UpdateResumeRequest): Promise<API.Resume> {
    await this.delay(600);
    const resumes = await this.getResumes();
    const index = resumes.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Resume not found');
    
    resumes[index] = {
      ...resumes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('resumes', JSON.stringify(resumes));
    return resumes[index];
  }

  async deleteResume(id: string): Promise<void> {
    await this.delay(400);
    const resumes = await this.getResumes();
    const filtered = resumes.filter(r => r.id !== id);
    localStorage.setItem('resumes', JSON.stringify(filtered));
  }

  // ... Implement all other methods similarly
  // Jobs, Profile, Cloud Storage, AI, Email
}
```

#### **Step 7.2: Create API Service with Fallback**

**Update:** `apps/web/src/services/apiService.ts`

```typescript
import { IApiService } from './apiService';
import { MockApiService } from './apiMockService';
import * as API from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

class RealApiService implements IApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<API.LoginResponse> {
    return this.request<API.LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ... Implement all methods
}

// Export service with fallback
class ApiServiceWithFallback implements IApiService {
  private realService: RealApiService;
  private mockService: MockApiService;
  private useMock: boolean;

  constructor() {
    this.realService = new RealApiService();
    this.mockService = new MockApiService();
    this.useMock = USE_MOCK;
  }

  async login(email: string, password: string): Promise<API.LoginResponse> {
    if (this.useMock) {
      return this.mockService.login(email, password);
    }

    try {
      return await this.realService.login(email, password);
    } catch (error) {
      console.warn('Real API failed, using mock:', error);
      return this.mockService.login(email, password);
    }
  }

  // Implement all methods with fallback pattern
  async getResumes(): Promise<API.Resume[]> {
    if (this.useMock) {
      return this.mockService.getResumes();
    }

    try {
      const response = await this.realService.getResumes();
      // Cache in localStorage
      localStorage.setItem('resumes_cache', JSON.stringify(response));
      return response;
    } catch (error) {
      console.warn('Real API failed, using cache:', error);
      const cached = localStorage.getItem('resumes_cache');
      return cached ? JSON.parse(cached) : this.mockService.getResumes();
    }
  }

  // ... All other methods
}

export const apiService = new ApiServiceWithFallback();
export default apiService;
```

---

### **DAY 8-9: Update Components to Use API Service**

#### **Step 8.1: Update Resume Components**

**File:** `apps/web/src/hooks/useResumeData.ts`

**Update:**
```typescript
import apiService from '../services/apiService';

export function useResumeData() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const data = await apiService.getResumes();
      setResumes(data);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (resumeData: ResumeData) => {
    setLoading(true);
    try {
      if (currentResume?.id) {
        const updated = await apiService.updateResume(currentResume.id, {
          data: resumeData
        });
        setCurrentResume(updated);
      } else {
        const created = await apiService.createResume({
          name: resumeFileName || 'Untitled Resume',
          data: resumeData
        });
        setCurrentResume(created);
      }
      await loadResumes(); // Refresh list
    } catch (error) {
      console.error('Failed to save resume:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ... Other methods
}
```

**Repeat for:**
- [ ] Job Tracker hooks
- [ ] Profile hooks
- [ ] Cloud Storage hooks
- [ ] Email hooks

---

### **DAY 10: API Documentation**

#### **Step 10.1: Document All Endpoints**

**Create:** `API_DESIGN.md`

Document:
- [ ] All endpoint URLs
- [ ] Request/Response formats
- [ ] Error codes
- [ ] Authentication requirements
- [ ] Rate limits
- [ ] Examples

---

## 📅 WEEK 2-3: Critical Backend Integration (Days 11-21)

### **DAY 11-12: Authentication Backend**

#### **Step 11.1: Set Up Database**

**File:** `apps/api/prisma/schema.prisma`

**Verify Schema:**
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  resumes       Resume[]
  jobs          Job[]
  cloudFiles    CloudFile[]
}

model Resume {
  id            String   @id @default(uuid())
  userId        String
  name          String
  data          Json
  customSections Json?
  fontFamily    String?
  fontSize      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
}

model Job {
  id          String   @id @default(uuid())
  userId      String
  title       String
  company     String
  status      String
  appliedDate DateTime
  // ... all fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
}

// ... Other models
```

**Run Migration:**
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

#### **Step 11.2: Implement Real Auth Endpoints**

**Update:** `apps/api/simple-server.js` or create `apps/api/src/routes/auth.ts`

**Implement:**
- [ ] POST `/api/auth/register` - Create user with hashed password
- [ ] POST `/api/auth/login` - Authenticate and set httpOnly cookie
- [ ] POST `/api/auth/logout` - Clear cookie
- [ ] GET `/api/auth/verify` - Verify token
- [ ] POST `/api/auth/refresh` - Refresh token

**Code Pattern:**
```javascript
// Register
if (path === '/api/auth/register' && method === 'POST') {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { name, email, password } = JSON.parse(body);
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user in database
      const user = await prisma.user.create({
        data: { name, email, passwordHash }
      });
      
      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      // Set httpOnly cookie
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        user: { id: user.id, name: user.name, email: user.email }
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}
```

---

### **DAY 13-15: Resume Builder Backend**

#### **Step 13.1: Implement Resume CRUD Endpoints**

**Create:** `apps/api/src/routes/resumes.ts`

**Implement:**
- [ ] GET `/api/resumes` - Get all user's resumes
- [ ] GET `/api/resumes/:id` - Get single resume
- [ ] POST `/api/resumes` - Create resume
- [ ] PUT `/api/resumes/:id` - Update resume
- [ ] DELETE `/api/resumes/:id` - Delete resume

**Code:**
```javascript
// GET /api/resumes
const resumes = await prisma.resume.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: 'desc' }
});

res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ resumes }));

// POST /api/resumes
const resume = await prisma.resume.create({
  data: {
    userId: user.id,
    name: body.name,
    data: body.data,
    customSections: body.customSections || {}
  }
});

res.writeHead(201, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ resume }));

// PUT /api/resumes/:id
const resume = await prisma.resume.update({
  where: { id: resumeId, userId: user.id },
  data: body
});

// DELETE /api/resumes/:id
await prisma.resume.delete({
  where: { id: resumeId, userId: user.id }
});
```

#### **Step 13.2: Connect Frontend to Backend**

**Update:** `apps/web/src/services/apiService.ts`

**Enable Real API:**
```typescript
// In .env.local
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Test:**
- [ ] Create resume
- [ ] Update resume
- [ ] Delete resume
- [ ] Load resumes
- [ ] Verify data persists after refresh

---

### **DAY 16-18: Job Tracker Backend**

#### **Step 16.1: Implement Job CRUD Endpoints**

**Create:** `apps/api/src/routes/jobs.ts`

**Same pattern as resumes:**
- [ ] GET `/api/jobs`
- [ ] GET `/api/jobs/:id`
- [ ] POST `/api/jobs`
- [ ] PUT `/api/jobs/:id`
- [ ] DELETE `/api/jobs/:id`

**Update Frontend:**
- [ ] Update `useJobsApi` hook
- [ ] Test all operations
- [ ] Verify persistence

---

### **DAY 19-21: Profile & Cloud Storage Backend**

#### **Step 19.1: Profile Backend**

**Implement:**
- [ ] GET `/api/users/profile`
- [ ] PUT `/api/users/profile`
- [ ] POST `/api/users/profile/avatar` (file upload)

#### **Step 19.2: Cloud Storage Backend**

**Implement:**
- [ ] GET `/api/cloud/files`
- [ ] POST `/api/cloud/files`
- [ ] DELETE `/api/cloud/files/:id`
- [ ] POST `/api/cloud/files/:id/share`

**File Upload:**
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Handle file upload
server.post('/api/cloud/files', { preHandler: upload.single('file') }, async (req, reply) => {
  const file = req.file;
  const metadata = JSON.parse(req.body.metadata);
  
  // Save file info to database
  const cloudFile = await prisma.cloudFile.create({
    data: {
      userId: user.id,
      name: metadata.name,
      type: metadata.type,
      filePath: file.path,
      size: file.size.toString()
    }
  });
  
  return { file: cloudFile };
});
```

---

## 📅 WEEK 3-4: Real AI Integration (Days 22-28)

### **DAY 22-23: OpenAI Setup**

#### **Step 22.1: Set Up OpenAI API**

**Backend:** `apps/api-python/main.py` or `apps/api/src/routes/ai.ts`

**Install:**
```bash
cd apps/api-python
pip install openai python-dotenv
```

**Code:**
```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.post("/api/ai/generate")
async def generate_ai(request: AIRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for resume building."},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return {
            "content": response.choices[0].message.content,
            "success": True
        }
    except Exception as e:
        return {"error": str(e), "success": False}
```

**Environment:**
```bash
# apps/api-python/.env
OPENAI_API_KEY=your_key_here
```

#### **Step 22.2: Connect Frontend**

**Update:** `apps/web/src/services/aiService.ts`

```typescript
async generateContent(request: AIRequest): Promise<AIResponse> {
  const response = await fetch(`${AI_API_URL}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) throw new Error('AI generation failed');
  return await response.json();
}
```

---

### **DAY 24-25: Replace AI Mocks**

#### **Step 24.1: Resume AI Optimization**

**File:** `apps/web/src/components/features/AIPanel.tsx`

**Update:**
```typescript
const handleOptimize = async () => {
  setIsGenerating(true);
  try {
    const response = await aiService.generateContent({
      type: 'resume-optimize',
      prompt: `Optimize this resume: ${JSON.stringify(resumeData)}`,
      context: { jobDescription }
    });
    
    setOptimizedContent(response.content);
    toast.success('Resume optimized successfully');
  } catch (error) {
    toast.error('Failed to optimize resume');
  } finally {
    setIsGenerating(false);
  }
};
```

#### **Step 24.2: Email AI Generation**

**File:** `apps/web/src/components/email/components/EmailComposerAI.tsx`

**Update:**
```typescript
const generateFromPrompt = async () => {
  if (!aiPrompt.trim()) return;
  
  setIsGenerating(true);
  try {
    const response = await aiService.generateContent({
      type: 'email',
      prompt: aiPrompt,
      context: {
        recipientName,
        recipientEmail,
        purpose: 'cold-email'
      }
    });
    
    setBody(response.content);
    toast.success('Email generated');
  } catch (error) {
    toast.error('Failed to generate email');
  } finally {
    setIsGenerating(false);
  }
};
```

---

### **DAY 26-28: Testing & Polish**

#### **Step 26.1: End-to-End Testing**

**Test All Features:**
- [ ] Create account
- [ ] Create resume
- [ ] AI optimize resume
- [ ] Export resume
- [ ] Add job
- [ ] Generate cover letter with AI
- [ ] Generate email with AI
- [ ] Save to cloud
- [ ] Test on multiple devices

#### **Step 26.2: Performance Testing**

**Check:**
- [ ] API response times
- [ ] Frontend load times
- [ ] AI generation speeds
- [ ] Database query performance

#### **Step 26.3: Security Audit**

**Check:**
- [ ] All endpoints require authentication
- [ ] Input validation on backend
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting

---

## ✅ FINAL CHECKLIST

### **Functionality**
- [ ] All 12 features working
- [ ] Real backend integration
- [ ] Real AI working
- [ ] Data persists across sessions
- [ ] Multi-device sync works
- [ ] Offline fallback works

### **Code Quality**
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All tests passing
- [ ] Code documented
- [ ] API documented

### **User Experience**
- [ ] Loading states everywhere
- [ ] Error messages clear
- [ ] Success feedback
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive

### **Performance**
- [ ] Page load < 2s
- [ ] API responses < 500ms
- [ ] AI generation < 5s
- [ ] Bundle size optimized

---

## 🎯 SUCCESS CRITERIA

**By End of Week 4, you should have:**

1. ✅ **95%+ Backend Integration**
   - All data saves to database
   - Real authentication
   - Multi-device sync

2. ✅ **100% Real AI**
   - No mocks remaining
   - Real OpenAI integration
   - Error handling

3. ✅ **Production Ready**
   - All features functional
   - Error handling complete
   - Performance optimized
   - Security hardened

---

**This plan will take you from 78% functional (mostly localStorage) to 95%+ functional (fully integrated) in 4-5 weeks.**

Ready to start? Begin with Day 1 tasks!


