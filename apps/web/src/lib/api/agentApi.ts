/**
 * AI Agent API client
 */

import { apiService } from './apiService';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  enabled: boolean;
  config: any;
  lastRun?: string;
}

export const agentApi = {
  /**
   * Get all agents
   */
  async getAll(): Promise<AIAgent[]> {
    const response = await apiService.get('/agents');
    return response.agents;
  },

  /**
   * Get agent by ID
   */
  async getById(id: string): Promise<AIAgent> {
    const response = await apiService.get(`/agents/${id}`);
    return response.agent;
  },

  /**
   * Create agent
   */
  async create(agent: Partial<AIAgent>): Promise<AIAgent> {
    const response = await apiService.post('/agents', agent);
    return response.agent;
  },

  /**
   * Execute agent task
   */
  async execute(id: string, taskType: string, parameters: any) {
    const response = await apiService.post(`/agents/${id}/execute`, {
      taskType,
      parameters
    });
    return response.result;
  },

  /**
   * Get agent tasks
   */
  async getTasks(id: string, limit: number = 50) {
    const response = await apiService.get(`/agents/${id}/tasks`, { limit });
    return response.tasks;
  }
};

