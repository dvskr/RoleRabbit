'use client';

import React, { useState } from 'react';
import {
  Bot,
  Zap,
  PlayCircle,
  PauseCircle,
  Trash2,
  Settings,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'manual';
  status: 'active' | 'paused' | 'stopped';
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
  };
  lastRun?: string;
  config: Record<string, any>;
}

export default function AIAgents() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load agents from API
  React.useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('roleready_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      } else {
        // Fallback to mock data if API fails
        setAgents([
          {
            id: '1',
            name: 'Job Discovery Bot',
            description: 'Automatically finds matching job postings and adds them to your tracker',
            type: 'automatic',
            status: 'active',
            tasks: { total: 45, completed: 38, inProgress: 7 },
            lastRun: '2 hours ago',
            config: { keywords: ['React', 'Next.js', 'TypeScript'], frequency: 'daily' }
          },
          {
            id: '2',
            name: 'Application Follow-up',
            description: 'Sends automated follow-up emails after application deadlines',
            type: 'automatic',
            status: 'active',
            tasks: { total: 12, completed: 10, inProgress: 2 },
            lastRun: '5 hours ago',
            config: { followUpDays: 7, enabled: true }
          },
          {
            id: '3',
            name: 'Resume Optimizer',
            description: 'Continuously optimizes your resume for better ATS scores',
            type: 'manual',
            status: 'paused',
            tasks: { total: 3, completed: 2, inProgress: 1 },
            lastRun: '2 days ago',
            config: { targetScore: 90, mode: 'aggressive' }
          },
          {
            id: '4',
            name: 'Interview Prep Assistant',
            description: 'Generates practice questions based on job descriptions',
            type: 'manual',
            status: 'stopped',
            tasks: { total: 0, completed: 0, inProgress: 0 },
            lastRun: 'Never',
            config: { questionTypes: ['technical', 'behavioral'], count: 10 }
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleToggleAgent = async (agentId: string, currentStatus: string) => {
    // Toggle agent status
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('roleready_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, status: newStatus } : agent
        ));
      } else {
        console.error('Failed to toggle agent status');
      }
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('roleready_token')}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
      } else {
        console.error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleConfigureAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    
    // In production, this would open a configuration modal
    console.log(`Opening configuration for agent: ${agentId}`);
    
    // Example of what would happen:
    // <AgentConfigModal 
    //   agent={agents.find(a => a.id === agentId)}
    //   onSave={(config) => updateAgentConfig(agentId, config)}
    // />
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
                <p className="text-gray-600">Autonomous assistants for your job search</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium">
              <Zap size={18} />
              Create New Agent
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Agents</span>
              <Bot className="text-blue-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active</span>
              <Activity className="text-green-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tasks Completed</span>
              <CheckCircle className="text-emerald-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {agents.reduce((sum, a) => sum + a.tasks.completed, 0)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">In Progress</span>
              <Clock className="text-orange-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {agents.reduce((sum, a) => sum + a.tasks.inProgress, 0)}
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-4">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      agent.status === 'active' ? 'bg-green-100' :
                      agent.status === 'paused' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <Bot className={
                        agent.status === 'active' ? 'text-green-600' :
                        agent.status === 'paused' ? 'text-yellow-600' :
                        'text-gray-600'
                      } size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          agent.type === 'automatic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {agent.type === 'automatic' ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{agent.description}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Total Tasks</div>
                    <div className="text-lg font-bold text-gray-900">{agent.tasks.total}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-xs text-emerald-600 mb-1">Completed</div>
                    <div className="text-lg font-bold text-emerald-600">{agent.tasks.completed}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-600 mb-1">In Progress</div>
                    <div className="text-lg font-bold text-orange-600">{agent.tasks.inProgress}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${(agent.tasks.completed / agent.tasks.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>Last run: {agent.lastRun}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAgent(agent.id, agent.status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        agent.status === 'active'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agent.status === 'active' ? (
                        <>
                          <PauseCircle size={18} />
                          Pause
                        </>
                      ) : (
                        <>
                          <PlayCircle size={18} />
                          Start
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleConfigureAgent(agent.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 font-medium"
                    >
                      <Settings size={18} />
                      Configure
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-16">
            <Bot className="mx-auto text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">No AI Agents Yet</h3>
            <p className="text-gray-600 mt-2">Create your first autonomous assistant</p>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-medium flex items-center gap-2 mx-auto">
              <Zap size={18} />
              Create Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

