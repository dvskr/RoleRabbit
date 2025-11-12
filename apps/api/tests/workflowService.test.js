/**
 * Tests for Workflow Service
 * Comprehensive unit tests for workflow CRUD and execution
 */

const {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecution,
  listExecutions,
  cancelExecution,
  getTemplates,
  createFromTemplate,
  getNodeMetadata,
  testNode
} = require('../services/workflowService');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    workflow: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn()
    },
    workflowExecution: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    workflowExecutionLog: {
      deleteMany: jest.fn()
    },
    workflowSchedule: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    workflowWebhook: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    $transaction: jest.fn((operations) => Promise.all(operations))
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock WorkflowExecutor
jest.mock('../services/workflows/workflowExecutor', () => {
  return jest.fn().mockImplementation(() => ({
    executeWorkflow: jest.fn().mockResolvedValue({
      executionId: 'test-execution-id',
      status: 'QUEUED'
    })
  }));
});

// Mock NodeRegistry
jest.mock('../services/workflows/nodeRegistry', () => {
  return jest.fn().mockImplementation(() => ({
    getAllNodeMetadata: jest.fn().mockReturnValue([
      { type: 'AI_AGENT_ANALYZE', name: 'AI Agent Analyze', category: 'AI' },
      { type: 'RESUME_GENERATE', name: 'Resume Generator', category: 'Resume' }
    ]),
    getNodeExecutor: jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue({ success: true, data: 'test result' })
    })
  }));
});

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Workflow Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkflow', () => {
    it('should create a new workflow successfully', async () => {
      const userId = 'user-123';
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test Description',
        triggerType: 'MANUAL',
        nodes: [],
        connections: []
      };

      const mockWorkflow = {
        id: 'workflow-123',
        userId,
        ...workflowData,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prisma.workflow.create.mockResolvedValue(mockWorkflow);

      const result = await createWorkflow(userId, workflowData);

      expect(result).toEqual(mockWorkflow);
      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          name: workflowData.name,
          description: workflowData.description,
          triggerType: 'MANUAL'
        })
      });
    });

    it('should handle errors when creating workflow', async () => {
      const userId = 'user-123';
      const workflowData = { name: 'Test Workflow' };

      prisma.workflow.create.mockRejectedValue(new Error('Database error'));

      await expect(createWorkflow(userId, workflowData)).rejects.toThrow('Failed to create workflow');
    });
  });

  describe('getWorkflow', () => {
    it('should retrieve a workflow by ID', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      const mockWorkflow = {
        id: workflowId,
        userId,
        name: 'Test Workflow',
        executions: [],
        schedules: [],
        webhooks: []
      };

      prisma.workflow.findFirst.mockResolvedValue(mockWorkflow);

      const result = await getWorkflow(workflowId, userId);

      expect(result).toEqual(mockWorkflow);
      expect(prisma.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: workflowId, userId },
        include: {
          executions: { take: 10, orderBy: { createdAt: 'desc' } },
          schedules: true,
          webhooks: true
        }
      });
    });

    it('should throw error when workflow not found', async () => {
      prisma.workflow.findFirst.mockResolvedValue(null);

      await expect(getWorkflow('invalid-id', 'user-123')).rejects.toThrow('Workflow not found');
    });
  });

  describe('listWorkflows', () => {
    it('should list workflows for a user', async () => {
      const userId = 'user-123';
      const mockWorkflows = [
        { id: 'workflow-1', userId, name: 'Workflow 1' },
        { id: 'workflow-2', userId, name: 'Workflow 2' }
      ];

      prisma.workflow.findMany.mockResolvedValue(mockWorkflows);
      prisma.workflow.count.mockResolvedValue(2);

      const result = await listWorkflows(userId, {});

      expect(result.workflows).toEqual(mockWorkflows);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should apply filters correctly', async () => {
      const userId = 'user-123';
      const filters = {
        status: 'ACTIVE',
        triggerType: 'MANUAL',
        search: 'test',
        limit: 10,
        offset: 5
      };

      prisma.workflow.findMany.mockResolvedValue([]);
      prisma.workflow.count.mockResolvedValue(0);

      await listWorkflows(userId, filters);

      expect(prisma.workflow.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId,
          status: 'ACTIVE',
          triggerType: 'MANUAL',
          OR: expect.any(Array)
        }),
        orderBy: { updatedAt: 'desc' },
        take: 10,
        skip: 5,
        include: {
          _count: {
            select: { executions: true }
          }
        }
      });
    });
  });

  describe('updateWorkflow', () => {
    it('should update a workflow successfully', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';
      const updates = {
        name: 'Updated Workflow',
        description: 'Updated Description'
      };

      const existingWorkflow = {
        id: workflowId,
        userId,
        name: 'Old Name',
        isTemplate: false
      };

      const updatedWorkflow = {
        ...existingWorkflow,
        ...updates
      };

      prisma.workflow.findFirst.mockResolvedValue(existingWorkflow);
      prisma.workflow.update.mockResolvedValue(updatedWorkflow);

      const result = await updateWorkflow(workflowId, userId, updates);

      expect(result).toEqual(updatedWorkflow);
      expect(prisma.workflow.update).toHaveBeenCalled();
    });

    it('should prevent updating template workflows', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      prisma.workflow.findFirst.mockResolvedValue({
        id: workflowId,
        userId,
        isTemplate: true
      });

      await expect(updateWorkflow(workflowId, userId, {})).rejects.toThrow('Cannot modify template workflows');
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete a workflow successfully', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      const workflow = {
        id: workflowId,
        userId,
        isTemplate: false
      };

      prisma.workflow.findFirst.mockResolvedValue(workflow);
      prisma.workflowExecution.count.mockResolvedValue(0);
      prisma.$transaction.mockResolvedValue([]);

      const result = await deleteWorkflow(workflowId, userId);

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should prevent deleting workflows with active executions', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      prisma.workflow.findFirst.mockResolvedValue({
        id: workflowId,
        userId,
        isTemplate: false
      });
      prisma.workflowExecution.count.mockResolvedValue(2);

      await expect(deleteWorkflow(workflowId, userId)).rejects.toThrow('Cannot delete workflow with active executions');
    });
  });

  describe('executeWorkflow', () => {
    it('should execute a workflow successfully', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';
      const input = { test: 'data' };

      const workflow = {
        id: workflowId,
        userId,
        status: 'ACTIVE',
        maxConcurrentExecutions: 1
      };

      prisma.workflow.findFirst.mockResolvedValue(workflow);
      prisma.workflowExecution.count.mockResolvedValue(0);

      const result = await executeWorkflow(workflowId, userId, input, 'manual');

      expect(result.executionId).toBe('test-execution-id');
      expect(result.status).toBe('QUEUED');
    });

    it('should prevent execution when concurrent limit reached', async () => {
      const workflowId = 'workflow-123';
      const userId = 'user-123';

      const workflow = {
        id: workflowId,
        userId,
        status: 'ACTIVE',
        maxConcurrentExecutions: 1
      };

      prisma.workflow.findFirst.mockResolvedValue(workflow);
      prisma.workflowExecution.count.mockResolvedValue(1);

      await expect(executeWorkflow(workflowId, userId, {}, 'manual')).rejects.toThrow('Maximum concurrent executions reached');
    });
  });

  describe('getTemplates', () => {
    it('should retrieve workflow templates', async () => {
      const mockTemplates = [
        { id: 'template-1', name: 'Template 1', isTemplate: true },
        { id: 'template-2', name: 'Template 2', isTemplate: true }
      ];

      prisma.workflow.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplates({});

      expect(result).toEqual(mockTemplates);
      expect(prisma.workflow.findMany).toHaveBeenCalledWith({
        where: { isTemplate: true },
        orderBy: { totalExecutions: 'desc' },
        take: 20
      });
    });
  });

  describe('createFromTemplate', () => {
    it('should create workflow from template', async () => {
      const templateId = 'template-123';
      const userId = 'user-123';

      const template = {
        id: templateId,
        name: 'Template Workflow',
        isTemplate: true,
        nodes: [],
        connections: [],
        triggerType: 'MANUAL'
      };

      const newWorkflow = {
        id: 'new-workflow-123',
        userId,
        name: 'Template Workflow',
        isTemplate: false
      };

      prisma.workflow.findFirst.mockResolvedValue(template);
      prisma.workflow.create.mockResolvedValue(newWorkflow);

      const result = await createFromTemplate(templateId, userId, {});

      expect(result).toEqual(newWorkflow);
      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          isTemplate: false
        })
      });
    });
  });

  describe('getNodeMetadata', () => {
    it('should retrieve all node metadata', async () => {
      const result = await getNodeMetadata();

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('AI_AGENT_ANALYZE');
    });
  });

  describe('testNode', () => {
    it('should test a node successfully', async () => {
      const userId = 'user-123';
      const nodeData = {
        type: 'AI_AGENT_ANALYZE',
        config: {}
      };
      const testInput = { test: 'data' };

      const result = await testNode(userId, nodeData, testInput);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.duration).toBeDefined();
    });

    it('should handle node test failures', async () => {
      const NodeRegistry = require('../services/workflows/nodeRegistry');
      const mockRegistry = new NodeRegistry();
      mockRegistry.getNodeExecutor.mockReturnValue({
        execute: jest.fn().mockRejectedValue(new Error('Execution failed'))
      });

      const userId = 'user-123';
      const nodeData = {
        type: 'INVALID_NODE',
        config: {}
      };

      const result = await testNode(userId, nodeData, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
