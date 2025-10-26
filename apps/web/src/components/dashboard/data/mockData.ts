import { DashboardData, DashboardActivity, DashboardTodo, DashboardMetrics, DashboardAlert, QuickAction } from '../types/dashboard';

export const generateRealisticMockData = (): DashboardData => {
  const now = new Date();
  
  const activities: DashboardActivity[] = [
    {
      id: '1',
      type: 'application',
      title: 'Applied to Senior Frontend Developer at TechCorp',
      description: 'Application submitted via LinkedIn',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      priority: 'medium',
      status: 'pending',
      relatedJobId: 'job-1',
      mockData: true
    },
    {
      id: '2',
      type: 'response',
      title: 'Received response from StartupXYZ',
      description: 'Phone screen scheduled for tomorrow',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      priority: 'high',
      status: 'completed',
      relatedJobId: 'job-2',
      actionUrl: '/tracker',
      mockData: true
    },
    {
      id: '3',
      type: 'interview',
      title: 'Interview completed with DesignStudio',
      description: 'Technical interview went well',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      priority: 'medium',
      status: 'completed',
      relatedJobId: 'job-3',
      mockData: true
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Follow up with 3 companies',
      description: 'Companies usually respond within 7 days',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      priority: 'high',
      status: 'pending',
      mockData: true
    }
  ];

  const todos: DashboardTodo[] = [
    {
      id: '1',
      title: 'Follow up with 3 companies from last week',
      description: 'Companies usually respond within 7 days',
      priority: 'high',
      category: 'follow_up',
      isCompleted: false,
      estimatedTime: 30,
      aiGenerated: true,
      mockData: true
    },
    {
      id: '2',
      title: 'Prepare for StartupXYZ interview',
      description: 'Review company culture and technical requirements',
      priority: 'urgent',
      category: 'preparation',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      isCompleted: false,
      estimatedTime: 60,
      relatedJobId: 'job-2',
      aiGenerated: true,
      mockData: true
    },
    {
      id: '3',
      title: 'Update resume for tech roles',
      description: 'Add recent project and optimize keywords',
      priority: 'medium',
      category: 'application',
      isCompleted: true,
      estimatedTime: 45,
      aiGenerated: false,
      mockData: true
    },
    {
      id: '4',
      title: 'Research 5 new companies',
      description: 'Find companies matching your criteria',
      priority: 'low',
      category: 'research',
      isCompleted: false,
      estimatedTime: 90,
      aiGenerated: true,
      mockData: true
    }
  ];

  const metrics: DashboardMetrics = {
    totalApplications: 47,
    responseRate: 12.5,
    interviewRate: 8.3,
    offerRate: 2.1,
    averageResponseTime: 5.2,
    pipelineHealth: {
      applied: 47,
      phoneScreen: 8,
      interview: 4,
      offer: 1,
      rejected: 12
    },
    weeklyActivity: {
      applications: 5,
      responses: 2,
      interviews: 1
    },
    mockData: true,
    lastCalculated: now
  };

  const alerts: DashboardAlert[] = [
    {
      id: '1',
      type: 'follow_up',
      title: 'Follow-up needed',
      message: 'You have 3 applications that need follow-up',
      priority: 'high',
      isRead: false,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      actionUrl: '/tracker',
      dismissible: true,
      mockData: true
    },
    {
      id: '2',
      type: 'interview',
      title: 'Interview tomorrow',
      message: 'StartupXYZ interview scheduled for 2:00 PM',
      priority: 'urgent',
      isRead: false,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionUrl: '/tracker',
      dismissible: false,
      mockData: true
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Great progress!',
      message: 'You\'ve applied to 5 jobs this week',
      priority: 'low',
      isRead: true,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      dismissible: true,
      mockData: true
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Start New Application',
      icon: 'Plus',
      description: 'Begin tracking a new job application',
      action: () => console.log('Start new application'),
      category: 'application',
      isEnabled: true,
      mockData: true
    },
    {
      id: '2',
      label: 'Send Follow-up',
      icon: 'Mail',
      description: 'Send follow-up emails to companies',
      action: () => console.log('Send follow-up'),
      category: 'communication',
      isEnabled: true,
      mockData: true
    },
    {
      id: '3',
      label: 'Update Resume',
      icon: 'FileText',
      description: 'Edit and optimize your resume',
      action: () => console.log('Update resume'),
      category: 'preparation',
      isEnabled: true,
      mockData: true
    },
    {
      id: '4',
      label: 'Research Companies',
      icon: 'Search',
      description: 'Find new companies to apply to',
      action: () => console.log('Research companies'),
      category: 'research',
      isEnabled: true,
      mockData: true
    }
  ];

  return {
    activities,
    todos,
    metrics,
    alerts,
    quickActions,
    lastUpdated: now
  };
};
