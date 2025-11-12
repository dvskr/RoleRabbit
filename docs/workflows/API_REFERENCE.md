# Workflow Automation - API Reference

Complete API documentation for programmatic workflow management and execution.

## Table of Contents

1. [Authentication](#authentication)
2. [Workflows](#workflows)
3. [Executions](#executions)
4. [Templates](#templates)
5. [Nodes](#nodes)
6. [Schedules](#schedules)
7. [Webhooks](#webhooks)
8. [Statistics](#statistics)
9. [WebSocket Events](#websocket-events)
10. [Error Handling](#error-handling)

## Base URL

```
https://api.rolerabbit.com
```

## Authentication

All API requests require authentication using a bearer token in the Authorization header.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Obtain an access token through the authentication endpoints described in the main API documentation.

## Workflows

### Create Workflow

Create a new workflow.

**Endpoint**: `POST /api/workflows`

**Request Body**:
```json
{
  "name": "Resume Tailoring Workflow",
  "description": "Analyzes jobs and generates tailored resumes",
  "triggerType": "MANUAL",
  "triggerConfig": {},
  "nodes": [
    {
      "id": "node-1",
      "type": "AI_AGENT_ANALYZE",
      "position": { "x": 100, "y": 100 },
      "config": {
        "jobUrlPath": "input.jobUrl",
        "minScore": 7
      }
    }
  ],
  "connections": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "sourceHandle": "output",
      "targetHandle": "input"
    }
  ],
  "status": "DRAFT",
  "maxConcurrentExecutions": 1,
  "timeoutSeconds": 300,
  "retryOnFailure": true,
  "maxRetries": 3
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-123",
    "userId": "user-123",
    "name": "Resume Tailoring Workflow",
    "description": "Analyzes jobs and generates tailored resumes",
    "triggerType": "MANUAL",
    "triggerConfig": {},
    "nodes": [...],
    "connections": [...],
    "status": "DRAFT",
    "isTemplate": false,
    "maxConcurrentExecutions": 1,
    "timeoutSeconds": 300,
    "retryOnFailure": true,
    "maxRetries": 3,
    "totalExecutions": 0,
    "successfulExecutions": 0,
    "failedExecutions": 0,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Get Workflow

Retrieve a specific workflow by ID.

**Endpoint**: `GET /api/workflows/:id`

**Response**: `200 OK`
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-123",
    "name": "Resume Tailoring Workflow",
    "description": "...",
    "nodes": [...],
    "connections": [...],
    "status": "ACTIVE",
    "executions": [
      {
        "id": "execution-1",
        "status": "COMPLETED",
        "createdAt": "2025-01-15T11:00:00Z"
      }
    ],
    "schedules": [...],
    "webhooks": [...]
  }
}
```

### List Workflows

List all workflows for the authenticated user.

**Endpoint**: `GET /api/workflows`

**Query Parameters**:
- `status` (optional): Filter by status (DRAFT, ACTIVE, INACTIVE, ARCHIVED)
- `triggerType` (optional): Filter by trigger (MANUAL, SCHEDULED, WEBHOOK)
- `isTemplate` (optional): Filter templates (true/false)
- `search` (optional): Search by name or description
- `limit` (optional): Results per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example**:
```http
GET /api/workflows?status=ACTIVE&limit=10&offset=0
```

**Response**: `200 OK`
```json
{
  "success": true,
  "workflows": [
    {
      "id": "workflow-123",
      "name": "Resume Tailoring Workflow",
      "status": "ACTIVE",
      "triggerType": "MANUAL",
      "totalExecutions": 15,
      "successfulExecutions": 14,
      "failedExecutions": 1,
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### Update Workflow

Update an existing workflow.

**Endpoint**: `PUT /api/workflows/:id`

**Request Body**: Same as Create Workflow (only include fields to update)

**Response**: `200 OK`
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-123",
    "name": "Updated Workflow Name",
    ...
  }
}
```

### Delete Workflow

Delete a workflow and all associated data.

**Endpoint**: `DELETE /api/workflows/:id`

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Workflow deleted successfully"
}
```

**Note**: Cannot delete workflows with active executions or template workflows.

## Executions

### Execute Workflow

Start a workflow execution.

**Endpoint**: `POST /api/workflows/:id/execute`

**Request Body**:
```json
{
  "input": {
    "jobUrl": "https://example.com/job/123",
    "jobDescription": "Software Engineer position...",
    "company": "Acme Corp"
  }
}
```

**Response**: `202 Accepted`
```json
{
  "success": true,
  "executionId": "execution-456",
  "status": "QUEUED",
  "message": "Workflow execution started"
}
```

### Get Execution

Retrieve execution details and status.

**Endpoint**: `GET /api/workflows/executions/:executionId`

**Response**: `200 OK`
```json
{
  "success": true,
  "execution": {
    "id": "execution-456",
    "workflowId": "workflow-123",
    "userId": "user-123",
    "status": "COMPLETED",
    "triggeredBy": "manual",
    "input": {
      "jobUrl": "https://example.com/job/123"
    },
    "output": {
      "resume": "...",
      "coverLetter": "..."
    },
    "error": null,
    "startedAt": "2025-01-15T12:00:00Z",
    "completedAt": "2025-01-15T12:02:30Z",
    "duration": 150000,
    "workflow": {
      "id": "workflow-123",
      "name": "Resume Tailoring Workflow"
    },
    "logs": [
      {
        "id": "log-1",
        "nodeId": "node-1",
        "level": "INFO",
        "message": "Node started",
        "timestamp": "2025-01-15T12:00:05Z"
      }
    ]
  }
}
```

### List Executions

List workflow executions.

**Endpoint**: `GET /api/workflows/executions`

**Query Parameters**:
- `workflowId` (optional): Filter by workflow
- `status` (optional): Filter by status (QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED)
- `triggeredBy` (optional): Filter by trigger (manual, scheduled, webhook)
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**: `200 OK`
```json
{
  "success": true,
  "executions": [
    {
      "id": "execution-456",
      "workflowId": "workflow-123",
      "status": "COMPLETED",
      "triggeredBy": "manual",
      "startedAt": "2025-01-15T12:00:00Z",
      "completedAt": "2025-01-15T12:02:30Z",
      "workflow": {
        "id": "workflow-123",
        "name": "Resume Tailoring Workflow"
      }
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### Cancel Execution

Cancel a running execution.

**Endpoint**: `POST /api/workflows/executions/:executionId/cancel`

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Execution cancelled successfully"
}
```

## Templates

### Get Templates

Retrieve available workflow templates.

**Endpoint**: `GET /api/workflows/templates`

**Query Parameters**:
- `triggerType` (optional): Filter by trigger type
- `search` (optional): Search templates
- `limit` (optional): Results limit (default: 20)

**Response**: `200 OK`
```json
{
  "success": true,
  "templates": [
    {
      "id": "template-1",
      "name": "Resume Tailoring Template",
      "description": "Analyze job and generate tailored resume",
      "triggerType": "MANUAL",
      "nodes": [...],
      "connections": [...],
      "totalExecutions": 1250,
      "successfulExecutions": 1200,
      "isTemplate": true
    }
  ]
}
```

### Create from Template

Create a workflow from a template.

**Endpoint**: `POST /api/workflows/from-template/:templateId`

**Request Body** (optional):
```json
{
  "name": "My Custom Workflow",
  "description": "Customized from template",
  "triggerConfig": {
    "schedule": "0 9 * * 1-5"
  }
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-789",
    "name": "My Custom Workflow",
    "status": "DRAFT",
    ...
  }
}
```

## Nodes

### Get Node Metadata

Retrieve metadata for all available node types.

**Endpoint**: `GET /api/workflows/nodes/metadata`

**Response**: `200 OK`
```json
{
  "success": true,
  "nodes": [
    {
      "type": "AI_AGENT_ANALYZE",
      "name": "AI Agent Analyze",
      "category": "AI",
      "description": "Analyzes job postings and determines fit",
      "inputs": [
        {
          "name": "jobUrl",
          "type": "string",
          "required": true,
          "description": "URL of the job posting"
        }
      ],
      "outputs": [
        {
          "name": "score",
          "type": "number",
          "description": "Match score (1-10)"
        },
        {
          "name": "analysis",
          "type": "object",
          "description": "Detailed analysis"
        }
      ],
      "config": [
        {
          "key": "minScore",
          "type": "number",
          "default": 7,
          "description": "Minimum match score"
        }
      ]
    }
  ]
}
```

### Test Node

Test a single node with provided input.

**Endpoint**: `POST /api/workflows/nodes/test`

**Request Body**:
```json
{
  "node": {
    "id": "test-node",
    "type": "AI_AGENT_ANALYZE",
    "config": {
      "jobUrlPath": "jobUrl",
      "minScore": 7
    }
  },
  "testInput": {
    "jobUrl": "https://example.com/job/123",
    "jobDescription": "Software Engineer position..."
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "result": {
    "score": 8.5,
    "analysis": {
      "strengths": ["Good match for skills"],
      "weaknesses": ["Location mismatch"]
    }
  },
  "duration": 1250,
  "executedAt": "2025-01-15T13:00:00Z"
}
```

**Error Response**: `200 OK`
```json
{
  "success": false,
  "error": {
    "message": "Invalid job URL",
    "stack": "Error: Invalid job URL\n  at ..."
  },
  "executedAt": "2025-01-15T13:00:00Z"
}
```

## Schedules

### Create Schedule

Create a schedule for a workflow.

**Endpoint**: `POST /api/workflows/:id/schedules`

**Request Body**:
```json
{
  "cronExpression": "0 9 * * 1-5",
  "timezone": "America/New_York",
  "isActive": true,
  "input": {
    "jobBoard": "LinkedIn",
    "keywords": ["Software Engineer"]
  }
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "schedule": {
    "id": "schedule-123",
    "workflowId": "workflow-123",
    "cronExpression": "0 9 * * 1-5",
    "timezone": "America/New_York",
    "isActive": true,
    "input": {...},
    "nextRun": "2025-01-16T09:00:00Z",
    "createdAt": "2025-01-15T14:00:00Z"
  }
}
```

### Update Schedule

Update a workflow schedule.

**Endpoint**: `PUT /api/workflows/schedules/:scheduleId`

**Request Body**: Same as Create Schedule

**Response**: `200 OK`

### Delete Schedule

Delete a workflow schedule.

**Endpoint**: `DELETE /api/workflows/schedules/:scheduleId`

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

## Webhooks

### Create Webhook

Create a webhook for a workflow.

**Endpoint**: `POST /api/workflows/:id/webhooks`

**Response**: `201 Created`
```json
{
  "success": true,
  "webhook": {
    "id": "webhook-123",
    "workflowId": "workflow-123",
    "url": "/api/workflows/webhook/abc123def456",
    "method": "POST",
    "isActive": true,
    "totalTriggers": 0,
    "lastTriggeredAt": null,
    "createdAt": "2025-01-15T15:00:00Z"
  }
}
```

### Delete Webhook

Delete a workflow webhook.

**Endpoint**: `DELETE /api/workflows/webhooks/:webhookId`

**Response**: `200 OK`

### Trigger via Webhook

Execute a workflow via webhook (public endpoint - no authentication required).

**Endpoint**: `POST /api/workflows/webhook/:webhookPath`

**Request Body**:
```json
{
  "jobUrl": "https://example.com/job/123",
  "source": "external-system"
}
```

**Response**: `202 Accepted`
```json
{
  "success": true,
  "executionId": "execution-789",
  "status": "QUEUED",
  "message": "Workflow triggered successfully"
}
```

## Statistics

### Get Workflow Stats

Retrieve workflow execution statistics.

**Endpoint**: `GET /api/workflows/stats`

**Response**: `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalWorkflows": 15,
    "totalExecutions": 250,
    "successfulExecutions": 235,
    "failedExecutions": 15,
    "activeExecutions": 3,
    "successRate": "94.00",
    "recentExecutions": [
      {
        "id": "execution-456",
        "workflowId": "workflow-123",
        "status": "COMPLETED",
        "startedAt": "2025-01-15T12:00:00Z",
        "workflow": {
          "name": "Resume Tailoring Workflow"
        }
      }
    ]
  }
}
```

## WebSocket Events

Connect to receive real-time updates about workflow executions.

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('https://api.rolerabbit.com', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to workflow events');
});
```

### Events

#### workflow:execution_queued

Emitted when a workflow execution is queued.

```javascript
socket.on('workflow:execution_queued', (data) => {
  console.log('Workflow queued:', data);
  // {
  //   executionId: 'execution-456',
  //   workflowId: 'workflow-123',
  //   workflowName: 'Resume Tailoring Workflow',
  //   status: 'QUEUED',
  //   timestamp: '2025-01-15T12:00:00Z'
  // }
});
```

#### workflow:execution_started

Emitted when a workflow execution starts.

```javascript
socket.on('workflow:execution_started', (data) => {
  console.log('Workflow started:', data);
});
```

#### workflow:execution_completed

Emitted when a workflow execution completes successfully.

```javascript
socket.on('workflow:execution_completed', (data) => {
  console.log('Workflow completed:', data);
  // {
  //   executionId: 'execution-456',
  //   workflowId: 'workflow-123',
  //   status: 'COMPLETED',
  //   result: {...},
  //   duration: 150000,
  //   timestamp: '2025-01-15T12:02:30Z'
  // }
});
```

#### workflow:execution_failed

Emitted when a workflow execution fails.

```javascript
socket.on('workflow:execution_failed', (data) => {
  console.log('Workflow failed:', data);
  // {
  //   executionId: 'execution-456',
  //   workflowId: 'workflow-123',
  //   status: 'FAILED',
  //   error: 'Node execution failed',
  //   failedNodeId: 'node-2',
  //   timestamp: '2025-01-15T12:01:45Z'
  // }
});
```

#### workflow:execution_cancelled

Emitted when a workflow execution is cancelled.

```javascript
socket.on('workflow:execution_cancelled', (data) => {
  console.log('Workflow cancelled:', data);
});
```

#### workflow:node_started

Emitted when a node starts executing.

```javascript
socket.on('workflow:node_started', (data) => {
  console.log('Node started:', data);
  // {
  //   executionId: 'execution-456',
  //   nodeId: 'node-1',
  //   nodeName: 'AI Agent Analyze',
  //   nodeType: 'AI_AGENT_ANALYZE',
  //   status: 'RUNNING',
  //   timestamp: '2025-01-15T12:00:05Z'
  // }
});
```

#### workflow:node_completed

Emitted when a node completes execution.

```javascript
socket.on('workflow:node_completed', (data) => {
  console.log('Node completed:', data);
  // {
  //   executionId: 'execution-456',
  //   nodeId: 'node-1',
  //   nodeName: 'AI Agent Analyze',
  //   status: 'COMPLETED',
  //   result: {...},
  //   duration: 5000,
  //   timestamp: '2025-01-15T12:00:10Z'
  // }
});
```

#### workflow:node_failed

Emitted when a node execution fails.

```javascript
socket.on('workflow:node_failed', (data) => {
  console.error('Node failed:', data);
});
```

#### workflow:execution_progress

Emitted periodically with execution progress.

```javascript
socket.on('workflow:execution_progress', (data) => {
  console.log('Progress:', data);
  // {
  //   executionId: 'execution-456',
  //   completedNodes: 2,
  //   totalNodes: 5,
  //   percentage: 40,
  //   timestamp: '2025-01-15T12:01:00Z'
  // }
});
```

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `202 Accepted`: Request accepted for processing
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., concurrent execution limit)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Errors

#### Invalid Workflow Structure

```json
{
  "success": false,
  "error": "Workflow validation failed: Missing required field 'name'"
}
```

#### Execution Limit Reached

```json
{
  "success": false,
  "error": "Maximum concurrent executions reached"
}
```

#### Node Configuration Error

```json
{
  "success": false,
  "error": "Node configuration invalid: jobUrlPath is required"
}
```

#### Workflow Not Found

```json
{
  "success": false,
  "error": "Workflow not found"
}
```

## Rate Limits

- **Workflow Creation**: 10 per minute
- **Workflow Execution**: 30 per minute
- **API Requests**: 100 per minute per user
- **Webhook Triggers**: 100 per hour per webhook

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { WorkflowClient } from '@rolerabbit/sdk';

const client = new WorkflowClient({
  apiKey: process.env.ROLERABBIT_API_KEY
});

// Create workflow
const workflow = await client.workflows.create({
  name: 'My Workflow',
  triggerType: 'MANUAL',
  nodes: [...],
  connections: [...]
});

// Execute workflow
const execution = await client.workflows.execute(workflow.id, {
  jobUrl: 'https://example.com/job/123'
});

// Listen to events
client.on('workflow:execution_completed', (data) => {
  console.log('Completed:', data);
});
```

### Python

```python
from rolerabbit import WorkflowClient

client = WorkflowClient(api_key=os.environ['ROLERABBIT_API_KEY'])

# Create workflow
workflow = client.workflows.create(
    name='My Workflow',
    trigger_type='MANUAL',
    nodes=[...],
    connections=[...]
)

# Execute workflow
execution = client.workflows.execute(
    workflow_id=workflow['id'],
    input={'jobUrl': 'https://example.com/job/123'}
)

# Wait for completion
result = client.executions.wait_for_completion(execution['executionId'])
print(result)
```

## Pagination

All list endpoints support pagination:

```http
GET /api/workflows?limit=20&offset=40
```

Response includes pagination metadata:

```json
{
  "success": true,
  "workflows": [...],
  "total": 100,
  "limit": 20,
  "offset": 40
}
```

Calculate pages:
- Current page: `Math.floor(offset / limit) + 1`
- Total pages: `Math.ceil(total / limit)`
- Has next: `offset + limit < total`
- Has previous: `offset > 0`

## Versioning

API version is specified in the URL:

```
https://api.rolerabbit.com/v1/workflows
```

Current version: `v1`

Breaking changes will introduce new versions while maintaining backward compatibility for at least 6 months.

## Support

- **Documentation**: https://docs.rolerabbit.com
- **API Status**: https://status.rolerabbit.com
- **Support Email**: api-support@rolerabbit.com
- **Discord Community**: https://discord.gg/rolerabbit
