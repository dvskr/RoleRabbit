import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Trash2, Edit, CheckCircle, X, AlertCircle, Zap, Brain, Target } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  apiKey?: string;
  baseUrl?: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
  isCustom: boolean;
  settings: {
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
}

interface AIModelManagerProps {
  onModelChange?: (model: AIModel) => void;
  className?: string;
}

export const AIModelManager: React.FC<AIModelManagerProps> = ({
  onModelChange,
  className = ''
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Default models
  const defaultModels: AIModel[] = [
    {
      id: 'gpt-5',
      name: 'GPT-5',
      description: 'Latest OpenAI model with advanced reasoning and multimodal capabilities',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis', 'reasoning', 'multimodal', 'code-generation', 'creative-writing'],
      maxTokens: 128000,
      costPerToken: 0.00006,
      isAvailable: true,
      isCustom: false,
      settings: {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      }
    },
    {
      id: 'sonnet-4.5',
      name: 'Sonnet 4.5',
      description: 'Anthropic\'s latest model with enhanced safety and performance',
      provider: 'anthropic',
      capabilities: ['text-generation', 'analysis', 'reasoning', 'safety', 'long-context', 'creative-writing'],
      maxTokens: 200000,
      costPerToken: 0.00003,
      isAvailable: true,
      isCustom: false,
      settings: {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      }
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model for complex tasks',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      maxTokens: 8192,
      costPerToken: 0.00003,
      isAvailable: true,
      isCustom: false,
      settings: {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      }
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most tasks',
      provider: 'openai',
      capabilities: ['text-generation', 'analysis'],
      maxTokens: 4096,
      costPerToken: 0.000002,
      isAvailable: true,
      isCustom: false,
      settings: {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      }
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Anthropic\'s most powerful model',
      provider: 'anthropic',
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      maxTokens: 200000,
      costPerToken: 0.000015,
      isAvailable: true,
      isCustom: false,
      settings: {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      }
    }
  ];

  useEffect(() => {
    // Load models from localStorage or API
    const savedModels = localStorage.getItem('ai-models');
    if (savedModels) {
      setModels(JSON.parse(savedModels));
    } else {
      setModels(defaultModels);
      setSelectedModel(defaultModels[0].id);
    }
  }, []);

  const saveModels = useCallback((newModels: AIModel[]) => {
    setModels(newModels);
    localStorage.setItem('ai-models', JSON.stringify(newModels));
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    const model = models.find(m => m.id === modelId);
    if (model && onModelChange) {
      onModelChange(model);
    }
  }, [models, onModelChange]);

  const handleAddModel = useCallback((newModel: Omit<AIModel, 'id'>) => {
    const model: AIModel = {
      ...newModel,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    
    const updatedModels = [...models, model];
    saveModels(updatedModels);
    setShowAddModal(false);
  }, [models, saveModels]);

  const handleEditModel = useCallback((modelId: string, updates: Partial<AIModel>) => {
    const updatedModels = models.map(model =>
      model.id === modelId ? { ...model, ...updates } : model
    );
    saveModels(updatedModels);
    setEditingModel(null);
  }, [models, saveModels]);

  const handleDeleteModel = useCallback((modelId: string) => {
    const updatedModels = models.filter(model => model.id !== modelId);
    saveModels(updatedModels);
    
    if (selectedModel === modelId) {
      setSelectedModel(updatedModels[0]?.id || '');
    }
  }, [models, saveModels, selectedModel]);

  const testModel = useCallback(async (modelId: string) => {
    setIsTesting(modelId);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: Math.random() > 0.1, // 90% success rate
        responseTime: Math.random() * 3 + 0.5,
        tokensUsed: Math.floor(Math.random() * 100) + 50
      };
      
      setTestResults(prev => ({ ...prev, [modelId]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [modelId]: { success: false, error: 'Test failed' } 
      }));
    } finally {
      setIsTesting(null);
    }
  }, []);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="w-4 h-4 text-green-600" />;
      case 'anthropic': return <Target className="w-4 h-4 text-purple-600" />;
      case 'google': return <Zap className="w-4 h-4 text-blue-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`ai-model-manager bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Model Manager</h3>
              <p className="text-sm text-gray-600">Configure and manage AI models</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        </div>
      </div>

      {/* Models List */}
      <div className="p-6">
        <div className="space-y-4">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg transition-colors ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getProviderIcon(model.provider)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        {model.isCustom && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Custom
                          </span>
                        )}
                        {model.isAvailable ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{model.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Max tokens: {model.maxTokens.toLocaleString()}</span>
                        <span>Cost: ${model.costPerToken.toFixed(6)}/token</span>
                        <span>Provider: {model.provider}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Test Button */}
                  <button
                    onClick={() => testModel(model.id)}
                    disabled={isTesting === model.id}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    {isTesting === model.id ? 'Testing...' : 'Test'}
                  </button>
                  
                  {/* Test Results */}
                  {testResults[model.id] && (
                    <div className="flex items-center gap-1 text-xs">
                      {testResults[model.id].success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className={testResults[model.id].success ? 'text-green-600' : 'text-red-600'}>
                        {testResults[model.id].success 
                          ? `${testResults[model.id].responseTime?.toFixed(1)}s`
                          : 'Failed'
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingModel(model)}
                    className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  {/* Delete Button */}
                  {model.isCustom && (
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Select Button */}
                  <button
                    onClick={() => handleModelSelect(model.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectedModel === model.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedModel === model.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
              
              {/* Capabilities */}
              <div className="mt-3 flex flex-wrap gap-1">
                {model.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <AddModelModal
          onAdd={handleAddModel}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Model Modal */}
      {editingModel && (
        <EditModelModal
          model={editingModel}
          onSave={(updates) => handleEditModel(editingModel.id, updates)}
          onClose={() => setEditingModel(null)}
        />
      )}
    </div>
  );
};

// Add Model Modal Component
interface AddModelModalProps {
  onAdd: (model: Omit<AIModel, 'id'>) => void;
  onClose: () => void;
}

const AddModelModal: React.FC<AddModelModalProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'openai' as const,
    apiKey: '',
    baseUrl: '',
    capabilities: [] as string[],
    maxTokens: 4096,
    costPerToken: 0.000002,
    isAvailable: true,
    isCustom: true,
    settings: {
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add AI Model</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="local">Local</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL (Optional)</label>
            <input
              type="url"
              value={formData.baseUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
            <input
              type="number"
              value={formData.maxTokens}
              onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Model
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Model Modal Component
interface EditModelModalProps {
  model: AIModel;
  onSave: (updates: Partial<AIModel>) => void;
  onClose: () => void;
}

const EditModelModal: React.FC<EditModelModalProps> = ({ model, onSave, onClose }) => {
  const [formData, setFormData] = useState(model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit AI Model</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={formData.apiKey || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
            <input
              type="url"
              value={formData.baseUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIModelManager;
