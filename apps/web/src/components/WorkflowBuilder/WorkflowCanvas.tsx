/**
 * Workflow Canvas Component
 * Main React Flow canvas for building workflows
 */

'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Play, Settings2, Download, Upload, Undo, Redo } from 'lucide-react';
import CustomNode from './nodes/CustomNode';
import NodePalette from './NodePalette';
import { Workflow } from '@/hooks/useWorkflowApi';
import { useWorkflowHistory } from '@/hooks/useWorkflowHistory';

const nodeTypes = {
  custom: CustomNode
};

interface WorkflowCanvasProps {
  workflow?: Workflow | null;
  onSave?: (workflow: { nodes: any[]; edges: any[] }) => void;
  onExecute?: () => void;
  onNodeSelect?: (node: Node | null) => void;
  readOnly?: boolean;
}

export default function WorkflowCanvas({
  workflow,
  onSave,
  onExecute,
  onNodeSelect,
  readOnly = false
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Initialize history hook
  const {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    initializeHistory
  } = useWorkflowHistory({ maxHistory: 50 });

  // Initialize workflow if provided
  React.useEffect(() => {
    if (workflow) {
      // Convert workflow nodes to React Flow nodes
      const flowNodes: Node[] = (workflow.nodes || []).map((node) => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          label: node.config?.name || node.type,
          type: node.type,
          config: node.config || {}
        }
      }));

      // Convert workflow connections to React Flow edges
      const flowEdges: Edge[] = (workflow.connections || []).map((conn, idx) => ({
        id: conn.id || `edge-${idx}`,
        source: conn.source || conn.from,
        target: conn.target || conn.to,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        },
        label: conn.condition !== undefined ? (conn.condition ? 'true' : 'false') : undefined,
        style: {
          stroke: conn.condition === true ? '#22c55e' : conn.condition === false ? '#ef4444' : '#6b7280',
          strokeWidth: 2
        }
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);

      // Initialize history with loaded workflow
      initializeHistory(flowNodes, flowEdges);
    }
  }, [workflow, setNodes, setEdges, initializeHistory]);

  // Save to history when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveToHistory(nodes, edges);
    }
  }, [nodes, edges, saveToHistory]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;

      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        },
        style: {
          strokeWidth: 2,
          stroke: params.sourceHandle === 'true' ? '#22c55e' : params.sourceHandle === 'false' ? '#ef4444' : '#6b7280'
        },
        label: params.sourceHandle === 'true' ? 'true' : params.sourceHandle === 'false' ? 'false' : undefined
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, readOnly]
  );

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop of new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly || !reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      const newNode: Node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'custom',
        position,
        data: {
          label: type.replace(/_/g, ' '),
          type,
          config: {}
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, readOnly]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!canUndo || readOnly) return;

    const previousState = undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
    }
  }, [canUndo, undo, setNodes, setEdges, readOnly]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (!canRedo || readOnly) return;

    const nextState = redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  }, [canRedo, redo, setNodes, setEdges, readOnly]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field or textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }

      // Ctrl+Y or Cmd+Shift+Z for redo
      if (
        ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
      ) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Save workflow
  const handleSave = useCallback(() => {
    if (onSave) {
      // Convert React Flow nodes back to workflow format
      const workflowNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        config: node.data.config || {}
      }));

      // Convert React Flow edges back to workflow format
      const workflowConnections = edges.map((edge) => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        condition: edge.sourceHandle === 'true' ? true : edge.sourceHandle === 'false' ? false : undefined
      }));

      onSave({
        nodes: workflowNodes,
        edges: workflowConnections
      });
    }
  }, [nodes, edges, onSave]);

  // Export workflow as JSON
  const handleExport = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport()
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, reactFlowInstance]);

  // Import workflow from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
          if (data.viewport && reactFlowInstance) {
            reactFlowInstance.setViewport(data.viewport);
          }
        } catch (error) {
          console.error('Failed to import workflow:', error);
          alert('Failed to import workflow. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges, reactFlowInstance]);

  return (
    <div className="flex h-full">
      {/* Node Palette */}
      {!readOnly && (
        <div className="w-64 shrink-0">
          <NodePalette />
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-right"
          deleteKeyCode={readOnly ? null : 'Delete'}
          multiSelectionKeyCode={readOnly ? null : 'Shift'}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const color = node.data.type ? '#3b82f6' : '#6b7280';
              return color;
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Top Toolbar */}
          <Panel position="top-right" className="flex gap-2">
            {!readOnly && (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors"
                  title="Save workflow"
                >
                  <Save size={16} />
                  Save
                </button>

                <button
                  onClick={handleExport}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"
                  title="Export workflow"
                >
                  <Download size={16} />
                </button>

                <button
                  onClick={handleImport}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"
                  title="Import workflow"
                >
                  <Upload size={16} />
                </button>

                {/* Undo/Redo buttons */}
                <div className="flex gap-1 border-l border-gray-300 pl-2">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo size={16} />
                  </button>

                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo size={16} />
                  </button>
                </div>
              </>
            )}

            {onExecute && (
              <button
                onClick={onExecute}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                title="Execute workflow"
              >
                <Play size={16} />
                Run
              </button>
            )}
          </Panel>

          {/* Node count info */}
          <Panel position="bottom-left" className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600">
              {nodes.length} nodes • {edges.length} connections
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
