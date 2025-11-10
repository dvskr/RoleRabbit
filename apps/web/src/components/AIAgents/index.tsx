'use client';

import React, { createContext, useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAIAgentsState, useAIChat } from './hooks';
import {
  AgentHeader,
  TabNavigation,
  ChatTab,
  ActiveTasksTab,
  CapabilitiesTab,
  HistoryTab
} from './components';
import { useToast, ToastContainer } from './components/Toast';

// Context for sharing toast and refresh functions across components
interface AIAgentsContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  refreshActiveTasks: () => Promise<void>;
}

const AIAgentsContext = createContext<AIAgentsContextType | null>(null);

export const useAIAgentsContext = () => {
  const context = useContext(AIAgentsContext);
  if (!context) {
    throw new Error('useAIAgentsContext must be used within AIAgents component');
  }
  return context;
};

export default function AIAgents() {
  const { theme } = useTheme();
  const colors = theme?.colors;

  // Safety check for theme
  if (!colors) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  try {
    const {
      activeTab,
      setActiveTab,
      isAgentEnabled,
      setIsAgentEnabled,
      activeTasks,
      capabilities,
      toggleCapability,
      historyTasks,
      chatMessages,
      setChatMessages,
      chatMessage,
      setChatMessage,
      activeTasksCount,
      refreshActiveTasks,
    } = useAIAgentsState();

    const { handleSendMessage } = useAIChat({
      chatMessage,
      setChatMessage,
      chatMessages,
      setChatMessages,
    });

    const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();

    const contextValue: AIAgentsContextType = {
      showSuccess,
      showError,
      showInfo,
      refreshActiveTasks,
    };

    return (
      <AIAgentsContext.Provider value={contextValue}>
        <div className="h-full flex flex-col" style={{ background: colors.background }}>
          <AgentHeader
            isAgentEnabled={isAgentEnabled}
            setIsAgentEnabled={setIsAgentEnabled}
          />

          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeTasksCount={activeTasksCount}
          />

          <div className="flex-1 overflow-hidden flex">
            {activeTab === 'chat' && (
              <ChatTab
                chatMessages={chatMessages}
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                onSendMessage={handleSendMessage}
              />
            )}

            {activeTab === 'active-tasks' && (
              <ActiveTasksTab activeTasks={activeTasks} />
            )}

            {activeTab === 'capabilities' && (
              <CapabilitiesTab
                capabilities={capabilities}
                onToggleCapability={toggleCapability}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab historyTasks={historyTasks} />
            )}
          </div>

          {/* Toast Notifications */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </AIAgentsContext.Provider>
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

