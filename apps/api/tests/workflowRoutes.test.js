/**
 * Tests for Workflow Routes
 * Integration tests for workflow API endpoints
 */

const fastify = require('fastify');
const workflowRoutes = require('../routes/workflow.routes');

// Mock the workflow service
jest.mock('../services/workflowService', () => ({
  createWorkflow: jest.fn(),
  getWorkflow: jest.fn(),
  listWorkflows: jest.fn(),
  updateWorkflow: jest.fn(),
  deleteWorkflow: jest.fn(),
  executeWorkflow: jest.fn(),
  getExecution: jest.fn(),
  listExecutions: jest.fn(),
  cancelExecution: jest.fn(),
  getTemplates: jest.fn(),
  createFromTemplate: jest.fn(),
  getNodeMetadata: jest.fn(),
  testNode: jest.fn(),
  createSchedule: jest.fn(),
  updateSchedule: jest.fn(),
  deleteSchedule: jest.fn(),
  createWebhook: jest.fn(),
  deleteWebhook: jest.fn(),
  executeViaWebhook: jest.fn(),
  getWorkflowStats: jest.fn()
}));

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((request, reply, done) => {
    request.user = { userId: 'test-user-123' };
    done();
  })
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

const workflowService = require('../services/workflowService');

describe('Workflow Routes', () => {
  let app;

  beforeEach(async () => {
    app = fastify();
    await app.register(workflowRoutes);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/workflows', () => {
    it('should create a new workflow', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        status: 'DRAFT'
      };

      workflowService.createWorkflow.mockResolvedValue(mockWorkflow);

      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows',
        payload: {
          name: 'Test Workflow',
          description: 'Test Description'
        }
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.workflow).toEqual(mockWorkflow);
    });

    it('should return 400 if name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows',
        payload: {
          description: 'Test Description'
        }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
      expect(data.error).toContain('name is required');
    });
  });

  describe('GET /api/workflows', () => {
    it('should list all workflows', async () => {
      const mockResult = {
        workflows: [
          { id: 'workflow-1', name: 'Workflow 1' },
          { id: 'workflow-2', name: 'Workflow 2' }
        ],
        total: 2,
        limit: 50,
        offset: 0
      };

      workflowService.listWorkflows.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.workflows).toHaveLength(2);
    });

    it('should apply query filters', async () => {
      workflowService.listWorkflows.mockResolvedValue({
        workflows: [],
        total: 0,
        limit: 10,
        offset: 0
      });

      await app.inject({
        method: 'GET',
        url: '/api/workflows?status=ACTIVE&limit=10'
      });

      expect(workflowService.listWorkflows).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          status: 'ACTIVE',
          limit: 10
        })
      );
    });
  });

  describe('GET /api/workflows/:id', () => {
    it('should retrieve a specific workflow', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow'
      };

      workflowService.getWorkflow.mockResolvedValue(mockWorkflow);

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows/workflow-123'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.workflow).toEqual(mockWorkflow);
    });

    it('should return 404 when workflow not found', async () => {
      workflowService.getWorkflow.mockRejectedValue(new Error('Workflow not found'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows/invalid-id'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/workflows/:id', () => {
    it('should update a workflow', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Updated Workflow'
      };

      workflowService.updateWorkflow.mockResolvedValue(mockWorkflow);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/workflows/workflow-123',
        payload: {
          name: 'Updated Workflow'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.workflow.name).toBe('Updated Workflow');
    });
  });

  describe('DELETE /api/workflows/:id', () => {
    it('should delete a workflow', async () => {
      workflowService.deleteWorkflow.mockResolvedValue({ success: true });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/workflows/workflow-123'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/workflows/:id/execute', () => {
    it('should execute a workflow', async () => {
      const mockResult = {
        executionId: 'execution-123',
        status: 'QUEUED'
      };

      workflowService.executeWorkflow.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows/workflow-123/execute',
        payload: {
          input: { test: 'data' }
        }
      });

      expect(response.statusCode).toBe(202);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.executionId).toBe('execution-123');
    });
  });

  describe('GET /api/workflows/executions/:executionId', () => {
    it('should retrieve execution details', async () => {
      const mockExecution = {
        id: 'execution-123',
        status: 'COMPLETED'
      };

      workflowService.getExecution.mockResolvedValue(mockExecution);

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows/executions/execution-123'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.execution).toEqual(mockExecution);
    });
  });

  describe('POST /api/workflows/executions/:executionId/cancel', () => {
    it('should cancel an execution', async () => {
      workflowService.cancelExecution.mockResolvedValue({ success: true });

      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows/executions/execution-123/cancel'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/workflows/templates', () => {
    it('should retrieve workflow templates', async () => {
      const mockTemplates = [
        { id: 'template-1', name: 'Template 1' }
      ];

      workflowService.getTemplates.mockResolvedValue(mockTemplates);

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows/templates'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.templates).toEqual(mockTemplates);
    });
  });

  describe('POST /api/workflows/from-template/:templateId', () => {
    it('should create workflow from template', async () => {
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'From Template'
      };

      workflowService.createFromTemplate.mockResolvedValue(mockWorkflow);

      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows/from-template/template-123',
        payload: {}
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.workflow).toEqual(mockWorkflow);
    });
  });

  describe('GET /api/workflows/nodes/metadata', () => {
    it('should retrieve node metadata', async () => {
      const mockMetadata = [
        { type: 'AI_AGENT_ANALYZE', name: 'AI Agent Analyze' }
      ];

      workflowService.getNodeMetadata.mockResolvedValue(mockMetadata);

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows/nodes/metadata'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.nodes).toEqual(mockMetadata);
    });
  });

  describe('POST /api/workflows/nodes/test', () => {
    it('should test a node', async () => {
      const mockResult = {
        success: true,
        result: { data: 'test' },
        duration: 125
      };

      workflowService.testNode.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows/nodes/test',
        payload: {
          node: {
            type: 'AI_AGENT_ANALYZE',
            config: {}
          },
          testInput: { test: 'data' }
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
    });

    it('should return 400 if node data is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/workflows/nodes/test',
        payload: {
          testInput: { test: 'data' }
        }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/workflows/stats', () => {
    it('should retrieve workflow statistics', async () => {
      const mockStats = {
        totalWorkflows: 10,
        totalExecutions: 50,
        successfulExecutions: 45,
        failedExecutions: 5,
        successRate: '90.00'
      };

      workflowService.getWorkflowStats.mockResolvedValue(mockStats);

      const response = await app.inject({
        method: 'GET',
        url: '/api/workflows/stats'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual(mockStats);
    });
  });
});
