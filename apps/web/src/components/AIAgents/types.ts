import { ReactNode } from 'react';

export type TabType = 'chat' | 'active-tasks' | 'capabilities' | 'history';

export interface ActiveTask {
  id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  progress: number;
  icon: ReactNode;
  started: string;
  status: 'in-progress' | 'completed';
}

export interface Capability {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  enabled: boolean;
}

export interface HistoryTask {
  id: string;
  title: string;
  count: number;
  icon: ReactNode;
  status: string;
  completed: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export interface ActivityMetrics {
  resumesGenerated: number;
  applicationsFilled: number;
  emailsSent: number;
}

export interface AgentPerformance {
  successRate: number;
  avgATSScore: number;
}

