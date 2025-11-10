# AI Agent Auto-Apply - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [WebSocket Events](#websocket-events)
9. [Usage Guide](#usage-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The AI Agent Auto-Apply is a comprehensive job application automation system that uses AI to generate tailored resumes, cover letters, company research, and interview preparation materials.

### Key Features

- ✅ **Single & Bulk Processing**: Process one job or hundreds at once
- ✅ **AI-Powered Content**: Resume tailoring, cover letters, company research
- ✅ **ATS Optimization**: Automatic ATS score calculation with improvement suggestions
- ✅ **Real-Time Updates**: WebSocket integration for live progress tracking
- ✅ **Document Generation**: Export to PDF and DOCX formats
- ✅ **Smart Filtering**: Search and filter task history
- ✅ **Usage Limits**: Tier-based limits (FREE: 5, PRO: 50, PREMIUM: unlimited)
- ✅ **Mock Mode**: Test without API keys

---

## Architecture

### Tech Stack

**Backend:**
- Node.js / Fastify
- Prisma ORM (PostgreSQL)
- Bull Queue (Redis)
- Socket.IO (WebSocket)
- OpenAI / Anthropic Claude APIs

**Frontend:**
- React / Next.js
- TypeScript
- TailwindCSS
- Socket.IO Client
- jsPDF & docx libraries

### System Flow

```
User Input → JobInputModal → API Endpoint → Task Creation
    ↓
Task Queue (Bull/Redis) → Background Processing
    ↓
AI Service → Resume Tailoring / ATS Scoring
    ↓
WebSocket Events → Real-time UI Updates
    ↓
Task Completion → Preview & Download
```

---

## Setup & Installation

### Prerequisites

```bash
# Required
Node.js >= 18.x
PostgreSQL >= 14.x
Redis >= 6.x
npm or yarn
```

### Installation Steps

#### 1. Install Dependencies

```bash
# Backend dependencies
cd apps/api
npm install bull redis socket.io

# Frontend dependencies
cd apps/web
npm install socket.io-client jspdf docx file-saver
```

#### 2. Database Setup

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate deploy

# Or create migration
npx prisma migrate dev --name add_ai_agent_models
```

#### 3. Start Redis Server

```bash
# macOS with Homebrew
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:latest
```

#### 4. Configure Environment Variables

Create `.env` file in `apps/api`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rolerabbit"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Configuration
AI_PROVIDER="openai"  # or "anthropic"
AI_AGENT_MOCK_MODE="false"  # Set to "true" for testing

# API Keys (Optional - uses mock mode without these)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
CLEARBIT_API_KEY="..."  # Optional: company research
PERPLEXITY_API_KEY="..."  # Optional: enhanced research

# Socket.IO
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"
```

Create `.env.local` in `apps/web`:

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### 5. Start Services

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web
cd apps/web
npm run dev

# Terminal 3: Monitor Redis (optional)
redis-cli monitor
```

---

## Environment Variables

### Backend (apps/api/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection URL |
| `AI_PROVIDER` | No | `openai` | AI provider: `openai` or `anthropic` |
| `AI_AGENT_MOCK_MODE` | No | `false` | Enable mock responses |
| `OPENAI_API_KEY` | No* | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | No* | - | Anthropic API key |
| `CLEARBIT_API_KEY` | No | - | Clearbit API for company data |
| `PERPLEXITY_API_KEY` | No | - | Perplexity for enhanced research |
| `SOCKET_IO_CORS_ORIGIN` | Yes | - | Frontend URL for CORS |

*Required for production mode. Not needed if `AI_AGENT_MOCK_MODE=true`

### Frontend (apps/web/.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API URL |

---

## Database Schema

### Tables Created

1. **AIAgentTask** - Tracks all AI tasks
2. **AIAgentSettings** - User preferences and capabilities
3. **AIAgentHistory** - Historical task records
4. **AIAgentConversation** - Chat message storage
5. **AIAgentMetrics** - Daily performance metrics

### Key Models

```prisma
model AIAgentTask {
  id              String            @id @default(cuid())
  userId          String
  type            AIAgentTaskType
  status          AIAgentTaskStatus @default(QUEUED)
  progress        Int               @default(0)
  currentStep     String?
  jobTitle        String?
  company         String?
  jobDescription  String?           @db.Text
  baseResumeId    String?
  resultData      Json?
  atsScore        Int?
  atsBreakdown    Json?
  errorMessage    String?
  startedAt       DateTime          @default(now())
  completedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user            User              @relation(fields: [userId], references: [id])
  @@index([userId])
  @@index([status])
}

enum AIAgentTaskType {
  RESUME_GENERATION
  COVER_LETTER_GENERATION
  JOB_APPLICATION
  COMPANY_RESEARCH
  INTERVIEW_PREP
  BULK_PROCESSING
  JOB_TRACKER_UPDATE
  COLD_EMAIL
}

enum AIAgentTaskStatus {
  QUEUED
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## API Endpoints

### Settings

#### GET /api/ai-agent/settings
Get user's AI agent settings and capabilities.

**Response:**
```json
{
  "success": true,
  "settings": {
    "isEnabled": true,
    "autoFillEnabled": true,
    "multiResumeEnabled": true,
    "bulkProcessingEnabled": true,
    "jobTrackerEnabled": true,
    "coldEmailEnabled": false,
    "interviewPrepEnabled": true,
    "companyResearchEnabled": true,
    "usageCount": 3,
    "usageLimit": 50,
    "lastResetDate": "2025-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /api/ai-agent/settings
Update settings.

**Request:**
```json
{
  "isEnabled": true,
  "autoFillEnabled": true
}
```

#### POST /api/ai-agent/settings/toggle
Toggle a specific capability.

**Request:**
```json
{
  "capability": "multiResume"
}
```

### Tasks

#### GET /api/ai-agent/tasks
Get all tasks for user.

**Query Params:**
- `status` (optional): Filter by status
- `limit` (optional): Number of tasks to return

#### GET /api/ai-agent/tasks/active
Get all active (in-progress and queued) tasks.

#### GET /api/ai-agent/tasks/:id
Get specific task details.

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "task_123",
    "type": "RESUME_GENERATION",
    "status": "COMPLETED",
    "progress": 100,
    "jobTitle": "Senior Software Engineer",
    "company": "Google",
    "atsScore": 87,
    "atsBreakdown": {
      "keywordMatch": 90,
      "formatScore": 85,
      "experienceMatch": 88,
      "skillsMatch": 87,
      "educationMatch": 80
    },
    "resultData": { /* Resume data */ },
    "createdAt": "2025-01-10T10:00:00.000Z",
    "completedAt": "2025-01-10T10:05:00.000Z"
  }
}
```

#### POST /api/ai-agent/tasks/resume-generation
Create resume generation task.

**Request:**
```json
{
  "jobTitle": "Senior Software Engineer",
  "company": "Google",
  "jobDescription": "We are looking for...",
  "jobUrl": "https://careers.google.com/job123",
  "baseResumeId": "resume_abc",
  "tone": "professional",
  "length": "medium"
}
```

#### POST /api/ai-agent/tasks/cover-letter
Create cover letter generation task.

#### POST /api/ai-agent/tasks/company-research
Create company research task.

#### POST /api/ai-agent/tasks/interview-prep
Create interview prep task.

#### POST /api/ai-agent/tasks/bulk-apply
Create bulk processing task.

**Request:**
```json
{
  "jobs": [
    {
      "company": "Google",
      "jobTitle": "Senior SWE",
      "jobDescription": "...",
      "jobUrl": "https://..."
    },
    {
      "company": "Meta",
      "jobTitle": "Staff Engineer",
      "jobDescription": "...",
      "jobUrl": "https://..."
    }
  ],
  "tone": "professional",
  "length": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "batchId": "batch_123",
  "taskCount": 2,
  "message": "Started processing 2 jobs"
}
```

#### POST /api/ai-agent/tasks/:id/cancel
Cancel a task.

#### DELETE /api/ai-agent/tasks/:id
Delete a task.

### History

#### GET /api/ai-agent/history
Get task history.

**Query Params:**
- `days` (optional): Number of days to look back (default: 30)

### Chat

#### GET /api/ai-agent/chat/history
Get chat conversation history.

#### POST /api/ai-agent/chat
Send chat message.

**Request:**
```json
{
  "message": "Can you help me tailor my resume for a Google SWE position?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "I'd be happy to help! To tailor your resume...",
  "suggestedActions": [
    {
      "label": "Generate Resume",
      "action": "generate_resume"
    }
  ]
}
```

### Metrics

#### GET /api/ai-agent/metrics
Get user's AI agent metrics.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalTasks": 45,
    "completedTasks": 42,
    "failedTasks": 3,
    "averageAtsScore": 82,
    "topCompanies": ["Google", "Meta", "Amazon"]
  }
}
```

---

## Frontend Components

### Core Components

#### 1. JobInputModal
Single job task creation modal.

**Props:**
```typescript
interface JobInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: 'resume' | 'cover-letter' | 'company-research' | 'interview-prep';
  onSubmit: (data: JobInputData) => Promise<void>;
}
```

#### 2. BulkProcessingModal
Bulk job processing modal.

**Features:**
- Add/remove multiple jobs
- Import from JSON/TXT files
- Global settings for all jobs
- Validation and error handling

#### 3. TaskDetailModal
View detailed task information.

**Tabs:**
- Overview: Progress, ATS score, error messages
- Results: Preview and download options
- Details: Task metadata and job description

#### 4. PreviewModal
Preview and download generated documents.

**Supports:**
- Resume (PDF/DOCX)
- Cover Letter (PDF/DOCX)
- Company Research (PDF/DOCX)
- Interview Prep (PDF/DOCX)

#### 5. Toast Notifications
User feedback system.

**Types:**
- Success (green)
- Error (red)
- Info (blue)

### Hooks

#### useAIAgentsState
Main state management hook.

**Returns:**
```typescript
{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAgentEnabled: boolean;
  activeTasks: ActiveTask[];
  capabilities: Capability[];
  historyTasks: HistoryTask[];
  chatMessages: ChatMessage[];
  refreshActiveTasks: () => Promise<void>;
  toggleCapability: (id: string) => Promise<void>;
  isLoading: boolean;
}
```

#### useWebSocket
WebSocket connection management.

**Usage:**
```typescript
useWebSocket(userId, {
  onTaskProgress: (data) => { /* Update UI */ },
  onTaskCompleted: (data) => { /* Show notification */ },
  onTaskFailed: (data) => { /* Handle error */ },
});
```

#### useToast
Toast notification management.

**Usage:**
```typescript
const { showSuccess, showError, showInfo } = useToast();

showSuccess('Task created successfully!');
showError('Failed to create task');
```

---

## WebSocket Events

### Server → Client Events

#### ai_agent:task_progress
Task progress update.

**Payload:**
```json
{
  "taskId": "task_123",
  "progress": 50,
  "currentStep": "Analyzing job description",
  "timestamp": "2025-01-10T10:02:30.000Z"
}
```

#### ai_agent:task_completed
Task completion notification.

**Payload:**
```json
{
  "taskId": "task_123",
  "result": { /* Task results */ },
  "timestamp": "2025-01-10T10:05:00.000Z"
}
```

#### ai_agent:task_failed
Task failure notification.

**Payload:**
```json
{
  "taskId": "task_123",
  "error": "AI service timeout",
  "timestamp": "2025-01-10T10:05:00.000Z"
}
```

#### ai_agent:task_started
Task started notification.

**Payload:**
```json
{
  "taskId": "task_123",
  "taskType": "RESUME_GENERATION",
  "timestamp": "2025-01-10T10:00:00.000Z"
}
```

#### ai_agent:task_cancelled
Task cancelled notification.

#### ai_agent:batch_progress
Bulk operation progress.

**Payload:**
```json
{
  "batchId": "batch_123",
  "completed": 5,
  "total": 10,
  "currentTask": "Processing Google application",
  "percentage": 50,
  "timestamp": "2025-01-10T10:03:00.000Z"
}
```

---

## Usage Guide

### For Users

#### Creating a Single Task

1. Navigate to AI Auto-Apply tab
2. Click "Generate Resume" button
3. Fill in:
   - Company name
   - Job title
   - Job description
   - (Optional) Job URL
4. Select tone and length
5. Click "Start AI Task"
6. Monitor progress in Active Tasks tab

#### Bulk Processing

1. Click "Bulk Process" button
2. Add multiple jobs:
   - Manually enter each job
   - OR import from JSON/TXT file
3. Set global tone and length
4. Click "Process X Jobs"
5. Track all jobs in Active Tasks

#### Viewing Results

1. Go to Active Tasks or History tab
2. Click on a completed task
3. View ATS score and breakdown
4. Click "Preview" to see formatted document
5. Download as PDF or DOCX

#### File Import Format

**JSON Format:**
```json
[
  {
    "company": "Google",
    "jobTitle": "Senior SWE",
    "jobDescription": "We are looking for...",
    "jobUrl": "https://careers.google.com/..."
  },
  {
    "company": "Meta",
    "jobTitle": "Staff Engineer",
    "jobDescription": "Join our team...",
    "jobUrl": "https://metacareers.com/..."
  }
]
```

**TXT Format:**
```
Google
Senior Software Engineer
We are looking for a senior engineer with 5+ years experience...
https://careers.google.com/job123

---

Meta
Staff Engineer
Join our team to build the future of social technology...
https://metacareers.com/job456
```

### For Developers

#### Adding New Task Types

1. Update `AIAgentTaskType` enum in Prisma schema
2. Add queue processor in `aiAgentQueue.js`
3. Create API route in `aiAgent.routes.js`
4. Add button in QuickActions component
5. Update JobInputModal to support new type

#### Customizing AI Prompts

Edit `apps/api/services/aiService.js`:

```javascript
async tailorResume(resumeData, jobDescription, options) {
  const prompt = `
    Your custom prompt here...
    Tone: ${options.tone}
    Length: ${options.length}
  `;

  return await this.chat([
    { role: 'system', content: 'System message' },
    { role: 'user', content: prompt }
  ]);
}
```

#### Adding New Capabilities

1. Add field to `AIAgentSettings` model
2. Update `mapSettingsToCapabilities` in frontend
3. Add toggle handler in `aiAgentService.js`
4. Update Capabilities tab UI

---

## Troubleshooting

### Common Issues

#### 1. Tasks Stuck in QUEUED Status

**Cause:** Redis not running or Bull queue not processing

**Solution:**
```bash
# Check Redis
redis-cli ping
# Should return: PONG

# Restart Redis
brew services restart redis  # macOS
sudo systemctl restart redis  # Linux

# Check Bull queue logs
# In aiAgentQueue.js, ensure queue is processing
```

#### 2. WebSocket Not Connecting

**Cause:** CORS or port mismatch

**Solution:**
```bash
# Check SOCKET_IO_CORS_ORIGIN in .env
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"

# Check NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Restart both servers
```

#### 3. AI API Rate Limits

**Cause:** Too many requests to OpenAI/Anthropic

**Solution:**
- Enable `AI_AGENT_MOCK_MODE=true` for testing
- Implement exponential backoff in `aiService.js`
- Add request queuing with delays

#### 4. PDF/DOCX Generation Fails

**Cause:** Missing dependencies

**Solution:**
```bash
cd apps/web
npm install jspdf docx file-saver
```

#### 5. Database Migration Errors

**Cause:** Schema conflicts

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --create-only
# Edit migration file
npx prisma migrate deploy
```

### Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `USAGE_LIMIT_EXCEEDED` | Monthly limit reached | Upgrade subscription or wait for reset |
| `INVALID_RESUME_DATA` | Resume data is invalid | Check baseResumeId exists |
| `AI_SERVICE_ERROR` | AI service unavailable | Check API keys, try mock mode |
| `QUEUE_ERROR` | Queue processing failed | Check Redis connection |

### Debug Mode

Enable detailed logging:

```bash
# Backend
DEBUG=ai-agent:* npm run dev

# Frontend
NEXT_PUBLIC_DEBUG=true npm run dev
```

### Health Checks

```bash
# Check API
curl http://localhost:4000/health

# Check Redis
redis-cli ping

# Check Database
psql $DATABASE_URL -c "SELECT 1;"
```

---

## Performance Optimization

### Recommended Settings

**Production:**
- Enable Redis persistence (AOF or RDB)
- Set Bull concurrency: `concurrency: 5`
- Implement caching for frequently used data
- Use CDN for static assets

**Scaling:**
- Horizontal scaling: Multiple API instances
- Bull queue: Separate worker processes
- Database: Read replicas
- Redis: Cluster mode for high availability

---

## Security Considerations

1. **API Keys:** Never commit to version control
2. **User Data:** Encrypt sensitive information
3. **Rate Limiting:** Implement per-user limits
4. **Input Validation:** Sanitize all user inputs
5. **CORS:** Restrict to specific origins
6. **WebSocket Auth:** Validate user session

---

## Support & Contributing

### Getting Help

- Documentation: `/docs`
- Issues: GitHub Issues
- Community: Discord/Slack

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

## License

[Your License Here]

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintained By:** [Your Team]
