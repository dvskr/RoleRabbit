/**
 * Node Configuration Panel
 * Configure selected node settings
 */

import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { X, Settings, Play, Check, AlertCircle, Loader } from 'lucide-react';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export default function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<any>({});
  const [label, setLabel] = useState('');
  const [testInput, setTestInput] = useState('{}');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
      setLabel(node.data.label || '');
      setTestInput('{}');
      setTestResult(null);
    } else {
      setConfig({});
      setLabel('');
      setTestInput('{}');
      setTestResult(null);
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

  const handleTestNode = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Parse test input JSON
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(testInput);
      } catch (e) {
        throw new Error('Invalid JSON in test input');
      }

      // Call test node API
      const response = await fetch('/api/workflows/nodes/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          node: {
            id: node.id,
            type: node.data.type,
            config,
            label
          },
          testInput: parsedInput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test node');
      }

      setTestResult(data);
      setShowTestModal(true);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: {
          message: error.message
        }
      });
      setShowTestModal(true);
    } finally {
      setTesting(false);
    }
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

      case 'INTERVIEW_PREP':
        specificFields = [
          {
            key: 'jobDescriptionPath',
            label: 'Job Description Path',
            type: 'text',
            placeholder: 'jobDescription',
            value: config.jobDescriptionPath || 'jobDescription'
          },
          {
            key: 'companyPath',
            label: 'Company Path',
            type: 'text',
            placeholder: 'company',
            value: config.companyPath || 'company'
          },
          {
            key: 'jobTitlePath',
            label: 'Job Title Path (optional)',
            type: 'text',
            placeholder: 'jobTitle',
            value: config.jobTitlePath || ''
          },
          {
            key: 'baseResumeIdPath',
            label: 'Base Resume ID Path (optional)',
            type: 'text',
            placeholder: 'baseResumeId',
            value: config.baseResumeIdPath || ''
          }
        ];
        break;

      case 'BULK_RESUME_GENERATE':
        specificFields = [
          {
            key: 'jobDescriptionsPath',
            label: 'Job Descriptions Array Path',
            type: 'text',
            placeholder: 'jobDescriptions',
            value: config.jobDescriptionsPath || 'jobDescriptions'
          },
          {
            key: 'baseResumeIdPath',
            label: 'Base Resume ID Path (optional)',
            type: 'text',
            placeholder: 'baseResumeId',
            value: config.baseResumeIdPath || ''
          },
          {
            key: 'tone',
            label: 'Tone',
            type: 'select',
            options: ['professional', 'casual', 'confident', 'humble'],
            value: config.tone || 'professional'
          },
          {
            key: 'length',
            label: 'Length',
            type: 'select',
            options: ['short', 'medium', 'long'],
            value: config.length || 'medium'
          }
        ];
        break;

      case 'COLD_EMAIL_SEND':
        specificFields = [
          {
            key: 'recipientEmailPath',
            label: 'Recipient Email Path',
            type: 'text',
            placeholder: 'recipientEmail',
            value: config.recipientEmailPath || 'recipientEmail'
          },
          {
            key: 'recipientNamePath',
            label: 'Recipient Name Path (optional)',
            type: 'text',
            placeholder: 'recipientName',
            value: config.recipientNamePath || ''
          },
          {
            key: 'companyPath',
            label: 'Company Path',
            type: 'text',
            placeholder: 'company',
            value: config.companyPath || 'company'
          },
          {
            key: 'jobTitlePath',
            label: 'Job Title Path (optional)',
            type: 'text',
            placeholder: 'jobTitle',
            value: config.jobTitlePath || ''
          },
          {
            key: 'baseResumeIdPath',
            label: 'Base Resume ID Path (optional)',
            type: 'text',
            placeholder: 'baseResumeId',
            value: config.baseResumeIdPath || ''
          },
          {
            key: 'tone',
            label: 'Tone',
            type: 'select',
            options: ['professional', 'casual', 'confident', 'friendly'],
            value: config.tone || 'professional'
          },
          {
            key: 'emailType',
            label: 'Email Type',
            type: 'select',
            options: ['introduction', 'follow-up', 'inquiry'],
            value: config.emailType || 'introduction'
          }
        ];
        break;

      case 'BULK_JD_PROCESSOR':
        specificFields = [
          {
            key: 'jobDescriptionsPath',
            label: 'Job Descriptions Array Path',
            type: 'text',
            placeholder: 'jobDescriptions',
            value: config.jobDescriptionsPath || 'jobDescriptions'
          },
          {
            key: 'action',
            label: 'Action',
            type: 'select',
            options: ['analyze', 'generate_resume', 'full_application'],
            value: config.action || 'analyze'
          },
          {
            key: 'baseResumeIdPath',
            label: 'Base Resume ID Path (optional)',
            type: 'text',
            placeholder: 'baseResumeId',
            value: config.baseResumeIdPath || ''
          }
        ];
        break;

      case 'COMPANY_RESEARCH':
        specificFields = [
          {
            key: 'companyPath',
            label: 'Company Name Path',
            type: 'text',
            placeholder: 'company',
            value: config.companyPath || 'company'
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
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <button
          onClick={handleTestNode}
          disabled={testing}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <>
              <Loader size={16} className="animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play size={16} />
              Test Node
            </>
          )}
        </button>
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Apply Changes
        </button>
      </div>

      {/* Test Modal */}
      {showTestModal && testResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTestModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  Test Results
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Status */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  testResult.success
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResult.success ? 'Success' : 'Failed'}
                </div>
              </div>

              {/* Duration */}
              {testResult.duration !== undefined && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Duration</div>
                  <div className="text-sm text-gray-600">{testResult.duration}ms</div>
                </div>
              )}

              {/* Result or Error */}
              {testResult.success ? (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Result</div>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto">
                    {JSON.stringify(testResult.result, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Error</div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-800 font-medium mb-1">
                      {testResult.error?.message || 'Unknown error'}
                    </div>
                    {testResult.error?.stack && (
                      <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
                        {testResult.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Test Input Configuration */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Test Input</div>
                <div className="text-xs text-gray-500 mb-2">
                  Modify the JSON below to test the node with different inputs:
                </div>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{"jobDescription": "Software Engineer position...", "company": "Acme Corp"}'
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
              <button
                onClick={handleTestNode}
                disabled={testing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Testing...' : 'Test Again'}
              </button>
              <button
                onClick={() => setShowTestModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
