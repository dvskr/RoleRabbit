/**
 * Custom Node Component for React Flow
 * Base component for all workflow nodes
 */

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Sparkles, Zap, FileText, Briefcase, Search, Mail,
  Webhook, Clock, GitBranch, Repeat, Database, FileCode,
  Filter, Merge, SeparatorHorizontal, RefreshCw
} from 'lucide-react';

// Node type to icon mapping
const nodeIcons: Record<string, React.ComponentType<any>> = {
  // Triggers
  TRIGGER_MANUAL: Zap,
  TRIGGER_SCHEDULE: Clock,
  TRIGGER_WEBHOOK: Webhook,
  TRIGGER_EVENT: Sparkles,

  // AI
  AI_AGENT_ANALYZE: Sparkles,
  AI_AGENT_CHAT: Sparkles,

  // Auto Apply
  AUTO_APPLY_SINGLE: Zap,
  AUTO_APPLY_BULK: Zap,

  // Resume
  RESUME_GENERATE: FileText,
  RESUME_TAILOR: FileText,

  // Cover Letter
  COVER_LETTER_GENERATE: FileText,

  // Job Tracker
  JOB_TRACKER_ADD: Briefcase,
  JOB_TRACKER_UPDATE: Briefcase,

  // Job Search
  JOB_SEARCH: Search,
  COMPANY_RESEARCH: Search,

  // Communication
  EMAIL_SEND: Mail,
  NOTIFICATION_SEND: Mail,
  WEBHOOK_CALL: Webhook,
  HTTP_REQUEST: Webhook,

  // Logic
  CONDITION_IF: GitBranch,
  CONDITION_SWITCH: GitBranch,
  LOOP_FOR_EACH: Repeat,

  // Timing
  WAIT_DELAY: Clock,
  WAIT_UNTIL: Clock,

  // Data
  MERGE_DATA: Merge,
  SPLIT_DATA: SeparatorHorizontal,
  TRANSFORM_DATA: RefreshCw,
  FILTER_DATA: Filter,

  // Storage
  DATABASE_QUERY: Database,
  FILE_READ: FileCode,
  FILE_WRITE: FileCode
};

// Node type to color mapping
const nodeColors: Record<string, string> = {
  // Triggers - Blue
  TRIGGER_MANUAL: '#3b82f6',
  TRIGGER_SCHEDULE: '#3b82f6',
  TRIGGER_WEBHOOK: '#3b82f6',
  TRIGGER_EVENT: '#3b82f6',

  // AI - Purple
  AI_AGENT_ANALYZE: '#a855f7',
  AI_AGENT_CHAT: '#a855f7',

  // Auto Apply - Yellow
  AUTO_APPLY_SINGLE: '#eab308',
  AUTO_APPLY_BULK: '#eab308',

  // Resume - Green
  RESUME_GENERATE: '#22c55e',
  RESUME_TAILOR: '#22c55e',

  // Cover Letter - Teal
  COVER_LETTER_GENERATE: '#14b8a6',

  // Job Tracker - Orange
  JOB_TRACKER_ADD: '#f97316',
  JOB_TRACKER_UPDATE: '#f97316',

  // Job Search - Cyan
  JOB_SEARCH: '#06b6d4',
  COMPANY_RESEARCH: '#06b6d4',

  // Communication - Pink
  EMAIL_SEND: '#ec4899',
  NOTIFICATION_SEND: '#ec4899',
  WEBHOOK_CALL: '#ec4899',
  HTTP_REQUEST: '#ec4899',

  // Logic - Indigo
  CONDITION_IF: '#6366f1',
  CONDITION_SWITCH: '#6366f1',
  LOOP_FOR_EACH: '#6366f1',

  // Timing - Slate
  WAIT_DELAY: '#64748b',
  WAIT_UNTIL: '#64748b',

  // Data - Violet
  MERGE_DATA: '#8b5cf6',
  SPLIT_DATA: '#8b5cf6',
  TRANSFORM_DATA: '#8b5cf6',
  FILTER_DATA: '#8b5cf6',

  // Storage - Emerald
  DATABASE_QUERY: '#10b981',
  FILE_READ: '#10b981',
  FILE_WRITE: '#10b981'
};

export interface CustomNodeData {
  label?: string;
  type: string;
  config?: any;
  status?: 'idle' | 'running' | 'success' | 'error';
  error?: string;
}

export default function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  const Icon = nodeIcons[data.type] || Zap;
  const color = nodeColors[data.type] || '#6b7280';
  const isTrigger = data.type.startsWith('TRIGGER_');
  const isCondition = data.type.startsWith('CONDITION_');

  // Status indicator colors
  const statusColors = {
    idle: '#6b7280',
    running: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444'
  };

  const statusColor = statusColors[data.status || 'idle'];

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg shadow-lg min-w-[200px] max-w-[300px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${data.status === 'running' ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: 'white',
        borderLeft: `4px solid ${color}`
      }}
    >
      {/* Input Handle - Hide for trigger nodes */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-1.5 rounded"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {data.label || data.type.replace(/_/g, ' ')}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {data.type.split('_')[0].toLowerCase()}
          </div>
        </div>

        {/* Status Indicator */}
        {data.status && data.status !== 'idle' && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
        )}
      </div>

      {/* Node Config Preview */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
          {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
            <div key={key} className="truncate">
              <span className="font-medium">{key}:</span>{' '}
              <span>{String(value).substring(0, 30)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {data.status === 'error' && data.error && (
        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 truncate">
          {data.error}
        </div>
      )}

      {/* Output Handles */}
      {isCondition ? (
        <>
          {/* True output */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!bg-green-500 !border-2 !border-white"
            style={{ left: '33%' }}
          />
          {/* False output */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!bg-red-500 !border-2 !border-white"
            style={{ left: '66%' }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}
    </div>
  );
}
