/**
 * Tests for useWorkflowApi Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkflowApi } from '../useWorkflowApi';

// Mock fetch
global.fetch = jest.fn();

describe('useWorkflowApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWorkflowApi());

    expect(result.current.workflows).toEqual([]);
    expect(result.current.currentWorkflow).toBeNull();
    expect(result.current.executions).toEqual([]);
    expect(result.current.templates).toEqual([]);
    expect(result.current.stats).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should have all required functions', () => {
    const { result } = renderHook(() => useWorkflowApi());

    expect(typeof result.current.loadWorkflows).toBe('function');
    expect(typeof result.current.loadWorkflow).toBe('function');
    expect(typeof result.current.createWorkflow).toBe('function');
    expect(typeof result.current.updateWorkflow).toBe('function');
    expect(typeof result.current.deleteWorkflow).toBe('function');
    expect(typeof result.current.executeWorkflow).toBe('function');
    expect(typeof result.current.loadExecutions).toBe('function');
    expect(typeof result.current.loadTemplates).toBe('function');
    expect(typeof result.current.createFromTemplate).toBe('function');
    expect(typeof result.current.loadStats).toBe('function');
    expect(typeof result.current.setCurrentWorkflow).toBe('function');
  });

  describe('loadWorkflows', () => {
    it('should load workflows successfully', async () => {
      const mockWorkflows = [
        { id: 'workflow-1', name: 'Workflow 1' },
        { id: 'workflow-2', name: 'Workflow 2' }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          workflows: mockWorkflows,
          total: 2
        })
      });

      const { result } = renderHook(() => useWorkflowApi());

      await act(async () => {
        await result.current.loadWorkflows();
      });

      await waitFor(() => {
        expect(result.current.workflows).toEqual(mockWorkflows);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle load workflows error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Failed to load workflows'
        })
      });

      const { result } = renderHook(() => useWorkflowApi());

      await act(async () => {
        await result.current.loadWorkflows();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load workflows');
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('createWorkflow', () => {
    it('should create a workflow successfully', async () => {
      const newWorkflow = {
        id: 'workflow-new',
        name: 'New Workflow',
        status: 'DRAFT'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          workflow: newWorkflow
        })
      });

      const { result } = renderHook(() => useWorkflowApi());

      let createdWorkflow;
      await act(async () => {
        createdWorkflow = await result.current.createWorkflow({
          name: 'New Workflow',
          description: 'Test',
          triggerType: 'MANUAL',
          nodes: [],
          connections: []
        } as any);
      });

      expect(createdWorkflow).toEqual(newWorkflow);
    });
  });

  describe('executeWorkflow', () => {
    it('should execute a workflow successfully', async () => {
      const executionResult = {
        executionId: 'execution-123',
        status: 'QUEUED'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ...executionResult
        })
      });

      const { result } = renderHook(() => useWorkflowApi());

      let execResult;
      await act(async () => {
        execResult = await result.current.executeWorkflow('workflow-123', { input: 'data' });
      });

      expect(execResult).toEqual(expect.objectContaining({
        executionId: 'execution-123',
        status: 'QUEUED'
      }));
    });
  });

  describe('loadTemplates', () => {
    it('should load templates successfully', async () => {
      const mockTemplates = [
        { id: 'template-1', name: 'Template 1', isTemplate: true }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          templates: mockTemplates
        })
      });

      const { result } = renderHook(() => useWorkflowApi());

      await act(async () => {
        await result.current.loadTemplates();
      });

      await waitFor(() => {
        expect(result.current.templates).toEqual(mockTemplates);
      });
    });
  });

  describe('loadStats', () => {
    it('should load workflow statistics successfully', async () => {
      const mockStats = {
        totalWorkflows: 10,
        totalExecutions: 50,
        successRate: '90.00'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          stats: mockStats
        })
      });

      const { result } = renderHook(() => useWorkflowApi());

      await act(async () => {
        await result.current.loadStats();
      });

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      });
    });
  });

  describe('setCurrentWorkflow', () => {
    it('should set current workflow', () => {
      const { result } = renderHook(() => useWorkflowApi());

      const workflow = {
        id: 'workflow-123',
        name: 'Test Workflow'
      } as any;

      act(() => {
        result.current.setCurrentWorkflow(workflow);
      });

      expect(result.current.currentWorkflow).toEqual(workflow);
    });
  });
});
