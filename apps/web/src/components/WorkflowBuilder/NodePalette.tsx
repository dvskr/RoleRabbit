/**
 * Node Palette Component
 * Drag-and-drop node selection panel
 */

import React, { useState } from 'react';
import {
  Sparkles, Zap, FileText, Briefcase, Search, Mail,
  Webhook, Clock, GitBranch, Repeat, Database, FileCode,
  Filter, Merge, Split, Transform, ChevronDown, ChevronRight
} from 'lucide-react';

interface NodeType {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  category: string;
  description: string;
}

const nodeTypes: NodeType[] = [
  // Triggers
  {
    type: 'TRIGGER_MANUAL',
    name: 'Manual Trigger',
    icon: Zap,
    color: '#3b82f6',
    category: 'Triggers',
    description: 'Start workflow manually'
  },
  {
    type: 'TRIGGER_SCHEDULE',
    name: 'Schedule',
    icon: Clock,
    color: '#3b82f6',
    category: 'Triggers',
    description: 'Run on schedule (cron)'
  },
  {
    type: 'TRIGGER_WEBHOOK',
    name: 'Webhook',
    icon: Webhook,
    color: '#3b82f6',
    category: 'Triggers',
    description: 'Trigger via webhook'
  },

  // AI
  {
    type: 'AI_AGENT_ANALYZE',
    name: 'AI Job Analysis',
    icon: Sparkles,
    color: '#a855f7',
    category: 'AI',
    description: 'Analyze job fit with AI'
  },
  {
    type: 'AI_AGENT_CHAT',
    name: 'AI Chat',
    icon: Sparkles,
    color: '#a855f7',
    category: 'AI',
    description: 'Chat with AI agent'
  },

  // Auto Apply
  {
    type: 'AUTO_APPLY_SINGLE',
    name: 'Apply to Job',
    icon: Zap,
    color: '#eab308',
    category: 'Auto Apply',
    description: 'Apply to single job'
  },
  {
    type: 'AUTO_APPLY_BULK',
    name: 'Bulk Apply',
    icon: Zap,
    color: '#eab308',
    category: 'Auto Apply',
    description: 'Apply to multiple jobs'
  },

  // Resume
  {
    type: 'RESUME_GENERATE',
    name: 'Generate Resume',
    icon: FileText,
    color: '#22c55e',
    category: 'Resume',
    description: 'Create new resume'
  },
  {
    type: 'RESUME_TAILOR',
    name: 'Tailor Resume',
    icon: FileText,
    color: '#22c55e',
    category: 'Resume',
    description: 'Tailor resume for job'
  },

  // Cover Letter
  {
    type: 'COVER_LETTER_GENERATE',
    name: 'Generate Cover Letter',
    icon: FileText,
    color: '#14b8a6',
    category: 'Cover Letter',
    description: 'Create cover letter'
  },

  // Job Tracker
  {
    type: 'JOB_TRACKER_ADD',
    name: 'Add to Tracker',
    icon: Briefcase,
    color: '#f97316',
    category: 'Job Tracker',
    description: 'Add job to tracker'
  },
  {
    type: 'JOB_TRACKER_UPDATE',
    name: 'Update Status',
    icon: Briefcase,
    color: '#f97316',
    category: 'Job Tracker',
    description: 'Update application status'
  },

  // Job Search
  {
    type: 'JOB_SEARCH',
    name: 'Search Jobs',
    icon: Search,
    color: '#06b6d4',
    category: 'Job Search',
    description: 'Search job boards'
  },
  {
    type: 'COMPANY_RESEARCH',
    name: 'Research Company',
    icon: Search,
    color: '#06b6d4',
    category: 'Job Search',
    description: 'Research company info'
  },

  // Communication
  {
    type: 'EMAIL_SEND',
    name: 'Send Email',
    icon: Mail,
    color: '#ec4899',
    category: 'Communication',
    description: 'Send email message'
  },
  {
    type: 'NOTIFICATION_SEND',
    name: 'Send Notification',
    icon: Mail,
    color: '#ec4899',
    category: 'Communication',
    description: 'Send app notification'
  },
  {
    type: 'HTTP_REQUEST',
    name: 'HTTP Request',
    icon: Webhook,
    color: '#ec4899',
    category: 'Communication',
    description: 'Make HTTP call'
  },

  // Logic
  {
    type: 'CONDITION_IF',
    name: 'If Condition',
    icon: GitBranch,
    color: '#6366f1',
    category: 'Logic',
    description: 'Branch based on condition'
  },
  {
    type: 'LOOP_FOR_EACH',
    name: 'Loop',
    icon: Repeat,
    color: '#6366f1',
    category: 'Logic',
    description: 'Iterate over items'
  },

  // Timing
  {
    type: 'WAIT_DELAY',
    name: 'Wait / Delay',
    icon: Clock,
    color: '#64748b',
    category: 'Timing',
    description: 'Add delay between steps'
  },

  // Data
  {
    type: 'MERGE_DATA',
    name: 'Merge Data',
    icon: Merge,
    color: '#8b5cf6',
    category: 'Data',
    description: 'Combine data objects'
  },
  {
    type: 'TRANSFORM_DATA',
    name: 'Transform Data',
    icon: Transform,
    color: '#8b5cf6',
    category: 'Data',
    description: 'Transform data format'
  },
  {
    type: 'FILTER_DATA',
    name: 'Filter Data',
    icon: Filter,
    color: '#8b5cf6',
    category: 'Data',
    description: 'Filter data by criteria'
  },

  // Storage
  {
    type: 'DATABASE_QUERY',
    name: 'Database Query',
    icon: Database,
    color: '#10b981',
    category: 'Storage',
    description: 'Query database'
  },
  {
    type: 'FILE_WRITE',
    name: 'Write File',
    icon: FileCode,
    color: '#10b981',
    category: 'Storage',
    description: 'Save data to file'
  }
];

// Group nodes by category
const categories = Array.from(new Set(nodeTypes.map(n => n.category)));

interface NodePaletteProps {
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Triggers', 'AI', 'Auto Apply'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (onDragStart) {
      onDragStart(event, nodeType);
    }
  };

  // Filter nodes based on search
  const filteredNodes = searchQuery
    ? nodeTypes.filter(node =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nodeTypes;

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Workflow Nodes</h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery ? (
          // Show all matching nodes when searching
          <div className="space-y-1">
            {filteredNodes.map((node) => (
              <NodeItem
                key={node.type}
                node={node}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        ) : (
          // Show categorized nodes when not searching
          <div className="space-y-2">
            {categories.map((category) => {
              const categoryNodes = filteredNodes.filter(n => n.category === category);
              if (categoryNodes.length === 0) return null;

              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    <span>{category}</span>
                    <span className="ml-auto text-gray-400">{categoryNodes.length}</span>
                  </button>

                  {/* Category Nodes */}
                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-2">
                      {categoryNodes.map((node) => (
                        <NodeItem
                          key={node.type}
                          node={node}
                          onDragStart={handleDragStart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            No nodes found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          Drag nodes onto the canvas to build your workflow
        </p>
      </div>
    </div>
  );
}

// Individual Node Item Component
interface NodeItemProps {
  node: NodeType;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function NodeItem({ node, onDragStart }: NodeItemProps) {
  const Icon = node.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className="flex items-start gap-2 p-2 rounded-lg cursor-move hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
    >
      <div
        className="p-1.5 rounded shrink-0"
        style={{ backgroundColor: `${node.color}20` }}
      >
        <Icon size={14} style={{ color: node.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-900 truncate">
          {node.name}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {node.description}
        </div>
      </div>
    </div>
  );
}
