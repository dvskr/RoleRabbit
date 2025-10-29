/**
 * AI Agent Types
 */

export interface AIAgent {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'automatic' | 'manual';
  status: 'active' | 'paused' | 'stopped';
  config: AgentConfig;
  enabled: boolean;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  keywords?: string[];
  location?: string;
  minSalary?: number;
  targetIndustry?: string;
  optimizationLevel?: 'low' | 'medium' | 'high';
}

export interface AgentTask {
  id: string;
  agentId: string;
  userId: string;
  taskType: TaskType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  parameters?: any;
  description?: string;
  result?: any;
  error?: string;
  startedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export type TaskType = 
  | 'job_discovery'
  | 'resume_optimization'
  | 'interview_prep'
  | 'application_tracking'
  | 'network_discovery'
  | 'career_planning';

export interface AgentStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageExecutionTime: number;
}

