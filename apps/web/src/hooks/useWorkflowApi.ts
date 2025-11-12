/**
 * Custom hook for Workflow API operations
 */

import { useState, useCallback } from 'react';
import apiService from '@/utils/api';

// Types
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data?: any;
  config?: any;
}

export interface WorkflowConnection {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: boolean;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  triggerType: 'MANUAL' | 'SCHEDULE' | 'WEBHOOK' | 'EVENT';
  triggerConfig?: any;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  isTemplate: boolean;
  templateCategory?: string;
  maxConcurrentExecutions?: number;
  timeoutSeconds?: number;
  retryOnFailure?: boolean;
  maxRetries?: number;
  totalExecutions?: number;
  successfulExecutions?: number;
  failedExecutions?: number;
  lastExecutedAt?: string;
  tags?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: any;
  output?: any;
  error?: any;
  currentNodeId?: string;
  completedNodes?: string[];
  failedNodes?: string[];
  triggeredBy?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  logs?: WorkflowExecutionLog[];
  workflow?: { id: string; name: string };
}

export interface WorkflowExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  nodeName?: string;
  nodeType: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  success?: boolean;
  error?: any;
  timestamp: string;
}

export interface NodeMetadata {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  inputs: Array<{ name: string; type: string; required: boolean }>;
  outputs: Array<{ name: string; type: string }>;
  config: Array<{ name: string; type: string; label: string; required: boolean; default?: any }>;
}

export interface WorkflowStats {
  totalWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  activeExecutions: number;
  successRate: string;
  recentExecutions: WorkflowExecution[];
}

export function useWorkflowApi() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [nodeMetadata, setNodeMetadata] = useState<NodeMetadata[]>([]);
  const [templates, setTemplates] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // WORKFLOW CRUD
  // ============================================

  const loadWorkflows = useCallback(async (filters?: {
    status?: string;
    triggerType?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.triggerType) params.append('triggerType', filters.triggerType);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const data = await apiService.get<{ success: boolean; workflows: Workflow[]; total: number }>(
        `/api/workflows?${params.toString()}`
      );

      setWorkflows(data.workflows || []);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.get<{ success: boolean; workflow: Workflow }>(
        `/api/workflows/${workflowId}`
      );

      setCurrentWorkflow(data.workflow);
      return data.workflow;
    } catch (err: any) {
      setError(err.message || 'Failed to load workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkflow = useCallback(async (workflowData: Partial<Workflow>) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.post<{ success: boolean; workflow: Workflow }>(
        '/api/workflows',
        workflowData
      );

      setCurrentWorkflow(data.workflow);
      await loadWorkflows();
      return data.workflow;
    } catch (err: any) {
      setError(err.message || 'Failed to create workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const updateWorkflow = useCallback(async (workflowId: string, updates: Partial<Workflow>) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.put<{ success: boolean; workflow: Workflow }>(
        `/api/workflows/${workflowId}`,
        updates
      );

      setCurrentWorkflow(data.workflow);
      await loadWorkflows();
      return data.workflow;
    } catch (err: any) {
      setError(err.message || 'Failed to update workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.delete(`/api/workflows/${workflowId}`);

      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null);
      }
      await loadWorkflows();
    } catch (err: any) {
      setError(err.message || 'Failed to delete workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWorkflow, loadWorkflows]);

  // ============================================
  // WORKFLOW EXECUTION
  // ============================================

  const executeWorkflow = useCallback(async (workflowId: string, input?: any) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.post<{ success: boolean; executionId: string; status: string }>(
        `/api/workflows/${workflowId}/execute`,
        { input }
      );

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to execute workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExecution = useCallback(async (executionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.get<{ success: boolean; execution: WorkflowExecution }>(
        `/api/workflows/executions/${executionId}`
      );

      return data.execution;
    } catch (err: any) {
      setError(err.message || 'Failed to load execution');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExecutions = useCallback(async (filters?: {
    workflowId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.workflowId) params.append('workflowId', filters.workflowId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const data = await apiService.get<{ success: boolean; executions: WorkflowExecution[]; total: number }>(
        `/api/workflows/executions?${params.toString()}`
      );

      setExecutions(data.executions || []);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load executions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelExecution = useCallback(async (executionId: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.post(`/api/workflows/executions/${executionId}/cancel`, {});
      await loadExecutions();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel execution');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadExecutions]);

  // ============================================
  // TEMPLATES
  // ============================================

  const loadTemplates = useCallback(async (filters?: {
    triggerType?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.triggerType) params.append('triggerType', filters.triggerType);
      if (filters?.search) params.append('search', filters.search);

      const data = await apiService.get<{ success: boolean; templates: Workflow[] }>(
        `/api/workflows/templates?${params.toString()}`
      );

      setTemplates(data.templates || []);
      return data.templates;
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFromTemplate = useCallback(async (templateId: string, customization?: {
    name?: string;
    description?: string;
    triggerConfig?: any;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.post<{ success: boolean; workflow: Workflow }>(
        `/api/workflows/from-template/${templateId}`,
        customization || {}
      );

      setCurrentWorkflow(data.workflow);
      await loadWorkflows();
      return data.workflow;
    } catch (err: any) {
      setError(err.message || 'Failed to create from template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  // ============================================
  // NODE METADATA
  // ============================================

  const loadNodeMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.get<{ success: boolean; nodes: NodeMetadata[] }>(
        '/api/workflows/nodes/metadata'
      );

      setNodeMetadata(data.nodes || []);
      return data.nodes;
    } catch (err: any) {
      setError(err.message || 'Failed to load node metadata');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // STATISTICS
  // ============================================

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.get<{ success: boolean; stats: WorkflowStats }>(
        '/api/workflows/stats'
      );

      setStats(data.stats);
      return data.stats;
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    workflows,
    currentWorkflow,
    executions,
    nodeMetadata,
    templates,
    stats,
    loading,
    error,

    // CRUD operations
    loadWorkflows,
    loadWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,

    // Execution operations
    executeWorkflow,
    loadExecution,
    loadExecutions,
    cancelExecution,

    // Template operations
    loadTemplates,
    createFromTemplate,

    // Metadata
    loadNodeMetadata,

    // Statistics
    loadStats,

    // State setters
    setCurrentWorkflow,
    setError
  };
}
