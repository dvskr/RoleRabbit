'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Zap,
  Brain,
  Clock,
  Settings,
  Send,
  FileText,
  Briefcase,
  Mail,
  CheckCircle,
  Eye,
  Download,
  Calendar,
  BookOpen,
  Search,
  Rocket,
  MoreVertical,
  List,
  Bot
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type TabType = 'chat' | 'active-tasks' | 'capabilities' | 'history';

interface ActiveTask {
  id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  progress: number;
  icon: React.ReactNode;
  started: string;
  status: 'in-progress' | 'completed';
}

interface Capability {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface HistoryTask {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
  status: string;
  completed: string;
  date: string;
}

export default function AIAgents() {
  try {
    const { theme } = useTheme();
    const colors = theme?.colors;
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [activeTasksCount] = useState(2);
    const [isAgentEnabled, setIsAgentEnabled] = useState(true);

    // Safety check for theme
    if (!colors) {
      return (
        <div className="h-full flex items-center justify-center bg-white">
          <p className="text-gray-600">Loading...</p>
        </div>
      );
    }

  // Mock data for active tasks
  const [activeTasks] = useState<ActiveTask[]>([
    {
      id: '1',
      title: 'Generating tailored resumes',
      company: 'TechCorp Inc.',
      role: 'Senior Full Stack Developer',
      description: 'Creating 3 resume variations with ATS scores: 95+, 90+, 85+',
      progress: 65,
      icon: <FileText size={18} />,
      started: '2 min ago',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Researching company',
      company: 'StartupXYZ',
      role: 'Product Manager',
      description: 'Gathering company info, recent news, and culture insights',
      progress: 40,
      icon: <Search size={18} />,
      started: '5 min ago',
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'Cover letter generated',
      company: 'Design Studio',
      role: 'UX Designer',
      description: '1 files ATS: 94',
      progress: 100,
      icon: <Mail size={18} />,
      started: '8 min ago',
      status: 'completed'
    },
    {
      id: '4',
      title: 'Job tracker updated',
      company: 'AI Labs',
      role: 'Data Scientist',
      description: '',
      progress: 100,
      icon: <List size={18} />,
      started: '10 min ago',
      status: 'completed'
    }
  ]);

  // Mock data for capabilities
  const [capabilities, setCapabilities] = useState<Capability[]>([
    {
      id: '1',
      title: 'Job Board Auto-Fill',
      description: 'Auto-fill applications from LinkedIn, Indeed, and other job boards with tailored resume data',
      icon: <Briefcase size={20} />,
      enabled: true
    },
    {
      id: '2',
      title: 'Multi-Resume Generator',
      description: 'Generate multiple resume variations for a single JD with different templates and ATS scores',
      icon: <FileText size={20} />,
      enabled: true
    },
    {
      id: '3',
      title: 'Bulk JD Processing',
      description: 'Process multiple job descriptions and create tailored resumes for each',
      icon: <Zap size={20} />,
      enabled: true
    },
    {
      id: '4',
      title: 'Job Tracker Auto-Fill',
      description: 'Automatically populate job tracker with application details and status',
      icon: <List size={20} />,
      enabled: true
    },
    {
      id: '5',
      title: 'Cold Email Generator',
      description: 'Send personalized cold emails and cover letters for each application',
      icon: <Mail size={20} />,
      enabled: true
    },
    {
      id: '6',
      title: 'Interview Prep',
      description: 'Generate comprehensive interview materials covering all skills from JD',
      icon: <BookOpen size={20} />,
      enabled: true
    },
    {
      id: '7',
      title: 'Company Research',
      description: 'Research companies and add detailed notes to job tracker',
      icon: <Search size={20} />,
      enabled: true
    }
  ]);

  // Mock data for history
  const [historyTasks] = useState<HistoryTask[]>([
    { id: '1', title: '5 resumes generated for different JDs', count: 5, icon: <FileText size={18} />, status: 'Completed successfully', completed: '10:15 AM', date: 'today' },
    { id: '2', title: '3 companies researched', count: 3, icon: <Search size={18} />, status: 'Completed successfully', completed: '9:45 AM', date: 'today' },
    { id: '3', title: '8 cover letters created', count: 8, icon: <Mail size={18} />, status: 'Completed successfully', completed: '9:30 AM', date: 'today' },
    { id: '4', title: '12 job applications auto-filled', count: 12, icon: <Briefcase size={18} />, status: 'Completed successfully', completed: '8:00 AM', date: 'today' },
    { id: '5', title: '7 interview prep guides generated', count: 7, icon: <BookOpen size={18} />, status: 'Completed successfully', completed: 'Yesterday, 6:30 PM', date: 'yesterday' },
    { id: '6', title: '4 cold emails sent', count: 4, icon: <Mail size={18} />, status: 'Completed successfully', completed: 'Yesterday, 5:15 PM', date: 'yesterday' },
    { id: '7', title: '10 job tracker entries updated', count: 10, icon: <List size={18} />, status: 'Completed successfully', completed: 'Yesterday, 4:00 PM', date: 'yesterday' }
  ]);

  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      message: "Hi! I'm your AI Job Application Assistant. I can help you automate your entire job search process - from tailoring resumes to researching companies. What would you like me to do?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);

  const toggleCapability = (id: string) => {
    setCapabilities(prev => prev.map(cap =>
      cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Add user message
      const userMsg = {
        id: Date.now().toString(),
        sender: 'user',
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
      setChatMessages(prev => [...prev, userMsg]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          message: "I understand you'd like help with that. Let me work on it for you. This feature is currently in development - your request has been noted!",
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }, 1000);
      
      setChatMessage('');
    }
  };

  const groupedHistory = historyTasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, HistoryTask[]>);

  return (
    <div className="h-full flex flex-col" style={{ background: colors.background }}>
      {/* Header */}
      <div 
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-3">
          {/* AI Icon */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgePurpleBg }}
          >
            <Bot size={20} style={{ color: colors.badgePurpleText }} />
          </div>
          
          {/* Title and Tagline */}
          <div className="flex flex-col">
            <h1 
              className="text-lg font-bold leading-tight"
              style={{ color: colors.primaryText }}
            >
              AI Agent
            </h1>
            <p 
              className="text-xs leading-tight"
              style={{ color: colors.secondaryText }}
            >
              Your intelligent job application automation assistant
            </p>
          </div>
        </div>

        {/* Toggle, Status and Settings */}
        <div className="flex items-center gap-4">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span 
              className="text-sm font-medium"
              style={{ color: colors.secondaryText }}
            >
              {isAgentEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => setIsAgentEnabled(!isAgentEnabled)}
              className="relative inline-flex items-center rounded-full transition-colors focus:outline-none"
              style={{
                width: '44px',
                height: '24px',
                background: isAgentEnabled ? colors.primaryBlue : colors.inputBackground,
                border: `1px solid ${isAgentEnabled ? colors.primaryBlue : colors.border}`,
              }}
              role="switch"
              aria-checked={isAgentEnabled ? "true" : "false"}
              aria-label={isAgentEnabled ? "Disable AI Agent" : "Enable AI Agent"}
              title={isAgentEnabled ? "Disable AI Agent" : "Enable AI Agent"}
            >
              <span
                className="inline-block rounded-full bg-white shadow-sm transform transition-transform"
                style={{
                  width: '18px',
                  height: '18px',
                  transform: isAgentEnabled ? 'translateX(22px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>

          {/* Status Indicator */}
          {isAgentEnabled && (
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: '#10b981' }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                Active
              </span>
            </div>
          )}

          {/* Settings Button */}
          <button
            className="p-1.5 rounded transition-all"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        className="px-6 py-2 border-b flex items-center gap-1"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <button
          onClick={() => setActiveTab('chat')}
          className="px-4 py-2 rounded-t-md transition-all flex items-center gap-2 text-sm font-medium relative"
          style={{
            color: activeTab === 'chat' ? colors.primaryText : colors.secondaryText,
            background: activeTab === 'chat' ? colors.cardBackground : 'transparent',
          }}
        >
          <MessageSquare size={16} />
          Chat
          {activeTab === 'chat' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: colors.badgePurpleText }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('active-tasks')}
          className="px-4 py-2 rounded-t-md transition-all flex items-center gap-2 text-sm font-medium relative"
          style={{
            color: activeTab === 'active-tasks' ? colors.primaryText : colors.secondaryText,
            background: activeTab === 'active-tasks' ? colors.cardBackground : 'transparent',
          }}
        >
          <Zap size={16} />
          Active Tasks
          {activeTasksCount > 0 && (
            <span 
              className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: colors.badgePurpleBg, color: colors.badgePurpleText }}
            >
              {activeTasksCount}
            </span>
          )}
          {activeTab === 'active-tasks' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: colors.badgePurpleText }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('capabilities')}
          className="px-4 py-2 rounded-t-md transition-all flex items-center gap-2 text-sm font-medium relative"
          style={{
            color: activeTab === 'capabilities' ? colors.primaryText : colors.secondaryText,
            background: activeTab === 'capabilities' ? colors.cardBackground : 'transparent',
          }}
        >
          <Brain size={16} />
          Capabilities
          {activeTab === 'capabilities' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: colors.badgePurpleText }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="px-4 py-2 rounded-t-md transition-all flex items-center gap-2 text-sm font-medium relative"
          style={{
            color: activeTab === 'history' ? colors.primaryText : colors.secondaryText,
            background: activeTab === 'history' ? colors.cardBackground : 'transparent',
          }}
        >
          <Clock size={16} />
          History
          {activeTab === 'history' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: colors.badgePurpleText }}
            />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chat View */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 mb-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.sender === 'ai' ? (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: colors.badgePurpleBg }}
                      >
                        <Bot size={16} style={{ color: colors.badgePurpleText }} />
                      </div>
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: colors.primaryBlue }}
                      >
                        <span className="text-xs font-bold text-white">U</span>
                      </div>
                    )}
                    <div className={`flex-1 ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                      <div 
                        className="rounded-lg px-4 py-3 mb-1"
                        style={{ 
                          background: msg.sender === 'user' ? colors.primaryBlue : colors.cardBackground,
                          border: msg.sender === 'user' ? 'none' : `1px solid ${colors.border}`
                        }}
                      >
                        <p 
                          className="text-sm"
                          style={{ color: msg.sender === 'user' ? 'white' : colors.primaryText }}
                        >
                          {msg.message}
                        </p>
                      </div>
                      <p 
                        className="text-xs"
                        style={{ color: colors.tertiaryText }}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                  <button
                    className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.badgePurpleText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                    title="Bulk Resume Generation"
                    aria-label="Bulk Resume Generation"
                  >
                    <FileText size={14} />
                    Bulk Resume Generation
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.badgePurpleText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                    title="Company Research"
                    aria-label="Company Research"
                  >
                    <Search size={14} />
                    Company Research
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.badgePurpleText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                    title="Interview Prep"
                    aria-label="Interview Prep"
                  >
                    <BookOpen size={14} />
                    Interview Prep
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div 
                className="px-6 py-4 border-t"
                style={{ borderTop: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask AI to automate your job search... (e.g., 'Generate 3 resumes for this JD', 'Research companies and send cold emails')"
                    className="flex-1 px-4 py-2 rounded-lg text-sm transition-all outline-none"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: colors.badgePurpleBg,
                      color: colors.badgePurpleText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgePurpleText;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.badgePurpleBg;
                      e.currentTarget.style.color = colors.badgePurpleText;
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Activity */}
            <div 
              className="w-80 border-l overflow-y-auto px-4 py-4"
              style={{ 
                borderLeft: `1px solid ${colors.border}`,
                background: colors.cardBackground
              }}
            >
              <h3 
                className="text-sm font-semibold mb-4"
                style={{ color: colors.primaryText }}
              >
                Today's Activity
              </h3>
              
              <div className="space-y-3 mb-6">
                <div 
                  className="rounded-lg p-3"
                  style={{ background: colors.inputBackground }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} style={{ color: colors.badgePurpleText }} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      Resumes Generated
                    </span>
                  </div>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: colors.primaryText }}
                  >
                    12
                  </span>
                </div>

                <div 
                  className="rounded-lg p-3"
                  style={{ background: colors.inputBackground }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={16} style={{ color: colors.badgePurpleText }} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      Applications Filled
                    </span>
                  </div>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: colors.primaryText }}
                  >
                    8
                  </span>
                </div>

                <div 
                  className="rounded-lg p-3"
                  style={{ background: colors.inputBackground }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={16} style={{ color: colors.badgePurpleText }} />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      Emails Sent
                    </span>
                  </div>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: colors.primaryText }}
                  >
                    5
                  </span>
                </div>
              </div>

              <h3 
                className="text-sm font-semibold mb-4"
                style={{ color: colors.primaryText }}
              >
                Agent Performance
              </h3>

              <div className="space-y-3 mb-6">
                <div>
                  <span 
                    className="text-xs mb-1 block"
                    style={{ color: colors.secondaryText }}
                  >
                    Success Rate
                  </span>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: '#10b981' }}
                  >
                    98%
                  </span>
                </div>
                <div>
                  <span 
                    className="text-xs mb-1 block"
                    style={{ color: colors.secondaryText }}
                  >
                    Avg ATS Score
                  </span>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: colors.primaryBlue }}
                  >
                    92/100
                  </span>
                </div>
              </div>

              <button
                className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: colors.badgePurpleBg,
                  color: colors.badgePurpleText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgePurpleText;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.badgePurpleBg;
                  e.currentTarget.style.color = colors.badgePurpleText;
                }}
              >
                <Rocket size={18} />
                Start Bulk Job Application
              </button>
            </div>
          </>
        )}

        {/* Active Tasks View */}
        {activeTab === 'active-tasks' && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-6">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: colors.primaryText }}
              >
                Active Tasks
              </h2>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                Monitor your AI agent's progress in real-time
              </p>
            </div>

            <div className="space-y-4">
              {activeTasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-lg p-4 transition-all"
                  style={{
                    background: colors.cardBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: colors.badgePurpleBg,
                          color: task.status === 'completed' ? '#10b981' : colors.badgePurpleText
                        }}
                      >
                        {task.status === 'completed' && <CheckCircle size={18} />}
                        {task.status === 'in-progress' && task.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 
                            className="text-base font-semibold"
                            style={{ color: colors.primaryText }}
                          >
                            {task.title}
                          </h3>
                          {task.status === 'in-progress' && (
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: colors.badgePurpleBg, color: colors.badgePurpleText }}
                            >
                              C
                            </div>
                          )}
                        </div>
                        <p 
                          className="text-sm mb-1"
                          style={{ color: colors.primaryText }}
                        >
                          {task.company} • {task.role}
                        </p>
                        {task.description && (
                          <p 
                            className="text-sm"
                            style={{ color: colors.secondaryText }}
                          >
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="p-1 rounded transition-all"
                      style={{ color: colors.tertiaryText }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {task.status === 'in-progress' && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <div 
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: colors.inputBackground }}
                        >
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              background: '#10b981',
                              width: `${task.progress}%`
                            }}
                          />
                        </div>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: '#10b981' }}
                      >
                        {task.progress}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span 
                      className="text-xs"
                      style={{ color: colors.secondaryText }}
                    >
                      Started {task.started}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capabilities View */}
        {activeTab === 'capabilities' && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-6">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: colors.primaryText }}
              >
                Agent Capabilities
              </h2>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                Configure what the AI agent can do for you
              </p>
            </div>

            <div className="space-y-3">
              {capabilities.map(cap => (
                <div
                  key={cap.id}
                  className="rounded-lg p-4 transition-all flex items-start justify-between"
                  style={{
                    background: colors.cardBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: colors.inputBackground }}
                    >
                      <div style={{ color: colors.badgePurpleText }}>
                        {cap.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-base font-semibold mb-1"
                        style={{ color: colors.primaryText }}
                      >
                        {cap.title}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: colors.secondaryText }}
                      >
                        {cap.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#10b981' }}
                        />
                        <span 
                          className="text-xs font-medium"
                          style={{ color: '#10b981' }}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCapability(cap.id)}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
                      cap.enabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ background: cap.enabled ? '#10b981' : colors.border }}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all bg-white shadow-sm`}
                      style={{
                        transform: cap.enabled ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div 
              className="rounded-lg p-6 mt-6"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                <Zap size={24} style={{ color: colors.primaryBlue }} />
                <div className="flex-1">
                  <h3 
                    className="text-base font-semibold mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Pro Tip: Combine Multiple Capabilities
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: colors.secondaryText }}
                  >
                    Enable all capabilities for a fully automated job application workflow. The AI will handle everything from resume generation to company research.
                  </p>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: colors.badgePurpleBg,
                      color: colors.badgePurpleText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgePurpleText;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.badgePurpleBg;
                      e.currentTarget.style.color = colors.badgePurpleText;
                    }}
                  >
                    Enable All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-6">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: colors.primaryText }}
              >
                Task History
              </h2>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                Review your AI agent's completed work
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedHistory).map(([date, tasks]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} style={{ color: colors.secondaryText }} />
                    <h3 
                      className="text-sm font-semibold capitalize"
                      style={{ color: colors.primaryText }}
                    >
                      {date === 'today' ? 'Today' : 'Yesterday'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="rounded-lg p-4 transition-all flex items-center justify-between"
                        style={{
                          background: colors.cardBackground,
                          border: `1px solid ${colors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.borderFocused;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: '#10b98120' }}
                          >
                            <div style={{ color: '#10b981' }}>
                              {task.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="text-sm font-medium"
                                style={{ color: colors.primaryText }}
                              >
                                {task.title}
                              </span>
                              <span 
                                className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ 
                                  background: colors.badgePurpleBg,
                                  color: colors.badgePurpleText
                                }}
                              >
                                {task.count}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle size={14} style={{ color: '#10b981' }} />
                              <span 
                                className="text-xs"
                                style={{ color: '#10b981' }}
                              >
                                {task.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: colors.inputBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.tertiaryText,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.hoverBackground;
                              e.currentTarget.style.color = colors.primaryBlue;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = colors.inputBackground;
                              e.currentTarget.style.color = colors.tertiaryText;
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: colors.inputBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.tertiaryText,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.hoverBackground;
                              e.currentTarget.style.color = colors.primaryBlue;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = colors.inputBackground;
                              e.currentTarget.style.color = colors.tertiaryText;
                            }}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    );
  } catch (error) {
    console.error('Critical error in AIAgents:', error);
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading AI Auto-Apply</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
