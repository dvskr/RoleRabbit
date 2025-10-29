'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Send,
  MessageCircle,
  Gift,
  Clock,
  Filter,
  ArrowRight,
  Circle,
  CheckCircle2,
  AlertCircle,
  Target,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  Download,
  Lightbulb,
  Eye,
  Calendar,
  Bell,
  Star,
  X,
  ChevronDown,
  Check,
  Zap,
  Shield,
  Infinity,
  Sparkles,
  Crown,
  CheckCircle,
  Plus
} from 'lucide-react';

interface DashboardFigmaProps {
  onNavigateToTab?: (tab: string) => void;
  onQuickAction?: (actionId: string) => void;
}

export default function DashboardFigma({ 
  onNavigateToTab,
  onQuickAction 
}: DashboardFigmaProps) {
  const [activityFilter, setActivityFilter] = useState('All Activity');
  const [todoFilter, setTodoFilter] = useState('All Tasks');
  const [showCompleted, setShowCompleted] = useState(true); // Show all todos by default
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoSubtitle, setNewTodoSubtitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'high' | 'urgent'>('high');
  const [userTodos, setUserTodos] = useState<Todo[]>([]);
  const [deletedDefaultTodoIds, setDeletedDefaultTodoIds] = useState<number[]>([]);

  // Metrics Data
  const metrics = [
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

  // Activities Data
  const activities = [
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

  // Smart To-Dos Data (Default todos + User-added todos)
  const defaultTodos: Todo[] = [
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

  // Combine default and user todos, excluding deleted ones
  const todos = [...defaultTodos.filter(t => !deletedDefaultTodoIds.includes(t.id)), ...userTodos];

  const completedCount = todos.filter(t => t.completed).length;
  const todoProgress = Math.round((completedCount / todos.length) * 100);

  // Intelligent Alerts Data
  const alerts = [
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

  const urgentAlertsCount = alerts.filter(a => a.priority === 'urgent').length;

  // Quick Actions Data
  const quickActions = [
    { id: 'resume', icon: FileText, label: 'Resume', action: () => onNavigateToTab?.('editor') },
    { id: 'jobs', icon: Briefcase, label: 'Jobs', action: () => onNavigateToTab?.('tracker') },
    { id: 'target', icon: Target, label: 'Target', action: () => onNavigateToTab?.('tracker') },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', action: () => onNavigateToTab?.('tracker') },
    { id: 'notifications', icon: Bell, label: 'Alerts', action: () => onNavigateToTab?.('tracker') },
    { id: 'settings', icon: Settings, label: 'Settings', action: () => onNavigateToTab?.('profile') },
    { id: 'calendar', icon: Calendar, label: 'Calendar', action: () => onNavigateToTab?.('tracker') },
    { id: 'messages', icon: MessageCircle, label: 'Messages', action: () => onNavigateToTab?.('discussion') }
  ];

  // Progress Metrics Data
  const progressMetrics = [
    { label: 'Application Rate', value: 78, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Interview Success', value: 45, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Profile Completion', value: 92, gradient: 'from-blue-500 to-blue-600' }
  ];

  // Filter Tags
  const filterTags = [
    { label: 'Goals', color: 'bg-blue-600', action: () => onNavigateToTab?.('tracker') },
    { label: 'Export', color: 'bg-emerald-600', action: () => onQuickAction?.('export') },
    { label: 'Analytics', color: 'bg-purple-600', action: () => onNavigateToTab?.('tracker') },
    { label: 'Customize', color: 'bg-orange-600', action: () => onQuickAction?.('customize') },
    { label: 'Themes', color: 'bg-pink-600', action: () => onQuickAction?.('themes') }
  ];

  // Status color mapping
  const getStatusColor = (status: 'pending' | 'completed' | 'warning') => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'pending':
        return 'bg-blue-500/20 text-blue-400';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400';
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority: 'low' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-full mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {/* Filter Tags */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filterTags.map((tag, index) => (
            <button
              key={index}
              onClick={tag.action}
              className={`${tag.color} text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 hover:shadow-lg hover:scale-105 flex-shrink-0`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Metrics Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="group relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
                    <Icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">{metric.value}</p>
                  <p className="text-xs sm:text-sm text-slate-400">{metric.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid - Fully Responsive & Dynamic - Auto-sizing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Left Side - Premium Features + Activity Feed - Takes more space */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 sm:gap-4">
            {/* Premium Features Widget - Reduced Size */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/20 flex flex-col overflow-hidden mb-3 sm:mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(251, 146, 60, 0.3)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Crown size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">Premium Features</h2>
                    <p className="text-xs text-amber-200/80 hidden sm:block">Unlock your full potential</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
                  PRO
                </span>
              </div>
              
              {/* Premium Features Grid - Compact */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
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
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${feature.gradient} w-fit mb-1.5`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5">{feature.title}</h3>
                      <p className="text-xs text-slate-300 leading-tight line-clamp-2">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3 pt-3 border-t border-amber-500/20">
                <button className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs sm:text-sm rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-amber-500/20">
                  Upgrade to Premium
                </button>
              </div>
            </div>

            {/* Activity Feed - Below Premium Features - Reduced Size */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10 flex flex-col overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-white">Activity Feed</h2>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  View All
                </button>
              </div>
              
              {/* Filter Dropdown */}
              <div className="mb-2">
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-800/50 border border-slate-700 rounded-lg px-2 sm:px-3 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option>All Activity</option>
                  <option>Applications</option>
                  <option>Interviews</option>
                  <option>Follow-ups</option>
                </select>
              </div>

              {/* Activity List - Not Scrollable, Show Limited Items */}
              <div className="space-y-1.5">
                {activities.slice(0, 3).map((activity) => {
                  const Icon = activity.icon;
                  const statusColor = getStatusColor(activity.status);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className={`p-1 rounded-full flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-emerald-500/20' :
                        activity.status === 'pending' ? 'bg-blue-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        <Icon 
                          size={14} 
                          className={`${
                            activity.status === 'completed' ? 'text-emerald-400' :
                            activity.status === 'pending' ? 'text-blue-400' :
                            'text-amber-400'
                          }`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white mb-0.5 truncate">{activity.title}</p>
                        <p className="text-xs text-slate-400 mb-0.5 line-clamp-1">{activity.subtitle}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500">{activity.time}</span>
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events & Deadlines Widget - Added to LEFT side */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Upcoming Events</h2>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
                  3 events
                </span>
              </div>
              
              <div className="space-y-2.5">
                {[
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
                ].map((event) => {
                  const Icon = event.icon;
                  return (
                    <div
                      key={event.id}
                      className={`p-2.5 rounded-lg border transition-all hover:bg-white/5 ${
                        event.urgent
                          ? 'border-orange-500/30 bg-orange-500/10'
                          : 'border-slate-700 bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          event.urgent
                            ? 'bg-orange-500/20'
                            : 'bg-indigo-500/20'
                        }`}>
                          <Icon
                            size={16}
                            className={event.urgent ? 'text-orange-400' : 'text-indigo-400'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium mb-0.5 ${
                            event.urgent ? 'text-orange-300' : 'text-white'
                          }`}>
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-400">{event.date}</p>
                        </div>
                        {event.urgent && (
                          <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="w-full mt-3 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors border border-indigo-500/20">
                View All Events
              </button>
            </div>
          </div>

          {/* Right Sidebar - Rearranged to Fill Left Spaces - Auto-sizing */}
          <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 gap-3 sm:gap-4">
            {/* Quick Actions - Move to top */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Quick Actions</h2>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="aspect-square flex items-center justify-center rounded-lg sm:rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 hover:scale-110 border border-slate-700"
                      title={action.label}
                    >
                      <Icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Smart To-Dos - Increased Size, No Scrollbar */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10 flex flex-col overflow-visible"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="mb-2 sm:mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-white">To-Dos</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {todos.filter(t => !t.completed).length} active
                    </span>
                    <button
                      onClick={() => setShowAddTodo(true)}
                      className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-colors"
                      title="Add new todo"
                    >
                      <Plus size={14} className="text-purple-400" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-400 font-medium">{todoProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${todoProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Add Todo Form - Compact */}
              {showAddTodo && (
                <div className="mb-1.5 p-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                  <input
                    type="text"
                    placeholder="Todo title..."
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="w-full mb-1 px-1.5 py-1 bg-slate-900/50 border border-slate-600 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex items-center gap-1">
                    <select
                      value={newTodoPriority}
                      onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'high' | 'urgent')}
                      className="flex-1 px-1.5 py-1 bg-slate-900/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <button
                      onClick={() => {
                        if (newTodoTitle.trim()) {
                          setUserTodos([...userTodos, {
                            id: Date.now(),
                            title: newTodoTitle,
                            subtitle: newTodoSubtitle,
                            time: 'Just now',
                            priority: newTodoPriority,
                            completed: false,
                            date: undefined
                          }]);
                          setNewTodoTitle('');
                          setNewTodoSubtitle('');
                          setNewTodoPriority('high');
                          setShowAddTodo(false);
                        }
                      }}
                      className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded hover:bg-purple-600 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTodo(false);
                        setNewTodoTitle('');
                        setNewTodoSubtitle('');
                      }}
                      className="px-2 py-1 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Todo List - Increased Size, No Scrollbar, Show limited todos with delete */}
              <div className="space-y-1.5">
                {(todoFilter === 'All Tasks' ? todos : 
                  todoFilter === 'Urgent' ? todos.filter(t => t.priority === 'urgent') :
                  todoFilter === 'High Priority' ? todos.filter(t => t.priority === 'high') :
                  todos.filter(t => t.priority === 'low')
                ).filter(todo => showCompleted || !todo.completed).slice(0, 5).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => {
                        if (todo.id > 7) {
                          // User-added todo
                          setUserTodos(userTodos.map(t => 
                            t.id === todo.id ? { ...t, completed: !t.completed } : t
                          ));
                        }
                        // For default todos, we'd need to track their completion state separately
                        // For now, we'll just allow toggling user todos
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {todo.title}
                      </p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    {/* Delete button for ALL todos */}
                    <button
                      onClick={() => {
                        if (todo.id > 7) {
                          // User-added todo
                          setUserTodos(userTodos.filter(t => t.id !== todo.id));
                        } else {
                          // Default todo - mark as deleted
                          setDeletedDefaultTodoIds([...deletedDefaultTodoIds, todo.id]);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                      title="Delete todo"
                    >
                      <X size={12} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligent Alerts - Reduced Size */}
            <div
              className="rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-red-500/10 flex flex-col overflow-visible"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-sm font-semibold text-white">Alerts</h2>
                {urgentAlertsCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {urgentAlertsCount}
                  </span>
                )}
              </div>

              {/* Alerts List - Compact, No Scrollbar */}
              <div className="space-y-1">
                {alerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-1.5 p-1 rounded hover:bg-white/5 transition-colors"
                    >
                      <div className={`p-0.5 rounded-full flex-shrink-0 ${
                        alert.priority === 'urgent' ? 'bg-red-500/20' : 'bg-amber-500/20'
                      }`}>
                        <Icon 
                          size={12} 
                          className={`${
                            alert.priority === 'urgent' ? 'text-red-400' : 'text-amber-400'
                          }`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{alert.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-slate-500">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Metrics */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-500/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h2 className="text-base font-semibold text-white mb-3">Progress</h2>
              <div className="space-y-3">
                {progressMetrics.map((metric, index) => (
                  <div key={index} className="w-full">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-400">{metric.label}</span>
                      <span className="text-white font-semibold">{metric.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full transition-all`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

