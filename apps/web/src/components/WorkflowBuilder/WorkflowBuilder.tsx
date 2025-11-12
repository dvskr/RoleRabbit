/**
 * Main Workflow Builder Component
 * Complete workflow automation interface
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Node } from '@xyflow/react';
import {
  Plus, List, Play, Pause, Archive, Trash2, Copy,
  Download, Calendar, Webhook as WebhookIcon, BarChart3
} from 'lucide-react';
import { useWorkflowApi, Workflow } from '@/hooks/useWorkflowApi';
import WorkflowCanvas from './WorkflowCanvas';
import NodeConfigPanel from './NodeConfigPanel';

type View = 'list' | 'canvas' | 'executions' | 'templates';

export default function WorkflowBuilder() {
  const {
    workflows,
    currentWorkflow,
    executions,
    templates,
    stats,
    loading,
    error,
    loadWorkflows,
    loadWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    loadExecutions,
    loadTemplates,
    createFromTemplate,
    loadStats,
    setCurrentWorkflow
  } = useWorkflowApi();

  const [view, setView] = useState<View>('list');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadWorkflows();
    loadTemplates();
    loadStats();
  }, []);

  // Handle workflow save
  const handleSaveWorkflow = useCallback(async (data: { nodes: any[]; edges: any[] }) => {
    if (!currentWorkflow) return;

    try {
      await updateWorkflow(currentWorkflow.id, {
        nodes: data.nodes,
        connections: data.edges.map((edge: any) => ({
          from: edge.from,
          to: edge.to,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          condition: edge.condition
        }))
      });

      alert('Workflow saved successfully!');
    } catch (err: any) {
      alert('Failed to save workflow: ' + err.message);
    }
  }, [currentWorkflow, updateWorkflow]);

  // Handle workflow execution
  const handleExecuteWorkflow = useCallback(async () => {
    if (!currentWorkflow) return;

    const confirmed = confirm('Execute this workflow now?');
    if (!confirmed) return;

    try {
      const result = await executeWorkflow(currentWorkflow.id);
      alert(`Workflow execution started! Execution ID: ${result.executionId}`);
      setView('executions');
      loadExecutions({ workflowId: currentWorkflow.id });
    } catch (err: any) {
      alert('Failed to execute workflow: ' + err.message);
    }
  }, [currentWorkflow, executeWorkflow, loadExecutions]);

  // Handle node update
  const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
    // Update node data in canvas
    // The canvas component will handle this via state
    setSelectedNode(null);
  }, []);

  // Handle create new workflow
  const handleCreateWorkflow = async (name: string, triggerType: string) => {
    try {
      const workflow = await createWorkflow({
        name,
        description: '',
        triggerType: triggerType as any,
        nodes: [],
        connections: [],
        status: 'DRAFT'
      } as any);

      setCurrentWorkflow(workflow);
      setView('canvas');
      setShowCreateDialog(false);
    } catch (err: any) {
      alert('Failed to create workflow: ' + err.message);
    }
  };

  // Handle use template
  const handleUseTemplate = async (templateId: string) => {
    try {
      const workflow = await createFromTemplate(templateId);
      setCurrentWorkflow(workflow);
      setView('canvas');
    } catch (err: any) {
      alert('Failed to create from template: ' + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>

            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  view === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={16} className="inline mr-1" />
                My Workflows
              </button>

              <button
                onClick={() => setView('templates')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  view === 'templates'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Templates
              </button>

              <button
                onClick={() => setView('executions')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  view === 'executions'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={16} className="inline mr-1" />
                Executions
              </button>
            </div>
          </div>

          {view === 'list' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              New Workflow
            </button>
          )}

          {view === 'canvas' && currentWorkflow && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{currentWorkflow.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                currentWorkflow.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                currentWorkflow.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {currentWorkflow.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'list' && (
          <WorkflowListView
            workflows={workflows}
            onSelect={(workflow) => {
              setCurrentWorkflow(workflow);
              setView('canvas');
            }}
            onDelete={deleteWorkflow}
            onDuplicate={async (workflow) => {
              await createWorkflow({
                ...workflow,
                name: `${workflow.name} (Copy)`,
                id: undefined
              } as any);
              loadWorkflows();
            }}
            loading={loading}
          />
        )}

        {view === 'templates' && (
          <TemplateListView
            templates={templates}
            onUse={handleUseTemplate}
            loading={loading}
          />
        )}

        {view === 'executions' && (
          <ExecutionListView
            executions={executions}
            stats={stats}
            loading={loading}
          />
        )}

        {view === 'canvas' && currentWorkflow && (
          <div className="h-full flex">
            <div className="flex-1">
              <WorkflowCanvas
                workflow={currentWorkflow}
                onSave={handleSaveWorkflow}
                onExecute={handleExecuteWorkflow}
                onNodeSelect={setSelectedNode}
              />
            </div>

            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={handleNodeUpdate}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Workflow Dialog */}
      {showCreateDialog && (
        <CreateWorkflowDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateWorkflow}
        />
      )}
    </div>
  );
}

// Workflow List View Component
function WorkflowListView({ workflows, onSelect, onDelete, onDuplicate, loading }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading workflows...</div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No workflows yet</p>
          <p className="text-sm text-gray-400">Create your first workflow or use a template</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow: Workflow) => (
          <div
            key={workflow.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelect(workflow)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {workflow.description || 'No description'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                workflow.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                workflow.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {workflow.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                {workflow.triggerType === 'SCHEDULE' && <Calendar size={12} />}
                {workflow.triggerType === 'WEBHOOK' && <WebhookIcon size={12} />}
                {workflow.triggerType === 'MANUAL' && <Play size={12} />}
                <span>{workflow.triggerType}</span>
              </div>
              <div>{workflow.nodes?.length || 0} nodes</div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {workflow.totalExecutions || 0} executions
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(workflow);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Duplicate"
                >
                  <Copy size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this workflow?')) {
                      onDelete(workflow.id);
                    }
                  }}
                  className="p-1.5 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Template List View Component
function TemplateListView({ templates, onUse, loading }: any) {
  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading templates...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template: Workflow) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {template.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {template.nodes?.length || 0} nodes
              </div>
              <button
                onClick={() => onUse(template.id)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Execution List View Component
function ExecutionListView({ executions, stats, loading }: any) {
  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading executions...</div>;
  }

  return (
    <div className="p-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Executions" value={stats.totalExecutions} />
          <StatCard label="Successful" value={stats.successfulExecutions} color="green" />
          <StatCard label="Failed" value={stats.failedExecutions} color="red" />
          <StatCard label="Success Rate" value={`${stats.successRate}%`} color="blue" />
        </div>
      )}

      {/* Execution List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Workflow</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Triggered By</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {executions.map((execution: any) => (
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{execution.workflow?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      execution.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      execution.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      execution.status === 'RUNNING' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{execution.triggeredBy || 'manual'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {execution.duration ? `${(execution.duration / 1000).toFixed(1)}s` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(execution.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'gray' }: any) {
  const colors: any = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
    </div>
  );
}

// Create Workflow Dialog Component
function CreateWorkflowDialog({ onClose, onCreate }: any) {
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('MANUAL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }
    onCreate(name, triggerType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create New Workflow</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workflow"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Type
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MANUAL">Manual</option>
              <option value="SCHEDULE">Schedule</option>
              <option value="WEBHOOK">Webhook</option>
              <option value="EVENT">Event</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
