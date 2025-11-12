/**
 * Node Configuration Panel
 * Configure selected node settings
 */

import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { X, Settings } from 'lucide-react';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export default function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<any>({});
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
      setLabel(node.data.label || '');
    } else {
      setConfig({});
      setLabel('');
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onUpdate(node.id, {
      ...node.data,
      label,
      config
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // Get config fields based on node type
  const getConfigFields = () => {
    const nodeType = node.data.type;

    // Common fields for all nodes
    const commonFields = [
      {
        key: 'name',
        label: 'Node Name',
        type: 'text',
        placeholder: 'Enter node name',
        value: config.name || ''
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Optional description',
        value: config.description || ''
      }
    ];

    // Type-specific fields
    let specificFields: any[] = [];

    switch (nodeType) {
      case 'AI_AGENT_ANALYZE':
        specificFields = [
          {
            key: 'jobUrlPath',
            label: 'Job URL Path',
            type: 'text',
            placeholder: 'jobUrl or input.jobUrl',
            value: config.jobUrlPath || 'jobUrl'
          },
          {
            key: 'minScore',
            label: 'Minimum Match Score',
            type: 'number',
            placeholder: '7',
            value: config.minScore || 7,
            min: 1,
            max: 10
          }
        ];
        break;

      case 'AUTO_APPLY_SINGLE':
        specificFields = [
          {
            key: 'jobUrlPath',
            label: 'Job URL Path',
            type: 'text',
            placeholder: 'jobUrl or input.jobUrl',
            value: config.jobUrlPath || 'jobUrl'
          },
          {
            key: 'resumeIdPath',
            label: 'Resume ID Path (optional)',
            type: 'text',
            placeholder: 'resumeId',
            value: config.resumeIdPath || ''
          },
          {
            key: 'coverLetterIdPath',
            label: 'Cover Letter ID Path (optional)',
            type: 'text',
            placeholder: 'coverLetterId',
            value: config.coverLetterIdPath || ''
          }
        ];
        break;

      case 'RESUME_TAILOR':
        specificFields = [
          {
            key: 'resumeIdPath',
            label: 'Resume ID Path',
            type: 'text',
            placeholder: 'resumeId',
            value: config.resumeIdPath || 'resumeId'
          },
          {
            key: 'jobDescriptionPath',
            label: 'Job Description Path',
            type: 'text',
            placeholder: 'jobDescription',
            value: config.jobDescriptionPath || 'jobDescription'
          }
        ];
        break;

      case 'COVER_LETTER_GENERATE':
        specificFields = [
          {
            key: 'jobUrlPath',
            label: 'Job URL Path',
            type: 'text',
            placeholder: 'jobUrl',
            value: config.jobUrlPath || 'jobUrl'
          },
          {
            key: 'resumeIdPath',
            label: 'Resume ID Path (optional)',
            type: 'text',
            placeholder: 'resumeId',
            value: config.resumeIdPath || ''
          }
        ];
        break;

      case 'JOB_SEARCH':
        specificFields = [
          {
            key: 'platform',
            label: 'Platform',
            type: 'select',
            options: ['LINKEDIN', 'INDEED', 'GLASSDOOR'],
            value: config.platform || 'LINKEDIN'
          },
          {
            key: 'keywords',
            label: 'Search Keywords',
            type: 'text',
            placeholder: 'Software Engineer',
            value: config.keywords || ''
          },
          {
            key: 'location',
            label: 'Location',
            type: 'text',
            placeholder: 'San Francisco, CA',
            value: config.location || ''
          },
          {
            key: 'limit',
            label: 'Max Results',
            type: 'number',
            placeholder: '20',
            value: config.limit || 20,
            min: 1,
            max: 100
          }
        ];
        break;

      case 'EMAIL_SEND':
        specificFields = [
          {
            key: 'to',
            label: 'To Email',
            type: 'text',
            placeholder: 'email@example.com or {{$userEmail}}',
            value: config.to || ''
          },
          {
            key: 'subject',
            label: 'Subject',
            type: 'text',
            placeholder: 'Email subject',
            value: config.subject || ''
          },
          {
            key: 'body',
            label: 'Message Body',
            type: 'textarea',
            placeholder: 'Email message (supports {{variables}})',
            value: config.body || ''
          }
        ];
        break;

      case 'CONDITION_IF':
        specificFields = [
          {
            key: 'condition.field',
            label: 'Field to Check',
            type: 'text',
            placeholder: 'score or data.score',
            value: config.condition?.field || ''
          },
          {
            key: 'condition.operator',
            label: 'Operator',
            type: 'select',
            options: ['==', '!=', '>', '>=', '<', '<=', 'contains', 'startsWith', 'endsWith'],
            value: config.condition?.operator || '>='
          },
          {
            key: 'condition.value',
            label: 'Value',
            type: 'text',
            placeholder: 'Value to compare',
            value: config.condition?.value || ''
          }
        ];
        break;

      case 'WAIT_DELAY':
        specificFields = [
          {
            key: 'delay',
            label: 'Delay (milliseconds)',
            type: 'number',
            placeholder: '30000',
            value: config.delay || 30000,
            min: 0
          }
        ];
        break;

      case 'LOOP_FOR_EACH':
        specificFields = [
          {
            key: 'itemsPath',
            label: 'Items Array Path',
            type: 'text',
            placeholder: 'jobs or data.items',
            value: config.itemsPath || 'items'
          }
        ];
        break;

      case 'TRIGGER_SCHEDULE':
        specificFields = [
          {
            key: 'schedule',
            label: 'Cron Expression',
            type: 'text',
            placeholder: '0 9 * * * (9 AM daily)',
            value: config.schedule || '0 9 * * *'
          },
          {
            key: 'timezone',
            label: 'Timezone',
            type: 'text',
            placeholder: 'UTC',
            value: config.timezone || 'UTC'
          }
        ];
        break;

      default:
        specificFields = [];
    }

    return [...commonFields, ...specificFields];
  };

  const fields = getConfigFields();

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Node Settings</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Node Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Node Type</div>
        <div className="text-sm font-medium text-gray-900">{node.data.type.replace(/_/g, ' ')}</div>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter display name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dynamic Configuration Fields */}
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={field.value}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : field.type === 'select' ? (
              <select
                value={field.value}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {field.options.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => {
                  const value = field.type === 'number' ? Number(e.target.value) : e.target.value;
                  handleConfigChange(field.key, value);
                }}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}

        {/* Variable Hint */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-900 mb-1">
            Template Variables
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• Use <code className="px-1 bg-blue-100 rounded">{'{{fieldName}}'}</code> for data from previous nodes</div>
            <div>• Use <code className="px-1 bg-blue-100 rounded">{'{{$variableName}}'}</code> for workflow variables</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
