import { useState, useEffect, useCallback } from 'react';
import { TabType, ActiveTask, Capability, HistoryTask, ChatMessage } from '../types';
import {
  MOCK_CAPABILITIES,
  INITIAL_CHAT_MESSAGE
} from '../constants/mockData';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../../../contexts/AuthContext';

// Map backend task to frontend ActiveTask type
function mapBackendTaskToActiveTask(task: any): ActiveTask {
  return {
    id: task.id,
    title: task.currentStep || 'Processing...',
    company: task.company || 'N/A',
    role: task.jobTitle || 'N/A',
    description: task.jobDescription?.substring(0, 100) || '',
    progress: task.progress || 0,
    icon: null, // Will be set by UI component
    started: task.startedAt ? new Date(task.startedAt).toLocaleString() : 'Just now',
    status: task.status === 'COMPLETED' ? 'completed' : 'in-progress'
  };
}

// Map backend history to frontend HistoryTask type
function mapBackendHistoryToHistoryTask(history: any): HistoryTask {
  return {
    id: history.id,
    title: history.summary,
    count: history.count,
    icon: null, // Will be set by UI component
    status: history.status,
    completed: new Date(history.completedAt).toLocaleTimeString(),
    date: isToday(new Date(history.completedAt)) ? 'today' : 'yesterday'
  };
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

// Map backend settings to frontend Capability type
function mapSettingsToCapabilities(settings: any): Capability[] {
  if (!settings) return MOCK_CAPABILITIES;

  return [
    {
      id: '1',
      title: 'Job Board Auto-Fill',
      description: 'Auto-fill applications from LinkedIn, Indeed, and other job boards with tailored resume data',
      icon: null,
      enabled: settings.autoFillEnabled ?? true
    },
    {
      id: '2',
      title: 'Multi-Resume Generator',
      description: 'Generate multiple resume variations for a single JD with different templates and ATS scores',
      icon: null,
      enabled: settings.multiResumeEnabled ?? true
    },
    {
      id: '3',
      title: 'Bulk JD Processing',
      description: 'Process multiple job descriptions and create tailored resumes for each',
      icon: null,
      enabled: settings.bulkProcessingEnabled ?? true
    },
    {
      id: '4',
      title: 'Job Tracker Auto-Fill',
      description: 'Automatically populate job tracker with application details and status',
      icon: null,
      enabled: settings.jobTrackerEnabled ?? true
    },
    {
      id: '5',
      title: 'Cold Email Generator',
      description: 'Send personalized cold emails and cover letters for each application',
      icon: null,
      enabled: settings.coldEmailEnabled ?? false
    },
    {
      id: '6',
      title: 'Interview Prep',
      description: 'Generate comprehensive interview materials covering all skills from JD',
      icon: null,
      enabled: settings.interviewPrepEnabled ?? true
    },
    {
      id: '7',
      title: 'Company Research',
      description: 'Research companies and add detailed notes to job tracker',
      icon: null,
      enabled: settings.companyResearchEnabled ?? true
    }
  ];
}

export function useAIAgentsState() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Initialize from URL if available
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('subtab');
        if (tab && ['chat', 'active-tasks', 'capabilities', 'history'].includes(tab)) {
          return tab as TabType;
        }
      } catch (error) {
        // Ignore
      }
    }
    return 'chat';
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAgentEnabled, setIsAgentEnabled] = useState(true);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>(MOCK_CAPABILITIES);
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
  const [chatMessage, setChatMessage] = useState('');
  const activeTasksCount = activeTasks.filter(task => task.status === 'in-progress').length;

  // Refresh function for tasks
  const refreshActiveTasks = useCallback(async () => {
    try {
      const tasksRes = await fetch('/api/ai-agent/tasks/active', {
        credentials: 'include'
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (tasksData.success && Array.isArray(tasksData.tasks)) {
          setActiveTasks(tasksData.tasks.map(mapBackendTaskToActiveTask));
        }
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  }, []);

  // WebSocket event handlers
  const handleTaskProgress = useCallback((data: any) => {
    console.log('Task progress update:', data);
    setActiveTasks(prev => prev.map(task =>
      task.id === data.taskId
        ? { ...task, progress: data.progress, title: data.currentStep || task.title }
        : task
    ));
  }, []);

  const handleTaskCompleted = useCallback((data: any) => {
    console.log('Task completed:', data);
    // Refresh tasks to get updated data
    refreshActiveTasks();
    // Switch to active-tasks tab to show completion
    setActiveTab('active-tasks');
  }, [refreshActiveTasks]);

  const handleTaskFailed = useCallback((data: any) => {
    console.log('Task failed:', data);
    refreshActiveTasks();
  }, [refreshActiveTasks]);

  const handleTaskStarted = useCallback((data: any) => {
    console.log('Task started:', data);
    refreshActiveTasks();
  }, [refreshActiveTasks]);

  const handleTaskCancelled = useCallback((data: any) => {
    console.log('Task cancelled:', data);
    refreshActiveTasks();
  }, [refreshActiveTasks]);

  // Initialize WebSocket connection
  useWebSocket(user?.id || null, {
    onTaskProgress: handleTaskProgress,
    onTaskCompleted: handleTaskCompleted,
    onTaskFailed: handleTaskFailed,
    onTaskStarted: handleTaskStarted,
    onTaskCancelled: handleTaskCancelled,
  });

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch settings
        const settingsRes = await fetch('/api/ai-agent/settings', {
          credentials: 'include'
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.success) {
            setIsAgentEnabled(settingsData.settings.isEnabled);
            setCapabilities(mapSettingsToCapabilities(settingsData.settings));
          }
        }

        // Fetch active tasks
        const tasksRes = await fetch('/api/ai-agent/tasks/active', {
          credentials: 'include'
        });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData.success && Array.isArray(tasksData.tasks)) {
            setActiveTasks(tasksData.tasks.map(mapBackendTaskToActiveTask));
          }
        }

        // Fetch history
        const historyRes = await fetch('/api/ai-agent/history?days=7', {
          credentials: 'include'
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.success && Array.isArray(historyData.history)) {
            setHistoryTasks(historyData.history.map(mapBackendHistoryToHistoryTask));
          }
        }

        // Fetch chat history
        const chatRes = await fetch('/api/ai-agent/chat/history', {
          credentials: 'include'
        });
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          if (chatData.success && chatData.conversation?.messages) {
            setChatMessages(chatData.conversation.messages);
          }
        }

      } catch (error) {
        console.error('Error fetching AI agent data:', error);
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    setIsInitialized(true);
  }, []);

  // Persist activeTab to URL (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const currentTab = params.get('subtab');
        if (currentTab !== activeTab) {
          params.set('subtab', activeTab);
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        }
      } catch (error) {
        // Ignore
      }
    }
  }, [activeTab, isInitialized]);

  const toggleCapability = async (id: string) => {
    // Optimistically update UI
    setCapabilities(prev => prev.map(cap =>
      cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
    ));

    try {
      // Map capability ID to backend field name
      const capabilityMap: Record<string, string> = {
        '1': 'autoFill',
        '2': 'multiResume',
        '3': 'bulkProcessing',
        '4': 'jobTracker',
        '5': 'coldEmail',
        '6': 'interviewPrep',
        '7': 'companyResearch'
      };

      const capability = capabilityMap[id];
      if (!capability) return;

      const res = await fetch('/api/ai-agent/settings/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ capability })
      });

      if (!res.ok) {
        // Revert on error
        setCapabilities(prev => prev.map(cap =>
          cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
        ));
      }
    } catch (error) {
      console.error('Error toggling capability:', error);
      // Revert on error
      setCapabilities(prev => prev.map(cap =>
        cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
      ));
    }
  };

  return {
    activeTab,
    setActiveTab,
    isAgentEnabled,
    setIsAgentEnabled,
    activeTasks,
    setActiveTasks,
    capabilities,
    setCapabilities,
    historyTasks,
    setHistoryTasks,
    chatMessages,
    setChatMessages,
    chatMessage,
    setChatMessage,
    activeTasksCount,
    toggleCapability,
    refreshActiveTasks,
    isLoading
  };
}
