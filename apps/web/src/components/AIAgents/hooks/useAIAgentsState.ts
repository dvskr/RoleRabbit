import { useState } from 'react';
import { TabType, ActiveTask, Capability, HistoryTask, ChatMessage } from '../types';
import { 
  MOCK_ACTIVE_TASKS, 
  MOCK_CAPABILITIES, 
  MOCK_HISTORY_TASKS,
  INITIAL_CHAT_MESSAGE 
} from '../constants/mockData';

export function useAIAgentsState() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isAgentEnabled, setIsAgentEnabled] = useState(true);
  const [activeTasks] = useState<ActiveTask[]>(MOCK_ACTIVE_TASKS);
  const [capabilities, setCapabilities] = useState<Capability[]>(MOCK_CAPABILITIES);
  const [historyTasks] = useState<HistoryTask[]>(MOCK_HISTORY_TASKS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
  const [chatMessage, setChatMessage] = useState('');
  const activeTasksCount = activeTasks.filter(task => task.status === 'in-progress').length;

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

