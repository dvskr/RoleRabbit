# Request Queuing - Complete Guide

## Overview

Request Queuing implements a robust job queue system using BullMQ for handling long-running AI operations. This ensures better resource management, fault tolerance, and user experience during high traffic.

## Implementation Status

✅ **COMPLETE** - Ready to use

**Components:**
- `apps/api/services/queue/queueManager.js` - Queue management service
- `apps/api/services/queue/workers.js` - Job processing workers
- `apps/api/routes/queue.routes.js` - Queue API routes
- `apps/api/package.json` - Added BullMQ dependency

## Features

### 1. Job Queues
- **Resume Parsing Queue** - Handles resume file uploads and parsing
- **ATS Analysis Queue** - Processes ATS score calculations
- **Tailoring Queue** - Manages resume tailoring operations

### 2. Worker Configuration
- **Concurrency Control** - Limits concurrent job processing
- **Rate Limiting** - Prevents API overload
- **Automatic Retries** - Exponential backoff on failures
- **Progress Tracking** - Real-time job progress updates

### 3. Queue Management
- **Job Status Tracking** - Monitor job state (waiting, active, completed, failed)
- **Queue Position** - Show users their position in queue
- **Job Cancellation** - Allow users to cancel queued jobs
- **Admin Dashboard** - Monitor and manage all queues

## Installation

### 1. Install Dependencies

```bash
cd apps/api
npm install bullmq
```

### 2. Environment Variables

```env
# Job Queue Configuration
ENABLE_JOB_QUEUE=true # Set to false to disable queuing
REDIS_URL=redis://localhost:6379 # Required for BullMQ

# Admin Access
ADMIN_USERS=user-id-1,user-id-2
```

### 3. Start Server

The queues and workers will initialize automatically when the server starts (if `ENABLE_JOB_QUEUE` is not false).

## Queue Configurations

### Resume Parsing Queue
```javascript
{
  name: 'resume-parsing',
  concurrency: 5, // Process 5 jobs concurrently
  rateLimit: {
    max: 10, // Max 10 jobs
    duration: 60000 // per minute
  },
  retries: 3,
  backoff: 'exponential'
}
```

### ATS Analysis Queue
```javascript
{
  name: 'ats-analysis',
  concurrency: 3, // Process 3 jobs concurrently
  rateLimit: {
    max: 5, // Max 5 jobs
    duration: 60000 // per minute
  },
  retries: 3,
  backoff: 'exponential'
}
```

### Tailoring Queue
```javascript
{
  name: 'tailoring',
  concurrency: 2, // Process 2 jobs concurrently (resource-intensive)
  rateLimit: {
    max: 3, // Max 3 jobs
    duration: 60000 // per minute
  },
  retries: 3,
  backoff: 'exponential',
  priority: 1 // Higher priority
}
```

## API Endpoints

### 1. Get Job Status

**Endpoint:** `GET /api/queue/job/:queueType/:jobId`

**Queue Types:** `RESUME_PARSING`, `ATS_ANALYSIS`, `TAILORING`

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "TAILORING_1699900000_abc123",
    "status": "active",
    "progress": 45,
    "position": null,
    "data": {
      "userId": "user-123",
      "resumeId": "resume-456",
      "mode": "PARTIAL"
    },
    "timestamp": 1699900000000,
    "processedOn": 1699900005000
  }
}
```

**Job States:**
- `waiting` - Job is in queue
- `active` - Job is being processed
- `completed` - Job finished successfully
- `failed` - Job failed (will retry)
- `delayed` - Job is delayed for retry
- `not_found` - Job doesn't exist

### 2. Cancel Job

**Endpoint:** `DELETE /api/queue/job/:queueType/:jobId`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "jobId": "TAILORING_1699900000_abc123"
  }
}
```

### 3. Get Queue Statistics (Admin)

**Endpoint:** `GET /api/queue/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "RESUME_PARSING": {
      "queueName": "resume-parsing",
      "waiting": 5,
      "active": 3,
      "completed": 120,
      "failed": 2,
      "delayed": 0,
      "total": 130
    },
    "ATS_ANALYSIS": {
      "queueName": "ats-analysis",
      "waiting": 2,
      "active": 1,
      "completed": 85,
      "failed": 1,
      "delayed": 0,
      "total": 89
    },
    "TAILORING": {
      "queueName": "tailoring",
      "waiting": 8,
      "active": 2,
      "completed": 50,
      "failed": 3,
      "delayed": 1,
      "total": 64
    }
  }
}
```

### 4. Get Failed Jobs (Admin)

**Endpoint:** `GET /api/queue/failed/:queueType?limit=50`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "jobId": "TAILORING_1699900000_xyz789",
      "name": "tailoring",
      "data": {
        "userId": "user-456",
        "resumeId": "resume-789"
      },
      "failedReason": "AI service timeout",
      "attemptsMade": 3,
      "timestamp": 1699900000000,
      "finishedOn": 1699900180000
    }
  ]
}
```

### 5. Retry Failed Job (Admin)

**Endpoint:** `POST /api/queue/retry/:queueType/:jobId`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "jobId": "TAILORING_1699900000_xyz789"
  }
}
```

### 6. Pause Queue (Admin)

**Endpoint:** `POST /api/queue/pause/:queueType`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "queueType": "TAILORING",
    "status": "paused"
  }
}
```

### 7. Resume Queue (Admin)

**Endpoint:** `POST /api/queue/resume/:queueType`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "queueType": "TAILORING",
    "status": "active"
  }
}
```

### 8. Clean Queue (Admin)

**Endpoint:** `POST /api/queue/clean/:queueType`

**Body:**
```json
{
  "grace": 86400000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completedCleaned": 50,
    "failedCleaned": 5
  }
}
```

## Usage Examples

### Frontend Integration

#### 1. Submit Job and Track Progress

```typescript
// Submit tailoring job
async function tailorResume(resumeId: string, jobDescription: string) {
  const response = await fetch('/api/editor/ai/tailor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      resumeId,
      jobDescription,
      mode: 'PARTIAL'
    })
  });

  const result = await response.json();
  
  if (result.jobId) {
    // Job was queued
    return trackJobProgress('TAILORING', result.jobId);
  } else {
    // Job was processed immediately (queue disabled)
    return result;
  }
}

// Track job progress
async function trackJobProgress(queueType: string, jobId: string) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/queue/job/${queueType}/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const { data } = await response.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          resolve(data.returnvalue);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          reject(new Error(data.failedReason));
        } else if (data.status === 'waiting') {
          // Show queue position
          console.log(`Position in queue: ${data.position}`);
        } else if (data.status === 'active') {
          // Show progress
          console.log(`Progress: ${data.progress}%`);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 2000); // Poll every 2 seconds
  });
}
```

#### 2. Cancel Job

```typescript
async function cancelJob(queueType: string, jobId: string) {
  const response = await fetch(`/api/queue/job/${queueType}/${jobId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}
```

#### 3. Admin Dashboard - Queue Stats

```typescript
async function getQueueStats() {
  const response = await fetch('/api/queue/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const { data } = await response.json();
  
  // Display stats
  console.log('Queue Statistics:', data);
}
```

## Real-Time Updates via Socket.IO

Jobs automatically emit Socket.IO events for real-time updates:

```typescript
// Listen for job completion
socket.on('tailoring_complete', (data) => {
  console.log('Tailoring completed:', data);
  // Update UI
});

// Listen for job failure
socket.on('tailoring_failed', (data) => {
  console.error('Tailoring failed:', data.error);
  // Show error message
});

// Listen for progress updates
socket.on('resume:tailoring_progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
  // Update progress bar
});
```

## Monitoring & Maintenance

### 1. Monitor Queue Health

```bash
# Check queue stats
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/stats
```

### 2. Clean Old Jobs

```bash
# Clean completed jobs older than 24 hours
curl -X POST -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"grace": 86400000}' \
  http://localhost:3001/api/queue/clean/TAILORING
```

### 3. Retry Failed Jobs

```bash
# Get failed jobs
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/failed/TAILORING

# Retry specific job
curl -X POST -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/retry/TAILORING/<job-id>
```

### 4. Pause/Resume Queues

```bash
# Pause queue (for maintenance)
curl -X POST -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/pause/TAILORING

# Resume queue
curl -X POST -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/resume/TAILORING
```

## Benefits

### 1. Better Resource Management
- **Concurrency Control:** Limits simultaneous operations
- **Rate Limiting:** Prevents API overload
- **Priority Queues:** Critical jobs processed first

### 2. Improved User Experience
- **Queue Position:** Users know their place in line
- **Progress Updates:** Real-time feedback via Socket.IO
- **Job Cancellation:** Users can cancel if needed

### 3. Fault Tolerance
- **Automatic Retries:** Failed jobs retry with exponential backoff
- **Job Persistence:** Jobs survive server restarts
- **Error Tracking:** Failed jobs logged for debugging

### 4. Scalability
- **Horizontal Scaling:** Multiple workers can process same queue
- **Load Distribution:** Jobs distributed across workers
- **Redis-backed:** Shared state across instances

## Troubleshooting

### Queue Not Working

**Check Redis Connection:**
```bash
redis-cli ping
# Should return: PONG
```

**Check Environment Variable:**
```env
ENABLE_JOB_QUEUE=true
REDIS_URL=redis://localhost:6379
```

**Check Server Logs:**
```
✅ Job queues and workers initialized
```

### Jobs Stuck in Queue

**Check Worker Status:**
```bash
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/stats
```

**Restart Workers:**
```bash
# Restart server
npm run dev
```

### High Failure Rate

**Check Failed Jobs:**
```bash
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3001/api/queue/failed/TAILORING
```

**Common Causes:**
- AI service timeouts
- Invalid input data
- Rate limit exceeded
- Database connection issues

## Performance Tuning

### Adjust Concurrency

Edit `apps/api/services/queue/workers.js`:

```javascript
// Increase concurrency for more throughput
const worker = new Worker('resume-parsing', processor, {
  concurrency: 10, // Increased from 5
  ...
});
```

### Adjust Rate Limits

Edit `apps/api/services/queue/workers.js`:

```javascript
// Adjust rate limits
limiter: {
  max: 20, // Increased from 10
  duration: 60000
}
```

### Adjust Retry Strategy

Edit `apps/api/services/queue/queueManager.js`:

```javascript
defaultJobOptions: {
  attempts: 5, // Increased from 3
  backoff: {
    type: 'exponential',
    delay: 3000 // Increased from 2000
  }
}
```

## Summary

**Status:** ✅ Complete

**Features:**
- 3 job queues (parsing, ATS, tailoring)
- Automatic retries with exponential backoff
- Real-time progress tracking
- Queue position visibility
- Job cancellation
- Admin dashboard
- Fault tolerance
- Horizontal scalability

**Benefits:**
- Better resource management
- Improved user experience
- Fault tolerance
- Scalability

**Next Steps:**
1. Install BullMQ: `npm install bullmq`
2. Configure environment variables
3. Test queue functionality
4. Monitor queue health
5. Adjust concurrency/rate limits as needed

---

**Last Updated**: November 14, 2024  
**Version**: 1.0.0

