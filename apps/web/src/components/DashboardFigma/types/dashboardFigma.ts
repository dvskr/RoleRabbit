import { LucideIcon } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

// Main component props
export interface DashboardFigmaProps {
  onNavigateToTab?: (tab: string) => void;
  onQuickAction?: (actionId: string) => void;
}

// Todo types
export type Priority = 'low' | 'high' | 'urgent';
export type ActivityStatus = 'pending' | 'completed' | 'warning';

export interface Todo {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  priority: Priority;
  completed: boolean;
  date?: string;
}

// Metric types
export interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
}

// Activity types
export interface Activity {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  status: ActivityStatus;
  icon: LucideIcon;
}

// Alert types
export interface Alert {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  priority: Priority;
  icon: LucideIcon;
}

// Quick Action types
export interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  action: () => void;
}

// Progress Metric types
export interface ProgressMetric {
  label: string;
  value: number;
  gradient: string;
}

// Filter Tag types
export interface FilterTag {
  label: string;
  color: string;
  action: () => void;
}

// Premium Feature types
export interface PremiumFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

// Event types
export interface Event {
  id: number;
  title: string;
  date: string;
  type: 'interview' | 'deadline' | 'task';
  urgent: boolean;
  icon: LucideIcon;
}

// Export ThemeColors for component use
export type { ThemeColors };

