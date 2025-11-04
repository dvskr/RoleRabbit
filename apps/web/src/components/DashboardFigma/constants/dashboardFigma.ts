import {
  TrendingUp,
  Send,
  MessageCircle,
  Gift,
  Clock,
  Circle,
  CheckCircle2,
  AlertCircle,
  Target,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  Calendar,
  Bell,
  Zap,
  Shield,
  Infinity,
  Sparkles
} from 'lucide-react';
import type { 
  Metric, 
  Activity, 
  Todo, 
  Alert, 
  ProgressMetric, 
  PremiumFeature, 
  Event,
  QuickAction,
  FilterTag
} from '../types/dashboardFigma';

// Static Metrics Data
export const METRICS: Metric[] = [
  {
    label: 'Applications',
    value: '47',
    icon: Send,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    label: 'Response Rate',
    value: '12.5%',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    label: 'Interviews',
    value: '4',
    icon: MessageCircle,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    label: 'Offers',
    value: '1',
    icon: Gift,
    gradient: 'from-amber-500 to-amber-600'
  }
];

// Static Activities Data
export const ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: 'Applied to Senior Frontend Developer at TechCorp',
    subtitle: 'Application submitted via LinkedIn',
    time: '2h ago',
    status: 'pending' as const,
    icon: Circle
  },
  {
    id: 2,
    title: 'Received response from StartupXYZ',
    subtitle: 'Phone screen scheduled for tomorrow',
    time: '4h ago',
    status: 'completed' as const,
    icon: CheckCircle2
  },
  {
    id: 3,
    title: 'Interview completed with DesignStudio',
    subtitle: 'Technical interview went well',
    time: '1d ago',
    status: 'completed' as const,
    icon: CheckCircle2
  },
  {
    id: 4,
    title: 'Follow up with 3 companies',
    subtitle: 'Companies usually respond within 7 days',
    time: '2d ago',
    status: 'warning' as const,
    icon: AlertCircle
  }
];

// Default Todos Data
export const DEFAULT_TODOS: Todo[] = [
  {
    id: 1,
    title: 'Follow up with 3 companies',
    subtitle: 'Companies usually respond within 7 days',
    time: '30m',
    priority: 'high' as const,
    completed: false,
    date: undefined
  },
  {
    id: 2,
    title: 'Prepare for StartupXYZ interview',
    subtitle: 'Review company culture and values',
    time: '1h',
    priority: 'urgent' as const,
    completed: false,
    date: '10/30/2025'
  },
  {
    id: 3,
    title: 'Research 5 new companies',
    subtitle: 'Find companies matching your skills',
    time: '1h 30m',
    priority: 'low' as const,
    completed: false,
    date: undefined
  },
  {
    id: 4,
    title: 'Update LinkedIn profile',
    subtitle: 'Add recent achievements and skills',
    time: '45m',
    priority: 'high' as const,
    completed: true,
    date: undefined
  },
  {
    id: 5,
    title: 'Network with 3 industry professionals',
    subtitle: 'Schedule coffee chats or virtual meetings',
    time: '2h',
    priority: 'high' as const,
    completed: false,
    date: undefined
  },
  {
    id: 6,
    title: 'Prepare portfolio case studies',
    subtitle: 'Document your best projects',
    time: '3h',
    priority: 'low' as const,
    completed: true,
    date: undefined
  },
  {
    id: 7,
    title: 'Send thank you emails',
    subtitle: 'Follow up after yesterday\'s interviews',
    time: '20m',
    priority: 'urgent' as const,
    completed: false,
    date: '10/29/2025'
  }
];

// Static Alerts Data
export const ALERTS: Alert[] = [
  {
    id: 1,
    title: 'Follow-up needed',
    subtitle: 'You have 3 applications that need follow-up',
    time: '1h ago',
    priority: 'high' as const,
    icon: Clock
  },
  {
    id: 2,
    title: 'Interview tomorrow',
    subtitle: 'StartupXYZ phone interview at 2:00 PM',
    time: '4h ago',
    priority: 'urgent' as const,
    icon: AlertCircle
  }
];

// Static Progress Metrics Data
export const PROGRESS_METRICS: ProgressMetric[] = [
  { label: 'Application Rate', value: 78, gradient: 'from-emerald-500 to-emerald-600' },
  { label: 'Interview Success', value: 45, gradient: 'from-purple-500 to-purple-600' },
  { label: 'Profile Completion', value: 92, gradient: 'from-blue-500 to-blue-600' }
];

// Premium Features Data
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: Zap,
    title: 'AI Auto-Apply',
    description: 'Automatically apply to jobs matching your profile',
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    icon: Infinity,
    title: 'Unlimited AI Usage',
    description: 'No limits on resume optimization and suggestions',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    icon: Shield,
    title: 'ATS Optimization',
    description: 'Advanced ATS scoring and optimization tools',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Sparkles,
    title: 'Priority Support',
    description: '24/7 priority customer support and assistance',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// Static Events Data
export const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Phone Screen - StartupXYZ',
    date: 'Tomorrow, 2:00 PM',
    type: 'interview',
    urgent: true,
    icon: MessageCircle
  },
  {
    id: 2,
    title: 'Follow-up Deadline',
    date: 'Oct 31, 2025',
    type: 'deadline',
    urgent: false,
    icon: Clock
  },
  {
    id: 3,
    title: 'Technical Interview Prep',
    date: 'Nov 2, 2025',
    type: 'task',
    urgent: false,
    icon: Target
  }
];

// Factory functions for dynamic constants (depend on callbacks)
export const createQuickActions = (
  onNavigateToTab?: (tab: string) => void
): QuickAction[] => [
  { id: 'resume', icon: FileText, label: 'Resume', action: () => onNavigateToTab?.('editor') },
  { id: 'jobs', icon: Briefcase, label: 'Jobs', action: () => onNavigateToTab?.('tracker') },
  { id: 'target', icon: Target, label: 'Target', action: () => onNavigateToTab?.('tracker') },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', action: () => onNavigateToTab?.('tracker') },
  { id: 'notifications', icon: Bell, label: 'Alerts', action: () => onNavigateToTab?.('tracker') },
  { id: 'settings', icon: Settings, label: 'Settings', action: () => onNavigateToTab?.('profile') },
  { id: 'calendar', icon: Calendar, label: 'Calendar', action: () => onNavigateToTab?.('tracker') },
  { id: 'messages', icon: MessageCircle, label: 'Messages', action: () => onNavigateToTab?.('discussion') }
];

export const createFilterTags = (
  onNavigateToTab?: (tab: string) => void,
  onQuickAction?: (actionId: string) => void
): FilterTag[] => [
  // Action buttons removed - returning empty array
];

