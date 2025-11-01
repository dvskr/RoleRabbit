import { useState, useEffect } from 'react';
import { TabType, ActiveTask, Capability, HistoryTask, ChatMessage } from '../types';
import { 
  MOCK_ACTIVE_TASKS, 
  MOCK_CAPABILITIES, 
  MOCK_HISTORY_TASKS,
  INITIAL_CHAT_MESSAGE 
} from '../constants/mockData';

export function useAIAgentsState() {
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
  const [isAgentEnabled, setIsAgentEnabled] = useState(true);
  const [activeTasks] = useState<ActiveTask[]>(MOCK_ACTIVE_TASKS);
  const [capabilities, setCapabilities] = useState<Capability[]>(MOCK_CAPABILITIES);
  const [historyTasks] = useState<HistoryTask[]>(MOCK_HISTORY_TASKS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
  const [chatMessage, setChatMessage] = useState('');
  const activeTasksCount = activeTasks.filter(task => task.status === 'in-progress').length;

  // Initialize
  useEffect(() => {
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

  const toggleCapability = (id: string) => {
    setCapabilities(prev => prev.map(cap =>
      cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  return {
    activeTab,
    setActiveTab,
    isAgentEnabled,
    setIsAgentEnabled,
    activeTasks,
    capabilities,
    setCapabilities,
    historyTasks,
    chatMessages,
    setChatMessages,
    chatMessage,
    setChatMessage,
    activeTasksCount,
    toggleCapability
  };
}

