# Resume Builder Database Schema Documentation

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Tables](#core-tables)
4. [Supporting Tables](#supporting-tables)
5. [Indexes](#indexes)
6. [Constraints](#constraints)
7. [JSON Schema Definitions](#json-schema-definitions)
8. [Migration History](#migration-history)

---

## Overview

The Resume Builder uses a PostgreSQL database with Prisma ORM. The schema supports:
- Multi-resume management (slot-based system)
- Working draft system for auto-save
- AI-powered tailoring with version history
- Template management
- Analytics and sharing

**Key Design Decisions:**
- **Slot-based system**: Users have limited resume slots based on subscription tier
- **Working drafts**: Separate table for unsaved changes (auto-save every 5s)
- **JSON storage**: Resume data stored as JSON for flexibility
- **Soft deletes**: `deletedAt` column for recovery
- **Optimistic locking**: `version` column to prevent concurrent edit conflicts

---

## Entity Relationship Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1:N
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│  BaseResume  │◄───────────────────│ WorkingDraft │
└──────┬───────┘        1:1         └──────────────┘
       │
       │ 1:N
       ├─────────────────┬──────────────────┬────────────────┬─────────────────┐
       │                 │                  │                │                 │
       ▼                 ▼                  ▼                ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Tailored   │  │  Generated   │  │    Resume    │  │    Resume    │  │    Resume    │
│   Version    │  │   Document   │  │  ShareLink   │  │  Analytics   │  │    Cache     │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Core Tables

### 1. User

Stores user account information and subscription details.

```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String?
  subscriptionTier      String   @default("FREE") // FREE, PRO, PREMIUM
  resumeAiUsageCount    Int      @default(0)
  resumeAiUsageLimit    Int      @default(10)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  baseResumes           BaseResume[]
  workingDrafts         WorkingDraft[]
  tailoredVersions      TailoredVersion[]
  
  @@index([email])
  @@index([subscriptionTier])
}
```

**Columns:**
- `id`: Unique identifier (CUID)
- `email`: User's email address (unique)
- `name`: User's display name
- `subscriptionTier`: Subscription level (FREE=1 slot, PRO/PREMIUM=5 slots)
- `resumeAiUsageCount`: Number of AI operations used this month
- `resumeAiUsageLimit`: Maximum AI operations allowed per month

**Relationships:**
- One user → Many base resumes
- One user → Many working drafts
- One user → Many tailored versions

---

### 2. BaseResume

Stores the committed version of a resume.

```prisma
model BaseResume {
  id                    String    @id @default(cuid())
  userId                String
  slotNumber            Int       // 1-5 based on subscription
  name                  String
  isActive              Boolean   @default(false)
  
  data                  Json      // Resume content (see JSON schema below)
  formatting            Json?     // Font, colors, spacing
  metadata              Json?     // Template ID, tags, etc.
  
  fileHash              String?   // SHA-256 of imported file
  parsingConfidence     Float?    // 0-100 confidence score
  
  embedding             Float[]?  // Vector embedding for semantic search
  embeddingUpdatedAt    DateTime?
  
  version               Int       @default(1)  // For optimistic locking
  deletedAt             DateTime?              // Soft delete
  archivedAt            DateTime?              // Archive (hidden but not deleted)
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workingDraft          WorkingDraft?
  tailoredVersions      TailoredVersion[]
  generatedDocuments    GeneratedDocument[]
  shareLinks            ResumeShareLink[]
  analytics             ResumeAnalytics?
  cache                 ResumeCache[]
  
  @@unique([userId, slotNumber])
  @@index([userId])
  @@index([isActive])
  @@index([name])
  @@index([deletedAt])
  @@index([archivedAt])
  @@index([createdAt])
}
```

**Columns:**
- `id`: Unique identifier
- `userId`: Owner of the resume
- `slotNumber`: Which slot (1-5) this resume occupies
- `name`: User-defined name (e.g., "Software Engineer Resume")
- `isActive`: Only one resume can be active per user
- `data`: JSON object containing resume content (contact, experience, education, etc.)
- `formatting`: JSON object with styling preferences
- `metadata`: Additional metadata (template ID, tags, custom fields)
- `fileHash`: Hash of imported file (for deduplication)
- `parsingConfidence`: How confident the parser was (0-100)
- `embedding`: Vector representation for semantic search
- `version`: Incremented on each update (optimistic locking)
- `deletedAt`: Timestamp of soft delete (null = not deleted)
- `archivedAt`: Timestamp of archival (hidden but recoverable)

**Relationships:**
- Many base resumes → One user
- One base resume → One working draft (optional)
- One base resume → Many tailored versions
- One base resume → Many generated documents (exports)

---

### 3. WorkingDraft

Stores unsaved changes for auto-save functionality.

```prisma
model WorkingDraft {
  id                    String   @id @default(cuid())
  baseResumeId          String   @unique
  userId                String
  
  data                  Json     // Current draft data
  formatting            Json?
  metadata              Json?
  
  hasChanges            Boolean  @default(true)
  lastSavedAt           DateTime @default(now())
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  baseResume            BaseResume @relation(fields: [baseResumeId], references: [id], onDelete: Cascade)
  user                  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([updatedAt])
}
```

**Purpose:** 
- Auto-save changes every 5 seconds
- Prevent data loss on browser crash
- Allow discarding unsaved changes

**Lifecycle:**
1. User edits resume → Draft created/updated
2. User clicks "Save" → Draft committed to BaseResume, draft deleted
3. User clicks "Discard" → Draft deleted

---

### 4. TailoredVersion

Stores AI-tailored versions of a resume for specific jobs.

```prisma
model TailoredVersion {
  id                    String   @id @default(cuid())
  baseResumeId          String
  userId                String
  
  jobTitle              String?
  company               String?
  jobDescription        String?  @db.Text
  
  mode                  String   // "conservative", "moderate", "aggressive"
  tone                  String?  // "professional", "casual", "technical"
  
  data                  Json     // Tailored resume data
  diff                  Json?    // Changes made (for review)
  
  atsScoreBefore        Int?
  atsScoreAfter         Int?
  
  isPromoted            Boolean  @default(false) // User promoted to base resume
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  baseResume            BaseResume @relation(fields: [baseResumeId], references: [id], onDelete: Cascade)
  user                  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([baseResumeId])
  @@index([userId])
  @@index([userId, createdAt])
  @@index([createdAt])
}
```

**Purpose:**
- Store AI-tailored versions for job applications
- Track ATS score improvements
- Allow reverting to tailored versions

---

## Supporting Tables

### 5. GeneratedDocument

Stores exported resume files (PDF, DOCX, etc.).

```prisma
model GeneratedDocument {
  id                    String    @id @default(cuid())
  userId                String
  baseResumeId          String
  
  type                  String    // "PDF", "DOCX", "TXT", "JSON"
  templateId            String?
  
  data                  Json      // Snapshot of resume data at export time
  storagePath           String    // File path or S3 URL
  downloadToken         String    @unique
  
  fileName              String
  mimeType              String
  fileSize              Int?
  
  downloadCount         Int       @default(0)
  expiresAt             DateTime?
  
  createdAt             DateTime  @default(now())
  
  baseResume            BaseResume @relation(fields: [baseResumeId], references: [id], onDelete: Cascade)
  
  @@index([downloadToken])
  @@index([userId])
  @@index([expiresAt])
}
```

**Purpose:**
- Store exported files temporarily (1 hour expiry)
- Provide download links
- Track download counts

---

### 6. ResumeShareLink

Stores public sharing links for resumes.

```prisma
model ResumeShareLink {
  id                    String    @id @default(cuid())
  baseResumeId          String
  userId                String
  
  token                 String    @unique
  passwordHash          String?   // Optional password protection
  
  viewCount             Int       @default(0)
  isActive              Boolean   @default(true)
  allowDownload         Boolean   @default(true)
  
  expiresAt             DateTime?
  lastAccessedAt        DateTime?
  
  createdAt             DateTime  @default(now())
  
  baseResume            BaseResume @relation(fields: [baseResumeId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([baseResumeId])
}
```

**Purpose:**
- Share resume publicly without login
- Optional password protection
- Track views and last access

---

### 7. ResumeAnalytics

Stores usage analytics for each resume.

```prisma
model ResumeAnalytics {
  id                    String    @id @default(cuid())
  resumeId              String    @unique
  
  viewCount             Int       @default(0)
  exportCount           Int       @default(0)
  tailorCount           Int       @default(0)
  shareCount            Int       @default(0)
  
  lastViewedAt          DateTime?
  lastExportedAt        DateTime?
  lastTailoredAt        DateTime?
  lastSharedAt          DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  baseResume            BaseResume @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  
  @@index([resumeId])
}
```

---

### 8. ResumeCache

Stores cached AI results (ATS scores, job analysis).

```prisma
model ResumeCache {
  id                    String   @id @default(cuid())
  resumeId              String
  namespace             String   // "ATS_SCORE", "JOB_ANALYSIS", etc.
  key                   String   // Hash of input parameters
  
  value                 Json     // Cached result
  
  hitCount              Int      @default(0)
  lastUsedAt            DateTime @default(now())
  expiresAt             DateTime?
  
  createdAt             DateTime @default(now())
  
  baseResume            BaseResume @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  
  @@unique([resumeId, namespace, key])
  @@index([namespace])
  @@index([lastUsedAt])
  @@index([expiresAt])
}
```

---

## Indexes

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_subscription ON "User"("subscriptionTier");

-- Resume queries
CREATE INDEX idx_base_resume_user ON "BaseResume"("userId");
CREATE INDEX idx_base_resume_active ON "BaseResume"("isActive");
CREATE INDEX idx_base_resume_name ON "BaseResume"(name);
CREATE INDEX idx_base_resume_deleted ON "BaseResume"("deletedAt");
CREATE INDEX idx_base_resume_created ON "BaseResume"("createdAt");

-- Draft queries
CREATE INDEX idx_working_draft_user ON "WorkingDraft"("userId");
CREATE INDEX idx_working_draft_updated ON "WorkingDraft"("updatedAt");

-- Tailored version queries
CREATE INDEX idx_tailored_version_resume ON "TailoredVersion"("baseResumeId");
CREATE INDEX idx_tailored_version_user ON "TailoredVersion"("userId");
CREATE INDEX idx_tailored_version_user_created ON "TailoredVersion"("userId", "createdAt");

-- Cache queries
CREATE INDEX idx_resume_cache_namespace ON "ResumeCache"(namespace);
CREATE INDEX idx_resume_cache_last_used ON "ResumeCache"("lastUsedAt");
CREATE INDEX idx_resume_cache_expires ON "ResumeCache"("expiresAt");
```

---

## Constraints

### CHECK Constraints

```sql
-- Slot number must be between 1 and 5
ALTER TABLE "BaseResume"
ADD CONSTRAINT slot_number_range
CHECK ("slotNumber" >= 1 AND "slotNumber" <= 5);

-- Resume name length
ALTER TABLE "BaseResume"
ADD CONSTRAINT name_length
CHECK (char_length(name) <= 100);

-- Parsing confidence range
ALTER TABLE "BaseResume"
ADD CONSTRAINT parsing_confidence_range
CHECK ("parsingConfidence" IS NULL OR ("parsingConfidence" >= 0 AND "parsingConfidence" <= 100));

-- ATS score range
ALTER TABLE "TailoredVersion"
ADD CONSTRAINT ats_score_range
CHECK (
  ("atsScoreBefore" IS NULL OR ("atsScoreBefore" >= 0 AND "atsScoreBefore" <= 100)) AND
  ("atsScoreAfter" IS NULL OR ("atsScoreAfter" >= 0 AND "atsScoreAfter" <= 100))
);
```

### UNIQUE Constraints

```sql
-- One resume per slot per user
ALTER TABLE "BaseResume"
ADD CONSTRAINT unique_user_slot
UNIQUE ("userId", "slotNumber");

-- One working draft per resume
ALTER TABLE "WorkingDraft"
ADD CONSTRAINT unique_resume_draft
UNIQUE ("baseResumeId");

-- Unique share tokens
ALTER TABLE "ResumeShareLink"
ADD CONSTRAINT unique_share_token
UNIQUE (token);
```

---

## JSON Schema Definitions

### BaseResume.data Schema

```typescript
interface ResumeData {
  contact: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
    location?: string;
    links?: Array<{
      type: 'linkedin' | 'github' | 'website' | 'portfolio' | 'other';
      url: string;
      label?: string;
    }>;
  };
  
  summary?: string;
  
  experience?: Array<{
    company: string;
    role: string;
    location?: string;
    startDate?: string; // YYYY-MM or YYYY-MM-DD
    endDate?: string;
    isCurrent?: boolean;
    bullets?: string[];
  }>;
  
  education?: Array<{
    institution: string;
    degree?: string;
    field?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    bullets?: string[];
  }>;
  
  skills?: {
    technical?: string[];
    tools?: string[];
    soft?: string[];
  };
  
  projects?: Array<{
    name: string;
    summary?: string;
    technologies?: string[];
    link?: string;
    bullets?: string[];
  }>;
  
  certifications?: Array<{
    name: string;
    issuer?: string;
    issueDate?: string;
    expirationDate?: string;
    link?: string;
  }>;
  
  customSections?: Array<{
    id: string;
    name: string;
    content?: string;
    bullets?: string[];
  }>;
}
```

### BaseResume.formatting Schema

```typescript
interface ResumeFormatting {
  font?: {
    family: string; // "Inter", "Roboto", etc.
    size: number;   // 8-18
    lineHeight: number; // 1.0-2.5
  };
  
  colors?: {
    primary: string;   // Hex color
    secondary: string;
    text: string;
    background: string;
  };
  
  spacing?: {
    margins: {
      top: number;    // 0.25-2 inches
      right: number;
      bottom: number;
      left: number;
    };
    sectionGap: number; // pixels
  };
  
  layout?: {
    columns: 1 | 2;
    sectionOrder: string[]; // ["contact", "summary", "experience", ...]
  };
}
```

### BaseResume.metadata Schema

```typescript
interface ResumeMetadata {
  templateId?: string;
  tags?: string[];
  industry?: string;
  targetRole?: string;
  lastAtsScore?: number;
  lastAtsCheckAt?: string;
  importedFrom?: string; // "pdf", "docx", "linkedin"
  duplicatedFrom?: string; // Resume ID if duplicated
  duplicatedAt?: string;
}
```

---

## Migration History

### Initial Schema (2024-01-01)
- Created User, BaseResume, WorkingDraft, TailoredVersion tables

### Version 2 (2024-06-15)
- Added GeneratedDocument table for exports
- Added ResumeShareLink table for sharing
- Added ResumeAnalytics table

### Version 3 (2024-09-20)
- Added ResumeCache table
- Added embedding column to BaseResume
- Added version column for optimistic locking

### Version 4 (2025-11-15) - Current
- Added deletedAt, archivedAt columns for soft delete/archive
- Added all performance indexes
- Added CHECK constraints
- Added tags column to BaseResume

---

## Best Practices

### Querying Resumes
```javascript
// Always filter out deleted resumes
const resumes = await prisma.baseResume.findMany({
  where: {
    userId: userId,
    deletedAt: null, // Important!
  },
});
```

### Updating with Optimistic Locking
```javascript
// Check version before update
const resume = await prisma.baseResume.findUnique({ where: { id } });
if (resume.version !== expectedVersion) {
  throw new Error('RESUME_CONFLICT');
}

await prisma.baseResume.update({
  where: { id },
  data: {
    ...updateData,
    version: { increment: 1 },
  },
});
```

### Soft Delete
```javascript
// Soft delete (recoverable)
await prisma.baseResume.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Hard delete (permanent)
await prisma.baseResume.delete({ where: { id } });
```

---

**End of Documentation**


