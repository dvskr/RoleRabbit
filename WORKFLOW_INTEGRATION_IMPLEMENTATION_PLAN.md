# Workflow Integration Implementation Plan

**Goal**: Fix ALL integration gaps and make the workflow system fully production-ready

**Approach**: No shortcuts - implement everything properly

**Timeline**: ~2-3 weeks

---

## 📋 Implementation Phases

### ✅ COMPLETED
- [x] Workflow database schema
- [x] Workflow execution engine
- [x] Node registry system
- [x] Workflow API layer (20+ endpoints)
- [x] React Flow visual builder
- [x] Node palette and configuration UI
- [x] Dashboard integration

---

## 🔧 TO BE IMPLEMENTED

### **PHASE 1: Connect Existing Nodes to Real Services** (3-4 days)

#### 1.1 Fix AI Agent Nodes ⏱️ 1 day

**Current State**: Creates tasks but returns mock data
**Target State**: Creates tasks AND executes them with real AI

**Files to Modify:**
- `/apps/api/services/workflows/nodes/aiAgentNode.js`

**Changes Required:**
```javascript
// Before:
const task = await prisma.aIAgentTask.create({...});
return { score: 8 }; // MOCK

// After:
const task = await prisma.aIAgentTask.create({...});
const result = await aiAgentService.executeTask(task.id);
// Wait for task completion
const completedTask = await waitForTaskCompletion(task.id);
return completedTask.output;
```

**Implementation Steps:**
1. Import `aiAgentService` in aiAgentNode.js
2. Call `executeTask()` after creating task
3. Add polling/waiting mechanism for task completion
4. Return actual task output
5. Add error handling for failed tasks
6. Add timeout handling (max 5 minutes)
7. Update tests

**Dependencies:** None
**Blockers:** None

---

#### 1.2 Implement Real Resume Generation Node ⏱️ 1 day

**Current State**: Stub returning fake resumeId
**Target State**: Generates actual resume using existing resume service

**Files to Modify:**
- `/apps/api/services/workflows/nodes/stubNodes.js` (ResumeNode)

**Changes Required:**
```javascript
class ResumeNode extends BaseNode {
  async execute(node, input, context) {
    const mode = this.mode; // 'generate' or 'tailor'

    if (mode === 'generate') {
      // Call actual resume service
      const resumeService = require('../../resumeService');
      const resume = await resumeService.generateResume({
        userId: context.userId,
        jobDescription: this.getValue(input, config.jobDescriptionPath),
        templateId: config.templateId || 'ats-classic'
      });
      return { resumeId: resume.id, atsScore: resume.atsScore };
    } else {
      // Tailor existing resume
      const resumeId = this.getValue(input, config.resumeIdPath);
      const jobDescription = this.getValue(input, config.jobDescriptionPath);
      const tailored = await resumeService.tailorResume(resumeId, jobDescription);
      return { resumeId: tailored.id, atsScore: tailored.atsScore };
    }
  }
}
```

**Implementation Steps:**
1. Import resume service
2. Handle 'generate' mode - create new resume
3. Handle 'tailor' mode - modify existing resume
4. Pass user context and job description
5. Return actual resume ID and ATS score
6. Add error handling
7. Add input validation
8. Update tests

**Dependencies:** Resume service must be working
**Blockers:** Check if resume service API exists

---

#### 1.3 Implement Real Cover Letter Generation Node ⏱️ 0.5 day

**Current State**: Stub returning fake data
**Target State**: Generates actual cover letter

**Files to Modify:**
- `/apps/api/services/workflows/nodes/stubNodes.js` (CoverLetterNode)

**Changes Required:**
```javascript
class CoverLetterNode extends BaseNode {
  async execute(node, input, context) {
    const coverLetterService = require('../../coverLetterService');

    const coverLetter = await coverLetterService.generateCoverLetter({
      userId: context.userId,
      jobUrl: this.getValue(input, config.jobUrlPath),
      jobTitle: this.getValue(input, config.jobTitlePath),
      company: this.getValue(input, config.companyPath),
      resumeId: this.getValue(input, config.resumeIdPath)
    });

    return {
      coverLetterId: coverLetter.id,
      content: coverLetter.content
    };
  }
}
```

**Implementation Steps:**
1. Import cover letter service
2. Call generation API
3. Return actual cover letter ID
4. Add error handling
5. Update tests

**Dependencies:** Cover letter service must be working
**Blockers:** None

---

#### 1.4 Implement Real Company Research Node ⏱️ 1 day

**Current State**: Stub returning fake data
**Target State**: Actually researches companies

**Files to Modify:**
- `/apps/api/services/workflows/nodes/stubNodes.js` (CompanyResearchNode)

**New File to Create:**
- `/apps/api/services/companyResearchService.js` (if doesn't exist)

**Changes Required:**
```javascript
class CompanyResearchNode extends BaseNode {
  async execute(node, input, context) {
    const companyName = this.getValue(input, config.companyNamePath);
    const companyUrl = this.getValue(input, config.companyUrlPath);

    // Create research task
    const task = await prisma.aIAgentTask.create({
      data: {
        userId: context.userId,
        type: 'COMPANY_RESEARCH',
        input: { companyName, companyUrl }
      }
    });

    // Execute research
    const result = await aiAgentService.executeTask(task.id);

    return {
      companyName,
      industry: result.industry,
      size: result.size,
      culture: result.culture,
      recentNews: result.recentNews,
      glassdoorRating: result.glassdoorRating
    };
  }
}
```

**Implementation Steps:**
1. Check if company research service exists
2. If not, create basic web scraping service
3. Call AI agent service for research
4. Return structured company data
5. Add caching to avoid duplicate research
6. Add error handling
7. Update tests

**Dependencies:** AI agent service, web scraping capability
**Blockers:** May need to add web scraping library

---

### **PHASE 2: Create Missing Workflow Nodes** (4-5 days)

#### 2.1 Create Interview Prep Node ⏱️ 1 day

**Current State**: Doesn't exist
**Target State**: Generates interview questions and answers

**New File to Create:**
- `/apps/api/services/workflows/nodes/interviewPrepNode.js`

**Implementation:**
```javascript
const BaseNode = require('./baseNode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class InterviewPrepNode extends BaseNode {
  constructor() {
    super('INTERVIEW_PREP', 'generate');
  }

  async execute(node, input, context) {
    const config = node.config || {};

    const jobUrl = this.getValue(input, config.jobUrlPath || 'jobUrl');
    const jobDescription = this.getValue(input, config.jobDescriptionPath);
    const resumeId = this.getValue(input, config.resumeIdPath);

    // Create interview prep task
    const task = await prisma.aIAgentTask.create({
      data: {
        userId: context.userId,
        type: 'INTERVIEW_PREP',
        status: 'QUEUED',
        input: {
          jobUrl,
          jobDescription,
          resumeId,
          depth: config.depth || 'comprehensive'
        }
      }
    });

    // Execute task
    const aiAgentService = require('../../aiAgentService');
    const result = await aiAgentService.executeTask(task.id);

    return {
      taskId: task.id,
      questions: result.questions, // Array of questions
      answers: result.answers, // Suggested answers
      tips: result.tips, // Interview tips
      companyInfo: result.companyInfo
    };
  }

  getMetadata() {
    return {
      type: 'INTERVIEW_PREP_GENERATE',
      name: 'Generate Interview Prep',
      description: 'Generate interview questions, answers, and tips',
      icon: 'book-open',
      color: '#8b5cf6',
      category: 'AI',
      inputs: [
        { name: 'jobUrl', type: 'string', required: true },
        { name: 'jobDescription', type: 'string' },
        { name: 'resumeId', type: 'string' }
      ],
      outputs: [
        { name: 'questions', type: 'array' },
        { name: 'answers', type: 'array' },
        { name: 'tips', type: 'array' }
      ],
      config: [
        {
          name: 'depth',
          type: 'select',
          options: ['quick', 'comprehensive'],
          default: 'comprehensive',
          label: 'Preparation Depth'
        }
      ]
    };
  }
}

module.exports = InterviewPrepNode;
```

**Implementation Steps:**
1. Create new file `interviewPrepNode.js`
2. Implement execute() method
3. Add AI agent task creation
4. Call AI service for interview prep generation
5. Return structured interview data
6. Add metadata for UI
7. Register node in nodeRegistry.js
8. Add frontend node type in NodePalette.tsx
9. Add config panel support in NodeConfigPanel.tsx
10. Update tests

**Dependencies:** AI agent service must support INTERVIEW_PREP
**Blockers:** None

---

#### 2.2 Create Bulk Resume Generator Node ⏱️ 1.5 days

**Current State**: Doesn't exist
**Target State**: Generates multiple resume variations

**New File to Create:**
- `/apps/api/services/workflows/nodes/bulkResumeNode.js`

**Implementation:**
```javascript
class BulkResumeNode extends BaseNode {
  constructor() {
    super('BULK_RESUME', 'generate');
  }

  async execute(node, input, context) {
    const config = node.config || {};

    const jobDescription = this.getValue(input, config.jobDescriptionPath);
    const variations = config.variations || 3; // Generate 3 by default
    const templates = config.templates || ['ats-classic', 'ats-modern', 'creative'];

    const resumes = [];
    const resumeService = require('../../resumeService');

    // Generate multiple variations
    for (let i = 0; i < variations; i++) {
      const resume = await resumeService.generateResume({
        userId: context.userId,
        jobDescription,
        templateId: templates[i] || templates[0],
        variation: i + 1
      });

      resumes.push({
        resumeId: resume.id,
        templateId: resume.templateId,
        atsScore: resume.atsScore,
        variation: i + 1
      });
    }

    return {
      resumes,
      count: resumes.length,
      avgAtsScore: resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length
    };
  }

  getMetadata() {
    return {
      type: 'BULK_RESUME_GENERATE',
      name: 'Generate Multiple Resumes',
      description: 'Generate multiple resume variations with different templates',
      icon: 'file-text',
      color: '#22c55e',
      category: 'Resume',
      inputs: [
        { name: 'jobDescription', type: 'string', required: true }
      ],
      outputs: [
        { name: 'resumes', type: 'array' },
        { name: 'count', type: 'number' },
        { name: 'avgAtsScore', type: 'number' }
      ],
      config: [
        {
          name: 'variations',
          type: 'number',
          min: 1,
          max: 5,
          default: 3,
          label: 'Number of Variations'
        },
        {
          name: 'templates',
          type: 'multiselect',
          options: ['ats-classic', 'ats-modern', 'creative', 'minimal'],
          default: ['ats-classic', 'ats-modern', 'creative'],
          label: 'Templates to Use'
        }
      ]
    };
  }
}

module.exports = BulkResumeNode;
```

**Implementation Steps:**
1. Create new file `bulkResumeNode.js`
2. Implement parallel resume generation
3. Support multiple templates
4. Return array of resume IDs and scores
5. Add progress tracking (optional)
6. Add metadata
7. Register in node registry
8. Update frontend
9. Add tests

**Dependencies:** Resume service
**Blockers:** None

---

#### 2.3 Create Cold Email Generator Node ⏱️ 1 day

**Current State**: Doesn't exist
**Target State**: Generates AI-powered personalized cold emails

**New File to Create:**
- `/apps/api/services/workflows/nodes/coldEmailNode.js`

**Implementation:**
```javascript
class ColdEmailNode extends BaseNode {
  constructor() {
    super('COLD_EMAIL', 'generate');
  }

  async execute(node, input, context) {
    const config = node.config || {};

    const recipientEmail = this.getValue(input, config.recipientEmailPath);
    const recipientName = this.getValue(input, config.recipientNamePath);
    const company = this.getValue(input, config.companyPath);
    const jobTitle = this.getValue(input, config.jobTitlePath);
    const resumeId = this.getValue(input, config.resumeIdPath);

    // Create cold email task
    const task = await prisma.aIAgentTask.create({
      data: {
        userId: context.userId,
        type: 'COLD_EMAIL',
        status: 'QUEUED',
        input: {
          recipientEmail,
          recipientName,
          company,
          jobTitle,
          resumeId,
          tone: config.tone || 'professional'
        }
      }
    });

    // Execute task
    const aiAgentService = require('../../aiAgentService');
    const result = await aiAgentService.executeTask(task.id);

    return {
      taskId: task.id,
      subject: result.subject,
      body: result.body,
      recipientEmail,
      ready: true
    };
  }

  getMetadata() {
    return {
      type: 'COLD_EMAIL_GENERATE',
      name: 'Generate Cold Email',
      description: 'Create personalized outreach email using AI',
      icon: 'mail',
      color: '#ec4899',
      category: 'Communication',
      inputs: [
        { name: 'recipientEmail', type: 'string', required: true },
        { name: 'recipientName', type: 'string' },
        { name: 'company', type: 'string', required: true },
        { name: 'jobTitle', type: 'string', required: true },
        { name: 'resumeId', type: 'string' }
      ],
      outputs: [
        { name: 'subject', type: 'string' },
        { name: 'body', type: 'string' },
        { name: 'ready', type: 'boolean' }
      ],
      config: [
        {
          name: 'tone',
          type: 'select',
          options: ['professional', 'friendly', 'enthusiastic'],
          default: 'professional',
          label: 'Email Tone'
        }
      ]
    };
  }
}

module.exports = ColdEmailNode;
```

**Implementation Steps:**
1. Create new file `coldEmailNode.js`
2. Implement AI-powered email generation
3. Support different tones
4. Personalize based on recipient info
5. Add metadata
6. Register in node registry
7. Update frontend
8. Add tests

**Dependencies:** AI agent service
**Blockers:** None

---

#### 2.4 Create Bulk JD Processor Node ⏱️ 1 day

**Current State**: Doesn't exist
**Target State**: Processes multiple job descriptions at once

**New File to Create:**
- `/apps/api/services/workflows/nodes/bulkJDProcessorNode.js`

**Implementation:**
```javascript
class BulkJDProcessorNode extends BaseNode {
  constructor() {
    super('BULK_JD_PROCESSOR', 'process');
  }

  async execute(node, input, context) {
    const config = node.config || {};

    const jobDescriptions = this.getValue(input, config.jobDescriptionsPath || 'jobDescriptions');

    if (!Array.isArray(jobDescriptions)) {
      throw new Error('jobDescriptions must be an array');
    }

    // Create bulk processing task
    const task = await prisma.aIAgentTask.create({
      data: {
        userId: context.userId,
        type: 'BULK_PROCESSING',
        status: 'QUEUED',
        input: {
          jobDescriptions,
          actions: config.actions || ['analyze', 'generate_resume']
        }
      }
    });

    // Execute task
    const aiAgentService = require('../../aiAgentService');
    const result = await aiAgentService.executeTask(task.id);

    return {
      taskId: task.id,
      processed: result.processed, // Array of results
      count: jobDescriptions.length,
      successful: result.successful,
      failed: result.failed
    };
  }

  getMetadata() {
    return {
      type: 'BULK_JD_PROCESSOR',
      name: 'Bulk Process Job Descriptions',
      description: 'Process multiple job descriptions at once',
      icon: 'zap',
      color: '#f59e0b',
      category: 'AI',
      inputs: [
        { name: 'jobDescriptions', type: 'array', required: true }
      ],
      outputs: [
        { name: 'processed', type: 'array' },
        { name: 'count', type: 'number' },
        { name: 'successful', type: 'number' },
        { name: 'failed', type: 'number' }
      ],
      config: [
        {
          name: 'actions',
          type: 'multiselect',
          options: ['analyze', 'generate_resume', 'generate_cover_letter', 'research_company'],
          default: ['analyze', 'generate_resume'],
          label: 'Actions to Perform'
        }
      ]
    };
  }
}

module.exports = BulkJDProcessorNode;
```

**Implementation Steps:**
1. Create new file `bulkJDProcessorNode.js`
2. Implement bulk processing logic
3. Support multiple actions per JD
4. Add progress tracking
5. Add metadata
6. Register in node registry
7. Update frontend
8. Add tests

**Dependencies:** AI agent service
**Blockers:** None

---

### **PHASE 3: Background Job Processing** (3-4 days)

#### 3.1 Set Up Bull Job Queue ⏱️ 1 day

**Current State**: All tasks run synchronously
**Target State**: Long-running tasks queued and processed in background

**New Files to Create:**
- `/apps/api/services/queue/queueConfig.js`
- `/apps/api/services/queue/aiAgentQueue.js`
- `/apps/api/services/queue/workflowQueue.js`

**Dependencies to Install:**
```json
{
  "bull": "^4.11.0",
  "ioredis": "^5.3.0"
}
```

**Implementation:**

**File: `queueConfig.js`**
```javascript
const Queue = require('bull');
const Redis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

const createQueue = (name, options = {}) => {
  return new Queue(name, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 100,
      removeOnFail: 200,
      ...options
    }
  });
};

module.exports = { createQueue, redisConfig };
```

**File: `aiAgentQueue.js`**
```javascript
const { createQueue } = require('./queueConfig');
const aiAgentService = require('../aiAgentService');
const logger = require('../../utils/logger');

const aiAgentQueue = createQueue('ai-agent-tasks', {
  attempts: 3,
  timeout: 300000 // 5 minutes
});

// Process AI agent tasks
aiAgentQueue.process(async (job) => {
  const { taskId, userId } = job.data;

  logger.info(`Processing AI agent task: ${taskId}`);

  try {
    const result = await aiAgentService.executeTask(taskId);
    return result;
  } catch (error) {
    logger.error(`AI agent task failed: ${taskId}`, error);
    throw error;
  }
});

// Event handlers
aiAgentQueue.on('completed', (job, result) => {
  logger.info(`AI agent task completed: ${job.data.taskId}`);
});

aiAgentQueue.on('failed', (job, err) => {
  logger.error(`AI agent task failed: ${job.data.taskId}`, err);
});

module.exports = aiAgentQueue;
```

**File: `workflowQueue.js`**
```javascript
const { createQueue } = require('./queueConfig');
const WorkflowExecutor = require('../workflows/workflowExecutor');
const logger = require('../../utils/logger');

const workflowQueue = createQueue('workflow-executions', {
  attempts: 2,
  timeout: 600000 // 10 minutes
});

const executor = new WorkflowExecutor();

// Process workflows
workflowQueue.process(async (job) => {
  const { workflowId, userId, input, triggeredBy } = job.data;

  logger.info(`Processing workflow: ${workflowId}`);

  try {
    const result = await executor.executeWorkflow(workflowId, userId, input, triggeredBy);
    return result;
  } catch (error) {
    logger.error(`Workflow execution failed: ${workflowId}`, error);
    throw error;
  }
});

workflowQueue.on('completed', (job, result) => {
  logger.info(`Workflow completed: ${job.data.workflowId}`);
});

workflowQueue.on('failed', (job, err) => {
  logger.error(`Workflow failed: ${job.data.workflowId}`, err);
});

module.exports = workflowQueue;
```

**Implementation Steps:**
1. Install Bull and Redis dependencies
2. Set up Redis connection
3. Create queue configuration
4. Create AI agent queue
5. Create workflow queue
6. Add job processors
7. Add event handlers for monitoring
8. Add queue management API endpoints
9. Add tests

**Dependencies:** Redis server must be running
**Blockers:** Need Redis in development/production environment

---

#### 3.2 Create Background Workers ⏱️ 1 day

**Current State**: No background processing
**Target State**: Dedicated workers process long-running tasks

**New Files to Create:**
- `/apps/api/workers/aiAgentWorker.js`
- `/apps/api/workers/workflowWorker.js`
- `/apps/api/workers/index.js`

**Implementation:**

**File: `aiAgentWorker.js`**
```javascript
const aiAgentQueue = require('../services/queue/aiAgentQueue');
const logger = require('../utils/logger');

class AIAgentWorker {
  constructor() {
    this.queue = aiAgentQueue;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('AI Agent worker already running');
      return;
    }

    this.isRunning = true;
    logger.info('AI Agent worker started');

    // Worker is automatically processing via queue.process()
    // Just need to keep process alive
  }

  async stop() {
    if (!this.isRunning) return;

    await this.queue.close();
    this.isRunning = false;
    logger.info('AI Agent worker stopped');
  }

  async getStats() {
    const waiting = await this.queue.getWaitingCount();
    const active = await this.queue.getActiveCount();
    const completed = await this.queue.getCompletedCount();
    const failed = await this.queue.getFailedCount();

    return { waiting, active, completed, failed };
  }
}

module.exports = new AIAgentWorker();
```

**File: `index.js`**
```javascript
const aiAgentWorker = require('./aiAgentWorker');
const workflowWorker = require('./workflowWorker');
const logger = require('../utils/logger');

async function startWorkers() {
  try {
    await aiAgentWorker.start();
    await workflowWorker.start();

    logger.info('All workers started successfully');
  } catch (error) {
    logger.error('Failed to start workers', error);
    process.exit(1);
  }
}

async function stopWorkers() {
  try {
    await aiAgentWorker.stop();
    await workflowWorker.stop();

    logger.info('All workers stopped successfully');
  } catch (error) {
    logger.error('Failed to stop workers', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', stopWorkers);
process.on('SIGINT', stopWorkers);

// Start workers if this file is run directly
if (require.main === module) {
  startWorkers();
}

module.exports = { startWorkers, stopWorkers };
```

**Implementation Steps:**
1. Create worker classes
2. Implement start/stop methods
3. Add stats monitoring
4. Add graceful shutdown
5. Create worker startup script
6. Add to package.json scripts
7. Add worker health checks
8. Update Docker/deployment config
9. Add tests

**Dependencies:** Job queues from 3.1
**Blockers:** None

---

#### 3.3 Update Workflow Executor for Async ⏱️ 1-2 days

**Current State**: Synchronous node execution
**Target State**: Queue long-running nodes, poll for completion

**Files to Modify:**
- `/apps/api/services/workflows/workflowExecutor.js`
- `/apps/api/services/workflows/nodes/aiAgentNode.js`
- All other node files

**Changes Required:**

**In workflowExecutor.js:**
```javascript
async _executeNode(context, nodeId, data) {
  const node = context.workflow.nodes.find(n => n.id === nodeId);
  const nodeExecutor = this.nodeRegistry.get(node.type);

  // Check if node is long-running
  const isLongRunning = this._isLongRunningNode(node.type);

  if (isLongRunning) {
    // Queue the job
    const aiAgentQueue = require('../queue/aiAgentQueue');
    const job = await aiAgentQueue.add({
      nodeId: node.id,
      userId: context.userId,
      input: data,
      config: node.config
    });

    // Poll for completion
    const result = await this._waitForJob(job.id);
    return result;
  } else {
    // Execute synchronously
    const result = await nodeExecutor.execute(node, data, context);
    return result;
  }
}

async _waitForJob(jobId, timeout = 300000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const job = await aiAgentQueue.getJob(jobId);

    if (job.isCompleted()) {
      return job.returnvalue;
    }

    if (job.isFailed()) {
      throw new Error(job.failedReason);
    }

    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Job timeout');
}

_isLongRunningNode(nodeType) {
  const longRunningTypes = [
    'AI_AGENT_ANALYZE',
    'AI_AGENT_CHAT',
    'RESUME_GENERATE',
    'RESUME_TAILOR',
    'COVER_LETTER_GENERATE',
    'INTERVIEW_PREP_GENERATE',
    'BULK_RESUME_GENERATE',
    'COLD_EMAIL_GENERATE',
    'BULK_JD_PROCESSOR',
    'COMPANY_RESEARCH'
  ];

  return longRunningTypes.includes(nodeType);
}
```

**Implementation Steps:**
1. Add job queueing logic to executor
2. Implement polling mechanism
3. Add timeout handling
4. Update all AI/Resume nodes to work with queue
5. Add progress tracking
6. Update execution logs
7. Add tests

**Dependencies:** Job queues from 3.1
**Blockers:** None

---

### **PHASE 4: Real-Time Execution Feedback** (2-3 days)

#### 4.1 Add WebSocket Server ⏱️ 1 day

**Current State**: No real-time updates
**Target State**: WebSocket broadcasts execution status

**Files to Create/Modify:**
- `/apps/api/services/websocket/workflowWebSocket.js`
- `/apps/api/server.js` (add WebSocket)

**Dependencies to Install:**
```json
{
  "ws": "^8.14.0" // Already installed
}
```

**Implementation:**

**File: `workflowWebSocket.js`**
```javascript
const WebSocket = require('ws');
const logger = require('../../utils/logger');

class WorkflowWebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> Set of WebSocket connections
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws/workflows'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    logger.info('Workflow WebSocket server initialized');
  }

  handleConnection(ws, req) {
    // Extract user ID from auth token
    const token = this.extractToken(req);
    const userId = this.verifyToken(token);

    if (!userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    // Add client to map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);

    logger.info(`WebSocket client connected: ${userId}`);

    // Handle messages from client
    ws.on('message', (message) => {
      this.handleMessage(ws, userId, message);
    });

    // Handle disconnect
    ws.on('close', () => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(userId);
        }
      }
      logger.info(`WebSocket client disconnected: ${userId}`);
    });

    // Send connection success
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connected successfully'
    }));
  }

  handleMessage(ws, userId, message) {
    try {
      const data = JSON.parse(message);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Subscribe to workflow execution updates
          this.subscribeToWorkflow(ws, userId, data.workflowId);
          break;
        case 'unsubscribe':
          this.unsubscribeFromWorkflow(ws, userId, data.workflowId);
          break;
        default:
          logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message', error);
    }
  }

  // Broadcast execution updates to all clients of a user
  broadcastToUser(userId, data) {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify(data);

    userClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Broadcast workflow execution events
  broadcastWorkflowStarted(userId, executionId, workflowId) {
    this.broadcastToUser(userId, {
      type: 'workflow-started',
      executionId,
      workflowId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastNodeStarted(userId, executionId, nodeId, nodeName) {
    this.broadcastToUser(userId, {
      type: 'node-started',
      executionId,
      nodeId,
      nodeName,
      timestamp: new Date().toISOString()
    });
  }

  broadcastNodeCompleted(userId, executionId, nodeId, output) {
    this.broadcastToUser(userId, {
      type: 'node-completed',
      executionId,
      nodeId,
      output,
      timestamp: new Date().toISOString()
    });
  }

  broadcastNodeFailed(userId, executionId, nodeId, error) {
    this.broadcastToUser(userId, {
      type: 'node-failed',
      executionId,
      nodeId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  broadcastWorkflowCompleted(userId, executionId, output) {
    this.broadcastToUser(userId, {
      type: 'workflow-completed',
      executionId,
      output,
      timestamp: new Date().toISOString()
    });
  }

  broadcastWorkflowFailed(userId, executionId, error) {
    this.broadcastToUser(userId, {
      type: 'workflow-failed',
      executionId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  extractToken(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  verifyToken(token) {
    // TODO: Implement JWT verification
    // For now, return mock user ID
    return 'user-123';
  }
}

module.exports = new WorkflowWebSocketServer();
```

**Update `server.js`:**
```javascript
// After server starts
const workflowWebSocket = require('./services/websocket/workflowWebSocket');
workflowWebSocket.initialize(fastify.server);
```

**Implementation Steps:**
1. Create WebSocket server class
2. Implement connection handling
3. Implement authentication
4. Add message handlers
5. Add broadcast methods
6. Integrate with server.js
7. Add reconnection logic
8. Add tests

**Dependencies:** None (ws already installed)
**Blockers:** None

---

#### 4.2 Connect Frontend to WebSocket ⏱️ 0.5 day

**Current State**: No WebSocket client
**Target State**: Frontend receives real-time updates

**Files to Create:**
- `/apps/web/src/hooks/useWorkflowWebSocket.ts`

**Implementation:**
```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  executionId?: string;
  nodeId?: string;
  nodeName?: string;
  output?: any;
  error?: string;
  timestamp: string;
}

export function useWorkflowWebSocket(executionId?: string) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'running' | 'completed' | 'failed'>>({});

  const connect = useCallback(() => {
    // Get auth token
    const token = localStorage.getItem('auth_token') || document.cookie.match(/auth_token=([^;]+)/)?.[1];

    if (!token) {
      console.error('No auth token found');
      return;
    }

    // Connect to WebSocket
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/workflows?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);

      // Subscribe to execution updates if provided
      if (executionId) {
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          executionId
        }));
      }
    };

    ws.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleMessage(message);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);

      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 3000);
    };
  }, [executionId]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'node-started':
        if (message.nodeId) {
          setNodeStatuses(prev => ({
            ...prev,
            [message.nodeId!]: 'running'
          }));
        }
        break;

      case 'node-completed':
        if (message.nodeId) {
          setNodeStatuses(prev => ({
            ...prev,
            [message.nodeId!]: 'completed'
          }));
        }
        break;

      case 'node-failed':
        if (message.nodeId) {
          setNodeStatuses(prev => ({
            ...prev,
            [message.nodeId!]: 'failed'
          }));
        }
        break;

      case 'workflow-completed':
        // All nodes completed
        break;

      case 'workflow-failed':
        // Workflow failed
        break;
    }
  };

  useEffect(() => {
    connect();

    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return {
    connected,
    nodeStatuses
  };
}
```

**Implementation Steps:**
1. Create useWorkflowWebSocket hook
2. Implement connection logic
3. Add authentication
4. Add message handling
5. Add reconnection logic
6. Export hook
7. Add tests

**Dependencies:** WebSocket server from 4.1
**Blockers:** None

---

#### 4.3 Add Real-Time Node Status Updates ⏱️ 1 day

**Current State**: Canvas doesn't show execution status
**Target State**: Nodes change color during execution

**Files to Modify:**
- `/apps/web/src/components/WorkflowBuilder/WorkflowCanvas.tsx`
- `/apps/web/src/components/WorkflowBuilder/nodes/CustomNode.tsx`

**Changes Required:**

**In WorkflowCanvas.tsx:**
```typescript
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';

export default function WorkflowCanvas({...}) {
  const [executionId, setExecutionId] = useState<string | null>(null);
  const { connected, nodeStatuses } = useWorkflowWebSocket(executionId);

  // Update node data with status from WebSocket
  useEffect(() => {
    if (Object.keys(nodeStatuses).length > 0) {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: nodeStatuses[node.id] || 'idle'
          }
        }))
      );
    }
  }, [nodeStatuses, setNodes]);

  const handleExecute = useCallback(async () => {
    if (onExecute) {
      const result = await onExecute();
      setExecutionId(result.executionId);
    }
  }, [onExecute]);

  // ... rest of component
}
```

**In CustomNode.tsx:**
```typescript
// Status already handled in existing code
// Just ensure status colors are correct:
const statusColors = {
  idle: '#6b7280',      // Gray
  running: '#3b82f6',   // Blue (animated pulse)
  success: '#22c55e',   // Green
  error: '#ef4444'      // Red
};

// Add pulsing animation for running status
<div
  className={`
    relative px-4 py-3 rounded-lg shadow-lg
    ${data.status === 'running' ? 'animate-pulse ring-2 ring-blue-500' : ''}
  `}
>
```

**Implementation Steps:**
1. Import WebSocket hook in WorkflowCanvas
2. Connect to WebSocket on execution start
3. Update node data with status
4. Add visual indicators (colors, animations)
5. Add status legends
6. Test with real workflow execution
7. Add error handling

**Dependencies:** WebSocket hook from 4.2
**Blockers:** None

---

### **PHASE 5: Frontend Node Integration** (2 days)

#### 5.1 Update Node Palette ⏱️ 0.5 day

**Current State**: Missing 4 new node types
**Target State**: All 30+ node types including new ones

**Files to Modify:**
- `/apps/web/src/components/WorkflowBuilder/NodePalette.tsx`

**Changes Required:**
```typescript
// Add new node types to the nodeTypes array

// AI Category - add these
{
  type: 'INTERVIEW_PREP_GENERATE',
  name: 'Generate Interview Prep',
  icon: BookOpen,
  color: '#8b5cf6',
  category: 'AI',
  description: 'Generate interview questions and answers'
},
{
  type: 'BULK_JD_PROCESSOR',
  name: 'Bulk Process JDs',
  icon: Zap,
  color: '#f59e0b',
  category: 'AI',
  description: 'Process multiple job descriptions'
},

// Resume Category - add these
{
  type: 'BULK_RESUME_GENERATE',
  name: 'Generate Multiple Resumes',
  icon: FileText,
  color: '#22c55e',
  category: 'Resume',
  description: 'Create multiple resume variations'
},

// Communication Category - add this
{
  type: 'COLD_EMAIL_GENERATE',
  name: 'Generate Cold Email',
  icon: Mail,
  color: '#ec4899',
  category: 'Communication',
  description: 'Create personalized outreach email'
}
```

**Implementation Steps:**
1. Add 4 new node types to palette
2. Ensure correct icons and colors
3. Update categories if needed
4. Test drag-and-drop
5. Update documentation

**Dependencies:** None
**Blockers:** None

---

#### 5.2 Update Node Configuration Panel ⏱️ 1 day

**Current State**: Config panel doesn't have fields for new nodes
**Target State**: All node types have proper config fields

**Files to Modify:**
- `/apps/web/src/components/WorkflowBuilder/NodeConfigPanel.tsx`

**Changes Required:**
```typescript
// Add configuration fields for new node types

switch (nodeType) {
  // ... existing cases ...

  case 'INTERVIEW_PREP_GENERATE':
    specificFields = [
      {
        key: 'jobUrlPath',
        label: 'Job URL Path',
        type: 'text',
        placeholder: 'jobUrl',
        value: config.jobUrlPath || 'jobUrl'
      },
      {
        key: 'depth',
        label: 'Preparation Depth',
        type: 'select',
        options: ['quick', 'comprehensive'],
        value: config.depth || 'comprehensive'
      }
    ];
    break;

  case 'BULK_RESUME_GENERATE':
    specificFields = [
      {
        key: 'jobDescriptionPath',
        label: 'Job Description Path',
        type: 'text',
        placeholder: 'jobDescription',
        value: config.jobDescriptionPath || 'jobDescription'
      },
      {
        key: 'variations',
        label: 'Number of Variations',
        type: 'number',
        placeholder: '3',
        value: config.variations || 3,
        min: 1,
        max: 5
      },
      {
        key: 'templates',
        label: 'Templates to Use',
        type: 'multiselect',
        options: ['ats-classic', 'ats-modern', 'creative', 'minimal'],
        value: config.templates || ['ats-classic', 'ats-modern', 'creative']
      }
    ];
    break;

  case 'COLD_EMAIL_GENERATE':
    specificFields = [
      {
        key: 'recipientEmailPath',
        label: 'Recipient Email Path',
        type: 'text',
        placeholder: 'email',
        value: config.recipientEmailPath || 'email'
      },
      {
        key: 'recipientNamePath',
        label: 'Recipient Name Path',
        type: 'text',
        placeholder: 'name',
        value: config.recipientNamePath || 'name'
      },
      {
        key: 'companyPath',
        label: 'Company Path',
        type: 'text',
        placeholder: 'company',
        value: config.companyPath || 'company'
      },
      {
        key: 'tone',
        label: 'Email Tone',
        type: 'select',
        options: ['professional', 'friendly', 'enthusiastic'],
        value: config.tone || 'professional'
      }
    ];
    break;

  case 'BULK_JD_PROCESSOR':
    specificFields = [
      {
        key: 'jobDescriptionsPath',
        label: 'Job Descriptions Array Path',
        type: 'text',
        placeholder: 'jobDescriptions',
        value: config.jobDescriptionsPath || 'jobDescriptions'
      },
      {
        key: 'actions',
        label: 'Actions to Perform',
        type: 'multiselect',
        options: ['analyze', 'generate_resume', 'generate_cover_letter', 'research_company'],
        value: config.actions || ['analyze', 'generate_resume']
      }
    ];
    break;
}
```

**Implementation Steps:**
1. Add config fields for each new node type
2. Implement multiselect field type if needed
3. Add validation
4. Test configuration save/load
5. Update documentation

**Dependencies:** None
**Blockers:** None

---

#### 5.3 Sync AI Agents UI with Workflows ⏱️ 0.5 day

**Current State**: Capabilities in AI Agents don't match workflows
**Target State**: 1:1 mapping between capabilities and workflow nodes

**Files to Modify:**
- `/apps/web/src/components/AIAgents/constants/mockData.tsx`

**Changes Required:**
```typescript
// Update MOCK_CAPABILITIES to match actual workflow nodes
export const MOCK_CAPABILITIES: Capability[] = [
  {
    id: '1',
    title: 'AI Job Analysis',
    description: 'Analyze job postings and determine fit with your profile',
    icon: <Sparkles size={20} />,
    enabled: true,
    workflowNode: 'AI_AGENT_ANALYZE' // Add mapping
  },
  {
    id: '2',
    title: 'Resume Generation',
    description: 'Generate tailored resumes for job descriptions',
    icon: <FileText size={20} />,
    enabled: true,
    workflowNode: 'RESUME_GENERATE'
  },
  {
    id: '3',
    title: 'Multi-Resume Generator',
    description: 'Generate multiple resume variations with different templates',
    icon: <FileText size={20} />,
    enabled: true,
    workflowNode: 'BULK_RESUME_GENERATE' // Now exists!
  },
  {
    id: '4',
    title: 'Interview Prep',
    description: 'Generate comprehensive interview materials',
    icon: <BookOpen size={20} />,
    enabled: true,
    workflowNode: 'INTERVIEW_PREP_GENERATE' // Now exists!
  },
  {
    id: '5',
    title: 'Cold Email Generator',
    description: 'Send personalized cold emails',
    icon: <Mail size={20} />,
    enabled: true,
    workflowNode: 'COLD_EMAIL_GENERATE' // Now exists!
  },
  {
    id: '6',
    title: 'Company Research',
    description: 'Research companies and add notes',
    icon: <Search size={20} />,
    enabled: true,
    workflowNode: 'COMPANY_RESEARCH'
  },
  {
    id: '7',
    title: 'Bulk JD Processing',
    description: 'Process multiple job descriptions at once',
    icon: <Zap size={20} />,
    enabled: true,
    workflowNode: 'BULK_JD_PROCESSOR' // Now exists!
  }
];
```

**Add link to workflows:**
```typescript
// Add button in CapabilityCard.tsx
<button
  onClick={() => window.location.href = '/dashboard?tab=workflows'}
  className="text-sm text-blue-600 hover:underline"
>
  Use in Workflow →
</button>
```

**Implementation Steps:**
1. Update capabilities list
2. Add workflow node mapping
3. Add "Use in Workflow" button
4. Remove non-existent capabilities
5. Update documentation

**Dependencies:** All nodes must be implemented
**Blockers:** None

---

### **PHASE 6: UX Improvements** (3-4 days)

#### 6.1 Add Node Testing Feature ⏱️ 1.5 days

**Current State**: Can't test nodes individually
**Target State**: "Test Node" button executes single node

**Files to Create/Modify:**
- `/apps/api/routes/workflow.routes.js` (add test endpoint)
- `/apps/web/src/components/WorkflowBuilder/NodeConfigPanel.tsx`

**Backend Changes:**

Add endpoint in `workflow.routes.js`:
```javascript
/**
 * POST /api/workflows/nodes/test
 * Test a single node execution
 */
fastify.post('/api/workflows/nodes/test', { preHandler: authenticate }, async (request, reply) => {
  try {
    const userId = request.user.userId;
    const { nodeType, config, input } = request.body;

    // Get node executor
    const nodeRegistry = require('../services/workflows/nodeRegistry');
    const executor = nodeRegistry.get(nodeType);

    if (!executor) {
      return reply.status(400).send({
        success: false,
        error: `Unknown node type: ${nodeType}`
      });
    }

    // Create temporary node
    const node = {
      id: 'test-node',
      type: nodeType,
      config: config || {}
    };

    // Create temporary context
    const context = {
      userId,
      workflowId: 'test',
      executionId: 'test',
      variables: {},
      input: input || {},
      output: {}
    };

    // Execute node
    const result = await executor.execute(node, input || {}, context);

    return reply.send({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Failed to test node', { error: error.message });
    return reply.status(500).send({
      success: false,
      error: error.message
    });
  }
});
```

**Frontend Changes:**

In `NodeConfigPanel.tsx`:
```typescript
const [testResult, setTestResult] = useState<any>(null);
const [testing, setTesting] = useState(false);

const handleTestNode = async () => {
  setTesting(true);
  setTestResult(null);

  try {
    const response = await apiService.post('/api/workflows/nodes/test', {
      nodeType: node.data.type,
      config,
      input: {} // Could add input field
    });

    setTestResult(response.result);
  } catch (err: any) {
    setTestResult({ error: err.message });
  } finally {
    setTesting(false);
  }
};

// Add UI
<div className="border-t border-gray-200 pt-4">
  <button
    onClick={handleTestNode}
    disabled={testing}
    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
  >
    {testing ? 'Testing...' : 'Test Node'}
  </button>

  {testResult && (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-xs font-medium text-gray-700 mb-2">Test Result:</div>
      <pre className="text-xs text-gray-800 overflow-auto max-h-40">
        {JSON.stringify(testResult, null, 2)}
      </pre>
    </div>
  )}
</div>
```

**Implementation Steps:**
1. Add test endpoint in backend
2. Add test button in config panel
3. Add input field for test data
4. Display test results
5. Add error handling
6. Add loading states
7. Update documentation
8. Add tests

**Dependencies:** All nodes must be implemented
**Blockers:** None

---

#### 6.2 Add Undo/Redo ⏱️ 1 day

**Current State**: No undo/redo
**Target State**: Ctrl+Z / Ctrl+Y work

**Files to Modify:**
- `/apps/web/src/components/WorkflowBuilder/WorkflowCanvas.tsx`

**Implementation:**
```typescript
import { useCallback, useState } from 'react';

// Command pattern for undo/redo
interface Command {
  execute: () => void;
  undo: () => void;
}

function useUndoRedo() {
  const [history, setHistory] = useState<Command[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const execute = useCallback((command: Command) => {
    command.execute();

    // Remove future history if we're not at the end
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(command);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex < 0) return;

    history[currentIndex].undo();
    setCurrentIndex(currentIndex - 1);
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return;

    const nextIndex = currentIndex + 1;
    history[nextIndex].execute();
    setCurrentIndex(nextIndex);
  }, [history, currentIndex]);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  return { execute, undo, redo, canUndo, canRedo };
}

// In WorkflowCanvas component
const { execute, undo, redo, canUndo, canRedo } = useUndoRedo();

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo]);

// Wrap node/edge changes in commands
const handleNodesChange = useCallback((changes: NodeChange[]) => {
  execute({
    execute: () => onNodesChange(changes),
    undo: () => {
      // Reverse the changes
      const reversedChanges = reverseNodeChanges(changes);
      onNodesChange(reversedChanges);
    }
  });
}, [onNodesChange, execute]);

// Add undo/redo buttons to toolbar
<Panel position="top-right" className="flex gap-2">
  <button
    onClick={undo}
    disabled={!canUndo}
    className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
    title="Undo (Ctrl+Z)"
  >
    <Undo size={16} />
  </button>
  <button
    onClick={redo}
    disabled={!canRedo}
    className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
    title="Redo (Ctrl+Shift+Z)"
  >
    <Redo size={16} />
  </button>
  {/* ... other buttons */}
</Panel>
```

**Implementation Steps:**
1. Create command pattern implementation
2. Create undo/redo hook
3. Wrap all changes in commands
4. Add keyboard shortcuts
5. Add undo/redo buttons
6. Add visual feedback
7. Test thoroughly
8. Update documentation

**Dependencies:** None
**Blockers:** None

---

#### 6.3 Add Template Variable Autocomplete ⏱️ 1.5 days

**Current State**: No autocomplete for {{variables}}
**Target State**: Dropdown shows available variables

**Files to Modify:**
- `/apps/web/src/components/WorkflowBuilder/NodeConfigPanel.tsx`

**Implementation:**
```typescript
import { useState, useCallback } from 'react';

// Get available variables from previous nodes
function getAvailableVariables(currentNode: Node, nodes: Node[], edges: Edge[]) {
  const variables: string[] = ['$userEmail', '$userId', '$workflowId'];

  // Find nodes that come before this one
  const predecessorIds = new Set<string>();

  function findPredecessors(nodeId: string) {
    edges.forEach(edge => {
      if (edge.target === nodeId && !predecessorIds.has(edge.source)) {
        predecessorIds.add(edge.source);
        findPredecessors(edge.source);
      }
    });
  }

  findPredecessors(currentNode.id);

  // Get outputs from predecessor nodes
  predecessorIds.forEach(id => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      // Get node metadata to know what it outputs
      const metadata = getNodeMetadata(node.data.type);
      metadata.outputs?.forEach(output => {
        variables.push(output.name);
      });
    }
  });

  return variables;
}

// Autocomplete component
function VariableAutocomplete({ value, onChange, availableVariables }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart || 0;

    onChange(newValue);
    setCursorPosition(cursor);

    // Check if we're inside {{ }}
    const beforeCursor = newValue.slice(0, cursor);
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    const lastCloseBrace = beforeCursor.lastIndexOf('}}');

    if (lastOpenBrace > lastCloseBrace) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertVariable = (variable: string) => {
    // Find {{ before cursor
    const beforeCursor = value.slice(0, cursorPosition);
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');

    if (lastOpenBrace >= 0) {
      const newValue =
        value.slice(0, lastOpenBrace) +
        `{{${variable}}}` +
        value.slice(cursorPosition);

      onChange(newValue);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
      />

      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto">
          {availableVariables.map((variable: string) => (
            <button
              key={variable}
              onClick={() => insertVariable(variable)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 font-mono"
            >
              {`{{${variable}}}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Implementation Steps:**
1. Create function to get available variables
2. Create autocomplete component
3. Add {{ }} detection
4. Show suggestions dropdown
5. Implement variable insertion
6. Add keyboard navigation
7. Add documentation tooltip
8. Test with different node types

**Dependencies:** None
**Blockers:** None

---

### **PHASE 7: Testing** (2-3 days)

#### 7.1 Unit Tests ⏱️ 1 day

**Create Tests For:**
- All new node implementations
- Workflow executor async logic
- Job queue processing
- WebSocket functionality

**Files to Create:**
```
/apps/api/tests/nodes/
  - aiAgentNode.test.js
  - interviewPrepNode.test.js
  - bulkResumeNode.test.js
  - coldEmailNode.test.js
  - bulkJDProcessorNode.test.js

/apps/api/tests/queue/
  - aiAgentQueue.test.js
  - workflowQueue.test.js

/apps/api/tests/websocket/
  - workflowWebSocket.test.js
```

---

#### 7.2 Integration Tests ⏱️ 1 day

**Test Scenarios:**
1. Complete workflow execution end-to-end
2. Node execution with real AI services
3. WebSocket real-time updates
4. Job queue processing
5. Error handling and retries

---

#### 7.3 E2E Tests ⏱️ 1 day

**Test User Flows:**
1. Create workflow from template
2. Build custom workflow
3. Configure nodes
4. Execute workflow
5. Monitor execution
6. View results

---

### **PHASE 8: Documentation** (1 day)

#### 8.1 Update API Documentation

- Document new endpoints
- Add examples for node testing
- Update webhook documentation

#### 8.2 Update User Documentation

- Add guides for new node types
- Update workflow examples
- Add troubleshooting guide

#### 8.3 Update Developer Documentation

- Document node creation process
- Add queue setup guide
- Add WebSocket integration guide

---

## 📊 TIMELINE SUMMARY

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Connect Nodes | 3-4 days | None |
| Phase 2: New Nodes | 4-5 days | Phase 1 |
| Phase 3: Job Queue | 3-4 days | Redis setup |
| Phase 4: WebSocket | 2-3 days | Phase 3 |
| Phase 5: Frontend | 2 days | Phase 2 |
| Phase 6: UX | 3-4 days | Phase 5 |
| Phase 7: Testing | 2-3 days | All phases |
| Phase 8: Docs | 1 day | All phases |
| **TOTAL** | **20-27 days** | **~3-4 weeks** |

---

## 🎯 MILESTONES

### Week 1
- ✅ All existing nodes connected to real services
- ✅ 4 new nodes implemented
- ✅ Job queue system operational

### Week 2
- ✅ WebSocket real-time updates working
- ✅ Frontend fully integrated
- ✅ All node types in palette

### Week 3
- ✅ UX improvements complete
- ✅ Node testing feature
- ✅ Undo/redo working
- ✅ Autocomplete implemented

### Week 4
- ✅ All tests written and passing
- ✅ Documentation complete
- ✅ Production ready!

---

## 🚀 GETTING STARTED

**Today (Day 1)**: Start with Phase 1.1 - Fix AI Agent Nodes

```bash
# Start tracking progress
git checkout claude/analyze-code-011CUyccqH798yCLwTrVSgW3

# Begin implementation
cd apps/api/services/workflows/nodes
# Edit aiAgentNode.js
```

**Let's implement this properly - no shortcuts! 💪**
